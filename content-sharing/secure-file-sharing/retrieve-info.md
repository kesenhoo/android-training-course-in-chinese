# 获取文件信息

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/retrieve-info.html>

当一个客户端应用尝试对一个有URI的文件进行操作时，应用可以向服务端应用索取关于文件的信息，包括文件的数据类型和文件大小。数据类型可以帮助客户端应用确定该文件自己能否处理，文件大小能帮助客户端应用为文件设置合理的缓冲区。

这节课将展示如何通过查询服务端应用的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)来获取文件的MIME类型和尺寸。

## 获取文件的MIME类型

一个文件的数据类型能够告知客户端应用应该如何处理这个文件的内容。为了得到URI所对应文件的数据类型，客户端应用调用[ContentResolver.getType()](http://developer.android.com/reference/android/content/ContentResolver.html#getType\(android.net.Uri\))。这个方法返回了文件的MIME类型。默认的，一个[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)通过文件的后缀名来确定其MIME类型。

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

## 获取文件名和文件大小
[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)类有一个默认的[query()](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#query\(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String\))方法的实现，它返回一个[Cursor](http://developer.android.com/reference/android/database/Cursor.html)，它包含了URI所关联的文件的名字和尺寸。默认的实现返回两列：

[**DISPLAY_NAME**](http://developer.android.com/reference/android/provider/OpenableColumns.html#DISPLAY_NAME)

是文件的文件名，一个[String](http://developer.android.com/reference/java/lang/String.html)。这个值和[File.getName()](http://developer.android.com/reference/java/io/File.html#getName\(\))所返回的值是一样的。

[**SIZE**](http://developer.android.com/reference/android/provider/OpenableColumns.html#SIZE)

文件的大小，以字节为单位，一个“long”型。这个值和[File.length()](http://developer.android.com/reference/java/io/File.html#length\(\))所返回的值是一样的。

客户端应用可以通过将[query()](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#query\(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String\))的参数都设置为“null”，只保留URI这一参数，来同时获取文件的[名字](http://developer.android.com/reference/android/provider/OpenableColumns.html#DISPLAY_NAME)和[大小](http://developer.android.com/reference/android/provider/OpenableColumns.html#SIZE)。例如，下面的代码获取一个文件的[名字](http://developer.android.com/reference/android/provider/OpenableColumns.html#DISPLAY_NAME)和[大小](http://developer.android.com/reference/android/provider/OpenableColumns.html#SIZE)，然后在两个[TextView](http://developer.android.com/reference/android/widget/TextView.html)中进行显示：

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
