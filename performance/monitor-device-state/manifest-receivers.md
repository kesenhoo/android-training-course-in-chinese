# 按需操控BroadcastReceiver

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/monitoring-device-state/manifest-receivers.html>

监测设备状态变化最简单的方法，是为你所要监听的每一个状态创建一个[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)，并在Manifest文件中注册它们。之后就可以在每一个BroadcastReceiver中，根据当前设备的状态调整一些计划任务。

上述方法的副作用是：一旦你的接收器收到了广播，应用就会唤醒设备。唤醒的频率可能会远高于需要的频率

更好的方法是在程序运行时开启或者关闭BroadcastReceiver。这样的话，你就可以让这些接收器仅在需要的时候被激活。

## 切换是否开启接收器以提高效率

我们可以使用[PackageManager](http://developer.android.com/reference/android/content/pm/PackageManager.html)来切换任何一个在Mainfest里面定义好的组件的开启状态。通过下面的方法可以开启或者关闭任何一个BroadcastReceiver：

```java
ComponentName receiver = new ComponentName(context, myReceiver.class);

PackageManager pm = context.getPackageManager();

pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP)
```

使用这种技术，如果我们确定网络连接已经断开，那么可以在这个时候关闭除了监听网络状态变化的接收器之外的其它所有接收器。

相反的，一旦重新建立网络连接，我们可以停止监听网络连接的改变，而仅仅在执行需要联网的操作之前判断当前网络是否可以用。

同样地，你可以使用上面的技术来暂缓一个需要更高带宽的下载任务。这仅需要启用一个监听网络连接变化的BroadcastReceiver，并在连接到Wi-Fi时，初始化下载任务。
