# 退出全屏的Activity

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/exit.html>

默认情况下，用户通过从左到右滑动退出Android Wear activities。如果应用含有水平滚动的内容，用户首先滑动到内容边缘，然后再次从左到右滑动即退出app。

对于更加沉浸式的体验，比如在应用中可以任意方向地滚动地图，这时我们可以在应用中禁用滑动退出手势。然而，如果我们禁用了这个功能，那么我们必须使用Wearable UI库中的`DismissOverlayView`类实现长按退出UI模式让用户退出应用。当然，我们需要在用户第一次运行我们应用的时候提醒用户可以通过长按退出应用。

更多关于退出Android Wear activities的设计指南，请查看[Breaking out of the card](https://developer.android.com/design/wear/structure.html#Custom)。

## 禁用滑动退出手势

如果我们应用的用户交互模型与滑动退出手势相冲突，那么我们可以在应用中禁用它。为了禁用滑动退出手势，需要继承默认的theme，然后设置`android:windowSwipeToDismiss` 属性为`false`：

```xml
<style name="AppTheme" parent="Theme.DeviceDefault">
    <item name="android:windowSwipeToDismiss">false</item>
</style>
```
	
如果我们禁用了这个手势，那么我们需要实现长按退出UI模型来让用户退出我们的应用，下面的章节会介绍相关内容。

## 实现长按退出模式

要在activity中使用`DissmissOverlayView`类，添加下面这个节点到layout文件，让它全屏且覆盖在所有其他view上。例如：

```xml
<FrameLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_height="match_parent"
    android:layout_width="match_parent">

    <!-- other views go here -->

    <android.support.wearable.view.DismissOverlayView
        android:id="@+id/dismiss_overlay"
        android:layout_height="match_parent"
        android:layout_width="match_parent"/>
<FrameLayout>
```
	
在我们的activity中，取得`DismissOverlayView`元素并设置一些提示文字。这些文字会在用户第一次运行我们的应用时提醒用户可以使用长按手势退出应用。接着用`GestureDetector`检测长按动作：

```java
public class WearActivity extends Activity {

    private DismissOverlayView mDismissOverlay;
    private GestureDetector mDetector;

    public void onCreate(Bundle savedState) {
        super.onCreate(savedState);
        setContentView(R.layout.wear_activity);

        // Obtain the DismissOverlayView element
        mDismissOverlay = (DismissOverlayView) findViewById(R.id.dismiss_overlay);
        mDismissOverlay.setIntroText(R.string.long_press_intro);
        mDismissOverlay.showIntroIfNecessary();

        // Configure a gesture detector
        mDetector = new GestureDetector(this, new SimpleOnGestureListener() {
            public void onLongPress(MotionEvent ev) {
                mDismissOverlay.show();
            }
        });
    }

    // Capture long presses
    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        return mDetector.onTouchEvent(ev) || super.onTouchEvent(ev);
    }
}
```
	
当系统检测到一个长按动作，`DismissOverlayView`会显示一个**退出**按钮。如果用户点击它，那么我们的activity会被终止。