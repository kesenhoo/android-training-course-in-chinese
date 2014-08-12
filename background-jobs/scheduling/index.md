# 管理设备的唤醒状态

> 编写:[lttowq](https://github.com/lttowq) - 原文:<http://developer.android.com/training/scheduling/index.html>

当你的一个Android设备闲置时，屏幕将会变暗，然后关闭屏幕，最后关闭CPU。
这是减少你的设备电量的快速消耗，然而，有些时候，你的应用程序可能需要不同的行为时间：

1.例如游戏或电影应用需要保持屏幕亮着

2.其他的应用也许不需要屏幕开着，但或许会请求CPU保持运行直到一个关键操作结束。

这节课描述如何在必要的时候保持设备唤醒但消耗它的电量。
#Lesson
[Keeping the Device Awake]()

* 学习当需要时如何保持屏幕和CPU唤醒，同时减少对电池的生命周期的影响。

[Scheduling Repeating Alarms]()

* 学习使用重复闹钟对于发生在生命周期外之应用的作业调度，即使应用没有运行或者设备处于睡眠状态。

