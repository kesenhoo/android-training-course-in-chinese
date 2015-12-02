# 为多线程创建管理器

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/create-threadpool.html>

在前面的课程中展示了如何在单独的一个线程中执行一个任务。如果你的线程只想执行一次，那么上一课的内容已经能满足你的需要了。

如果你想在一个数据集中重复执行一个任务，而且你只需要一个执行运行一次。这时，使用一个[IntentService](http://developer.android.com/reference/android/app/IntentService.html)将能满足你的需求。
为了在资源可用的的时候自动执行任务，或者允许不同的任务同时执行（或前后两者），你需要提供一个管理线程的集合。
为了做这个管理线程的集合，使用一个[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)实例，当一个线程在它的线程池中变得不受约束时，它会运行队列中的一个任务。
为了能执行这个任务，你所需要做的就是把它加入到这个队列。

一个线程池能运行多个并行的任务实例，因此你要能保证你的代码是线程安全的，从而你需要给会被多个线程访问的变量附上同步代码块(synchronized block)。
当一个线程在对一个变量进行写操作时，通过这个方法将能阻止另一个线程对该变量进行读取操作。
典型的，这种情况会发生在静态变量上，但同样它也能突然发生在任意一个只实例化一次。
为了学到更多的相关知识，你可以阅读[进程与线程](http://developer.android.com/guide/components/processes-and-threads.html)这一API指南。

## 定义线程池类

在自己的类中实例化[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)类。在这个类里需要做以下事：

**1. 为线程池使用静态变量**

为了有一个单一控制点用来限制CPU或涉及网络资源的[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)类型，你可能需要有一个能管理所有线程的线程池，且每个线程都会是单个实例。比如，你可以把这个作为一部分添加到你的全局变量的声明中去：

```java
public class PhotoManager {
    ...
    static  {
        ...
        // Creates a single static instance of PhotoManager
        sInstance = new PhotoManager();
    }
    ...
```

**2. 使用私有构造方法**

让构造方法私有从而保证这是一个单例，这意味着你不需要在同步代码块(synchronized block)中额外访问这个类：

```java
public class PhotoManager {
    ...
    /**
     * Constructs the work queues and thread pools used to download
     * and decode images. Because the constructor is marked private,
     * it's unavailable to other classes, even in the same package.
     */
    private PhotoManager() {
    ...
    }
```

**3.通过调用线程池类里的方法开启你的任务**

在线程池类中定义一个能添加任务到线程池队列的方法。例如：

```java
public class PhotoManager {
    ...
    // Called by the PhotoView to get a photo
    static public PhotoTask startDownload(
        PhotoView imageView,
        boolean cacheFlag) {
        ...
        // Adds a download task to the thread pool for execution
        sInstance.
                mDownloadThreadPool.
                execute(downloadTask.getHTTPDownloadRunnable());
        ...
    }
```

**4. 在构造方法中实例化一个[Handler](http://developer.android.com/reference/android/os/Handler.html)，且将它附加到你APP的UI线程。**

一个[Handler](http://developer.android.com/reference/android/os/Handler.html)允许你的APP安全地调用UI对象（例如 [View](http://developer.android.com/reference/android/view/View.html)对象）的方法。大多数UI对象只能从UI线程安全的代码中被修改。这个方法将会在[与UI线程进行通信(Communicate with the UI Thread)](performance/multi-threads/communicate-ui.html)这一课中进行详细的描述。例如：

```java
private PhotoManager() {
    ...
        // Defines a Handler object that's attached to the UI thread
        mHandler = new Handler(Looper.getMainLooper()) {
            /*
             * handleMessage() defines the operations to perform when
             * the Handler receives a new Message to process.
             */
            @Override
            public void handleMessage(Message inputMessage) {
                ...
            }
        ...
        }
    }
```

## 确定线程池的参数

一旦有了整体的类结构,你可以开始定义线程池了。为了初始化一个[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)对象，你需要提供以下数值：

**1. 线程池的初始化大小和最大的大小**

这个是指最初分配给线程池的线程数量，以及线程池中允许的最大线程数量。在线程池中拥有的线程数量主要取决于你的设备的CPU内核数。

这个数字可以从系统环境中获得：

```java
public class PhotoManager {
...
    /*
     * Gets the number of available cores
     * (not always the same as the maximum number of cores)
     */
    private static int NUMBER_OF_CORES =
            Runtime.getRuntime().availableProcessors();
}
```

这个数字可能并不反映设备的物理核心数量，因为一些设备根据系统负载关闭了一个或多个CPU内核，对于这样的设备，`availableProcessors()`方法返回的是处于活动状态的内核数量，可能少于设备的实际内核总数。

**2.线程保持活动状态的持续时间和时间单位**

这个是指线程被关闭前保持空闲状态的持续时间。这个持续时间通过时间单位值进行解译，是[TimeUnit()](http://developer.android.com/reference/java/util/concurrent/TimeUnit.html)中定义的常量之一。

**3.一个任务队列**

这个传入的队列由[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)获取的[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)对象组成。为了执行一个线程中的代码，一个线程池管理者从先进先出的队列中取出一个[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)对象且把它附加到一个线程。当你创建线程池时需要提供一个队列对象，这个队列对象类必须实现[BlockingQueue](http://developer.android.com/reference/java/util/concurrent/BlockingQueue.html)接口。为了满足你的APP的需求，你可以选择一个Android SDK中已经存在的队列实现类。为了学习更多相关的知识，你可以看一下[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)类的概述。下面是一个使用[LinkedBlockingQueue](http://developer.android.com/reference/java/util/concurrent/LinkedBlockingQueue.html)实现的例子：

```java
public class PhotoManager {
    ...
    private PhotoManager() {
        ...
        // A queue of Runnables
        private final BlockingQueue<Runnable> mDecodeWorkQueue;
        ...
        // Instantiates the queue of Runnables as a LinkedBlockingQueue
        mDecodeWorkQueue = new LinkedBlockingQueue<Runnable>();
        ...
    }
    ...
}
```

##创建一个线程池

为了创建一个线程池，可以通过调用<a href="http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html#ThreadPoolExecutor(int, int, long, java.util.concurrent.TimeUnit, java.util.concurrent.BlockingQueue<java.lang.Runnable>)" target="_blank">ThreadPoolExecutor()</a>构造方法初始化一个线程池管理者对象，这样就能创建和管理一组可约束的线程了。如果线程池的初始化大小和最大大小相同，[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)在实例化的时候就会创建所有的线程对象。例如：

```java
private PhotoManager() {
        ...
        // Sets the amount of time an idle thread waits before terminating
        private static final int KEEP_ALIVE_TIME = 1;
        // Sets the Time Unit to seconds
        private static final TimeUnit KEEP_ALIVE_TIME_UNIT = TimeUnit.SECONDS;
        // Creates a thread pool manager
        mDecodeThreadPool = new ThreadPoolExecutor(
                NUMBER_OF_CORES,       // Initial pool size
                NUMBER_OF_CORES,       // Max pool size
                KEEP_ALIVE_TIME,
                KEEP_ALIVE_TIME_UNIT,
                mDecodeWorkQueue);
    }
```



