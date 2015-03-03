> 编写:[wangyachen](https://github.com/wangyacheng) - 校对:

> 原文: <http://developer.android.com/training/wearables/notifications/index.html>

# 为Notification赋加可穿戴的特性

当一部Android手持设备（手机或平板）与Android可穿戴设备连接起来，手持设备将能够自动地与可穿戴设备共享Notification。在可穿戴设备上，每个Notification都是以一张新卡片的形式出现在[context stream](http://developer.android.com/design/wear/index.html)中的。

与此同时，为了给予用户以最佳的体验，开发者应当为自己的Notification增加一些具备可穿戴特性的功能。下面的课程将指导你如何实现同时支持手持设备和可穿戴设备的Notification。

![](notification_phone@2x.png)
图1. 同时展示在手持设备和可穿戴设备的Notification

##分集课程

* [创建一个Notification](creating.html)

  学习如何应用Android support library创建具备可穿戴特性的Notification。

* [在Notification中接收语音输入](voice-input.html)

  学习在可穿戴式设备上的Notification中接收来自用户的语音输入，同时添加一个action，并且将录入的消息传递给手持设备。

* [为Notification添加显示界面](pages.html)

  学习如何为Notification创建附加的页面，使得用户在向左滑动时能看到更多的信息。

* [以stack的方式显示Notification](stacks.html)

学习如何以stack的形式，堆砌地显示那些从app中发出的，较为类似的Notification，使得用户能够看到每一个Notification是独立显示，而不是将各种卡片放入同一个卡片流中。
