# 创建标准的网络请求

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/request.html>

这一课会介绍如何使用 Volley 支持的常用请求类型：

* `StringRequest`。指定一个 URL 并在响应回调中接收一个原始的字符串数据。请参考前一课的示例。
* `ImageRequest`。指定一个 URL 并在响应回调中接收一个图片。
* `JsonObjectRequest` 与 `JsonArrayRequest`（均为 `JsonRequest` 的子类）。指定一个 URL 并在响应回调中获取到一个 JSON 对象或者 JSON 数组。

如果我们需要的是上面演示的请求类型，那么我们很可能不需要实现一个自定义的请求。这节课会演示如何使用那些标准的请求类型。关于如何实现自定义的请求，请看下一课：[实现自定义的请求](request-costom.html)。

## 请求一张图片

Volley 为请求图片提供了如下的类。这些类依次有着依赖关系，用来支持在不同的层级进行图片处理：

* `ImageRequest` —— 一个封装好的，用来处理 URL 请求图片并且返回一张解完码的位图（bitmap）。它同样提供了一些简便的接口方法，例如指定一个大小进行重新裁剪。它的主要好处是 Volley 会确保类似 decode，resize 等耗时的操作在工作线程中执行。

* `ImageLoader` —— 一个用来处理加载与缓存从网络上获取到的图片的帮助类。`ImageLoader` 是大量 `ImageRequest` 的协调器。例如，在 [`ListView`](http://developer.android.com/reference/android/widget/ListView.html) 中需要显示大量缩略图的时候。`ImageLoader` 为通常的 Volley cache 提供了更加前瞻的内存缓存，这个缓存对于防止图片抖动非常有用。这还使得在不阻塞或者延迟主线程的前提下实现缓存命中（这对于使用磁盘 I/O 是无法实现的）。`ImageLoader` 还能够实现响应联合（response coalescing），避免几乎每一个响应回调里面都设置 bitmap 到 view 上面。响应联合使得能够同时提交多个响应，这提升了性能。

* `NetworkImageView` —— 在 `ImageLoader` 的基础上建立，并且在通过网络 URL 取回的图片的情况下，有效地替换 `ImageView`。如果 view 从层次结构中分离，`NetworkImageView` 也可以管理取消挂起请求。

### 使用 ImageRequest

下面是一个使用 `ImageRequest` 的示例。它会获取 URL 上指定的图片并显示到 app 上。注意到，里面演示的 `RequestQueue` 是通过上一课提到的单例类实现的：

```java
ImageView mImageView;
String url = "http://i.imgur.com/7spzG.png";
mImageView = (ImageView) findViewById(R.id.myImage);
...

// Retrieves an image specified by the URL, displays it in the UI.
ImageRequest request = new ImageRequest(url,
    new Response.Listener() {
        @Override
        public void onResponse(Bitmap bitmap) {
            mImageView.setImageBitmap(bitmap);
        }
    }, 0, 0, null,
    new Response.ErrorListener() {
        public void onErrorResponse(VolleyError error) {
            mImageView.setImageResource(R.drawable.image_load_error);
        }
    });
// Access the RequestQueue through your singleton class.
MySingleton.getInstance(this).addToRequestQueue(request);
```

### 使用 ImageLoader 和 NetworkImageView

我们可以使用 `ImageLoader` 与 `NetworkImageView` 来有效地管理类似 ListView 等显示多张图片的情况。在 layout XML 文件中，我们以与使用 [ImageView](http://developer.android.com/reference/android/widget/ImageView.html) 差不多的方法使用 `NetworkImageView`，例如:

```xml
<com.android.volley.toolbox.NetworkImageView
        android:id="@+id/networkImageView"
        android:layout_width="150dp"
        android:layout_height="170dp"
        android:layout_centerHorizontal="true" />
```

我们可以使用 `ImageLoader` 自身来显示一张图片，例如：

```java
ImageLoader mImageLoader;
ImageView mImageView;
// The URL for the image that is being loaded.
private static final String IMAGE_URL =
    "http://developer.android.com/images/training/system-ui.png";
...
mImageView = (ImageView) findViewById(R.id.regularImageView);

// Get the ImageLoader through your singleton class.
mImageLoader = MySingleton.getInstance(this).getImageLoader();
mImageLoader.get(IMAGE_URL, ImageLoader.getImageListener(mImageView,
         R.drawable.def_image, R.drawable.err_image));
```

然而，如果我们要做的是为 `ImageView` 进行图片设置，那么我们可以使用 `NetworkImageView` 来实现，例如：

```java
ImageLoader mImageLoader;
NetworkImageView mNetworkImageView;
private static final String IMAGE_URL =
    "http://developer.android.com/images/training/system-ui.png";
...

// Get the NetworkImageView that will display the image.
mNetworkImageView = (NetworkImageView) findViewById(R.id.networkImageView);

// Get the ImageLoader through your singleton class.
mImageLoader = MySingleton.getInstance(this).getImageLoader();

// Set the URL of the image that should be loaded into this view, and
// specify the ImageLoader that will be used to make the request.
mNetworkImageView.setImageUrl(IMAGE_URL, mImageLoader);
```

上面的代码是通过通过前一节课讲到的单例类来访问 `RequestQueue` 与 `ImageLoader`。这种方法保证了我们的 app 创建这些类的单例会持续存在于 app 的生命周期。这对于 `ImageLoader`（一个用来处理加载与缓存图片的帮助类）很重要的原因是：内存缓存的主要功能是允许非抖动旋转。使用单例模式可以使得 bitmap 的缓存比 activity 存在的时间长。如果我们在 activity 中创建 `ImageLoader`，这个 `ImageLoader` 有可能会在每次旋转设备的时候都被重新创建。这可能会导致抖动。

#### 举一个 LRU cache 的例子

Volley 工具箱中提供了一种通过 `DiskBasedCache` 类实现的标准缓存。这个类能够缓存文件到磁盘的指定目录。但是为了使用 `ImageLoader`，我们应该提供一个自定义的内存 LRC bitmap 缓存，这个缓存实现了 `ImageLoader.ImageCache` 接口。我们可能想把缓存设置成一个单例。关于更多的有关内容，请参考[建立请求队列](request.html).

下面是一个内存 `LruBitmapCache` 类的实现示例。它继承 [LruCache](http://developer.android.com/reference/android/support/v4/util/LruCache.html) 类并实现了 `ImageLoader.ImageCache` 接口：

```java
import android.graphics.Bitmap;
import android.support.v4.util.LruCache;
import android.util.DisplayMetrics;
import com.android.volley.toolbox.ImageLoader.ImageCache;

public class LruBitmapCache extends LruCache<String, Bitmap>
        implements ImageCache {

    public LruBitmapCache(int maxSize) {
        super(maxSize);
    }

    public LruBitmapCache(Context ctx) {
        this(getCacheSize(ctx));
    }

    @Override
    protected int sizeOf(String key, Bitmap value) {
        return value.getRowBytes() * value.getHeight();
    }

    @Override
    public Bitmap getBitmap(String url) {
        return get(url);
    }

    @Override
    public void putBitmap(String url, Bitmap bitmap) {
        put(url, bitmap);
    }

    // Returns a cache size equal to approximately three screens worth of images.
    public static int getCacheSize(Context ctx) {
        final DisplayMetrics displayMetrics = ctx.getResources().
                getDisplayMetrics();
        final int screenWidth = displayMetrics.widthPixels;
        final int screenHeight = displayMetrics.heightPixels;
        // 4 bytes per pixel
        final int screenBytes = screenWidth * screenHeight * 4;

        return screenBytes * 3;
    }
}
```

下面是如何实例化一个 `ImageLoader` 来使用这个 cache:

```java
RequestQueue mRequestQueue; // assume this exists.
ImageLoader mImageLoader = new ImageLoader(mRequestQueue, new LruBitmapCache(LruBitmapCache.getCacheSize()));
```

## 请求 JSON

Volley 提供了以下的类用来执行 JSON 请求：

* `JsonArrayRequest` —— 一个为了获取给定 URL 的 [JSONArray](http://developer.android.com/reference/org/json/JSONArray.html) 响应正文的请求。
* `JsonObjectRequest` —— 一个为了获取给定 URL 的 [JSONObject](http://developer.android.com/reference/org/json/JSONObject.html) 响应正文的请求。允许传进一个可选的 [JSONObject](http://developer.android.com/reference/org/json/JSONObject.html) 作为请求正文的一部分。

这两个类都是基于一个公共基类 `JsonRequest`。我们遵循我们在其它请求类型使用的同样的基本模式来使用这些类。如下演示了如果获取一个 JSON feed 并显示到 UI 上：

```java
TextView mTxtDisplay;
ImageView mImageView;
mTxtDisplay = (TextView) findViewById(R.id.txtDisplay);
String url = "http://my-json-feed";

JsonObjectRequest jsObjRequest = new JsonObjectRequest
        (Request.Method.GET, url, null, new Response.Listener() {

    @Override
    public void onResponse(JSONObject response) {
        mTxtDisplay.setText("Response: " + response.toString());
    }
}, new Response.ErrorListener() {

    @Override
    public void onErrorResponse(VolleyError error) {
        // TODO Auto-generated method stub

    }
});

// Access the RequestQueue through your singleton class.
MySingleton.getInstance(this).addToRequestQueue(jsObjRequest);
```

关于基于 [Gson](http://code.google.com/p/google-gson/) 实现一个自定义的 JSON 请求对象，请参考下一节课：[实现一个自定义的请求](request-custom.html)。
