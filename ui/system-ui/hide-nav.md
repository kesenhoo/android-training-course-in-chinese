# 隐藏导航栏

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/system-ui/navigation.html>

**这节课将教您**

1. 在4.0及以上版本中隐藏导航栏
2. 让内容显示在导航栏之后

本节课程将教您如何对导航栏进行隐藏，这个特性是Android 4.0（）版本中引入的。

即便本小节仅关注如何隐藏导航栏，但是在实际的开发中，你最好让状态栏与导航栏同时消失。在保证导航栏易于再次访问的情况下，隐藏导航栏与状态栏使内容区域占据了整个显示空间，因此可以提供一个更加沉浸式的用户体验。

![navigation-bar](navigation-bar.png)

**图1**. 导航栏.

## 在4.0及以上版本中隐藏导航栏

你可以在Android 4.0以及以上版本，使用`SYSTEM_UI_FLAG_HIDE_NAVIGATION`标志来隐藏导航栏。这段代码同时隐藏了导航栏和系统栏：


```java
View decorView = getWindow().getDecorView();
// Hide both the navigation bar and the status bar.
// SYSTEM_UI_FLAG_FULLSCREEN is only available on Android 4.1 and higher, but as
// a general rule, you should design your app to hide the status bar whenever you
// hide the navigation bar.
int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
              | View.SYSTEM_UI_FLAG_FULLSCREEN;
decorView.setSystemUiVisibility(uiOptions);
```

注意以下几点
* 使用这个方法时，触摸屏幕的任何一个区域都会使导航栏（与状态栏）重新显示。用户的交互会使这个标签`SYSTEM_UI_FLAG_HIDE_NAVIGATION`被清除。
* 一旦这个标签被清除了，如果你想再次隐藏导航栏，你就需要重新对这个标签进行设定。在下一节[响应UI可见性的变化](visibility.html)中，将详细讲解应用监听系统UI变化来做出相应的调整操作。
* 在不同的地方设置UI标签是有所区别的。如果你在Activity的onCreate()方法中隐藏系统栏，当用户按下home键系统栏就会重新显示。当用户再重新打开activity的时候，onCreate()不会被调用，所以系统栏还会保持可见。如果你想让在不同Activity之间切换时，系统UI保持不变，你需要在onReasume()与onWindowFocusChaned()里设定UI标签。
* setSystemUiVisibility()仅仅在被调用的View显示的时候才会生效。
* 当从View导航到别的地方时，用setSystemUiVisibility()设置的标签会被清除。


## 2)让内容显示在导航栏之后

在Android 4.1与更高的版本中，你可以让应用的内容显示在导航栏的后面，这样当导航栏展示或隐藏的时候内容区域就不会发生布局大小的变化。可以使用`SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION`标签来做到这个效果。同时，你也有可能需要`SYSTEM_UI_FLAG_LAYOUT_STABLE`这个标签来帮助你的应用维持一个稳定的布局。

当你使用这种方法的时候，就需要你来确保应用中特定区域不会被系统栏掩盖。更详细的信息可以浏览[隐藏状态栏](hide-ui.html)一节。


