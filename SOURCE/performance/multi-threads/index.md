> 编写:[zhaochunqi](https://github.com/zhaochunqi)

> 校对:

# 多线程操作
当把操作分成小块运行在多个线程上时，对于一个运行时间长，数据敏感的操作来说，速度和效率通常会有所提高。
在一个有多个处理器(核心)的CPU上，系统能够并发的执行多个线程，而不是让每一个子操作等待时机来运行。例如，解码多个图像文件时候，在每个独立的线程中解码运行的屏幕缩略图运行速度明显要更快。

本课会向你展示如何在Android应用中建立和应用多线程，如何使用一个线程池对象。你也会学到如何定义代码运行在一个线程中和如何让其中的线程与UI线程交流。

## 课程

### [在线程上运行具体的代码](http://developer.android.com/training/multiple-threads/define-runnable.html)
学习如何在一个写出在独立线程([Thread](http://developer.android.com/reference/java/lang/Thread.html))中运行的代码，通过定义一个类来实现 [Runnable](http://developer.android.com/reference/java/lang/Runnable.html) 接口。

### [创建一个多线程的管理器](http://developer.android.com/training/multiple-threads/create-threadpool.html)
学习如何创建一个能够管理线程对象池的类和一系列[Runnable](http://developer.android.com/reference/java/lang/Runnable.html) 对象，这个对象叫做[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html).

### [在线程池线程中运行代码](http://developer.android.com/training/multiple-threads/run-code.html)
学习如何在线程池对象中运行一个[Runnable](http://developer.android.com/reference/java/lang/Runnable.html) 线程。
### [与UI线程交流](http://developer.android.com/training/multiple-threads/communicate-ui.html)
学习如何从线程池中的线程与UI线程交流。
