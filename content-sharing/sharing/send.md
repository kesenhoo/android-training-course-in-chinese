# 给其他App发送简单的数据

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/sharing/send.html>

当你构建一个intent，你必须指定这个intent需要触发的actions。Android定义了一些actions，包括ACTION_SEND，这个action表明着这个intent是用来从一个activity发送数据到另外一个activity的，甚至是跨进程之间的。

为了发送数据到另外一个activity，你需要做的是指定数据与数据的类型，系统会识别出能够兼容接受的这些数据的activity并且把这些activity显示给用户进行选择(如果有多个选择)，或者是立即启动Activity(只有一个兼容的选择)。同样的，你可以在manifest文件的Activity描述中添加接受哪些数据类型。

在不同的程序之间使用intent来发送与接受数据是在社交分享内容的时候最常用的方法。Intent使得用户用最常用的程序进行快速简单的分享信息。

**注意:**为ActionBar添加分享功能的最好方法是使用[ShareActionProvider](https://developer.android.com/reference/android/widget/ShareActionProvider.html)，它能够在API level 14以上进行使用。ShareActionProvider会在第3课中进行详细介绍。

## 分享文本内容(Send Text Content)

ACTION_SEND的最直接与最常用的是从一个Activity发送文本内容到另外一个Activity。例如，Android内置的浏览器可以把当前显示页面的URL作为文本内容分享到其他程序。这是非常有用的，通过邮件或者社交网络来分享文章或者网址给好友。下面是一段Sample Code:

```java
Intent sendIntent = new Intent();
sendIntent.setAction(Intent.ACTION_SEND);
sendIntent.putExtra(Intent.EXTRA_TEXT, "This is my text to send.");
sendIntent.setType("text/plain");
startActivity(sendIntent);
```

如果设备上有安装某个能够匹配ACTION_SEND与MIME类型为text/plain程序，那么Android系统会自动把他们都给筛选出来，并呈现Dialog给用户进行选择。如果你为intent调用了Intent.createChooser()，那么Android总是会显示可供选择。这样有一些好处：

* 即使用户之前为这个intent设置了默认的action，选择界面还是会被显示。
* 如果没有匹配的程序，Android会显示系统信息。
* 你可以指定选择界面的标题。

下面是更新后的代码：

```java
Intent sendIntent = new Intent();
sendIntent.setAction(Intent.ACTION_SEND);
sendIntent.putExtra(Intent.EXTRA_TEXT, "This is my text to send.");
sendIntent.setType("text/plain");
startActivity(Intent.createChooser(sendIntent, getResources().getText(R.string.send_to));
```

效果图如下：

![share-text-screenshot.png](share-text-screenshot.png "Figure 1. Screenshot of ACTION_SEND intent chooser on a handset.")

Optionally,你可以为intent设置一些标准的附加值，例如：EXTRA_EMAIL, EXTRA_CC, EXTRA_BCC, EXTRA_SUBJECT.然而，如果接收程序没有针对那些做特殊的处理，则不会有对应的反应。你也可以使用自定义的附加值，但是除非接收的程序能够识别出来，不然没有任何效果。典型的做法是，你使用被接受程序定义的附加值。

**注意:**一些e-mail程序，例如Gmail,对应接收的是EXTRA_EMAIL与EXTRA_CC，他们都是String类型的，可以使用putExtra(string,string[])方法来添加到intent里面。

## 分享二进制内容(Send Binary Content)

分享二进制的数据需要结合设置特定的`MIME Type`，需要在`EXTRA_STREAM`里面放置数据的URI,下面有个分享图片的例子，这个例子也可以修改用来分享任何类型的二进制数据：

```java
Intent shareIntent = new Intent();
shareIntent.setAction(Intent.ACTION_SEND);
shareIntent.putExtra(Intent.EXTRA_STREAM, uriToImage);
shareIntent.setType("image/jpeg");
startActivity(Intent.createChooser(shareIntent, getResources().getText(R.string.send_to)));
```

**请注意下面的内容：**

* 你可以使用`*/*`这样的方式来制定MIME类型，但是这仅仅会match到那些能够处理一般数据类型的Activity(即一般的Activity无法详尽所有的MIME类型)
* 接收的程序需要有访问URI资源的权限。下面有一些方法来处理这个问题：
	* 把文件写到外部存储设备上，类似SDCard，这样所有的app都可以进行读取。使用Uri.fromFile()方法来创建可以用在分享时传递到intent里面的Uri.。然而，请记住，不是所有的程序都遵循`file://`这样格式的Uri。
	* 在调用 getFileStreamPath()返回一个File之后，使用带有`MODE_WORLD_READABLE` 模式的openFileOutput() 方法把数据写入到你自己的程序目录下。像上面一样，使用Uri.fromFile()创建一个`file://`格式的Uri用来添加到intent里面进行分享。
	* 媒体文件，例如图片，视频与音频，可以使用scanFile()方法进行扫描并存储到MediaStore里面。onScanCompletted()回调函数会返回一个`content://`格式的Uri.，这样便于你进行分享的时候把这个uri放到intent里面。
	* 图片可以使用 insertImage() 方法直接插入到MediaStore 系统里面。那个方法会返回一个`content://`格式的Uri.。
	* 存储数据到你自己的ContentProvider里面，确保其他app可以有访问你的provider的权限。(或者使用 per-URI permissions)

## 发送多块内容(Send Multiple Pieces of Content)

为了同时分享多种不同类型的内容，需要使用`ACTION_SEND_MULTIPLE`与指定到那些数据的URIs列表。MIME类型会根据你分享的混合内容而不同。例如，如果你分享3张JPEG的图片，那么MIME类型仍然是`image/jpeg`。如果是不同图片格式的话，应该是用`image/*`来匹配那些可以接收任何图片类型的activity。如果你需要分享多种不同类型的数据，可以使用`*/*`来表示MIME。像前面描述的那样，这取决于那些接收的程序解析并处理你的数据。下面是一个例子：

```java
ArrayList<Uri> imageUris = new ArrayList<Uri>();
imageUris.add(imageUri1); // Add your image URIs here
imageUris.add(imageUri2);

Intent shareIntent = new Intent();
shareIntent.setAction(Intent.ACTION_SEND_MULTIPLE);
shareIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, imageUris);
shareIntent.setType("image/*");
startActivity(Intent.createChooser(shareIntent, "Share images to.."));
```

当然，请确保指定到数据的URIs能够被接收程序所访问(添加访问权限)。
