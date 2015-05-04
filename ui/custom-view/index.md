# 创建自定义View

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/custom-views/index.html>

Android的framework有大量的Views用来与用户进行交互并显示不同种类的数据。但是有时候你的程序有个特殊的需求，而Android内置的views组件并不能实现。这一章节会演示如何创建你自己的views，并使得它们是robust与reusable的。

**依赖和要求**

Android 2.1 (API level 7) 或更高

**你也可以看**

* [Custom Components](http://developer.android.com/guide/topics/ui/custom-components.html)
* [Input Events](http://developer.android.com/guide/topics/ui/ui-events.html)
* [Property Animation](http://developer.android.com/guide/topics/graphics/prop-animation.html)
* [Hardware Acceleration](http://developer.android.com/guide/topics/graphics/hardware-accel.html)
* [Accessibility](http://developer.android.com/guide/topics/ui/accessibility/index.html) developer guide

## Sample

[CustomView.zip](http://developer.android.com/shareables/training/CustomView.zip)

<!-- more -->

##Lesson

* [**创建一个View类**](create-view.md)

  创建一个像内置的view，有自定义属性并支持[ADT](http://developer.android.com/sdk/eclipse-adt.html) layout编辑器。

* [**自定义Drawing**](custom-draw.md)

  使用Android graphics系统使你的view拥有独特的视觉效果。

* [**使得View是可交互的**](make-interactive.md)

  用户期望view对操作反应流畅自然。这节课会讨论如何使用gesture detection, physics, 和 animation使你的用户界面有专业的水准。

* [**优化View**](optimize-view.md)

  不管你的UI如何的漂亮，如果不能以高帧率流畅运行，用户也不会喜欢。学习如何避免一般的性能问题，和如何使用硬件加速来使你的自定义图像运行更流畅。

