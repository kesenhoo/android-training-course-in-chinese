# 发送文件给其他设备

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/beam-files/sending-files.html>

这节课将向你展示如何通过Android Beam文件传输向另一台设备发送大文件。要发送文件，首先需要声明使用NFC和外部存储的权限，你需要测试一下你的设备是否支持NFC，这样，你才能够向Android Beam文件传输提供文件的URI。

使用Android Beam文件传输功能有下列要求：

1. Android Beam文件传输功能只能在Android 4.1（API Level 16）及以上使用。
2. 你希望传送的文件必须放置于外部存储。学习更多关于外部存储的知识，可以阅读：[Using the External Storage](http://developer.android.com/guide/topics/data/data-storage.html#filesExternal)。
3. 每个你希望传送的文件必须是全局可读的。你可以通过[File.setReadable(true,false)](http://developer.android.com/reference/java/io/File.html#setReadable(boolean))来为文件设置相应的读权限。
4. 你必须提供你要传输文件的URI。Android Beam文件传输无法处理由[FileProvider.getUriForFile](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile(android.content.Context, java.lang.String, java.io.File))生成的URI。

## 在清单文件中声明权限和功能

首先，编辑你的清单文件来声明你的应用所需要声明的权限和功能。

### 声明权限

为了允许你的应用使用Android Beam文件传输控制NFC从外部存储发送文件，你必须在你的应用清单声明下面的权限：

#### [NFC](http://developer.android.com/reference/android/Manifest.permission.html#NFC)
允许你的应用通过NFC发送数据。为了声明该权限，添加下面的标签作为一个[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签：

```xml
<uses-permission android:name="android.permission.NFC" />
```

#### [READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)
允许你的应用读取外部存储。为了声明该权限，添加下面的标签作为一个[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签：

```xml
<uses-permission
            android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

> **Note：**对于Android 4.2.2（API Level 17）及之前的系统版本，这个权限不是必需的。在后续的系统版本中，若应用需要读取外部存储，可能会需要申明该权限。为了保证将来程序稳定性，建议在该权限申明变成必需的之前，就在清单文件中声明好。

### 指定NFC功能

指定你的应用使用NFC，添加[`<uses-feature>`](http://developer.android.com/guide/topics/manifest/uses-feature-element.html)标签作为一个[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签。设置`android:required`属性字段为`true`，这样可以使得你的应用只有在NFC可以使用时，才能运行。

下面的代码展示了如何指定[`<uses-feature>`](http://developer.android.com/guide/topics/manifest/uses-feature-element.html)标签：

```xml
<uses-feature
    android:name="android.hardware.nfc"
    android:required="true" />
```

注意，如果你的应用将NFC作为可选的一个功能，但期望在NFC不可使用时程序还能继续执行，你就应该设置`android:required`属性字段为`false`，然后在代码中测试NFC的可用性。

### 指定Android Beam文件传输

由于Android Beam文件传输只能在Android 4.1（API Level 16）及以上的平台使用，如果你的应用将Android Beam文件传输作为一个不可缺少的核心模块，那么你必须指定[`<uses-sdk>`](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html)标签为：[android:minSdkVersion](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html#min)="16"。或者，你可以将[android:minSdkVersion](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html#min)设置为其它值，然后在代码中测试平台版本，这将在下一节中展开。

## 测试设备是否支持Android Beam文件传输

为了在你的应用清单文件中，定义NFC是可选的，你应该使用下面的标签：

```xml
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

如果你设置了[android:required](http://developer.android.com/guide/topics/manifest/uses-feature-element.html#required)="false"，你必须要在代码中测试NFC和Android Beam文件传输是否被支持。

为了在代码中测试Android Beam文件传输，我们先通过[PackageManager.hasSystemFeature()](http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature\(java.lang.String\))和参数[FEATURE_NFC](http://developer.android.com/reference/android/content/pm/PackageManager.html#FEATURE_NFC)，来测试设备是否支持NFC。下一步，通过[SDK_INT](http://developer.android.com/reference/android/os/Build.VERSION.html#SDK_INT)的值测试系统版本是否支持Android Beam文件传输。如果Android Beam文件传输是支持的，那么获得一个NFC控制器的实例，它能允许你与NFC硬件进行通信，例如：

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

一旦你确认了设备支持Android Beam文件传输，那么可以添加一个回调函数，当Android Beam文件传输监测到用户希望与另一个支持NFC的设备发送文件时，系统会调用它。在该回调函数中，返回一个[Uri](http://developer.android.com/reference/android/net/Uri.html)对象数组，Android Beam文件传输将URI对应的文件拷贝发送给要接收的设备。

要添加这个回调函数，我们需要实现[NfcAdapter.CreateBeamUrisCallback](http://developer.android.com/reference/android/nfc/NfcAdapter.CreateBeamUrisCallback.html)接口，和它的方法：[createBeamUris()](http://developer.android.com/reference/android/nfc/NfcAdapter.CreateBeamUrisCallback.html#createBeamUris\(android.nfc.NfcEvent\))，下面是一个例子：

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

一旦你实现了这个接口，通过调用[setBeamPushUrisCallback()](http://developer.android.com/reference/android/nfc/NfcAdapter.html#setBeamPushUrisCallback\(android.nfc.NfcAdapter.CreateBeamUrisCallback, android.app.Activity\))将回调函数提供给Android Beam文件传输。下面是一个例子：

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

> **Note：**你也可以将[Uri](http://developer.android.com/reference/android/net/Uri.html)对象数组通过你应用的[NfcAdapter](http://developer.android.com/reference/android/nfc/NfcAdapter.html)实例，直接提供给NFC框架。如果你能在NFC触碰事件发生之前，定义这些URI，那么你可以选择这个方法。要学习关于这个方法的知识，可以阅读：[NfcAdapter.setBeamPushUris()](http://developer.android.com/reference/android/nfc/NfcAdapter.html#setBeamPushUris\(android.net.Uri[], android.app.Activity\))。

## 定义要发送的文件
为了将一个或更多个文件发送给支持NFC的设备，需要为每一个文件获取一个文件URI（一个具有文件格式（file scheme）的URI），然后将它们添加至一个[Uri](http://developer.android.com/reference/android/net/Uri.html)对象数组中。要传输一个文件，你必须也有读文件的权限。例如，下面的例子展示的是你如何根据文件名获取它的文件URI，然后将URI添加至数组当中：

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
