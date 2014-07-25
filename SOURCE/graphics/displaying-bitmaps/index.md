> 编写:[kesenhoo](https://github.com/kesenhoo)，校对:

> 原文:<http://developer.android.com/training/displaying-bitmaps/index.html>

# 高效显示Bitmap

这一章节会介绍一些通用的用来处理与加载Bitmap对象的方法，这些技术能够使得不会卡到程序的UI并且避免程序消耗过度内存.如果你不注意这些，Bitmaps会迅速的消耗你可用的内存而导致程序crash,出现下面的异常:`java.lang.OutofMemoryError: bitmap size exceeds VM budget.`

有许多原因说明在你的Android程序中加载Bitmaps是非常棘手的，需要你特别注意:

* 移动设备的系统资源有限。Android设备对于单个程序至少需要16MB的内存。[Android Compatibility Definition Document (CDD)](http://source.android.com/compatibility/downloads.html), Section 3.7. Virtual Machine Compatibility 给出了对于不同大小与密度的屏幕的最低内存需求. 程序应该在这个最低内存限制下最优化程序的效率。当然，大多数设备的都有更高的限制需求.
* Bitmap会消耗很多内存，特别是对于类似照片等更加丰富的图片. 例如，Galaxy Nexus的照相机能够拍摄2592x1936 pixels (5 MB)的图片. 如果bitmap的配置是使用ARGB_8888 (the default from the Android 2.3 onward) ，那么加载这张照片到内存会大概需要19MB(`2592*1936*4` bytes) 的内存, 这样的话会迅速消耗掉设备的整个内存.
* Android app的UI通常会在一次操作中立即加载许多张bitmaps. 例如在ListView, GridView 与 ViewPager 等组件中通常会需要一次加载许多张bitmaps，而且需要多加载一些内容为了用户可能的滑动操作。

## Lessons
* [**Loading Large Bitmaps Efficiently:高效的加载大图**](load-bitmap.html)

  这节课会带领你学习如何解析很大的Bitmaps并且避免超出程序的内存限制。


* [**Processing Bitmaps Off the UI Thread:非UI线程处理Bitmaps**](process-bitmap.html)

  处理Bitmap(裁剪,下载等操作)不能执行在主线程。这节课会带领你学习如何使用AsyncTask在后台线程对Bitmap进行处理，并解释如何处理并发带来的问题。


* [**Caching Bitmaps:缓存Bitmap**](cache-bitmap.html)

  这节课会带领你学习如何使用内存与磁盘缓存来提升加载多张Bitmaps时的响应速度与流畅度。


* [**Managing Bitmap Memory:管理Bitmap占用的内存**](manage-bitmap-memory.html)

  这节课会介绍为了最大化程序的性能如何管理Bitmap的内存占用。


* [**Displaying Bitmaps in Your UI**](display-bitmap.html)

  这节课会把前面介绍的内容综合起来，演示如何在类似ViewPager与GridView的控件中使用后台线程与缓存进行加载多张Bitmaps。
