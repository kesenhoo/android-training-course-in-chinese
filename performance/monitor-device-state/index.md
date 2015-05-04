# 优化电池寿命

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/monitoring-device-state/index.html>

显然，手持设备的电量使用情况需要引起很大的重视。通过这一系列的课程，你将学会如何根据设备的状态来改变App的某些行为与功能。

通过在失去网络连接时关闭后台更新服务，在剩余电量较低时减少更新数据的频率等操作，你可以在不影响用户体验的前提下，确保App对电池寿命的影响减到最小。

# 课程

## [检测电量与充电状态](battery-monitor.html)

学习如何通过判断与检测当前电池电量以及充电状态的变化，改变应用程序的更新频率。

## [判断并监测设备的底座状态与类型](docking-monitor.html)

设备使用习惯的区别也会影响到刷新频率的优化措施，这节课中将学习如何判断与监测底座状态及其种类来改变应用程序的行为。

## [判断并检测网络连接状态](connectivity-monitor.html)

在没有连接到互联网的情况下，你是无法在线更新应用的。这一节课将学习如何根据网络的连接状态，改变后台更新的频率，以及如何在高带宽传输任务开始前，判断网络连接类型(Wi-Fi/数据连接)。

## [按需操纵BroadcastReceiver](manifest-receivers.html)

在Manifest清单文件中声明的BroadcastReceiver可以在运行时切换其开启状态，这样一来，我们就可以根据当前设备的状态，禁用那些没有必要开启的BroadcastReceiver。在这一节课将学习如何通过切换这些BroadcastReceiver的开启状态，以及如何根据设备的状态延迟某一操作的执行时机，来提高应用的效率。
