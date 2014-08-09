# Redundant Downloads are Redundant(重复的下载是冗余的)

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/redundant-redundant.html>

减少下载的最基本方法是仅仅下载那些你需要的。从数据的角度看，我们可以通过传递类似上次更新时间这样的参数来制定查询数据的条件。同样，在下载图片的时候，server那边最好能够减少图片的大小，而不是让我们下载完整大小的图片。

## 1)Cache Files Locally(缓存文件到本地)
避免下载重复的数据是很重要的。可以使用缓存机制来处理这个问题。缓存static的资源，例如完整的图片。这些缓存的资源需要分开存放。为了保证app不会因为缓存而导致显示的是旧数据，请从缓存中获取最新的数据，当数据过期的时候，会提示进行刷新。

<!-- More -->

```java
long currentTime = System.currentTimeMillis());

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

可以使用下面的方法来获取External缓存的目录：(目录会是sdcard下面的`Android/data/data/com.xxx.xxx/cache`)

```java
Context.getExternalCacheDir();
```

下面是获取内部缓存的方法，请注意，存放在内存中的数据有可能因内部空间不够而被清除。(类似:`system/data/data/com.xxx.xxx./cache`)

```java
Context.getCache();
```

上面两个Cache的文件都会在app卸载的时候被清除。

**Ps:请注意这点:发现很多应用总是随便在sdcard下面创建一个目录用来存放缓存，可是这些缓存又不会随着程序的卸载而被删除，这其实是很令人讨厌的，程序都被卸载了，为何还要留那么多垃圾文件，而且这些文件有可能会泄漏一些隐私信息。除非你的程序是音乐下载，拍照程序等等，这些确定程序生成的文件是会被用户需要留下的，不然都应该使用上面的那种方式来获取Cache目录**

## 2)Use the HttpURLConnection Response Cache(使用HttpURLConnection Response缓存)
在`Android 4.0`里面为HttpURLConnection增加了一个response cache(这是一个很好的减少http请求次数的机制，Android官方推荐使用HttpURLConnection而不是Apache的DefaultHttpClient，就是因为前者不仅仅有针对android做http请求的优化，还在4.0上增加了Reponse Cache，这进一步提高了效率)

我们可以使用反射机制开启HTTP response cache，看下面的例子：

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

上面的sample code会在Android 4.0以上的设备上开启response cache，同时不会影响到之前的程序。在cache被开启之后，所有cache中的HTTP请求都可以直接在本地存储中进行响应，并不需要开启一个新的网络连接。
被cache起来的response可以被server所确保没有过期，这样就减少了带宽。没有被cached的response会因方便下次请求而被存储在response cache中。

***

**Ps:Cache机制在很多实际项目上都有使用到，实际操作会复杂许多，有机会希望能够分享一个Cache的例子。**
