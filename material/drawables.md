# 使用Drawables

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <https://developer.android.com/training/material/drawables.html>

## 使用Drawable

以下这些drawable的功能，能帮助你在应用中实现Material Design：

* Drawable染色
* 提取主色调
* 矢量Drawable

本课教你如何在应用中使用这些特性：

## 给 Drawable 资源染色

使用 Android 5.0 (API level 21)以上版本，你可以使用alpha mask（透明度图层，译者注）给位图和nine patches图片染色。你可以用颜色Resource或者主题属性来获取颜色（比如，`?android:attr/colorPrimary`）。通常，你只需要创建一次这些颜色asset，便可以在主题中自动匹配这些颜色。

你可以用`setTint()`方法将一种染色方式应用到`BitmapDrawable`或者`NinePatchDrawable`对象。你也在layout中使用`android:tint`和`android:initMode`属性设置染色的颜色和模式。

## 从图片中提取主色调

Android Support Library v21及更高版本带有`Palatte`类，可以让你从图片中提取主色调。这个类可以提取以下颜色：

* Vibrant: 亮色
* Vibrant dark: 深亮色
* Vibrant light: 浅亮色
* Muted: 暗色
* Muted dark: 深暗色
* Muted light: 浅暗色

提取这些颜色时，在你载入图片的后台线程中传入一个Bitmap对象给`Palette.generate()`静态方法。如果你不能使用那个线程，可以调用`Palatte.generateAsync()`方法，并提供一个listener。

你可以用Palette类的一个getter方法从图片获取主色调，比如`Palette.getVibrantColor()`。

要使用`Palette`类，在你的应用模块的Gradle依赖中添加以下代码：

```
dependencies {
    ...
    compile 'com.android.support:palette-v7:21.0.+'
}
```

更多信息，请参见[Palette](http://developer.android.com/reference/android/support/v7/graphics/Palette.html)类的API文档。

## 创建矢量Drawable

在Android 5.0 (API level 21)以上版本中，你可以定义矢量drawable，用于无损的拉伸图片。相对于一张普通图片需要为每个不同屏幕密度的设备提供一个图片来说，一个矢量图片只需要一个asset文件。要创建矢量图片，你可以在`<vector>` XML元素中定义形状。

以下代码定义了一个心形：

```xml
<!-- res/drawable/heart.xml -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    <!-- intrinsic size of the drawable -->
    android:height="256dp"
    android:width="256dp"
    <!-- size of the virtual canvas -->
    android:viewportWidth="32"
    android:viewportHeight="32">

  <!-- draw a path -->
  <path android:fillColor="#8fff"
      android:pathData="M20.5,9.5
                        c-1.955,0,-3.83,1.268,-4.5,3
                        c-0.67,-1.732,-2.547,-3,-4.5,-3
                        C8.957,9.5,7,11.432,7,14
                        c0,3.53,3.793,6.257,9,11.5
                        c5.207,-5.242,9,-7.97,9,-11.5
                        C25,11.432,23.043,9.5,20.5,9.5z" />
</vector>
```

矢量图片在Android中用[VectorDrawable](http://developer.android.com/reference/android/graphics/drawable/VectorDrawable.html)对象来表示。更多关于`pathData`语法的信息，请看[SVG Path](http://www.w3.org/TR/SVG11/paths.html#PathData)的文档。更多关于矢量drawable动画的信息，请参见[矢量drawable动画](https://developer.android.com/training/material/animations.html#AnimVector)。
