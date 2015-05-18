# 显示确认界面

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/confirm.html>

Android Wear应用中的[确认界面(Confirmations)](https://developer.android.com/design/wear/patterns.html#Countdown)通常是全屏或者相比于手持应用占更大的部分。这样确保用户可以一眼看到确认界面(confirmations)且有一个足够大的触摸区域用于取消一个操作。

Wearable UI库帮助我们在Android Wear应用中显示确认动画和定时器：

*确认定时器*

* 自动确认定时器为用户显示一个定时器动画，让用户可以取消他们最近的操作。


*确认界面动画*

* 确认界面动画给用户在完成一个操作时的视觉反馈。

下面的章节将演示了如何实现这些模式。

## 使用自动确认定时器

自动确认定时器让用户取消刚做的操作。当用户做一个操作，我们的应用会显示一个带有定时动画的取消按钮，并且启动该定时器。用户可以在定时结束前选择取消操作。如果用户选择取消操作或定时结束，我们的应用会得到一个通知。

![](09_uilib.png)

**Figure 1:** 一个确认定时器.

为了在用户完成操作时显示一个确认定时器：

1. 添加`DelayedConfirmationView`元素到layout中。
2. 在activity中实现`DelayedConfirmationListener`接口。
3. 当用户完成一个操作时，设置定时器的定时时间然后启动它。

像下面这样添加`DelayedConfirmationView`元素到layout中：

```xml
<android.support.wearable.view.DelayedConfirmationView
    android:id="@+id/delayed_confirm"
    android:layout_width="40dp"
    android:layout_height="40dp"
    android:src="@drawable/cancel_circle"
    app:circle_border_color="@color/lightblue"
    app:circle_border_width="4dp"
    app:circle_radius="16dp">
</android.support.wearable.view.DelayedConfirmationView>
```
	
在layout定义中，我们可以用`android:src`制定一个drawable资源，用于显示在圆形里。然后直接设置圆的参数。

为了获得定时结束或用户点击按钮时的通知，需要在activity中实现相应的listener方法：

```java
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
```

为了启动定时器，添加下面的代码到activity处理用户选择某个操作的位置中：

```java
// Two seconds to cancel the action
mDelayedView.setTotalTimeMs(2000);
// Start the timer
mDelayedView.start();
```
	
## 显示确认动画

为了当用户在我们的应用中完成一个操作时显示确认动画，我们需要创建一个从应用中的某个activity启动`ConfirmationActivity`的intent。我们可以用`EXTRA_ANIMATION_TYPE` intent extra来指定下面其中一种动画：

* `SUCCESS_ANIMATION`
* `FAILURE_ANIMATION`
* `OPEN_ON_PHONE_ANIMATION`

我们还可以在确认图标下面添加一条消息。

![](08_uilib.png)

**Figure 2:** 一个确认动画

要在应用中使用`ConfirmationActivity`，首先在manifest文件声明这个activity：

```xml
<manifest>
  <application>
    ...
    <activity
        android:name="android.support.wearable.activity.ConfirmationActivity">
    </activity>
  </application>
</manifest>
```
	
然后确定用户操作的结果，并使用intent启动activity:

```java
Intent intent = new Intent(this, ConfirmationActivity.class);
intent.putExtra(ConfirmationActivity.EXTRA_ANIMATION_TYPE,
                ConfirmationActivity.SUCCESS_ANIMATION);
intent.putExtra(ConfirmationActivity.EXTRA_MESSAGE,
                getString(R.string.msg_sent));
startActivity(intent);
```

当确认动画显示结束后，`ConfirmationActivity`会销毁（Finish），我们的的activity会恢复（Resume）。