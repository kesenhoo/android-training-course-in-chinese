# 创建并运行可穿戴应用

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/wearables/apps/creating.html>

可穿戴应用可以直接运行在可穿戴的设备上。拥有访问类似传感器的硬件权限，还有操作activity，services等权限。

当我们想要将可穿戴设备应用发布到Google Play商店时，我们需要有该应用的配套手持设备应用。因为可穿戴设备不支持Google Play商店，所以当用户下载配套手持设备应用的时候，会自动安装可穿戴应用到可穿戴设备上。手持设备应用还可以用来处理一些繁重的任务、网络指令或者其它工作，和发送操作结果给可穿戴设备。

这节课会介绍如何安装一个设备或者模拟器，和如何创建一个包含了手持应用与可穿戴应用的工程。

## 升级 SDK

在开始建立可穿戴设备应用前，必须：

* **将SDK工具升级到23.0.0或者更高的版本**

　　升级后的SDK工具使我们可以建立和测试可穿戴应用。

* **将SDK升级到 Android 4.4W.2(API 20) 或者更高**

　　升级后的平台版本为可穿戴应用提供了新的 API。

想要了解如何升级SDK，请查看[Get the latest SDK tools](http://developer.android.com/sdk/installing/adding-packages.html#GetTools)。

## 搭建Android Wear模拟器或者真机设备。

我们推荐在真机上进行开发，这样可以更好地评估用户体验。然而，模拟器可以使我们在不同类型的设备屏幕上进行模拟，这对测试来说非常有用。

### 搭建Android Wear虚拟设备

建立Android Wear虚拟设备需要下面几个步骤：

1. 点击**Tools > Android > AVD Manager**。
2. 点击**Create Virtual Device...**。
	1. 点击Category列表的**Wear**选项。
	2. 选择Android Wear Square或者Android Wear Round。
	3. 点击**Next**按钮。
	4. 选择一个release name（例如，KitKat Wear）。
	5. 点击**Next**按钮。
	6. （可选）改变虚拟设备的首选项。
	7. 点击**Finish**按钮。
3. 启动模拟器:
	1. 选择我们刚才创建的虚拟设备。
	2. 点击**Play**按钮。
	3. 等待模拟器初始化直到显示Android Wear的主界面。
4. 匹配手持和模拟器:
	1. 在我们的手持设备上，从Google Play安装Android Wear应用。
	2. 通过USB将手持设备连接到电脑。
	3. 切换AVD的通信端口到已连接的手持设备(每次连接上手持设备时都要执行这个步骤)：
    ```git
    adb -d forward tcp:5601 tcp:5601
    ```
	4. 启动手持设备上的Android Wear应用，并连接到模拟器。
	5. 点击Android Wear应用右上角的菜单，选择**Demo Cards**。
	6. 我们选择的卡片会以Notification的形式呈现在模拟器的主页上。

### 搭建Android Wear真机

建立Android Wear真机，需要下面几个步骤：

1. 在手持设备的Google Play上安装Android Wear应用。
2. 按照应用的命令指示与我们的可穿戴设备进行配对。如果你有做建立notification的操作，这个步骤刚好可以测试这一功能。
3. 保持Android Wear应用在手机上的打开状态。
4. 打开Android Wear设备的adb调试开关。
	1. 选择**Settings > About**。
	2. 点击**Build number** 7次。
	3. 右滑返回到Setting菜单。
	4. 进入屏幕底部的**Developer options**。
	5. 点击**ADB Debugging**来打开adb。
5. 通过USB连接可穿戴设备到电脑上，这样我们能够直接安装应用到可穿戴设备上。此时，在可穿戴设备与Android Wear应用上会显示一个消息，提示是否允许进行调试。
6. 在Android Wear应用上，选择**Always allow from this computer**并且点击**OK**。

Android Studio上的**Android** Tool窗口可以显示可穿戴设备的日志。当你执行`adb devices`命令的时候，可穿戴设备应该会出现在该窗口中。

## 创建工程

在开始开发之前，需要创建一个包含可穿戴应用与手持应用这两个模块的工程。在Android Studio中，点击**File** > **New Project**，然后按照[创建工程](http://developer.android.com/sdk/installing/create-project.html)的指引进行操作。在我们按照安装向导操作的过程中，输入下面的信息：

1. 在**Configure your Project**窗口里，输入应用的名称与一个包名。
2. 在**Form Factors**窗口中:
    * 勾选**Phone and Tablet**并在**Minimum SDK**下拉菜单中选择**API 9: Android 2.3 (Gingerbread)**。
    * 勾选**Wear**并在**Minimum SDK**下拉菜单中选择**API 20: Android 4.4 (KitKat Wear)**。
3. 在第一个**Add an Activity**窗口，为手机应用添加一个空白的activity。
4. 在第二个**Add an Activity**窗口，为可穿戴应用添加一个空白的activity。

当安装向导完成后，Andorid Studio创建了一个包含**mobile**与**wear**两个模块的工程。现在，我们有一个工程可以在手持设备和可穿戴设备应用中创建activity，service，layout等。在手持应用里面，需要承担大部分繁重的任务，例如网络请求，密集计算任务或者是需要大量用户交互的任务。待这些任务完成之后，通常会把任务结果通过notification发送给可穿戴设备上，或者是通过同步机制发送数据给可穿戴设备。

> **Note:** 可穿戴模块包含了一个"Hello World"的activity，它是使用`WatchViewStub`类。该类根据设备屏幕是圆的还是方的来填充一个布局。`WatchViewStub`类是[wearable support library](http://hukai.me/android-training-course-in-chinese/wearables/apps/layouts.html#UiLibrary)中的一个UI组件。

## 安装可穿戴应用

在开发过程中，我们可以像安装手持应用一样直接将应用安装到可穿戴设备上。可以使用`adb install`命令，也可以使用Android Studio上面的**Play**按钮。

当需要把应用发布给用户的时候，需要把可穿戴应用打包到手持应用中。当用户从Google Play安装手持应用时，连接上的可穿戴设备会自动收到可穿戴应用。

> **Note:** 如果我们给应用签名是debug key，是无法完成自动安装可穿戴应用的（只有release key才可以）。请参考[打包可穿戴应用](packaging.html)获取更多信息，学习如何正确的打包。

为了安装"Hello World"应用到可穿戴设备，在Android Studiod的**Run/Debug configuration**的下拉菜单中选中**wear**，点击**Play**按钮即可。在可穿戴设备上会显示activity并打印"Hello world!"

## include正确的libraries

项目安装向导会自动把合适的模块依赖添加到对应的`build.gradle`文件中。然而，这些依赖并不是必须的，请阅读下面描述判断是否需要这些依赖。

**Notifications**

[The Android v4 support library](http://developer.android.com/tools/support-library/features.html#v4) (或者v13)包含一些API，这些API可以将手持设备应用已经存在的notification扩展到可穿戴应用上。

对于只显示在可穿戴设备上的notification(这意味着，他们是由直接执行在可穿戴设备上的app进行处理的)，我们可以在Wear模块仅仅使用标准APIs (API Level 20) 并且把Mobile模块的support library依赖移除。

**Wearable Data Layer**

可穿戴与手持设备之间进行同步与发送数据需要使用Wearable Data Layer APIs, 这需要用到最新版本的[Google Play Services](http://developer.android.com/google/play-services/setup.html)。如果我们不需要这些APIs，可以从这两个模块中把这部分的依赖移除。

**Wearable UI support library**

这是一个非官方正式的library，它包含了[为可穿戴设备设计的UI组件](http://hukai.me/android-training-course-in-chinese/wearables/apps/layouts.html#UiLibrary)。我们鼓励你在你的应用中使用他们，因为这些组件是最佳实践的例证。但是他们可能随时发生变化。然而，如果library有更新，你的应用并不会发送崩溃，因为那些代码已经编译到你的应用中了。为了获取更新包中新的功能，你只需要更新链接到新的版本并相应的更新你的应用就好了。这个library只是在你需要创建可穿戴应用时才会使用到。

在下一节课，我们将会学习如何创建为可穿戴设备设计的布局，同时学习如何使用各种语音action。