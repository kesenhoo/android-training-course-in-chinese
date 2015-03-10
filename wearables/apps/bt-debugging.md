# 通过蓝牙进行调试

> 编写: [kesenhoo](https://github.com/kesenhoo) - 原文: <http://developer.android.com/training/wearables/apps/bt-debugging.html>

你可以通过蓝牙来调试你的可穿戴应用，通过蓝牙把调试数据输出到手持设备上，手持设备是有连接到开发电脑上的。

## 搭建好设备用来调试

* 开启手持设备的USB调试：
    * 打开设置应用并滑动到底部。
    * 如果在设置里面没有开发者选项，点击关于手机，滑动到底部，点击build number 7次。
    * 返回并点击开发者选项。
    * 开启USB调试。
* 开启可穿戴设备的蓝牙调试：
    * 点击主界面2次，来到Wear菜单界面。
    * 滑动到底部，点击设置。
    * 滑动到底部，如果没有开发者选项，点击Build Number 7次。
    * 点击开发者选项。
    * 开启蓝牙调试。

## 建立调试会话

1. 在手持设备上，打开`Android Wear`这个伴侣应用。
2. 点击右上角的菜单，选择设置。
3. 开启蓝牙调试。你将会在选项下面看到一个小的状态信息：
```xml
Host: disconnected
Target: connected
```
4. 通过USB连接手持设备到你的电脑上，并执行下面的命令：
```xml
adb forward tcp:4444 localabstract:/adb-hub; adb connect localhost:4444
```
> **Note:** 你可以使用任何可用的端口。

在`Android Wear`伴侣应用上，你将会看到状态变为：
```xml
Host: connected
Target: connected
```

## 调试你的应用

当运行abd devices的命令时，你的可穿戴设备是作为localhost:4444的。执行任何的adb命令，需要使用下面的格式：
```xml
adb -s localhost:4444 <command>
```
如果没有任何其他的设备通过TCP/IP连接到手持设备，你可以使用下面的简短命令：
```xml
adb -e <command>
```
例如：
```xml
adb -e logcat
adb -e shell
adb -e bugreport
```
