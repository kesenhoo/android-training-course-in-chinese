# 建立请求队列(Setting Up a RequestQueue)

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/request-queue.html>

前一节课演示了如何使用`Volley.newRequestQueue`这一简便的方法来建立一个`RequestQueue`，这是利用了Volley默认的优势。这节课会介绍如何显式的建立一个RequestQueue，以便满足你自定义的需求。

这节课同样会介绍一种推荐的实现方式：创建一个单例的RequestQueue，这使得RequestQueue能够持续保持在你的app的生命周期中。

## Set Up a Network and Cache
一个RequestQueue需要两部分来支持它的工作：一部分是网络操作用来执行请求的数据传输，另外一个是用来处理缓存操作的Cache。在Volley的工具箱中包含了标准的实现方式：`DiskBasedCache`提供了每个文件与对应响应数据一一映射的缓存实现。 `BasicNetwork`提供了一个网络传输的实现，连接方式可以是[AndroidHttpClient](http://developer.android.com/reference/android/net/http/AndroidHttpClient.html) 或者是 [HttpURLConnection](http://developer.android.com/reference/java/net/HttpURLConnection.html).

`BasicNetwork`是Volley默认的网络操作实现方式。一个BasicNetwork必须使用HTTP Client进行初始化。这个Client通常是AndroidHttpClient 或者 HttpURLConnection:

* 对于app target API level低于API 9(Gingerbread)的使用AndroidHttpClient。在Gingerbread之前，HttpURLConnection是不可靠的。对于这个的细节，请参考[Android's HTTP Clients](http://android-developers.blogspot.com/2011/09/androids-http-clients.html)。
* 对于API Level 9以及以上的，会使用HttpURLConnection。

为了创建一个能够执行在所有Android版本上的应用，你可以通过检查系统版本选择合适的HTTP Client。例如：

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

下面的代码片段会演示如何一步步建立一个RequestQueue:

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

如果你仅仅是想做一个单次的请求并且不想要线程池一直保留，你可以通过使用在前面一课：[发送一个简单的请求(Sending a Simple Request)](simple.html)文章中提到`Volley.newRequestQueue()`方法在任何需要的时刻创建RequestQueue，然后在你的响应回调里面执行`stop()`方法来停止操作。但是更通常的做法是创建一个RequestQueue并设置为一个单例。下面将演示这种做法。

## Use a Singleton Pattern

如果你的程序需要持续的使用网络，更加高效的方式应该是建立一个RequestQueue的单例，这样它能够持续保持在整个app的生命周期中。你可以通过多种方式来实现这个单例。推荐的方式是实现一个单例类，里面封装了RequestQueue对象与其他Volley的方法。另外一个方法是继承Application类，并在`Application.OnCreate()`方法里面建立RequestQueue。但是这个方法是不推荐的。因为一个static的单例能够以一种更加模块化的方式提供同样的功能。

一个关键的概念是RequestQueue必须和Application context所关联的。而不是Activity的context。这可以确保RequestQueue可以在你的app生命周期中一直存活，而不会因为activity的重新创建而重新创建RequestQueue。(例如，当用户旋转设备时)。

下面是一个单例类，提供了RequestQueue与ImageLoader的功能：

```java
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

下面演示了利用单例类来执行RequestQueue的操作：

```java
// Get a RequestQueue
RequestQueue queue = MySingleton.getInstance(this.getApplicationContext()).
    getRequestQueue();
...

// Add a request (in this example, called stringRequest) to your RequestQueue.
MySingleton.getInstance(this).addToRequestQueue(stringRequest);
```








