# 管理应用的内存

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/articles/memory.html>

随机存取存储器（RAM）在任何软件开发环境中都是一个很宝贵的资源。这一点在物理内存通常很有限的移动操作系统上，显得尤为突出。尽管 Android Runtime（ART）和 Dalvik 虚拟机都扮演了常规的垃圾回收的角色，但这并不意味着你可以忽略应用内存分配和释放的时间和位置。你仍然需要避免引入内存泄漏（通常是由于静态成员变量中持有对象引用导致），并在适当的生命周期的回调中释放所有的引用对象。

本文章介绍如何在应用中主动减少内存的使用。关于 Java 资源管理机制的更多信息，请参阅有关管理引用资源的其他书籍或在线文档。如果你正在寻找如何分析应用中的内存使用情况的文章，请参阅：[Tools for analyzing RAM usage](https://developer.android.google.cn/topic/performance/memory.html#AnalyzeRam)。 关于 Android Runtime 和 Dalvik 虚拟机如何管理内存的更多详细信息，请参阅：[Overview of Android Memory Management](https://developer.android.google.cn/topic/performance/memory-overview.html)。

## 第 1 部分：监视可用内存和内存使用情况
Android Framework 和 Android Studio 可以帮助你分析和调整应用的内存使用。Android Framework 公开了几个 API，允许你的应用在运行时动态地减少其内存使用。Android Studio 包含几个工具，可让你调查应用如何使用内存。

### 1) 分析 RAM 使用的工具
在你修复应用内存使用问题之前，你首先需要找到它们。Android Studio 和 Android SDK 包含了几个用于分析应用内存使用情况的工具：

1. Android Studio 中的内存监视器(Memory Monitor)会显示你的应用在单个会话过程中如何分配内存。该工具除了显示了随时间分布的可用的和已分配的 Java 内存图示，还包括垃圾回收事件(garbage collection)按钮。你可以启动 GC 事件，并在应用运行时拍摄 Java 堆的快照。内存监视器工具的输出可以帮助你识别出你的应用由于过多的 GC 事件导致应用缓慢的点。

  关于如何使用内存监视器工具的详细信息，请参阅: [Viewing Heap Updates](https://developer.android.google.cn/tools/debugging/debugging-memory.html#ViewHeap)。

2. Android Studio 中的分配跟踪(Allocation Tracker)工具可让你详细了解应用如何分配内存。分配跟踪器记录了应用的内存分配情况，并列出分析快照中的所有已分配对象。你可以使用此工具跟踪到分配了太多对象的代码部分。

  关于如何使用分配跟踪工具的更多信息，请参阅：[Allocation Tracker Walkthrough](https://developer.android.google.cn/studio/profile/allocation-tracker-walkthru.html)。

### 2) 适时释放内存
Android 设备可以使用不同的可用内存，这具体取决于设备上 RAM 的大小以及用户的操作方式。当处于内存紧张时，系统会广播信号以表明该情况，应用应监听这些信号并酌情调整其内存使用情况。

你可以使用`ComponentCallbacks2`API 来监听这些信号，然后根据应用生命周期或设备事件调整内存使用情况。`onTrimMemory()`方法允许你的应用在应用在前台运行（在屏幕显示）以及在后台运行时监听与内存相关的事件。
要监听这些事件，请在`Activity`类中实现`onTrimMemory()`回调，如下面的代码片段所示。
```Java
import android.content.ComponentCallbacks2;
// Other import statements ...

public class MainActivity extends AppCompatActivity
    implements ComponentCallbacks2 {

    // Other activity code ...

    /**
     * Release memory when the UI becomes hidden or when system resources become low.
     * @param level the memory-related event that was raised.
     */
    public void onTrimMemory(int level) {

        // Determine which lifecycle or system event was raised.
        switch (level) {

            case ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN:

                /*
                   Release any UI objects that currently hold memory.

                   The user interface has moved to the background.
                */

                break;

            case ComponentCallbacks2.TRIM_MEMORY_RUNNING_MODERATE:
            case ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW:
            case ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL:

                /*
                   Release any memory that your app doesn't need to run.

                   The device is running low on memory while the app is running.
                   The event raised indicates the severity of the memory-related event.
                   If the event is TRIM_MEMORY_RUNNING_CRITICAL, then the system will
                   begin killing background processes.
                */

                break;

            case ComponentCallbacks2.TRIM_MEMORY_BACKGROUND:
            case ComponentCallbacks2.TRIM_MEMORY_MODERATE:
            case ComponentCallbacks2.TRIM_MEMORY_COMPLETE:

                /*
                   Release as much memory as the process can.

                   The app is on the LRU list and the system is running low on memory.
                   The event raised indicates where the app sits within the LRU list.
                   If the event is TRIM_MEMORY_COMPLETE, the process will be one of
                   the first to be terminated.
                */

                break;

            default:
                /*
                  Release any non-critical data structures.

                  The app received an unrecognized memory level value
                  from the system. Treat this as a generic low-memory message.
                */
                break;
        }
    }
}
```
`onTrimMemory()`回调是在 Android 4.0（API 级别 14）中增加的。对于早期版本，你可以使用`onLowMemory()`回调来适配旧版本，该回调大致相当于`TRIM_MEMORY_COMPLETE`事件。

### 3) 检查你应该使用多少内存
为了允许多进程，Android 为每个应用分配的堆大小设置了一个强制限制。基于设备可用总体 RAM 数量，设备之间的确切的堆大小限制会有所不同。如果你的应用已达到堆容量并尝试分配更多内存，系统将抛出`OutOfMemoryError`。

为了避免内存不足，你可以向系统查询以确定当前设备上可用的堆空间。你可以通过调用`getMemoryInfo()`来查询系统的状态。这将返回一个`ActivityManager.MemoryInfo`对象，该对象提供有关设备当前内存状态的信息，包括可用内存，总内存和内存阈值（系统开始杀死进程的内存限制大小）。`ActivityManager.MemoryInfo`类还有一个布尔字段`lowMemory`以指示设备是否运行在内存不足的状态。

以下代码片段为在应用中使用`getMemoryInfo()`的示例。
```Java
public void doSomethingMemoryIntensive() {

    // Before doing something that requires a lot of memory,
    // check to see whether the device is in a low memory state.
    ActivityManager.MemoryInfo memoryInfo = getAvailableMemory();

    if (!memoryInfo.lowMemory) {
        // Do memory intensive work ...
    }
}

// Get a MemoryInfo object for the device's current memory status.
private ActivityManager.MemoryInfo getAvailableMemory() {
    ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
    ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
    activityManager.getMemoryInfo(memoryInfo);
    return memoryInfo;
}
```

## 第 2 部分：使用更多内存高效的代码构造
有一些 Android 功能、Java 类和代码结构往往比其他功能使用更多的内存。你可以通过在代码中选择更有效率的替代方案来减少你的应用使用的内存量。

### 1) 谨慎使用 Service
在不必要时运行 service 可能是 Android 应用内存管理中**最糟糕的错误之一**。如果你的应用需要在后台使用 service，除非它被触发并执行一个任务，否则其他时候 service 都应该是停止状态。并且记得在完成任务后停止 service。否则，你可能会无意中导致内存泄漏。

当你启动 service 时，系统会倾向为了保留这个 service 而一直保留 service 所在的进程。这使得进程的运行代价很高，因为 service 使用的 RAM 对其他进程是不可用的。这减少了系统可以存放到 LRU 缓存中的进程数量，从而降低了应用切换效率。当内存紧张到系统无法维护足够的进程来承载当前正在运行的所有 service 时，甚至可能导致系统内存使用不稳定。

一般应避免使用持久性 service，因为它们持续使用可用的内存。相应地，我们建议你使用其他实现方式，例如`JobScheduler` 。 关于如何使用`JobScheduler`调度后台进程的更多信息，请参阅: [Background Optimizations](https://developer.android.google.cn/topic/performance/background-optimization.html)。

如果你必须使用服务，则限制 service 使用寿命的最佳方法是使用`IntentService`，该 service 将在处理完交代给它的 Intent 任务之后尽快结束自己。有关更多信息，请参阅：[Running in a Background Service](https://developer.android.google.cn/training/run-background-service/index.html)。

### 2) 使用优化的数据容器
编程语言提供的一些类不会针对移动设备进行优化。例如，通常的 HashMap 的实现方式更加消耗内存，因为它需要一个额外的实例对象来记录 Mapping 操作。

Android Framework 包含了几个优化过的数据容器：`SparseArray`， `SparseBooleanArray`和`LongSparseArray`。 例如，`SparseArray`类更有效率，因为它们避免了对 key 与 value 的 autobox 自动装箱和因此产生的额外值（每个条目创建了另外一个对象或两个）。

如果需要，你可以随时切换到一个非常精简的数据结构的原始实现。

### 3) 注意代码“抽象”
开发人员通常将抽象简单地作为"好的编程实践"，因为抽象可以提高代码的灵活性和可维护性。然而，抽象成本很高：一般来说，它们需要相当多的代码用于执行，需要更多的时间和更多的 RAM 才能将该代码映射到内存中。所以如果你的抽象没有显著地提升效率，应该尽量避免他们。

例如，枚举通常需要静态常量两倍多的内存，你应该严格避免在 Android 上使用枚举。

### 4) 使用 nano protobufs 进行序列化数据
[Protocol buffers](https://developers.google.cn/protocol-buffers/docs/overview) 是由 Google 为序列化结构数据而设计的，一种语言无关、平台无关、具有良好扩展性的协议。它类似于 XML，但更轻量，快速，简单。如果你决定对你的数据使用 protobufs，则应始终在客户端代码中使用 nano protobufs。通常 protobuf 生成许多额外的代码，这可能会给你的应用带来各种问题，如增加 RAM 使用量，增加 APK 大小，减慢执行速度等。

有关更多信息，请参阅[protobuf readme](https://android.googlesource.com/platform/external/protobuf/+/master/java/README.txt)文件中的“Nano version”一节。

### 5) 避免内存流失(memory churn)
如前所述，GC 事件通常不会影响你的应用的性能。然而，短时间内大量 GC 事件可以快速消耗你的帧时间。系统花费在 GC 事件上的时间越多，它做其他的工作，如渲染或音频流的时间就越少。

通常，内存流失可能导致大量的 GC 事件发生。在实践中，内存流失的表现为在给定时间内产生分配临时对象的数量。

例如，你可能在`for`循环中分配多个临时对象。或者，你可能在视图的`onDraw()`函数内创建新的`Paint`或`Bitmap`对象。在这两种情况下，应用可能快速创建大量的对象。这将快速消耗可用内存，从而迫使 GC 事件发生。

当然，你需要在代码中找到内存流失高的位置，然后再修复它们。这可以使用[Analyze your RAM usage](https://developer.android.google.cn/topic/performance/memory.html#AnalyzeRam)中讨论的工具。

确定代码中的问题区域后，尝试减少性能关键区域内的内存分配数量。考虑将其从内部循环中移出或者将其移动到基于 [Factory](https://en.wikipedia.org/wiki/Factory_method_pattern) 的分配结构中。

## 第 3 部分：删除内存消耗多的资源和库
你的代码中的一些资源和库可能在你不知道的情况下消耗内存。你的 APK 的总体尺寸（包括第三方库或嵌入式资源）可能会影响应用消耗多少内存。你可以通过从代码中删除任何冗余的、不必要的或膨胀的组件、资源和库来减少应用的内存消耗。

### 1) 减少整体的 APK 大小
你可以通过减少应用的总体大小来显著降低应用的内存使用量。Bitmap 大小，资源，动画帧和第三方库都会影响你的 APK 的大小。Android Studio 和 Android SDK 提供多种工具来帮助你减少资源和外部依赖的大小。

关于如何减少整体 APK 大小的更多信息，请参阅：[Reduce APK Size](https://developer.android.google.cn/topic/performance/reduce-apk-size.html)。

### 2) 使用 Dagger 2 进行依赖注入
依赖注入框架可以简化你编写的代码，并提供可用于测试和其他可更改配置的自适应的环境。

如果你打算在应用中使用依赖注入框架，请考虑使用 [Dagger 2](http://google.github.io/dagger/)。Dagger 2不使用反射来扫描你的应用的代码。Dagger 2 实现在静态编译时，这意味着它可以在 Android 应用中使用，而无需耗费运行时或内存。

使用反射的其他依赖注入框架往往通过扫描代码来执行初始化操作。此过程可能需要更多的 CPU 周期和 RAM，并且在应用启动时可能会导致明显的卡顿。

### 3) 小心使用第三方库
第三方库代码通常都不是为移动网络环境而编写的，如果用于移动客户端上，可能工作时效率低下。当你决定使用第三方库时，可能需要针对移动设备优化。在决定使用它之前，可以根据代码大小和 RAM 占用空间进行必要的分析。

即便是一些针对移动设备优化的库也可能由于不同的实现而导致问题。例如，一个库可以使用 nano protobufs，而另一个库可以使用 micro protobufs，从而在你的应用中导致两种不同的 protobuf 实现。这种情况可能发生在使用不同的日志记录，分析，图像加载框架，缓存以及你不期望的许多其他事情上。

虽然 [ProGuard](https://developer.android.google.cn/tools/help/proguard.html) 可以通过使用正确的标志来删除 API 和资源，但它无法删除库的内部的大量依赖关系。你所需的库的功能可能需要更低级别的依赖。以下几种情况将突显出这个问题：使用 Activity 子类的库（这将趋向于具有大量的依赖关系）；当库使用反射（这是常见的，这意味着你需要花费大量的时间手动调整 ProGuard 才能使其起作用）等等。

同时要避免为了 1 个或者 2 个功能而导入整个库。你一定不想加入大量你甚至都不会使用到的代码。当你考虑是否使用库时，请查找与你的需求密切匹配的实现方案。否则，你可能需要考虑自己去实现。

更多关于使用这个技术的细节，请参考原文，链接如下。
<http://developer.android.com/training/articles/memory.html>
