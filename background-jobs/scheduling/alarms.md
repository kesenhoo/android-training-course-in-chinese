# 调度重复的闹钟

> 编写:[jdneo](https://github.com/jdneo),[lttowq](https://github.com/lttowq) - 原文:<http://developer.android.com/training/scheduling/alarms.html>

### 教学视频（需翻墙）：
* [The App Clinic:Cricket](http://www.youtube.com/watch?v=yxW29JVXCqc)
* [DevBytes:Efficient Data Transfers](https://www.youtube.com/playlist?list=PLWz5rJ2EKKc-VJS9WQlj9xM_ygPopZ-Qd)

闹钟（基于[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)类）给予你一种在应用生命周期之外执行与时间相关的操作的方法。你可以使用闹钟初始化一个长时间的操作，例如每天开启一次后台服务，下载当日的天气预报。

闹钟具有如下特性：

* 允许你通过预设时间或者设定某个时间间隔，来触发Intent；
* 你可以将它与BroadcastReceiver相结合，来启动服务并执行其他操作；
* 可在应用范围之外执行，所以你可以在你的应用没有运行或设备处于睡眠状态的情况下，使用它来触发事件或行为；
* 帮助你的应用最小化资源需求，你可以不用计时器或者长时间运行后台服务，而是使用闹钟调度你的任务。

> **Note**：对于那些需要确保在应用生命周期之内发生的定时操作，可以使用闹钟替代使用[Handler](https://developer.android.com/reference/android/os/Handler.html)结合[Timer](https://developer.android.com/reference/java/util/Timer.html)与[Thread](https://developer.android.com/reference/java/lang/Thread.html)的方法。因为它可以让Android系统更好地统筹系统资源。

## 权衡利弊

重复闹钟的机制比较简单，没有太多的灵活性。它对于你的应用来说或许不是一种最好的选择，特别是当你想要触发网络操作的时候。设计不佳的闹钟会导致电量快速耗尽，而且会对服务端产生巨大的负荷。

当我们从服务端同步数据时，往往需要在应用不被使用时触发某些操作。此时你可能希望使用重复闹钟。但是如果存储数据的服务端是由你控制的，使用[Google Cloud Messaging](https://developer.android.com/google/gcm/index.html)（GCM）结合[sync adapter](https://developer.android.com/training/sync-adapters/index.html)是一种更好解决方案。SyncAdapter提供的任务调度选项和[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)基本相同，但是它能提供更多的灵活性。比如：同步的触发可能基于一条“新数据”提示消息，而消息的产生可以基于服务器或设备（祥见[执行Sync Adpater](../../../connectivity/sync-adapters/running-sync-adapter.html)），用户的操作（或者没有操作），每天的某一时刻等等。你可以观看本节课作开始提供的两端视频了解一下有关如何以及何时使用GCM和SyncAdapter的讨论。

### 最佳实践方法
在设计重复闹钟过程中，你所做出的每一个决定都有可能影响到你的应用将会如何使用系统资源。例如，我们假象一个会从服务器同步数据的应用。同步操作基于的是时钟时间，具体来说，每一个应用的实例会在11:00p.m.时刻进行同步，巨大的服务器负荷会导致服务器响应时间变长，甚至拒绝服务。因此在我们使用闹钟时，请牢记下面的最佳实践建议：

*  对任何由重复闹钟触发的网络请求添加一定的随机性（抖动）：
	* 在闹钟触发时做一些本地任务。“本地任务”意味指的是任何不需要访问服务器或者从服务器获取数据的任务；
	* 同时对于那些包含有网络请求的闹钟，在调度时机上增加一些随机性。
* 尽量让你的闹钟频率最小；
* 如果不是必要的情况，不要唤醒设备（这一点与闹钟的类型有关，本节课后续章节中会提到）；
* 触发闹钟的时间不必过度精确；
尽量使用<a href="https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent)">setInexactRepeating()</a>方法替代<a href="https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent)">setRepeating()</a>方法。当你使用<a href="https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent)">setInexactRepeating()</a>方法时，Android系统会集中多个应用的重复闹钟同步请求，并一起触发它们。这将减少系统将设备唤醒的总次数，以此减少电量消耗。从Android 4.4（API Level19）开始，所有的重复闹钟都将是非精确型的。注意虽然<a href="https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent)">setInexactRepeating()</a>是<a href="https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent)">setRepeating()</a>的改进版本，它依然可能会导致每一个应用的实例在某一时间段内同时访问服务器，造成服务器负荷过重。因此对于网络请求，我们需要为闹钟的触发时机增加随机性，如上所述。
* 尽量避免让闹钟基于时钟时间。
想要在某一个精确时刻触发重复闹钟是比较困难的。我们应该尽可能使用[ELAPSED_REALTIME](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME)。不同的闹钟类型会在本节课后半部分展开。

## 设置重复闹钟
下面的描述，重制闹钟作为一个好的选择有规律调度时间或数据备份。一个重复闹钟好如下特性：
* 一个闹钟类型的讨论见[Choose an alarm type](https://developer.android.com/training/scheduling/alarms.html#type).
* 一个触发时间。如果触发时间你制定在过去，闹钟触发立即执行。
* 闹钟间距。例如，某一天、每个小时、每5秒等等。
* 一个行将发生的意图是当闹钟被触发。当你设置一秒闹钟使用相同悬而未决的意图，它能替换原始闹钟。

### 选择一个闹钟的类型
其中第一个考虑是使用什么类型重置闹钟。
这里有两个通用的计时器闹钟：“elapsed real time”和“real time clock”。elapsed real time使用“计时自从系统引导”作为引用，和real time clock使用UTC计时。这意味着elapsed real time适合设置一个闹钟在一段时间基础上(例如：一个闹钟点燃每30秒)且它不受地区和时区的影响。real time clock类型更好适配闹钟依赖当前时区。
两个类型有“唤醒”版本，都能唤醒设备的CPU如果屏幕关闭。这确保闹钟将启动在调度时间、这是有用的如果你的ap有一个时间依赖。例如，如果它有一个限制窗口将启动当你的设备在下个唤醒。
如果你简单的需要那种启动特殊意图（例如：每半小时），使用其中elapsed real time类型。一般，这是更好的选择。
如果你需要闹钟启动在一天中特殊的时间，然后选择某个计real time clock类型。注意,但是这个方法有些缺点——app或许不会翻译好对于其他地区，如果用户改变设备时间设置，它可能造成意外行为在你app。使用一个真实时间计时的闹钟类型也不会扫描好，综上，我们建议你使用elapsed real time。

这里列出类型：
* [ELAPSED_REALTIME](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME)-点燃悬而未决意图在计时基础上从设备被引导，但是不需要唤醒设备。The elapsed 时间包括一些次数在设备处于睡眠期间。
* [ELAPSED_REALTIME_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME_WAKEUP)唤醒设备并且启动悬而未决意图后指定过去的时间长度自从设备启动。
* [RTC](https://developer.android.com/reference/android/app/AlarmManager.html#RTC)点燃悬而未决的意图在指定时间但是没有唤醒设备。
* [RTC_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#RTC_WAKEUP)唤醒设备在悬而未决意图在指定时间。

### ELAPSED_REALTIME_WAKEUP例子
这里有一些相同案例使用[ELAPSED_REALTIME_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME_WAKEUP)

唤醒设备启动闹钟在30分钟内和每30分钟后：

```java
// Hopefully your alarm will have a lower frequency than this!
alarmMgr.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
        AlarmManager.INTERVAL_HALF_HOUR,
        AlarmManager.INTERVAL_HALF_HOUR, alarmIntent);
```

唤醒设备在启动一次（无重复）闹钟在每分钟内：

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
这里有相同案例使用[RTC_WAKEUP](https://developer.android.com/reference/android/app/AlarmManager.html#RTC_WAKEUP)

唤醒设备启动闹钟在约定时间2:00PM，一天内重复一次:

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

唤醒设备启动闹钟在8:30am,每20分钟后在启动:

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
calendar.set(Calendar.MINUTE, 30)
// setRepeating() lets you specify a precise custom interval--in this case,
// 20 minutes.
alarmMgr.setRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(),
        1000 * 60 * 20, alarmIntent);
```

### 闹钟启动时间的设定

上面的描述，选择闹钟类型对于创建闹钟是第一步。第二不是设定闹钟启动的时间。对于大多数的app，[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))是正确的选择。当你使用这个方法，Android同步多个不精确的重复闹钟和启动它们在相同的时间。这减少电源的能耗。

对真实的app有严格的请求-例如，闹钟需要精确启动在8:30am和每隔一小时之后-使用[setRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent))，但是你应该避免使用精确地闹钟如果可能。

伴随[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))，你不能指定客户意图一种方式你能[setRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent))。你使用间距常量，例如[INTERVAL_FIFTEEN_MINUTES,INTERVAL_DAY](https://developer.android.com/reference/android/app/AlarmManager.html#INTERVAL_FIFTEEN_MINUTES) 等等。见[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)里面的完整的列表。

### 取消闹钟

依赖你app，你可能想报考一些取消闹钟的能力。取消闹钟回调[cancle](https://developer.android.com/reference/android/app/AlarmManager.html#cancel(android.app.PendingIntent))在你闹钟管理器，通过[PendingIntent](https://developer.android.com/reference/android/app/PendingIntent.html)你不在启动，例如：

```java
// If the alarm has been set, cancel it.
if (alarmMgr!= null) {
    alarmMgr.cancel(alarmIntent);
}
```

###启动闹钟当你设备启动时
默认的设置是所有的的闹钟被取消当一个设备关闭时。为了阻止发生，你可以你的app自动重启一个重复闹钟如果用户重启设备。这确保在[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)将继续不需要用户手动启动闹钟。

这里的步骤：

1. 设置[RECEIVE_BOOT_CMPLETED](https://developer.android.com/reference/android/Manifest.permission.html#RECEIVE_BOOT_COMPLETED)权限在你app主菜单（manifest）允许你的app接受[ACTION_BOOT)COMPLETED](https://developer.android.com/reference/android/content/Intent.html#ACTION_BOOT_COMPLETED)在广播后系统完成启动（如果你app已经运行通过用户至少一次才有效）

```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

2. 实现一个[BoradcastReceiver](https://developer.android.com/reference/android/content/BroadcastReceiver.html)接收广播；

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

3. 增加接收器在你app的mainfest文件里面与一个意图过滤，过滤器在[ACTION_BOOT_COMPLETED](https://developer.android.com/reference/android/content/Intent.html#ACTION_BOOT_COMPLETED):

```xml
<receiver android:name=".SampleBootReceiver"
        android:enabled="false">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED"></action>
    </intent-filter>
</receiver>
```

注意在mainfiest文件里，引导接收器设置android:enabled="false"。这意味着接收器将不会回调除非app程序显式地启用它。这是阻止不必要引导接收器的回调。你能启动一个接收器（例如：如果用户设置如下一个闹钟）如下：

```java
ComponentName receiver = new ComponentName(context, SampleBootReceiver.class);
PackageManager pm = context.getPackageManager();
pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP);
```

一旦你启动接器，它将保持启动，即使用户重启设备。总之,编程式启动接收器重写manifest里的设置，几多次重启。接收器将保持启动直到你的app不在使用它。你可以禁用一个接收器（例如：如果用户取消一个闹钟）如下：

```java
ComponentName receiver = new ComponentName(context, SampleBootReceiver.class);
PackageManager pm = context.getPackageManager();
pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
        PackageManager.DONT_KILL_APP);
```
