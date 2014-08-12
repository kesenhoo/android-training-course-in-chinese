# Determining and Monitoring the Connectivity Status[判断并监测网络连接状态]

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:

通常我们会有一些计划的任务，比如重复闹钟，后台定时启动的任务等。但是如果我们的网络没有连接上，那么就没有必要启动那些需要连接网络的任务。我们可以使用ConnectivityManager来检查是否连接上网络，是何种网络。[通过网络的连接状况改变，相应的改变app的行为，减少无谓的操作，从而延长设备的续航能力]

## 1)Determine if You Have an Internet Connection[判断当前是否有网络连接]
显然如果没有网络连接，那么就没有必要做那些需要联网的事情。下面是一个检查是否有网络连接的例子：

<!-- More -->

```java
ConnectivityManager cm =
        (ConnectivityManager)context.getSystemService(Context.CONNECTIVITY_SERVICE);

NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
boolean isConnected = activeNetwork.isConnectedOrConnecting();
```

## 2)Determine the Type of your Internet Connection[判断连接网络的类型]
设备通常可以有移动网络，WiMax,Wi-Fi与以太网连接等类型。通过查询当前活动的网络类型，可以根据网络的带宽做适合的事情。

```java
boolean isWiFi = activeNetwork.getType() == ConnectivityManager.TYPE_WIFI;
```

使用移动网络会比Wi-Fi花费代价更大，所以多数情况下，在移动网络情况下减少一些数据的获取操作，同样，一些像下载文件等操作需要等有Wi-Fi的情况下才开始。
如果已经关闭了更新操作，那么需要监听网络切换，当有比较好的网络时重新启动之前取消的操作。

## 3)Monitor for Changes in Connectivity[监测网络连接的切换]
当网络连接被改变的时候， ConnectivityManager会broadcast CONNECTIVITY_ACTION ("android.net.conn.CONNECTIVITY_CHANGE") 的动作消息。
我们需要在manifest文件里面注册一个带有像下面action一样的Receiver:

```xml
<action android:name="android.net.conn.CONNECTIVITY_CHANGE"/>
```

通常网络的改变会比较频繁，我们没有必要不间断的注册监听网络的改变。通常我们会在有Wi-Fi的时候进行下载动作，若是网络切换到移动网络则通常会暂停当前下载，监听到恢复到Wi-Fi的情况则开始恢复下载。
