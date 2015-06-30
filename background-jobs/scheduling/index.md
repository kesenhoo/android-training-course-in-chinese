# 管理设备的唤醒状态

> 编写:[jdneo](https://github.com/jdneo)，[lttowq](https://github.com/lttowq) - 原文:<http://developer.android.com/training/scheduling/index.html>

当一个Android设备闲置时，首先它的屏幕将会变暗，然后关闭屏幕，最后关闭CPU。
这样可以防止设备的电量被迅速消耗殆尽。但是，有时候也会存在一些特例：

* 例如游戏或视频应用需要保持屏幕常亮；
* 其它应用也许不需要屏幕常亮，但或许会需要CPU保持运行，直到某个关键操作结束。

这节课描述如何在必要的时候保持设备唤醒，同时又不会过多消耗它的电量。

## Demos
[**Scheduler.zip**](http://developer.android.com/shareables/training/Scheduler.zip)

## Lessons

### [保持设备唤醒](wake-lock.html)

学习如何在必要的时候保持屏幕和CPU唤醒，同时减少对电池寿命的影响。

### [调度重复闹钟](alarms.html)

对于那些发生在应用生命周期之外的操作，学习如何使用重复闹钟对它们进行调度，即使该应用没有运行或者设备处于睡眠状态。

