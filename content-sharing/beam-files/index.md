# 使用NFC分享文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/beam-files/index.html>

Android允许我们通过Android Beam文件传输功能在设备之间传送大文件。该功能具有简单的API，它使得用户仅需要通过一些简单的触控操作就能启动文件传输过程。Android Beam会自动地将文件从一台设备拷贝至另一台设备中，并在完成时告知用户。

Android Beam文件传输API可以用来处理规模较大的数据，而在Android4.0（API Level 14）引入的Android Beam NDEF传输API则用来处理规模较小的数据，如URI或者消息数据等。另外，Android Beam仅仅只是Android NFC框架提供的众多特性之一，它允许我们从NFC标签中读取NDEF消息。更多有关Android Beam的知识，请参考：[Beaming NDEF Messages to Other Devices](http://developer.android.com/guide/topics/connectivity/nfc/nfc.html#p2p)。更多有关NFC框架的知识，请参考：[Near Field Communication](http://developer.android.com/guide/topics/connectivity/nfc/index.html)。

## Lessons

* [**发送文件给其他设备**](sending-files.html)

  学习如何配置应用程序，使其可以发送文件给其他设备。


* [**接收其他设备的文件**](receive-files.html)

  学习如何配置应用程序，使其可以接收其他设备发送的文件。
