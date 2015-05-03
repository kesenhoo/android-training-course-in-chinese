# 高效显示Bitmap

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/displaying-bitmaps/index.html>

这一章节会介绍一些处理与加载[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)对象的常用方法，这些技术能够使得程序的UI不会被阻塞，并且可以避免程序超出内存限制。如果我们不注意这些，Bitmaps会迅速的消耗掉可用内存从而导致程序崩溃，出现下面的异常:`java.lang.OutofMemoryError: bitmap size exceeds VM budget.`

在Android应用中加载Bitmaps的操作是需要特别小心处理的，有下面几个方面的原因:

* 移动设备的系统资源有限。Android设备对于单个程序至少需要16MB的内存。[Android Compatibility Definition Document (CDD)](http://source.android.com/compatibility/downloads.html), Section 3.7. Virtual Machine Compatibility 中给出了对于不同大小与密度的屏幕的最低内存需求。 应用应该在这个最低内存限制下去优化程序的效率。当然，大多数设备的都有更高的限制需求。
* Bitmap会消耗很多内存，特别是对于类似照片等内容更加丰富的图片。 例如，[Galaxy Nexus](http://www.android.com/devices/detail/galaxy-nexus)的照相机能够拍摄2592x1936 pixels (5 MB)的图片。 如果bitmap的图像配置是使用[ARGB_8888](http://developer.android.com/reference/android/graphics/Bitmap.Config.html) (从Android 2.3开始的默认配置) ，那么加载这张照片到内存大约需要19MB(`2592*1936*4` bytes) 的空间，从而迅速消耗掉该应用的剩余内存空间。
* Android应用的UI通常会在一次操作中立即加载许多张bitmaps。 例如在[ListView](http://developer.android.com/reference/android/widget/ListView.html), [GridView](http://developer.android.com/reference/android/widget/GridView.html) 与 [ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) 等控件中通常会需要一次加载许多张bitmaps，而且需要预先加载一些没有在屏幕上显示的内容，为用户滑动的显示做准备。

## 参考资料

* [DEMO：DisplayingBitmaps.zip](http://developer.android.com/downloads/samples/DisplayingBitmaps.zip)
* [VEDIO：Bitmap Allocation](http://www.youtube.com/watch?v=rsQet4nBVi8)
* [VEDIO：Making App Beautiful - Part 4 - Performance Tuning](http://www.youtube.com/watch?v=pMRnGDR6Cu0)


## 章节课程

* [**高效的加载大图(Loading Large Bitmaps Efficiently)**](load-bitmap.html)

  这节课会带领你学习如何解析很大的Bitmaps并且避免超出程序的内存限制。


* [**非UI线程处理Bitmap(Processing Bitmaps Off the UI Thread)**](process-bitmap.html)

  处理Bitmap（裁剪，下载等操作）不能执行在主线程。这节课会带领你学习如何使用AsyncTask在后台线程对Bitmap进行处理，并解释如何处理并发带来的问题。


* [**缓存Bitmaps(Caching Bitmaps)**](cache-bitmap.html)

  这节课会带领你学习如何使用内存与磁盘缓存来提升加载多张Bitmaps时的响应速度与流畅度。


* [**管理Bitmap的内存使用(Managing Bitmap Memory)**](manage-memory.html)

  这节课会介绍如何管理Bitmap的内存占用，以此来提升程序的性能。


* [**在UI上显示Bitmap(Displaying Bitmaps in Your UI)**](display-bitmap.html)

  这节课会综合之前章节的内容，演示如何在诸如[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)与[GridView](http://developer.android.com/reference/android/widget/GridView.html)等控件中使用后台线程与缓存加载多张Bitmaps。
