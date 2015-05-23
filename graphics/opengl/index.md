# 使用OpenGL ES显示图像

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/index.html>

Android框架提供了大量的标准工具，用来创建吸引人的，功能丰富的图形界面。然而，如果我们希望应用在屏幕上所绘制的内容进行更多的控制，或者正在尝试建立三维图像，那么我们就需要一个不同的工具了。由Android框架提供的OpenGL ES接口给予我们一组可以显示高级动画和图形的工具集，它的功能仅仅受限于我们自身的想象力。同时，在许多Android设备上搭载的图形处理单元（GPU）都能为其提供GPU加速等性能优化。

这系列课程将展示如何使用OpenGL构建应用的基础知识，包括配置，绘制对象，移动图形元素以及响应点击事件。

这系列课程所涉及的样例代码使用的是OpenGL ES 2.0接口，这是当前Android设备所推荐的接口版本。关于更多OpenGL ES的版本信息，可以阅读：[OpenGL开发手册](http://developer.android.com/guide/topics/graphics/opengl.html#choosing-version)。

> **Note：**注意不要把OpenGL ES 1.x版本的接口和OpenGL ES 2.0的接口混合调用。这两种版本的接口不是通用的。如果尝试混用它们可能会让你感到无奈和沮丧。

## Sample Code

[OpenGLES.zip](http://developer.android.com/shareables/training/OpenGLES.zip)

## Lessons

* [**配置OpenGL ES的环境**](environment.html)

  学习如何配置一个可以绘制OpenGL图形的应用。


* [**定义形状**](shapes.html)

  学习如何定义形状，以及为何需要了解面（Faces）和卷绕（Winding）这两个概念的原因。


* [**绘制形状**](draw.html)

  学习如何在应用中利用OpenGL绘制形状。


* [**运用投影与相机视角**](projection.html)

  学习如何通过投影和相机视角，获取图形对象的一个新的透视效果。


* [**添加移动**](motion.html)

  学习如何对一个OpenGL图形对象添加基本的运动效果。


* [**响应触摸事件**](touch.html)

  学习如何与OpenGL图形进行基本的交互。
