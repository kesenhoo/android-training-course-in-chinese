# 多线程操作

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/index.html>

把一个相对耗时且数据操作复杂的任务分割成多个小的操作，然后分别运行在多个线程上，这能够提高完成任务的速度和效率。在多核CPU的设备上，系统可以并行运行多个线程，而不需要让每个子操作等待CPU的时间片切换。例如，如果要解码大量的图片文件并以缩略图的形式把图片显示在屏幕上，当你把每个解码操作单独用一个线程去执行时，会发现速度快了很多。

这个章节会向你展示如何在一个Android应用中创建和使用多线程，以及如何使用线程池对象（thread pool object）。你还将了解到如何使得代码运行在指定的线程中，以及如何让你创建的线程和UI线程进行通信。

## Sample Code

点击下载：[**ThreadSample**](http://developer.android.com/shareables/training/ThreadSample.zip)

## Lessons

###[在一个线程中执行一段特定的代码](define-runnable.html)

学习如何通过实现[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)接口定义一个线程类，让你写的代码能在单独的一个线程中执行。

###[为多线程创建线程池](create-threadpool.html)

学习如何创建一个能管理线程池和任务队列的对象，需要使用一个叫[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)的类。

###[在线程池中的一个线程里执行代码](run-code.html)

学习如何让线程池里的一个线程执行一个任务。

###[与UI线程通信](communicate-ui.html)

学习如何让线程池里的一个普通线程与UI线程进行通信。
