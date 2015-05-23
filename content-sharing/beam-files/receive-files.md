# 接收其他设备的文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/beam-files/receive-files.html>

Android Beam文件传输将文件拷贝至接收设备上的某个特殊目录。同时使用Android Media Scanner扫描拷贝的文件，并在[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html) provider中为媒体文件添加对应的条目记录。本课将展示当文件拷贝完成时要如何响应，以及在接收设备上应该如何定位拷贝的文件。

## 响应请求并显示数据

当Android Beam文件传输将文件拷贝至接收设备后，它会发布一个包含[Intent](http://developer.android.com/reference/android/content/Intent.html)的通知，该Intent拥有：[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)，首个被传输文件的MIME类型，以及一个指向第一个文件的URI。用户点击该通知后，Intent会被发送至系统。为了使我们的应用程序能够响应该Intent，我们需要为响应的<a href="http://developer.android.com/reference/android/app/Activity.html">Activity</a>所对应的<a href="http://developer.android.com/guide/topics/manifest/activity-element.html">&lt;activity&gt;</a>标签添加一个[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签，在[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签中，添加以下子标签：

[`<action android:name="android.intent.action.VIEW" />`](http://developer.android.com/guide/topics/manifest/action-element.html)

该标签用来匹配从通知发出的Intent，这些Intent具有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)这一Action。

[`<category android:name="android.intent.category.CATEGORY_DEFAULT" />`](http://developer.android.com/guide/topics/manifest/category-element.html)

该标签用来匹配不含有显式Category的[Intent](http://developer.android.com/reference/android/content/Intent.html)对象。

[`<data android:mimeType="mime-type" />`](http://developer.android.com/guide/topics/manifest/data-element.html)

该标签用来匹配一个MIME类型。仅仅指定那些我们的应用能够处理的类型。

下例展示了如何添加一个intent filter来激活我们的activity：

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

> **Note：**Android Beam文件传输不是含有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的Intent的唯一可能发送者。在接收设备上的其它应用也有可能会发送含有该Action的intent。我们马上会进一步讨论这一问题。

## 请求文件读权限
要读取Android Beam文件传输所拷贝到设备上的文件，需要请求[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)权限。例如：

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

如果希望将文件拷贝至应用程序自己的存储区，那么需要的权限改为[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)，另外，[WRITE_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_EXTERNAL_STORAGE)权限包含了[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)权限。

> **Note：**对于Android 4.2.2（API Level 17）及之前版本的系统，[READ_EXTERNAL_STORAGE](http://developer.android.com/reference/android/Manifest.permission.html#READ_EXTERNAL_STORAGE)权限仅在用户选择要读文件时才是强制需要的。而在今后的版本中会在所有情况下都需要该权限。为保证应用程序在未来的稳定性，建议在Manifest清单文件中声明该权限。

由于我们的应用对于自身的内部存储区域具有控制权，因此当要将文件拷贝至应用程序自身的的内部存储区域时，不需要声明写权限。

## 获取拷贝文件的目录

Android Beam文件传输一次性将所有文件拷贝到目标设备的一个目录中，Android Beam文件传输通知所发出的[Intent](http://developer.android.com/reference/android/content/Intent.html)中含有指向了第一个被传输的文件的URI。然而，我们的应用程序也有可能接收到除了Android Beam文件传输之外的某个来源所发出的含有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)这一Action的Intent。为了明确应该如何处理接收的Intent，我们要检查它的Scheme和Authority。

可以调用<a href="http://developer.android.com/reference/android/net/Uri.html#getScheme()">Uri.getScheme()</a>获得URI的Scheme，下例展示了如何确定Scheme并对URI进行相应的处理：

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

### 从File URI中获取目录

如果接收的[Intent](http://developer.android.com/reference/android/content/Intent.html)包含一个File URI，则该URI包含了一个文件的绝对文件名，它包括了完整的路径和文件名。对Android Beam文件传输来说，目录路径指向了其它被传输文件的位置（如果有其它传输文件的话），要获得该目录路径，需要取得URI的路径部分（URI中除去“file:”前缀的部分），根据路径创建一个[File](http://developer.android.com/reference/java/io/File.html)对象，然后获取这个[File](http://developer.android.com/reference/java/io/File.html)的父目录：

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

### 从Content URI获取目录

如果接收的[Intent](http://developer.android.com/reference/android/content/Intent.html)包含一个Content URI，这个URI可能指向的是存储于[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html) Content Provider的目录和文件名。我们可以通过检测URI的Authority值来判断它是否是来自于[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的Content URI。一个[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的Content URI可能来自Android Beam文件传输也可能来自其它应用程序，但不管怎么样，我们都能根据该Content URI获得一个目录路径和文件名。

我们也可以接收一个含有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)这一Action的Intent，它包含的Content URI针对于Content Provider，而不是[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)，这种情况下，该Content URI不包含[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的Authority，且这个URI一般不指向一个目录。

> **Note：**对于Android Beam文件传输，接收在含有[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的Intent中的Content URI时，若第一个接收的文件MIME类型为“audio/*”，“image/*”或者“video/*”，Android Beam文件传输会在它存储传输文件的目录内运行Media Scanner，以此为媒体文件添加索引。同时Media Scanner将结果写入[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的Content Provider，之后它将第一个文件的Content URI回递给Android Beam文件传输。这个Content URI就是我们在通知[Intent](http://developer.android.com/reference/android/content/Intent.html)中所接收到的。要获得第一个文件的目录，需要使用该Content URI从[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)中获取它。

### 确定Content Provider

为了确定是否能从Content URI中获取文件目录，可以通过调用<a href="http://developer.android.com/reference/android/net/Uri.html#getAuthority()">Uri.getAuthority()</a>获取URI的Authority，以此确定与该URI相关联的Content Provider。其结果有两个可能的值：

**[MediaStore.AUTHORITY](http://developer.android.com/reference/android/provider/MediaStore.html#AUTHORITY)**

表明该URI关联了被[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)记录的一个文件或者多个文件。可以从[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)中获取文件的全名，目录名就自然可以从文件全名中获取。

**其他值**

来自其他Content Provider的Content URI。可以显示与该Content URI相关联的数据，但是不要尝试去获取文件目录。

要从[MediaStore](http://developer.android.com/reference/android/provider/MediaStore.html)的Content URI中获取目录，我们需要执行一个查询操作，它将[Uri](http://developer.android.com/reference/android/net/Uri.html)参数指定为收到的ContentURI，将[MediaColumns.DATA](http://developer.android.com/reference/android/provider/MediaStore.MediaColumns.html#DATA)列作为投影（Projection）。返回的[Cursor](http://developer.android.com/reference/android/database/Cursor.html)对象包含了URI所代表的文件的完整路径和文件名。该目录路径下还包含了由Android Beam文件传输传送到该设备上的其它文件。

下面的代码展示了如何测试Content URI的Authority，并获取传输文件的路径和文件名：

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

更多关于从Content Provider获取数据的知识，请参考：[Retrieving Data from the Provider](http://developer.android.com/guide/topics/providers/content-provider-basics.html#SimpleQuery)。
