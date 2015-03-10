# 云同步

> 编写:[kesenhoo](https://github.com/kesenhoo)，[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/cloudsync/index.html>

通过为网络连接提供强大的APIs，Android Framework帮助你建立丰富的，具有云功能的App，这些App可以同步数据到远程服务器端，这使得所有你的设备都保持数据同步，并且重要的数据都能够备份在云端。

这章节会介绍几种不同的策略来实现具有云功能的App。这样用当用户安装你的app到新的一台设备上的时候能够恢复之前的使用记录。

## Lessons

* [**使用备份API**](backupapi.html)

  学习如何集成Backup API到你的应用中。这样使得例如Preference，笔记与最高分记录等数据都能够无缝在用户的多台设备上进行同步更新。


* [**使用Google Cloud Messaging**](gcm.html)

  学习如何高效的发送多路广播，如何正确的响应接收到的Google Cloud Messaging (GCM) 消息，以及如何使用GCM消息来与服务器进行同步。
