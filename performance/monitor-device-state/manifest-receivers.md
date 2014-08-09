# Manipulating Broadcast Receivers On Demand[按需操控广播接收者]

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:

简单的方法是为我们监测的状态创建一个BroadcastReceiver，并在manifest中为每一个状态进行注册监听。然后，每一个Receiver根据当前设备的状态来简单重新安排下一步执行的任务。[这句话感觉理解有点问题]

上面那个方法的副作用是，设备会在每次收到广播都被唤醒，这有点超出期望，因为有些广播是不希望唤醒设备的。

更好的方法是根据程序运行情况开启或者关闭广播接收者。这样的话，那些在manifest中注册的receivers仅仅会在需要的时候才被激活。

<!-- More -->

## 1)Toggle and Cascade State Change Receivers to Improve Efficiency[切换是否开启这些状态Receivers来提高效率]
我们可以使用PackageManager来切换任何一个在mainfest里面定义好的组件的开启状态。
可以使用下面的方法来开启或者关闭任何一个broadcast receiver:

```java
ComponentName receiver = new ComponentName(context, myReceiver.class);

PackageManager pm = context.getPackageManager();

pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP)
```

使用这种技术，如果我们判断到网络链接已经断开，那么可以在这个时候关闭除了connectivity-change的之外的所有Receivers。

相反的，一旦重新建立网络连接，我们可以停止监听网络链接的改变。而仅仅在执行需要联网的操作之前判断当前网络是否可以用即可。

你可以使用上面同样的技术来暂缓一个需要带宽的下载操作。可以开启receiver来监听是否连接上Wi-Fi来重新开启下载的操作。
