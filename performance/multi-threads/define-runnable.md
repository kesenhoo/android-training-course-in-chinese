#在一个线程中执行一段特定的代码

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/define-runnable.html>

这一课向你展示了如何通过实现<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>接口得到一个能在重写的<a href="http://developer.android.com/reference/java/lang/Runnable.html#run()" target="_blank">Runnable.run()</a>方法中执行一段代码的单独的线程。另外你可以传递一个<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>对象到另一个对象，然后这个对象可以把它附加到一个线程，并执行它。一个或多个执行特定操作的<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>对象有时也被称为一个任务。

<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Thread</a>和<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>只是两个基本的线程类，通过他们能发挥的作用有限，但是他们是强大的Android线程类的基础类，例如Android中的<a href="http://developer.android.com/reference/android/os/HandlerThread.html" target="_blank">HandlerThread</a>,<a href="http://developer.android.com/reference/android/os/AsyncTask.html" target="_blank">AsyncTask</a>和<a href="http://developer.android.com/reference/android/app/IntentService.html" target="_blank">IntentService</a>都是以它们为基础。<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Thread</a>和<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>同时也是<a href="http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html" target="_blank">ThreadPoolExecutor</a>类的基础。<a href="http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html" target="_blank">ThreadPoolExecutor</a>类能自动管理线程和任务队列，甚至可以并行执行多个线程。

##定义一个实现Runnable接口的类
直接了当的方法是通过实现<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>接口去定义一个线程类。例如：
```java
public class PhotoDecodeRunnable implements Runnable {
    ...
    @Override
    public void run() {
        /*
         * 把你想要在线程中执行的代码写在这里
         */
        ...
    }
    ...
}
```
##实现run()方法
在一个类里，<a href="http://developer.android.com/reference/java/lang/Runnable.html#run()" target="_blank">Runnable.run()</a>
包含执行了的代码。通常在<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>
中执行任何操作都是可以的，但需要记住的是，因为<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>
不会在UI线程中运行，所以它不能直接更新UI对象，例如<a href="http://developer.android.com/reference/android/view/View.html" target="_blank">View</a>
对象。为了与UI对象进行通信，你必须使用另一项技术，在<a href="performance/multi-threads/communicate-ui.html" target="_blank">Communicate with the UI Thread(与UI线程进行通信)</a>
这一课中我们会对其进行描述。

在<a href="http://developer.android.com/reference/java/lang/Runnable.html#run()" target="_blank">run()</a>方法的开始的地方通过调用参数为<a href="http://developer.android.com/reference/android/os/Process.html#THREAD_PRIORITY_BACKGROUND" target="_blank">THREAD_PRIORITY_BACKGROUND</a>
的<a href="http://developer.android.com/reference/android/os/Process.html#setThreadPriority(int)" target="_blank">Process.setThreadPriority()</a>方法来设置线程使用的是后台运行优先级。
这个方法减少了通过<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>创建的线程和和UI线程之间的资源竞争。

你还应该通过在<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>
自身中调用[Thread.currentThread()](http://developer.android.com/reference/java/lang/Thread.html#currentThread()来存储一个引用到<a href="http://developer.android.com/reference/java/lang/Runnable.html" target="_blank">Runnable</a>
对象的线程。

下面这段代码展示了如何创建<a href="http://developer.android.com/reference/java/lang/Runnable.html#run()" target="_blank">run()</a>方法：
```java
class PhotoDecodeRunnable implements Runnable {
...
    /*
     * 定义要在这个任务中执行的代码
     */
    @Override
    public void run() {
        // 把当前的线程变成后台执行的线程
        android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);
        ...
        /*
         * 在PhotoTask实例中存储当前线程，以至于这个实例能中断这个线程
         */
        mPhotoTask.setImageDecodeThread(Thread.currentThread());
        ...
    }
...
}
```









