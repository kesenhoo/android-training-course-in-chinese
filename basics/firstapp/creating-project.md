# 创建Android项目

> 编写:[yuanfentiank789](https://github.com/yuanfentiank789) - 原文:<http://developer.android.com/training/basics/firstapp/creating-project.html>

一个Android项目包含了所有构成Android应用的源代码文件。

本小节介绍如何使用Android Studio或者是SDK Tools中的命令行来创建一个新的项目。

> **Note**：在此之前，我们应该已经安装了Android SDK，如果使用Android Studio开发，应该确保已经安装了[Android Studio](http://developer.android.com/sdk/installing/studio.html)。否则，请先阅读 [Installing the Android SDK](http://developer.android.com/sdk/installing/index.html)按照向导完成安装步骤。

## 使用Android Studio创建项目

1\. 使用Android Studio创建Android项目，启动Android Studio。

* 如果我们还没有用Android Studio打开过项目，会看到欢迎页，点击New Project。
* 如果已经用Android Studio打开过项目，点击菜单中的File，选择New Project来创建一个新的项目。

2\.  参照图1在弹出的窗口（**Configure your new project**）中填入内容，点击**Next**。按照如图所示的值进行填写会使得后续的操作步骤不不容易差错。

* **Application Name**此处填写想呈现给用户的应用名称，此处我们使用“My First App”。
* **Company domain** 包名限定符，Android Studio会将这个限定符应用于每个新建的Android项目。
* **Package Name**是应用的包命名空间（同Java的包的概念），该包名在同一Android系统上所有已安装的应用中具有唯一性，我们可以独立地编辑该包名。
* **Project location**操作系统存放项目的目录。

![studio-setup-1](studio-setup-1.png)
**图1** Configure your new project

3\. 在**Select the form factors your app will run on**窗口勾选**Phone and Tablet**。

4\. **Minimum SDK**, 选择 **API 8: Android 2.2 (Froyo)**. Minimum Required SDK表示我们的应用支持的最低Android版本，为了支持尽可能多的设备，我们应该设置为能支持你应用核心功能的最低API版本。如果某些非核心功能仅在较高版本的API支持，你可以只在支持这些功能的版本上开启它们(参考[兼容不同的系统版本](../supporting-devices/platforms.html)),此处采用默认值即可。

5\. 不要勾选其他选项 (TV, Wear, and Glass) ，点击 **Next**.

6\. 在**Add an activity to *<template\>*** 窗口选择**Basic Activity**，点击 **Next**.

7\. 在**Choose options for your new file** 窗口修改**Activity Name** 为*MyActivity*，修改 **Layout Name** 为*activity\_my*，**Title** 修改为*MyActivity*，**Menu Resource Name** 修改为*menu_my*。

8\. 点击**Finish**完成创建。

刚创建的Android项目是一个基础的Hello World项目，包含一些默认文件，我们花一点时间看看最重要的部分：

`app/src/main/res/layout/activity_my.xml`

这是刚才用Android Studio创建项目时新建的Activity对应的xml布局文件，按照创建新项目的流程，Android Studio会同时展示这个文件的文本视图和图形化预览视图，该文件包含一些默认设置和一个显示内容为“Hello world!”的TextView元素。

`app/src/main/java/com.mycompany.myfirstapp/MyActivity.java`

用Android Studio创建新项目完成后，可在Android Studio看到该文件对应的选项卡，选中该选项卡，可以看到刚创建的Activity类的定义。编译并运行该项目后，Activity启动并加载布局文件activity_my.xml，显示一条文本："Hello world!"

`app/src/main/AndroidManifest.xml`

[manifest](http://developer.android.com/guide/topics/manifest/manifest-intro.html)文件描述了项目的基本特征并列出了组成应用的各个组件，接下来的学习会更深入了解这个文件并添加更多组件到该文件中。

`app/build.gradle`

Android Studio使用Gradle 编译运行Android工程. 工程的每个模块以及整个工程都有一个build.gradle文件。通常你只需要关注模块的build.gradle文件，该文件存放编译依赖设置，包括defaultConfig设置：

* compiledSdkVersion
是我们的应用将要编译的目标Android版本，此处默认为你的SDK已安装的最新Android版本(目前应该是4.1或更高版本，如果你没有安装一个可用Android版本，就要先用[SDK Manager](http://developer.android.com/sdk/installing/adding-packages.html)来完成安装)，我们仍然可以使用较老的版本编译项目，但把该值设为最新版本，可以使用Android的最新特性，同时可以在最新的设备上优化应用来提高用户体验。
* applicationId 创建新项目时指定的包名。
* minSdkVersion 创建项目时指定的最低SDK版本，是新建应用支持的最低SDK版本。
* targetSdkVersion 表示你测试过你的应用支持的最高Android版本(同样用API level表示).当Android发布最新版本后，我们应该在最新版本的Android测试自己的应用同时更新target sdk到Android最新版本，以便充分利用Android新版本的特性。更多知识，请阅读[Supporting Different Platform Versions](http://developer.android.com/training/basics/supporting-devices/platforms.html)。


更多关于Gradle的知识请阅读[Building Your Project with Gradle](http://developer.android.com/sdk/installing/studio-build.html)

注意/res目录下也包含了[resources](http://developer.android.com/guide/topics/resources/overview.html)资源：

`drawable<density>/`

存放各种densities图像的文件夹，mdpi，hdpi等，这里能够找到应用运行时的图标文件ic_launcher.png

`layout/`

存放用户界面文件，如前边提到的activity_my.xml，描述了MyActivity对应的用户界面。

`menu/`

存放应用里定义菜单项的文件。

`values/`

存放其他xml资源文件，如string，color定义。string.xml定义了运行应用时显示的文本"Hello world!"

要运行这个APP，继续[下个小节](running-app.html)的学习。

## 使用命令行创建项目

如果没有使用Android Studio开发Android项目，我们可以在命令行使用SDK提供的tools来创建一个Android项目。

1\. 打开命令行切换到SDK根目录下；

2\. 执行:

```java
tools/android list targets
```

会在屏幕上打印出我们所有的Android SDK中下载好的可用Android  platforms，找想要创建项目的目标platform，记录该platform对应的Id，推荐使用最新的platform。我们仍可以使自己的应用支持较老版本的platform，但设置为最新版本允许我们为最新的Android设备优化我们的应用。
如果没有看到任何可用的platform，我们需要使用Android SDK Manager完成下载安装，参见 [Adding Platforms and Packages](http://developer.android.com/sdk/installing/adding-packages.html)。

3\. 执行：

```java
android create project --target <target-id> --name MyFirstApp \
--path <path-to-workspace>/MyFirstApp --activity MyActivity \
--package com.example.myfirstapp
```

替换`<target-id>`为上一步记录好的Id，替换`<path-to-workspace>`为我们想要保存项目的路径。

> **Tip**:把`platform-tools/`和 `tools/`添加到环境变量`PATH`，开发更方便。

到此为止，我们的Android项目已经是一个基本的“Hello World”程序，包含了一些默认的文件。要运行它，继续[下个小节](running-app.html)的学习。
