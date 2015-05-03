# 判断并监测设备的底座状态与类型

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/monitoring-device-state/connectivity-monitoring.html>

Android设备可以放置在许多不同的底座中，包括车载底座，家庭底座还有数字信号底座以及模拟信号底座等。由于许多底座会向设备充电，因此底座状态通常与充电状态密切相关。

你的应用类型决定了底座类型会对更新频率产生怎样的影响。对于一个体育类应用，可以让设备在笔记本底座状态下增加更新的频率，或者当设备在车载底座状态下停止更新。相反的，如果你的后台服务用来更新交通数据，你也可以选择在车载底座模式下最大化更新的频率。

底座状态也是以Sticky Intent方式来广播的，这样可以通过查询Intent里面的数据来判断目前设备是否放置在底座中，以及底座的类型。

## 判断当前底座状态

底座状态的具体信息会以Extra数据的形式，包含在具有[ACTION_DOCK_EVENT](http://developer.android.com/reference/android/content/Intent.html#ACTION_DOCK_EVENT)这一Action的某个Sticky广播中 ，因此，你不需要为其注册一个[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)。如下所示，仅需要将`null`作为参数传递给<a href="http://developer.android.com/reference/android/content/Context.html#registerReceiver(android.content.BroadcastReceiver, android.content.IntentFilter)">registerReceiver()</a>方法就可以了：

```java
IntentFilter ifilter = new IntentFilter(Intent.ACTION_DOCK_EVENT);
Intent dockStatus = context.registerReceiver(null, ifilter);
```

你可以从`EXTRA_DOCK_STATE`这一Extra数据中，提取出当前的底座状态：

```java
int dockState = battery.getIntExtra(EXTRA_DOCK_STATE, -1);
boolean isDocked = dockState != Intent.EXTRA_DOCK_STATE_UNDOCKED;
```

## 判断当前底座类型

如果设备被放置在了底座中，那么它可以有下面四种底座类型：

* Car
* Desk
* Low-End (Analog) Desk
* High-End (Digital) Desk

注意最后两种底座类型仅在API Level 11及以后版本的Android系统中才被支持。如果你只在乎底座的类型而不管它是数字的还是模拟的，那么可以仅监测三种类型：

```java
boolean isCar = dockState == EXTRA_DOCK_STATE_CAR;
boolean isDesk = dockState == EXTRA_DOCK_STATE_DESK ||
                 dockState == EXTRA_DOCK_STATE_LE_DESK ||
                 dockState == EXTRA_DOCK_STATE_HE_DESK;
```

## 监测底座状态或者类型的改变

当设备被放置在或者拔出底座时，系统会发出一个具有[ACTION_DOCK_EVENT](http://developer.android.com/reference/android/content/Intent.html#ACTION_DOCK_EVENT)这一Action的广播。为了监听底座状态的变化，我们只需要在应用的Manifest文件中注册一个BroadcastReceiver，如下所示：

```xml
<action android:name="android.intent.action.ACTION_DOCK_EVENT"/>
```

之于该BroadcastReceiver的具体实现，可以参考前面提到的那些方法，以此来提取出当前的底座类型和状态。
