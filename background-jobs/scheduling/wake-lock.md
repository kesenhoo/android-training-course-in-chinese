# 保持设备唤醒

> 编写:[lttowq](https://github.com/lttowq) - 原文:

为了避免电源消耗，一个Android设备闲置时会迅速进入睡眠状态。然而这里有些时间当一个应用需要唤醒屏幕或者CPU并且保持唤醒完成一些任务。

你采取的方法依赖于你的应用的需要。但是，一般规则是你应该使用最轻量级的方法对的应用，减小你的应用对系统资源的影响。接下来的部分描述怎样处理当设备默认睡眠的行为与你请求不相容的情况。

##保持屏幕亮着

确定你的应用需要保持屏幕变亮，比如游戏与电影的应用。最好的方式是使用[FLAG_KEEP_SCREEN_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)在你的Activity（仅在Activity不在Service或其他组件里）
例如：

```java
public class MainActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  }
```

这个方法的优点像醒锁([在 Keep the CPU On讨论]())，它不需要特殊的权限，平台正确
管理你的用户在应用之间移动，不需要你的应用担心释放未使用资源。

另外一种实现在你的应用布局xml文件里，通过使用[android:keepScreenOn](https://developer.android.com/reference/android/R.attr.html#keepScreenOn)属性:
```java
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:keepScreenOn="true">
    ...
</RelativeLayout>
```

使用android:keepScreenOn="true"与使用[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)等效。你能无论使用哪个方法对你的应用都不错。编程方式设置该标志在你Activity的优点，它让你的编程后清除标志，从而使屏幕关闭该选项。

注意：你不需要清除[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)便签除非你不在想屏幕呆在你正在运行的应用里面（例如：如果你想要屏幕延时在一个确定的周期静止）。窗口管理照顾确保正确事情发生当你的应用进入后台或者返回前台。但是如果你明确清除从而允许屏幕再次关闭，使用-[clearFlags()](https://developer.android.com/reference/android/view/Window.html#clearFlags(int));
getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON).

##保持CPU运行

如果你需要保持CPU运行为了完成一些工作在设备睡眠，你可以使用[PowerManager](https://developer.android.com/reference/android/os/PowerManager.html)系统服务特性回调唤醒锁。唤醒锁允许你应用控制本地设备电源状态。

创建和支持唤醒锁能有个引人注目的影响对本地设备电源周期。因此你使用唤醒锁仅仅当你确实需要，并保持他们尽可能短的时间尽可能。例如，你不应该需要使用唤醒锁在一个Activity中。以上描述，如果你想保持屏幕亮着在你的Activity，使用[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)。

一种合理情况对于使用唤醒锁可能在后台服务需要抢占一个唤醒锁保持CPU运行当屏幕关闭时。
再一次，可是，这个实践应该最小因为它影响电池周期。

为了使用唤醒锁，首先你增加[WAKE_LOCK](https://developer.android.com/reference/android/Manifest.permission.html#WAKE_LOCK)权限在应用主要清单文件：

```xml
<uses-permission andriod:name="andriod.permission.WAKE_LOCK"/>
```

如果你的应用包括一个广播接收器使用这个服务做一些工作，你能管理你唤醒锁通过一个[WakeflBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html),作为描述[Using a WajefulBroadcastReceiver](https://developer.android.com/training/scheduling/wakelock.html#wakeful).这是优先的方法。如果你的应用不允许这个模式，这里告诉你之间设置唤醒锁：

```java
PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
Wakelock wakelock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE)LOCK),
	"MyWakelockTag");
wakelock.acquire();
```
为了释放唤醒锁，使用[wakelock.release()](https://developer.android.com/reference/android/os/PowerManager.WakeLock.html#release()).这释放你的要求的CPU，它是重要的
对于释放一个唤醒锁当你的应用使用完毕，避免消耗电量。

###使用WakefulBroadcastReceiver

使用一个广播接收器结合一个服务让你管理循环周期在后台任务。[WakeflBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)是一个特殊广播接收器类型小心创建和管理一个[PARTIAL_WAKE_LOCK](https://developer.android.com/reference/android/os/PowerManager.html#PARTIAL_WAKE_LOCK)对于你的应用程序。[WakeflBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)忽略任务对于一个[Service](https://developer.android.com/reference/android/app/Service.html)（典型的一个[IntentService](https://developer.android.com/reference/android/app/IntentService.html)），当确保设备不转换到睡眠状态。如果你不支持一个唤醒锁当转换工作对于一个服务，你实际上允许设备返回睡眠状态在
工作完成之前。网络结果是应用可能没有完成正在做的工作直到一些任意点在未来，不是你想要的。

首先你增加[WakeflBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)在你的主manifest文件里面，作为其他广播接收器。

```xml
<receiver andriod:name=".MyWakefulReceiver"></receiver>
```

代码开始在MyIntentService的方法[startWakefulService()](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html#startWakefulService(android.content.Context, android.content.Intent)).这个方法是完成[startService()](https://developer.android.com/reference/android/content/Context.html#startService(android.content.Intent)).除了[WakeflBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)支持唤醒锁当服务开启。通信停止与[startWakefulService()](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html#startWakefulService(android.content.Context, android.content.Intent))支持一个额外验证唤醒锁。

```java
public class MyWakefulReceiver extends WakefulBroadcaseReceiver{
	@Override
	public void onReceive(Content context, Intent intent){
		Intent service = new Intent(COntext,MyIntentService.class)
		startWakefulService(context,service);
	}
```

当服务完成，回调[MyWakefulReceiver.completeWakefulIntent()](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html#completeWakefulIntent(android.content.Intent))释放唤醒锁。[completeWakefulIntent()](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html#completeWakefulIntent(android.content.Intent))方法有它的相同参数停止从[WakeflBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html);

```java
public class MyWakefulReceiver extends IntentService{
	public static final int NOTIFICAION_ID = 1;
	private NotficationManager mNotificationManager;
	NotificationCompat.Builder builder;
	public MyIntentService(){
		Bundle extra = intent.getExtras();
		MyWakefulReceiver.completeWakefulIntent(intent);
	}
}
```
[下一课：调度重复闹钟]()
