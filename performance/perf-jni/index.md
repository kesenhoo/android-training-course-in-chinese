# JNI Tips

> 编写:[pedant](https://github.com/pedant) - 原文:<http://developer.android.com/training/articles/perf-jni.html>

JNI全称Java Native Interface。它为托管代码（使用Java编程语言编写）与本地代码（使用C/C++编写）提供了一种交互方式。它是<font color='red'>与厂商无关的（vendor-neutral）</font>,支持从动态共享库中加载代码，虽然这样会稍显麻烦，但有时这是相当有效的。

如果你对JNI还不是太熟悉，可以先通读[Java Native Interface Specification](http://docs.oracle.com/javase/7/docs/technotes/guides/jni/spec/jniTOC.html)这篇文章来对JNI如何工作以及哪些特性可用有个大致的印象。这种接口的一些方面不能立即一读就显而易见，所以你会发现接下来的几个章节很有用处。

# JavaVM 及 JNIEnv

JNI定义了两种关键数据结构，“JavaVM”和“JNIEnv”。它们本质上都是指向函数表指针的指针（在C++版本中，它们被定义为类，该类包含一个指向函数表的指针，以及一系列可以通过这个函数表间接地访问对应的JNI函数的成员函数）。JavaVM提供“调用接口（invocation interface）”函数, 允许你创建和销毁一个JavaVM。理论上你可以在一个进程中拥有多个JavaVM对象，但安卓只允许一个。

JNIEnv提供了大部分JNI功能。你定义的所有本地函数都会接收JNIEnv作为第一个参数。

JNIEnv是用作线程局部存储。因此，**你不能在线程间共享一个JNIEnv变量**。如果在一段代码中没有其它办法获得它的JNIEnv，你可以共享JavaVM对象，使用GetEnv来取得该线程下的JNIEnv（如果该线程有一个JavaVM的话；见下面的AttachCurrentThread）。

JNIEnv和JavaVM的在C声明是不同于在C++的声明。头文件“jni.h”根据它是以C还是以C++模式包含来提供不同的类型定义（typedefs）。因此，不建议把JNIEnv参数放到可能被两种语言引入的头文件中（换一句话说：如果你的头文件需要#ifdef __cplusplus，你可能不得不在任何涉及到JNIEnv的内容处都要做些额外的工作）。

#线程

所有的线程都是Linux线程，由内核统一调度。它们通常从托管代码中启动（使用Thread.start），但它们也能够在其他任何地方创建，然后连接（attach）到JavaVM。例如，一个用pthread_create启动的线程能够使用JNI AttachCurrentThread 或 AttachCurrentThreadAsDaemon函数连接到JavaVM。在一个线程成功连接（attach）之前，它没有JNIEnv，**不能够调用JNI函数**。

连接一个本地环境创建的线程会触发构造一个java.lang.Thread对象，然后其被添加到主线程群组（main ThreadGroup）,以让调试器可以探测到。对一个已经连接的线程使用AttachCurrentThread不做任何操作（no-op）。

安卓不能中止正在执行本地代码的线程。如果正在进行垃圾回收，或者调试器已发出了中止请求，安卓会在下一次调用JNI函数的时候中止线程。

连接过的（attached）线程在它们退出之前**必须通过JNI调用DetachCurrentThread**。如果你觉得直接这样编写不太优雅，在安卓2.0（Eclair）及以上， 你可以使用pthread_key_create来定义一个析构函数，它将会在线程退出时被调用，你可以在那儿调用DetachCurrentThread （使用生成的key与pthread_setspecific将JNIEnv存储到线程局部空间内；这样JNIEnv能够作为参数传入到析构函数当中去）。

#jclass, jmethodID, jfieldID

如果你想在本地代码中访问一个对象的字段（field）,你可以像下面这样做：

- 对于类，使用FindClass获得类对象的引用
- 对于字段，使用GetFieldId获得字段ID
- 使用对应的方法（例如GetIntField）获取字段下面的值

类似地，要调用一个方法，你首先得获得一个类对象的引用，然后是方法ID（method ID）。这些ID通常是指向运行时内部数据结构。查找到它们需要些字符串比较，但一旦你实际去执行它们获得字段或者做方法调用是非常快的。

如果性能是你看重的，那么一旦查找出这些值之后在你的本地代码中缓存这些结果是非常有用的。因为每个进程当中的JavaVM是存在限制的，存储这些数据到本地静态数据结构中是非常合理的。

类引用（class reference），字段ID（field ID）以及方法ID（method ID）在类被卸载前都是有效的。如果与一个类加载器（ClassLoader）相关的所有类都能够被垃圾回收，但是这种情况在安卓上是罕见甚至不可能出现，只有这时类才被卸载。注意虽然jclass是一个类引用，但是**必须要调用NewGlobalRef保护起来**（见下个章节）。

当一个类被加载时如果你想缓存些ID，而后当这个类被卸载后再次载入时能够自动地更新这些缓存ID，正确做法是在对应的类中添加一段像下面的代码来初始化这些ID：

``` java

/*
 * 我们在一个类初始化时调用本地方法来缓存一些字段的偏移信息
 * 这个本地方法查找并缓存你感兴趣的class/field/method ID
 * 失败时抛出异常
 */
private static native void nativeInit();

static {
    nativeInit();
}
```

在你的C/C++代码中创建一个nativeClassInit方法以完成ID查找的工作。当这个类被初始化时这段代码将会执行一次。当这个类被卸载后而后再次载入时，这段代码将会再次执行。

#局部和全局引用

每个传入本地方法的参数，以及大部分JNI函数返回的每个对象都是“局部引用”。这意味着它只在当前线程的当前方法执行期间有效。**即使这个对象本身在本地方法返回之后仍然存在，这个引用也是无效的**。

这同样适用于所有jobject的子类，包括jclass，jstring，以及jarray（当JNI扩展检查是打开的时候，运行时会警告你对大部分对象引用的误用）。

如果你想持有一个引用更长的时间，你就必须使用一个全局（“global”）引用了。NewGlobalRef函数以一个局部引用作为参数并且返回一个全局引用。全局引用能够保证在你调用DeleteGlobalRef前都是有效的。

这种模式通常被用在缓存一个从FindClass返回的jclass对象的时候，例如：

``` java

jclass localClass = env->FindClass("MyClass");
jclass globalClass = reinterpret_cast<jclass>(env->NewGlobalRef(localClass));
```

所有的JNI方法都接收局部引用和全局引用作为参数。相同对象的引用却可能具有不同的值。例如，用相同对象连续地调用NewGlobalRef得到返回值可能是不同的。**为了检查两个引用是否指向的是同一个对象，你必须使用IsSameObject函数**。绝不要在本地代码中用==符号来比较两个引用。

得出的结论就是你**绝不要在本地代码中假定对象的引用是常量或者是唯一的**。代表一个对象的32位值从方法的一次调用到下一次调用可能有不同的值。在连续的调用过程中两个不同的对象却可能拥有相同的32位值。不要使用jobject的值作为key.

开发者需要“不过度分配”局部引用。在实际操作中这意味着如果你正在创建大量的局部引用，或许是通过对象数组，你应该使用DeleteLocalRef手动地释放它们，而不是寄希望JNI来为你做这些。实现上只预留了16个局部引用的空间，所以如果你需要更多，要么你删掉以前的，要么使用EnsureLocalCapacity/PushLocalFrame来预留更多。

注意jfieldID和jmethodID是<font color='red'>映射类型（opaque types）</font>，不是对象引用，不应该被传入到NewGlobalRef。原始数据指针，像GetStringUTFChars和GetByteArrayElements的返回值，也都不是对象（它们能够在线程间传递，并且在调用对应的Release函数之前都是有效的）。

还有一种不常见的情况值得一提，如果你使用AttachCurrentThread连接（attach）了本地进程，正在运行的代码在线程分离（detach）之前决不会自动释放局部引用。你创建的任何局部引用必须手动删除。通常，任何在循环中创建局部引用的本地代码可能都需要做一些手动删除。

#UTF-8、UTF-16 字符串

Java编程语言使用UTF-16格式。为了便利，JNI也提供了支持[变形UTF-8（Modified UTF-8）](http://en.wikipedia.org/wiki/UTF-8#Modified_UTF-8)的方法。这种变形编码对于C代码是非常有用的，因为它将\u0000编码成0xc0 0x80，而不是0x00。最惬意的事情是你能在具有C风格的以\0结束的字符串上计数，同时兼容标准的libc字符串函数。不好的一面是你不能传入随意的UTF-8数据到JNI函数而还指望它正常工作。

如果可能的话，直接操作UTF-16字符串通常更快些。安卓当前在调用GetStringChars时不需要拷贝，而GetStringUTFChars需要一次分配并且转换为UTF-8格式。注意**UTF-16字符串不是以零终止字符串**，\u0000是被允许的，所以你需要像对jchar指针一样地处理字符串的长度。

**不要忘记Release你Get的字符串**。这些字符串函数返回jchar*或者jbyte*，都是指向基本数据类型的C格式的指针而不是局部引用。它们在Release调用之前都保证有效，这意味着当本地方法返回时它们并不主动释放。

**传入NewStringUTF函数的数据必须是变形UTF-8格式**。一种常见的错误情况是，从文件或者网络流中读取出的字符数据，没有过滤直接使用NewStringUTF处理。除非你确定数据是7位的ASCII格式，否则你需要剔除超出7位ASCII编码范围（high-ASCII）的字符或者将它们转换为对应的变形UTF-8格式。如果你没那样做，UTF-16的转换结果可能不会是你想要的结果。JNI扩展检查将会扫描字符串，然后警告你那些无效的数据，但是它们将不会发现所有潜在的风险。

#原生类型数组

JNI提供了一系列函数来访问数组对象中的内容。对象数组的访问只能<font color='red'>一次一条</font>，但如果原生类型数组以C方式声明，则能够直接进行读写。

为了让接口更有效率而不受VM实现的制约，Get<PrimitiveType>ArrayElements系列调用允许运行时返回一个指向实际元素的指针，或者是分配些内存然后拷贝一份。不论哪种方式，返回的原始指针在相应的Release调用之前都保证有效（这意味着，如果数据没被拷贝，实际的数组对象将会受到牵制，不能重新成为整理堆空间的一部分）。**你必须释放（Release）每个你通过Get得到的数组**。同时，如果Get调用失败，你必须确保你的代码在之后不会去尝试调用Release来释放一个空指针（NULL pointer）。

你可以用一个非空指针作为isCopy参数的值来决定数据是否会被拷贝。这相当有用。

Release类的函数接收一个mode参数，这个参数的值可选的有下面三种。而运行时具体执行的操作取决于它返回的指针是指向真实数据还是拷贝出来的那份。

- 0
    - 真实的：实际数组对象不受到牵制
    - 拷贝的：数据将会复制回去，备份空间将会被释放。
- JNI_COMMIT
    - 真实的：不做任何操作
    - 拷贝的：数据将会复制回去，备份空间将**不会被释放**。
- JNI_ABORT
    - 真实的：实际数组对象不受到牵制.之前的写入**不会**被取消。
    - 拷贝的：备份空间将会被释放；里面所有的变更都会丢失。

检查isCopy标识的一个原因是对一个数组做出变更后确认你是否需要传入JNI_COMMIT来调用Release函数。如果你交替地执行变更和读取数组内容的代码，你也许可以跳过无操作（no-op）的JNI_COMMIT。检查这个标识的另一个可能的原因是使用JNI_ABORT可以更高效。例如，你也许想得到一个数组，适当地修改它，传入部分到其他函数中，然后丢掉这些修改。如果你知道JNI是为你做了一份新的拷贝，就没有必要再创建另一份“可编辑的（editable）”的拷贝了。如果JNI传给你的是原始数组，这时你就需要创建一份你自己的拷贝了。

另一个常见的错误（在示例代码中出现过）是认为当isCopy是false时你就可以不调用Release。实际上是没有这种情况的。如果没有分配备份空间，那么初始的内存空间会受到牵制，位置不能被垃圾回收器移动。

另外注意JNI_COMMIT标识**没有**释放数组，你最终需要使用一个不同的标识再次调用Release。

#区间数组

当你想做的只是拷出或者拷进数据时，可以选择调用像Get<Type>ArrayElements和GetStringChars这类非常有用的函数。想想下面：

``` JAVA

jbyte* data = env->GetByteArrayElements(array, NULL);
if (data != NULL) {
    memcpy(buffer, data, len);
    env->ReleaseByteArrayElements(array, data, JNI_ABORT);
}
```

这里获取到了数组，从当中拷贝出开头的len个字节元素，然后释放这个数组。根据代码的实现，Get函数将会牵制或者拷贝数组的内容。上面的代码拷贝了数据（为了可能的第二次），然后调用Release；这当中JNI_ABORT确保不存在第三份拷贝了。

另一种更简单的实现方式：

``` JAVA

env->GetByteArrayRegion(array, 0, len, buffer);
```

这种方式有几个优点：

- 只需要调用一个JNI函数而是不是两个，减少了开销。
- 不需要指针或者额外的拷贝数据。
- 减少了开发人员犯错的风险-在某些失败之后忘记调用Release不存在风险。

类似地，你能使用Set<Type>ArrayRegion函数拷贝数据到数组，使用GetStringRegion或者GetStringUTFRegion从String中拷贝字符。

#异常

**当异常发生时你一定不能调用大部分的JNI函数**。你的代码收到异常（通过函数的返回值，ExceptionCheck，或者ExceptionOccurred），然后返回，或者清除异常，处理掉。

当异常发生时你被允许调用的JNI函数有：

- DeleteGlobalRef
- DeleteLocalRef
- DeleteWeakGlobalRef
- ExceptionCheck
- ExceptionClear
- ExceptionDescribe
- ExceptionOccurred
- MonitorExit
- PopLocalFrame
- PushLocalFrame
- Release<PrimitiveType>ArrayElements
- ReleasePrimitiveArrayCritical
- ReleaseStringChars
- ReleaseStringCritical
- ReleaseStringUTFChars

许多JNI调用能够抛出异常，但通常提供一种简单的方式来检查失败。例如，如果NewString返回一个非空值，你不需要检查异常。然而，如果你调用一个方法（使用一个像CalllObjectMethod的函数），你必须一直检查异常，因为当一个异常抛出时它的返回值将不会是有效的。

注意中断代码抛出的异常不会展开本地调用堆栈信息，Android也还不支持C++异常。JNI Throw和ThrowNew指令仅仅是在当前线程中放入一个异常指针。从本地代码返回到托管代码时，异常将会被注意到，得到适当的处理。

本地代码能够通过调用ExceptionCheck或者ExceptionOccurred捕获到异常，然后使用ExceptionClear清除掉。通常，抛弃异常而不处理会导致些问题。

没有内建的函数来处理Throwable对象自身，因此如果你想得到异常字符串，你需要找出Throwable Class，然后查找到getMessage "()Ljava/lang/String;"的方法ID，调用它，如果结果非空，使用GetStringUTFChars，得到的结果你可以传到printf(3) 或者其它相同功能的函数输出。

#扩展检查

JNI的错误检查很少。错误发生时通常会导致崩溃。Android也提供了一种模式，叫做CheckJNI，这当中JavaVM和JNIEnv函数表指针被换成了函数表，它在调用标准实现之前执行了一系列扩展检查的。

额外的检查包括：

- 数组：试图分配一个长度为负的数组。
- 坏指针：传入一个不完整jarray/jclass/jobject/jstring对象到JNI函数，或者调用JNI函数时使用空指针传入到一个不能为空的参数中去。
- 类名：传入了除“java/lang/String”之外的类名到JNI函数。
- 关键调用：在一个“关键的(critical)”get和它对应的release之间做出JNI调用。
- 直接的ByteBuffers：传入不正确的参数到NewDirectByteBuffer。
- 异常：当一个异常发生时调用了JNI函数。
- JNIEnv*s：在错误的线程中使用一个JNIEnv*。
- jfieldIDs：使用一个空jfieldID，或者使用jfieldID设置了一个错误类型的值到字段（比如说，试图将一个StringBuilder赋给String类型的域），或者使用一个静态字段下的jfieldID设置到一个实例的字段（instance field）反之亦然，或者使用的一个类的jfieldID却来自另一个类的实例。
- jmethodIDs：当调用Call*Method函数时时使用了类型错误的jmethodID：不正确的返回值，静态/非静态的不匹配，this的类型错误（对于非静态调用）或者错误的类（对于静态类调用）。
- 引用：在类型错误的引用上使用了DeleteGlobalRef/DeleteLocalRef。
- 释放模式：调用release使用一个不正确的释放模式（其它非 0，JNI_ABORT，JNI_COMMIT的值）。
- 类型安全：从你的本地代码中返回了一个不兼容的类型（比如说，从一个声明返回String的方法却返回了StringBuilder）。
- UTF-8：传入一个无效的变形UTF-8字节序列到JNI调用。

（方法和域的可访问性仍然没有检查：访问限制对于本地代码并不适用。）

有几种方法去启用CheckJNI。

如果你正在使用模拟器，CheckJNI默认是打开的。

如果你有一台root过的设备，你可以使用下面的命令序列来重启运行时（runtime），启用CheckJNI。

``` JAVA

adb shell stop
adb shell setprop dalvik.vm.checkjni true
adb shell start
```

随便哪一种，当运行时（runtime）启动时你将会在你的日志输出中见到如下的字符：

``` JAVA

D AndroidRuntime: CheckJNI is ON
```

如果你有一台常规的设备，你可以使用下面的命令：

``` JAVA

adb shell setprop debug.checkjni 1
```

这将不会影响已经在运行的app，但是从那以后启动的任何app都将打开CheckJNI(改变属性为其它值或者只是重启都将会再次关闭CheckJNI)。这种情况下，你将会在下一次app启动时，在日志输出中看到如下字符：

``` JAVA

D Late-enabling CheckJNI
```

#本地库

你可以使用标准的System.loadLibrary方法来从共享库中加载本地代码。在你的本地代码中较好的做法是：

- 在一个静态类初始化时调用System.loadLibrary（见之前的一个例子中，当中就使用了nativeClassInit）。参数是“未加修饰（undecorated）”的库名称，因此要加载“libfubar.so”，你需要传入“fubar”。
- 提供一个本地函数：**jint JNI_OnLoad(JavaVM* vm, void* reserved)**
- 在JNI_OnLoad中，注册所有你的本地方法。你应该声明方法为“静态的（static）”因此名称不会占据设备上符号表的空间。

JNI_OnLoad函数在C++中的写法如下：

``` JAVA

jint JNI_OnLoad(JavaVM* vm, void* reserved)
{
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return -1;
    }

    // 使用env->FindClass得到jclass
    // 使用env->RegisterNatives注册本地方法

    return JNI_VERSION_1_6;
}
```

你也可以使用共享库的全路径来调用System.load。对于Android app，你也许会发现从context对象中得到应用私有数据存储的全路径是非常有用的。

上面是推荐的方式，但不是仅有的实现方式。显式注册不是必须的，提供一个JNI_OnLoad函数也不是必须的。你可以使用基于特殊命名的“发现（discovery）”模式来注册本地方法（更多细节见：[JNI spec](http://java.sun.com/javase/6/docs/technotes/guides/jni/spec/design.html#wp615)），虽然这并不可取。因为如果一个方法的签名错误，在这个方法实际第一次被调用之前你是不会知道的。

关于JNI_OnLoad另一点注意的是：任何你在JNI_OnLoad中对FindClass的调用都发生在用作加载共享库的类加载器的上下文（context）中。一般FindClass使用与“调用栈”顶部方法相关的加载器，如果当中没有加载器（因为线程刚刚连接）则使用“系统（system）”类加载器。这就使得JNI_OnLoad成为一个查寻及缓存类引用很便利的地方。

#64位机问题

Android当前设计为运行在32位的平台上。理论上它也能够构建为64位的系统，但那不是现在的目标。当与本地代码交互时，在大多数情况下这不是你需要担心的，但是如果你打算存储指针变量到对象的整型字段（integer field）这样的本地结构中，这就变得非常重要了。为了支持使用64位指针的架构，**你需要使用long类型而不是int类型的字段来存储你的本地指针**。

#不支持的特性/向后兼容性

除了下面的例外，支持所有的JNI 1.6特性：

- DefineClass没有实现。Android不使用Java字节码或者class文件，因此传入二进制class数据将不会有效。

对Android以前老版本的向后兼容性，你需要注意：

- 本地函数的动态查找
在Android 2.0(Eclair)之前，在搜索方法名称时，字符“$”不会转换为对应的“_00024”。要使它正常工作需要使用显式注册方式或者将本地方法的声明移出内部类。
- 分离线程
在Android 2.0(Eclair)之前，使用pthread_key_create析构函数来避免“退出前线程必须分离”检查是不可行的（运行时(runtime)也使用了一个pthread key析构函数，因此这是一场看谁先被调用的竞赛）。
- 全局弱引用
在Android 2.0(Eclair)之前，全局弱引用没有被实现。如果试图使用它们，老版本将完全不兼容。你可以使用Android平台版本号常量来测试系统的支持性。
在Android 4.0 (Ice Cream Sandwich)之前，全局弱引用只能传给NewLocalRef, NewGlobalRef, 以及DeleteWeakGlobalRef（强烈建议开发者在使用全局弱引用之前都为它们创建强引用hard reference，所以这不应该在所有限制当中）。
从Android 4.0 (Ice Cream Sandwich)起，全局弱引用能够像其它任何JNI引用一样使用了。
- 局部引用
在Android 4.0 (Ice Cream Sandwich)之前，局部引用实际上是直接指针。Ice Cream Sandwich为了更好地支持垃圾回收添加了间接指针，但这并不意味着很多JNI bug在老版本上不存在。更多细节见[JNI Local Reference Changes in ICS](http://android-developers.blogspot.com/2011/11/jni-local-reference-changes-in-ics.html)。
- 使用GetObjectRefType获得引用类型
在Android 4.0 (Ice Cream Sandwich)之前，使用直接指针（见上面）的后果就是正确地实现GetObjectRefType是不可能的。我们可以使用依次检测全局弱引用表，参数，局部表，全局表的方式来代替。第一次匹配到你的直接指针时，就表明你的引用类型是当前正在检测的类型。这意味着，例如，如果你在一个全局jclass上使用GetObjectRefType，而这个全局jclass碰巧与作为静态本地方法的隐式参数传入的jclass一样的，你得到的结果是JNILocalRefType而不是JNIGlobalRefType。

#FAQ: 为什么出现了UnsatisfiedLinkError?

当使用本地代码开发时经常会见到像下面的错误：

``` JAVA

java.lang.UnsatisfiedLinkError: Library foo not found
```

有时候这表示和它提示的一样---未找到库。但有些时候库确实存在但不能被dlopen(3)找开，更多的失败信息可以参见异常详细说明。

你遇到“library not found”异常的常见原因可能有这些：

- 库文件不存在或者不能被app访问到。使用adb shell ls -l <path>检查它的存在性和权限。
- 库文件不是用NDK构建的。这就导致设备上并不存在它所依赖的函数或者库。

另一种UnsatisfiedLinkError错误像下面这样：

``` JAVA

java.lang.UnsatisfiedLinkError: myfunc
        at Foo.myfunc(Native Method)
        at Foo.main(Foo.java:10)
```

在日志中，你会发现：

``` JAVA

W/dalvikvm(  880): No implementation found for native LFoo;.myfunc ()V
```

这意味着运行时尝试匹配一个方法但是没有成功，这种情况常见的原因有：

- 库文件没有得到加载。检查日志输出中关于库文件加载的信息。
- 由于名称或者签名错误，方法不能匹配成功。这通常是由于：
    - 对于方法的懒查寻，使用 extern "C"和对应的可见性（JNIEXPORT）来声明C++函数没有成功。注意Ice Cream Sandwich之前的版本，JNIEXPORT宏是不正确的，因此对新版本的GCC使用旧的jni.h头文件将不会有效。你可以使用arm-eabi-nm查看它们出现在库文件里的符号。如果它们看上去比较凌乱（像_Z15Java_Foo_myfuncP7_JNIEnvP7_jclass这样而不是Java_Foo_myfunc），或者符号类型是小写的“t”而不是一个大写的“T”,这时你就需要调整声明了。
    - 对于显式注册，在进行方法签名时可能犯了些小错误。确保你传入到注册函数的签名能够完全匹配上日志文件里提示的。记住“B”是byte，“Z”是boolean。在签名中类名组件是以“L”开头的，以“;”结束的，使用“/”来分隔包名/类名，使用“$”符来分隔内部类名称（比如说，Ljava/util/Map$Entry;）。

使用javah来自动生成JNI头文件也许能帮助你避免这些问题。

#FAQ: 为什么FindClass不能找到我的类?

确保类名字符串有正确的格式。JNI类名称以包名开始，然后使用左斜杠来分隔，比如java/lang/String。如果你正在查找一个数组类，你需要以对应数目的综括号开头，使用“L”和“;”将类名两头包起来，所以一个一维字符串数组应该写成[Ljava/lang/String;。

如果类名称看上去正确，你可能运行时遇到了类加载器的问题。FindClass想在与你代码相关的类加载器中开始查找指定的类。检查调用堆栈，可能看起像：

``` JAVA

Foo.myfunc(Native Method)
Foo.main(Foo.java:10)
dalvik.system.NativeStart.main(Native Method)
```

最顶层的方法是Foo.myfunc。FindClass找到与类Foo相关的ClassLoader对象然后使用它。

这通常正是你所想的。如果你创建了自己的线程那么就会遇到麻烦（也许是调用了pthread_create然后使用AttachCurrentThread进行了连接）。现在跟踪堆栈可能像下面这样：

``` JAVA

dalvik.system.NativeStart.run(Native Method)
```

最顶层的方法是NativeStart.run，它不是你应用内的方法。如果你从这个线程中调用FindClass，JavaVM将会启动“系统（system）”的而不是与你应用相关的加载器，因此试图查找应用内定义的类都将会失败。

下面有几种方法可以解决这个问题：

- 在JNI_OnLoad中使用FindClass查寻一次，然后为后面的使用缓存这些类引用。任何在JNI_OnLoad当中执行的FindClass调用都使用与执行System.loadLibrary的函数相关的类加载器（这个特例，让库的初始化更加的方便了）。如果你的app代码正在加载库文件，FindClass将会使用正确的类加载器。
- 传入类实例到一个需要它的函数，你的本地方法声明必须带有一个Class参数，然后传入Foo.class。
- 在合适的地方缓存一个ClassLoader对象的引用，然后直接发起loadClass调用。这需要额外些工作。

#FAQ: 使用本地代码怎样共享原始数据?

也许你会遇到这样一种情况，想从你的托管代码或者本地代码访问一大块原始数据的缓冲区。常见例子包括对bitmap或者声音文件的处理。这里有两种基本实现方式。

你可以将数据存储到byte[]。这允许你从托管代码中快速地访问。然而，在本地代码端不能保证你不去拷贝一份就直接能够访问数据。在某些实现中，GetByteArrayElements和GetPrimitiveArrayCritical将会返回指向在维护堆中的原始数据的真实指针，但是在另外一些实现中将在本地堆空间分配一块缓冲区然后拷贝数据过去。

还有一种选择是将数据存储在一块直接字节缓冲区（direct byte buffer），可以使用java.nio.ByteBuffer.allocateDirect或者NewDirectByteBuffer JNI函数创建buffer。不像常规的byte缓冲区，它的存储空间将不会分配在程序维护的堆空间上，总是可以从本地代码直接访问（使用GetDirectBufferAddress得到地址）。依赖于直接字节缓冲区访问的实现方式，从托管代码访问原始数据将会非常慢。

选择使用哪种方式取决于两个方面：

1.大部分的数据访问是在Java代码还是C/C++代码中发生？

2.如果数据最终被传到系统API，那它必须是怎样的形式（例如，如果数据最终被传到一个使用byte[]作为参数的函数，在直接的ByteBuffer中处理或许是不明智的）？

如果通过上面两种情况仍然不能明确区分的，就使用直接字节缓冲区（direct byte buffer）形式。它们的支持是直接构建到JNI中的，在未来的版本中性能可能会得到提升。

