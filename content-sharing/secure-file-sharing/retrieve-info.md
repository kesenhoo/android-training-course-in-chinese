# 获取文件信息

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/retrieve-info.html>

当一个客户端应用程序拥有了文件的Content URI之后，它就可以获取该文件并进行下一步的工作了，但在此之前，客户端应用程序还可以向服务端应用程序获取关于文件的信息，包括文件的数据类型和文件大小等等。数据类型可以帮助客户端应用程序确定自己能否处理该文件，文件大小能帮助客户端应用程序为文件设置合理的缓冲区。

本课将展示如何通过查询服务端应用程序的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)来获取文件的MIME类型和文件大小。

## 获取文件的MIME类型

客户端应用程序可以通过文件的数据类型判断自己应该如何处理这个文件的内容。客户端应用程序可以通过调用<a href="http://developer.android.com/reference/android/content/ContentResolver.html#getType(android.net.Uri)">ContentResolver.getType()</a>方法获得Content URI所对应的文件数据类型。该方法返回文件的MIME类型。默认情况下，一个[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)通过文件的后缀名来确定其MIME类型。

下例展示了当服务端应用程序将Content URI返回给客户端应用程序后，客户端应用程序应该如何获取文件的MIMIE类型：

```java
    ...
    /*
     * Get the file's content URI from the incoming Intent, then
     * get the file's MIME type
     */
    Uri returnUri = returnIntent.getData();
    String mimeType = getContentResolver().getType(returnUri);
    ...
```

## 获取文件名及文件大小
[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)类有一个<a href="http://developer.android.com/reference/android/support/v4/content/FileProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String)">query()</a>方法的默认实现，它返回一个[Cursor](http://developer.android.com/reference/android/database/Cursor.html)对象，该Cursor对象包含了Content URI所关联的文件的名称和大小。默认的实现返回下面两列信息：

[**DISPLAY_NAME**](http://developer.android.com/reference/android/provider/OpenableColumns.html#DISPLAY_NAME)

文件名，[String](http://developer.android.com/reference/java/lang/String.html)类型。这个值和<a href="http://developer.android.com/reference/java/io/File.html#getName()">File.getName()</a>所返回的值一样。

[**SIZE**](http://developer.android.com/reference/android/provider/OpenableColumns.html#SIZE)

文件大小，以字节为单位，long类型。这个值和<a href="http://developer.android.com/reference/java/io/File.html#length()">File.length()</a>所返回的值一样。

客户端应用可以通过将<a href="http://developer.android.com/reference/android/support/v4/content/FileProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String)">query()</a>的除了Content URI之外的其他参数都设置为“null”，来同时获取文件的[名称](http://developer.android.com/reference/android/provider/OpenableColumns.html#DISPLAY_NAME)（DISPLAY_NAME）和[大小](http://developer.android.com/reference/android/provider/OpenableColumns.html#SIZE)（SIZE）。例如，下面的代码获取一个文件的[名称](http://developer.android.com/reference/android/provider/OpenableColumns.html#DISPLAY_NAME)和[大小](http://developer.android.com/reference/android/provider/OpenableColumns.html#SIZE)，然后在两个[TextView](http://developer.android.com/reference/android/widget/TextView.html)中将他们显示出来：

```java
    ...
    /*
     * Get the file's content URI from the incoming Intent,
     * then query the server app to get the file's display name
     * and size.
     */
    Uri returnUri = returnIntent.getData();
    Cursor returnCursor =
            getContentResolver().query(returnUri, null, null, null, null);
    /*
     * Get the column indexes of the data in the Cursor,
     * move to the first row in the Cursor, get the data,
     * and display it.
     */
    int nameIndex = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
    int sizeIndex = returnCursor.getColumnIndex(OpenableColumns.SIZE);
    returnCursor.moveToFirst();
    TextView nameView = (TextView) findViewById(R.id.filename_text);
    TextView sizeView = (TextView) findViewById(R.id.filesize_text);
    nameView.setText(returnCursor.getString(nameIndex));
    sizeView.setText(Long.toString(returnCursor.getLong(sizeIndex)));
    ...
```
