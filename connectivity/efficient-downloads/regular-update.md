# 最小化定期更新造成的影响

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/regular_updates.html>

最佳的定期更新频率是不确定的，通常由设备状态，网络连接状态，用户行为与用户显式定义的偏好而决定。

[Optimizing Battery Life](http://developer.android.com/training/monitoring-device-state/index.html)这一章有讨论如何根据主设备状态来修改更新频率，从而达到编写一个低电量消耗的程序。可执行的操作包括当断开网络连接的时候去关闭后台服务，在电量比较低的时候减少更新的频率等。

这一课会介绍更新频率是多少才会使得更新操作对无线电状态机的影响最小。(C2DM与指数退避算法的使用)

## 使用 Google Cloud Messaging 来轮询

<!-- More -->

每次 app 去向 server 询问检查是否有更新操作的时候，都会激活无线电，这样造成了不必要的能量消耗（在3G情况下，会差不多消耗20秒的能量）。

[Google Cloud Messaging for Android (GCM)](http://developer.android.com/google/gcm/index.html) 是一个用来从 server 到特定 app 传输数据的轻量级的机制。使用 GCM，server 会在某个 app 需要获取新数据的时候通知 app 有这个消息。

比起轮询方式（app 为了即时拿到最新的数据需要定时去ping server），GCM 这种由事件驱动的模式会在仅仅有数据更新的时候通知 app 去创建网络连接来获取数据（很显然这样减少了 app 的大量操作，当然也减少了很多电量消耗）。

GCM 需要通过使用持续的 TCP/IP 连接来实现操作。当我们可以实现自己的推送服务，最好使用 GCM（这个地方应该不是传统意义上的固定IP，可以理解为某个会话情况下）
。很明显，使用 GCM 既减少了网络连接次数，也优化了带宽，还减少了对电量的消耗。

**PS：大陆的 Google 框架通常被移除掉，这导致 GCM 实际上根本没有办法在大陆的 App 上使用。**

## 使用不严格的重复通知和指数避退算法来优化轮询

如果需要使用轮询机制，在不影响用户体验的前提下，设置默认的更新频率当然是越低越好（减少耗电量）。

一个简单的方法是给用户显式修改更新频率的选项，允许用户自己来处理如何平衡数据及时性与电量的消耗。

当设置安排好更新操作后，可以使用不确定重复提醒的方式来允许系统把当前这个操作进行定向移动（比如推迟一会）。

```java
int alarmType = AlarmManager.ELAPSED_REALTIME;
long interval = AlarmManager.INTERVAL_HOUR;
long start = System.currentTimeMillis() + interval;

alarmManager.setInexactRepeating(alarmType, start, interval, pi);
```

如果几个提醒都安排在某个点同时被触发，那么就可以使得多个操作在同一个无线电状态下操作完。

如果可以，请设置提醒的类型为 `ELAPSED_REALTIME` 或者 `RTC` 而不是 `_WAKEUP`。通过一直等待知道手机在提醒通知触发之前不再处于 standby 模式，进一步地减少电量的消耗。

我们还可以通过根据最近 app 被使用的频率来有选择性地减少更新的频率，从而降低这些定期通知的影响。

另一个方法是在 app 在上一次更新操作之后还未被使用的情况下，使用指数退避算法 `exponential back-off algorithm` 来减少更新频率。断言一个最小的更新频率和任何时候使用 app 都去重置频率通常都是有用的方法。例如：

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

初始化一个网络连接的花费不会因为是否成功下载了数据而改变。对于那些成功完成是很重要的时间敏感的传输，我们可以使用指数退避算法来减少重复尝试的次数，这样能够避免浪费电量。例如：

```java
private void retryIn(long interval) {
  boolean success = attemptTransfer();

  if (!success) {
    retryIn(interval*2 < MAX_RETRY_INTERVAL ?
            interval*2 : MAX_RETRY_INTERVAL);
  }
}
```

另外，对于可以容忍失败连接的传输（例如定期更新），我们可以简单地忽略失败的连接和传输尝试。

***

**笔者结语:这一课讲到GCM与指数退避算法等，其实这些细节很值得我们注意，如果能在实际项目中加以应用，很明显程序的质量上升了一个档次！**
