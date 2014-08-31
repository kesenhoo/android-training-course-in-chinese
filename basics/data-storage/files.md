# 保存到文件

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/data-storage/files.html>

Android使用与其他平台类似的基于磁盘文件系统(disk-based file systems)。这节课会描述如何在Android文件系统上使用 [File](http://developer.android.com/reference/java/io/File.html) 的读写APIs。

File 对象非常适合用来读写那种流式顺序的数据。例如，很适合用来读写图片文件或者是网络中交换的数据。

这节课会演示在app中如何执行基本的文件操作任务。假定你已经对linux的文件系统与[java.io](http://developer.android.com/reference/java/io/package-summary.html)中标准的I/O APIs有一定认识。

## 存储在内部还是外部

所有的Android设备都有两个文件存储区域："internal" 与 "external" 存储。 那两个名称来自与早先的Android系统中，那个时候大多数的设备都内置了不可变的内存（internal storage)，然后再加上一个类似SD card（external storage）这样可以卸载的存储部件。后来有一些设备把"internal" 与 "external" 的部分都做成不可卸载的内置存储了，虽然如此，但是这一整块还是从逻辑上有被划分为"internal"与"external"的。只是现在不再以是否可以卸载来区分了。 下面列出了两者的区别：

* **Internal storage:**
	* 总是可用的
	* 这里的文件默认是只能被你的app所访问的。
	* 当用户卸载你的app的时候，系统会把internal里面的相关文件都清除干净。
	* Internal是在你想确保不被用户与其他app所访问的最佳存储区域。

* **External storage:**
	* 并不总是可用的，因为用户可以选择把这部分作为USB存储模式，这样就不可以访问了。
	* 是大家都可以访问的，因此保存到这里的文件是失去访问控制权限的。
	* 当用户卸载你的app时，系统仅仅会删除external根目录（<a href="http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String)">getExternalFilesDir()</a>）下的相关文件。
	* External是在你不需要严格的访问权限并且你希望这些文件能够被其他app所共享或者是允许用户通过电脑访问时的最佳存储区域。

> **Tip:** 尽管app是默认被安装到internal storage的，你还是可以通过在程序的manifest文件中声明[android:installLocation](http://developer.android.com/guide/topics/manifest/manifest-element.html#install) 属性来指定程序也可以被安装到external storage。当某个程序的安装文件很大，用户会倾向这个程序能够提供安装到external storage的选项。更多安装信息，请参考[App Install Location](http://developer.android.com/guide/topics/data/install-location.html)。

## 获取External存储的权限

为了写数据到external storage, 你必须在你的[manifest文件](http://developer.android.com/guide/topics/manifest/manifest-intro.html)中请求[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限：

```xml
<manifest ...>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    ...
</manifest>
```

> **Caution:**目前，所有的apps都可以在不指定某个专门的权限下做**读**external storage的动作。但是，这在以后的版本中会有所改变。如果你的app只需要**读**的权限(不是写), 那么你将需要声明 [READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE) 权限。为了确保你的app能持续地正常工作，你需要现在就声明读权限。
```xml
<manifest ...>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    ...
</manifest>
```
但是，如果你的程序有声明**读**的权限，那么就默认有了**写**的权限。

对于internal storage，你不需要声明任何权限，因为你的程序默认就有读写程序目录下的文件的权限。

## 保存到Internal Storage

当保存文件到internal storage时，你可以通过执行下面两个方法之一来获取合适的目录作为File的对象：

* <a href="http://developer.android.com/reference/android/content/Context.html#getFilesDir()">getFilesDir()</a> : 返回一个[File](http://developer.android.com/reference/java/io/File.html)，代表了你的app的internal目录。
* <a href="http://developer.android.com/reference/android/content/Context.html#getCacheDir()">getCacheDir()</a> : 返回一个[File](http://developer.android.com/reference/java/io/File.html)，代表了你的app的internal缓存目录。请确保这个目录下的文件在一旦不再需要的时候能够马上被删除，还有请给予一个合理的大小，例如1MB 。如果系统的内部存储空间不够，会自行选择删除缓存文件。为了在那些目录下创建一个新的文件，你可以使用<a href="http://developer.android.com/reference/java/io/File.html#File(java.io.File, java.lang.String)">File()</a> 构造器，如下：

```java
File file = new File(context.getFilesDir(), filename);
```

同样，你也可以执行<a href="http://developer.android.com/reference/android/content/Context.html#openFileOutput(java.lang.String, int)">openFileOutput()</a> 来获取一个 [FileOutputStream](http://developer.android.com/reference/java/io/FileOutputStream.html) 用来写文件到internal目录。如下：

```java
String filename = "myfile";
String string = "Hello world!";
FileOutputStream outputStream;

try {
  outputStream = openFileOutput(filename, Context.MODE_PRIVATE);
  outputStream.write(string.getBytes());
  outputStream.close();
} catch (Exception e) {
  e.printStackTrace();
}
```

如果，你需要缓存一些文件，你可以使用<a href="http://developer.android.com/reference/java/io/File.html#createTempFile(java.lang.String, java.lang.String)">createTempFile()</a>。例如：下面的方法从[URL](http://developer.android.com/reference/java/net/URL.html)中抽取了一个文件名，然后再创建了一个以这个文件名命名的文件。

```java
 public File getTempFile(Context context, String url) {
    File file;
    try {
        String fileName = Uri.parse(url).getLastPathSegment();
        file = File.createTempFile(fileName, null, context.getCacheDir());
    catch (IOException e) {
        // Error while creating file
    }
    return file;
}
```

> **Note:** 你的app的internal storage 目录是以你的app的包名作为标识存放在Android文件系统的特定目录下[data/data/com.example.xx]。 从技术上讲，如果你设置文件为可读的，那么其他app就可以读取你的internal文件。然而，其他app需要知道你的包名与文件名。若是你没有设置为可读或者可写，其他app是没有办法读写的。因此只要你使用[MODE_PRIVATE](http://developer.android.com/reference/android/content/Context.html#MODE_PRIVATE) ，那么这些文件就不可能被其他app所访问。

## 保存文件到External Storage

因为external storage可能是不可用的比如SD卡被拔出，那么你应该在访问之前去检查是否可用。你可以通过执行 <a href="http://developer.android.com/reference/android/os/Environment.html#getExternalStorageState()">getExternalStorageState()</a>来查询external storage的状态。如果返回的状态是[MEDIA_MOUNTED](http://developer.android.com/reference/android/os/Environment.html#MEDIA_MOUNTED), 那么你可以读写。示例如下：

```java
 /* Checks if external storage is available for read and write */
public boolean isExternalStorageWritable() {
    String state = Environment.getExternalStorageState();
    if (Environment.MEDIA_MOUNTED.equals(state)) {
        return true;
    }
    return false;
}

/* Checks if external storage is available to at least read */
public boolean isExternalStorageReadable() {
    String state = Environment.getExternalStorageState();
    if (Environment.MEDIA_MOUNTED.equals(state) ||
        Environment.MEDIA_MOUNTED_READ_ONLY.equals(state)) {
        return true;
    }
    return false;
}
```

尽管external storage对与用户与其他app是可修改的，那么你可能会保存下面两种类型的文件。

* **Public files** :这些文件对与用户与其他app来说是public的，当用户卸载你的app时，这些文件应该保留。例如，那些被你的app拍摄的图片或者下载的文件。
* **Private files**: 这些文件应该是被你的app所拥有的，它们应该在你的app被卸载时删除掉。尽管那些文件从技术上可以被用户与其他app所访问，实际上那些文件对于其他app是没有意义的。所以，当用户卸载你的app时，系统会删除你的app的private目录。例如，那些被你的app下载的缓存文件。

如果你想要保存文件为public形式的，请使用<a href="http://developer.android.com/reference/android/os/Environment.html#getExternalStoragePublicDirectory(java.lang.String)">getExternalStoragePublicDirectory()</a>方法来获取一个 File 对象来表示存储在external storage的目录。这个方法会需要你带有一个特定的参数来指定这些public的文件类型，以便于与其他public文件进行分类。参数类型包括[DIRECTORY_MUSIC](http://developer.android.com/reference/android/os/Environment.html#DIRECTORY_MUSIC) 或者 [DIRECTORY_PICTURES](http://developer.android.com/reference/android/os/Environment.html#DIRECTORY_PICTURES). 如下:

```java
public File getAlbumStorageDir(String albumName) {
    // Get the directory for the user's public pictures directory.
    File file = new File(Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_PICTURES), albumName);
    if (!file.mkdirs()) {
        Log.e(LOG_TAG, "Directory not created");
    }
    return file;
}
```

如果你想要保存文件为私有的方式，你可以通过执行<a href="http://developer.android.com/reference/android/content/Context.html#getExternalFilesDir(java.lang.String)">getExternalFilesDir()</a> 来获取相应的目录，并且传递一个指示文件类型的参数。每一个以这种方式创建的目录都会被添加到external storage封装你的app目录下的参数文件夹下（如下则是albumName）。这下面的文件会在用户卸载你的app时被系统删除。如下示例：

```java
public File getAlbumStorageDir(Context context, String albumName) {
    // Get the directory for the app's private pictures directory.
    File file = new File(context.getExternalFilesDir(
            Environment.DIRECTORY_PICTURES), albumName);
    if (!file.mkdirs()) {
        Log.e(LOG_TAG, "Directory not created");
    }
    return file;
}
```

如果刚开始的时候，没有预定义的子目录存放你的文件，你可以在 getExternalFilesDir()方法中传递`null`. 它会返回你的app在external storage下的private的根目录。

请记住，getExternalFilesDir() 方法会创建的目录会在app被卸载时被系统删除。如果你的文件想在app被删除时仍然保留，请使用getExternalStoragePublicDirectory().

不管你是使用 getExternalStoragePublicDirectory() 来存储可以共享的文件，还是使用 getExternalFilesDir() 来储存那些对与你的app来说是私有的文件，有一点很重要，那就是你要使用那些类似`DIRECTORY_PICTURES` 的API的常量。那些目录类型参数可以确保那些文件被系统正确的对待。例如，那些以`DIRECTORY_RINGTONES` 类型保存的文件就会被系统的media scanner认为是ringtone而不是音乐。

## 查询剩余空间

如果你事先知道你想要保存的文件大小，你可以通过执行<a href="http://developer.android.com/reference/java/io/File.html#getFreeSpace()">getFreeSpace()</a> or <a href="http://developer.android.com/reference/java/io/File.html#getTotalSpace()">getTotalSpace()</a> 来判断是否有足够的空间来保存文件，从而避免发生[IOException](http://developer.android.com/reference/java/io/IOException.html)。那些方法提供了当前可用的空间还有存储系统的总容量。

然而，系统并不能保证你可以写入通过`getFreeSpace()`查询到的容量文件， 如果查询的剩余容量比你的文件大小多几MB，或者说文件系统使用率还不足90%，这样则可以继续进行写的操作，否则你最好不要写进去。
> **Note：**你并没有被强制要求在写文件之前一定有要去检查剩余容量。你可以尝试先做写的动作，然后通过捕获 IOException 。这种做法仅适合于你事先并不知道你想要写的文件的确切大小。例如，如果在把PNG图片转换成JPEG之前，你并不知道最终生成的图片大小是多少。

## 删除文件

你应该在不需要使用某些文件的时候，删除它。删除文件最直接的方法是直接执行文件的`delete()`方法。

```java
myFile.delete();
```

如果文件是保存在internal storage，你可以通过`Context`来访问并通过执行`deleteFile()`进行删除

```java
myContext.deleteFile(fileName);
```

> **Note:** 当用户卸载你的app时，android系统会删除下面的文件：
* 所有保存到internal storage的文件。
* 所有使用getExternalFilesDir()方式保存在external storage的文件。

> 然而，通常来说，你应该手动删除所有通过 getCacheDir() 方式创建的缓存文件，还有那些不会再用到的文件。
