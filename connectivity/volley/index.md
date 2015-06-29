# 使用 Volley 传输网络数据

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/index.html>

`Volley` 是一个 HTTP 库，它能够帮助 Android app 更方便地执行网络操作，最重要的是，它更快速高效。我们可以通过开源的 [AOSP](https://android.googlesource.com/platform/frameworks/volley) 仓库获取到 Volley 。

**YOU SHOULD ALSO SEE**

使用 Volley 来编写一个 app，请参考[2013 Google I/O schedule app](https://github.com/google/iosched)。另外需要特别关注下面2个部分：

* [ImageLoader](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/android/apps/iosched/util/ImageLoader.java)
* [BitmapCache](https://github.com/google/iosched/blob/master/android/src/main/java/com/google/android/apps/iosched/util/BitmapCache.java)

[**VIDEO - Volley: Easy,Fast Networking for Android**](https://developers.google.com/events/io/sessions/325304728)
***
Volley 有如下的优点：

* 自动调度网络请求。
* 高并发网络连接。
* 通过标准的 HTTP [cache coherence](https://en.wikipedia.org/wiki/Cache_coherence)（高速缓存一致性）缓存磁盘和内存透明的响应。
* 支持指定请求的优先级。
* 撤销请求 API。我们可以取消单个请求，或者指定取消请求队列中的一个区域。
* 框架容易被定制，例如，定制重试或者回退功能。
* 强大的指令（Strong ordering）可以使得异步加载网络数据并正确地显示到 UI 的操作更加简单。
* 包含了调试与追踪工具。

Volley 擅长执行用来显示 UI 的 RPC 类型操作，例如获取搜索结果的数据。它轻松的整合了任何协议，并输出操作结果的数据，可以是原始的字符串，也可以是图片，或者是 JSON。通过提供内置的我们可能使用到的功能，Volley 可以使得我们免去重复编写样板代码，使我们可以把关注点放在 app 的功能逻辑上。

Volley 不适合用来下载大的数据文件。因为 Volley 会保持在解析的过程中所有的响应。对于下载大量的数据操作，请考虑使用 [DownloadManager](http://developer.android.com/reference/android/app/DownloadManager.html)。

Volley 框架的核心代码是托管在 AOSP 仓库的 `frameworks/volley` 中，相关的工具放在 `toolbox` 下。把 Volley 添加到项目中最简便的方法是 Clone 仓库，然后把它设置为一个 library project：

1. 通过下面的命令来Clone仓库：

    ```
    git clone https://android.googlesource.com/platform/frameworks/volley
    ```

2. 以一个 Android library project 的方式导入下载的源代码到你的项目中。(如果你使用 Eclipse，请参考 <a href="http://developer.android.com/tools/projects/projects-eclipse.html)">Managing Projects from Eclipse with ADT</a>，或者编译成一个 `.jar` 文件。

## Lessons

[**发送一个简单的网络请求(Sending a Simple Request)**](simple.html)

  学习如何通过 Volley 默认的行为发送一个简单的请求，以及如何取消一个请求。

[**建立一个请求队列(Setting Up a RequestQueue)**](request-queue.html)

  学习如何建立一个请求队列（`RequestQueue`），以及如何实现一个单例模式来创建一个请求队列，使 `RequestQueue` 能够持续保持在我们 app 的生命周期中。

[**生成一个标准的请求(Making a Standard Request)**](request.html)

  学习如何使用 Volley 的 out-of-the-box（可直接使用、无需配置）请求类型（原始字符串、图片和 JSON）来发送一个请求。

[**实现自定义的请求(Implementing a Custom Request)**](request-custom.html)

  学习如何实现一个自定义的请求。

