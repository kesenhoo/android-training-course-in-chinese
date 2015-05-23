# 缓存Bitmap

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/displaying-bitmaps/cache-bitmap.html>

将单个Bitmap加载到UI是简单直接的，但是如果我们需要一次性加载大量的图片，事情则会变得复杂起来。在大多数情况下（例如在使用ListView，GridView或ViewPager时），屏幕上的图片和因滑动将要显示的图片的数量通常是没有限制的。

通过循环利用子视图可以缓解内存的使用，垃圾回收器也会释放那些不再需要使用的Bitmap。这些机制都非常好，但是为了保证一个流畅的用户体验，我们希望避免在每次屏幕滑动回来时，都要重复处理那些图片。内存与磁盘缓存通常可以起到辅助作用，允许控件可以快速地重新加载那些处理过的图片。

这一课会介绍在加载多张Bitmap时使用内存缓存与磁盘缓存来提高响应速度与UI流畅度。

## 使用内存缓存(Use a Memory Cache)

内存缓存以花费宝贵的程序内存为前提来快速访问位图。[LruCache](http://developer.android.com/reference/android/util/LruCache.html)类（在API Level 4的Support Library中也可以找到）特别适合用来缓存Bitmaps，它使用一个强引用（strong referenced）的[LinkedHashMap](http://developer.android.com/reference/java/util/LinkedHashMap.html)保存最近引用的对象，并且在缓存超出设置大小的时候剔除（evict）最近最少使用到的对象。

> **Note:** 在过去，一种比较流行的内存缓存实现方法是使用软引用（SoftReference）或弱引用（WeakReference）对Bitmap进行缓存，然而我们并不推荐这样的做法。从Android 2.3 (API Level 9)开始，垃圾回收机制变得更加频繁，这使得释放软（弱）引用的频率也随之增高，导致使用引用的效率降低很多。而且在Android 3.0 (API Level 11)之前，备份的Bitmap会存放在Native Memory中，它不是以可预知的方式被释放的，这样可能导致程序超出它的内存限制而崩溃。

为了给LruCache选择一个合适的大小，需要考虑到下面一些因素：

* 应用剩下了多少可用的内存?
* 多少张图片会同时呈现到屏幕上？有多少图片需要准备好以便马上显示到屏幕？
* 设备的屏幕大小与密度是多少？一个具有特别高密度屏幕（xhdpi）的设备，像Galaxy Nexus会比Nexus S（hdpi）需要一个更大的缓存空间来缓存同样数量的图片。
* Bitmap的尺寸与配置是多少，会花费多少内存？
* 图片被访问的频率如何？是其中一些比另外的访问更加频繁吗？如果是，那么我们可能希望在内存中保存那些最常访问的图片，或者根据访问频率给Bitmap分组，为不同的Bitmap组设置多个LruCache对象。
* 是否可以在缓存图片的质量与数量之间寻找平衡点？某些时候保存大量低质量的Bitmap会非常有用，加载更高质量图片的任务可以交给另外一个后台线程。

通常没有指定的大小或者公式能够适用于所有的情形，我们需要分析实际的使用情况后，提出一个合适的解决方案。缓存太小会导致额外的花销却没有明显的好处，缓存太大同样会导致java.lang.OutOfMemory的异常，并且使得你的程序只留下小部分的内存用来工作（缓存占用太多内存，导致其他操作会因为内存不够而抛出异常）。

下面是一个为Bitmap建立LruCache的示例：

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

> **Note:**在上面的例子中, 有1/8的内存空间被用作缓存。 这意味着在常见的设备上（hdpi），最少大概有4MB的缓存空间（32/8）。如果一个填满图片的GridView控件放置在800x480像素的手机屏幕上，大概会花费1.5MB的缓存空间（800x480x4 bytes），因此缓存的容量大概可以缓存2.5页的图片内容。

当加载Bitmap显示到ImageView 之前，会先从LruCache 中检查是否存在这个Bitmap。如果确实存在，它会立即被用来显示到ImageView上，如果没有找到，会触发一个后台线程去处理显示该Bitmap任务。

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

上面的程序中 `BitmapWorkerTask` 需要把解析好的Bitmap添加到内存缓存中：

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

内存缓存能够提高访问最近用过的Bitmap的速度，但是我们无法保证最近访问过的Bitmap都能够保存在缓存中。像类似GridView等需要大量数据填充的控件很容易就会用尽整个内存缓存。另外，我们的应用可能会被类似打电话等行为而暂停并退到后台，因为后台应用可能会被杀死，那么内存缓存就会被销毁，里面的Bitmap也就不存在了。一旦用户恢复应用的状态，那么应用就需要重新处理那些图片。

磁盘缓存可以用来保存那些已经处理过的Bitmap，它还可以减少那些不再内存缓存中的Bitmap的加载次数。当然从磁盘读取图片会比从内存要慢，而且由于磁盘读取操作时间是不可预期的，读取操作需要在后台线程中处理。

> **Note:**如果图片会被更频繁的访问，使用[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)或许会更加合适，比如在图库应用中。

这一节的范例代码中使用了一个从[Android源码](https://android.googlesource.com/platform/libcore/+/jb-mr2-release/luni/src/main/java/libcore/io/DiskLruCache.java)中剥离出来的`DiskLruCache`。改进过的范例代码在已有内存缓存的基础上增加磁盘缓存的功能。

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

> **Note**:因为初始化磁盘缓存涉及到I/O操作，所以它不应该在主线程中进行。但是这也意味着在初始化完成之前缓存可以被访问。为了解决这个问题，在上面的实现中，有一个锁对象（lock object）来确保在磁盘缓存完成初始化之前，应用无法对它进行读取。

内存缓存的检查是可以在UI线程中进行的，磁盘缓存的检查需要在后台线程中处理。磁盘操作永远都不应该在UI线程中发生。当图片处理完成后，Bitmap需要添加到内存缓存与磁盘缓存中，方便之后的使用。

## 处理配置改变(Handle Configuration Changes)

如果运行时设备配置信息发生改变，例如屏幕方向的改变会导致Android中当前显示的Activity先被销毁然后重启。（关于这一方面的更多信息，请参考[Handling Runtime Changes](http://developer.android.com/guide/topics/resources/runtime-changes.html)）。我们需要在配置改变时避免重新处理所有的图片，这样才能提供给用户一个良好的平滑过度的体验。

幸运的是，在前面介绍使用内存缓存的部分，我们已经知道了如何建立内存缓存。这个缓存可以通过调用[setRetainInstance(true)](http://developer.android.com/reference/android/app/Fragment.html#setRetainInstance(boolean))保留一个[Fragment](http://developer.android.com/reference/android/app/Fragment.html)实例的方法把缓存传递给新的Activity。在这个Activity被重新创建之后，这个保留的Fragment会被重新附着上。这样你就可以访问缓存对象了，从缓存中获取到图片信息并快速的重新显示到ImageView上。

下面是配置改变时使用Fragment来保留LruCache的代码示例：

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

为了测试上面的效果，可以尝试在保留Fragment与没有这样做的情况下旋转屏幕。我们会发现当保留缓存时，从内存缓存中重新绘制几乎没有延迟的现象。 内存缓存中没有的图片可能存储在磁盘缓存中。如果两个缓存中都没有，则图像会像平时正常流程一样被处理。
