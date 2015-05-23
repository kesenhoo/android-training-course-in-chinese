# 为可穿戴设备创建自定义UI

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/index.html>

可穿戴apps的用户界面明显的不同于手持设备。可穿戴设备应用应该参考Android Wear[设计规范](https://developer.android.com/design/wear/index.html)和实现推荐的[UI模式](https://developer.android.com/design/wear/patterns.html)，
这些保证在为可穿戴设备优化过的应用中保持统一的用户体验。

这个课程将教我们如何为[可穿戴应用](http://hukai.me/android-training-course-in-chinese/wearables/apps/creating.html)创建在所有Android可穿戴设备上看上去都不错的自定义UI和[自定义的notifications](http://hukai.me/android-training-course-in-chinese/wearables/apps/layouts.html#CustomNotifications)。为了达到上述目的，需要实现这些UI模式：

* Card
* 倒计时和确认
* 长按退出
* 2D Picker
* 多选List

可穿戴UI库是Android SDK的Google Repository中的一部分，其中提供的类可以帮助我们实现这些模式和创建工作在圆形和方形Android可穿戴设备的layout。

>**Note:** 我们推荐使用Android Studio做Android Wear开发,它提供工程初始配置,库包含和方便的打包,这些在ADT中是没有的。这系列教程假定你正在使用Android Studio。

## Lessons

[定义Layouts](https://developer.android.com/training/wearables/ui/layouts.html)

学习如何创建在圆形和方形Android Wear设备上看起来不错的layout。
	
[创建Card](https://developer.android.com/training/wearables/ui/cards.html)
 
学习如何创建自定义layout的Card
  
[创建List](https://developer.android.com/training/wearables/ui/lists.html)

学习如何创建为可穿戴设备优化的List
  
[创建2D Picker](https://developer.android.com/training/wearables/ui/2d-picker.html)

学习如何实现2D Picker UI模式以导航各页数据
  
[显示确认界面](https://developer.android.com/training/wearables/ui/confirm.html)

学习如何在用户完成操作时显示确认动画
  
[退出全屏的Activity](https://developer.android.com/training/wearables/ui/exit.html)

学习如何实现长按退出UI模式以退出全屏activities