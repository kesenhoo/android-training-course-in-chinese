# 根据网络连接类型来调整下载模式

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/connectivity_patterns.html>

所有的网络类型（Wi-Fi、3G、2G等）对电量的消耗并不是一样的。不仅是 Wi-Fi 电波比无线电波的耗电量要少很多，而且不同的无线电波（3G、2G、LTE……）使用的电量也不同。

## 使用 Wi-Fi

在大多数情况下，Wi-Fi 电波会在使用相对较低电量的情况下提供一个相对较大的带宽。因此，我们需要争取尽量使用 Wi-Fi 来传递数据。

我们可以使用 Broadcast Receiver 来监听网络连接状态的变化。当切换为 Wi-Fi 时，我们可以进行大量的数据传递操作，例如下载，执行定时的更新操作，甚至是在这个时候暂时加大更新频率。这些内容都可以在前面的课程中找到。

<!-- More -->

## 使用更大的带宽来更不频繁地下载更多数据

当通过无线电进行连接的时候，更大的带宽通常伴随着更多的电量消耗。这意味着 LTE（一种4G网络制式）会比 3G 制式更耗电，当然比起 2G 更甚。

从 Lesson 1 我们知道了无线电状态机是怎么回事，通常来说相对更宽的带宽网络制式会有更长的状态切换时间（也就是从 full power 过渡到 standby 有更长一段时间的延迟）。

同时，更高的带宽意味着可以更大量的进行预取，下载更多的数据。也许这个说法不是很直观，因为过渡的时间比较长，而过渡时间的长短我们无法控制，也就是过渡时间的电量消耗差不多是固定了。既然这样，我们在每次传输会话中为了减少更新的频率而把无线电激活的时间拉长，这样显的更有效率。也就是尽量一次性把事情做完，而不是断断续续的请求。

例如：如果 LTE 无线电的带宽与电量消耗都是 3G 无线电的2倍，我们应该在每次会话的时候都下载4倍于 3G 的数据量，或者是差不多 10Mb（前面文章有说明 3G 一般每次下载 2Mb）。当然，下载到这么多数据的时候，我们需要好好考虑预取本地存储的效率并且需要经常刷新预取的缓存。

我们可以使用 connectivity manager 来判断当前激活的无线电波，并且根据不同结果来修改预取操作。

```java
ConnectivityManager cm =
 (ConnectivityManager)getSystemService(Context.CONNECTIVITY_SERVICE);

TelephonyManager tm =
  (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);

NetworkInfo activeNetwork = cm.getActiveNetworkInfo();

int PrefetchCacheSize = DEFAULT_PREFETCH_CACHE;

switch (activeNetwork.getType()) {
  case (ConnectivityManager.TYPE_WIFI):
    PrefetchCacheSize = MAX_PREFETCH_CACHE; break;
  case (ConnectivityManager.TYPE_MOBILE): {
    switch (tm.getNetworkType()) {
      case (TelephonyManager.NETWORK_TYPE_LTE |
            TelephonyManager.NETWORK_TYPE_HSPAP):
        PrefetchCacheSize *= 4;
        break;
      case (TelephonyManager.NETWORK_TYPE_EDGE |
            TelephonyManager.NETWORK_TYPE_GPRS):
        PrefetchCacheSize /= 2;
        break;
      default: break;
    }
    break;
  }
  default: break;
}
```

**Ps：想要最大化效率与最小化电量的消耗，需要考虑的东西太多了，通常来说，会根据 app 的功能需求来选择有所侧重，那么前提就是需要了解到底哪些对效率的影响比较大,这有利于我们做出最优选择。**
