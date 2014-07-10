> 编写：[pedant][1]，校对：

> 原文：[http://developer.android.com/training/articles/perf-jni.html][2]


# JNI Tips

JNI全称Java Native Interface。它为托管代码（使用Java编程语言编写）与原生代码（使用C/C++编写）交互提供了一种方式。它是与厂商无关的（vendor-neutral）,支持从动态共享库中加载代码，虽然这样会稍显麻烦，但有时这是相当有效的。

如果你对JNI还不是太熟悉，可以先通读[Java Native Interface Specification][3]这篇文章来对JNI如何工作以及哪些特性可用有个大致的印象。这种接口的一些方面不能立即一读就显而易见，所以你会发现接下来的几个章节很有用处。

# JavaVM 及 JNIEnv

JNI定义了两种关键数据结构，“JavaVM”和“JNIEnv”。它们本质上都是指向函数表指针的指针（在C++版本中，它们被定义为类，该类包含一个指向函数表的指针，以及通过这个函数表间接访问对应JNI函数的一系列成员函数）。JavaVM提供“调用接口（invocation interface）”功能, 允许你创建和销毁一个JavaVM。理论上你可以在一个进程中拥有多个JavaVM对象，但安卓下只允许一个。

JNIEnv提供了大部分JNI功能。你定义的所有原生函数都会接收JNIEnv作为第一个参数。

JNIEnv是用作本地线程存储。因此，**你不能在线程间共享一个JNIEnv变量**。如果在一段代码中没有其它办法获得它的JNIEnv，你可以共享JavaVM对象，使用GetEnv来取得该线程下的JNIEnv（如果该线程有一个JavaVM的话；见下面的AttachCurrentThread）。

JNIEnv和JavaVM的在C声明是不同于在C++的声明。头文件“jni.h”根据它是以C还是以C++模式包含来提供不同的类型定义（typedefs）。因此，不建议把JNIEnv参数放到可能被两种语言引入的头文件中（换一句话说：如果你的头文件需要#ifdef __cplusplus，你可能不得不在任何涉及到JNIEnv的内容时做些额外的工作）。

#线程

所有的线程都是Linux线程，由内核统一调度。它们通常从托管代码中启动（使用Thread.start），但它们也能够在其他任何地方创建，然后附属（attach）到JavaVM。例如，一个用pthread_create启动的线程能够使用JNI AttachCurrentThread 或 AttachCurrentThreadAsDaemon函数附属到JavaVM。在一个线程被成功附属（attach）之前，它没有JNIEnv，**不能够调用JNI函数**。

附属一个原生创建的线程会触发构造一个java.lang.Thread对象，然后添加到主线程群（main ThreadGroup）,以让调试器可以探测到。对一个已经附属的线程使用AttachCurrentThread不做任何操作（no-op）。

安卓不能暂停执行原生代码的线程。如果正在进行垃圾回收，或者调试器已发出了暂停请求，安卓会在下一次调用JNI函数的时候暂停线程。

附属过的（attached）线程在它们退出之前**必须通过JNI调用DetachCurrentThread**。如果你觉得直接这样编写不太优雅，在安卓2.0（Eclair）及以上， 你可以使用pthread_key_create来定义一个析构函数，它将会在线程退出时被调用，你可以在那儿调用DetachCurrentThread （使用生成的key与pthread_setspecific一起在本地线程存储空间内存储JNIEnv；这样JNIEnv能够作为参数传入到析构函数当中去）。

#jclass,jmethodID,jfieldID

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
