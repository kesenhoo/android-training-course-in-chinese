# Android位置信息

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:<http://developer.android.com/training/location/index.html>

位置感知是移动应用一个独特的功能。用户去到哪里都会带着他们的移动设备，而将位置感知功能添加到我们的应用里，可以让用户有更加真实的情境体验。位置服务API集成在Google Play服务里面，这便于我们将自动位置跟踪、地理围栏和用户活动识别等位置感知功能添加到我们的应用当中。

我们喜欢用[Google Play services location APIs](http://developer.android.com/reference/com/google/android/gms/location/package-summary.html)胜过Android framework location APIs ([android.location](http://developer.android.com/reference/android/location/package-summary.html)) 来给我们的应用添加位置感知功能。如果你现在正在使用Android framework location APIs，我们强烈建议你尽可能切换到Google Play services location APIs。

这个课程介绍如何使用Google Play services location APIs来获取当前位置、周期性地更新位置以及查找地址。创建并监视地理围栏以及探测用户的活动。这个课程包括示例应用和代码片段，你可以利用这些资源作为添加位置感知到你的应用的基础。

> **Note：**因为这个课程基于Google Play services client library，所以在使用这些示例应用和代码段之前确保你安装了最新版本的Google Play services client library。要想学习如何安装最新版的client library，请参考[安装Google Play services向导](http://developer.android.com/google/play-services/setup.html)。

## Lessons

* [**获取最后可知位置**](retrieve-current.html)

    学习如何获取Android设备的最后可知位置。通常Android设备的最后可知位置相当于用户的当前位置。


* [**接收位置更新**](receive-location-updates.html)

    学习如何请求和接收周期性的位置更新。


* [**显示位置地址**](display-address.html)

    学习如何将一个位置的经纬度转化成一个地址（反向地理编码）。


* [**创建和监视地理围栏**](geofencing.html)

    学习如何将一个或多个地理区域定义成一个兴趣位置集合，称为地理围栏。学习如何探测用户靠近或者进入地理围栏事件。
