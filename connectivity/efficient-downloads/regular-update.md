# Minimizing the Effect of Regular Updates(最小化定期更新操作的副作用)

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/regular-update.html>

最佳的定时更新频率是不确定的，通常由设备状态，网络连接状态，用户行为与用户定义明确的偏好而决定。

[Optimizing Battery Life](http://developer.android.com/training/monitoring-device-state/index.html)这一章有讨论如何根据设备状态来修改更新频率。里面介绍了当断开网络连接的时候去关闭后台服务，在电量比较低的时候减少更新的频率。

这一课会介绍更新频率是多少才会使得更新操作对无线电状态机的影响最小。(C2DM与指数退避算法的使用)

## Use Google Cloud Messaging as an Alternative to Polling[使用C2DM作为轮询方式之一]
关于`Android Cloud to Device Messaging` (C2DM)详情 ,请参考:[http://code.google.com/intl/zh-CN/android/c2dm/](http://code.google.com/intl/zh-CN/android/c2dm/)

<!-- More -->

每次app去向server询问检查是否有更新操作的时候会激活无线电，这样造成了不必要的能量消耗(在3G情况下，会差不多消耗20秒的能量)。

C2DM是一个用来从server到特定app传输数据的轻量级的机制。使用C2DM,server会在某个app有需要获取新数据的时候通知app有这个消息。

比起轮询方式(app为了即时拿到最新的数据需要定时向server请求数据)，C2DM这种有事件驱动的模式会在仅仅有数据更新的时候通知app去创建网络连接来获取数据(很显然这样减少了app的大量操作，当然也减少了很多电量)。

C2DM需要通过使用固定TCP/IP来实现操作。当在你的设备上可以实现固定IP的时候，最好使用C2DM。(这个地方应该不是传统意义上的固定IP，可以理解为某个会话情况下)
。很明显，使用C2DM既减少了网络连接次数，也优化了带宽，还减少了对电量的消耗。

**Ps:大陆的Google框架通常被移除掉，这导致C2DM实际上根本没有办法在大陆的App上使用**

## Optimize Polling with Inexact Repeating Alarms and Exponential Backoffs(通过不定时的重复提醒与指数退避来优化轮询操作)
如果需要使用轮询机制，在不影响用户体验的前提下，当然设置默认更新频率是越低越好(减少电量的浪费)。

一个简单的方法是给用户提供更新频率的选择，允许用户自己来处理如何平衡数据及时性与电量的消耗。

当设置安排好更新操作后，可以使用不确定重复提醒的方式来允许系统把当前这个操作进行定向移动(比如推迟一会)。

```java
int alarmType = AlarmManager.ELAPSED_REALTIME;
long interval = AlarmManager.INTERVAL_HOUR;
long start = System.currentTimeMillis() + interval;

alarmManager.setInexactRepeating(alarmType, start, interval, pi);
```

若是多个提醒都安排在某个点同时被触发，那么这样就可以使得多个操作在同一个无线电状态下操作完。

如果可以，请设置提醒的类型为`ELAPSED_REALTIME` or `RTC`而不是`_WAKEUP`。这样能够更进一步的减少电量的消耗。

我们还可以通过根据app被使用的频率来有选择性的减少更新的频率。

另一个方法在app在上一次更新操作之后还未被使用的情况下，使用指数退避算法`exponential back-off algorithm`来减少更新频率。当然我们也可以使用一些类似指数退避的方法。

```java
SharedPreferences sp =
  context.getSharedPreferences(PREFS, Context.MODE_WORLD_READABLE);

boolean appUsed = sp.getBoolean(PREFS_APPUSED, false);
long updateInterval = sp.getLong(PREFS_INTERVAL, DEFAULT_REFRESH_INTERVAL);

if (!appUsed)
  if ((updateInterval *= 2) > MAX_REFRESH_INTERVAL)
    updateInterval = MAX_REFRESH_INTERVAL;

Editor spEdit = sp.edit();
spEdit.putBoolean(PREFS_APPUSED, false);
spEdit.putLong(PREFS_INTERVAL, updateInterval);
spEdit.apply();

rescheduleUpdates(updateInterval);
executeUpdateOrPrefetch();
```

初始化一个网络连接的花费不会因为是否成功下载了数据而改变。我们可以使用指数退避算法来减少重复尝试(retry)的次数，这样能够避免浪费电量。例如：

```java
private void retryIn(long interval) {
  boolean success = attemptTransfer();

  if (!success) {
    retryIn(interval*2 < MAX_RETRY_INTERVAL ?
            interval*2 : MAX_RETRY_INTERVAL);
  }
}
```

***

**笔者结语:这一课讲到C2DM与指数退避算法等，其实这些细节很值得我们注意，如果能在实际项目中加以应用，很明显程序的质量上升了一个档次！**
