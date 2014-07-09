> 编写:[yuanfentiank789](https://github.com/yuanfentiank789)

> 校对:

# 创建一个Android项目
一个Android项目由许多源代码文件构成，使用Android SDK Tools可以很容易地创建一个新的Android项目，同时创建好默认的项目相关的目录和文件。

本小节介绍如何使用Eclipse（已安装ADT插件）或SDK Tools命令行来创建一个新的项目。

**注意**：如果你使用Eclipse开发，应该确保已经安装了Android SDK，并且为Eclipse安装了ADT（version 22.6.2或更高版本）插件。否则，请先阅读 [Installing the Android SDK](http://developer.android.com/sdk/installing/index.html "SDK安装")按照向导完成安装。

## 使用Eclipse创建项目

* 点击Eclipse工具栏的`New`按钮.如下图所示
![eclipse-new](eclipse-new.png)

* 在弹出的窗口打开Android文件夹，选择**Android Application Project**，点击**Next**.

* 填写如下图弹出的表格：
![adt-firstapp-setup](adt-firstapp-setup.png)

  **Application Name**:此处填写想呈现给用户的应用名称，此处我们使用“My First App".

  **Project Name**:是项目的文件夹名称和在Eclipse中显示的名称.

  **Package Name**:是应用的包命名空间（同Java的包的概念），该包名在同一Android系统上已安装所有应用包名中具有唯一性，因此，通常使用你所在公司组织或发布实体的反向域名作为包名的开始是一个很好的选择。此处可以使用"com.example.myfirstapp" ，但是你不能在 Google Play上发布使用 "com.example"作为包名的应用.

  **Minimum Required SDK**:用API level表示你的应用支持的最低Android版本，为了支持尽可能多的设备，你应该设置为能支持你应用核心功能的最低API版本。如果某些非核心功能尽在较高版本的API支持，你可以只在支持这些功能的版本上开启它们(参考 [Supporting Different Platform Versions](http://developer.android.com/training/basics/supporting-devices/platforms.html)),此处采用默认值即可。

  **Target SDK**:表示你测试过你的应用支持的最高Android版本(同样用API level表示).当Android发布最新版本后，你应该在最新版本的Android测试你的应用同时更新target sdk到Android最新版本，以便充分利用Android新版本的特性。

  **Compile With**:是你的应用将要编译的目标Android版本，此处默认为你的SDK已安装的最新Android版本(目前应该是4.1或更高版本，如果你没有安装一个可用Android版本，就要先用[SDK Manager](http://developer.android.com/sdk/installing/adding-packages.html)来完成安装)，你仍然可以使用较老的版本编译项目，但把该值设为最新版本，你可以使用Android的最新特性同时可以优化应用来提高用户体验，运行在最新的设备上.

  **Theme**:为你的应用指定界面风格，此处采用默认值即可。

  点击**Next**

* 接下来的窗口配置项目，保持默认值即可，点击**Next**。

* 这一步帮助你给你的应用创建一个启动图标，你也可以自定义应用启动图标，通过用工具为各种屏幕密度的屏幕各创建一个对应图标。但在发布应用之前，应确保你设计的图标符合[Iconography](http://developer.android.com/design/style/iconography.html)中规定的设计规范。点击**Next**。

* 这一步为默认的入口Activity选择一个模板，此处选择**BlankActivity**，然后点击**Next**。

* 这一步保持Activitiy的默认配置即可。

到此为止，你的Android项目已经是一个基本的“Hello World”程序，包含了一些默认的文件。要运行它，继续[下个小节](running-app.html)的学习。

## 使用命令行创建项目

如果你没有使用Eclipse+ADT开发Android项目，也可以在命令行使用SDK提供的tools来创建一个Android项目。

* 打开命令行切换到SDK根目录/tools目录下；

* 执行

```java
    android list targets
```

会在屏幕上打印出所有你使用Android SDK下载好的可用platforms，找到你想要创建项目的目标platform，记录该platform对应的Id，推荐你使用最新的platform，可以使你的应用支持较老版本的platform，同时允许你为最新的Android设备优化你的应用。如果你没有看到任何可用的platform，你需要使用SDK Manager完成下载安装，参见 [Adding Platforms and Packages](http://developer.android.com/sdk/installing/adding-packages.html)。

* 执行

```java
android create project --target <target-id> --name MyFirstApp \
--path <path-to-workspace>/MyFirstApp --activity MainActivity \
--package com.example.myfirstapp
```

替换`target-id`为上一步记录好的Id，替换`path-to-workspace`为你想要保存项目的路径，到此为止，你的Android项目已经是一个基本的“Hello World”程序，包含了一些默认的文件。要运行它，继续[下个小节](running-app.html)的学习。

**Note**:把platform-tools/和 tools/添加到环境变量PATH，开发更方便。
