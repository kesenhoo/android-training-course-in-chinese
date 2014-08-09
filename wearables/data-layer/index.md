# 发送并同步数据

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/index.html>

可穿戴数据层API(The Wearable Data Layer API)，Google Play服务的一部分，为你的手持与可穿戴应用提供了一个交流通道。此API包括一套的，可由系统通过网络和通告你应用数据层重要事件的监听器发送和同步的数据对象：

**Data Items**

数据元提供了手持设备与可穿戴设备间的可自动同步的数据储存。

**Messages**

MessageApi类可以发送“自动跟踪”命令消息，比如，从可穿戴设备上控制手持设备的媒体播放器，或在可穿戴设备上开启一个来自手持设备的intent。当手持设备与可穿戴设备成功连接时，系统会发送这个消息，否则，会发送一个错误。

**Asset**

资源对象是为了发送如图像这样的二进制数据。将资源附加到数据项，系统会自动负责传递，并通过缓存大资源来避免重复传送以保护蓝牙带宽。

**WearableListenerService (for services)**

拓展的WearableListenerService能够监听一个service中重要的数据层事件。系统控制WearableListenerService的生命周期，并当需要发送数据项或消息时，将其与service绑定，否则解除绑定。

**DataListener (for foreground activities)**

在一个前台activity中实现DataListener能够监听重要的数据通道事件。只有当用户活跃地使用应用时，用此代替WearableListenerService来监听改变。

> **Warning:** 因为这些Api是为手持设备与可穿戴设备间通信设计，所以你只能使用这些Api来建立这些设备间的通信。例如，不能试着打开底层sockets来创建通信通道。

## Lessons

* [Accessing the Wearable Data Layer(访问可穿戴数据层)](accessing.html)

    这节课向你展示了如何创建一个客户端访问数据层Api。


* [Syncing Data Items(同步数据单元)](data-items.html)

    数据元是存储在一个可自动由手持设备同步到可穿戴设备上复制来的数据仓库中的对象。


* [Transferring Assets(传输资源)](assets.html)

    资源是典型地用来传输图像和媒体二进制数据。


* [Sending and Receiving Messages(发送与接收消息)](messages.html)

    消息被设计为自动跟踪的消息，可以在手持与可穿戴设备间来回传送。


* [Handling Data Layer Events(处理数据层的事件)](events.html)


