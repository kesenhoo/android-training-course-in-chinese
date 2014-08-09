# Determining and Monitoring the Docking State and Type[判断并监测设备的停驻状态与类型]

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:

在上一课中有这样一句话：In many cases, the act of charging a device is coincident with putting it into a dock.

在很多情况下，为设备充电也是一种设备停驻方式

Android设备能够有好几种停驻状态。包括车载模式，家庭模式与数字对战模拟模式[这个有点奇怪]。停驻状态通常与充电状态是非常密切关联的。

停驻模式会如何影响更新频率这完全取决于app的设置。我们可以选择在桌面模式下频繁的更新数据也可以选择在车载模式下关闭更新操作。相反的，你也可以选择在车载模式下最大化更新交通数据频率。

<!-- More -->

停驻状态也是以sticky intent方式来广播的，这样可以通过查询intent里面的数据来判断是否目前处于停驻状态，处于哪种停驻状态。

## 1)Determine the Current Docking State[判断当前停驻状态]
因为停驻状态的广播内容也是sticky intent(`ACTION_DOCK_EVENT`)，所以不需要注册BroadcastReceiver。

```java
IntentFilter ifilter = new IntentFilter(Intent.ACTION_DOCK_EVENT);
Intent dockStatus = context.registerReceiver(null, ifilter);

int dockState = battery.getIntExtra(EXTRA_DOCK_STATE, -1);
boolean isDocked = dockState != Intent.EXTRA_DOCK_STATE_UNDOCKED;
```

## 2)Determine the Current Dock Type[判断当前停驻类型]
一共有下面4中停驻类型：

* Car
* Desk
* Low-End (Analog) Desk：API level 11开始才有
* High-End (Digital) Desk：API level 11开始才有

通常仅仅需要像下面一样检查当前停驻类型：

```java
boolean isCar = dockState == EXTRA_DOCK_STATE_CAR;
boolean isDesk = dockState == EXTRA_DOCK_STATE_DESK ||
                 dockState == EXTRA_DOCK_STATE_LE_DESK ||
                 dockState == EXTRA_DOCK_STATE_HE_DESK;
```

## 3)Monitor for Changes in the Dock State or Type[监测停驻状态或者类型的改变]
只需要像下面一样注册一个监听器：

```xml
<action android:name="android.intent.action.ACTION_DOCK_EVENT"/>
```

Receiver获取到信息后可以像上面那样检查需要的数据。
