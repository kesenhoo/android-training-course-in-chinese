# 保持设备唤醒

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/scheduling/wakelock.html>

为了避免电量过度消耗，Android设备会在被闲置之后迅速进入睡眠状态。然而有时候应用会需要唤醒屏幕或者是唤醒CPU并且保持它们的唤醒状态，直至一些任务被完成。

想要做到这一点，所采取的方法依赖于应用的具体需求。但是通常来说，我们应该使用最轻量级的方法，减小其对系统资源的影响。在接下来的部分中，我们将会描述在设备默认的睡眠行为与应用的需求不相符合的情况下，我们应该如何进行对应的处理。

## 保持屏幕常亮

某些应用需要保持屏幕常亮，比如游戏与视频应用。最好的方式是在你的Activity中（且仅在Activity中，而不是在Service或其他应用组件里）使用[FLAG_KEEP_SCREEN_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)属性，例如：

```java
public class MainActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  }
```

该方法的优点与唤醒锁（Wake Locks）不同（唤醒锁的内容在本章节后半部分），它不需要任何特殊的权限，系统会正确地
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

使用`android:keepScreenOn="true"`与使用[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)等效。你可以选择最适合你的应用的方法。在Activity中通过代码设置常亮标识的优点在于：你可以通过代码动态清除这个标示，从而使屏幕可以关闭。

> **Notes**：除非你不再希望正在运行的应用长时间点亮屏幕（例如：在一定时间无操作发生后，你想要将屏幕关闭），否则你是不需要清除[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON) 标识的。WindowManager会在应用进入后台或者返回前台时，正确管理屏幕的点亮或者关闭。但是如果你想要显式地清除这一标识，从而使得屏幕能够关闭，可以使用`getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)`方法。

## 保持CPU运行

如果你需要在设备睡眠之前，保持CPU运行来完成一些工作，你可以使用[PowerManager](https://developer.android.com/reference/android/os/PowerManager.html)系统服务中的唤醒锁功能。唤醒锁允许应用控制设备的电源状态。

创建和保持唤醒锁会对设备的电源寿命产生巨大影响。因此你应该仅在你确实需要时使用唤醒锁，且使用的时间应该越短越好。如果想要在Activity中使用唤醒锁就显得没有必要了。如上所述，可以在Activity中使用[FLAG_KEEP_SCRRE_ON](https://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#FLAG_KEEP_SCREEN_ON)让屏幕保持常亮。

使用唤醒锁的一种合理情况可能是：一个后台服务需要在屏幕关闭时利用唤醒锁保持CPU运行。再次强调，应该尽可能规避使用该方法，因为它会影响到电池寿命。

> **不必使用唤醒锁的情况**：
> 1. 如果你的应用正在执行一个HTTP长连接的下载任务，可以考虑使用[DownloadManager](http://developer.android.com/reference/android/app/DownloadManager.html)。
> 2. 如果你的应用正在从一个外部服务器同步数据，可以考虑创建一个[SyncAdapter](http://developer.android.com/training/sync-adapters/index.html)
> 3. 如果你的应用需要依赖于某些后台服务，可以考虑使用[RepeatingAlarm](http://developer.android.com/training/scheduling/alarms.html)或者[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)，以此每隔特定的时间，将这些服务激活。

为了使用唤醒锁，首先需要在应用的Manifest清单文件中增加[WAKE_LOCK](https://developer.android.com/reference/android/Manifest.permission.html#WAKE_LOCK)权限：

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

如果你的应用包含一个BroadcastReceiver并使用Service来完成一些工作，你可以通过[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)管理你唤醒锁。后续章节中将会提到，这是一种推荐的方法。如果你的应用不满足上述情况，可以使用下面的方法直接设置唤醒锁：

```java
PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
Wakelock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
        "MyWakelockTag");
wakeLock.acquire();
```

可以调用`wakelock.release()`来释放唤醒锁。当应用使用完毕时，应该释放该唤醒锁，以避免电量过度消耗。

### 使用WakefulBroadcastReceiver

你可以将BroadcastReceiver和Service结合使用，以此来管理后台任务的生命周期。[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)是一种特殊的BroadcastReceiver，它专注于创建和管理应用的[PARTIAL_WAKE_LOCK](https://developer.android.com/reference/android/os/PowerManager.html#PARTIAL_WAKE_LOCK)。WakefulBroadcastReceiver会将任务交付给[Service](https://developer.android.com/reference/android/app/Service.html)（一般会是一个[IntentService](https://developer.android.com/reference/android/app/IntentService.html)），同时确保设备在此过程中不会进入睡眠状态。如果在该过程当中没有保持住唤醒锁，那么还没等任务完成，设备就有可能进入睡眠状态了。其结果就是：应用可能会在未来的某一个时间节点才把任务完成，这显然不是你所期望的。

要使用WakefulBroadcastReceiver，首先在Manifest文件添加一个标签：

```xml
<receiver android:name=".MyWakefulReceiver"></receiver>
```

下面的代码通过`startWakefulService()`启动`MyIntentService`。该方法和`startService()`类似，除了WakeflBroadcastReceiver会在Service启动后将唤醒锁保持住。传递给`startWakefulService()`的Intent会携带有一个Extra数据，用来标识唤醒锁。

```java
public class MyWakefulReceiver extends WakefulBroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        // Start the service, keeping the device awake while the service is
        // launching. This is the Intent to deliver to the service.
        Intent service = new Intent(context, MyIntentService.class);
        startWakefulService(context, service);
    }
}
```

当Service结束之后，它会调用`MyWakefulReceiver.completeWakefulIntent()`来释放唤醒锁。`completeWakefulIntent()`方法中的Intent参数是和WakefulBroadcastReceiver传递进来的Intent参数一致的：

```java
public class MyIntentService extends IntentService {
    public static final int NOTIFICATION_ID = 1;
    private NotificationManager mNotificationManager;
    NotificationCompat.Builder builder;
    public MyIntentService() {
        super("MyIntentService");
    }
    @Override
    protected void onHandleIntent(Intent intent) {
        Bundle extras = intent.getExtras();
        // Do the work that requires your app to keep the CPU running.
        // ...
        // Release the wake lock provided by the WakefulBroadcastReceiver.
        MyWakefulReceiver.completeWakefulIntent(intent);
    }
}
```
