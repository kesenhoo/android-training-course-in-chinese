# 启动与停止线程池中的线程

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/run-code.html>

在前面的课程中向你展示了如何去定义一个可以管理线程池且能在他们中执行任务代码的类。在这一课中我们将向你展示如何在线程池中执行任务代码。为了达到这个目的，你需要把任务添加到线程池的工作队列中去，当一个线程变成可运行状态时，ThreadPoolExecutor从工作队列中取出一个任务，然后在该线程中执行。

这节课同时也向你展示了如何去停止一个正在执行的任务，这个任务可能在刚开始执行时是你想要的，但后来发现它所做的工作并不是你所需要的。你可以取消线程正在执行的任务，而不是浪费处理器的运行时间。例如你正在从网络上下载图片且对下载的图片进行了缓存，当检测到正在下载的图片在缓存中已经存在时，你可能希望停止这个下载任务。当然，这取决于你编写APP的方式，因为可能压在你启动下载任务之前无法获知是否需要启动这个任务。

## 启动线程池中的线程执行任务

为了在一个特定的线程池的线程里开启一个任务，可以通过调用ThreadPoolExecutor.execute()，它需要提供一个Runnable类型的参数，这个调用会把该任务添加到这个线程池中的工作队列。当一个空闲的线程进入可执行状态时，线程管理者从工作队列中取出等待时间最长的那个任务，并且在线程中执行它。

```java
public class PhotoManager {
    public void handleState(PhotoTask photoTask, int state) {
        switch (state) {
            // The task finished downloading the image
            case DOWNLOAD_COMPLETE:
            // Decodes the image
                mDecodeThreadPool.execute(
                        photoTask.getPhotoDecodeRunnable());
            ...
        }
        ...
    }
    ...
}
```

当ThreadPoolExecutor在一个线程中开启一个Runnable后，它会自动调用Runnable的run()方法。

## 中断正在执行的代码

为了停止执行一个任务，你必须中断执行这个任务的线程。在准备做这件事之前，当你创建一个任务时，你需要存储处理该任务的线程。例如：

```java
class PhotoDecodeRunnable implements Runnable {
    // Defines the code to run for this task
    public void run() {
        /*
         * Stores the current Thread in the
         * object that contains PhotoDecodeRunnable
         */
        mPhotoTask.setImageDecodeThread(Thread.currentThread());
        ...
    }
    ...
}
```

想要中断一个线程，你可以调用[Thread.interrupt()](http://developer.android.com/reference/java/lang/Thread.html#interrupt())。需要注意的是这些线程对象都被系统控制，系统可以在你的APP进程之外修改
他们。因为这个原因，在你要中断一个线程时，你需要把这段代码放在一个同步代码块中对这个线程的访问加锁来解决这个问题。例如：

```java
public class PhotoManager {
    public static void cancelAll() {
        /*
         * Creates an array of Runnables that's the same size as the
         * thread pool work queue
         */
        Runnable[] runnableArray = new Runnable[mDecodeWorkQueue.size()];
        // Populates the array with the Runnables in the queue
        mDecodeWorkQueue.toArray(runnableArray);
        // Stores the array length in order to iterate over the array
        int len = runnableArray.length;
        /*
         * Iterates over the array of Runnables and interrupts each one's Thread.
         */
        synchronized (sInstance) {
            // Iterates over the array of tasks
            for (int runnableIndex = 0; runnableIndex < len; runnableIndex++) {
                // Gets the current thread
                Thread thread = runnableArray[taskArrayIndex].mThread;
                // if the Thread exists, post an interrupt to it
                if (null != thread) {
                    thread.interrupt();
                }
            }
        }
    }
    ...
}
```

在大多数情况下，通过调用Thread.interrupt()能立即中断这个线程，然而他只能停止那些处于等待状态的线程，却不能中断那些占据CPU或者耗时的连接网络的任务。为了避免拖慢系统速度或造成系统死锁，在尝试执行耗时操作之前，你应该测试当前是否存在处于挂起状态的中断请求：

```java
/*
 * Before continuing, checks to see that the Thread hasn't
 * been interrupted
 */
if (Thread.interrupted()) {
    return;
}
...
// Decodes a byte array into a Bitmap (CPU-intensive)
BitmapFactory.decodeByteArray(
        imageBuffer, 0, imageBuffer.length, bitmapOptions);
...
```



