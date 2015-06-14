# 使用Material的主题

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <https://developer.android.com/training/material/theme.html>

新的 Material 主题提供：

* 系统组件，用于设定调色板
* 系统组件的触摸反馈动画
* Activity 切换动画

你可以根据你的品牌特征修改调色板，从而自定义 Material 主题。你可以通过主题属性调整 action bar 和状态栏的颜色，就像下图一样：

![](ThemeColors.png)

系统组件拥有新的设计和触摸反馈动画。你可以自定义调色板，反馈动画和 Activity 切换动画。

Material 主题被定义在：

* `@android:style/Theme.Material` (暗色版本)
* `@android:style/Theme.Material.Light` (亮色版本)
* `@android:style/Theme.Material.Light.DarkActionBar`

![](MaterialDark.png)
![](MaterialLight.png)

想知道可用的 Material style 的列表，可以在 API 文档中参见 [R.style](http://developer.android.com/reference/android/R.style.html).

> **Note:**  Material 主题只支持 Android 5.0 (API level 21) 及以上版本。[v7 Support 库](https://developer.android.com/tools/support-library/features.html#v7)提供了一些组件的 Material Deisgn 样式，也支持自定义调色板。更多信息，请参见维护兼容性章节。

## 自定义调色板

在根据自己的品牌自定义调色板时，你需要在继承 material 主题时定义 theme 属性。

```xml
<resources>
  <!-- inherit from the material theme -->
  <style name="AppTheme" parent="android:Theme.Material">
    <!-- Main theme colors -->
    <!--   your app branding color for the app bar -->
    <item name="android:colorPrimary">@color/primary</item>
    <!--   darker variant for the status bar and contextual app bars -->
    <item name="android:colorPrimaryDark">@color/primary_dark</item>
    <!--   theme UI controls like checkboxes and text fields -->
    <item name="android:colorAccent">@color/accent</item>
  </style>
</resources>
```

## 自定义状态栏

Material 主题使得你很容易自定义状态栏，你可以设定适合自己品牌的颜色，并提供足够的对比度，以显示白色的状态图标。设置状态栏颜色时，要在继承 Material 主题时设定 `android:statsBarColor` 属性。默认情况下，`android:statusBarColor` 会继承 `android:colorPrimaryDark` 的值。

你也可以在状态栏的背景上绘画。比如，你想让位于照片之上的状态栏透明，并保留一点深色渐变以确保白色图标可见。这样的话，设定 `android:statusBarColor` 属性为 `@android:color/transparent` 并调整窗口的 Flag 标记。你也可以用 `Window.setStatusBarColor()` 来实现动画或淡入淡出。

>**Note:** 状态栏必须随时保持和 primary toolbar (即顶部Actionbar，译者注) 的界线清晰。除了一种情况，即在状态栏后面显示图片或媒体内容时之外，你都要用渐变色来确保前台图标仍然可见。

当你自定义导航栏和状态栏时，要么两者都透明，要么只修改状态栏。其他情况下，导航栏应该保持黑色。

## 主题单独视图

XML layout 中的元素可以定义 `android:theme` 属性， 用于引用主题资源。这个属性修改了自己和子元素的主题，对于要修改局部颜色主题的情况十分有用。
