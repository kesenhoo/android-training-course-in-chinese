> 编写: [kesenhoo](https://github.com/kesenhoo) - 校对:

> 原文: <http://developer.android.com/training/wearables/apps/creating.html>

# 创建并执行可穿戴应用

可穿戴应用可以直接运行在可穿戴的设备上。拥有访问类似传感器的硬件权限，还有操作activity，services等权限。

你无法直接发布可穿戴应用到Google Play商城，需要利用手持应用来达到目的。因为可穿戴的设备不支持Google Play商城，所以当用户下载手持设备应用的时候，，会自动安装可穿戴应用到可穿戴设备上。手持应用还可以用来处理一些复杂繁重的任务，网络指令，或者其他的任务，最好发送操作结果返回给可穿戴设备。

这节课会介绍如何创建一个包含了手持应用与可穿戴应用的工程。

## 搭建Android Wear模拟器或者真机设备。

我们推荐在真机上进行开发，这样可以更好的评估用户体验。然而，模拟器可以使得你在不同类型的设备屏幕上进行模拟，这对测试来说更加有用。

### 建立Android Wear虚拟设备

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
    * 在你的手持设备上，从Google Play安装你的Android Wear应用。
    * 通过USB连接你的手持设备到你的电脑。
    * 切换AVD的接口到手持设备(这个步骤需要每次连接都执行)
    ```git
    adb -d forward tcp:5601 tcp:5601
    ```
    * 启动手持设备上的Android Wear应用，并连接到模拟器。
    * 点击右上角的菜单，选择Demo Cards。
    * 你选择的卡片呈现在模拟器上会类似一个Notification。

### 建立Android Wear真机

建立Android Wear真机，需要下面几个步骤：

* 在你的手持设备的Google Play上安装Android Wear应用。
* 按照应用的命令指示与你的可穿戴设备进行匹对。如果你有做建立notification的操作，这个步骤可以测试这一功能。
* 保持Android Wear应用在手机上的打开状态。
* 通过USB连接可穿戴设备到电脑上，这样你能够直接安装应用到可穿戴设备上。在可穿戴设备与Android Wear应用上会显示一个消息提示，是否允许进行调试。
* 在Android Wear应用上，总是选择允许连接。

Android Studio上的Tool的窗口可以显示可穿戴设备的日志。当你执行`adb devices`命令的时候，也可以看到wearable的存在。

