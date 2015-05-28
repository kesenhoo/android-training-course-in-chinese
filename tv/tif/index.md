# 创建TV直播应用

> 编写:[dupengwei](https://github.com/dupengwei) - 原文:http://developer.android.com/training/tv/tif/index.html

看电视直播节目和其他连续的、基于频道的内容是TV体验的主要部分。Android 通过Android 5.0中的TV Input Framework支持直播视频内容的接收和重放（API Level 21）。该框架提供了一个统一的方法，从硬件源（如HDMI端口和内置调谐器）和软件源（如流传在互联网上的视频）接收音频和视频内容。


该框架能使开发人员通过实现TV输入服务定义直播TV输入源。该服务发布一个频道和节目列表到一个TV Provider上。电视设备的直播电视应用从TV Provider获取可用的频道和节目列表并显示给用户。当用户选择某个特定的频道，直播TV应用软件通过TV Input Manager为相关TV输入服务创建一个会话，并告诉TV输入服务调整到请求频道，然后将内容显示到TV应用软件提供的显示器上。
![tv-tif-overview](tv-tif-overview.png)
**图1**.电视输入框架功能图

TV Input Framework 的设计目的是提供各种各样的TV输入源并把它们整合到一个单一的用户界面供用户浏览、查看和享受内容。为你想要传播的节目构建一个TV输入服务之后，用户可以更加轻易地通过TV设备收看这些节目。


更多关于TV输入框架的信息，请参考[android.media.tv](http://developer.android.com/reference/android/media/tv/package-summary.html)。

-----------------


