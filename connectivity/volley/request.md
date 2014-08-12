# 创建标准的网络请求(Making a Standard Request)

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/request.html>

这一课会介绍如何使用Volley支持的常用请求类型：

* `StringRequest`。指定一个URL并在相应回调中接受一个原始的raw string数据。请参考前一课的示例。
* `ImageRequest`。指定一个URL并在相应回调中接受一个image。
* `JsonObjectRequest`与`JsonArrayRequest` (均为`JsonRequest`的子类)。指定一个URL并在相应回调中获取到一个JSON对象或者JSON数组。

如果你需要的是上面演示的请求类型，那么你应该不需要自己实现一个自定义的请求。这节课会演示如何使用那些标准的请求类型。关于如何实现自定义的请求，请看下一课：[实现自定义的请求](request-costom.html)。

## 1)Request an Image

Volley为请求图片提供了如下的类。这些类依次有着依赖关系，用来支持在不同的层级进行图片处理：

* `ImageRequest` - 一个封装好的，用来处理URL请求图片并且返回一张decode好的bitmap的类。它同样提供了一些简便的接口方法，例如指定一个大小进行重新裁剪。它的主要好处是Volley回确保类似decode，resize等耗时的操作执行在工作线程中。

* `ImageLoader` - 一个用来处理加载与缓存从网络上获取到的图片的帮助类。ImageLoader是管理协调大量的ImageRequest的类。例如，在ListView中需要显示大量缩略图的时候。ImageLoader为通常的Volley cache提供了更加前瞻的内存缓存，这个缓存对于防止图片抖动非常有用。。这还使得能够在避免阻挡或者延迟主线程的前提下在缓存中能够被Hit到。ImageLoader还能够实现响应联合Coalescing，每一个响应回调里面都可以设置bitmap到view上面。联合Coalescing使得能够同时提交多个响应，这提升了性能。

* `NetworkImageView` - 在ImageLoader的基础上建立，替换ImageView进行使用。对于需要对ImageView设置网络图片的情况下使用很有效。NetworkImageView同样可以在view被detached的时候取消pending的请求。

### 1.1)Use ImageRequest

下面是一个使用ImageRequest的示例。它会获取指定URL的image病显示到app上。里面演示的RequestQueue是通过上一课提到的单例类实现的。

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

### 1.2)Use ImageLoader and NetworkImageView

你可以使用ImageLoader与NetworkImageView用来处理类似ListView等大量显示图片的情况。在你的layout XML文件中，你可以使用NetworkImageView来替代通常的ImageView， 例如:

```xml
<com.android.volley.toolbox.NetworkImageView
        android:id="@+id/networkImageView"
        android:layout_width="150dp"
        android:layout_height="170dp"
        android:layout_centerHorizontal="true" />
```

你可以使用ImageLoader来显示一张图片，例如：

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

然而，如果你要做得是为ImageView进行图片设置，你可以使用NetworkImageView来实现，例如：

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

上面的代码是通过前一节课的单例模式来实现访问到RequestQueue与ImageLoader的。之所以这样做得原因是：对于ImageLoader(一个用来处理加载与缓存图片的帮助类)来说，单例模式可以避免旋转所带来的抖动。使用单例模式可以使得bitmap的缓存与activity的生命周期无关。如果你在activity中创建ImageLoader，这个ImageLoader有可能会在手机进行旋转的时候被重新创建。这可能会导致抖动。

### 1.3)Example LRU cache

Volley工具箱中提供了通过DiskBasedCache实现的一种标准缓存。这个类能够缓存文件到磁盘的制定目录。但是为了使用ImageLoader，你应该提供一个自定义的内存LRC缓存，这个缓存需要实现`ImageLoader.ImageCache`的接口。你可能想把你的缓存设置成一个单例。关于更多的有关内容，请参考[建立请求队列Setting Up a RequestQueue](request.html).

下面是一个内存LRU Cache的实例。它继承自LruCache并实现了ImageLoader.ImageCache的接口：

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

下面是如何初始化ImageLoader并使用cache的实例:

```java
RequestQueue mRequestQueue; // assume this exists.
ImageLoader mImageLoader = new ImageLoader(mRequestQueue, new LruBitmapCache(LruBitmapCache.getCacheSize()));
```

## 2)Request JSON

Volley提供了以下的类用来执行JSON请求：

* `JsonArrayRequest` - 一个为了获取JSONArray返回数据的请求。
* `JsonObjectRequest` - 一个为了获取JSONObject返回数据的请求。允许把一个JSONObject作为请求参数。

这两个类都是继承自JsonRequest的。你可以使用类似的方法来处理这两种类型的请求。如下演示了如果获取一个JSON feed并显示到UI上：

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

关于基于[Gson](http://code.google.com/p/google-gson/)实现一个自定义的JSON请求对象，请参考下一节课：[实现一个自定义的请求Implementing a Custom Request](request-custom.html).
