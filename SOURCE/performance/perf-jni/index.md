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

所有的线程都是Linux线程，由内核统一调度。它们通常从托管代码中启动（使用Thread.start），但它们也能够在其他任何地方创建，然后附属（attach）到JavaVM。例如，一个用pthread_create启动的线程能够使用JNI AttachCurrentThread 或 AttachCurrentThreadAsDaemon函数附属到JavaVM。在一个线程被成功附属（attach）之前，它没有JNIEnv，**不能够调用JNI函数**。

附属一个原生创建的线程会触发构造一个java.lang.Thread对象，然后添加到主线程群（main ThreadGroup）,以让调试器可以探测到。对一个已经附属的线程使用AttachCurrentThread不做任何操作（no-op）。

安卓不能暂停执行原生代码的线程。如果正在进行垃圾回收，或者调试器已发出了暂停请求，安卓会在下一次调用JNI函数的时候暂停线程。

附属过的（attached）线程在它们退出之前**必须通过JNI调用DetachCurrentThread**。如果你觉得直接这样编写不太优雅，在安卓2.0（Eclair）及以上， 你可以使用pthread_key_create来定义一个析构函数，它将会在线程退出时被调用，你可以在那儿调用DetachCurrentThread （使用生成的key与pthread_setspecific一起在本地线程存储空间内存储JNIEnv；这样JNIEnv能够作为参数传入到析构函数当中去）。

#jclass,jmethodID,jfieldID

如果你想在原生代码中访问一个对象的域（field）,你可以像下面这样做：

- 对于类，使用FindClass获得类对象的引用
- 对于域，使用GetFieldId获得域ID
- 使用对应的方法（例如GetIntField）获取域下面的值

类似地，要调用一个方法，你首先得获得一个类对象的引用，然后是方法ID（method ID）。这些ID通常是指向运行时内部数据结构。查找到它们需要些字符串比较，但是一旦你让它们做实际调用去获得域或者反射方法是非常快的。

如果性能是你看重的，那么一旦查找出这些值之后在你的原生代码中缓存这些结果是非常有用的。因为每个进程当中的JavaVM是存在限制的，存储这些数据到本地静态数据结构中是非常合理的。

类引用（class reference），域ID（field ID）以及方法ID（method ID）在类被卸载前都是有效的。如果与一个类加载器（ClassLoader）相关的所有类都能够被垃圾回收，但是这种情况在安卓上是罕见甚至不可能出现，只有这时类才被卸载。注意虽然jclass是一个类引用，但是必须要调用NewGlobalRef保护起来（见下个章节）。

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
