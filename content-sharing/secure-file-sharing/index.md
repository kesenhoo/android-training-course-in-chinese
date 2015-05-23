# 分享文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/index.html>

一个程序经常需要向其他程序提供一个甚至多个文件。例如，当我们用图片编辑器编辑图片时，被编辑的图片往往由图库应用程序所提供；再比如，文件管理器会允许用户在外部存储的不同区域之间复制粘贴文件。这里，我们提出一种让应用程序可以分享文件的方法：即令发送文件的应用程序对索取文件的应用程序所发出的文件请求进行响应。

在任何情况下，将文件从我们的应用程序发送至其它应用程序的唯一的安全方法是向接收文件的应用程序发送这个文件的content URI，并对该URI授予临时访问权限。具有URI临时访问权限的content URI是安全的，因为他们仅应用于接收这个URI的应用程序，并且会自动过期。Android的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)组件提供了<a href="http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile(android.content.Context, java.lang.String, java.io.File)">getUriForFile()</a>方法创建一个文件的content URI。

如果希望在应用之间共享少量的文本或者数字等类型的数据，应使用包含该数据的Intent。要学习如何通过Intent发送简单数据，可以阅读：[Sharing Simple Data](../sharing/index.html)。

本课主要介绍了如何使用Android的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)组件所创建的content URI在应用之间安全的共享文件。当然，要做到这一点，还需要给接收文件的应用程序访问的这些content URI授予临时访问权限。

## Lessons

* [**建立文件分享**](setup-sharing.html)

  学习如何配置应用程序使得它们可以分享文件。


* [**分享文件**](sharing-file.html)

  学习分享文件的三个步骤：
  - 生成文件的content URI；
  - 授予URI的临时访问权限；
  - 将URI发送给接收文件的应用程序。


* [**请求分享一个文件**](request-file.html)

  学习如何向其他应用程序请求文件，如何接收该文件的content URI，以及如何使用content URI打开该文件。


* [**获取文件信息**](retrieve-info.html)

  学习应用程序如何通过FileProvider提供的content URI获取文件的信息：例如MIME类型，文件大小等。
