# 管理应用的内存

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/articles/memory.html>

Random Access Memory(RAM)在任何软件开发环境中都是一个很宝贵的资源。这一点在物理内存通常很有限的移动操作系统上，显得尤为突出。尽管Android的Dalvik虚拟机扮演了常规的垃圾回收的角色，但这并不意味着你可以忽视app的内存分配与释放的时机与地点。

为了GC能够从app中及时回收内存，我们需要注意避免内存泄露(通常由于在全局成员变量中持有对象引用而导致)并且在适当的时机(下面会讲到的lifecycle callbacks)来释放引用对象。对于大多数app来说，Dalvik的GC会自动把离开活动线程的对象进行回收。

这篇文章会解释Android是如何管理app的进程与内存分配，以及在开发Android应用的时候如何主动的减少内存的使用。关于Java的资源管理机制，请参考其它书籍或者线上材料。如果你正在寻找如何分析你的内存使用情况的文章，请参考这里[Investigating Your RAM Usage](http://developer.android.com/tools/debugging/debugging-memory.html)。

## 第1部分: Android是如何管理内存的

Android并没有为内存提供交换区(Swap space)，但是它有使用[paging](http://en.wikipedia.org/wiki/Paging)与[memory-mapping(mmapping)](http://en.wikipedia.org/wiki/Memory-mapped_files)的机制来管理内存。这意味着任何你修改的内存(无论是通过分配新的对象还是去访问mmaped pages中的内容)都会贮存在RAM中，而且不能被paged out。因此唯一完整释放内存的方法是释放那些你可能hold住的对象的引用，当这个对象没有被任何其他对象所引用的时候，它就能够被GC回收了。只有一种例外是：如果系统想要在其他地方重用这个对象。

### 1) 共享内存

Android通过下面几个方式在不同的进程中来实现共享RAM:

* 每一个app的进程都是从一个被叫做**Zygote**的进程中fork出来的。Zygote进程在系统启动并且载入通用的framework的代码与资源之后开始启动。为了启动一个新的程序进程，系统会fork Zygote进程生成一个新的进程，然后在新的进程中加载并运行app的代码。这使得大多数的RAM pages被用来分配给framework的代码，同时使得RAM资源能够在应用的所有进程中进行共享。

* 大多数static的数据被mmapped到一个进程中。这不仅仅使得同样的数据能够在进程间进行共享，而且使得它能够在需要的时候被paged out。例如下面几种static的数据:
	* Dalvik 代码 (放在一个预链接好的 .odex 文件中以便直接mapping)
	* App resources (通过把资源表结构设计成便于mmapping的数据结构，另外还可以通过把APK中的文件做aligning的操作来优化)
	* 传统项目元素，比如 .so 文件中的本地代码.
* 在很多情况下，Android通过显式的分配共享内存区域(例如ashmem或者gralloc)来实现一些动态RAM区域能够在不同进程间进行共享。例如，window surfaces在app与screen compositor之间使用共享的内存，cursor buffers在content provider与client之间使用共享的内存。

关于如何查看app所使用的共享内存，请查看[Investigating Your RAM Usage](http://developer.android.com/tools/debugging/debugging-memory.html)

### 2) 分配与回收内存

这里有下面几点关于Android如何分配与回收内存的事实：

* 每一个进程的Dalvik heap都有一个受限的虚拟内存范围。这就是逻辑上讲的heap size，它可以随着需要进行增长，但是会有一个系统为它所定义的上限。
* 逻辑上讲的heap size和实际物理上使用的内存数量是不等的，Android会计算一个叫做Proportional Set Size(PSS)的值，它记录了那些和其他进程进行共享的内存大小。（假设共享内存大小是10M，一共有20个Process在共享使用，根据权重，可能认为其中有0.3M才能真正算是你的进程所使用的）
* Dalvik heap与逻辑上的heap size不吻合，这意味着Android并不会去做heap中的碎片整理用来关闭空闲区域。Android仅仅会在heap的尾端出现不使用的空间时才会做收缩逻辑heap size大小的动作。但是这并不是意味着被heap所使用的物理内存大小不能被收缩。在垃圾回收之后，Dalvik会遍历heap并找出不使用的pages，然后使用madvise(系统调用)把那些pages返回给kernal。因此，成对的allocations与deallocations大块的数据可以使得物理内存能够被正常的回收。然而，回收碎片化的内存则会使得效率低下很多，因为那些碎片化的分配页面也许会被其他地方所共享到。

### 3) 限制应用的内存

为了维持多任务的功能环境，Android为每一个app都设置了一个硬性的heap size限制。准确的heap size限制会因为不同设备的不同RAM大小而各有差异。如果你的app已经到了heap的限制大小并且再尝试分配内存的话，会引起`OutOfMemoryError`的错误。

在一些情况下，你也许想要查询当前设备的heap size限制大小是多少，然后决定cache的大小。可以通过`getMemoryClass()`来查询。这个方法会返回一个整数，表明你的应用的heap size限制是多少Mb(megabates)。

### 4) 切换应用

Android并不会在用户切换不同应用时候做交换内存的操作。Android会把那些不包含foreground组件的进程放到LRU cache中。例如，当用户刚开始启动了一个应用，系统会为它创建了一个进程，但是当用户离开这个应用，此进程并不会立即被销毁。系统会把这个进程放到cache中，如果用户后来再回到这个应用，此进程就能够被完整恢复，从而实现应用的快速切换。

如果你的应用中有一个被缓存的进程，这个进程会占用暂时不需要使用到的内存，这个暂时不需要使用的进程，它被保留在内存中，这会对系统的整体性能有影响。因此当系统开始进入低内存状态时，它会由系统根据LRU的规则与其他因素选择综合考虑之后决定杀掉某些进程，为了保持你的进程能够尽可能长久的被缓存，请参考下面的章节学习何时释放你的引用。

对于那些不在foreground的进程，Android是如何决定kill掉哪一类进程的问题，请参考[Processes and Threads](http://developer.android.com/guide/components/processes-and-threads.html).

## 第2部分: 你的应用该如何管理内存

你应该在开发过程的每一个阶段都考虑到RAM的有限性，甚至包括在开始编写代码之前的设计阶段就应该考虑到RAM的限制性。我们可以使用多种设计与实现方式，他们有着不同的效率，即使这些方式只是相同技术的不断组合与演变。

为了使得你的应用性能效率更高，你应该在设计与实现代码时，遵循下面的技术要点。

### 1) 珍惜Services资源

如果你的应用需要在后台使用service，除非它被触发并执行一个任务，否则其他时候service都应该是停止状态。另外需要注意当这个service完成任务之后因为停止service失败而引起的内存泄漏。

当你启动一个service，系统会倾向为了保留这个service而一直保留service所在的进程。这使得进程的运行代价很高，因为系统没有办法把service所占用的RAM空间腾出来让给其他组件，另外service还不能被paged out。这减少了系统能够存放到LRU缓存当中的进程数量，它会影响app之间的切换效率。它甚至会导致系统内存使用不稳定，从而无法继续保持住所有目前正在运行的service。

限制你的service的最好办法是使用[IntentService](http://developer.android.com/reference/android/app/IntentService.html)， 它会在处理完交代给它的intent任务之后尽快结束自己。更多信息，请阅读[Running in a Background Service](http://developer.android.com/training/run-background-service/index.html).

当一个Service已经不再需要的时候还继续保留它，这对Android应用的内存管理来说是**最糟糕的错误之一**。因此千万不要贪婪的使得一个Service持续保留。不仅仅是因为它会使得你的应用因为RAM空间的不足而性能糟糕，还会使得用户发现那些有着常驻后台行为的应用并且可能卸载它。

### 2) 当UI隐藏时释放内存

当用户切换到其它应用并且你的应用 UI不再可见时，你应该释放你的应用UI上所占用的所有内存资源。在这个时候释放UI资源可以显著的增加系统缓存进程的能力，它会对用户体验有着很直接的影响。

为了能够接收到用户离开你的UI时的通知，你需要实现Activtiy类里面的`onTrimMemory()`回调方法。你应该使用这个方法来监听到`TRIM_MEMORY_UI_HIDDEN`级别的回调，此时意味着你的UI已经隐藏，你应该释放那些仅仅被你的UI使用的资源。

请注意：你的应用仅仅会在所有UI组件的被隐藏的时候接收到`onTrimMemory()`的回调并带有参数`TRIM_MEMORY_UI_HIDDEN`。这与onStop()的回调是不同的，onStop会在activity的实例隐藏时会执行，例如当用户从你的app的某个activity跳转到另外一个activity时前面activity的onStop()会被执行。因此你应该实现onStop回调，并且在此回调里面释放activity的资源，例如释放网络连接，注销监听广播接收者。除非接收到[onTrimMemory(TRIM_MEMORY_UI_HIDDEN)](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#onTrimMemory(int))的回调，否者你不应该释放你的UI资源。这确保了用户从其他activity切回来时，你的UI资源仍然可用，并且可以迅速恢复activity。

### 3) 当内存紧张时释放部分内存

在你的app生命周期的任何阶段，onTrimMemory的回调方法同样可以告诉你整个设备的内存资源已经开始紧张。你应该根据onTrimMemory回调中的内存级别来进一步决定释放哪些资源。

* [TRIM_MEMORY_RUNNING_MODERATE](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#TRIM_MEMORY_RUNNING_MODERATE)：你的app正在运行并且不会被列为可杀死的。但是设备此时正运行于低内存状态下，系统开始触发杀死LRU Cache中的Process的机制。
* [TRIM_MEMORY_RUNNING_LOW](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#TRIM_MEMORY_RUNNING_LOW)：你的app正在运行且没有被列为可杀死的。但是设备正运行于更低内存的状态下，你应该释放不用的资源用来提升系统性能（但是这也会直接影响到你的app的性能）。
* [TRIM_MEMORY_RUNNING_CRITICAL](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#TRIM_MEMORY_RUNNING_CRITICAL)：你的app仍在运行，但是系统已经把LRU Cache中的大多数进程都已经杀死，因此你应该立即释放所有非必须的资源。如果系统不能回收到足够的RAM数量，系统将会清除所有的LRU缓存中的进程，并且开始杀死那些之前被认为不应该杀死的进程，例如那个包含了一个运行态Service的进程。

同样，当你的app进程正在被cached时，你可能会接受到从onTrimMemory()中返回的下面的值之一:

* [TRIM_MEMORY_BACKGROUND](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#TRIM_MEMORY_BACKGROUND): 系统正运行于低内存状态并且你的进程正处于LRU缓存名单中**最不容易杀掉的位置**。尽管你的app进程并不是处于被杀掉的高危险状态，系统可能已经开始杀掉LRU缓存中的其他进程了。你应该释放那些容易恢复的资源，以便于你的进程可以保留下来，这样当用户回退到你的app的时候才能够迅速恢复。
* [TRIM_MEMORY_MODERATE](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#TRIM_MEMORY_MODERATE): 系统正运行于低内存状态并且你的进程已经已经接近LRU名单的**中部位置**。如果系统开始变得更加内存紧张，你的进程是有可能被杀死的。
* [TRIM_MEMORY_COMPLETE](http://developer.android.com/reference/android/content/ComponentCallbacks2.html#TRIM_MEMORY_COMPLETE): 系统正运行与低内存的状态并且你的进程正处于LRU名单中**最容易被杀掉的位置**。你应该释放任何不影响你的app恢复状态的资源。

因为onTrimMemory()的回调是在**API 14**才被加进来的，对于老的版本，你可以使用[onLowMemory](http://developer.android.com/reference/android/content/ComponentCallbacks.html#onLowMemory())回调来进行兼容。onLowMemory相当与`TRIM_MEMORY_COMPLETE`。

> **Note:** 当系统开始清除LRU缓存中的进程时，尽管它首先按照LRU的顺序来操作，但是它同样会考虑进程的内存使用量。因此消耗越少的进程则越容易被留下来。

### 4) 检查你应该使用多少的内存

正如前面提到的，每一个Android设备都会有不同的RAM总大小与可用空间，因此不同设备为app提供了不同大小的heap限制。你可以通过调用[getMemoryClass()](http://developer.android.com/reference/android/app/ActivityManager.html#getMemoryClass())来获取你的app的可用heap大小。如果你的app尝试申请更多的内存，会出现`OutOfMemory`的错误。

在一些特殊的情景下，你可以通过在manifest的application标签下添加`largeHeap=true`的属性来声明一个更大的heap空间。如果你这样做，你可以通过[getLargeMemoryClass()](http://developer.android.com/reference/android/app/ActivityManager.html#getLargeMemoryClass())来获取到一个更大的heap size。

然而，能够获取更大heap的设计本意是为了一小部分会消耗大量RAM的应用(例如一个大图片的编辑应用)。**不要轻易的因为你需要使用大量的内存而去请求一个大的heap size。**只有当你清楚的知道哪里会使用大量的内存并且为什么这些内存必须被保留时才去使用large heap. 因此请尽量少使用large heap。使用额外的内存会影响系统整体的用户体验，并且会使得GC的每次运行时间更长。在任务切换时，系统的性能会变得大打折扣。

另外, large heap并不一定能够获取到更大的heap。在某些有严格限制的机器上，large heap的大小和通常的heap size是一样的。因此即使你申请了large heap，你还是应该通过执行getMemoryClass()来检查实际获取到的heap大小。

### 5) 避免bitmaps的浪费

当你加载一个bitmap时，仅仅需要保留适配当前屏幕设备分辨率的数据即可，如果原图高于你的设备分辨率，需要做缩小的动作。请记住，增加bitmap的尺寸会对内存呈现出2次方的增加，因为X与Y都在增加。

> **Note:**在Android 2.3.x (API level 10)及其以下, bitmap对象的pixel data是存放在native内存中的，它不便于调试。然而，从Android 3.0(API level 11)开始，bitmap pixel data是分配在你的app的Dalvik heap中, 这提升了GC的工作效率并且更加容易Debug。因此如果你的app使用bitmap并在旧的机器上引发了一些内存问题，切换到3.0以上的机器上进行Debug。

### 6) 使用优化的数据容器

利用Android Framework里面优化过的容器类，例如[SparseArray](http://developer.android.com/reference/android/util/SparseArray.html), [SparseBooleanArray](http://developer.android.com/reference/android/util/SparseBooleanArray.html), 与 [LongSparseArray](http://developer.android.com/reference/android/support/v4/util/LongSparseArray.html)。 通常的HashMap的实现方式更加消耗内存，因为它需要一个额外的实例对象来记录Mapping操作。另外，SparseArray更加高效在于他们避免了对key与value的autobox自动装箱，并且避免了装箱后的解箱。

### 7) 请注意内存开销

对你所使用的语言与库的成本与开销有所了解，从开始到结束，在设计你的app时谨记这些信息。通常，表面上看起来无关痛痒(innocuous)的事情也许实际上会导致大量的开销。例如：

* Enums的内存消耗通常是static constants的2倍。你应该尽量避免在Android上使用enums。
* 在Java中的每一个类(包括匿名内部类)都会使用大概500 bytes。
* 每一个类的实例花销是12-16 bytes。
* 往HashMap添加一个entry需要额一个额外占用的32 bytes的entry对象。

### 8) 请注意代码“抽象”

通常，开发者使用抽象作为"好的编程实践"，因为抽象能够提升代码的灵活性与可维护性。然而，抽象会导致一个显著的开销：通常他们需要同等量的代码用于可执行。那些代码会被map到内存中。因此如果你的抽象没有显著的提升效率，应该尽量避免他们。

### 9) 为序列化的数据使用nano protobufs

[Protocol buffers](https://developers.google.com/protocol-buffers/docs/overview)是由Google为序列化结构数据而设计的，一种语言无关，平台无关，具有良好扩展性的协议。类似XML，却比XML更加轻量，快速，简单。如果你需要为你的数据实现协议化，你应该在客户端的代码中总是使用nano protobufs。通常的协议化操作会生成大量繁琐的代码，这容易给你的app带来许多问题：增加RAM的使用量，显著增加APK的大小，更慢的执行速度，更容易达到DEX的字符限制。

关于更多细节，请参考[protobuf readme](https://android.googlesource.com/platform/external/protobuf/+/master/java/README.txt)的"Nano version"章节。

### 10) 避免使用依赖注入框架

使用类似[Guice](https://code.google.com/p/google-guice/)或者[RoboGuice](https://github.com/roboguice/roboguice)等framework injection包是很有效的，因为他们能够简化你的代码。

> Notes：RoboGuice 2 通过依赖注入改变代码风格，让Android开发时的体验更好。你在调用 `getIntent().getExtras()` 时经常忘记检查 null 吗？RoboGuice 2 可以帮你做。你认为将 `findViewById()` 的返回值强制转换成 TextView 是本不必要的工作吗？ RoboGuice 2 可以帮你。RoboGuice 把这些需要猜测性的工作移到Android开发以外去了。RoboGuice 2 会负责注入你的 View, Resource, System Service或者其他对象等等类似的细节。

然而，那些框架会通过扫描你的代码执行许多初始化的操作，这会导致你的代码需要大量的RAM来mapping代码，而且mapped pages会长时间的被保留在RAM中。

### 11) 谨慎使用第三方libraries

很多开源的library代码都不是为移动网络环境而编写的，如果运用在移动设备上，，这样的效率并不高。当你决定使用一个第三方library的时候，你应该针对移动网络做繁琐的迁移与维护的工作。

即使是针对Android而设计的library，也可能是很危险的，因为每一个library所做的事情都是不一样的。例如，其中一个lib使用的是nano protobufs, 而另外一个使用的是micro protobufs。那么这样，在你的app里面就有2种protobuf的实现方式。这样的冲突同样可能发生在输出日志，加载图片，缓存等等模块里面。

同样不要陷入为了1个或者2个功能而导入整个library的陷阱。如果没有一个合适的库与你的需求相吻合，你应该考虑自己去实现，而不是导入一个大而全的解决方案。

### 12) 优化整体性能

官方有列出许多优化整个app性能的文章：[Best Practices for Performance](http://developer.android.com/training/best-performance.html)。这篇文章就是其中之一。有些文章是讲解如何优化app的CPU使用效率，有些是如何优化app的内存使用效率。

你还应该阅读[optimizing your UI](http://developer.android.com/tools/debugging/debugging-ui.html)来为layout进行优化。同样还应该关注lint工具所提出的建议，进行优化。

### 13) 使用ProGuard来剔除不需要的代码

[ProGuard](http://developer.android.com/tools/help/proguard.html)能够通过移除不需要的代码，重命名类，域与方法等方对代码进行压缩，优化与混淆。使用ProGuard可以使得你的代码更加紧凑，这样能够使用更少mapped代码所需要的RAM。

### 14) 对最终的APK使用zipalign

在编写完所有代码，并通过编译系统生成APK之后，你需要使用[zipalign](http://developer.android.com/tools/help/zipalign.html)对APK进行重新校准。如果你不做这个步骤，会导致你的APK需要更多的RAM，因为一些类似图片资源的东西不能被mapped。

> **Notes: **Google Play不接受没有经过zipalign的APK。

### 15) 分析你的RAM使用情况

一旦你获取到一个相对稳定的版本后，需要分析你的app整个生命周期内使用的内存情况，并进行优化，更多细节请参考[Investigating Your RAM Usage](http://developer.android.com/tools/debugging/debugging-memory.html).

### 16) 使用多进程

如果合适的话，有一个更高级的技术可以帮助你的app管理内存使用：通过把你的app组件切分成多个组件，运行在不同的进程中。这个技术必须谨慎使用，大多数app都不应该运行在多个进程中。因为如果使用不当，它会显著增加内存的使用，而不是减少。当你的app需要在后台运行与前台一样的大量的任务的时候，可以考虑使用这个技术。

一个典型的例子是创建一个可以长时间后台播放的Music Player。如果整个app运行在一个进程中，当后台播放的时候，前台的那些UI资源也没有办法得到释放。类似这样的app可以切分成2个进程：一个用来操作UI，另外一个用来后台的Service.

你可以通过在manifest文件中声明'android:process'属性来实现某个组件运行在另外一个进程的操作。

```xml
<service android:name=".PlaybackService"
         android:process=":background" />
```

更多关于使用这个技术的细节，请参考原文，链接如下。
<http://developer.android.com/training/articles/memory.html>
