# 管理Activity的生命周期

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/activity-lifecycle/index.html>

当用户进入，退出，回到你的App，在程序中的[Activity](http://developer.android.com/reference/android/app/Activity.html) 实例都经历了生命周期中的不同状态。例如，当你的activity第一次启动的时候，它来到系统的前台，开始接受用户的焦点。在此期间，Android系统调用了一系列的生命周期中的方法。如果用户执行了启动另一个activity或者切换到另一个app的操作, 系统又会调用一些生命周期中的方法。

在生命周期的回调方法里面，你可以声明当用户离开或者重新进入这个Activity所需要执行的操作。例如, 如果你建立了一个streaming video player, 在用户切换到另外一个app的时候，你应该暂停video 并终止网络连接。当用户返回时，你可以重新建立网络连接并允许用户从同样的位置恢复播放。

这一章会介绍一些[Activity](http://developer.android.com/reference/android/app/Activity.html)中重要的生命周期回调方法，如何使用那些方法使得程序符合用户的期望且在activity不需要的时候不会导致系统资源的浪费。

**完整的Demo示例**：[ActivityLifecycle.zip](http://developer.android.com/shareables/training/ActivityLifecycle.zip)

<!-- more -->

## Lessons

* [**启动与销毁Activity**](starting.html)

  学习关于activity生命周期的基础知识，用户如何启动你的应用以及如何执行activity的创建。


* [**暂停与恢复Activity**](pausing.html)

  学习activity暂停发生时，你应该做哪些事情。


* [**停止与重启Activity**](stopping.html)

  学习用户离开你的activity与返回activity时会发生的事情。


* [**重新创建Activity**](recreating.html)

  学习当你的activity被销毁时发生了什么事情以及在有必要时如何重建你的activity。
