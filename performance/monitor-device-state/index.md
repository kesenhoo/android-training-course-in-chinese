# 优化电池寿命

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/monitoring-device-state/index.html>


显然，手持设备的电量需要引起很大的重视。通过这一系列的课程，可以学会如何根据设备电池状态来改变App的某些行为与功能。

通过在断开连接时关闭后台服务，在电量减少时减少更新数据的频率等等操作可以在不影响用户体验的前提下，确保App对电池寿命的影响减到最小。

# Lessons

#### Monitoring the Battery Level and Charging State
Learn how to alter your app's update rate by determining, and monitoring, the current battery level and changes in charging state.

#### Determining and Monitoring the Docking State and Type
Optimal refresh rates can vary based on how the host device is being used. Learn how to determine, and monitor, the docking state and type of dock being used to affect your app's behavior.

#### Determining and Monitoring the Connectivity Status
Without Internet connectivity you can't update your app from an online source. Learn how to check the connectivity status to alter your background update rate. You'll also learn to check for Wi-Fi or mobile connectivity before beginning high-bandwidth operations.

#### Manipulating Broadcast Receivers On Demand
Broadcast receivers that you've declared in the manifest can be toggled at runtime to disable those that aren't necessary due to the current device state. Learn to improve efficiency by toggling and cascading state change receivers and delay actions until the device is in a specific state.
