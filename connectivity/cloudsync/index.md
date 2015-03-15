# 云同步

> 编写:[kesenhoo](https://github.com/kesenhoo)，[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/cloudsync/index.html>

通过为网络连接提供强大的API，Android Framework可以帮助你建立丰富的，具有云功能的App。这些App可以同步数据到远程服务器端，确保所有你的设备都能保持数据同步，并且重要的数据都能够备份在云端。

本章节会介绍几种不同的策略来实现具有云功能的App。包括：使用你自己的后端网络应用进行数据云同步，以及使用云对数据进行备份，这样的话，当用户将你的app安装到一台新的设备上时，他们之前的使用数据就可以得到恢复了。

## Lessons

* [**使用备份API**](backupapi.html)

  学习如何将Backup API集成到你的应用中。通过Backup API可以将用户数据（比如配置信息，笔记，高分记录等）无缝地在多台设备上进行同步更新。


* [**使用Google Cloud Messaging**](gcm.html)

  学习如何高效的发送多播消息，如何正确地响应接收到的Google Cloud Messaging (GCM) 消息，以及如何使用GCM消息与服务器进行高效同步。
