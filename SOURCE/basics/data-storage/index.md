> 编写:[kesenhoo](https://github.com/kesenhoo)

> 校对:[KOST](https://github.com/K0ST)

# 数据保存

虽然可以在onPause()的时候保存一些信息以免用户的使用进度被丢失，但是大多数Android app仍然是需要做保存数据的动作。大多数比较好的apps都需要保存用户的设置信息，而且有一些apps必须维护大量的文件信息与DB信息。这一章节会介绍给你在Android中一些重要的数据存储方法，例如：

* [以key-value的方式保存一些简单的数据到shared preferences文件中](shared-preference.html)
* [在Android文件系统中保存任意格式的文件](files.html)
* [通过SQLite来使用DB](database.html)
