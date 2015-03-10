# 简单的拍照

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/camera/photobasics.html>

这节课解释了如何使用已有相机应用捕获图片。

假设你实现了一个众包的天气服务，通过把你的app客户端拍下的天气图片汇聚在一起组成全球气象图。整合图片只是你程序的一小部分。你想要最简单的动作来获取图片，而不是重新发明（reinvent）一个camera。幸运的是，大多数Android设备都已经至少安装了一款相机程序。在这节课中，你会学习如何拍照

<!-- more -->

## 请求使用相机权限(Request Camera Permission)

如果拍照是你的应用的必要功能，那么限制它在在Google Play中仅对有相机设备可见。为了让别人知道你的应用依赖照相机，在你的manifest文件中添加`<uses-feature>`标签:

```xml
 <manifest ... >
    <uses-feature android:name="android.hardware.camera" />
    ...
</manifest ... >
```

如果你的程序并不需要一定有Camera，可以添加`android:required="false"` 的tag属性。这样的话，Google Play 也会允许没有camera的设备下载这个程序。当然你有必要在使用Camera之前通过<a href="http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)">hasSystemFeature(PackageManager.FEATURE_CAMERA)</a>方法来检查设备上是否有Camera。如果没有，你应该关闭你的Camera相关的功能！

## 使用相机应用程序进行拍照(Take a Photo with the Camera App)

Android中将动作委托给其他应用的方法是：启动一个Intent来完成你想要的动作。这个步骤包含三部分： Intent 本身，启动的外部 Activity, 与一些处理返回照片的代码。

这是一个能发送捕获照片intent的函数

```java
static final int REQUEST_IMAGE_CAPTURE = 1;

private void dispatchTakePictureIntent(int actionCode) {
    Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
        startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    }
}
```

注意在调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>方法之前，先调用<a href="http://developer.android.com/reference/android/content/Intent.html#resolveActivity(android.content.pm.PackageManager)">resolveActivity()</a>，这个方法会返回能处理对应intent的活动组件(activity component)中的第一个activity(译注:就是检查有没有能处理这个intent的Activity)。执行这个检查非常必要，因为如果你调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>时，没有app能处理你的intent，你的app就会crash。所以只要返回值不为null，触发intent就是安全的

## 获取缩略图(Get the Thumbnail)

如果拍一张照片并不能满足你的app的雄心壮志，那么你可能想要从相机应用那里取回你的图片，并用它做些什么。

Android的Camera程序会把拍好的照片编码为缩小的[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)，使用extra value的方式添加到返回的[Intent](http://developer.android.com/reference/android/content/Intent.html)当中，并传送给[onActivityResult()](http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent))，对应的key为data。下面的代码取出了图片并使用一个[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)展示。

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

> **Note:** 这张从"data"中取出的缩略图可能适用于作为icon，但作用并不多。处理一张全尺寸图片需要做更多的工作。

## 保存全尺寸照片(Save the Full-size Photo)

如果你提供一个file对象给Android的Camera程序，它会保存这张全图到给定的路径下。你必须提供存储图片所需要的完全限定文件名(fully qualified file name)。

一般，任何用户使用设备相机捕获的图片应该被存放在设备的公共外部存储中，这样它们就能被所有的图片访问。通过传入[DIRECTORY_PICTURES](http://developer.android.com/reference/android/os/Environment.html#DIRECTORY_PICTURES)参数，[getExternalStoragePublicDirectory()](http://developer.android.com/reference/android/os/Environment.html#getExternalStoragePublicDirectory(java.lang.String))将返回存储公共图片的适当目录。因为这个方法提供的目录被所有app共享，读和写这个目录分别需要[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)和[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限。写权限隐式的声明了读权限，所以如果你需要外部存储的写权限，那么你仅仅需要请求一项权限：

```xml
<manifest ...>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    ...
</manifest>
```

然而，如果你需要图片为你的app私有，你可以使用[getExternalFilesDir()](http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String))提供的目录。在Android 4.3及以下的版本，写这个目录需要[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限。从Android 4.4开始，不再需要因为这个原因声明这个权限了。因为这个目录不能被其他app访问，所以你可以通过添加[maxSdkVersion](http://developer.android.com/guide/topics/manifest/uses-permission-element.html#maxSdk)属性，声明只在低版本的Android设备上请求这个权限。

```xml
<manifest ...>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                     android:maxSdkVersion="18" />
    ...
</manifest>
```

> **Note:** 所有存储在[getExternalFilesDir()](http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String))提供的目录中的文件会在用户卸载你的app后被删除。

一旦你选定了你的文件的目录，你需要创建一个不会冲突(collision-resistant)的文件名。你可能同样希望将路径存储在成员变量中以便以后使用。这是一个使用日期时间戳为新照片生成唯一文件名的范例解决方案：

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

有了上面的方法给新照片创建文件对象，你可以像这样创建并触发一个[Intent](http://developer.android.com/reference/android/content/Intent.html)：

```java
String mCurrentPhotoPath;
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

## 添加照片到相册(Add the Photo to a Gallery)

当你通过intent创建一张照片，你应该知道你的图片在哪，因为你决定将它存储在哪。对其他人来说，也许查看你的照片最简单的方式是通过系统的Media Provider。

> **Note:** 如果你将你的图片存储在[getExternalFilesDir()](http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String))提供的目录中，媒体扫描器(media scanner)不能访问到你的文件，因为它们是你的app私有的。

下面的例子演示了如何触发系统的Media Scanner来添加你的照片到Media Provider的数据库中，这样使得Android相册(Gallery)程序与其他程序能够读取到那些图片。

```java
private void galleryAddPic() {
    Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
    File f = new File(mCurrentPhotoPath);
    Uri contentUri = Uri.fromFile(f);
    mediaScanIntent.setData(contentUri);
    this.sendBroadcast(mediaScanIntent);
}
```

## 解码缩放图片(Decode a Scaled Image)

在有限的内存下，管理许多全尺寸的图片很棘手。如果你发现你的应用在展示了少量图片后消耗了所有内存，你可以通过缩放图片到目标视图尺寸，之后再载入内存中的方法，来显著降低内存的使用，下面的例子演示了这个技术：

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
