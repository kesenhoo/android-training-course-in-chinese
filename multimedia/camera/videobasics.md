# 轻松录制视频

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/camera/videobasics.html>

这节课会介绍如何使用已有的相机应用来录制视频。

假设在我们应用的所有功能当中，整合视频只是其中的一小部分，我们想要以最简单的方法录制视频，而不是重新实现一个摄像机组件。幸运的是，大多数Android设备已经安装了一个能录制视频的相机应用。在本节课当中，我们将会让它为我们完成这一任务。

## 请求相机权限

为了让用户知道我们的应用依赖照相机，在Manifest清单文件中添加`<uses-feature>`标签:

```xml
<manifest ... >
    <uses-feature android:name="android.hardware.camera"
                  android:required="true" />
    ...
</manifest>
```

如果应用使用相机，但相机并不是应用正常运行所必不可少的组件，可以将`android:required`设置为`"false"`。这样的话，Google Play 也会允许没有相机的设备下载该应用。当然我们有必要在使用相机之前通过调用<a href="http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)">hasSystemFeature(PackageManager.FEATURE_CAMERA)</a>方法来检查设备上是否有相机。如果没有，那么和相机相关的功能应该禁用！

## 使用相机程序来录制视频

利用一个描述了执行目的的Intent对象，Android可以将某些执行任务委托给其他应用。整个过程包含三部分： Intent 本身，一个函数调用来启动外部的 Activity，当焦点返回到Activity时，处理返回图像数据的代码。

下面的函数将会发送一个Intent来录制视频

```java
static final int REQUEST_VIDEO_CAPTURE = 1;

private void dispatchTakeVideoIntent() {
    Intent takeVideoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
    if (takeVideoIntent.resolveActivity(getPackageManager()) != null) {
        startActivityForResult(takeVideoIntent, REQUEST_VIDEO_CAPTURE);
    }
}
```

注意在调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>方法之前，先调用<a href="http://developer.android.com/reference/android/content/Intent.html#resolveActivity(android.content.pm.PackageManager)">resolveActivity()</a>，这个方法会返回能处理该Intent的第一个Activity（译注：即检查有没有能处理这个Intent的Activity）。执行这个检查非常重要，因为如果在调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>时，没有应用能处理你的Intent，应用将会崩溃。所以只要返回结果不为null，使用该Intent就是安全的。


## 查看视频

Android的相机程序会把指向视频存储地址的[Uri](http://developer.android.com/reference/android/net/Uri.html)添加到[Intent](http://developer.android.com/reference/android/content/Intent.html)中，并传送给<a href="http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent)">onActivityResult()</a>方法。下面的代码获取该视频并显示到一个VideoView当中：

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode == REQUEST_VIDEO_CAPTURE && resultCode == RESULT_OK) {
        Uri videoUri = intent.getData();
        mVideoView.setVideoURI(videoUri);
    }
}
```
