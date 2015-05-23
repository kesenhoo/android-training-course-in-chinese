# 请求分享一个文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/request-file.html>

当一个应用程序希望访问由其它应用程序所共享的文件时，请求应用程序（客户端）经常会向其它应用程序（服务端）发送一个文件请求。多数情况下，该请求会导致在服务端应用程序中启动一个Activity，该Activity中会显示可以共享的文件。当服务端应用程序向客户端应用程序返回了文件的Content URI后，用户即可开始选择文件。

本课将展示一个客户端应用程序应该如何向服务端应用程序请求一个文件，接收服务端应用程序发来的Content URI，然后使用这个Content URI打开这个文件。

## 发送一个文件请求

为了向服务端应用程序发送文件请求，在客户端应用程序中，需要调用[startActivityForResult](http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int))方法，同时传递给这个方法一个[Intent](http://developer.android.com/reference/android/content/Intent.html)参数，它包含了客户端应用程序能处理的某个Action，比如[ACTION_PICK](http://developer.android.com/reference/android/content/Intent.html#ACTION_PICK)及一个MIME类型。

例如，下面的代码展示了如何向服务端应用程序发送一个Intent，来启动在[分享文件](sharing-file.html#SendURI)中提到的[Activity](http://developer.android.com/reference/android/app/Activity.html)：

```java
public class MainActivity extends Activity {
    private Intent mRequestFileIntent;
    private ParcelFileDescriptor mInputPFD;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mRequestFileIntent = new Intent(Intent.ACTION_PICK);
        mRequestFileIntent.setType("image/jpg");
        ...
    }
    ...
    protected void requestFile() {
        /**
         * When the user requests a file, send an Intent to the
         * server app.
         * files.
         */
            startActivityForResult(mRequestFileIntent, 0);
        ...
    }
    ...
}
```

## 访问请求的文件

当服务端应用程序向客户端应用程序发回包含Content URI的[Intent](http://developer.android.com/reference/android/content/Intent.html)时，该[Intent](http://developer.android.com/reference/android/content/Intent.html)会传递给客户端应用程序重写的<a href="http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent)">onActivityResult()</a>方法当中。一旦客户端应用程序拥有了文件的Content URI，它就可以通过获取其[FileDescriptor](http://developer.android.com/reference/java/io/FileDescriptor.html)访问文件了。

这一过程中不用过多担心文件的安全问题，因为客户端应用程序所收到的所有数据只有文件的Content URI而已。由于URI不包含目录路径信息，客户端应用程序无法查询或打开任何服务端应用程序的其他文件。客户端应用程序仅仅获取了这个文件的访问渠道以及由服务端应用程序授予的访问权限。同时访问权限是临时的，一旦这个客户端应用的任务栈结束了，这个文件将无法再被除服务端应用程序之外的其他应用程序访问。

下面的例子展示了客户端应用程序应该如何处理发自服务端应用程序的[Intent](http://developer.android.com/reference/android/content/Intent.html)，以及客户端应用程序如何使用Content URI获取[FileDescriptor](http://developer.android.com/reference/java/io/FileDescriptor.html)：

```java
    /*
     * When the Activity of the app that hosts files sets a result and calls
     * finish(), this method is invoked. The returned Intent contains the
     * content URI of a selected file. The result code indicates if the
     * selection worked or not.
     */
    @Override
    public void onActivityResult(int requestCode, int resultCode,
            Intent returnIntent) {
        // If the selection didn't work
        if (resultCode != RESULT_OK) {
            // Exit without doing anything else
            return;
        } else {
            // Get the file's content URI from the incoming Intent
            Uri returnUri = returnIntent.getData();
            /*
             * Try to open the file for "read" access using the
             * returned URI. If the file isn't found, write to the
             * error log and return.
             */
            try {
                /*
                 * Get the content resolver instance for this context, and use it
                 * to get a ParcelFileDescriptor for the file.
                 */
                mInputPFD = getContentResolver().openFileDescriptor(returnUri, "r");
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                Log.e("MainActivity", "File not found.");
                return;
            }
            // Get a regular file descriptor for the file
            FileDescriptor fd = mInputPFD.getFileDescriptor();
            ...
        }
    }
```

<a href="http://developer.android.com/reference/android/content/ContentResolver.html#openFileDescriptor(android.net.Uri, java.lang.String)">openFileDescriptor()</a>方法返回一个文件的[ParcelFileDescriptor](http://developer.android.com/reference/android/os/ParcelFileDescriptor.html)对象。客户端应用程序从该对象中获取[FileDescriptor](http://developer.android.com/reference/java/io/FileDescriptor.html)对象，然后利用该对象读取这个文件了。
