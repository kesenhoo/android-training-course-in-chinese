# 判断并监测网络连接状态

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/monitoring-device-state/connectivity-monitoring.html>

重复闹钟和后台服务最常见的功能之一，是用来从网络上获取应用更新，存储数据或者执行大文件的下载。但是如果没有获得网络连接，或者连接的速度太慢以至于下载无法完成，那么就没有必要唤醒设备并执行那些更新等操作了。

我们可以使用[ConnectivityManager](http://developer.android.com/reference/android/net/ConnectivityManager.html)来检查设备是否连接到网络，以及网络的类型（译注：通过网络的连接状况改变，相应的改变app的行为，减少无谓的操作，从而延长设备的续航能力）。

## 判断当前是否有网络连接
如果没有网络连接，那么就没有必要做那些需要联网的事情。下面的代码片段展示了如何通过[ConnectivityManager](http://developer.android.com/reference/android/net/ConnectivityManager.html)检查当前活动的网络类型，并确定它是否可以连接到互联网：

```java
ConnectivityManager cm =
        (ConnectivityManager)context.getSystemService(Context.CONNECTIVITY_SERVICE);
 
NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
boolean isConnected = activeNetwork != null &&
                      activeNetwork.isConnectedOrConnecting();
```

## 判断连接网络的类型

我们还可以获取到当前的网络连接类型。

设备通常可以有移动网络，WiMax，Wi-Fi与以太网连接等类型。通过查询当前活动的网络类型，可以根据网络的带宽对更新频率进行调整：

```java
boolean isWiFi = activeNetwork.getType() == ConnectivityManager.TYPE_WIFI;
```

移动网络的使用费会比Wi-Fi更高，所以多数情况下，如果设备正在使用移动网络，我们应该减少应用的更新频率；同样地，还应该临时地挂起一些文件下载任务直到有Wi-Fi连接时再继续下载。

如果已经关闭了更新操作，那么需要监听网络连接的变化，这样就可以在建立了互联网访问之后，重新恢复它们。

## 监听网络连接的变化

当网络连接发生改变时，[ConnectivityManager](http://developer.android.com/reference/android/net/ConnectivityManager.html)会广播[CONNECTIVITY_ACTION](http://developer.android.com/reference/android/net/ConnectivityManager.html#CONNECTIVITY_ACTION)（`android.net.conn.CONNECTIVITY_CHANGE`）的Action消息。
我们可以在Manifest文件里面注册一个BroadcastReceiver，来监听这些变化，并适当地恢复（或挂起）你的后台更新:

```xml
<action android:name="android.net.conn.CONNECTIVITY_CHANGE"/>
```

设备的网络变化可能会比较频繁，因此每当你在移动网络与Wi-Fi之间切换的时候，这一广播就会被触发。因此，我们可以仅在之前的更新或者下载任务被挂起的时候去监听这一广播（用来恢复那些任务）。通常我们可以在开始更新前检查一下网络连接，如果当前没有连接到互联网，那么就将更新任务挂起，直到连接恢复。

上述方法会涉及到Broadcast Receiver开启状态的切换，这一内容会在下一节课中展开。
