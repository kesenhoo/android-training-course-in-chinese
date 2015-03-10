# 显示Confirmation

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/confirm.html>

<!--Confirmations in Android Wear apps use the whole screen or a larger portion of it than those in handheld apps. This ensures that users can see these confirmations by just glancing at the screen and that they have large enough touch targets to cancel an action.-->

Android Wear apps中的[Confirmations](https://developer.android.com/design/wear/patterns.html#Countdown)通常全屏或是相比于手持app占更大的部分。这样确保用户可以一眼看到确认器(confirmations)且有一个足够大的触摸区域用于取消一个操作。

<!--The Wearable UI Library helps you show confirmation animations and timers in your Android Wear apps:-->
Wearable UI Library帮助你在你的Android Wear apps中显示确认器（confirmation）动画和定时器：

<!--Confirmation timers
Automatic confirmation timers show users an animated timer that lets them cancel an action they just performed.
Confirmation animations
Confirmation animations give users visual feedback when they complete an action.-->

*Confirmation timers*

* 自动confirmation定时器为用户显示一个包含动画的定时器，让用户可以取消他们最近的操作。


*Confirmation animations*

* Confirmation animations 给用户一个在操作完成时的完成的视觉反馈。

<!--The following sections show you how to implement these patterns.-->
下面的章节为你演示了如何实现这些样式。

## 使用自动 Confirmation 定时器

<!--Automatic confirmation timers let users cancel an action they just performed. When the user performs the action, your app shows a button to cancel the action with a timer animation and starts the timer. The user has the option to cancel the action until the timer finishes. Your app gets notified if the user cancels the action and when the timer expires.-->
自动 Confirmation 定时器让用户只需要取消操作。当用户做一个操作，你的app显示带有定时动画的一个cancel按钮，用户可以在定时结束前选择取消操作。如果用户选择取消操作货定时结束你的app会得到一个通知。

![](https://developer.android.com/wear/images/09_uilib.png)
**Figure 1:** A confirmation timer.

<!--To show a confirmation timer when users complete an action in your app:-->
为了在用户完成操作时显示一个confirmation timer：

<!--Add a DelayedConfirmationView element to your layout.
Implement the DelayedConfirmationListener interface in your activity.
Set the duration of the timer and start it when the user completes an action.-->

1. 添加 *DelayedConfirmationView* 元素到你的layout中。
2. 在你的activity中实现 *DelayedConfirmationListener* 接口。
3. 当用户完成一个操作时，设置定时器的定时时间然后启动它。

<!--Add the DelayedConfirmationView element to your layout as follows:-->
像下面这样添加 *DelayedConfirmationView* 元素到你的layout中：

	<android.support.wearable.view.DelayedConfirmationView
	    android:id="@+id/delayed_confirm"
	    android:layout_width="40dp"
	    android:layout_height="40dp"
	    android:src="@drawable/cancel_circle"
	    app:circle_border_color="@color/lightblue"
	    app:circle_border_width="4dp"
	    app:circle_radius="16dp">
	</android.support.wearable.view.DelayedConfirmationView>
	
<!--You can assign a drawable resource to display inside the circle with the android:src attribute and configure the parameters of the circle directly on the layout definition.-->
你可以在layout解释里分配 *android:src* 中的drawable资源显示在圆中然后直接设置圆的属性。

<!--To be notified when the timer finishes or when users tap on it, implement the corresponding listener methods in your activity:-->
为了获得定时结束货用户点击按钮的通知，你需要在activity中实现相应的接口模块：

public class WearActivity extends Activity implements
                           DelayedConfirmationView.DelayedConfirmationListener {

    private DelayedConfirmationView mDelayedView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_wear_activity);

        mDelayedView =
                (DelayedConfirmationView) findViewById(R.id.delayed_confirm);
        mDelayedView.setListener(this);
    }

    @Override
    public void onTimerFinished(View view) {
        // User didn't cancel, perform the action
    }

    @Override
    public void onTimerSelected(View view) {
        // User canceled, abort the action
    }
}


<!--To start the timer, add the following code to the point in your activity where users select an action:-->
为了开始定时器，添加下面的代码到你的activity中处理用户选择了某个操作的位置中：

	// Two seconds to cancel the action
	mDelayedView.setTotalTimeMs(2000);
	// Start the timer
	mDelayedView.start();
	
## 显示 Confirmation 动画

<!--To show a confirmation animation when users complete an action in your app, create an intent that starts ConfirmationActivity from one of your activities. You can specify one of the these animations with the EXTRA_ANIMATION_TYPE intent extra:-->
为了显示confirmation动画当用户在你的app中完成一个操作，创建一个从其他activities启动*ConfirmationActivity* 的 *intent* 。你可以具体制定一种动画到 intent extra 的 *EXTRA_ANIMATION_TYPE*：

* SUCCESS_ANIMATION
* FAILURE_ANIMATION
* OPEN_ON_PHONE_ANIMATION

<!--You can also add a message that appears under the confirmation icon.-->
你也可以添加一条消息出现在 confirmation icon下面。

![](https://developer.android.com/wear/images/08_uilib.png)

**Figure 2:** A confirmation animation.

<!--To use the ConfirmationActivity in your app, first declare this activity in your manifest file:-->
要在你的app中使用 *ConfirmationActivity*，首先在你的manifest文件：

	<manifest>
	  <application>
	    ...
	    <activity
	        android:name="android.support.wearable.activity.ConfirmationActivity">
	    </activity>
	  </application>
	</manifest>
	
<!--Then determine the result of the user action and start the activity with an intent:-->
当用户操作获得结果，使用intent启动activity:

	Intent intent = new Intent(this, ConfirmationActivity.class);
	intent.putExtra(ConfirmationActivity.EXTRA_ANIMATION_TYPE,
	                ConfirmationActivity.SUCCESS_ANIMATION);
	intent.putExtra(ConfirmationActivity.EXTRA_MESSAGE,
	                getString(R.string.msg_sent));
	startActivity(intent);
	
<!--After showing the confirmation animation, ConfirmationActivity finishes and your activity resumes.-->
当confirmation动画显示结束。*ConfirmationActivity* finish然后你的activity resumes。