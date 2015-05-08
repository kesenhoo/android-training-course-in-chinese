# 创建向后兼容的UI

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/backward-compatible-ui/index.html>

这一课展示了如何以向后兼容的方式使用在新版本的Android上可用的UI组件和API，确保你的应用在之前的版本上依然能够运行。

贯穿整个课程，在Android 3.0被新引入的[Action Bar Tabs](http://developer.android.com/guide/topics/ui/actionbar.html#Tabs)功能在本课程中作为指导例子，但是你可以在其他UI组件和API功能上运用这种方式。

## Sample

<http://developer.android.com/shareables/training/TabCompat.zip>

## Lessons

* [**抽象出新的APIs**](abstract.md)

	决定你的应用需要的功能和接口。学习如何为你的应用定义面向特定应用的、作为中间媒介并抽象出UI组件具体实现的java接口。


* [**代理至新的APIs**](new-impl.md)

	学习如何创建使用新的APIs的接口的具体实现


* [**使用旧的APIs实现新API的效果**](old-impl.md)

	学习如何创建使用老的APIs的自定义的接口实现


* [**使用能感知版本的组件**](using-component.md)

	学习如何在运行的时候去选择一个具体的实现，并且开始在你的应用中使用接口。
