# 发送文件给其他设备

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/beam-files/sending-files.html>

这节课将展示如何通过Android Beam文件传输向另一台设备发送大文件。要发送文件，首先应声明使用NFC和外部存储的权限，我们需要测试一下自己的设备是否支持NFC，这样才能够将文件的URI提供给Android Beam文件传输。

使用Android Beam文件传输功能必须满足以下要求：

1. Android Beam文件传输功能传输大文件必须在Android 4.1（API Level 16）及以上版本的Android系统中使用。
2. 希望传送的文件必须放置于外部存储。更多关于外部存储的知识，请参考：[Using the External Storage](http://developer.android.com/guide/topics/data/data-storage.html#filesExternal)。
3. 希望传送的文件必须是全局可读的。我们可以通过<a href="http://developer.android.com/reference/java/io/File.html#setReadable(boolean)">File.setReadable(true,false)</a>来为文件设置相应的读权限。
4. 必须提供待传输文件的File URI。Android Beam文件传输无法处理由<a href="http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile(android.content.Context, java.lang.String, java.io.File)">FileProvider.getUriForFile</a>生成的Content URI。

## 在清单文件中声明

首先，编辑Manifest清单文件来声明应用程序所需要的权限和功能。

### 声明权限

为了允许应用程序使用Android Beam文件传输控制NFC从外部存储发送文件，必须在应用程序的Manifest清单文件中声明下面的权限：

#### [NFC](http://developer.android.com/reference/android/Manifest.permission.html#NFC)
允许应用程序通过NFC发送数据。为声明该权限，要添加下面的标签作为一个[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签：

```xml
<uses-permission android:name="android.permission.NFC" />
```

#### [READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)
允许应用读取外部存储。为声明该权限，要添加下面的标签作为一个[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签：

```xml
<uses-permission
            android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

> **Note：**对于Android 4.2.2（API Level 17）及之前版本的系统，这个权限不是必需的。在后续版本的系统中，若应用程序需要读取外部存储，可能会需要申明该权限。为保证将来程序稳定性，建议在该权限申明变成必需的之前，先在清单文件中声明。

### 指定NFC功能

通过添加[`<uses-feature>`](http://developer.android.com/guide/topics/manifest/uses-feature-element.html)标签作为一个[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签，指定我们的应用程序使用NFC。设置`android:required`属性字段为`true`，使得我们的应用程序只有在NFC可以使用时才能运行。

下面的代码展示了如何指定[`<uses-feature>`](http://developer.android.com/guide/topics/manifest/uses-feature-element.html)标签：

```xml
<uses-feature
    android:name="android.hardware.nfc"
    android:required="true" />
```

注意，如果应用程序将NFC作为一个可选的功能，期望在NFC不可使用时程序还能继续执行，我们就应该将`android:required`属性字段设为`false`，然后在代码中测试NFC的可用性。

### 指定Android Beam文件传输

由于Android Beam文件传输只能在Android 4.1（API Level 16）及以上的平台使用，如果应用将Android Beam文件传输作为一个不可缺少的核心模块，那么我们必须指定[`<uses-sdk>`](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html)标签为：[android:minSdkVersion](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html#min)="16"。或者可以将[android:minSdkVersion](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html#min)设置为其它值，然后在代码中测试平台版本，这部分内容将在下一节中展开。

## 测试设备是否支持Android Beam文件传输

应使用以下标签使得在Manifest清单文件中指定NFC是可选的：

```xml
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

如果设置了[android:required](http://developer.android.com/guide/topics/manifest/uses-feature-element.html#required)="false"，则我们必须在代码中测试设备是否支持NFC和Android Beam文件传输。

为在代码中测试是否支持Android Beam文件传输，我们先通过<a href="http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)">PackageManager.hasSystemFeature()</a>和参数[FEATURE_NFC](http://developer.android.com/reference/android/content/pm/PackageManager.html#FEATURE_NFC)测试设备是否支持NFC。下一步，通过[SDK_INT](http://developer.android.com/reference/android/os/Build.VERSION.html#SDK_INT)的值测试系统版本是否支持Android Beam文件传输。如果设备支持Android Beam文件传输，那么获得一个NFC控制器的实例，它能允许我们与NFC硬件进行通信，如下所示：

```java
public class MainActivity extends Activity {
    ...
    NfcAdapter mNfcAdapter;
    // Flag to indicate that Android Beam is available
    boolean mAndroidBeamAvailable  = false;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // NFC isn't available on the device
        if (!PackageManager.hasSystemFeature(PackageManager.FEATURE_NFC)) {
            /*
             * Disable NFC features here.
             * For example, disable menu items or buttons that activate
             * NFC-related features
             */
            ...
        // Android Beam file transfer isn't supported
        } else if (Build.VERSION.SDK_INT <
                Build.VERSION_CODES.JELLY_BEAN_MR1) {
            // If Android Beam isn't available, don't continue.
            mAndroidBeamAvailable = false;
            /*
             * Disable Android Beam file transfer features here.
             */
            ...
        // Android Beam file transfer is available, continue
        } else {
        mNfcAdapter = NfcAdapter.getDefaultAdapter(this);
        ...
        }
    }
    ...
}
```

## 创建一个提供文件的回调函数

一旦确认了设备支持Android Beam文件传输，那么可以添加一个回调函数，当Android Beam文件传输监测到用户希望向另一个支持NFC的设备发送文件时，系统就会调用该函数。在该回调函数中，返回一个[Uri](http://developer.android.com/reference/android/net/Uri.html)对象数组，Android Beam文件传输会将URI对应的文件拷贝给要接收这些文件的设备。

要添加这个回调函数，需要实现[NfcAdapter.CreateBeamUrisCallback](http://developer.android.com/reference/android/nfc/NfcAdapter.CreateBeamUrisCallback.html)接口，和它的方法：<a href="http://developer.android.com/reference/android/nfc/NfcAdapter.CreateBeamUrisCallback.html#createBeamUris(android.nfc.NfcEvent)">createBeamUris()</a>，下面是一个例子：

```java
public class MainActivity extends Activity {
    ...
    // List of URIs to provide to Android Beam
    private Uri[] mFileUris = new Uri[10];
    ...
    /**
     * Callback that Android Beam file transfer calls to get
     * files to share
     */
    private class FileUriCallback implements
            NfcAdapter.CreateBeamUrisCallback {
        public FileUriCallback() {
        }
        /**
         * Create content URIs as needed to share with another device
         */
        @Override
        public Uri[] createBeamUris(NfcEvent event) {
            return mFileUris;
        }
    }
    ...
}
```

一旦实现了这个接口，通过调用<a href="http://developer.android.com/reference/android/nfc/NfcAdapter.html#setBeamPushUrisCallback(android.nfc.NfcAdapter.CreateBeamUrisCallback, android.app.Activity)">setBeamPushUrisCallback()</a>将回调函数提供给Android Beam文件传输。下面是一个例子：

```java
public class MainActivity extends Activity {
    ...
    // Instance that returns available files from this app
    private FileUriCallback mFileUriCallback;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Android Beam file transfer is available, continue
        ...
        mNfcAdapter = NfcAdapter.getDefaultAdapter(this);
        /*
         * Instantiate a new FileUriCallback to handle requests for
         * URIs
         */
        mFileUriCallback = new FileUriCallback();
        // Set the dynamic callback for URI requests.
        mNfcAdapter.setBeamPushUrisCallback(mFileUriCallback,this);
        ...
    }
    ...
}
```

> **Note：**我们也可以将[Uri](http://developer.android.com/reference/android/net/Uri.html)对象数组通过应用程序的[NfcAdapter](http://developer.android.com/reference/android/nfc/NfcAdapter.html)实例，直接提供给NFC框架。如果能在NFC触碰事件发生之前，定义这些URI，那么可以选择使用这个方法。更多关于这个方法的知识，请参考：<a href="http://developer.android.com/reference/android/nfc/NfcAdapter.html#setBeamPushUris(android.net.Uri[], android.app.Activity)">NfcAdapter.setBeamPushUris()</a>。

## 指定要发送的文件
为了将一或多个文件发送给其他支持NFC的设备，需要为每一个文件获取一个File URI（一个具有文件格式（file scheme）的URI），然后将它们添加至一个[Uri](http://developer.android.com/reference/android/net/Uri.html)对象数组中。此外，要传输一个文件，我们必须也拥有该文件的读权限。下例展示了如何根据文件名获取其File URI，然后将URI添加至数组当中：

```java
    /*
     * Create a list of URIs, get a File,
     * and set its permissions
     */
    private Uri[] mFileUris = new Uri[10];
    String transferFile = "transferimage.jpg";
    File extDir = getExternalFilesDir(null);
    File requestFile = new File(extDir, transferFile);
    requestFile.setReadable(true, false);
    // Get a URI for the File and add it to the list of URIs
    fileUri = Uri.fromFile(requestFile);
    if (fileUri != null) {
        mFileUris[0] = fileUri;
    } else {
        Log.e("My Activity", "No File URI available for file.");
    }
```
