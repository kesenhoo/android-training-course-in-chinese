# 实现辅助功能

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/accessibility/index.html>

当我们需要尽可能扩大我们用户的基数的时候，就要开始注意我们软件的可达性了(*Accessibility 易接近，可亲性*)。在界面中展示提示对大多数用户而言是可行的，比如说当按钮被按下时视觉上的变化，但是对于那些视力上有些缺陷的用户而言效果就不是那么理想了。

本章将给您演示如何最大化利用Android框架中的Accessibility特性。包括如何利用焦点导航(*focus navigation*)与内容描述(*content description*)对你的应用的可达性进行优化。也包括了创建Accessibility Service， 使用户与应用（不仅仅是你自己的应用）之间的交互更加容易。

## Lessons

* [**开发Accessibility应用**](accessible-app.md)

  学习如何让你的程序更易用，具有可达性。 允许使用键盘或者十字键(*directional pad*)来进行导航，利用Accessibility Service特性设置标签或执行事件来打造更舒适的用户体验。


* [**编写 Accessibility Services**](accessible-service.md)

  编写一个Accessibility Service来监听可达性事件，利用这些不同类型的事件和内容描述来帮助用户与应用的交互。本例将会实现利用一个TTS引擎来向用户发出语音提示的功能。
