# 管理Activity的生命周期

> 原文:<http://developer.android.com/training/basics/activity-lifecycle/index.html>

当用户导航、退出和返回您的应用时，应用中的 [Activity](http://developer.android.com/reference/android/app/Activity.html) 实例将在其生命周期中转换不同状态。 例如，当您的Activity初次开始时，它将出现在系统前台并接收用户焦点。 在这个过程中，Android 系统会对Activity调用一系列生命周期方法，通过这些方法，您可以设置用户界面和其他组件。 如果用户执行开始另一Activity或切换至另一应用的操作，当其进入后台（在其中Activity不再可见，但实例及其状态完整保留），系统会对您的Activity调用另外一系列生命周期方法。

在生命周期回调方法内，您可以声明用户离开和再次进入Activity时的Activity行为。比如，如果您正构建流视频播放器，当用户切换至另一应用时，您可能要暂停视频或终止网络连接。当用户返回时，您可以重新连接网络并允许用户从同一位置继续播放视频。

本课讲述每个 [Activity](http://developer.android.com/reference/android/app/Activity.html) 实例接收的重要生命周期回调方法以及您如何使用这些方法以使您的Activity按照用户预期进行并且当您的Activity不需要它们时不会消耗系统资源。

**完整的Demo示例**：[ActivityLifecycle.zip](http://developer.android.com/shareables/training/ActivityLifecycle.zip)

<!-- more -->

## Lessons

* [**启动与销毁Activity**](starting.html)

  学习有关Activity生命周期、用户如何启动您的应用以及如何执行基本Activity创建操作的基础知识。


* [**暂停与恢复Activity**](pausing.html)

  学习Activity暂停时（部分隐藏）和继续时的情况以及您应在这些状态变化期间执行的操作。


* [**停止与重启Activity**](stopping.html)

  学习用户完全离开您的Activity并返回到该Activity时发生的情况。


* [**重新创建Activity**](recreating.html)

  学习您的Activity被销毁时的情况以及您如何能够根据需要重新构建Activity。
