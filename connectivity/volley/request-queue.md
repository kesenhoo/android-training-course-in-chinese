# 建立请求队列（RequestQueue）

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/requestqueue.html>

前一节课演示了如何使用 `Volley.newRequestQueue` 这一简便的方法来建立一个`RequestQueue`，这是利用了 Volley 默认行为的优势。这节课会介绍如何显式地建立一个 `RequestQueue`，以便满足我们自定义的需求。

这节课同样会介绍一种推荐的实现方式：创建一个单例的 `RequestQueue`，这使得 `RequestQueue` 能够持续保持在我们 app 的生命周期中。

## 建立网络和缓存

一个 `RequestQueue` 需要两部分来支持它的工作：一部分是网络操作，用来传输请求，另外一个是用来处理缓存操作的 Cache。在 Volley 的工具箱中包含了标准的实现方式：`DiskBasedCache` 提供了每个文件与对应响应数据一一映射的缓存实现。 `BasicNetwork` 提供了一个基于 [AndroidHttpClient](http://developer.android.com/reference/android/net/http/AndroidHttpClient.html) 或者 [HttpURLConnection](http://developer.android.com/reference/java/net/HttpURLConnection.html) 的网络传输。

`BasicNetwork` 是 Volley 默认的网络操作实现方式。一个 `BasicNetwork` 必须使用我们的 app 用于连接网络的 HTTP Client 进行初始化。这个 Client 通常是[AndroidHttpClient](http://developer.android.com/reference/android/net/http/AndroidHttpClient.html) 或者 [HttpURLConnection](http://developer.android.com/reference/java/net/HttpURLConnection.html)：

* 对于 app target API level 低于 API 9（Gingerbread）的使用 AndroidHttpClient。在 Gingerbread 之前，HttpURLConnection 是不可靠的。对于这个的细节，请参考 [Android's HTTP Clients](http://android-developers.blogspot.com/2011/09/androids-http-clients.html)。
* 对于 API Level 9 以及以上的，使用 HttpURLConnection。

我们可以通过检查系统版本选择合适的 HTTP Client，从而创建一个能够运行在所有 Android 版本上的应用。例如：

```java
HttpStack stack;
...
// If the device is running a version >= Gingerbread...
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.GINGERBREAD) {
    // ...use HttpURLConnection for stack.
} else {
    // ...use AndroidHttpClient for stack.
}
Network network = new BasicNetwork(stack);
```

下面的代码片段演示了如何一步步建立一个 `RequestQueue`:

```java
RequestQueue mRequestQueue;

// Instantiate the cache
Cache cache = new DiskBasedCache(getCacheDir(), 1024 * 1024); // 1MB cap

// Set up the network to use HttpURLConnection as the HTTP client.
Network network = new BasicNetwork(new HurlStack());

// Instantiate the RequestQueue with the cache and network.
mRequestQueue = new RequestQueue(cache, network);

// Start the queue
mRequestQueue.start();

String url ="http://www.myurl.com";

// Formulate the request and handle the response.
StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
        new Response.Listener<String>() {
    @Override
    public void onResponse(String response) {
        // Do something with the response
    }
},
    new Response.ErrorListener() {
        @Override
        public void onErrorResponse(VolleyError error) {
            // Handle error
    }
});

// Add the request to the RequestQueue.
mRequestQueue.add(stringRequest);
...
```

如果我们仅仅是想做一个单次的请求并且不想要线程池一直保留，我们可以通过使用在前面一课：[发送一个简单的请求（Sending a Simple Request）](simple.html)文章中提到的 `Volley.newRequestQueue()` 方法，在任何需要的时刻创建 `RequestQueue`，然后在我们的响应回调里面执行 `stop()` 方法来停止操作。但是更通常的做法是创建一个 `RequestQueue` 并设置为一个单例。下面部分将演示这种做法。

## 使用单例模式

如果我们的应用需要持续地使用网络，更加高效的方式应该是建立一个 `RequestQueue` 的单例，这样它能够持续保持在整个 app 的生命周期中。我们可以通过多种方式来实现这个单例。推荐的方式是实现一个单例类，里面封装了 `RequestQueue` 对象与其它的 Volley 功能。另外一个方法是继承 [`Application`](http://developer.android.com/reference/android/app/Application.html) 类，并在 `Application.OnCreate()` 方法里面建立 `RequestQueue`。但是我们并不推荐这个方法，因为一个 static 的单例能够以一种更加模块化的方式提供同样的功能。

一个关键的概念是 `RequestQueue` 必须使用 Application context 来实例化，而不是 Activity context。这确保了 `RequestQueue` 在我们 app 的生命周期中一直存活，而不会因为 activity 的重新创建而被重新创建(例如，当用户旋转设备时)。

下面是一个单例类，提供了 `RequestQueue` 与 `ImageLoader` 功能：

```java
public class MySingleton {
    private static MySingleton mInstance;
    private RequestQueue mRequestQueue;
    private ImageLoader mImageLoader;
    private static Context mCtx;

    private MySingleton(Context context) {
        mCtx = context;
        mRequestQueue = getRequestQueue();

        mImageLoader = new ImageLoader(mRequestQueue,
                new ImageLoader.ImageCache() {
            private final LruCache<String, Bitmap>
                    cache = new LruCache<String, Bitmap>(20);

            @Override
            public Bitmap getBitmap(String url) {
                return cache.get(url);
            }

            @Override
            public void putBitmap(String url, Bitmap bitmap) {
                cache.put(url, bitmap);
            }
        });
    }

    public static synchronized MySingleton getInstance(Context context) {
        if (mInstance == null) {
            mInstance = new MySingleton(context);
        }
        return mInstance;
    }

    public RequestQueue getRequestQueue() {
        if (mRequestQueue == null) {
            // getApplicationContext() is key, it keeps you from leaking the
            // Activity or BroadcastReceiver if someone passes one in.
            mRequestQueue = Volley.newRequestQueue(mCtx.getApplicationContext());
        }
        return mRequestQueue;
    }

    public <T> void addToRequestQueue(Request<T> req) {
        getRequestQueue().add(req);
    }

    public ImageLoader getImageLoader() {
        return mImageLoader;
    }
}
```

下面演示了利用单例类来执行 `RequestQueue` 的操作：

```java
// Get a RequestQueue
RequestQueue queue = MySingleton.getInstance(this.getApplicationContext()).
    getRequestQueue();
...

// Add a request (in this example, called stringRequest) to your RequestQueue.
MySingleton.getInstance(this).addToRequestQueue(stringRequest);
```








