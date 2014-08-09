# 根据网络类型改变下载模式Modifying your Download Patterns Based on the Connectivity Type

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/connectivity-patterns.html>

并不是所有的网络类型(Wi-Fi,3G,2G,etc)对电量的消耗是同等的。不仅仅Wi-Fi电波比无线电波消耗的电量要少很多，而且不同的无线电波(3G,2G,LTE……)也存在使用不同电量的区别。

## 1)Use Wi-Fi[使用Wi-Fi]
在大多数情况下，Wi-Fi电波会在使用相对较低的电量的情况下提供一个相对较大的带宽。因此，我们需要努力争取尽量使用Wi-Fi来传递数据。
我们可以使用Broadcast Receiver来监听当网络连接切换为Wi-Fi，这个时候我们可以进行大量的数据传递操作，例如下载，执行定时的更新操作，甚至是在这个时候加大更新的频率。这些内容都可以在前面的课程中找到。

<!-- More -->

## 2)Use Greater Bandwidth to Download More Data Less Often[使用更大的带宽来下载更多的数据，而不是经常去下载]
当通过无线电进行连接的时候，更大的带宽通常伴随着更多的电量消耗。这意味着LTE(一种4G网络制式)会比3G制式消耗更多，当然比起2G更甚。

从Lesson 1我们知道了无线电状态机是怎么回事，通常来说相对更宽的带宽网络制式会有更长的状态切换时间(也就是从full power过渡到standby有更长一段时间的延迟)。同时，更高的带宽意味着可以更贪婪的进行prefetch，下载更多的数据。也许这个说法不是很直观，因为过渡的时间比较长，而过渡时间的长短我们无法控制，也就是过渡时间的电量消耗差不多是固定了，既然这样，我们在每次传输会话中为了减少更新的频率而把无线电激活的时间拉长，这样显的更有效率。也就是尽量一次性把事情做完，而不是断断续续的请求。

例如：如果LTE无线电的带宽与电量消耗都是3G无线电的2倍，我们应该在每次会话的时候都下载4倍于3G的数据量，或者是差不多10Mb(前面文章有说明3G一般每次下载2Mb)。当然，下载到这么多数据的时候，我们需要好好考虑prefetch本地存储的效率并且需要经常刷新预取的cache。我们可以使用connectivity manager来判断当前激活的无线电波，并且根据不同结果来修改prefetch操作。

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

**Ps：想要最大化效率与最小化电量的消耗，需要考虑的东西太多了，通常来说，会根据app的功能需求来选择有所侧重，那么前提就是需要了解到底哪些对效率的影响比较大,这有利于我们做出最优选择。**
