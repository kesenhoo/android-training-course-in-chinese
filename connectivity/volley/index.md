# 使用Volley传输网络数据(Transmitting Network Data Using Volley)

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/index.html>

`Volley` 是一个HTTP库，它能够帮助Android apps更方便的执行网络操作，最重要的是，它更快速高效。可以通过开源的 [AOSP](https://android.googlesource.com/platform/frameworks/volley) 仓库获取到Volley 。

**YOU SHOULD ALSO SEE**

使用Volley来编写一个app，请参考[2013 Google I/O schedule app](https://github.com/google/iosched). 另外需要特别关注下面2个部分：
* [ImageLoader](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/android/apps/iosched/util/ImageLoader.java)
* [BitmapCache](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/android/apps/iosched/util/BitmapCache.java)

** [VIDEO - Volley:Easy,Fast Networking for Android](https://developers.google.com/events/io/sessions/325304728) **
***
Volley 有如下的优点：

* 自动调度网络请求。
* 高并发网络连接。
* 通过标准的HTTP的[cache coherence](http://en.wikipedia.org/wiki/Cache_coherence%22)(高速缓存一致性)使得磁盘与内存缓存不可见(Transparent)。
* 支持指定请求的优先级。
* 支持取消已经发出的请求。你可以取消单个请求，或者指定取消请求队列中的一个区域。
* 框架容易被定制，例如，定制重试或者回退功能。
* 强大的指令(Strong ordering)可以使得异步加载网络数据并显示到UI的操作更加简单。
* 包含了Debugging与tracing工具。

Volley擅长执行用来显示UI的RPC操作， 例如获取搜索结果的数据。它轻松的整合了任何协议，并输出操作结果的数据，可以是raw strings，也可以是images，或者是JSON。通过提供内置你可能使用到得功能，Volley可以使得你免去重复编写样板代码，使你可以把关注点放在你的app的功能逻辑上。

Volley不适合用来下载大的数据文件。因为Volley会在解析的过程中保留持有所有的响应数据在内存中。对于下载大量的数据操作，请考虑使用[DownloadManager](http://developer.android.com/reference/android/app/DownloadManager.html)。

Volley框架的核心代码是托管在AOSP仓库的`frameworks/volley`中，相关的工具放在`toolbox`下。把Volley添加到你的项目中的最简便的方法是Clone仓库然后把它设置为一个library project：

* 通过下面的命令来Clone仓库：

`git clone https://android.googlesource.com/platform/frameworks/volley`

* 以一个Android library project的方式导入下载的源代码到你的项目中。(如果你是使用Eclipse，请参考[Managing Projects from Eclipse with ADT](http://developer.android.com/tools/projects/projects-eclipse.html))，或者编译成一个`.jar`文件。

## Lessons

* [**发送一个简单的网络请求(Sending a Simple Request)**](simple.html)

学习如何通过Volley默认的行为发送一个简单的请求，以及如何取消一个请求。

* [**建立一个请求队列(Setting Up a RequestQueue)**](request-queue.html)

学习如何建立一个请求队列，以及如何实现一个单例模式来创建一个请求队列。

* [**生成一个标准的请求(Making a Standard Request)**](request.html)

学习如何使用Volley的out-of-the-box（可直接使用、无需配置）的请求类型(raw strings, images, and JSON)来发送一个请求。

* [**实现自定义的请求(Implementing a Custom Request)**](request-custom.html)

学习如何实现一个自定义的请求

