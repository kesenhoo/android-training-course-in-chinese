# 重复的下载是冗余的

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/redundant_redundant.html>

减少下载的最基本方法是仅仅下载那些我们需要的。从数据的角度看，我们可以通过传递类似上次更新时间这样的参数来制定查询数据的条件。

同样，在下载图片的时候，server 那边最好能够减少图片的大小，而不是让我们下载完整大小的图片。

## 缓存文件到本地

另一个重要的技术是避免下载重复的数据。可以使用缓存机制来处理这个问题。缓存静态的资源，包括按需下载例如完整的图片（只要合理和兴）。这些缓存的资源需要分开存放，使得我们可以定期地清理这些缓存，从而控制缓存数据的大小。

为了保证 app 不会因为缓存而导致显示的是旧数据，请在缓存中获取数据的同时检测其是否过期，当数据过期的时候，会提示进行刷新。

<!-- More -->

```java
long currentTime = System.currentTimeMillis();

HttpURLConnection conn = (HttpURLConnection) url.openConnection();

long expires = conn.getHeaderFieldDate("Expires", currentTime);
long lastModified = conn.getHeaderFieldDate("Last-Modified", currentTime);

setDataExpirationDate(expires);

if (lastModified < lastUpdateTime) {
  // Skip update
} else {
  // Parse update
}
```

使用这种方法，可以有效保证缓存里面一直是最新的数据。

我们可以缓存非敏感数据到非受管的外部缓存目录（目录会是sdcard下面的`Android/data/data/com.xxx.xxx/cache`）：

```java
Context.getExternalCacheDir();
```

或者，我们可以使用受管/安全的应用缓存。请注意，当系统的可用存储空间较小时，存放在内存中的数据有可能会被清除（类似:`system/data/data/com.xxx.xxx./cache`）。

```java
Context.getCache();
```

缓存在上面两个地方的文件都会在 app 卸载的时候被清除。

**Ps：请注意这点:发现很多应用总是随便在 sdcard 下面创建一个目录用来存放缓存，可是这些缓存又不会随着程序的卸载而被删除，这其实是不符合规范，程序都被卸载了，为何还要留那么多垃圾文件，而且这些文件有可能会泄漏一些隐私信息。除非你的程序是音乐下载，拍照程序等等，这些确定程序生成的文件是会被用户需要留下的，不然都应该使用上面的那种方式来获取 Cache 目录。**

## 使用 HttpURLConnection 响应缓存

在 `Android 4.0` 里面为 `HttpURLConnection` 增加了一个响应缓存（这是一个很好的减少 http 请求次数的机制，Android 官方推荐使用 HttpURLConnection 而不是 Apache 的 DefaultHttpClient，就是因为前者不仅仅有针对 android 做 http 请求的优化，还在4.0上增加了 Reponse Cache，这进一步提高了效率)。我们可以使用反射机制开启 HTTP response cache，看下面的例子：

```java
private void enableHttpResponseCache() {
  try {
    long httpCacheSize = 10 * 1024 * 1024; // 10 MiB
    File httpCacheDir = new File(getCacheDir(), "http");
    Class.forName("android.net.http.HttpResponseCache")
         .getMethod("install", File.class, long.class)
         .invoke(null, httpCacheDir, httpCacheSize);
  } catch (Exception httpResponseCacheNotAvailable) {
    Log.d(TAG, "HTTP response cache is unavailable.");
  }
}
```

上面的示例代码在 Android 4.0 以上的设备上会开启 response cache，同时不会影响到之前的程序。

在cache被开启之后，所有cache中的HTTP请求都可以直接在本地存储中进行响应，并不需要开启一个新的网络连接。被cache起来的response可以被server所确保没有过期，这样就减少了下载所需的带宽。

没有被cached的response会为了方便下次请求而被存储在response cache中。