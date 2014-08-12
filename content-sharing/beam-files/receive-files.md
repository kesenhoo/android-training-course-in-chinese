# 接收其他设备的文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/beam-files/receive-files.html>

Android Beam文件传输将文件拷贝至接收设备上的一个特殊目录。同时使用Android Media Scanner扫描拷贝的文件，并在[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html) provider中为媒体文件添加对应的条目记录。这节课将向你展示当文件拷贝完成时要如何响应，以及在接收设备上应该如何放置拷贝的文件。

## 响应请求并显示数据

当Android Beam文件传输将文件拷贝至接收设备后，它会发布一个通知，包含了一个[Intent](http://developer.android.com/reference/android/content/Intent.html)，它有一个[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的Action，第一个传输文件的MIME类型，和一个指向第一个文件的URI。当用户点击了这个通知后，intent会被发送至系统。为了让你的应用能够响应这个intent，我们需要为响应的[Activity](http://developer.android.com/reference/android/app/Activity.html)所对应的[`<activity>`](http://developer.android.com/guide/topics/manifest/activity-element.html)标签添加[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签，在[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签中，添加下面的子标签：

[`<action android:name="android.intent.action.VIEW" />`](http://developer.android.com/guide/topics/manifest/action-element.html)

用来匹配通知中的intent。

[`<category android:name="android.intent.category.CATEGORY_DEFAULT" />`](http://developer.android.com/guide/topics/manifest/category-element.html)

匹配隐式的[Intent](http://developer.android.com/reference/android/content/Intent.html)。

[`<data android:mimeType="mime-type" />`](http://developer.android.com/guide/topics/manifest/data-element.html)

匹配一个MIME类型。要指定那些你的应用能够处理的类型。

例如，下面的例子展示了如何添加一个intent filter来激活你的activity：

```xml
    <activity
        android:name="com.example.android.nfctransfer.ViewActivity"
        android:label="Android Beam Viewer" >
        ...
        <intent-filter>
            <action android:name="android.intent.action.VIEW"/>
            <category android:name="android.intent.category.DEFAULT"/>
            ...
        </intent-filter>
    </activity>
```

> **Note：**不仅仅只有Android Beam文件传输会发送含有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的intent。在接收设备上的其它应用也有可能会发送含有该行为的intent。我们马上会进一步讨论这一问题。

## 请求文件读权限
如果要读取Android Beam文件传输所拷贝到设备上的文件，需要[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)权限。例如：

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

如果你希望将文件拷贝至你自己应用的存储区，那么需要的权限改为[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)，另外[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限包含了[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)权限。

> **Note：**对于Android 4.2.2 （API Level 17），[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)权限仅在用户选择要读文件时才是强制需要的。而在今后的版本中会在所有情况下都需要该权限。为了保证应用在未来的兼容性，建议在清单文件中声明该权限。

由于你的应用对于其内部存储区域具有控制权，所以若要将文件拷贝至你应用的内部存储区域，写权限是不需要声明的。

## 获取拷贝文件的目录

Android Beam文件传输一次性将所有文件拷贝到目标设备的一个目录内，Android Beam文件传输通知所发出的[Intent](http://developer.android.com/reference/android/content/Intent.html)中包含有URI，他指向了第一个传输的文件。然而，你的应用也有可能接收到除了Android Beam文件传输之外的某个来源所发出的含有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)行为的Intent。为了明确你应该如何处理接收的Intent，你需要检查它的scheme和authority。

为了获得URI的scheme，调用[Uri.getScheme()](http://developer.android.com/reference/android/net/Uri.html#getScheme\(\))，下面的代码展示了如何明确架构并处理URI：

```java
public class MainActivity extends Activity {
    ...
    // A File object containing the path to the transferred files
    private File mParentPath;
    // Incoming Intent
    private Intent mIntent;
    ...
    /*
     * Called from onNewIntent() for a SINGLE_TOP Activity
     * or onCreate() for a new Activity. For onNewIntent(),
     * remember to call setIntent() to store the most
     * current Intent
     *
     */
    private void handleViewIntent() {
        ...
        // Get the Intent action
        mIntent = getIntent();
        String action = mIntent.getAction();
        /*
         * For ACTION_VIEW, the Activity is being asked to display data.
         * Get the URI.
         */
        if (TextUtils.equals(action, Intent.ACTION_VIEW)) {
            // Get the URI from the Intent
            Uri beamUri = mIntent.getData();
            /*
             * Test for the type of URI, by getting its scheme value
             */
            if (TextUtils.equals(beamUri.getScheme(), "file")) {
                mParentPath = handleFileUri(beamUri);
            } else if (TextUtils.equals(
                    beamUri.getScheme(), "content")) {
                mParentPath = handleContentUri(beamUri);
            }
        }
        ...
    }
    ...
}
```

### 从文件URI中获取目录

如果接收的[Intent](http://developer.android.com/reference/android/content/Intent.html)包含一个文件URI，则该URI包含了一个文件的绝对文件名，包括了完整的路径和文件名。对于Android Beam文件传输来说，目录路径指向了其它传输文件的位置（如果有其它传输文件的话），要获得这个目录路径，要取得URI的路径部分（URI中除去“file:”前缀的部分），根据路径创建一个[File](http://developer.android.com/reference/java/io/File.html)对象，然后获取这个[File](http://developer.android.com/reference/java/io/File.html)的父目录：

```java
...
    public String handleFileUri(Uri beamUri) {
        // Get the path part of the URI
        String fileName = beamUri.getPath();
        // Create a File object for this filename
        File copiedFile = new File(fileName);
        // Get a string containing the file's parent directory
        return copiedFile.getParent();
    }
...
```

### 从内容URI获取目录

如果接收的[Intent](http://developer.android.com/reference/android/content/Intent.html)包含一个内容URI，这个URI可能指向的是一个存储于[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html) Content Provider的目录和文件名。你可以通过检测URI的authority值来判断是否是[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的内容URI。一个[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的内容URI可能来自Android Beam文件传输也可能来自其它应用，但不管怎么样，你都能根据该内容URI获得一个目录和文件名。

你也可以接收一个[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的Intent，它包含有一个content provider的URI，而不是[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)，在这种情况下，这个内容URI不包含[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的authority，且这个URI一般不指向一个目录。

> Note：对于Android Beam文件传输，如果第一个接收的文件，其MIME类型为“audio/*”，“image/*”或者“video/*”，那么你会接收这个在[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的Intent中的内容URI。Android Beam文件传输会在它存储传输文件的目录内运行Media Scanner，以此为媒体文件添加索引。同时Media Scanner将结果写入[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的content provider，之后它将第一个文件的内容URI回递给Android Beam文件传输。这个内容URI就是你在通知[Intent](http://developer.android.com/reference/android/content/Intent.html)中所接收到的。要获得第一个文件的目录，你需要使用该内容URI从[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)中获取它。

### 指明Content Provider

为了明确你能从内容URI中获取文件目录，你可以通过调用[Uri.getAuthority()](http://developer.android.com/reference/android/net/Uri.html#getAuthority\(\))获取URI的Authority，以此确定与该URI相关联的Content Provider。其结果有两个可能的值：

**[MediaStore.AUTHORITY](http://developer.android.com/reference/android/provider/MediaStore.html#AUTHORITY)**

表明这个URI关联了被[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)追踪的一个文件或者多个文件。可以从[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)中获取文件的全名，目录名就自然可以从文件全名中获取。

**其他值**

来自其他Content Provider的内容URI。可以显示与该内容URI相关联的数据，但是不要尝试去获取文件目录。

为了[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的内容URI中获取目录，执行一个查询操作，它将[Uri](http://developer.android.com/reference/android/net/Uri.html)参数指定为收到的内容URI，列名为[MediaColumns.DATA](http://developer.android.com/reference/android/provider/MediaStore.MediaColumns.html#DATA)。返回的[Cursor](http://developer.android.com/reference/android/database/Cursor.html)包含了完整路径和URI所代表的文件名。该目录路径下还包含了由Android Beam文件传输传送到该设备上的其它文件。

下面的代码展示了你要如何测试内容URI的Authority，并获取传输文件的路径和文件名：

```java
...
    public String handleContentUri(Uri beamUri) {
        // Position of the filename in the query Cursor
        int filenameIndex;
        // File object for the filename
        File copiedFile;
        // The filename stored in MediaStore
        String fileName;
        // Test the authority of the URI
        if (!TextUtils.equals(beamUri.getAuthority(), MediaStore.AUTHORITY)) {
            /*
             * Handle content URIs for other content providers
             */
        // For a MediaStore content URI
        } else {
            // Get the column that contains the file name
            String[] projection = { MediaStore.MediaColumns.DATA };
            Cursor pathCursor =
                    getContentResolver().query(beamUri, projection,
                    null, null, null);
            // Check for a valid cursor
            if (pathCursor != null &&
                    pathCursor.moveToFirst()) {
                // Get the column index in the Cursor
                filenameIndex = pathCursor.getColumnIndex(
                        MediaStore.MediaColumns.DATA);
                // Get the full file name including path
                fileName = pathCursor.getString(filenameIndex);
                // Create a File object for the filename
                copiedFile = new File(fileName);
                // Return the parent directory of the file
                return new File(copiedFile.getParent());
             } else {
                // The query didn't work; return null
                return null;
             }
        }
    }
...
```

要学习更多关于从Content Provider获取数据的知识，可以阅读：[Retrieving Data from the Provider](http://developer.android.com/guide/topics/providers/content-provider-basics.html#SimpleQuery)。
