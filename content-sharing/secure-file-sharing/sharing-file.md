# 分享文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/sharing-file.html>

对应用程序进行配置，使得它可以使用Content URI来共享文件后，其就可以响应其他应用程序的获取文件的请求了。一种响应这些请求的方法是在服务端应用程序提供一个可以由其他应用激活的文件选择接口。该方法可以允许客户端应用程序让用户从服务端应用程序选择一个文件，然后接收这个文件的Content URI。

本课将会展示如何在应用中创建一个用于选择文件的[Activity](http://developer.android.com/reference/android/app/Activity.html)，来响应这些获取文件的请求。

## 接收文件请求

为了从客户端应用程序接收一个文件获取请求并以Content URI的形式进行响应，我们的应用程序应该提供一个选择文件的[Activity](http://developer.android.com/reference/android/app/Activity.html)。客户端应用程序通过调用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>方法启动这一[Activity](http://developer.android.com/reference/android/app/Activity.html)。该方法包含了一个具有[ACTION_PICK](http://developer.android.com/reference/android/content/Intent.html#ACTION_PICK)Action的[Intent](http://developer.android.com/reference/android/content/Intent.html)参数。当客户端应用程序调用了<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a>，我们的应用可以向客户端应用程序返回一个结果，该结果即用户所选择的文件所对应的Content URI。

关于如何在客户端应用程序实现文件获取请求，请参考：[请求分享一个文件](request-file.html)。

## 创建一个选择文件的Activity

为建立一个选择文件的[Activity](http://developer.android.com/reference/android/app/Activity.html)，首先需要在Manifest清单文件中定义[Activity](http://developer.android.com/reference/android/app/Activity.html)，在其Intent过滤器中，匹配[ACTION_PICK](http://developer.android.com/reference/android/content/Intent.html#ACTION_PICK)Action及[CATEGORY_DEFAULT](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_DEFAULT)和[CATEGORY_OPENABLE](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_OPENABLE)这两种Category。另外，还需要为应用程序设置MIME类型过滤器，来表明我们的应用程序可以向其他应用程序提供哪种类型的文件。下面这段代码展示了如何在清单文件中定义新的[Activity](http://developer.android.com/reference/android/app/Activity.html)和Intent过滤器：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    ...
        <application>
        ...
            <activity
                android:name=".FileSelectActivity"
                android:label="File Selector" >
                <intent-filter>
                    <action
                        android:name="android.intent.action.PICK"/>
                    <category
                        android:name="android.intent.category.DEFAULT"/>
                    <category
                        android:name="android.intent.category.OPENABLE"/>
                    <data android:mimeType="text/plain"/>
                    <data android:mimeType="image/*"/>
                </intent-filter>
            </activity>
```

### 在代码中定义文件选择Activity

下面，定义一个[Activity](http://developer.android.com/reference/android/app/Activity.html)子类，用于显示在内部存储的“files/images/”目录下可以获得的文件，然后允许用户选择期望的文件。下面代码展示了如何定义该[Activity](http://developer.android.com/reference/android/app/Activity.html)，并令其响应用户的选择：

```java
public class MainActivity extends Activity {
    // The path to the root of this app's internal storage
    private File mPrivateRootDir;
    // The path to the "images" subdirectory
    private File mImagesDir;
    // Array of files in the images subdirectory
    File[] mImageFiles;
    // Array of filenames corresponding to mImageFiles
    String[] mImageFilenames;
    // Initialize the Activity
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Set up an Intent to send back to apps that request a file
        mResultIntent =
                new Intent("com.example.myapp.ACTION_RETURN_FILE");
        // Get the files/ subdirectory of internal storage
        mPrivateRootDir = getFilesDir();
        // Get the files/images subdirectory;
        mImagesDir = new File(mPrivateRootDir, "images");
        // Get the files in the images subdirectory
        mImageFiles = mImagesDir.listFiles();
        // Set the Activity's result to null to begin with
        setResult(Activity.RESULT_CANCELED, null);
        /*
         * Display the file names in the ListView mFileListView.
         * Back the ListView with the array mImageFilenames, which
         * you can create by iterating through mImageFiles and
         * calling File.getAbsolutePath() for each File
         */
         ...
    }
    ...
}
```


## 响应一个文件选择

一旦用户选择了一个被共享的文件，我们的应用程序必须明确哪个文件被选择了，并为该文件生成一个对应的Content URI。如果我们的[Activity](http://developer.android.com/reference/android/app/Activity.html)在[ListView](http://developer.android.com/reference/android/widget/ListView.html)中显示了可获得文件的清单，那么当用户点击了一个文件名时，系统会调用方法<a href="http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html#onItemClick(android.widget.AdapterView&lt;?&gt;, android.view.View, int, long)">onItemClick()</a>，在该方法中可以获取被选择的文件。

在<a href="http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html#onItemClick(android.widget.AdapterView&lt;?&gt;, android.view.View, int, long)">onItemClick()</a>中，根据被选中文件的文件名获取一个[File](http://developer.android.com/reference/java/io/File.html)对象，然后将其作为参数传递给<a href="http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile(android.content.Context, java.lang.String, java.io.File)">getUriForFile()</a>，另外还需传入的参数是在[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签中为[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)所指定的Authority，函数返回的Content URI包含了相应的Authority，一个对应于文件目录的路径标记（如在XML meta-data中定义的），以及包含扩展名的文件名。有关[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)如何基于XML meta-data将目录路径与路径标记进行匹配的知识，可以阅读：[指定可共享目录路径](setup-sharing.html#DefineMetaData)。

下例展示了如何检测选中的文件并且获得它的Content URI：

```java
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Define a listener that responds to clicks on a file in the ListView
        mFileListView.setOnItemClickListener(
                new AdapterView.OnItemClickListener() {
            @Override
            /*
             * When a filename in the ListView is clicked, get its
             * content URI and send it to the requesting app
             */
            public void onItemClick(AdapterView<?> adapterView,
                    View view,
                    int position,
                    long rowId) {
                /*
                 * Get a File for the selected file name.
                 * Assume that the file names are in the
                 * mImageFilename array.
                 */
                File requestFile = new File(mImageFilename[position]);
                /*
                 * Most file-related method calls need to be in
                 * try-catch blocks.
                 */
                // Use the FileProvider to get a content URI
                try {
                    fileUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            "com.example.myapp.fileprovider",
                            requestFile);
                } catch (IllegalArgumentException e) {
                    Log.e("File Selector",
                          "The selected file can't be shared: " +
                          clickedFilename);
                }
                ...
            }
        });
        ...
    }
```

记住，我们能生成的那些Content URI所对应的文件，必须是那些在meta-data文件中包含`<paths>`标签的目录内的文件，这方面知识在[Specify Sharable Directories](http://developer.android.com/training/secure-file-sharing/setup-sharing.html#DefineMetaData)中已经讨论过。如果调用<a href="http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile(android.content.Context, java.lang.String, java.io.File)">getUriForFile()</a>方法所要获取的文件不在我们指定的目录中，会收到一个[IllegalArgumentException](http://developer.android.com/reference/java/lang/IllegalArgumentException.html)。

## 为文件授权

现在已经有了想要共享给其他应用程序的文件所对应的Content URI，我们需要允许客户端应用程序访问这个文件。为了达到这一目的，可以通过将Content URI添加至一个[Intent](http://developer.android.com/reference/android/content/Intent.html)中，然后为该[Intent](http://developer.android.com/reference/android/content/Intent.html)设置权限标记。所授予的权限是临时的，并且当接收文件的应用程序的任务栈终止后，会自动过期。

下例展示了如何为文件设置读权限：

```java
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Define a listener that responds to clicks in the ListView
        mFileListView.setOnItemClickListener(
                new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView,
                    View view,
                    int position,
                    long rowId) {
                ...
                if (fileUri != null) {
                    // Grant temporary read permission to the content URI
                    mResultIntent.addFlags(
                        Intent.FLAG_GRANT_READ_URI_PERMISSION);
                }
                ...
             }
             ...
        });
    ...
    }
```

> **Caution：**调用<a href="http://developer.android.com/reference/android/content/Intent.html#setFlags(int)">setFlags()</a>来为文件授予临时被访问权限是唯一的安全的方法。尽量避免对文件的Content URI调用<a href="http://developer.android.com/reference/android/content/Context.html#grantUriPermission(java.lang.String, android.net.Uri, int)">Context.grantUriPermission()</a>，因为通过该方法授予的权限，只能通过调用<a href="http://developer.android.com/reference/android/content/Context.html#revokeUriPermission(android.net.Uri, int)">Context.revokeUriPermission()</a>来撤销。

## 与请求应用共享文件

为了向请求文件的应用程序提供其需要的文件，我们将包含了Content URI和相应权限的[Intent](http://developer.android.com/reference/android/content/Intent.html)传递给<a href="http://developer.android.com/reference/android/app/Activity.html#setResult(int)">setResult()</a>。当定义的[Activity](http://developer.android.com/reference/android/app/Activity.html)结束后，系统会把这个包含了Content URI的[Intent](http://developer.android.com/reference/android/content/Intent.html)传递给客户端应用程序。下例展示了其中的核心步骤：

```java
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Define a listener that responds to clicks on a file in the ListView
        mFileListView.setOnItemClickListener(
                new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView,
                    View view,
                    int position,
                    long rowId) {
                ...
                if (fileUri != null) {
                    ...
                    // Put the Uri and MIME type in the result Intent
                    mResultIntent.setDataAndType(
                            fileUri,
                            getContentResolver().getType(fileUri));
                    // Set the result
                    MainActivity.this.setResult(Activity.RESULT_OK,
                            mResultIntent);
                    } else {
                        mResultIntent.setDataAndType(null, "");
                        MainActivity.this.setResult(RESULT_CANCELED,
                                mResultIntent);
                    }
                }
        });
```

当用户选择好文件后，我们应该向用户提供一个能够立即回到客户端应用程序的方法。一种实现的方法是向用户提供一个勾选框或者一个完成按钮。可以使用按钮的[android:onClick](http://developer.android.com/reference/android/view/View.html#attr_android:onClick)属性字段为它关联一个方法。在该方法中，调用<a href="http://developer.android.com/reference/android/app/Activity.html#finish()">finish()</a>。例如：

```java
    public void onDoneClick(View v) {
        // Associate a method with the Done button
        finish();
    }
```
