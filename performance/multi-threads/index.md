# 多线程操作

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/index.html>



如果你把一个会长时间运行且数据密集的操作分割成一个个小的操作，然后运行在多个线程上，它的执行速度和效率都会得到提高。在一个有多核CPU的设备上，系统可以并行运行多个线程，而不是让每个操作在等待其它操作执行完后再伺机执行。例如，如果要解码大量的图片文件并以缩略图的形式把图片显示在屏幕上，当你每个解码单独用一个线程去执行时，会发现速度快了很多。

这一部分向你展示了如何在一个Android应用中创建和使用多线程，以及如何使用一个线程池对象（thread pool object）。你还将了解到如何通过代码运行一个线程,以及如何让你创建的一个线程和UI线程之间进行通信。

##课程
###[在一个线程中执行一段特定的代码](performance/multi-threads/define-runnable.html)
学习如何通过实现[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)接口定义一个线程类，让你写的代码能在单独的一个线程中执行。

###[为多线程创建线程池](performance/multi-threads/create-threadpool.html)
学习如何创建一个能管理线程池和任务队列的对象，需要使用一个叫[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)的类。

###[在线程池中的一个线程里执行代码](performance/multi-threads/run-code.html)
学习如何让线程池里的一个线程执行一个任务。

###[与UI线程通信](performance/multi-threads/communicate-ui.html)
学习如何让线程池里的一个普通线程与UI线程进行通信。
