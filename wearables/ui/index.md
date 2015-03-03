# 为可穿戴设备创建自定义UI

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/index.html>

<!--User interfaces for wearable apps differ significantly from those built for handheld devices.Apps for wearables should follow the Android Wear design principles and implement the recommended UI patterns,which ensure a consistent user experience across apps that is optimized for wearables.-->
可穿戴apps的用户界面明显的不同于手持设备。
可穿戴设备的Apps应该参考[Android 可穿戴设计规范](https://developer.android.com/design/wear/index.html)和实现推荐的[UI patterns](https://developer.android.com/design/wear/patterns.html),
并且在App中保证统一的用户体验以适合可穿戴设备。

<!--This class teaches you how to create custom UIs for your wearable apps and custom notifications that look good on any Android Wear device by implementing these UI patterns:-->
这个课程将教你如何为可穿戴设备创建自定义UI和自定义notifications在所有Android可穿戴设备上看上去不错,从使用这些UI patterns：

<!--Cards
Countdowns and confirmations
Long press to dismiss
2D Pickers
Selection lists-->
* 卡片
* 倒计时确认
* 长按忽略
* 二维选择器
* 多选列表

<!--The Wearable UI Library, which is part of the Google Repository in the Android SDK, provides classes that help you implement these patterns and create layouts that work on both round and square Android Wear devices.-->
可穿戴UI库是Android SDK的Google Repository中的一部分，其中提供的类可以帮助你实现这些patterns和创建layouts工作在圆形和方形的Android可穿戴设备。

<!--Note: We recommend using Android Studio for Android Wear development as it provides project setup, library inclusion, and packaging conveniences that aren't available in ADT. This training assumes you are using Android Studio.-->
>Note:我们推荐使用Android Studio做Android Wear开发,它提供工程初始配置,库包含和方便的打包,这些在ADT中是不可用的。这系列教程假定你是正在使用Android Studio的。

## Lessons

* [定义 Layouts](https://developer.android.com/training/wearables/ui/layouts.html)

  <!--Learn how to create layouts that look good on round and square Android Wear devices.-->
  学习如何创建在圆形和方形Android Wear设备上看起来不错的layouts。
	
* [创建卡片](https://developer.android.com/training/wearables/ui/cards.html)
 
  <!--Learn how to create cards with custom layouts.-->
  学习如何创建自定义layouts的卡片
  
* [创建列表](https://developer.android.com/training/wearables/ui/lists.html)

  <!--Learn how to create lists that are optimized for wearable devices.-->
  学习如何创建为可穿戴设备优化的列表
  
* [创建二维选择器](https://developer.android.com/training/wearables/ui/2d-picker.html)

  <!--Learn how to implement the 2D Picker UI pattern to navigate through pages of data.-->
  学习如何实现二维选择器UI模式以导航各页数据
  
* [显示确认器](https://developer.android.com/training/wearables/ui/confirm.html)

  <!--Learn how to display confirmation animations when users complete actions.-->
  学习如何在用户完成操作时显示确认动画
  
* [退出全屏Activities](https://developer.android.com/training/wearables/ui/exit.html)

  <!--Learn how to implement the long-press-to-dismiss UI pattern to exit full-screen activities.-->
  学习如何实现长按忽略UI模式以退出全屏activities