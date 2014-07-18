> 编写:[kesenhoo](https://github.com/kesenhoo)，校对:

> 原文:<http://developer.android.com/training/custom-views/index.html>

# 创建自定义View

Android的framework有大量的Views用来与用户进行交互并显示不同种类的数据。但是有时候你的程序有个特殊的需求，而Android内置的views组件并不能实现。这一章节会演示如何创建你自己的views，并使得它们是robust与reusable的。

**Dependencies and Prerequisites**

Android 2.1 (API level 7) or higher

**YOU should also read**

* [Custom Components](http://developer.android.com/guide/topics/ui/custom-components.html)
* [Input Events](http://developer.android.com/guide/topics/ui/ui-events.html)
* [Property Animation](http://developer.android.com/guide/topics/graphics/prop-animation.html)
* [Hardware Acceleration](http://developer.android.com/guide/topics/graphics/hardware-accel.html)
* [Accessibility](http://developer.android.com/guide/topics/ui/accessibility/index.html) developer guide

**Try it out**

Download the sample
[CustomView.zip](http://developer.android.com/shareables/training/CustomView.zip)

<!-- more -->

##Lesson
**(1)创建一个View类**

Create a class that acts like a built-in view, with custom attributes and support from the ADT layout editor.

**(2)自定义Drawing**

Make your view visually distinctive using the Android graphics system.

**(3)使得View是可交互的**

Users expect a view to react smoothly and naturally to input gestures. This lesson discusses how to use gesture detection, physics, and animation to give your user interface a professional feel.

**(4)优化View**

No matter how beautiful your UI is, users won't love it if it doesn't run at a consistently high frame rate. Learn how to avoid common performance problems, and how to use hardware acceleration to make your custom drawings run faster.
