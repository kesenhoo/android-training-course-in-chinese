# 隐藏状态栏

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/system-ui/status.html>

**这节课将教您**

1. 在4.0及以下版本中隐藏状态栏
2. 在4.1及以上版本中隐藏状态栏
3. 在4.4及以上版本中隐藏状态栏
4. 让内容显示在状态栏之后
5. 同步状态栏与Action Bar的变化

**同时您应该阅读**

* [Action Bar API 指南](http://developer.android.com/guide/topics/ui/actionbar.html)
* [Android Design Guide](http://developer.android.com/design/index.html)

本课程将教您如何在不同版本的Android下隐藏状态栏。隐藏状态栏（或者是导航栏）可以让内容得到更多的展示空间，从而提供一个更加沉浸式的用户体验。

图1展示了显示状态栏的界面

![status_bar_show](status_bar_show.png)

**图1**. 显示状态栏.

图2展示了隐藏状态栏的界面。请注意，Action Bar这个时候也被隐藏了。请永远不要在隐藏状态栏的时候显示Action Bar。

![status_bar_hide](status_bar_hide.png)

**图2**. 隐藏状态栏.

## 在4.0及以下版本中隐藏状态栏

在Android 4.0及更低的版本中，你可以通过设置`WindowManager`来隐藏状态栏。你可以动态的隐藏，也可以在你的manifest文件中设置Activity的主题。如果你的应用的状态栏在运行过程中会一直隐藏，那么推荐你使用改写manifest设定主题的方法（严格上来讲，即便设置了manifest你也可以动态的改变界面主题）。

```xml
<application
    ...
    android:theme="@android:style/Theme.Holo.NoActionBar.Fullscreen" >
    ...
</application>
```

设置主题的优势是：
* 易于维护，且不像动态设置标签那样容易出错
* 有更流畅的UI转换，因为在初始化你的Activity之前，系统已经得到了需要渲染UI的信息

另一方面我们可以选择使用`WindowManager`来动态隐藏状态栏。这个方法可以更简单的在用户与App进行交互式展示与隐藏状态栏。

```java
public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // If the Android version is lower than Jellybean, use this call to hide
        // the status bar.
        if (Build.VERSION.SDK_INT < 16) {
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }
        setContentView(R.layout.activity_main);
    }
    ...
}
```
当你设置`WindowManager`标签之后（无论是通过Activity主题还是动态设置），这个标签都会一直生效直到你清除它。

设置了`FLAG_LAYOUT_IN_SCREEN`之后，你可以拥有与启用`FLAG_FULLSCREEN`后相同的屏幕区域。这个方法防止了状态栏隐藏和展示的时候内容区域的大小变化。

## 在4.1及以上版本中隐藏状态栏

在Android 4.1(API level 16)以及更高的版本中，你可以使用[setSystemUiVisibility()](http://developer.android.com/reference/android/view/View.html#setSystemUiVisibility(int))来进行动态隐藏。`setSystemUiVisibility()`在View层面设置了UI的标签，然后这些设置被整合到了Window层面。`setSystemUiVisibility()`给了你一个比设置`WindowManager`标签更加粒度化的操作。下面这段代码隐藏了状态栏：

```java
View decorView = getWindow().getDecorView();
// Hide the status bar.
int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
decorView.setSystemUiVisibility(uiOptions);
// Remember that you should never show the action bar if the
// status bar is hidden, so hide that too if necessary.
ActionBar actionBar = getActionBar();
actionBar.hide();
```

注意以下几点：
* 一旦UI标签被清除(比如跳转到另一个Activity),如果你还想隐藏状态栏你就必须再次设定它。详细可以看第五节如何监听并响应UI可见性的变化。
* 在不同的地方设置UI标签是有所区别的。如果你在Activity的onCreate()方法中隐藏系统栏，当用户按下home键系统栏就会重新显示。当用户再重新打开Activity的时候，onCreate()不会被调用，所以系统栏还会保持可见。如果你想让在不同Activity之间切换时，系统UI保持不变，你需要在onResume()与onWindowFocusChaned()里设定UI标签。
* setSystemUiVisibility()仅仅在被调用的View显示的时候才会生效。
* 当从View导航到别的地方时，用setSystemUiVisibility()设置的标签会被清除。


## 让内容显示在状态栏之后

在Android 4.1及以上版本，你可以将应用的内容显示在状态栏之后，这样当状态栏显示与隐藏的时候，内容区域的大小就不会发生变化。要做到这个效果，我们需要用到`SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN`这个标志。同时，你也有可能需要`SYSTEM_UI_FLAG_LAYOUT_STABLE`这个标志来帮助你的应用维持一个稳定的布局。

当使用这种方法的时候，你就需要来确保应用中特定区域不会被系统栏掩盖（比如地图应用中一些自带的操作区域）。如果被覆盖了，应用可能就会无法使用。在大多数的情况下，你可以在布局文件中添加`android:fitsSystemWindows`标签，设置它为true。它会调整父ViewGroup使它留出特定区域给系统栏，对于大多数应用这种方法就足够了。

在一些情况下，你可能需要修改默认的padding大小来获取合适的布局。为了控制内容区域的布局相对系统栏（它占据了一个叫做“内容嵌入”`content insets`的区域）的位置，你可以重写`fitSystemWindows(Rect insets)`方法。当窗口的内容嵌入区域发生变化时，`fitSystemWindows()`方法会被view的hierarchy调用，让View做出相应的调整适应。重写这个方法你就可以按你的意愿处理嵌入区域与应用的布局。

## 同步状态栏与Action Bar的变化

在Android 4.1及以上的版本，为了防止在Action Bar隐藏和显示的时候布局发生变化，你可以使用Action Bar的overlay模式。在Overlay模式中，Activity的布局占据了所有可能的空间，好像Action Bar不存在一样，系统会在布局的上方绘制Aciton Bar。虽然这会遮盖住上方的一些布局，但是当Action Bar显示或者隐藏的时候，系统就不需要重新改变布局区域的大小，使之无缝的变化。

要启用Action Bar的overlay模式，你需要创建一个继承自Action Bar主题的自定义主题，将`android:windowActionBarOverlay`属性设置为true。要了解详细信息，请参考[添加Action Bar](basics\actionbar\index.html)课程中的[Action Bar的覆盖层叠](basics\acitonbar\overlaying.html)。

设置`SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN`来让你的activity使用的屏幕区域与设置`SYSTEM_UI_FLAG_FULLSCREEN`时的区域相同。当你需要隐藏系统UI时，使用`SYSTEM_UI_FLAG_FULLSCREEN`。这个操作也同时隐藏了Action Bar（因为` windowActionBarOverlay="true"`），当同时显示与隐藏ActionBar与状态栏的时候，使用一个动画来让他们相互协调。
