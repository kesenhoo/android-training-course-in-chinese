# 退出全屏的Activity

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/exit.html>

<!--By default, users exit Android Wear activities by swiping from left to right. If the app contains horizontally scrollable content, users first have to navigate to the edge of the content and then swipe again from left to right to exit the app.-->
默认情况下，用户可以从左到右划动退出Android Wear activities。如果app含有水平水滚的内容，用户首先滚动至内容边缘然后再次从左到又滑动可以退出app。

<!--For more immersive experiences, like an app that can scroll a map in any direction, you can disable the swipe to exit gesture in your app. However, if you disable it, you must implement the long-press-to-dismiss UI pattern to let users exit your app using the DismissOverlayView class from the Wearable UI Library. You must also inform your users the first time they run your app that they can exit using a long press.-->
对于更加沉浸的体验，比如在app中可以滚动地图到任何位置，你可以在你的app中禁用滑动退出手势，然而，如果你禁用了这个，你必须使用Wearable UI库中的 *DismissOverlayView* 类实现long-press-to-dismiss UI让用户退出你的app。你当然也需要在用户第一次运行你的app的时候提醒用户可以长按退出app。

<!--For design guidelines about exiting Android Wear activities, see Breaking out of the card.-->
更多关于退出Android Wear activities的设计指南，请查看[Breaking out of the card](https://developer.android.com/design/wear/structure.html#Custom)。

## 禁用Swipe-To-Dismiss手势

<!-- the user interaction model of your app interferes with the swipe-to-dismiss gesture, you can disable it for your app. To disable the swipe-to-dismiss gesture in your app, extend the default theme and set the android:windowSwipeToDismiss attribute to false:-->
如果你的app要干涉滑动退出手势的用户交互模型，你在你的app中可以禁用它。为了在你的app中禁用滑动退出手势，继承默认theme然后设置 *android:windowSwipeToDismiss* 属性为 *false*：

	<style name="AppTheme" parent="Theme.DeviceDefault">
	    <item name="android:windowSwipeToDismiss">false</item>
	</style>
	
<!--If you disable this gesture, you must implement the long-press-to-dismiss UI pattern to let users exit your app, as described in the next section.-->
如果你禁用了这个手势，你需要实现长按退出UI元素以让用户可以退出你的app，类似下面章节的描述：

## 实现长按忽略元素

<!--To use the DissmissOverlayView class in your activity, add this element to your layout definition such that it covers the whole screen and is placed above all other views. For example:-->
要在你的activity中使用 *DissmissOverlayView* 类，添加这个元素到你的layout解释文件，让它全屏且覆盖在所有其他view上，例子：

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
	
<!--In your activity, obtain the DismissOverlayView element and set some introductory text. This text is shown to users the first time they run your app to inform them that they can exit the app using a long press gesture. Then use a GestureDetector to detect a long press:-->
在你的activity中，取得 *DismissOverlayView* 元素然后设置一些提示文字。这些文字会在用户第一次运行你的app时提醒用户可以使用长按手势退出app。接着用一个 *GestureDetector* 探测长按动作：

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
	
<!--When the system detects a long press gesture, DismissOverlayView shows an Exit button, which terminates your activity if the user presses it.-->
当系统发现长按动作， *DismissOverlayView* 会显示一个**退出**按钮，当用户点击它，你的activity会被终止。