# 使用NFC分享文件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/beam-files/index.html>

Android允许你通过Android Beam文件传输功能在设备之间传送大文件。这个功能键具有简单的API，同时，它允许用户仅需要点击设备就能启动文件传输的过程。Android Beam会自动地将文件从一台设备拷贝至另外一台，并且在完成时告知用户。

Android Beam文件传输API可以用来处理大量的数据，而在Android4.0（API Level 14）引入的Android BeamNDEF传输API则用来处理少量的数据，比如：URI等一些体积较小的数据。另外，Android Beam是在Android NFC框架中唯一允许你从NFC标签中读取NDEF消息的方法。想要学习更多有关Android Beam的知识，可以阅读：[Beaming NDEF Messages to Other Devices](http://developer.android.com/guide/topics/connectivity/nfc/nfc.html#p2p)。想要学习更多有关NFC框架的知识，可以阅读：[Near Field Communication](http://developer.android.com/guide/topics/connectivity/nfc/index.html)。

## Lessons

* [**发送文件给其他设备**](sending-files.html)

  学习如何发送文件给其他设备。


* [**接收其他设备的文件**](receive-files.html)

  学习如何接收其他设备发送的文件。
