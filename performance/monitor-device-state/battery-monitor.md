# Monitoring the Battery Level and Charging State[监测电池的电量与充电状态]

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:


当你想通过改变后台更新操作的频率来减少对电池寿命的影响，那么先手需要检查当前电量与充电状态。

电池的电量与是否在充电状态会影响到一个程序去执行更新的操作。当设备在进行AC充电时，程序做任何操作都不太会受到电量的影响，所以在大多数时候，我们可以在设备充电时做很多想做的事情（刷新数据，下载文件等），相反的，如果设备没有在充电状态，那么我们就需要尽量减少设备的更新操作等来延长电池的续航能力。

同样的，我们可以通过检查电池目前的电量来减少甚至停止一些更新操作。

<!-- More -->

## 1)Determine the Current Charging State[判断当前充电状态]

[BatteryManager](http://developer.android.com/reference/android/os/BatteryManager.html)会广播一个带有电池与充电详情的[Sticky Intent](http://developer.android.com/guide/topics/fundamentals/services.html)
因为广播的是一个sticky intent，那么不需要注册BroadcastReceiver。仅仅只需要简单的call一个参null参数的regiserReceiver()方法。

```java
IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
Intent batteryStatus = context.registerReceiver(null, ifilter);
```

我们可以从intent里面提取出当前的充电状态与是否通过USB或者AC充电器来充电。

```java
// Are we charging / charged?
int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                     status == BatteryManager.BATTERY_STATUS_FULL;

// How are we charging?
int chargePlug = battery.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1);
boolean usbCharge = chargePlug == BATTERY_PLUGGED_USB;
boolean acCharge = chargePlug == BATTERY_PLUGGED_AC;
```

我们可以从intent里面提取出当前的充电状态与是否通过USB或者AC充电器来充电。通常的做法是在使用AC充电时最大化后台更新操作，在使用USB充电时降低更新操作，不在充电状态时，最小化更新操作。

## 2)Monitor Changes in Charging State[监测充电状态的改变]
充电状态随时可能改变，显然，需要通过检查充电状态的改变来通知App改变某些行为。

BatteryManager会在设备连接或者断开充电器的时候广播一个action。接收到这个广播是很重要的，即使我们的app没有在运行。特别是在是否接收这个广播会对app决定后台更新频率产生影响的前提下。因此很有必要在manifest文件里面注册一个监听来接收`ACTION_POWER_CONNECTED` 与 `ACTION_POWER_DISCONNECTED`的intent。

```xml
<receiver android:name=".PowerConnectionReceiver">
  <intent-filter>
    <action android:name="android.intent.action.ACTION_POWER_CONNECTED"/>
    <action android:name="android.intent.action.ACTION_POWER_DISCONNECTED"/>
  </intent-filter>
</receiver>
```

```java
public class PowerConnectionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        int status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
        boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                            status == BatteryManager.BATTERY_STATUS_FULL;

        int chargePlug = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1);
        boolean usbCharge = chargePlug == BATTERY_PLUGGED_USB;
        boolean acCharge = chargePlug == BATTERY_PLUGGED_AC;
    }
}
```

## 3)Determine the Current Battery Level[判断当前电池电量]
在一些情况下，获取到当前电池电量也是很有帮助的。我们可以在获知电量少于某个级别的时候减少某些后台操作。
我们可以从获取到电池状态的intent中提取出电池电量与容量等信息。

```java
int level = battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
int scale = battery.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
float batteryPct = level / (float)scale;
```

## 4)Monitor Significant Changes in Battery Level[检测电量的有效改变]
虽然我们可以轻易的不间断的检测电池状态，但是这并不是必须的。通常来说，我们只需要检测电量的某些有效改变，特别是设备在进入或者离开低电量状态的时候。下面的例子，电量监听器只会在设备电量进入低电量或者离开低电量的时候才会触发，仅仅需要监听`ACTION_BATTERY_LOW`与`ACTION_BATTERY_OKAY`.

```xml
<receiver android:name=".BatteryLevelReceiver">
<intent-filter>
  <action android:name="android.intent.action.ACTION_BATTERY_LOW"/>
  <action android:name="android.intent.action.ACTION_BATTERY_OKAY"/>
  </intent-filter>
</receiver>
```

通常我们都需要在进入低电量的情况下，关闭所有后台程序来维持设备的续航，因为这个时候做任何的更新等操作都是无谓的，很可能在你还没有来的及操作刚才更新的内容的时候就自动关机了。
In many cases, the act of charging a device is coincident with putting it into a dock. The next lesson shows you how to determine the current dock state and monitor for changes in device docking.
