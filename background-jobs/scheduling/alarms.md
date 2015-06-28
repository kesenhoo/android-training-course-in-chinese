# 调度重复的闹钟

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/scheduling/alarms.html>

闹钟（基于[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)类）给予你一种在应用使用期之外执行与时间相关的操作的方法。你可以使用闹钟初始化一个长时间的操作，例如每天开启一次后台服务，下载当日的天气预报。

闹钟具有如下特性：

* 允许你通过预设时间或者设定某个时间间隔，来触发Intent；
* 你可以将它与BroadcastReceiver相结合，来启动服务并执行其他操作；
* 可在应用范围之外执行，所以你可以在你的应用没有运行或设备处于睡眠状态的情况下，使用它来触发事件或行为；
* 帮助你的应用最小化资源需求，你可以使用闹钟调度你的任务，来替代计时器或者长时间连续运行的后台服务。

> **Note**：对于那些需要确保在应用使用期之内发生的定时操作，可以使用闹钟替代使用[Handler](https://developer.android.com/reference/android/os/Handler.html)结合[Timer](https://developer.android.com/reference/java/util/Timer.html)与[Thread](https://developer.android.com/reference/java/lang/Thread.html)的方法。因为它可以让Android系统更好地统筹系统资源。

## 权衡利弊

重复闹钟的机制比较简单，没有太多的灵活性。它对于你的应用来说或许不是一种最好的选择，特别是当你想要触发网络操作的时候。设计不佳的闹钟会导致电量快速耗尽，而且会对服务端产生巨大的负荷。

当我们从服务端同步数据时，往往会在应用不被使用的时候时被唤醒触发执行某些操作。此时你可能希望使用重复闹钟。但是如果存储数据的服务端是由你控制的，使用[Google Cloud Messaging](https://developer.android.com/google/gcm/index.html)（GCM）结合[sync adapter](https://developer.android.com/training/sync-adapters/index.html)是一种更好解决方案。SyncAdapter提供的任务调度选项和[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)基本相同，但是它能提供更多的灵活性。比如：同步的触发可能基于一条“新数据”提示消息，而消息的产生可以基于服务器或设备，用户的操作（或者没有操作），每天的某一时刻等等。

### 最佳实践方法

在设计重复闹钟过程中，你所做出的每一个决定都有可能影响到你的应用将会如何使用系统资源。例如，我们假想一个会从服务器同步数据的应用。同步操作基于的是时钟时间，具体来说，每一个应用的实例会在下午十一点整进行同步，巨大的服务器负荷会导致服务器响应时间变长，甚至拒绝服务。因此在我们使用闹钟时，请牢记下面的最佳实践建议：

*  对任何由重复闹钟触发的网络请求添加一定的随机性（抖动）：
	* 在闹钟触发时做一些本地任务。“本地任务”指的是任何不需要访问服务器或者从服务器获取数据的任务；
	* 同时对于那些包含有网络请求的闹钟，在调度时机上增加一些随机性。
* 尽量让你的闹钟频率最小；
* 如果不是必要的情况，不要唤醒设备（这一点与闹钟的类型有关，本节课后续部分会提到）；
* 触发闹钟的时间不必过度精确；
尽量使用`setInexactRepeating()`方法替代`setRepeating()`方法。当你使用`setInexactRepeating()`方法时，Android系统会集中多个应用的重复闹钟同步请求，并一起触发它们。这可以减少系统将设备唤醒的总次数，以此减少电量消耗。从Android 4.4（API Level19）开始，所有的重复闹钟都将是非精确型的。注意虽然`setInexactRepeating()`是`setRepeating()`的改进版本，它依然可能会导致每一个应用的实例在某一时间段内同时访问服务器，造成服务器负荷过重。因此如之前所述，对于网络请求，我们需要为闹钟的触发时机增加随机性。
* 尽量避免让闹钟基于时钟时间。

想要在某一个精确时刻触发重复闹钟是比较困难的。我们应该尽可能使用[ELAPSED_REALTIME](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME)。不同的闹钟类型会在本节课后半部分展开。

## 设置重复闹钟

如上所述，对于定期执行的任务或者数据查询而言，使用重复闹钟是一个不错的选择。它具有下列属性：

* 闹钟类型（后续章节中会展开讨论）；
* 触发时间。如果触发时间是过去的某个时间点，闹钟会立即被触发；
* 闹钟间隔时间。例如，一天一次，每小时一次，每五秒一次，等等；
* 在闹钟被触发时才被发出的Pending Intent。如果你为同一个Pending Intent设置了另一个闹钟，那么它会将第一个闹钟覆盖。

### 选择闹钟类型

使用重复闹钟要考虑的第一件事情是闹钟的类型。

闹钟类型有两大类：`ELAPSED_REALTIME`和`REAL_TIME_CLOCK`（RTC）。`ELAPSED_REALTIME`从系统启动之后开始计算，`REAL_TIME_CLOCK`使用的是世界统一时间（UTC）。也就是说由于`ELAPSED_REALTIME`不受地区和时区的影响，所以它适合于基于时间差的闹钟（例如一个每过30秒触发一次的闹钟）。`REAL_TIME_CLOCK`适合于那些依赖于地区位置的闹钟。

两种类型的闹钟都还有一个唤醒（`WAKEUP`）版本，也就是可以在设备屏幕关闭的时候唤醒CPU。这可以确保闹钟会在既定的时间被激活，这对于那些实时性要求比较高的应用（比如含有一些对执行时间有要求的操作）来说非常有效。如果你没有使用唤醒版本的闹钟，那么所有的重复闹钟会在下一次设备被唤醒时被激活。

如果你只是简单的希望闹钟在一个特定的时间间隔被激活（例如每半小时一次），那么你可以使用任意一种`ELAPSED_REALTIME`类型的闹钟，通常这会是一个更好的选择。

如果你的闹钟是在每一天的特定时间被激活，那么你可以选择`REAL_TIME_CLOCK`类型的闹钟。不过需要注意的是，这个方法会有一些缺陷——如果地区发生了变化，应用可能无法做出正确的改变；另外，如果用户改变了设备的时间设置，这可能会造成应用产生预期之外的行为。使用`REAL_TIME_CLOCK`类型的闹钟还会有精度的问题，因此我们建议你尽可能使用`ELAPSED_REALTIME`类型。

下面列出闹钟的具体类型：

* [ELAPSED_REALTIME](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME)：从设备启动之后开始算起，度过了某一段特定时间后，激活Pending Intent，但不会唤醒设备。其中设备睡眠的时间也会包含在内。
* [ELAPSED_REALTIME_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME_WAKEUP)：从设备启动之后开始算起，度过了某一段特定时间后唤醒设备。
* [RTC](https://developer.android.com/reference/android/app/AlarmManager.html#RTC)：在某一个特定时刻激活Pending Intent，但不会唤醒设备。
* [RTC_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#RTC_WAKEUP)：在某一个特定时刻唤醒设备并激活Pending Intent。

### ELAPSED_REALTIME_WAKEUP案例

下面是使用[ELAPSED_REALTIME_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME_WAKEUP)的例子。

每隔在30分钟后唤醒设备以激活闹钟：

```java
// Hopefully your alarm will have a lower frequency than this!
alarmMgr.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
        AlarmManager.INTERVAL_HALF_HOUR,
        AlarmManager.INTERVAL_HALF_HOUR, alarmIntent);
```

在一分钟后唤醒设备并激活一个一次性（无重复）闹钟：

```java
private AlarmManager alarmMgr;
private PendingIntent alarmIntent;
...
alarmMgr = (AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
Intent intent = new Intent(context, AlarmReceiver.class);
alarmIntent = PendingIntent.getBroadcast(context, 0, intent, 0);

alarmMgr.set(AlarmManager.ELAPSED_REALTIME_WAKEUP,
        SystemClock.elapsedRealtime() +
        60 * 1000, alarmIntent);
```

### RTC案例

下面是使用[RTC_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#RTC_WAKEUP)的例子。

在大约下午2点唤醒设备并激活闹钟，并不断重复：

```java
// Set the alarm to start at approximately 2:00 p.m.
Calendar calendar = Calendar.getInstance();
calendar.setTimeInMillis(System.currentTimeMillis());
calendar.set(Calendar.HOUR_OF_DAY, 14);

// With setInexactRepeating(), you have to use one of the AlarmManager interval
// constants--in this case, AlarmManager.INTERVAL_DAY.
alarmMgr.setInexactRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(),
        AlarmManager.INTERVAL_DAY, alarmIntent);
```

让设备精确地在上午8点半被唤醒并激活闹钟，自此之后每20分钟唤醒一次：

```java
private AlarmManager alarmMgr;
private PendingIntent alarmIntent;
...
alarmMgr = (AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
Intent intent = new Intent(context, AlarmReceiver.class);
alarmIntent = PendingIntent.getBroadcast(context, 0, intent, 0);

// Set the alarm to start at 8:30 a.m.
Calendar calendar = Calendar.getInstance();
calendar.setTimeInMillis(System.currentTimeMillis());
calendar.set(Calendar.HOUR_OF_DAY, 8);
calendar.set(Calendar.MINUTE, 30);

// setRepeating() lets you specify a precise custom interval--in this case,
// 20 minutes.
alarmMgr.setRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(),
        1000 * 60 * 20, alarmIntent);
```

### 决定闹钟的精确度

如上所述，创建闹钟的第一步是要选择闹钟的类型，然后你需要决定闹钟的精确度。对于大多数应用而言，`setInexactRepeating()`会是一个正确的选择。当你使用该方法时，Android系统会集中多个应用的重复闹钟同步请求，并一起触发它们。这样可以减少电量的损耗。

对于另一些实时性要求较高的应用——例如，闹钟需要精确地在上午8点半被激活，并且自此之后每隔1小时激活一次——那么可以使用`setRepeating()`。不过你应该尽量避免使用精确的闹钟。

使用`setRepeating()`时，你可以制定一个自定义的时间间隔，但在使用`setInexactRepeating()`时不支持这么做。此时你只能选择一些时间间隔常量，例如：[INTERVAL_FIFTEEN_MINUTES](https://developer.android.com/reference/android/app/AlarmManager.html#INTERVAL_FIFTEEN_MINUTES) ，[INTERVAL_DAY](http://developer.android.com/reference/android/app/AlarmManager.html#INTERVAL_DAY)等。完整的常量列表，可以查看[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)。

### 取消闹钟

你可能希望在应用中添加取消闹钟的功能。要取消闹钟，可以调用AlarmManager的`cancel()`方法，并把你不想激活的[PendingIntent](https://developer.android.com/reference/android/app/PendingIntent.html)传递进去，例如：

```java
// If the alarm has been set, cancel it.
if (alarmMgr!= null) {
    alarmMgr.cancel(alarmIntent);
}
```

###在设备启动后启用闹钟

默认情况下，所有的闹钟会在设备关闭时被取消。要防止闹钟被取消，你可以让你的应用在用户重启设备后自动重启一个重复闹钟。这样可以让[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)继续执行它的工作，且不需要用户手动重启闹钟。

具体步骤如下：

1.在应用的Manifest文件中设置[RECEIVE_BOOT_CMPLETED](https://developer.android.com/reference/android/Manifest.permission.html#RECEIVE_BOOT_COMPLETED)权限，这将允许你的应用接收系统启动完成后发出的[ACTION_BOOT_COMPLETED](https://developer.android.com/reference/android/content/Intent.html#ACTION_BOOT_COMPLETED)广播（只有在用户至少将你的应用启动了一次后，这样做才有效）：

```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

2.实现[BoradcastReceiver](https://developer.android.com/reference/android/content/BroadcastReceiver.html)用于接收广播：

```java
public class SampleBootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals("android.intent.action.BOOT_COMPLETED")) {
            // Set the alarm here.
        }
    }
}
```

3.在你的Manifest文件中添加一个接收器，其Intent-Filter接收[ACTION_BOOT_COMPLETED](https://developer.android.com/reference/android/content/Intent.html#ACTION_BOOT_COMPLETED)这一Action：

```xml
<receiver android:name=".SampleBootReceiver"
        android:enabled="false">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED"></action>
    </intent-filter>
</receiver>
```

注意Manifest文件中，对接收器设置了`android:enabled="false"`属性。这意味着除非应用显式地启用它，不然该接收器将不被调用。这可以防止接收器被不必要地调用。你可以像下面这样启动接收器（比如用户设置了一个闹钟）：

```java
ComponentName receiver = new ComponentName(context, SampleBootReceiver.class);
PackageManager pm = context.getPackageManager();

pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP);
```

一旦你像上面那样启动了接收器，它将一直保持启动状态，即使用户重启了设备也不例外。换句话说，通过代码设置的启用配置将会覆盖掉Manifest文件中的现有配置，即使重启也不例外。接收器将保持启动状态，直到你的应用将其禁用。你可以像下面这样禁用接收器（比如用户取消了一个闹钟）：

```java
ComponentName receiver = new ComponentName(context, SampleBootReceiver.class);
PackageManager pm = context.getPackageManager();

pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
        PackageManager.DONT_KILL_APP);
```
