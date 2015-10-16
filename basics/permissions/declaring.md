# 声明权限

> 编写:[NothingOne](https://github.com/NothingOne) - 原文:<http://developer.android.com/training/permissions/declaring.html>

每个Android应用程序都运行在一个有访问限制的沙盒中。如何一个应用程序需要使用它自己的沙盒以外的资源或信息，那么它必须请求响应的权限。你要在[App Manifest](http://developer.android.com/guide/topics/manifest/manifest-intro.html)的权限列表中声明你的应用程序需要的权限。

根据权限的敏感程度，系统自动授予权限或者设备用户授予权限。举个例子，如果你的应用程序请求打开设备手电筒的权限，系统就会自动授予权限。如果你的应用程序需要读取用户的联系人，则系统会询问用户是否批准权限。根据不同的平台版本，用户在安装应用程序时（在Android5.1及以下版本），或在应用程序运行时（在Android6.0及更高版本）授予权限。


## 确定你的应用程序需要什么权限（Determine What Permissions Your App Needs）


## 在Manifest中加入权限（Add Permissions to the Manifest）

