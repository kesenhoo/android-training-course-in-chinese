# 创建可穿戴的应用

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/wearables/apps/index.html>

可穿戴应用直接运行在穿戴设备上，应用可以直接访问例如传感器与GPU这样的硬件。这些应用和一般的Android应用的基础部分是一致的，只是在设计与可用性还有一些特殊功能上有比较大差异。手持设备与可穿戴设备上的应用主要有下面的一些差异：

* 系统会强制执行超时机制。如果你显示了一个Activity，用户并没有进行操作，设备会进入睡眠状态。当设备唤醒时，穿戴设备会显示主界面而不是你刚才的activity。如果你想要持续的显示一些东西，请使用notification来替代。
* 相比起手持设备的应用，可穿戴应用的界面相对更小，功能也相对更少。他仅仅包含了那些对于可穿戴有意义的功能，这些功能通常是手持设备的一个子集。通常来说，你应该尽可能的把运行操作搬到手持设备上，然后发送操作结果到可穿戴设备。
* 用户不能直接给可穿戴设备安装应用。你需要给手持设备的应用绑定一个可穿戴设备的应用。当用户安装手持设备的应用时，系统会自动安装可穿戴应用。然而，为了开发便利，你还是可以直接安装应用到可穿戴设备。
* 可穿戴应用可以使用大多数的标准Android APIs，除了下面的以外：
    * [android.webkit](http://developer.android.com/reference/android/webkit/package-summary.html)
    * [android.print](http://developer.android.com/reference/android/print/package-summary.html)
    * [android.app.backup](http://developer.android.com/reference/android/app/backup/package-summary.html)
    * [android.appwidget](http://developer.android.com/reference/android/appwidget/package-summary.html)
    * [android.hardware.usb](http://developer.android.com/reference/android/hardware/usb/package-summary.html)

  在使用某个API之前，你可以通过执行[hasSystemFeature()](http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)) 来判断功能是否可用。

> **Note:** 我们推荐使用Android Studio来开发Android Wear的应用，因为它提供了建立工程，添加库依赖，打包程序等等在ADT上没有的功能。下面的培训课程的前提是假设你已经在使用Android Studio了。

## Lessons
* [创建并执行可穿戴应用(Creating and Running a Wearable App)](creating.html)

  学习如何创建一个包含了可穿戴与手持应用的Android Studio工程。学习如何在设备或者模拟器上执行程序。


* [创建自定义的布局(Creating Custom Layouts)](layouts.html)

  学习如何为notification与activiyt，创建并显示一个自定义的布局


* [添加语言能力(Adding Voice Capabilities)](voice.html)

  学习如何使用语音指令启动一个activity，学习如何启动系统语音识别应用来获取用户的语音输入。


* [打包可穿戴应用(Packaging Wearable Apps)](packaging.html)

  学习如何把可穿戴应用打包到手持应用上。这使得系统能够在安装Google Play上的手持应用时自动安装可穿戴应用。


* [通过蓝牙进行调试(Debugging over Bluetooth)](bt-debugging.html)

  学习如何通过蓝牙而不是USB来调试你的可穿戴应用。

