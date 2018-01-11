# 使用OpenGL ES显示图像

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/index.html>

Android framework 提供了大量的标准视图工具，用来创建吸引人的，功能丰富的图形界面。然而，如果我们希望应用能够对屏幕上所绘制的内容进行更多的控制，或者是希望绘制3D图像，那么我们就需要一个不同的工具了。由 Android framework 提供的 OpenGL ES 接口给予我们一组可以显示高级动画和图形的工具集，它能够完成超越我们想象力的复杂多变的图形绘制。同时，这些绘制操作在绝大多数的 Android 设备上，都能够利用设备自身装载的图形处理单元（GPU）为其提供更好的性能。

这系列课程将展示如何使用 OpenGL 构建应用的基础知识，包括配置启动，绘制对象，移动图形元素以及响应点击事件。

这系列课程所涉及的样例代码使用的是 OpenGL ES 2.0 接口，这是当前Android设备所推荐的接口版本。关于更多OpenGL ES的版本信息，可以阅读：[OpenGL开发手册](http://developer.android.com/guide/topics/graphics/opengl.html#choosing-version)。

> **Note：**注意不要把OpenGL ES 1.x版本的接口和OpenGL ES 2.0的接口混合调用。这两种版本的接口不是通用的。如果尝试混用它们可能会让你感到无奈和沮丧。

## Sample Code

[OpenGLES.zip](http://developer.android.com/shareables/training/OpenGLES.zip)

## Lessons

* [**配置OpenGL ES的环境(Building an OpenGL ES Environment)**](environment.html)

  学习如何配置一个可以绘制 OpenGL 图形的 Android 应用。


* [**定义形状(Defining Shapes)**](shapes.html)

  学习如何定义形状，以及为何需要了解面（Faces）和卷绕（Winding）这两个概念的原因。


* [**绘制形状(Drawing Shapes)**](draw.html)

  学习如何在应用中利用OpenGL绘制形状。


* [**运用投影与相机视角(Applying Projection and Camera Views)**](projection.html)

  学习如何通过投影和相机视角，获取图形对象的一个新的透视效果。


* [**添加移动(Adding Motion)**](motion.html)

  学习如何对一个OpenGL图形对象添加基本的运动效果。


* [**响应触摸事件(Responding to Touch Events)**](touch.html)

  学习如何与OpenGL图形进行基本的交互。
