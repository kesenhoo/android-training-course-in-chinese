# 保持设备唤醒

> 编写:[lttowq](https://github.com/lttowq) - 原文:<http://developer.android.com/training/scheduling/wakelock.html>

为了避免电量过度消耗，Android设备在被闲置之后会迅速进入睡眠状态。然而有时候应用会需要唤醒屏幕或者CPU并且保持它们的唤醒状态，直至一些任务被完成。

所采取的方法依赖于应用的具体需求。但是，通常来说，你应该使用最轻量级的方法，减小应用对系统资源的影响。接下来的部分描述在设备默认的睡眠行为与应用的需求不相符合的情况下，你应该如何进行对应的处理。

## 保持屏幕亮着

某些应用需要保持屏幕常亮，比如游戏与视频的应用。最好的方式是在你的Activity中（且仅在Activity中，而不在Service或其他应用组件里）使用[FLAG_KEEP_SCREEN_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)，例如：

```java
public class MainActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  }
```

该方法的优点与唤醒锁（Wake Locks）不同（见[保持CPU运作](http://developer.android.com/training/scheduling/wakelock.html#cpu)），它不需要任何特殊的权限，系统会正确地
管理应用之间的切换，且不必关心释放资源的问题。

另外一种方法是在应用的XML布局文件里，使用[android:keepScreenOn](https://developer.android.com/reference/android/R.attr.html#keepScreenOn)属性:

```java
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:keepScreenOn="true">
    ...
</RelativeLayout>
```

使用`android:keepScreenOn="true"`与使用[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)等效。你可以选择最合适你的应用的方法。在你的Activity里面通过代码设置常亮标识的优点，是可以通过代码动态清除清除这个标示，从而使屏幕可以关闭。

> **Notes**：除非你不再希望正在运行的应用长时间点亮屏幕（例如：在一定时间无操作发生后，你想要将屏幕关闭），否则你是不需要清除[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON) 标识的。WindowManager会在应用进入后台或者返回前台时，正确管理屏幕点亮与关闭的行为。但是如果你想要显式地清除这一标识，从而使得屏幕能够关闭，可以使用<a href="https://developer.android.com/reference/android/view/Window.html#clearFlags(int)">clearFlags()</a>：
```java
getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON).
```

## 保持CPU运行

如果你需要在设备睡眠之前，保持CPU运行来完成一些工作，你可以使用[PowerManager](https://developer.android.com/reference/android/os/PowerManager.html)系统服务中的唤醒锁功能。唤醒锁允许应用控制设备的电源状态。

创建和保持唤醒锁会对设备的电源寿命产生巨大影响。因此你应该仅在你确实需要时使用唤醒锁，且保持时间应该越短越好。例如，Activity中使用唤醒锁就显得没有必要了。如上所述，可以在Activity中使用[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)让屏幕保持常亮。

使用唤醒锁的一种合理情况可能是：一个后台服务需要在屏幕关闭时利用唤醒锁保持CPU运行。
再次强调，应该尽可能规避使用该方法，因为它会影响到电池寿命。

> **选择使用唤醒锁的情况**：
> 1. 如果你的应用正在执行一个HTTP长连接的下载任务，可以考虑使用[DownloadManager](http://developer.android.com/reference/android/app/DownloadManager.html)。
> 2. 如果你的应用正在冲一个外部服务器同步数据，可以考虑创建一个[SyncAdapter](http://developer.android.com/training/sync-adapters/index.html)
> 3. 如果你的应用需要依赖于某些后台服务，可以考虑使用[RepeatingAlarm](http://developer.android.com/training/scheduling/alarms.html)或者[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)，以此每隔特定的时间，将这些服务激活。

为了使用唤醒锁，首先需要在应用的Manifest清单文件中增加[WAKE_LOCK](https://developer.android.com/reference/android/Manifest.permission.html#WAKE_LOCK)权限：

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

如果你的应用包含一个广播接收器并使用服务来完成一些工作，你可以通过[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)管理你唤醒锁。下一章节中将会提到，这是一种推荐的方法。如果你的应用不满足上述情况，可以使用下面的方法直接设置唤醒锁：

```java
PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
Wakelock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
        "MyWakelockTag");
wakeLock.acquire();
```
可以调用<a href="https://developer.android.com/reference/android/os/PowerManager.WakeLock.html#release()">wakelock.release()</a>来释放唤醒锁。当应用使用完毕时，应该释放该唤醒锁，以避免电量过度消耗。

### 使用WakefulBroadcastReceiver

使用一个广播接收器结合一个服务让你管理循环周期在后台任务。[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)是一个特殊广播接收器类型小心创建和管理一个[PARTIAL_WAKE_LOCK](https://developer.android.com/reference/android/os/PowerManager.html#PARTIAL_WAKE_LOCK)对于你的应用程序。[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)忽略任务对于一个[Service](https://developer.android.com/reference/android/app/Service.html)（典型的一个[IntentService](https://developer.android.com/reference/android/app/IntentService.html)），当确保设备不转换到睡眠状态。如果你不支持一个唤醒锁当转换工作对于一个服务，你实际上允许设备返回睡眠状态在
工作完成之前。网络结果是应用可能没有完成正在做的工作直到一些任意点在未来，不是你想要的。

首先你增加[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)在你的主manifest文件里面，作为其他广播接收器。

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

当服务完成，回调[MyWakefulReceiver.completeWakefulIntent()](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html#completeWakefulIntent(android.content.Intent))释放唤醒锁。[completeWakefulIntent()](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html#completeWakefulIntent(android.content.Intent))方法有它的相同参数停止从[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html);

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
