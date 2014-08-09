# 建立文件分享

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/setup-sharing.html>

为了从你的应用安全地将一个文件发送给另一个应用，你需要配置你的应用来提供安全的文件句柄（URI的形式），Android的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)组件会基于你在XML文件中的具体配置，为文件创建URI。这节课会向你展示如何在你的应用添加[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)的默认的实现，以及如何指定你要共享的文件。

> **Note:**[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)是[v4 Support Library](http://developer.android.com/tools/support-library/features.html#v4)中的。关于如何在你的应用中包含此库，可以阅读：[Support Library Setup](http://developer.android.com/tools/support-library/setup.html)。

## 指定FileProvider

为你的应用定义一个[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)，需要在你的清单文件中定义一个字段，这个字段指明了需要使用创建URI的权限。除此之外，还需要一个XML文件，它指定了你的应用可以共享的目录路径。

下面的例子展示了如何在清单文件中添加[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签，来指定[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)类，权限和XML文件名：

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
这里，[android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth)属性字段指定了你希望使用由[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)生成的URI的authority。在这个例子中，这个authority是“com.example.myapp.fileprovider”。对于你自己的应用，定义authority时，是在你的应用包名（[android:package](http://developer.android.com/guide/topics/manifest/manifest-element.html#package)的值）之后追加“fileprovider”。为了学习更多关于authority的知识，可以阅读：[Content URIs](http://developer.android.com/guide/topics/providers/content-provider-basics.html#ContentURIs)，以及[android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth)。

[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)下的子标签[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)指定了一个XML文件，它指定了你希望共享的目录路径。“android:resource”属性字段是这个文件的路径和名字（无“.xml”后缀）。该文件的内容将在下一节讨论。

## 指定可共享目录路径

一旦你在你的清单文件中为你的应用添加了[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)，你需要指定你希望共享文件的目录路径。为了指定这个路径，我们首先在“res/xml/”下创建文件“filepaths.xml”。在这个文件中，为每一个目录添加一个XML标签。下面的例子展示的是一个“res/xml/filepaths.xml”的例子。这个例子也说明了如何在你的内部存储区域共享一个“files/”目录的子目录：

```xml
<paths>
    <files-path path="images/" name="myimages" />
</paths>
```

在这个例子中，`<files-path>`标签共享的是在你的应用的内部存储中“files/”目录下的目录。“path”属性字段指出了该子目录为“files/”目录下的子目录“images/”。“name”属性字段告知[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)向在“files/images/”子目录中的文件URI添加一个路径分段（path segment）标记：“myimages”。

`<paths>`标签可以有多个子标签，每一个子标签都指定一个不同的要共享的目录。除了`<files-path>`标签，你可以使用`<external-path>`来分享位于外部存储的文件，而`<cache-path>`标签用来共享在你的内部缓存目录下的目录。学习更多关于指定共享目录的子标签的知识，可以阅读：[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)。

>** Note：**XML文件是你定义共享目录的唯一方式，你不可以以代码的形式添加目录。

现在你有一个完整的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)说明，它在你应用的内部存储中“files/”目录下创建文件的URI，或者是在“files/”中的子目录内的文件创建URI。当你的应用为一个文件创建了URI，它就包含了在[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签中指定的Authority（“com.example.myapp.fileprovider”），路径“myimages/”，和文件的名字。

例如，如果你根据这节课的例子定义了一个[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)，然后你需要一个文件“default_image.jpg”的URI，[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)会返回如下URI：

```
content://com.example.myapp.fileprovider/myimages/default_image.jpg
```
