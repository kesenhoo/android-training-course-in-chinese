> 编写：[pedant][1]，校对：

> 原文：[http://developer.android.com/training/articles/perf-jni.html][2]


# JNI Tips

JNI全称Java Native Interface。它为托管代码（使用Java编程语言编写）与原生代码（使用C/C++编写）交互提供了一种方式。它是与厂商无关的（vendor-neutral）,支持从动态共享库中加载代码，虽然这样会稍显麻烦，但有时这是相当有效的。

如果你对JNI还不是太熟悉，可以先通读[Java Native Interface Specification][3]这篇文章来对JNI如何工作以及哪些特性可用有个大致的印象。这种接口的一些方面不能立即一读就显而易见，所以你会发现接下来的几个章节很有用处。

# JavaVM 及 JNIEnv

JNI定义了两种关键数据结构，“JavaVM”和“JNIEnv”。它们本质上都是指向函数表指针的指针（在C++版本中，它们被定义为类，该类包含一个指向函数表的指针，以及通过这个函数表间接地访问对应的JNI函数的一系列成员函数）。JavaVM提供“调用接口（invocation interface）”函数, 允许你创建和销毁一个JavaVM。理论上你可以在一个进程中拥有多个JavaVM对象，但安卓下只允许一个。

JNIEnv提供了大部分JNI功能。你定义的所有原生函数都会接收JNIEnv作为第一个参数。

JNIEnv是用作本地线程存储。因此，**你不能在线程间共享一个JNIEnv变量**。如果在一段代码中没有其它办法获得它的JNIEnv，你可以共享JavaVM对象，使用GetEnv来取得该线程下的JNIEnv（如果该线程有一个JavaVM的话；见下面的AttachCurrentThread）。

JNIEnv和JavaVM的在C声明是不同于在C++的声明。头文件“jni.h”根据它是以C还是以C++模式包含来提供不同的类型定义（typedefs）。因此，不建议把JNIEnv参数放到可能被两种语言引入的头文件中（换一句话说：如果你的头文件需要#ifdef __cplusplus，你可能不得不在任何涉及到JNIEnv的内容时做些额外的工作）。

#线程

所有的线程都是Linux线程，由内核统一调度。它们通常从托管代码中启动（使用Thread.start），但它们也能够在其他任何地方创建，然后连接（attach）到JavaVM。例如，一个用pthread_create启动的线程能够使用JNI AttachCurrentThread 或 AttachCurrentThreadAsDaemon函数连接到JavaVM。在一个线程被成功附属（attach）之前，它没有JNIEnv，**不能够调用JNI函数**。

连接一个原生创建的线程会触发构造一个java.lang.Thread对象，然后添加到主线程群（main ThreadGroup）,以让调试器可以探测到。对一个已经连接的线程使用AttachCurrentThread不做任何操作（no-op）。

安卓不能暂停执行原生代码的线程。如果正在进行垃圾回收，或者调试器已发出了暂停请求，安卓会在下一次调用JNI函数的时候暂停线程。

连接过的（attached）线程在它们退出之前**必须通过JNI调用DetachCurrentThread**。如果你觉得直接这样编写不太优雅，在安卓2.0（Eclair）及以上， 你可以使用pthread_key_create来定义一个析构函数，它将会在线程退出时被调用，你可以在那儿调用DetachCurrentThread （使用生成的key与pthread_setspecific一起在本地线程存储空间内存储JNIEnv；这样JNIEnv能够作为参数传入到析构函数当中去）。

#jclass,jmethodID,jfieldID

如果你想在原生代码中访问一个对象的域（field）,你可以像下面这样做：

- 对于类，使用FindClass获得类对象的引用
- 对于域，使用GetFieldId获得域ID
- 使用对应的方法（例如GetIntField）获取域下面的值

类似地，要调用一个方法，你首先得获得一个类对象的引用，然后是方法ID（method ID）。这些ID通常是指向运行时内部数据结构。查找到它们需要些字符串比较，但是一旦你让它们做实际调用去获得域或者反射方法是非常快的。

如果性能是你看重的，那么一旦查找出这些值之后在你的原生代码中缓存这些结果是非常有用的。因为每个进程当中的JavaVM是存在限制的，存储这些数据到本地静态数据结构中是非常合理的。

类引用（class reference），域ID（field ID）以及方法ID（method ID）在类被卸载前都是有效的。如果与一个类加载器（ClassLoader）相关的所有类都能够被垃圾回收，但是这种情况在安卓上是罕见甚至不可能出现，只有这时类才被卸载。注意虽然jclass是一个类引用，但是**必须要调用NewGlobalRef保护起来**（见下个章节）。

当一个类被加载时如果你想缓存些ID，而后当这个类被卸载后再次载入时能够自动地更新这些缓存ID，正确的方式是添加一段像下面的代码到对应的类中来初始化这些ID：

``` java

/*
 * 我们使用一个类初始化来允许原生代码中缓存一些域的偏移信息
 * 这个原生方法查找并缓存你感兴趣的class/field/method ID
 * 失败时抛出异常
 */
private static native void nativeInit();

static {
    nativeInit();
}
```

在你的C/C++代码中创建一个nativeClassInit方法以完成ID查找的工作。当这个类被初始化时这段代码将会被执行一次。当这个类被卸载后而后再次载入时，这段代码将会再次执行。

#局部和全局引用

每个传入原生方法的参数，大部分JNI函数返回的每个对象都是“局部引用”。这意味着它只在当前线程的当前方法执行期间有效。**即使这个对象本身在原生方法返回之后仍然存在，这个引用也是无效的**。

这同样适用于所有jobject的子类，包括jclass，jstring，以及jarray（当JNI扩展检查是打开的时候，运行时会警告你在大部分引用上的误用）。

如果你想持有一个引用更长的时间，你就必须使用一个全局（“global”）引用了。NewGlobalRef函数以一个局部引用作为参数并且返回一个全局引用。全局引用能够保证在你调用DeleteGlobalRef前都是有效的。

这种模式通常被用在缓存一个从FindClass返回的jclass对象的时候，例如：

``` java

jclass localClass = env->FindClass("MyClass");
jclass globalClass = reinterpret_cast<jclass>(env->NewGlobalRef(localClass));
```

所有的JNI方法都接收局部引用和全局引用作为参数。相同对象的引用却获得不同的值是可能的。例如，用相同对象连续地调用NewGlobalRef获得的返回值可能是不同的。**为了检查两个引用是否指向的是同一个对象，你必须使用IsSameObject函数**。绝不要在原生代码中用==符号来比较两个引用。

这样的结果就是你**绝不要在原生代码中假设对象的引用是常量或者是唯一的**。代表一个对象的32位值从一个方法的一次调用到下一次调用可能有不同的值。在连续的调用过程中两个不同的对象却拥有相同的32位值是可能的。不要使用jobject的值作为key.

编程者需要“不过度分配”局部引用。在实际操作中这意味着如果你正在创建大量的局部引用，或许是通过对象数组，你应该使用DeleteLocalRef手动地释放它们，而不是寄希望JNI来为你做这些。实现上只需要预留16个局部引用的空间，所以如果你需要更多，你要么删掉以前的，要么使用EnsureLocalCapacity/PushLocalFrame来预留更多。

注意jfieldID和jmethodID是不透明的类型，不是对象引用，不应该被传入到NewGlobalRef。原始数据指针，像GetStringUTFChars和GetByteArrayElements的返回值，也都不是对象（它们也许能够在线程间传递，在调用对应的Release函数之前都是有效的）。

一种不常见的情况值得单独提醒一下。如果你使用AttachCurrentThread连接（attach）了原生进程，正在运行的代码在线程分离（detach）之前决不会自动释放局部引用。你创建的任何局部引用必须手动删除。通常，任何在循环中创建局部引用的原生代码可能都需要做一些手动删除。

#UTF-8、UTF-16 字符串

#基本类型数组

#区间数组

#异常

#扩展检查

#原生库

#64位考虑

#不支持的特性/向后兼容性

#FAQ: 为什么出现了UnsatisfiedLinkError?

#FAQ: 为什么FindClass不能找到我的类?

#FAQ: 使用原生代码怎样共享原始数据?

[1]: https://github.com/pedant
[2]: http://developer.android.com/training/articles/perf-jni.html
[3]: http://docs.oracle.com/javase/7/docs/technotes/guides/jni/spec/jniTOC.html
