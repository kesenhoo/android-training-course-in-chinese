# 为Notification赋加可穿戴特性

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文: <http://developer.android.com/training/wearables/notifications/index.html>

当一部Android手持设备（手机或平板）与Android可穿戴设备连接后，手持设备能够自动与可穿戴设备共享Notification。在可穿戴设备上，每个Notification都是以一张新卡片的形式出现在[context stream](http://developer.android.com/design/wear/index.html)中。

与此同时，为了给予用户以最佳的体验，开发者应当为自己创建的Notification增加一些具备可穿戴特性的功能。下面的课程将指导我们如何实现同时支持手持设备和可穿戴设备的Notification。

![](notification_phone@2x.png)

**Figure 1.** 同时展示在手持设备和可穿戴设备的Notification

## Lessons

[创建Notification](creating.html)

学习如何应用Android support library创建具备可穿戴特性的Notification。

[在Notification中接收语音输入](voice-input.html)

学习在可穿戴式设备上的Notification添加一个action以接收来自用户的语音输入，并且将录入的消息传递给手持设备应用。

[为Notification添加页面](pages.html)

学习如何为Notification创建附加的页面，使得用户在向左滑动时能看到更多的信息。

[将Notification放成一叠](stacks.html)

学习如何将我们应用中所有相似的notification放在一个堆叠中，使得在不将多个卡片添加到卡片流的情况下，允许用户能够独立地查看每一个Notification。
