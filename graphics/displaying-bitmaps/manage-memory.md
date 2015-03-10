# 管理Bitmap的内存占用

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/displaying-bitmaps/manage-memory.html>

作为缓存Bitmaps的进一步延伸, 为了促进GC与bitmap的重用，你还有一些特定的事情可以做. 推荐的策略会根据Android的版本不同而有所差异. [DisplayingBitmaps](http://developer.android.com/downloads/samples/DisplayingBitmaps.zip)的示例程序会演示如何设计你的程序使得能够在不同的Android平台上高效的运行.

为了给这节课奠定基础，我们首先要知道Android管理bitmap memory的演变进程:

* 在Android 2.2 (API level 8)以及之前, 当GC发生时, 你的应用的线程是会stopped的. 这导致了一个滞后，它会降低效率. **在Android 2.3上，添加了并发GC的机制, 这意味着在一个bitmap不再被引用到之后，内存会被立即回收.**
* 在Android 2.3.3 (API level 10)以及之前, 一个bitmap的像素级数据是存放在native内存中的. 这些数据与bitmap本身是隔离的, bitmap本身是被存放在Dalvik heap中。在native内存中的pixel数据的释放是不可预测的，这意味着有可能导致一个程序容易超过它的内存限制并Crash。 **自Android 3.0 (API Level 11)起, pixel数据则是与bitmap本身一起存放在dalvik heap中。**

下面会介绍如何在不同的Android版本上优化bitmap内存使用。

<!-- more -->

## 在Android 2.3.3及以下版本管理内存(Manage Memory on Android 2.3.3 and Lower)
在Android 2.3.3 (API level 10) 以及更低版本上，推荐使用<a href="http://developer.android.com/reference/android/graphics/Bitmap.html#recycle()">recycle()</a>. 如果在你的程序中显示了大量的bitmap数据，你很可能会遇到[OutOfMemoryError](http://developer.android.com/reference/java/lang/OutOfMemoryError.html)错误. <a href="http://developer.android.com/reference/android/graphics/Bitmap.html#recycle()">recycle()</a>方法可以使得程序尽快的释放内存.
> **Caution:**只有你确保这个bitmap不再需要用到的时候才应该使用recycle(). 如果你执行recycle()，然后尝试绘制这个bitmap, 你将得到错误:`"Canvas: trying to use a recycled bitmap"`.

下面的代码片段演示了使用recycle()的例子. 它使用了引用计数的方法(`mDisplayRefCount` 与 `mCacheRefCount`)来追踪一个bitmap目前是否有被显示或者是在缓存中. 当下面条件满足时回收bitmap:

* `mDisplayRefCount` 与 `mCacheRefCount` 的引用计数均为 0.
* bitmap不为`null`, 并且它还没有被回收.

```java
private int mCacheRefCount = 0;
private int mDisplayRefCount = 0;
...
// Notify the drawable that the displayed state has changed.
// Keep a count to determine when the drawable is no longer displayed.
public void setIsDisplayed(boolean isDisplayed) {
    synchronized (this) {
        if (isDisplayed) {
            mDisplayRefCount++;
            mHasBeenDisplayed = true;
        } else {
            mDisplayRefCount--;
        }
    }
    // Check to see if recycle() can be called.
    checkState();
}

// Notify the drawable that the cache state has changed.
// Keep a count to determine when the drawable is no longer being cached.
public void setIsCached(boolean isCached) {
    synchronized (this) {
        if (isCached) {
            mCacheRefCount++;
        } else {
            mCacheRefCount--;
        }
    }
    // Check to see if recycle() can be called.
    checkState();
}

private synchronized void checkState() {
    // If the drawable cache and display ref counts = 0, and this drawable
    // has been displayed, then recycle.
    if (mCacheRefCount <= 0 && mDisplayRefCount <= 0 && mHasBeenDisplayed
            && hasValidBitmap()) {
        getBitmap().recycle();
    }
}

private synchronized boolean hasValidBitmap() {
    Bitmap bitmap = getBitmap();
    return bitmap != null && !bitmap.isRecycled();
}
```

## 在Android 3.0及以上版本管理内存(Manage Memory on Android 3.0 and Higher)
在Android 3.0 (API Level 11) 引进了[BitmapFactory.Options.inBitmap](http://developer.android.com/reference/android/graphics/BitmapFactory.Options.html#inBitmap). 如果这个值被设置了，decode方法会在加载内容的时候去重用已经存在的bitmap. 这意味着bitmap的内存是被重新利用的，这样可以提升性能, 并且减少了内存的分配与回收。然而，使用[inBitmap](http://developer.android.com/reference/android/graphics/BitmapFactory.Options.html#inBitmap)有一些限制。特别是在Android 4.4 (API level 19)之前，只支持同等大小的位图。详情请查看[inBitmap文档](http://developer.android.com/reference/android/graphics/BitmapFactory.Options.html#inBitmap).

### 保存bitmap供以后使用(Save a bitmap for later use)
下面演示了一个已经存在的bitmap是如何被存放起来以便后续使用的. 当一个应用运行在Android 3.0或者更高的平台上并且bitmap从LruCache中移除时, bitmap的一个软引用会被存放在[Hashset](http://developer.android.com/reference/java/util/HashSet.html)中，这样便于之后可能被[inBitmap](http://developer.android.com/reference/android/graphics/BitmapFactory.Options.html#inBitmap)重用:

```java
Set<SoftReference<Bitmap>> mReusableBitmaps;
private LruCache<String, BitmapDrawable> mMemoryCache;

// If you're running on Honeycomb or newer, create a
// synchronized HashSet of references to reusable bitmaps.
if (Utils.hasHoneycomb()) {
    mReusableBitmaps =
            Collections.synchronizedSet(new HashSet<SoftReference<Bitmap>>());
}

mMemoryCache = new LruCache<String, BitmapDrawable>(mCacheParams.memCacheSize) {

    // Notify the removed entry that is no longer being cached.
    @Override
    protected void entryRemoved(boolean evicted, String key,
            BitmapDrawable oldValue, BitmapDrawable newValue) {
        if (RecyclingBitmapDrawable.class.isInstance(oldValue)) {
            // The removed entry is a recycling drawable, so notify it
            // that it has been removed from the memory cache.
            ((RecyclingBitmapDrawable) oldValue).setIsCached(false);
        } else {
            // The removed entry is a standard BitmapDrawable.
            if (Utils.hasHoneycomb()) {
                // We're running on Honeycomb or later, so add the bitmap
                // to a SoftReference set for possible use with inBitmap later.
                mReusableBitmaps.add
                        (new SoftReference<Bitmap>(oldValue.getBitmap()));
            }
        }
    }
....
}
```

### 使用已经存在的bitmap(Use an existing bitmap)
在运行的程序中，decoder方法会去做检查看是否有可用的bitmap. 例如:

```java
public static Bitmap decodeSampledBitmapFromFile(String filename,
        int reqWidth, int reqHeight, ImageCache cache) {

    final BitmapFactory.Options options = new BitmapFactory.Options();
    ...
    BitmapFactory.decodeFile(filename, options);
    ...

    // If we're running on Honeycomb or newer, try to use inBitmap.
    if (Utils.hasHoneycomb()) {
        addInBitmapOptions(options, cache);
    }
    ...
    return BitmapFactory.decodeFile(filename, options);
}
```

下面的代码演示了上面被执行的`addInBitmapOptions()`方法. 它会为inBitmap查找一个已经存在的bitmap设置为value. 注意这个方法只有在找到合适的值时才会为inBitmap设置一个值(你的代码永远不能假设这个值一定会被找到):

```java
private static void addInBitmapOptions(BitmapFactory.Options options,
        ImageCache cache) {
    // inBitmap only works with mutable bitmaps, so force the decoder to
    // return mutable bitmaps.
    options.inMutable = true;

    if (cache != null) {
        // Try to find a bitmap to use for inBitmap.
        Bitmap inBitmap = cache.getBitmapFromReusableSet(options);

        if (inBitmap != null) {
            // If a suitable bitmap has been found, set it as the value of
            // inBitmap.
            options.inBitmap = inBitmap;
        }
    }
}

// This method iterates through the reusable bitmaps, looking for one
// to use for inBitmap:
protected Bitmap getBitmapFromReusableSet(BitmapFactory.Options options) {
        Bitmap bitmap = null;

    if (mReusableBitmaps != null && !mReusableBitmaps.isEmpty()) {
        synchronized (mReusableBitmaps) {
            final Iterator<SoftReference<Bitmap>> iterator
                    = mReusableBitmaps.iterator();
            Bitmap item;

            while (iterator.hasNext()) {
                item = iterator.next().get();

                if (null != item && item.isMutable()) {
                    // Check to see it the item can be used for inBitmap.
                    if (canUseForInBitmap(item, options)) {
                        bitmap = item;

                        // Remove from reusable set so it can't be used again.
                        iterator.remove();
                        break;
                    }
                } else {
                    // Remove from the set if the reference has been cleared.
                    iterator.remove();
                }
            }
        }
    }
    return bitmap;
}
```

最后，下面这个方法去判断候选bitmap是否满足inBitmap的大小条件:

```java
static boolean canUseForInBitmap(
        Bitmap candidate, BitmapFactory.Options targetOptions) {

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        // From Android 4.4 (KitKat) onward we can re-use if the byte size of
        // the new bitmap is smaller than the reusable bitmap candidate
        // allocation byte count.
        int width = targetOptions.outWidth / targetOptions.inSampleSize;
        int height = targetOptions.outHeight / targetOptions.inSampleSize;
        int byteCount = width * height * getBytesPerPixel(candidate.getConfig());
        return byteCount <= candidate.getAllocationByteCount();
    }

    // On earlier versions, the dimensions must match exactly and the inSampleSize must be 1
    return candidate.getWidth() == targetOptions.outWidth
            && candidate.getHeight() == targetOptions.outHeight
            && targetOptions.inSampleSize == 1;
}

/**
 * A helper function to return the byte usage per pixel of a bitmap based on its configuration.
 */
static int getBytesPerPixel(Config config) {
    if (config == Config.ARGB_8888) {
        return 4;
    } else if (config == Config.RGB_565) {
        return 2;
    } else if (config == Config.ARGB_4444) {
        return 2;
    } else if (config == Config.ALPHA_8) {
        return 1;
    }
    return 1;
}
```
