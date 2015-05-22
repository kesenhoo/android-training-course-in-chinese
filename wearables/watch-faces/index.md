# 创建表盘

> 编写:[heray1990](https://github.com/heray1990) - 原文: <http://developer.android.com/training/wearables/watch-faces/index.html>

Android Wear 的表盘是一个动态的数字画布，它用颜色、动画和相关的上下文信息来表示时间。[Android Wear companion app](https://play.google.com/store/apps/details?id=com.google.android.wearable.app) 提供了不同风格和形状的表盘。当用户选择可穿戴设备应用或者配套应用上可用的表盘，可穿戴设备会提供表盘的预览并让用户设置选项。

Android Wear 允许我们为 Wear 设备创建自定义的表盘。当用户安装一个包含表盘的可穿戴应用的手持式应用时，它们可以在手持式设备上的 Android Wear 配套应用和在可穿戴设备上的表盘选择器中使用。

这个课程教我们实现自定义表盘并将它们打包进一个可穿戴应用。这节课还覆盖设计方面的考虑和实现提示，从而确保我们的设计整合到系统 UI 并且节能。

> **Note:** 我们推荐使用 Android Studio 做 Android Wear 开发，它提供工程初始配置，库包含和方便的打包流程，这些在ADT中是没有的。这系列教程假定你正在使用Android Studio。

## Lesson

[设计表盘](designing.html)

学习如何设计一个可以工作在 Android Wear 设备上的表盘。

[构建表盘服务](service.html)

学习如何在表盘的生命周期期间响应重要的时间。

[绘制表盘](drawing.html)

学习如何在一个 Wear 设备的屏幕上绘制表盘。

[在表盘上显示信息](information.html)

学习如何将上下文信息集成到表盘中。

[提供配置 Activity](configuration.html)

学习如何创建带有可配置参数的表盘。

[定位常见的问题](issues.html)

学习如何在开发表盘的时候修改常见的问题。

[优化性能和电池使用时间](performance.html)

学习如何提高动画的帧速率和节能。