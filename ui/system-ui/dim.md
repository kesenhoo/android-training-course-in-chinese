# 淡化系统Bar

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/system-ui/dim.html>

本课程将向你讲解如何在Android 4.0(*API level 14*)与更高的的系统版本上淡化系统栏(System bar,状态栏与导航栏)。早期版本的Android没有提供一个自带的方法来淡化系统栏。

当你使用这个方法的时候，内容区域并不会发生大小的变化，只是系统栏的图标会收起来。一旦用户触摸状态栏或者是导航栏的时候，这两个系统栏就又都会完全显示（无透明度）。这种方法的优势是系统栏仍然可见，但是它们的细节被隐藏掉了，因此可以在不牺牲快捷访问系统栏的情况下创建一个沉浸式的体验。

**这节课将教您**

1. 淡化状态栏和导航栏
2. 显示状态栏和导航栏

**同时您应该阅读**

* [Action Bar API 指南](http://developer.android.com/guide/topics/ui/actionbar.html)
* [Android Design Guide](http://developer.android.com/design/index.html)

## 淡化状态栏和系统栏

如果要淡化状态和通知栏，在版本为4.0以上的Android系统上，你可以像如下使用`SYSTEM_UI_FLAG_LOW_PROFILE`这个标签。

```java
// This example uses decor view, but you can use any visible view.
View decorView = getActivity().getWindow().getDecorView();
int uiOptions = View.SYSTEM_UI_FLAG_LOW_PROFILE;
decorView.setSystemUiVisibility(uiOptions);
```

一旦用户触摸到了状态栏或者是系统栏，这个标签就会被清除，使系统栏重新显现（无透明度）。在标签被清除的情况下，如果你想重新淡化系统栏就必须重新设定这个标签。

图1展示了一个图库中的图片，界面的系统栏都已被淡化（需要注意的是图库应用完全隐藏状态栏，而不是淡化它）；注意导航栏（图片的右侧）上变暗的白色的小点，他们代表了被隐藏的导航操作。

![low_profile_hide2x](low_profile_hide2x.png)

**图1.**淡化的系统栏

图2展示的是同一张图片，系统栏处于显示的状态。

![low_profile_show2x](low_profile_show2x.png)

**图2.**显示的系统栏

## 显示状态栏与导航栏

如果你想动态的清除显示标签，你可以使用`setSystemUiVisibility()`方法：

```java
View decorView = getActivity().getWindow().getDecorView();
// Calling setSystemUiVisibility() with a value of 0 clears
// all flags.
decorView.setSystemUiVisibility(0);
```
