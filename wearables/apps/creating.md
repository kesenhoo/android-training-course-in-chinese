# 创建并执行可穿戴应用

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/wearables/apps/creating.html>

可穿戴应用可以直接运行在可穿戴的设备上。拥有访问类似传感器的硬件权限，还有操作activity，services等权限。

你无法直接发布可穿戴应用到Google Play商城，需要利用手持应用来达到目的。因为可穿戴的设备不支持Google Play商城，所以当用户下载手持设备应用的时候，，会自动安装可穿戴应用到可穿戴设备上。手持应用还可以用来处理一些复杂繁重的任务，网络指令，或者其他的任务，最好发送操作结果返回给可穿戴设备。

这节课会介绍如何创建一个包含了手持应用与可穿戴应用的工程。

## 搭建Android Wear模拟器或者真机设备。

我们推荐在真机上进行开发，这样可以更好的评估用户体验。然而，模拟器可以使得你在不同类型的设备屏幕上进行模拟，这对测试来说更加有用。

### 搭建Android Wear虚拟设备

建立Android Wear虚拟设备需要下面几个步骤：

1. 点击**Tools** > **Android** > **AVD Manager**.
2. 点击**Create**....
3. 填写下面几项详细的设置，其余选项保留默认：
    * **AVD Name** - AVD的名字
    * **Device** - Android Wear圆形还是方形
    * **Target** - Android 4.4W - API Level 20
    * **CPU/ABI** - Android Wear ARM (armeabi-v7a)
    * **Keyboard** - 选择Hardware keyboard present
    * **Skin** - 圆形还是方形取决于选择的设备类型
    * **Snapshot** - 不勾选 selected
    * **Use Host GPU** - 勾选，为了支持自定义的activity能够显示可穿戴的notification。
4. 点击**OK.**
5. 启动模拟器:
    * 选择你刚才创建的虚拟设备
    * 点击**Start**...，然后选择**Launch.**
    * 等待模拟器初始化直到显示Android Wear的主界面。
6. 匹配你的手持和模拟器:
    * 在你的手持设备上，从Google Play安装`Android Wear`应用(这是一个由Google公司写的用来匹配的应用)
    * 通过USB连接你的手持设备到你的电脑。
    * 切换AVD的接口到手持设备(这个步骤需要每次连接都执行)
    ```git
    adb -d forward tcp:5601 tcp:5601
    ```
    * 启动手持设备上的`Android Wear`应用，并连接到模拟器。
    * 点击右上角的菜单，选择Demo Cards。
    * 你选择的卡片呈现在模拟器上会类似一个Notification。

### 搭建Android Wear真机

建立Android Wear真机，需要下面几个步骤：

* 在你的手持设备的Google Play上安装`Android Wear`应用。
* 按照应用的命令指示与你的可穿戴设备进行匹对。如果你有做建立notification的操作，这个步骤刚好可以测试这一功能。
* 保持`Android Wear`应用在手机上的打开状态。
* 通过USB连接可穿戴设备到电脑上，这样你能够直接安装应用到可穿戴设备上。在可穿戴设备与`Android Wear`应用上会显示一个消息提示，是否允许进行调试。
* 在`Android Wear`应用上，总是选择允许连接。

Android Studio上的Tool的窗口可以显示可穿戴设备的日志。当你执行`adb devices`命令的时候，也可以看到wearable的存在。

## 创建Wear项目

在开始开发之前，需要创建一个项目包含可穿戴应用与手持应用这两个模块。在Android Studio中，点击**File** > **New Project** 然后按照[创建项目](http://developer.android.com/sdk/installing/create-project.html)的指引进行操作。如果你按照安装向导操作，需要输入下面的信息：

1. 在确认项目的窗口，输入你的应用的名称与包名。
2. 在应用参数选择窗口:
    * 勾选Phone 与 Tablet 并选择API 8: Android 2.2 (Froyo) 作为Minimum SDK.
    * 勾选可穿戴并选择API 20: Android 4.4 (KitKat Wear) 作为Minimum SDK.
3. 在第一个添加activity的窗口，选择为Mobile模块添加一个空白的activity。
4. 在第二个添加activity的窗口，选择为Wear模块添加一个空白的activity。

当安装向导完成后，Andorid Studio创建了一个包含Mobile与Wear两个模块的项目。你可以在这2个模块中各自创建activity，service，layout等等。在手持应用里面，需要承担大部分繁重的任务，例如网络请求，密集计算任务或者是需要大量用户交互的任务。待这些任务完成之后，再通常把任务结果通过notification发送给可穿戴设备上，或者是通过同步机制发送数据给可穿戴设备。

> **Note:** 可穿戴模块包含了一个"Hello World"的activity，它是使用`WatchViewStub`的布局。WatchViewStub是可穿戴support library中的一个UI组件。

## 安装可穿戴应用

在开发过程中，你可以像安装手持应用一样直接安装可穿戴应用。可以使用`adb install`命令也可以使用Android Studio上面的Play按钮。

当需要把应用发布给用户的时候，你需要把可穿戴应用打包到手持应用中。当用户从Google Play安装手持应用时，连接上得可穿戴设备会自动收到可穿戴应用。

> **Note:** 如果你给应用签名是Debug Key，是无法完成自动安装可穿戴应用的。请参考[打包可穿戴应用](packaging.html)获取更多信息，学习如何正确的打包。

为了安装"Hello World"应用到可穿戴设备，在Android Studiod的Run/Debug的下拉选项中选中Wear模块，点击Play按钮即可。在可穿戴设备上会显示activity并打印"Hello world!"

## include需要的libraries

项目安装向导会自动把合适的模块依赖添加到对应的build.gradle文件中。然而，这些依赖并不是必须得，请阅读下面描述判断你是否需要这些依赖。

* **Notifications**

  [The Android v4 support library](http://developer.android.com/tools/support-library/features.html#v4) (or v13)能够支持运行在手持应用的notification也能够在可穿戴设备上显示。

 对于只显示在可穿戴设备上得notification(这意味着，他们是由直接执行在可穿戴设备上得app进行处理的)，你可以在Wear模块仅仅使用标准APIs (API Level 20) 并且把Mobile模块的依赖support library移除。

* **Wearable Data Layer**

  可穿戴与手持设备之间进行同步与发送数据需要使用Wearable Data Layer APIs, 你需要最新版本的[Google Play Services](http://developer.android.com/google/play-services/setup.html)。如果你不需要这些APIs，可以从这两个模块中把这部分的依赖移除。

* **Wearable UI support library**

  这是一个非官方正式的library，它包含了为可穿戴设备设计的UI组件。我们鼓励你在你的应用中使用他们。因为这些组件是最佳实践的例证。但是他们可能随时发生变化。然而，如果library有更新，你的应用并不会发送崩溃，因为那些代码已经编译到你的应用中了。为了获取更新包中新的功能，你只需要更新链接到新的版本并相应的更新你的应用就好了。这个library只是在你需要创建可穿戴应用时才会使用到。

