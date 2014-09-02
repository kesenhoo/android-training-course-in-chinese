# 分享文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/secure-file-sharing/index.html>

一个应用经常需要向其他应用发送一个甚至多个文件。例如，一个图库应用可能需要向图片编辑器提供多个文件，或者一个文件管理器可能希望允许用户在外部存储的不同区域之间复制粘贴文件。这里，我们提出一种让应用可以分享文件的方法，即对应用所发出的文件请求进行响应。

在所有情况下，唯一的一个将文件从你的应用发送至另一个应用的安全方法是向接收文件的应用发送这个文件的URI，然后对这个URI授予临时的可访问权限。具有URI临时访问权限的URI是安全的，因为访问权限只授权于接收这个URI的应用，并且它们会自动过期。Android的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)组件提供了[getUriForFile()](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile\(android.content.Context, java.lang.String, java.io.File\))方法来创建一个文件的URI。

如果你希望在应用之间共享少量的文本或者数字的数据，你应该发送一个包含该数据的Intent。要学习如何通过Intent发送简单数据，可以阅读：[Sharing Simple Data](../sharing/index.html)。

这系列课程将会介绍如何使用Android的[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html)组件创建的URI，以及如何向接收URI的应用授予的临时访问权限，来安全地在应用之间共享文件。

## Lessons

* [**建立文件分享**](setup-sharing.html)

  学习如何为分享文件初始化你的app。


* [**分享文件**](sharing-file.html)

  学习如何通过生成文件的content URI来传递文件到其他的app。


* [**请求分享一个文件**](request-file.html)

  学习如何通过其他app发出文件分享的请求，如何通过URI接收文件以及如何使用URI打开文件。


* [**获取文件信息**](retrieve-info.html)

  学习应用如何通过FileProvider提供的content URI获取文件的信息：例如MIME类型，文件大小等。
