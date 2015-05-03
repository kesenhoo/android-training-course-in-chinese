# 轻松拍摄照片

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/camera/photobasics.html>

这节课将讲解如何使用已有的相机应用拍摄照片。

假设我们正在实现一个基于人群的气象服务，通过应用客户端拍下的天气图片汇聚在一起，可以组成全球气象图。整合图片只是应用的一小部分，我们想要通过最简单的方式获取图片，而不是重新设计并实现一个具有相机功能的组件。幸运的是，通常来说，大多数Android设备都已经安装了至少一款相机程序。在这节课中，我们会学习如何利用已有的相机应用拍摄照片。

## 请求使用相机权限

如果拍照是应用的必要功能，那么应该令它在Google Play中仅对有相机的设备可见。为了让用户知道我们的应用需要依赖相机，在Manifest清单文件中添加`<uses-feature>`标签:

```xml
 <manifest ... >
    <uses-feature android:name="android.hardware.camera"
                  android:required="true" />
    ...
</manifest>
```

如果我们的应用使用相机，但相机并不是应用的正常运行所必不可少的组件，可以将`android:required`设置为`"false"`。这样的话，Google Play 也会允许没有相机的设备下载该应用。当然我们有必要在使用相机之前通过调用<a href="http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)">hasSystemFeature(PackageManager.FEATURE_CAMERA)</a>方法来检查设备上是否有相机。如果没有，我们应该禁用和相机相关的功能！

## 使用相机应用程序进行拍照

利用一个描述了执行目的Intent对象，Android可以将某些执行任务委托给其他应用。整个过程包含三部分： Intent 本身，一个函数调用来启动外部的 Activity，当焦点返回到我们的Activity时，处理返回图像数据的代码。

下面的函数通过发送一个Intent来捕获照片：

```java
static final int REQUEST_IMAGE_CAPTURE = 1;

private void dispatchTakePictureIntent() {
    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
        startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    }
}
```

注意在调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>方法之前，先调用<a href="http://developer.android.com/reference/android/content/Intent.html#resolveActivity(android.content.pm.PackageManager)">resolveActivity()</a>，这个方法会返回能处理该Intent的第一个Activity（译注：即检查有没有能处理这个Intent的Activity）。执行这个检查非常重要，因为如果在调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>时，没有应用能处理你的Intent，应用将会崩溃。所以只要返回结果不为null，使用该Intent就是安全的。

## 获取缩略图

拍摄照片并不是应用的最终目的，我们还想要从相机应用那里取回拍摄的照片，并对它执行某些操作。

Android的相机应用会把拍好的照片编码为缩小的[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)，使用extra value的方式添加到返回的[Intent](http://developer.android.com/reference/android/content/Intent.html)当中，并传送给<a href="http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent)">onActivityResult()</a>，对应的Key为`"data"`。下面的代码展示的是如何获取这一图片并显示在[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)上。

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
        Bundle extras = data.getExtras();
        Bitmap imageBitmap = (Bitmap) extras.get("data");
        mImageView.setImageBitmap(imageBitmap);
    }
}
```

> **Note:** 这张从`"data"`中取出的缩略图适用于作为图标，但其他作用会比较有限。而处理一张全尺寸图片需要做更多的工作。

## 保存全尺寸照片

如果我们提供了一个File对象给Android的相机程序，它会保存这张全尺寸照片到给定的路径下。另外，我们必须提供存储图片所需要的含有后缀名形式的文件名。

一般而言，用户使用设备相机所拍摄的任何照片都应该被存放在设备的公共外部存储中，这样它们就能被所有的应用访问。将[DIRECTORY_PICTURES](http://developer.android.com/reference/android/os/Environment.html#DIRECTORY_PICTURES)作为参数，传递给<a href="http://developer.android.com/reference/android/os/Environment.html#getExternalStoragePublicDirectory(java.lang.String)">getExternalStoragePublicDirectory()</a>方法，可以返回适用于存储公共图片的目录。由于该方法提供的目录被所有应用共享，因此对该目录进行读写操作分别需要[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)和[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限。另外，因为写权限隐含了读权限，所以如果需要外部存储的写权限，那么仅仅需要请求一项权限就可以了：

```xml
<manifest ...>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    ...
</manifest>
```

然而，如果希望照片对我们的应用而言是私有的，那么可以使用<a href="http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String)">getExternalFilesDir()</a>提供的目录。在Android 4.3及以下版本的系统中，写这个目录需要[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限。从Android 4.4开始，该目录将无法被其他应用访问，所以该权限就不再需要了，你可以通过添加[maxSdkVersion](http://developer.android.com/guide/topics/manifest/uses-permission-element.html#maxSdk)属性，声明只在低版本的Android设备上请求这个权限。

```xml
<manifest ...>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                     android:maxSdkVersion="18" />
    ...
</manifest>
```

> **Note:** 所有存储在<a href="http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String)">getExternalFilesDir()</a>提供的目录中的文件会在用户卸载你的app后被删除。

一旦选定了存储文件的目录，我们还需要设计一个保证文件名不会冲突的命名规则。当然我们还可以将路径存储在一个成员变量里以备在将来使用。下面的例子使用日期时间戳作为新照片的文件名：

```java
String mCurrentPhotoPath;

private File createImageFile() throws IOException {
    // Create an image file name
    String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
    String imageFileName = "JPEG_" + timeStamp + "_";
    File storageDir = Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_PICTURES);
    File image = File.createTempFile(
        imageFileName,  /* prefix */
        ".jpg",         /* suffix */
        storageDir      /* directory */
    );

    // Save a file: path for use with ACTION_VIEW intents
    mCurrentPhotoPath = "file:" + image.getAbsolutePath();
    return image;
}
```

有了上面的方法，我们就可以给新照片创建文件对象了，现在我们可以像这样创建并触发一个[Intent](http://developer.android.com/reference/android/content/Intent.html)：

```java
static final int REQUEST_TAKE_PHOTO = 1;

private void dispatchTakePictureIntent() {
    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    // Ensure that there's a camera activity to handle the intent
    if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
        // Create the File where the photo should go
        File photoFile = null;
        try {
            photoFile = createImageFile();
        } catch (IOException ex) {
            // Error occurred while creating the File
            ...
        }
        // Continue only if the File was successfully created
        if (photoFile != null) {
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT,
                    Uri.fromFile(photoFile));
            startActivityForResult(takePictureIntent, REQUEST_TAKE_PHOTO);
        }
    }
}
```

## 将照片添加到相册中

由于我们通过Intent创建了一张照片，因此图片的存储位置我们是知道的。对其他人来说，也许查看我们的照片最简单的方式是通过系统的Media Provider。

> **Note:** 如果将图片存储在<a href="http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String)">getExternalFilesDir()</a>提供的目录中，Media Scanner将无法访问到我们的文件，因为它们隶属于应用的私有数据。

下面的例子演示了如何触发系统的Media Scanner，将我们的照片添加到Media Provider的数据库中，这样就可以使得Android相册程序与其他程序能够读取到这些照片。

```java
private void galleryAddPic() {
    Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
    File f = new File(mCurrentPhotoPath);
    Uri contentUri = Uri.fromFile(f);
    mediaScanIntent.setData(contentUri);
    this.sendBroadcast(mediaScanIntent);
}
```

## 解码一幅缩放图片

在有限的内存下，管理许多全尺寸的图片会很棘手。如果发现应用在展示了少量图片后消耗了所有内存，我们可以通过缩放图片到目标视图尺寸，之后再载入到内存中的方法，来显著降低内存的使用，下面的例子演示了这个技术：

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
