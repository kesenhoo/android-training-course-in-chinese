> 编写:[kesenhoo](https://github.com/kesenhoo)

> 校对:

# 简单的拍照

假设你想通过你的客户端程序实现一个聚合全球天气的地图，上面会有各地的当前天气图片。那么集合图片只是你程序的一部分。你想要最简单的动作来获取图片，而不是重新发明（reinvent）一个camera。幸运的是，大多数Android设备都已经至少安装了一款相机程序。在这节课中，你会学习，如何拍照

<!-- more -->

## Request Camera Permission(请求使用相机权限)
在写程序之前，需要在你的程序的manifest文件中添加下面的权限：

```xml
 <manifest ... >
    <uses-feature android:name="android.hardware.camera" />
    ...
</manifest ... >
```

如果你的程序并不需要一定有Camera，可以添加`android:required="false"` 的tag属性。这样的话，Google Play 也会允许没有camera的设备下载这个程序。当然你有必要在使用Camera之前通过hasSystemFeature(PackageManager.FEATURE_CAMERA)方法来检查设备上是否有Camera。如果没有，你应该关闭你的Camera相关的功能！

## Take a Photo with the Camera App(使用相机应用程序进行拍照]
Android中的方法是：启动一个Intent来完成你想要的动作。这个步骤包含三部分： Intent 本身，启动的外部 Activity, 与一些处理返回照片的代码。如：

```java
private void dispatchTakePictureIntent(int actionCode) {
    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    startActivityForResult(takePictureIntent, actionCode);
}
```

当然在发出Intent之前，你需要检查是否有app会来handle这个intent，否则会引起启动失败：

```java
public static boolean isIntentAvailable(Context context, String action) {
    final PackageManager packageManager = context.getPackageManager();
    final Intent intent = new Intent(action);
    List<ResolveInfo> list =
            packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
    return list.size() > 0;
}
```

## View the Photo(查看照片)
Android的Camera程序会把拍好的照片编码为bitmap，使用extra value的方式添加到返回的 Intent 当中， 对应的key为data。

```java
private void handleSmallCameraPhoto(Intent intent) {
    Bundle extras = intent.getExtras();
    mImageBitmap = (Bitmap) extras.get("data");
    mImageView.setImageBitmap(mImageBitmap);
}
```

**Note:** 这仅仅是处理一张很少的缩略图而已，如果是大的全图，需要做更多的事情来避免ANR。

## Save the Photo(保存照片)
如果你提供一个file对象给Android的Camera程序，它会保存这张全图到给定的路径下。你必须提供存储的卷名，文件夹名与文件名。对于2.2以上的系统，如下操作即可：

```java
storageDir = new File(
    Environment.getExternalStoragePublicDirectory(
        Environment.DIRECTORY_PICTURES
    ),
    getAlbumName()
);
```

## Set the file name(设置文件名)
正如上面描述的那样，文件的路径会有设备的系统环境决定。你自己需要做的只是定义个不会引起文件名冲突的命名scheme。下面会演示一种解决方案：

```java
private File createImageFile() throws IOException {
    // Create an image file name
    String timeStamp =
        new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
    String imageFileName = JPEG_FILE_PREFIX + timeStamp + "_";
    File image = File.createTempFile(
        imageFileName,
        JPEG_FILE_SUFFIX,
        getAlbumDir()
    );
    mCurrentPhotoPath = image.getAbsolutePath();
    return image;
}
```

## Append the file name onto the Intent(把文件名添加到网络上)
Once you have a place to save your image, pass that location to the camera application via the Intent.

```java
File f = createImageFile();
takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(f));
```

## Add the Photo to a Gallery(添加照片到相册)
对于大多数人来说，最简单查看你的照片的方式是通过系统的Media Provider。下面会演示如何触发系统的Media Scanner来添加你的照片到Media Provider的DB中，这样使得相册程序与其他程序能够读取到那些图片。

```java
private void galleryAddPic() {
    Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
    File f = new File(mCurrentPhotoPath);
    Uri contentUri = Uri.fromFile(f);
    mediaScanIntent.setData(contentUri);
    this.sendBroadcast(mediaScanIntent);
}
```

## Decode a Scaled Image(解码缩放图片)
在有限的内存下，管理全尺寸的图片会很麻烦。下面会介绍如何缩放图片来适应程序的显示：

```java
private void setPic() {
    // Get the dimensions of the View
    int targetW = mImageView.getWidth();
    int targetH = mImageView.getHeight();

    // Get the dimensions of the bitmap
    BitmapFactory.Options bmOptions = new BitmapFactory.Options();
    bmOptions.inJustDecodeBounds = true;
    BitmapFactory.decodeFile(mCurrentPhotoPath, bmOptions);
    int photoW = bmOptions.outWidth;
    int photoH = bmOptions.outHeight;

    // Determine how much to scale down the image
    int scaleFactor = Math.min(photoW/targetW, photoH/targetH);

    // Decode the image file into a Bitmap sized to fill the View
    bmOptions.inJustDecodeBounds = false;
    bmOptions.inSampleSize = scaleFactor;
    bmOptions.inPurgeable = true;

    Bitmap bitmap = BitmapFactory.decodeFile(mCurrentPhotoPath, bmOptions);
    mImageView.setImageBitmap(bitmap);
}
```

***
