# 建立文件分享

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/setup-sharing.html>

为了将文件安全地从我们的应用程序共享给其它应用程序，我们需要对自己的应用进行配置来提供安全的文件句柄（Content URI的形式）。Android的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)组件会基于在XML文件中的具体配置为文件创建Content URI。本课将介绍如何在应用程序中添加[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)的默认实现，以及如何指定要共享的文件。

> **Note:**[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)类隶属于[v4 Support Library](http://developer.android.com/tools/support-library/features.html#v4)库。关于如何在应用程序中包含该库，请参考：[Support Library Setup](http://developer.android.com/tools/support-library/setup.html)。

## 指定FileProvider

为了给应用程序定义一个[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)，需要在Manifest清单文件中定义一个entry，该entry指明了需要使用的创建Content URI的Authority。此外，还需要一个XML文件的文件名，该XML文件指定了我们的应用可以共享的目录路径。

下例展示了如何在清单文件中添加[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签，来指定[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)类，Authority及XML文件名：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp">
    <application
        ...>
        <provider
            android:name="android.support.v4.content.FileProvider"
            android:authorities="com.example.myapp.fileprovider"
            android:grantUriPermissions="true"
            android:exported="false">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/filepaths" />
        </provider>
        ...
    </application>
</manifest>
```
这里，[android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth)字段指定了希望使用的Authority，该Authority针对于[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)所生成的content URI。本例中的Authority是“com.example.myapp.fileprovider”。对于自己的应用，要在我们的应用程序包名（[android:package](http://developer.android.com/guide/topics/manifest/manifest-element.html#package)的值）之后继续追加“fileprovider”来指定Authority。要更多关于Authority的知识，请参考：[Content URIs](http://developer.android.com/guide/topics/providers/content-provider-basics.html#ContentURIs)，以及[android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth)。

[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)下的[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)指向了一个XML文件，该文件指定了我们希望共享的目录路径。“android:resource”属性字段是这个文件的路径和名字（无“.xml”后缀）。该文件的内容将在下一节讨论。

## 指定可共享目录路径

一旦在Manifest清单文件中为自己的应用添加了[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)，就需要指定我们希望共享文件的目录路径。为指定该路径，首先要在“res/xml/”下创建文件“filepaths.xml”。在这个文件中，为每一个想要共享目录添加一个XML标签。下面的是一个“res/xml/filepaths.xml”的内容样例。这个例子也说明了如何在内部存储区域共享一个“files/”目录的子目录：

```xml
<paths>
    <files-path path="images/" name="myimages" />
</paths>
```

在这个例子中，`<files-path>`标签共享的是在我们应用的内部存储中“files/”目录下的目录。“path”属性字段指出了该子目录为“files/”目录下的子目录“images/”。“name”属性字段告知[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)在“files/images/”子目录中的文件的Content URI添加路径分段（path segment）标记：“myimages”。

`<paths>`标签可以有多个子标签，每一个子标签用来指定不同的共享目录。除了`<files-path>`标签，还可以使用`<external-path>`来共享位于外部存储的目录；另外，`<cache-path>`标签用来共享在内部缓存目录下的子目录。更多关于指定共享目录子标签的知识请参考：[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)。

> **Note:** XML文件是我们定义共享目录的唯一方式，不可以用代码的形式添加目录。

现在我们有一个完整的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)声明，它在应用程序的内部存储中“files/”目录或其子目录下创建文件的Content URI。当我们的应用为一个文件创建了Content URI，该Content URI将会包含下列信息：
- [`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签中指定的Authority（“com.example.myapp.fileprovider”）；
- 路径“myimages/”；
- 文件的名字。

例如，如果本课的例子定义了一个[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)，然后我们需要一个文件“default_image.jpg”的Content URI，[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)会返回如下URI：

```
content://com.example.myapp.fileprovider/myimages/default_image.jpg
```
