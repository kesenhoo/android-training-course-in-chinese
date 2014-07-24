> 编写:[kesenhoo](https://github.com/kesenhoo)，校对:

> 原文:<http://developer.android.com/training/displaying-bitmaps/manage-bitmap-memory.html>

# 管理Bitmap的内存占用

作为缓存Bitmaps的进一步延伸, 为了促进GC与bitmap的重用，你还有一些特定的事情可以做. 推荐的策略会根据Android的版本不同而有所差异. [BitmapFun](http://developer.android.com/shareables/training/BitmapFun.zip)的示例程序会演示如何设计你的程序使得能够在不同的Android平台上高效的运行.

我们首先要知道Android管理bitmap memory的演变进程:

* 在Android 2.2 (API level 8)以及之前, 当GC发生时, 你的应用的线程是会stopped的. 这导致了一个滞后，它会降低效率. **在Android 2.3上，添加了并发GC的机制, 这意味着在一个bitmap不再被引用到之后，内存会被立即reclaimed.**
* 在Android 2.3.3 (API level 10)已经之后, 一个bitmap的像素级数据是存放在native内存中的. 这些数据与bitmap本身是隔离的, bitmap本身是被存放在Dalvik heap中. 在native内存中的pixel数据不是以可以预测的方式去释放的, 这意味着有可能导致一个程序容易超过它的内存限制并Crash. **在Android 3.0 (API Level 11), pixel数据则是与bitmap本身一起存放在dalvik heap中.**

下面会介绍如何在不同的Android版本上优化bitmap内存使用.

<!-- more -->

## Manage Memory on Android 2.3.3 and Lower
在Android 2.3.3 (API level 10) 以及更低版本上，推荐使用[recycle()](http://developer.android.com/reference/android/graphics/Bitmap.html#recycle()). 如果在你的程序中显示了大量的bitmap数据，你很可能会遇到OutOfMemoryError错误. recycle()方法可以使得程序尽快的reclaim memory.
**Caution:**只有你确保这个bitmap不再需要用到的时候才应该使用recycle(). 如果你执行recycle()，然后尝试绘画这个bitmap, 你将得到错误:"Canvas: trying to use a recycled bitmap".

下面的例子演示了使用recycle()的例子. 它使用了引用计数的方法(mDisplayRefCount 与 mCacheRefCount)来追踪一个bitmap目前是否有被显示或者是在缓存中. 当下面条件满足时回收bitmap:

* mDisplayRefCount 与 mCacheRefCount 的引用计数均为 0.
* bitmap不为null, 并且它还没有被回收.

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

## Manage Memory on Android 3.0 and Higher
在Android 3.0 (API Level 11) 介绍了[BitmapFactory.Options.inBitmap](http://developer.android.com/reference/android/graphics/BitmapFactory.Options.html#inBitmap). 如果这个值被设置了，decode方法会在加载内容的时候去reuse已经存在的bitmap. 这意味着bitmap的内存是被reused的，这样可以提升性能, 并且减少了内存的allocation与de-allocation. 在使用inBitmap时有几个注意点(caveats):

* reused的bitmap必须和原数据内容大小一致, 并且是JPEG 或者 PNG 的格式 (或者是某个resource 与 stream).
* reused的bitmap的[configuration](http://developer.android.com/reference/android/graphics/Bitmap.Config.html)值如果有设置，则会覆盖掉[inPreferredConfig](http://developer.android.com/reference/android/graphics/BitmapFactory.Options.html#inPreferredConfig)值.
* 你应该总是使用decode方法返回的bitmap, 因为你不可以假设reusing的bitmap是可用的(例如，大小不对).

### Save a bitmap for later use
下面演示了一个已经存在的bitmap是如何被存放起来以便后续使用的. 当一个应用运行在Android 3.0或者更高的平台上并且bitmap被从LruCache中移除时, bitmap的一个soft reference会被存放在Hashset中，这样便于之后有可能被inBitmap进行reuse:

```java
HashSet<SoftReference<Bitmap>> mReusableBitmaps;
private LruCache<String, BitmapDrawable> mMemoryCache;

// If you're running on Honeycomb or newer, create
// a HashSet of references to reusable bitmaps.
if (Utils.hasHoneycomb()) {
    mReusableBitmaps = new HashSet<SoftReference<Bitmap>>();
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

### Use an existing bitmap
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

下面的代码演示了上面被执行的addInBitmapOptions()方法. 它会为inBitmap查找一个已经存在的bitmap设置为value. 注意这个方法只是去为inBitmap尝试寻找合适的值，但是并不一定能够找到:

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
    return bitmap;
}
```

最后，下面这个方法去判断候选bitmap是否满足inBitmap的大小条件:

```java
private static boolean canUseForInBitmap(
        Bitmap candidate, BitmapFactory.Options targetOptions) {
    int width = targetOptions.outWidth / targetOptions.inSampleSize;
    int height = targetOptions.outHeight / targetOptions.inSampleSize;

    // Returns true if "candidate" can be used for inBitmap re-use with
    // "targetOptions".
    return candidate.getWidth() == width && candidate.getHeight() == height;
}
```
