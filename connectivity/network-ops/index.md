# 网络连接操作

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/network-ops/index.html>

这一章会介绍一些基本的网络操作，监视网络连接（包括网络改变），让用户来控制app对网络的选择使用。还会介绍如何解析与使用XML数据。

这节课包括一个示例应用,展示如何执行常见的网络操作.你可以下载下面的的范例,并把它作为可重用代码在你自己的应用中使用.

[NetworkUsage.zip](http://developer.android.com/shareables/training/NetworkUsage.zip)

通过学习这章节的课程，你会学习一些基础知识，如何创建一个高效的app，使用最少的网络流量下载数据并解析数据。

你还可以参考下面文章进阶学习:

* [Optimizing Battery Life](performance/monitoring-device-state/index.html)
* [Transferring Data Without Draining the Battery](connectivity/efficient-downloads/index.html)
* [Web Apps Overview](http://developer.android.com/guide/webapps/index.html)
* [Transmitting Network Data Using Volley](connectivity/volley/index.md)

> **Node:**查看[Transmitting Network Data Using Volley](connectivity/volley/index.md)课程获取Volley的相关信息,它是一个能帮助Android apps更方便的执行网络操作的HTTP库.Volly可以在开源[AOSP](https://android.googlesource.com/platform/frameworks/volley)库中找到.Volly可能能帮助你简化网络操作,提高你的app网络操作的性能.

## Lessons

* [连接到网络 - Connecting to the Network](connecting.html)

  学习如何连接到网络，选择一个HTTP client，以及在UI线程外执行网络操作。


* [管理网络的使用情况 - Managing Network Usage](managing.html)

  学习如何检查设备的网络连接情况，创建偏好界面来控制网络使用，以及响应连接变化。


* [解析XML数据 - Parsing XML Data](xml.html)

  学习如何解析和使用XML数据。
