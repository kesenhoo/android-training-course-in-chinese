> 编写:[jdneo](https://github.com/jdneo)，校对:

> 原文:<http://developer.android.com/training/graphics/opengl/index.html>

# 使用OpenGL ES显示图像

Android框架提供了大量的标准工具，用来创建吸引人的，功能化的用户接口。然而，如果你希望对你的应用在屏幕上的绘图行为进行更多的控制，或者你在尝试建立三维图像，那么你就需要一个不同的工具了。由Android框架提供的OpenGL ES接口提供了显示高级动画图形的工具，它的功能仅仅受限于你自身的想象力，并且在许多Android设备上搭载的图形处理单元（GPU）都能为其提供GPU加速等性能优化。

这系列课程将教会你使用OpenGL搭建基本的应用，包括配置，绘制对象，移动图形单元及响应点击事件。

这系列课程所使用的样例代码使用的是OpenGL ES 2.0接口，这是当前Android设备所推荐的接口版本。关于跟多OpenGL ES的版本信息，可以阅读：[OpenGL](http://developer.android.com/guide/topics/graphics/opengl.html#choosing-version)开发手册。

> **Note：**注意不要把OpenGL ES 1.x版本的接口和OpenGL ES 2.0的接口混合调用。这两种版本的接口不是通用的。如果尝试混用它们，其输出结果可能会让你感到无奈和沮丧。

## Sample Code

[OpenGLES.zip](http://developer.android.com/shareables/training/OpenGLES.zip)

## Lessons

* [**建立OpenGL ES的环境**](environment.html)

  Learn how to set up an Android application to be able to draw OpenGL graphics.


* [**定义Shapes**](shapes.html)

  Learn how to define shapes and why you need to know about faces and winding.


* [**绘制Shapes**](draw.html)

  Learn how to draw OpenGL shapes in your application.


* [**运用投影与相机视图**](projection.html)

  Learn how to use projection and camera views to get a new perspective on your drawn objects.


* [**添加移动**](motion.html)

  Learn how to do basic movement and animation of drawn objects with OpenGL.


* [**响应触摸事件**](touch.html)

  Learn how to do basic interaction with OpenGL graphics.
