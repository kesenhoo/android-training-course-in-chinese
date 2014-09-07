# Cached Bitmap

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/displaying-bitmaps/cache-bitmap.html>

加载单个Bitmap到UI是简单直接的，但是如果你需要一次加载大量的图片，事情则会变得复杂起来。在大多数情况下(例如在使用ListView,GridView或ViewPager时), 屏幕上的图片和因滑动将要显示的图片的数量通常是没有限制的。

通过循环利用子视图可以抑制内存的使用，GC(garbage collector)也会释放那些不再需要使用的bitmap。这些机制都非常好，但是为了保持一个流畅的用户体验，你想要在屏幕滑回来时避免每次重复处理那些图片。内存与磁盘缓存通常可以起到帮助的作用，允许组件快速的重新加载那些处理过的图片。

这一课会介绍在加载多张位图时使用内存Cache与磁盘Cache来提高反应速度与UI的流畅度。

<!-- more -->

## 使用内存缓存(Use a Memory Cache)
内存缓存以花费宝贵的程序内存为前提来快速访问位图。[LruCache](http://developer.android.com/reference/android/util/LruCache.html) 类(在API Level 4的Support Library中也可以找到) 特别合适用来caching bitmaps，用一个强引用(strong referenced)的 [LinkedHashMap](http://developer.android.com/reference/java/util/LinkedHashMap.html) 来保存最近引用的对象，并且在Cache超出设置大小的时候踢出(evict)最近最少使用到的对象。

> **Note:** 在过去, 一个比较流行的内存缓存的实现方法是使用软引用(SoftReference)或弱引用(WeakReference)bitmap缓存, 然而这是不推荐的。从Android 2.3 (API Level 9) 开始，GC变得更加频繁的去释放soft/weak references，这使得他们就显得效率低下。而且在Android 3.0 (API Level 11)之前，备份的bitmap是存放在native memory 中，它不是以可预知的方式被释放，这样可能导致程序超出它的内存限制而崩溃。

为了给LruCache选择一个合适的大小，有下面一些因素需要考虑到：

* 你的程序剩下了多少可用的内存?
* 多少图片会被一次呈现到屏幕上？有多少图片需要准备好以便马上显示到屏幕？
* 设备的屏幕大小与密度是多少? 一个具有特别高密度屏幕(xhdpi)的设备，像 Galaxy Nexus 会比 Nexus S (hdpi)需要一个更大的Cache来缓存同样数量的图片.
* 位图的尺寸与配置是多少，会花费多少内存？
* 图片被访问的频率如何？是其中一些比另外的访问更加频繁吗？如果是，也许你想要保存那些最常访问的到内存中，或者为不同组别的位图(按访问频率分组)设置多个LruCache 对象。
* 你可以平衡质量与数量吗? 某些时候保存大量低质量的位图会非常有用，在加载更高质量图片的任务则交给另外一个后台线程。

没有指定的大小与公式能够适用与所有的程序，你需要负责分析你的使用情况后提出一个合适的解决方案。一个太小的Cache会导致额外的花销却没有明显的好处，一个太大的Cache同样会导致java.lang.OutOfMemory的异常(Cache占用太多内存，其他活动则会因为内存不够而异常)，并且使得你的程序只留下小部分的内存用来工作。

下面是一个为bitmap建立LruCache 的示例：

```java
private LruCache<String, Bitmap> mMemoryCache;

@Override
protected void onCreate(Bundle savedInstanceState) {
    ...
    // Get max available VM memory, exceeding this amount will throw an
    // OutOfMemory exception. Stored in kilobytes as LruCache takes an
    // int in its constructor.
    final int maxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024);

    // Use 1/8th of the available memory for this memory cache.
    final int cacheSize = maxMemory / 8;

    mMemoryCache = new LruCache<String, Bitmap>(cacheSize) {
        @Override
        protected int sizeOf(String key, Bitmap bitmap) {
            // The cache size will be measured in kilobytes rather than
            // number of items.
            return bitmap.getByteCount() / 1024;
        }
    };
    ...
}

public void addBitmapToMemoryCache(String key, Bitmap bitmap) {
    if (getBitmapFromMemCache(key) == null) {
        mMemoryCache.put(key, bitmap);
    }
}

public Bitmap getBitmapFromMemCache(String key) {
    return mMemoryCache.get(key);
}
```

> **Note:**在上面的例子中, 有1/8的程序内存被作为Cache. 在一个常见的设备上(hdpi)，最小大概有4MB (32/8). 如果一个填满图片的GridView组件放置在800x480像素的手机屏幕上，大概会花费1.5MB (800x480x4 bytes), 因此缓存的容量大概可以缓存2.5页的图片内容.

当加载位图到 ImageView 时，LruCache 会先被检查是否存在这张图片。如果找到有，它会被用来立即更新 ImageView 组件，否则一个后台线程则被触发去处理这张图片。

```java
public void loadBitmap(int resId, ImageView imageView) {
    final String imageKey = String.valueOf(resId);

    final Bitmap bitmap = getBitmapFromMemCache(imageKey);
    if (bitmap != null) {
        mImageView.setImageBitmap(bitmap);
    } else {
        mImageView.setImageResource(R.drawable.image_placeholder);
        BitmapWorkerTask task = new BitmapWorkerTask(mImageView);
        task.execute(resId);
    }
}
```

上面的程序中 [BitmapWorkerTask](http://developer.android.com/training/displaying-bitmaps/process-bitmap.html#BitmapWorkerTask) 也需要做添加到内存Cache中的动作：

```java
class BitmapWorkerTask extends AsyncTask<Integer, Void, Bitmap> {
    ...
    // Decode image in background.
    @Override
    protected Bitmap doInBackground(Integer... params) {
        final Bitmap bitmap = decodeSampledBitmapFromResource(
                getResources(), params[0], 100, 100));
        addBitmapToMemoryCache(String.valueOf(params[0]), bitmap);
        return bitmap;
    }
    ...
}
```

## 使用磁盘缓存(Use a Disk Cache)
内存缓存能够提高访问最近查看过的位图的速度，但是你不能保证这个图片会在Cache中。像类似 GridView 等带有大量数据的组件很容易就填满内存Cache。你的程序可能会被类似Phone call等任务而中断，这样后台程序可能会被杀死，那么内存缓存就会被销毁。一旦用户恢复前面的状态，你的程序就又需要重新处理每个图片。

磁盘缓存可以用来保存那些已经处理好的位图，并且在那些图片在内存缓存中不可用时减少加载的次数。当然从磁盘读取图片会比从内存要慢，而且读取操作需要在后台线程中处理，因为磁盘读取操作是不可预期的。

> **Note:**如果图片被更频繁的访问到，也许使用 [ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html) 会更加的合适，比如在Gallery程序中。

这一节的范例代码中使用了一个从[Android源码](https://android.googlesource.com/platform/libcore/+/jb-mr2-release/luni/src/main/java/libcore/io/DiskLruCache.java)中剥离出来的 `DiskLruCache` 。升级过的范例代码给已有的内存缓存添加了磁盘缓存.

```java
private DiskLruCache mDiskLruCache;
private final Object mDiskCacheLock = new Object();
private boolean mDiskCacheStarting = true;
private static final int DISK_CACHE_SIZE = 1024 * 1024 * 10; // 10MB
private static final String DISK_CACHE_SUBDIR = "thumbnails";

@Override
protected void onCreate(Bundle savedInstanceState) {
    ...
    // Initialize memory cache
    ...
    // Initialize disk cache on background thread
    File cacheDir = getDiskCacheDir(this, DISK_CACHE_SUBDIR);
    new InitDiskCacheTask().execute(cacheDir);
    ...
}

class InitDiskCacheTask extends AsyncTask<File, Void, Void> {
    @Override
    protected Void doInBackground(File... params) {
        synchronized (mDiskCacheLock) {
            File cacheDir = params[0];
            mDiskLruCache = DiskLruCache.open(cacheDir, DISK_CACHE_SIZE);
            mDiskCacheStarting = false; // Finished initialization
            mDiskCacheLock.notifyAll(); // Wake any waiting threads
        }
        return null;
    }
}

class BitmapWorkerTask extends AsyncTask<Integer, Void, Bitmap> {
    ...
    // Decode image in background.
    @Override
    protected Bitmap doInBackground(Integer... params) {
        final String imageKey = String.valueOf(params[0]);

        // Check disk cache in background thread
        Bitmap bitmap = getBitmapFromDiskCache(imageKey);

        if (bitmap == null) { // Not found in disk cache
            // Process as normal
            final Bitmap bitmap = decodeSampledBitmapFromResource(
                    getResources(), params[0], 100, 100));
        }

        // Add final bitmap to caches
        addBitmapToCache(imageKey, bitmap);

        return bitmap;
    }
    ...
}

public void addBitmapToCache(String key, Bitmap bitmap) {
    // Add to memory cache as before
    if (getBitmapFromMemCache(key) == null) {
        mMemoryCache.put(key, bitmap);
    }

    // Also add to disk cache
    synchronized (mDiskCacheLock) {
        if (mDiskLruCache != null && mDiskLruCache.get(key) == null) {
            mDiskLruCache.put(key, bitmap);
        }
    }
}

public Bitmap getBitmapFromDiskCache(String key) {
    synchronized (mDiskCacheLock) {
        // Wait while disk cache is started from background thread
        while (mDiskCacheStarting) {
            try {
                mDiskCacheLock.wait();
            } catch (InterruptedException e) {}
        }
        if (mDiskLruCache != null) {
            return mDiskLruCache.get(key);
        }
    }
    return null;
}

// Creates a unique subdirectory of the designated app cache directory. Tries to use external
// but if not mounted, falls back on internal storage.
public static File getDiskCacheDir(Context context, String uniqueName) {
    // Check if media is mounted or storage is built-in, if so, try and use external cache dir
    // otherwise use internal cache dir
    final String cachePath =
            Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState()) ||
                    !isExternalStorageRemovable() ? getExternalCacheDir(context).getPath() :
                            context.getCacheDir().getPath();

    return new File(cachePath + File.separator + uniqueName);
}
```

> **Note**:初始化磁盘缓存涉及到I/O操作，所以不应该在主线程中进行。但是这也意味着在初始化完成之前缓存可以被访问。为了解决这个问题，在上面的实现中，有一个锁对象(lock object)用来确保在磁盘缓存完成初始化之前，app无法对它进行读取。

内存缓存的检查是可以在UI线程中进行的，磁盘缓存的检查需要在后台线程中处理。磁盘操作永远都不应该在UI线程中发生。当图片处理完成后，最后的位图需要添加到内存缓存与磁盘缓存中，方便之后的使用。

## 处理配置改变(Handle Configuration Changes)
运行时配置改变，例如屏幕方向的改变会导致Android去destory并restart当前运行的Activity。(关于这一行为的更多信息，请参考[Handling Runtime Changes](http://developer.android.com/guide/topics/resources/runtime-changes.html)). 你需要在配置改变时避免重新处理所有的图片，这样才能提供给用户一个良好的平滑过度的体验。

幸运的是，在前面介绍Use a Memory Cache的部分，你已经知道如何建立一个内存缓存。通过调用[setRetainInstance(true)](http://developer.android.com/reference/android/app/Fragment.html#setRetainInstance(boolean))保留一个[Fragment](http://developer.android.com/reference/android/app/Fragment.html)实例, 这个缓存可以通过被保留的Fragment传递给新的Activity实例。在这个activity被recreate之后, 这个保留的 Fragment 会被重新附着上。这样你就可以访问Cache对象，从中获取到图片信息并快速的重新添加到ImageView对象中。

下面是配置改变时使用Fragment来保留LruCache 的示例：

```java
private LruCache<String, Bitmap> mMemoryCache;

@Override
protected void onCreate(Bundle savedInstanceState) {
    ...
    RetainFragment retainFragment =
            RetainFragment.findOrCreateRetainFragment(getFragmentManager());
    mMemoryCache = retainFragment.mRetainedCache;
    if (mMemoryCache == null) {
        mMemoryCache = new LruCache<String, Bitmap>(cacheSize) {
            ... // Initialize cache here as usual
        }
        retainFragment.mRetainedCache = mMemoryCache;
    }
    ...
}

class RetainFragment extends Fragment {
    private static final String TAG = "RetainFragment";
    public LruCache<String, Bitmap> mRetainedCache;

    public RetainFragment() {}

    public static RetainFragment findOrCreateRetainFragment(FragmentManager fm) {
        RetainFragment fragment = (RetainFragment) fm.findFragmentByTag(TAG);
        if (fragment == null) {
            fragment = new RetainFragment();
            fm.beginTransaction().add(fragment, TAG).commit();
        }
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRetainInstance(true);
    }
}
```

为了测试上面的效果，尝试在保留Fragment与没有这样做的情况下旋转屏幕。你会发现当你保留缓存时,从内存缓存中重新绘制几乎没有延迟的现象. 内存缓存中没有的图片可能在存在磁盘缓存中.如果两个缓存中都没有，则图像会像平时一样被处理。
