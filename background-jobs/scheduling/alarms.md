# 调度重复的闹钟

> 编写:[lttowq](https://github.com/lttowq) - 原文:

闹钟([基本类AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html))给你一种方式执行基本时间操作你app生命周期外。例如你可以使用闹钟初始化一个长时间操作，例如开启一个服务一天为了下载天气预报。

闹钟的特性

* 它们让设置次数或间距点燃你意图
* 你可以使用它结合广播接收器开启服务和执行其他操作
* 它们执行在你的应用之外，所以你可以使用它触发事件或动作即使你的app没有运行或设备处于睡眠状态。
*	它们可以帮助你app最小化资源请求。你可以调度无需依赖的或者连续运行在后台的服务。

**Note:**对于定时操作保证结果在你app生命周期之内，替代可虑使用[Handler](https://developer.android.com/reference/android/os/Handler.html)类结合[定时器](https://developer.android.com/reference/java/util/Timer.html)与[线程](https://developer.android.com/reference/java/lang/Thread.html)。这个方法给你Android更好的控制系统资源。

##理解交替使用

一个重复闹钟是相对简单的机制和有限的灵活性。它或许不是最好的选择对于你的app，特别是如果你的app需要触发网络操作。一个坏的闹钟设计能造成电池漏电和让一个有意义的服务负载。

一个普通的情景对于触发一个你的app同步数据和一个服务器的生命周期外的操作。这个案例你可能冒险使用一个重复的闹钟。但是你自己服务器是本地你的app数据，使用[Google Cloud Messaging](https://developer.android.com/google/gcm/index.html)(GCM)在结合你的[sync adapter](https://developer.android.com/training/sync-adapters/index.html)是更好解决方案比[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)。一个同步适配器给你所有相同的调度选项作为[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)，但是它提供你更灵活性。比如：
一个同步可能基本在“新数据”消息从服务器或设备（细节见[Running a Sync Adapter](https://developer.android.com/training/sync-adapters/running-sync-adapter.html)）。用户活动或静止，一天的时间或更久。看下面两个链接对于什么时候怎样使用GCM和同步适配器细节的讨论。
1.[The App Clinic:Cricket](http://www.youtube.com/watch?v=yxW29JVXCqc)(需出墙)

2.[DevBytes:Efficient Data Transfers](https://www.youtube.com/playlist?list=PLWz5rJ2EKKc-VJS9WQlj9xM_ygPopZ-Qd)（需出墙）

###最好的练习
每个选择让你设计你的重复闹钟可以用序列在你的app使用或滥用系统资源。例如，想象一个流行的app和一个服务器同步。如果你同步操作在计时器的操作上，每一个app的实例同步在11：00P.M，服务器负载造成高延时或者甚至“服务器拒绝”。下面是使用闹钟的建议：

*  增加随意（颤动）对任何网络请求触发作为一个重复闹钟的结果;
	* 做本地任务当一个闹钟触发。“本地任务”意味任何事情不需要敲击服务器或请求一个数据从服务器
	* 在相同的时间，调度闹钟包含网络请求点燃相同定时周期
* 保持你的闹钟频率最小；
* 不是必要的情况不要唤醒设备(这个行为被闹钟决定，细节在[Choose an alarm type](https://developer.android.com/training/scheduling/alarms.html#type))；
* 不要使用你的闹钟触发时间比它精确；
使用[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))替代[setRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent)).当你使用[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))，Android同步重复闹钟从多个app和在相同的时间点燃它。这减少系统必须唤醒设备的数目，以此减少电源能耗。Android4.4（API Level19），所有的重复闹钟是不精确的。注意当[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))是一个改进[setRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent)),它能覆盖一个服务如果每个app的实例撞击服务器在相同的时间。因此对于网络请求，增加相同随意的闹钟、作为以上描述。
* 避免在你的闹钟基础上计时如果可能
重复的闹钟在预测触发器的没有扫描好的基础上。使用[ELAPSED_REALTIME](https://developer.android.com/reference/android/app/AlarmManager.html#ELAPSED_REALTIME)如果你能。不同的闹钟类型描述的细节在下面选项。

##设置重复闹钟
下面的描述，重制闹钟作为一个好的选择有规律调度时间或数据备份。一个重复闹钟好如下特性：
* 一个闹钟类型的讨论见[Choose an alarm type](https://developer.android.com/training/scheduling/alarms.html#type).
* 一个触发时间。如果触发时间你制定在过去，闹钟触发立即执行。
* 闹钟间距。例如，某一天、每个小时、每5秒等等。
* 一个行将发生的意图是当闹钟被触发。当你设置一秒闹钟使用相同悬而未决的意图，它能替换原始闹钟。

###选择一个闹钟的类型
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

###ELAPSED_REALTIME_WAKEUP例子
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
###RTC案例
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
###闹钟启动时间的设定
上面的描述，选择闹钟类型对于创建闹钟是第一步。第二不是设定闹钟启动的时间。对于大多数的app，[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))是正确的选择。当你使用这个方法，Android同步多个不精确的重复闹钟和启动它们在相同的时间。这减少电源的能耗。

对真实的app有严格的请求-例如，闹钟需要精确启动在8:30am和每隔一小时之后-使用[setRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent))，但是你应该避免使用精确地闹钟如果可能。

伴随[setInexactRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent))，你不能指定客户意图一种方式你能[setRepeating](https://developer.android.com/reference/android/app/AlarmManager.html#setRepeating(int, long, long, android.app.PendingIntent))。你使用间距常量，例如[INTERVAL_FIFTEEN_MINUTES,INTERVAL_DAY](https://developer.android.com/reference/android/app/AlarmManager.html#INTERVAL_FIFTEEN_MINUTES) 等等。见[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager.html)里面的完整的列表。

###取消闹钟
依赖你app，你可能想报考一些取消闹钟的能力。取消闹钟回调[cancle](https://developer.android.com/reference/android/app/AlarmManager.html#cancel(android.app.PendingIntent))在你闹钟管理器，通过[PendingIntent](https://developer.android.com/reference/android/app/PendingIntent.html)你不在启动，例如：
```java
// If the alarm has been set, cancel it.
if (alarmMgr!= null) {
    alarmMgr.cancel(alarmIntent);
}
````
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

[下一课：最佳性能实践]()
=======
>>>>>>> upstream/gh-pages
