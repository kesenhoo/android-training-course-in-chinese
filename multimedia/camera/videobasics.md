# 简单的录像

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/camera/videobasics.html>

这节课会介绍如何使用现有的Camera程序来录制一个视频。

你的应用有自己的任务，整合视频只是其中的一小部分，你想要以最简单的方法录制视频，而不是重新发明一个摄像机。幸运的是，大多数Android设备已经有了一个能录制视频的camera应用。在这一节里，你让它为你做这件事。

## 请求相机权限(Request Camera Permission)

为了让别人知道你的应用依赖照相机，在你的manifest文件中添加`<uses-feature>`标签:

```xml
<manifest ... >
    <uses-feature android:name="android.hardware.camera"
                  android:required="true" />
    ...
</manifest>
```

如果你的程序并不需要一定有Camera，可以添加`android:required="false"` 的tag属性。这样的话，Google Play 会允许没有camera的设备下载这个程序。当然你有必要在使用Camera之前通过<a href="http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)">hasSystemFeature(PackageManager.FEATURE_CAMERA)</a>方法来检查设备上是否有Camera。如果没有，你应该关闭你的Camera相关的功能！

<!-- more -->

## 使用相机程序来录制视频(Record a Video with a Camera App)

Android中将动作委托给其他应用的方法是：启动一个Intent来完成你想要的动作。这个步骤包含三部分： Intent 本身，启动的外部 Activity, 与一些处理返回视频的代码。

这里是一个能广播录制视频intent的函数

```java
static final int REQUEST_VIDEO_CAPTURE = 1;

private void dispatchTakeVideoIntent() {
    Intent takeVideoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
    if (takeVideoIntent.resolveActivity(getPackageManager()) != null) {
        startActivityForResult(takeVideoIntent, REQUEST_VIDEO_CAPTURE);
    }
}
```

注意在调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>方法之前，先调用<a href="http://developer.android.com/reference/android/content/Intent.html#resolveActivity(android.content.pm.PackageManager)">resolveActivity()</a>，这个方法会返回能处理对应intent的活动组件(activity component)中的第一个activity(译注:就是检查有没有能处理这个intent的Activity)。执行这个检查非常必要，因为如果你调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>时，没有app能处理你的intent，你的app就会crash。所以只要返回值不为null，触发intent就是安全的。

## 查看视频(View the Video)

Android的Camera程序会把指向视频存储地址[Uri](http://developer.android.com/reference/android/net/Uri.html)添加到[Intent](http://developer.android.com/reference/android/content/Intent.html)中，并传送给[onActivityResult()](http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent))。下面的代码演示了取出这个视频并显示到VideoView。

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode == REQUEST_VIDEO_CAPTURE && resultCode == RESULT_OK) {
        Uri videoUri = intent.getData();
        mVideoView.setVideoURI(videoUri);
    }
}
```
