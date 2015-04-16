# 打印照片

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/printing/photos.html>

拍摄并分享照片是移动设备最流行的用法之一。如果我们的应用拍摄了照片，并期望可以展示他们，或者允许用户共享照片，那么我们就应该考虑让应用可以打印出这些照片来。[Android Support Library](http://developer.android.com/tools/support-library/index.html)提供了一个方便的函数，通过这一函数，仅仅使用很少量的代码和一些简单的打印布局配置集，就能够进行照片打印。

这堂课将展示如何使用v4 support library中的[PrintHelper](http://developer.android.com/reference/android/support/v4/print/PrintHelper.html)类打印一幅图片。

## 打印一幅图片

Android Support Library中的[PrintHelper](http://developer.android.com/reference/android/support/v4/print/PrintHelper.html)类提供了一种打印图片的简单方法。该类有一个单一的布局选项：<a href="http://developer.android.com/reference/android/support/v4/print/PrintHelper.html#setScaleMode(int)">setScaleMode()</a>，它允许我们使用下面的两个选项之一：
* [SCALE_MODE_FIT](http://developer.android.com/reference/android/support/v4/print/PrintHelper.html#SCALE_MODE_FIT)：该选项会调整图像的大小，这样整个图像就会在打印有效区域内全部显示出来（等比例缩放至长和宽都包含在纸张页面内）。
* [SCALE_MODE_FILL](http://developer.android.com/reference/android/support/v4/print/PrintHelper.html#SCALE_MODE_FILL)：该选项同样会等比例地调整图像的大小使图像充满整个打印有效区域，即让图像充满整个纸张页面。这就意味着如果选择这个选项，那么图片的一部分（顶部和底部，或者左侧和右侧）将无法打印出来。如果不设置图像的打印布局选项，该模式将是默认的图像拉伸方式。

这两个<a href="http://developer.android.com/reference/android/support/v4/print/PrintHelper.html#setScaleMode(int)">setScaleMode()</a>的图像布局选项都会保持图像原有的长宽比。下面的代码展示了如何创建一个[PrintHelper](http://developer.android.com/reference/android/support/v4/print/PrintHelper.html)类的实例，设置布局选项，并开始打印进程：

```java
private void doPhotoPrint() {
    PrintHelper photoPrinter = new PrintHelper(getActivity());
    photoPrinter.setScaleMode(PrintHelper.SCALE_MODE_FIT);
    Bitmap bitmap = BitmapFactory.decodeResource(getResources(),
            R.drawable.droids);
    photoPrinter.printBitmap("droids.jpg - test print", bitmap);
}
```

该方法可以作为一个菜单项的Action来被调用。注意对于那些不一定被设备支持的菜单项（比如有些设备可能无法支持打印），应该放置在“更多菜单（overflow menu）”中。要获取有关这方面的更多知识，可以阅读：[Action Bar](http://developer.android.com/design/patterns/actionbar.html)。

在<a href="http://developer.android.com/reference/android/support/v4/print/PrintHelper.html#printBitmap(java.lang.String, android.graphics.Bitmap)">printBitmap()</a>被调用之后，我们的应用就不再需要进行其他的操作了。之后Android打印界面就会出现，允许用户选择一个打印机和它的打印选项。用户可以打印图像或者取消这一次操作。如果用户选择了打印图像，那么一个打印任务将会被创建，同时在系统的通知栏中会显示一个打印提醒通知。

如果希望在打印输出中包含更多的内容，而不仅仅是一张图片，那么就必须构造一个打印文档。这方面知识将会在后面的两节课程中展开。
