# 全屏沉浸式应用

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/system-ui/immersive.html>

**这节课将教您**

1. 选择一种沉浸方式
2. 使用非粘性沉浸模式
3. 使用粘性沉浸模式

Adnroid 4.4(API level 19)中引入为`setSystemUiVisibility()`引入了一个新标签`SYSTEM_UI_FLAG_IMMERSIVE`，它可以让应用进入真正的全屏模式。当这个标签与`SYSTEM_UI_FLAG_HIDE_NAVIGATION`和`SYSTEM_UI_FLAG_FULLSCREEN`一起使用的时候，导航栏和状态栏就会隐藏，让你的应用可以接受屏幕上任何地方的触摸事件。


当沉浸式全屏模式启用的时候，你的Activity会继续接受各类的触摸事件。用户可以通过在边缘区域向内滑动来让系统栏重新显示。这个操作清空了`SYSTEM_UI_FLAG_HIDE_NAVIGATION`(和`SYSTEM_UI_FLAG_FULLSCREEN`，如果有的话)两个标签，因此系统栏重新变得可见。如果设置了的话，这个操作同时也触发了`View.OnSystemUiVisibilityChangeListener`。然而， 如果你想让系统栏在一段时间后自动隐藏的话，你应该使用`SYSTEM_UI_FLAG_IMMERSIVE_STICKY`标签。请注意，带有'sticky'的标签不会触发任何的监听器，因为在这个模式下展示的系统栏是处于暂时(transient)的状态。

图1展示了各种不同的“沉浸式”状态

![imm-states](imm-states.png)

**图1**. 沉浸模式状态.

在上图中：

1. **非沉浸模式** —— 展示了应用进入沉浸模式之前的状态。也展示了设置`IMMERSIVE`标签后用户滑动展示系统栏的状态。用户滑动后，`SYSTEM_UI_FLAG_HIDE_NAVIGATION`和`SYSTEM_UI_FLAG_FULLSCREEN`就会被清除，系统栏就会重新显示并保持可见。
请注意，最好的实践方式就是让所有的UI控件的变化与系统栏的显示隐藏保持同步，这样可以减少屏幕显示所处的状态，同时提供了更无缝平滑的用户体验。因此所有的UI控件跟随系统栏一同显示。一旦应用进入了沉浸模式，相应的UI控件也跟随着系统栏一同隐藏。为了确保UI的可见性与系统栏保持一致，我们需要一个监听器`View.OnSystemUiVisibilityChangeListener`来监听系统栏的变化。这在下一节中将详细讲解。

2. **提示气泡**——第一次进入沉浸模式时，系统将会显示一个提示气泡，提示用户如何再让系统栏显示出来。
> **Note**：如果为了测试你想强制显示提示气泡，你可以先将应用设为沉浸模式，然后按下电源键进入锁屏模式，并在5秒中之后打开屏幕。

3. **沉浸模式**—— 这张图展示了隐藏了系统栏和其他UI控件的状态。你可以设置`IMMERSIVE`和`IMMERSIVE_STICKY`来进入这个状态。
4. **粘性标签**——这就是你设置了`IMMERSIVE_STICKY`标签时的UI状态，用户会向内滑动以展示系统栏。半透明的系统栏会临时的进行显示，一段时间后自动隐藏。滑动的操作并不会清空任何标签，也不会触发系统UI可见性的监听器，因为暂时显示的导航栏并不被认为是一种可见性状态的变化。

> **Note**：`immersive`类的标签只有在与`SYSTEM_UI_FLAG_HIDE_NAVIGATION`,` SYSTEM_UI_FLAG_FULLSCREEN`中一个或两个一起使用的时候才会生效。你可以只使用其中的一个，但是一般情况下你需要同时隐藏状态栏和导航栏以达到沉浸的效果。

## 选择一种沉浸方式

`SYSTEM_UI_FLAG_IMMERSIVE`与`SYSTEM_UI_FLAG_IMMERSIVE_STICKY `都提供了沉浸式的体验，但是在上面的描述中，他们是不一样的，下面讲解一下什么时候该用哪一种标签。

* 如果你在写一款图书浏览器、新闻杂志阅读器，请将`IMMERSIVE`标签与`SYSTEM_UI_FLAG_FULLSCREEN `,` SYSTEM_UI_FLAG_HIDE_NAVIGATION`一起使用。因为用户可能会经常访问Action Bar和一些UI控件，又不希望在翻页的时候有其他的东西进行干扰。`IMMERSIVE`在该种情况下就是个很好的选择。
* 如果你在打造一款真正的沉浸式应用，而且你希望屏幕边缘的区域也可以与用户进行交互，并且用户也不会经常访问系统UI。这个时候就要将`IMMERSIVE_STICKY`和`SYSTEM_UI_FLAG_FULLSCREEN` `SYSTEM_UI_FLAG_HIDE_NAVIGATION`两个标签一起使用。比如做一款游戏或者绘图应用就很合适。
* 如果你在打造一款视频播放器，并且需要少量的用户交互操作。你可能就需要之前版本的一些方法了（从Android 4.0开始）。对于这种应用，简单的使用`SYSTEM_UI_FLAG_FULLSCREEN`与`SYSTEM_UI_FLAG_HIDE_NAVIGATION`就足够了，不需要使用`immersive`标签。

## 使用非粘性沉浸模式

当你使用`SYSTEM_UI_FLAG_IMMERSIVE`标签的时候，它是基于其他设置过的标签(`SYSTEM_UI_FLAG_HIDE_NAVIGATION`和`SYSTEM_UI_FLAG_FULLSCREEN`)来隐藏系统栏的。当用户向内滑动，系统栏重新显示并保持可见。

用其他的UI标签(如`SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION`和`SYSTEM_UI_FLAG_LAYOUT_STABLE`)来防止系统栏隐藏时内容区域大小发生变化是一种很不错的方法。你也需要确保Action Bar和其他系统UI控件同时进行隐藏。下面这段代码展示了如何在不改变内容区域大小的情况下，隐藏与显示状态栏和导航栏。

```java
// This snippet hides the system bars.
private void hideSystemUI() {
    // Set the IMMERSIVE flag.
    // Set the content to appear under the system bars so that the content
    // doesn't resize when the system bars hide and show.
    mDecorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION // hide nav bar
            | View.SYSTEM_UI_FLAG_FULLSCREEN // hide status bar
            | View.SYSTEM_UI_FLAG_IMMERSIVE);
}

// This snippet shows the system bars. It does this by removing all the flags
// except for the ones that make the content appear under the system bars.
private void showSystemUI() {
    mDecorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
}
```
你可能同时也希望在如下的几种情况下使用`IMMERSIVE`标签来提供更好的用户体验：
* 注册一个监听器来监听系统UI的变化。
* 实现`onWindowFocusChanged()`函数。如果窗口获取了焦点，你可能需要对系统栏进行隐藏。如果窗口失去了焦点，比如说弹出了一个对话框或菜单，你可能需要取消那些将要在`Handler.postDelayed()`或其他地方的隐藏操作。
* 实现一个`GestureDetector`，它监听了` onSingleTapUp(MotionEvent)`事件。可以使用户点击内容区域来切换系统栏的显示状态。单纯的点击监听可能不是最好的解决方案，因为当用户在屏幕上拖动手指的时候（假设点击的内容占据了整个屏幕），这个事件也会被触发。

更多关于此话题的讨论，可以观看这个视频 [DevBytes: Android 4.4 Immersive Mode](http://www.youtube.com/embed/cBi8fjv90E4)


## 使用粘性沉浸模式

当使用了`SYSTEM_UI_FLAG_IMMERSIVE_STICKY`标签的时候，向内滑动的操作会让系统栏临时显示，并处于半透明的状态。此时没有标签会被清除，系统UI可见性监听器也不会被触发。如果用户没有进行操作，系统栏会在一段时间内自动隐藏。

图2展示了当使用`IMMERSIVE_STICKY`标签时，半透明的系统栏展示与又隐藏的状态。

![imm-sticky](imm-sticky.png)

**图2**. 自动隐藏系统栏.

下面是一段实现代码。一旦窗口获取了焦点，只要简单的设置`IMMERSIVE_STICKY`与上面讨论过的其他标签即可。

```java
@Override
public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);}
}
```

> **Notes**：如果你想实现`IMMERSIVE_STICKY`的自动隐藏效果，同时也需要展示你自己的UI控件。你只需要使用`IMMERSIVE`与`Handler.postDelayed()`或其他类似的东西，让它几秒后重新进入沉浸模式即可。
