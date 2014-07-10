> 编写: [pedant][1]

> 校对:

# JNI Tips

JNI全称Java Native Interface。它为托管代码（使用Java编程语言编写）与原生代码（使用C/C++编写）交互提供了一种方式。它是厂商中立的（vendor-neutral）,支持从动态共享库中加载代码，虽然有时这样会稍显麻烦，但这是相当有效的。

如果你对JNI还不是太熟悉，可以先通读[Java Native Interface Specification][2]这篇文章来对JNI如何工作以及哪些特性可用有个大致的印象。这种接口的一些方面不能立即一读就显而易见，所以你会发现接下来的几个章节的灵巧。

# JavaVM 及 JNIEnv

JNI定义了两种关键数据结构，“JavaVM”和“JNIEnv”。它们本质上都是指向函数表指针的指针。（在C++版本中，它们被归为指向函数表和成员函数的指针，每个JNI功能都间接的访问这张表）。JavaVM提供“调用接口（invocation interface）”功能, 允许你创建和销毁一个JavaVM。理论上你可以在一个进程中拥有多个JavaVM对象，但安卓下只允许一个。

JNIEnv提供了大部分JNI功能。你定义的所有原生函数都应把JNIEnv作为第一个参数。

JNIEnv是用作本地线程存储。因此，你不能在线程间共享一个JNIEnv变量。如果在一段代码中没有其它方式获得它的JNIEnv，你可以共享JavaVM对象，使用GetEnv来取得该线程下的JNIEnv（如果该线程下有JNIEnv的话；见下面的AttachCurrentThread）。

JNIEnv和JavaVM的在C声明与C++声明是不同的。头文件“jni.h”具体提供哪种类型定义取决于它是以C还是以C++模式引入。因此，不建议把JNIEnv参数放到可能被两种语言引入的头文件中（换一句话说：如果你的头文件需要#ifdef __cplusplus，你可能不得不在任何涉及到JNIEnv的头文件中做些额外的工作）。

#线程

#jclass,jmethodID,jfieldID

#局部和全局引用

#UTF-8、UTF-16 字符串

#原生数组

#区间数组

#异常

#扩展检查

#原生库

#64位考虑

#不支持的特性/向后兼容性

#FAQ: 为什么出现了UnsatisfiedLinkError?

#FAQ: 为什么FindClass不能找到我的类?

#FAQ: 使用原生代码怎么分享原始数据?

[1]: https://github.com/pedant
[2]: http://docs.oracle.com/javase/7/docs/technotes/guides/jni/spec/jniTOC.html
