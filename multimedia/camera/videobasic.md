# 简单的录像

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/camera/videobasics.html>

这节课会介绍如何使用现有的Camera程序来录制一个视频。和拍照一样，我们没有必要去重新发明录像程序。大多数的Android程序都有自带Camera来进行录像。(*这一课的内容大多数与前面一课类似，简要带过，一些细节不赘述了*)

## Request Camera Permission [请求权限]

```xml
<manifest ... >
    <uses-feature android:name="android.hardware.camera" />
    ...
</manifest ... >
```

与上一课的拍照一样，你可以在启动Camera之前，使用hasSystemFeature(PackageManager.FEATURE_CAMERA).来检查是否存在Camera。

<!-- more -->

## Record a Video with a Camera App(使用相机程序来录制视频)

```java
private void dispatchTakeVideoIntent() {
    Intent takeVideoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
    startActivityForResult(takeVideoIntent, ACTION_TAKE_VIDEO);
}
public static boolean isIntentAvailable(Context context, String action) {
    final PackageManager packageManager = context.getPackageManager();
    final Intent intent = new Intent(action);
    List<ResolveInfo> list =
        packageManager.queryIntentActivities(intent,
            PackageManager.MATCH_DEFAULT_ONLY);
    return list.size() > 0;
}
```

## View the Video(查看视频)
Android的Camera程序会把拍好的视频地址返回。下面的代码演示了，如何查询到这个视频并显示到VideoView.

```java
private void handleCameraVideo(Intent intent) {
    mVideoUri = intent.getData();
    mVideoView.setVideoURI(mVideoUri);
}
```
