# 分享文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/sharing-file.html>

一旦你配置了你的应用来使用URI共享文件，你可以响应其他应用关于这些文件的请求。一种响应的方法是在服务端应用端提供一个文件选择接口，它可以由其他应用激活。这种方法可以允许客户端应用端让用户从服务端应用端选择一个文件，然后接收这个文件的URI。

这节课将会向你展示如何在你的应用中创建一个用来选择文件的[Activity](http://developer.android.com/reference/android/app/Activity.html)，来响应这些索取文件的请求。

## 接收文件请求

为了从客户端应用端接收一个文件索取请求，然后以URI形式进行响应，你的应用应该提供一个选择文件的[Activity](http://developer.android.com/reference/android/app/Activity.html)。客户端应用端通过调用[startActivityForResult()](http://developer.android.com/reference/android/app/Activity.html#startActivityForResult\(android.content.Intent, int\))来启动这个[Activity](http://developer.android.com/reference/android/app/Activity.html)。该方法包含了一个[Intent](http://developer.android.com/reference/android/content/Intent.html)，它具有[ACTION_PICK](http://developer.android.com/reference/android/content/Intent.html#ACTION_PICK)的Action。当客户端应用端调用了[startActivityForResult()](http://developer.android.com/reference/android/app/Activity.html#startActivityForResult\(android.content.Intent, int\))，你的应用可以向客户端应用端返回一个结果，该结果即用户所选文件对应的URI。

学习如何在客户端应用端实现文件索取请求，可以阅读：[请求分享一个文件](request-file.html)。

## 创建一个文件选择Activity

为了配置文件选择[Activity](http://developer.android.com/reference/android/app/Activity.html)，我们从在清单文件定义你的[Activity](http://developer.android.com/reference/android/app/Activity.html)开始，在其intent过滤器中，匹配[ACTION_PICK](http://developer.android.com/reference/android/content/Intent.html#ACTION_PICK)的Action，以及[CATEGORY_DEFAULT](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_DEFAULT)和[CATEGORY_OPENABLE](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_OPENABLE)的Category。另外，还需要为你的应用设置MIME类型过滤器，来表明你的应用可以向其他应用提供哪种类型的文件。下面的这段代码展示了如何在清单文件中定义新的[Activity](http://developer.android.com/reference/android/app/Activity.html)和intent过滤器：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    ...
        <application>
        ...
            <activity
                android:name=".FileSelectActivity"
                android:label="@"File Selector" >
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

下面，定义一个[Activity](http://developer.android.com/reference/android/app/Activity.html)子类，它用来显示在你内部存储的“files/images/”目录下可以获得的文件，然后允许用户选择期望的文件。下面的代码显示了如何定义这个[Activity](http://developer.android.com/reference/android/app/Activity.html)。并且响应用户的选择：

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

一旦一个用户选择了一个共享的文件，你的应用必须明确哪个文件被选择了，然后为这个文件生成一个对应的URI。若[Activity](http://developer.android.com/reference/android/app/Activity.html)在[ListView](http://developer.android.com/reference/android/widget/ListView.html)中显示了可获得文件的清单，当用户点击了一个文件名时，系统调用了方法[onItemClick()](http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html#onItemClick\(android.widget.AdapterView<?>, android.view.View, int, long\))，在该方法中你可以获取被选择的文件。

在[onItemClick()](http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html#onItemClick\(android.widget.AdapterView<?>, android.view.View, int, long\))中，为选择的文件文件名获取一个[File](http://developer.android.com/reference/java/io/File.html)对象，然后将它作为参数传递给[getUriForFile()](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile\(android.content.Context, java.lang.String, java.io.File\))，另外还需传入的参数是你为[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)所指定的[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签值。这个结果URI包含了相应的被访问权限，一个对应于文件目录的路径标记（如在XML meta-date中定义的），以及包含扩展名的文件名。有关[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)如何匹配基于XML meta-data的目录路径的信息，可以阅读：[指定可共享目录路径](setup-sharing.html#DefineMetaData)。

下面的例子展示了你如何检测选中的文件并且获得一个URI：

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

记住，你能生成的那些URI所对应的文件，是那些在meta-data文件中包含<paths>标签的（即你定义的）目录内的文件，这方面知识在[Specify Sharable Directories](http://developer.android.com/training/secure-file-sharing/setup-sharing.html#DefineMetaData)中已经讨论过。如果你为一个在你没有指定的目录内的文件调用了[getUriForFile()](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile\(android.content.Context, java.lang.String, java.io.File\))方法，你会收到一个[IllegalArgumentException](http://developer.android.com/reference/java/lang/IllegalArgumentException.html)。

## 为文件授权

现在你有了你想要共享给其他应用的文件URI，你需要允许客户端应用端访问这个文件。为了允许访问，可以通过将URI添加至一个[Intent](http://developer.android.com/reference/android/content/Intent.html)，然后为该[Intent](http://developer.android.com/reference/android/content/Intent.html)设置权限标记。你所授予的权限是临时的，并且当接收应用的任务栈被完成后，会自动过期。

下面的例子展示了如何为文件设置读权限：

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

> **Caution：**调用[setFlags()](http://developer.android.com/reference/android/content/Intent.html#setFlags\(int\))是唯一安全的方法，为你的文件授予临时的被访问权限。避免对文件URI调用[Context.grantUriPermission()](http://developer.android.com/reference/android/content/Context.html#grantUriPermission\(java.lang.String, android.net.Uri, int\))，因为通过该方法授予的权限，你只能通过调用[Context.revokeUriPermission()](http://developer.android.com/reference/android/content/Context.html#revokeUriPermission\(android.net.Uri, int\))来撤销。

## 与请求应用共享文件

为了与请求文件的应用共享其需要的文件，将包含了URI和响应权限的[Intent](http://developer.android.com/reference/android/content/Intent.html)传递给[setResult()](http://developer.android.com/reference/android/app/Activity.html#setResult\(int\))。当你定义的[Activity](http://developer.android.com/reference/android/app/Activity.html)被结束后，系统会把这个包含了URI的[Intent](http://developer.android.com/reference/android/content/Intent.html)传递给客户端应用。下面的例子展示了你应该如何做：

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

向用户提供一个一旦他们选择了文件就能立即回到客户端应用的方法。一种实现的方法是提供一个勾选框或者一个完成按钮。使用按钮的[android:onClick](http://developer.android.com/reference/android/view/View.html#attr_android:onClick)属性字段为它关联一个方法。在该方法中，调用[finish()](http://developer.android.com/reference/android/app/Activity.html#finish\(\))。例如：

```java
    public void onDoneClick(View v) {
        // Associate a method with the Done button
        finish();
    }
```
