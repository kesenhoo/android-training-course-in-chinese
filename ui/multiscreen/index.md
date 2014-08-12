# 为多屏幕设计

> 编写:[riverfeng](https://github.com/riverfeng) - 原文:

从小屏手机到大屏电视，android拥有数百种不同屏幕尺寸的设备，因此，设计兼容不同屏幕尺寸的应用程序满足不同的用户体验就变得非常重要。

但是，只是单纯的兼容不同的设备类型是远远不够的。每个不同的屏幕尺寸都给用户体验带来不同的可能性和挑战。所以，为了充分的满足用户，你的应用不仅要支持多屏幕，更要针对每个屏幕配置优化你的用户体验。

这个课程就将教你如何针对不同屏幕配置来优化你的UI。

本课程提供了一个简单的示例[NewsReader](http://developer.android.com/shareables/training/NewsReader.zip)。这个示例中提供的代码对多屏幕适配是非常好的一个练习，并且你也可以将这个示例中的代码运用到你自己的项目中。

注意：这节课中相关的例子为了兼容android3.0以下的版本使用了support library中的fragment，如果你需要使用该示例，请先下载support library并添加到例子中。

## Lessons

* [支持不同屏幕尺寸](screen-sizes.html)

  这节课程主要告诉你如何设计能适配多种不同尺寸的屏幕（通过使用灵活的规格（dimensions），RelativeLayout，屏幕尺寸和方向限定词（qualifier），别名过滤器（alias filter）和点9图片）。

* [支持不同的屏幕密度](screen-desities.html)

  这节课程将演示如何支持不同像素密度的屏幕（使用密度独立像素（dip）以及为不同的密度提供合适的位图（bitmap））。


* [实现自适应UI流（Flows）](adapt-ui.html)

  这节课将说的是如何通过实现UI流（flow）的方式来适配不同屏幕尺寸和密度的组合（运行时检测活动布局，根据当前布局正确的响应，处理屏幕配置的变化）。
