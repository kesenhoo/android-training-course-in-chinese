# 通过蓝牙进行调试

> 编写: [kesenhoo](https://github.com/kesenhoo) - 原文: <http://developer.android.com/training/wearables/apps/bt-debugging.html>

我们可以通过蓝牙来调试我们的可穿戴应用。即通过蓝牙把调试数据输出到已经连接了开发电脑的手持设备上。

## 搭建好设备用来调试

1. 开启手持设备的USB调试：
    * 打开设置应用并滑动到底部。
    * 如果在设置里面没有开发者选项，点击**关于手机**（或者**关于平板**），滑动到底部，点击build number 7次。
    * 返回并点击**开发者选项**。
    * 开启**USB调试**。
2. 开启可穿戴设备的蓝牙调试：
    * 点击主界面2次，来到Wear菜单界面。
    * 滑动到底部，点击**设置**。
    * 滑动到底部，如果没有**开发者选项**，点击**关于**，然后点击Build Number 7次。
    * 点击**开发者选项**。
    * 开启**蓝牙调试**。

## 建立调试会话

1. 在手持设备上，打开`Android Wear`配套应用。
2. 点击右上角的菜单，选择**设置**。
3. 开启**蓝牙调试**。我们将会在选项下面看到一个小的状态信息：
```xml
Host: disconnected
Target: connected
```
4. 通过USB连接手持设备到电脑上，并执行下面的命令：
```xml
adb forward tcp:4444 localabstract:/adb-hub
adb connect localhost:4444
```
> **Note:** 我们可以使用任何可用的端口。

在`Android Wear`配套应用上，我们将会看到状态变为：
```xml
Host: connected
Target: connected
```

## 调试应用

当运行`abd devices`的命令时，我们的可穿戴设备应该表示为localhost:4444。执行任何的`adb`命令，需要使用下面的格式：

```xml
adb -s localhost:4444 <command>
```

如果没有任何其他的设备通过TCP/IP连接到手持设备（即模拟器），我们可以使用下面的简短命令：

```xml
adb -e <command>
```

例如：

```xml
adb -e logcat
adb -e shell
adb -e bugreport
```
