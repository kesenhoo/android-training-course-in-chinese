# 定义Shadows与Clipping视图

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <https://developer.android.com/training/material/shadows-clipping.html>

Material Design 引入了UI元素深度的概念。深度可以帮助用户理解每个元素的不同重要性，让用户集中注意力做手头的工作。

视图的elevation，用 Z 属性来表示，它决定了阴影的大小：更大的 Z 值可以投射出更大的阴影。视图只会把阴影投射到 Z=0 的平面上；他们不会把阴影投射到介于自己和 Z=0 平面之间的视图上。

Z 值较大的视图会遮盖住Z值较小的视图。不过，Z值大小不会影响视图的大小。

Elevation对于创建临时上升这种动画同样很有用。

## 給视图赋Elevation值

视图的 Z 值有两个组成部分，elevation 和 translation。elevation 是一个必须部分，translation 是用于动画的：

Z = elevation + translationZ

![](shadows-depth.png)

要在layout中设置视图的elevation，使用`android:elevation`属性。要在Activity代码中设置elevation，使用`View.setElevation()`方法。

要设置视图的translation，使用`View.setTranslationZ()`方法。

新的`ViewPropertyAnimator.z()` 和 `ViewPropertyAnimator.translationZ()` 方法使你可以很容易的实现elevation动画。更多信息，请查看ViewPropertyAnimator和[属性动画开发指南](https://developer.android.com/guide/topics/graphics/prop-animation.html)。

你也可以使用 StateListAnimator 来声明动画。这非常适用于要通过状态改变来触发动画的情况，比如当用户按下按钮。更多信息，请查看[Animate View State Changes（当视图状态变化的动画，译者注）](https://developer.android.com/training/material/animations.html#ViewState)。

Z值和X，Y值的测量单位是一样的。

## 自定义视图的阴影和轮廓

视图背景的边界决定了阴影的形状。轮廓是一个图形对象的外围形状，决定了触摸反馈动画的ripple区域。

考虑以下是个视图：

```xml
<TextView
    android:id="@+id/myview"
    ...
    android:elevation="2dp"
    android:background="@drawable/myrect" />
```

背景drawable定义为一个圆角的矩形：

```xml
<!-- res/drawable/myrect.xml -->
<shape xmlns:android="http://schemas.android.com/apk/res/android"
       android:shape="rectangle">
    <solid android:color="#42000000" />
    <corners android:radius="5dp" />
</shape>
```

这个视图会投影出圆角，因为这是背景drawble的轮廓。如果提供一个自定义的轮廓，会覆盖这个默认的阴影形状。

以下方式可以自定义视图的轮廓：

1. 继承 `ViewOutlineProvider` 类
2. 覆写 `getOutline()` 函数.
3. 用 `View.setOutlineProvider()` 方法来设定视图的轮廓提供者.

使用`Outline`类的函数，你可以创建椭圆和带圆角的矩形轮廓。视图的轮廓提供者会从视图的背景中获取轮廓。要避免视图投射阴影，你可以设置轮廓提供者为 null。

## Clip 视图

Clipping 视图使你轻松的改变视图的形状。附着视图可以是为了设计的一致性，也可以是为了当用户输入信息时，改变视图的形状。你可以通过`View.setClipToOutline()` 将视图附着给一个轮廓，或使用`android:clipToOutline`属性。只有矩形、原型和圆角矩形轮廓支持附着，你可以通过`Outlin.canClip()`方法来检查是否支持附着。

把视图附着给drawable的形状，要将这个drawable设置为视图的背景，并调用`View.setClipToOutline()` 方法。

附着视图是一个昂贵的操作，所以不要对附着过的形状是进行动画。要实现这个效果，使用 [Reveal Effect](https://developer.android.com/training/material/animations.html#Reveal) 动画
