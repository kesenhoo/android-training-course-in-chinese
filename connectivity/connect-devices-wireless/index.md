# 无线连接设备

> 编写:[acenodie](https://github.com/acenodie) - 原文:<http://developer.android.com/training/connect-devices-wirelessly/index.html>

除了能够在云端通信，Android 的无线 API 也允许同一局域网中的设备进行通信，甚至没有连接到网络上，而是物理上隔得很近，也可以相互通信。此外，网络服务发现（Network Service Discovery，简称NSD）可以进一步通过允许应用程序运行能相互通信的服务去寻找附近运行相同服务的设备。把这个功能整合到我们的应用中，可以提供许多功能，如在同一个房间，用户玩游戏，可以利用 NSD 实现从一个网络摄像头获取图像，或远程登录到在同一网络中的其他机器。

本节课介绍了一些使我们的应用程序能够寻找和连接其他设备的主要 API。具体地说，它介绍了用于发现可用服务的 NSD API 和能实现点对点无线连接的无线点对点（the Wi-Fi Peer-to-Peer，简称 Wi-Fi P2P）API。本节课也将告诉我们怎样将 NSD 和 Wi-Fi P2P 结合起来去检测其他设备所提供的服务。当检测到时，连接到相应的设备上。即使设备都没有连接到一个网络中。

## Lessons

[**使用网络服务发现**](nsd.html)

  学习如何广播由我们自己的应用程序提供的服务，如何发现在本地网络上提供的服务，并用 NSD 获取我们将要连接的服务的详细信息。


[**使用 WiFi 建立 P2P 连接**](wifi-direct.html)

  学习如何获取附近的对等设备，如何创建一个设备接入点，如何连接到其他具有 Wi-Fi P2P 连接功能的设备。


[**使用 WiFi P2P 发现服务**](nsd-wifi-index.html)

  学习如何使用 WiFi P2P 服务去发现附近的不在同一个网络的服务。
