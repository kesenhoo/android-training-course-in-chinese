# Android位置信息

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

移动应用一个独特的特征就是对地址的感知。移动用户把他们的设备带到各个地方，这时将位置的感知能力添加到你的应用里可以让用户有更多的地理位置相关的体验。最新的位置服务API集成在Google Play服务里面，内置有自动位置记录，地理围栏，用户活动识别。这个API让Android平台的位置API优势更加突出了。

这个课程教你如何在你的应用里使用位置服务，获取周期性的位置更新，查询地址，创建并监视地理围栏以及探测用户的活动。这个课程包括示例应用和代码片段，你可以使用它们让你的应用拥有位置感知能力。

>注意: 因为这个课程基于Google Play services client library，在使用这些示例应用和代码段之前确保你安装了最新版本的Google Play services client library。要想学习如何安装最新版的client library，请参考安装Google Play services 向导。

## Lessons

* [**获取当前的位置**](retrieve-current.html)

    学习如何获取用户当前的位置。


* [**接收位置更新**](receive-location-updates.html)

    学习如何请求和接收周期性的位置更新。


* [**显示一个地点位置**](display-address.html)

    学习如何讲一个位置的经纬度转化成一个地址（反向 geocoding）。


* [**创建和监视Geofences**](geofencing.html)

    学习如何将一个或多个地理区域定义成一个兴趣位置集合，称为地理围栏。学习如何探测用户靠近或者进入地理围栏事件。


* [**识别用户当前的活动**](activity-recognition.html)

    学习如何识别用户当前的活动，比如步行，骑行，或者驾车行驶。学习如何使用这些信息去更改你应用的位置策略。


* [**使用Mock Locations测试你的应用**](location-testing.html)

    学习如何使用虚拟的位置数据来测试一个位置应用。在mock模式里面，位置服务将会发送一些虚拟的位置数据。

