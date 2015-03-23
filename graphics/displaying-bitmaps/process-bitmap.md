# 非UI线程处理Bitmap

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/displaying-bitmaps/process-bitmap.html>

在上一课中有介绍一系列的[BitmapFactory.decode*](http://developer.android.com/reference/android/graphics/BitmapFactory.html#decodeByteArray(byte[], int, int, android.graphics.BitmapFactory.Options) 方法，当图片来源是网络或者是磁盘时(或者是任何不在内存中的)，这些方法都不应该在UI 线程中执行。在那些情况下加载数据的执行时间是不可估计的，它依赖于许多因素(从网络或者硬盘读取数据的速度, 图片的大小, CPU的速度, etc.)。如果其中任何一个子操作卡住了UI thread, 系统都会容易出现ANR的错误。

这一节课会介绍如何使用 AsyncTask 在后台线程中处理bitmap并且演示如何处理并发(concurrency)的问题。

## 使用AsyncTask(Use a AsyncTask)

[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 类提供了一个简单的方法来在后台线程执行一些操作，并且可以把后台的结果呈现到UI线程。下面是一个加载大图的示例：

```java
class BitmapWorkerTask extends AsyncTask {
    private final WeakReference imageViewReference;
    private int data = 0;

    public BitmapWorkerTask(ImageView imageView) {
        // Use a WeakReference to ensure the ImageView can be garbage collected
        imageViewReference = new WeakReference(imageView);
    }

    // Decode image in background.
    @Override
    protected Bitmap doInBackground(Integer... params) {
        data = params[0];
        return decodeSampledBitmapFromResource(getResources(), data, 100, 100));
    }

    // Once complete, see if ImageView is still around and set bitmap.
    @Override
    protected void onPostExecute(Bitmap bitmap) {
        if (imageViewReference != null && bitmap != null) {
            final ImageView imageView = imageViewReference.get();
            if (imageView != null) {
                imageView.setImageBitmap(bitmap);
            }
        }
    }
}
```

为[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)使用[WeakReference](http://developer.android.com/reference/java/lang/ref/WeakReference.html) 确保了 AsyncTask 所引用的资源可以被GC。因为当任务结束时不能确保 [ImageView](http://developer.android.com/reference/android/widget/ImageView.html) 仍然存在，因此你必须在 onPostExecute() 里面去检查引用。这个ImageView 是有可能已经不存在了，例如，在任务结束之前用户操作回退离开那个Activity或者是设备发生配置改变(如旋转屏幕等)。

开始异步加载位图，只需要创建一个新的任务并执行它即可:

```java
public void loadBitmap(int resId, ImageView imageView) {
    BitmapWorkerTask task = new BitmapWorkerTask(imageView);
    task.execute(resId);
}
```

## 处理并发问题(Handle Concurrency)

通常类似 ListView 与 GridView 等视图组件在使用上面演示的AsyncTask 方法会同时带来另外一个并发的问题。首先为了更高的效率，ListView与GridView的子Item视图会在用户滑动屏幕时被循环使用。如果每一个子视图都触发一个AsyncTask，那么就无法确保当前视图在结束task时，分配的视图已经进入循环队列中给另外一个子视图进行重用。而且， 无法确保所有的异步任务的完成顺序和他们本身的启动顺序保持一致。

[Multithreading for Performance](http://android-developers.blogspot.com/2010/07/multithreading-for-performance.html) 这篇博文更进一步的讨论了如何处理并发问题并且提供了一种解决方法：ImageView保存最近使用的AsyncTask的引用，这个引用可以在任务完成的时候再次读取检查。使用这种方式, 前面提到的AsyncTask 就可以扩展出一个相近的模型。创建一个专用的 Drawable 子类来保存一个可以回到当前工作任务的引用。在这种情况下，BitmapDrawable 被用来作为占位图片，它可以在任务结束时显示到ImageView中。

创建一个专用的[Drawable](http://developer.android.com/reference/android/graphics/drawable/Drawable.html)的子类来储存返回工作任务的引用。在这种情况下，当任务完成时[BitmapDrawable](http://developer.android.com/reference/android/graphics/drawable/BitmapDrawable.html)会被使用，placeholder image才会在[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)中被显示:

```java
static class AsyncDrawable extends BitmapDrawable {
    private final WeakReference bitmapWorkerTaskReference;

    public AsyncDrawable(Resources res, Bitmap bitmap,
            BitmapWorkerTask bitmapWorkerTask) {
        super(res, bitmap);
        bitmapWorkerTaskReference =
            new WeakReference(bitmapWorkerTask);
    }

    public BitmapWorkerTask getBitmapWorkerTask() {
        return bitmapWorkerTaskReference.get();
    }
}
```

在执行[BitmapWorkerTask](http://developer.android.com/training/displaying-bitmaps/process-bitmap.html#BitmapWorkerTask) 之前，你需要创建一个 AsyncDrawable 并且绑定它到目标组件 ImageView 中：

```java
public void loadBitmap(int resId, ImageView imageView) {
    if (cancelPotentialWork(resId, imageView)) {
        final BitmapWorkerTask task = new BitmapWorkerTask(imageView);
        final AsyncDrawable asyncDrawable =
                new AsyncDrawable(getResources(), mPlaceHolderBitmap, task);
        imageView.setImageDrawable(asyncDrawable);
        task.execute(resId);
    }
}
```

在上面的代码示例中，`cancelPotentialWork` 方法检查确保了另外一个在ImageView中运行的任务得以取消。如果是这样，它通过执行 cancel() 方法来取消之前的一个任务. 在小部分情况下, New出来的任务有可能已经存在，这样就不需要执行这个任务了。下面演示了如何实现一个 `cancelPotentialWork` 。

```java
public static boolean cancelPotentialWork(int data, ImageView imageView) {
    final BitmapWorkerTask bitmapWorkerTask = getBitmapWorkerTask(imageView);

    if (bitmapWorkerTask != null) {
        final int bitmapData = bitmapWorkerTask.data;
        if (bitmapData == 0 || bitmapData != data) {
            // Cancel previous task
            bitmapWorkerTask.cancel(true);
        } else {
            // The same work is already in progress
            return false;
        }
    }
    // No task associated with the ImageView, or an existing task was cancelled
    return true;
}
```

在上面的代码中有一个帮助方法， `getBitmapWorkerTask()`, 被用作检索AsyncTask是否已经被分配到指定的 ImageView:

```java
private static BitmapWorkerTask getBitmapWorkerTask(ImageView imageView) {
   if (imageView != null) {
       final Drawable drawable = imageView.getDrawable();
       if (drawable instanceof AsyncDrawable) {
           final AsyncDrawable asyncDrawable = (AsyncDrawable) drawable;
           return asyncDrawable.getBitmapWorkerTask();
       }
    }
    return null;
}
```

最后一步是在BitmapWorkerTask 的`onPostExecute()` 方法里面做更新操作:

```java
class BitmapWorkerTask extends AsyncTask {
    ...

    @Override
    protected void onPostExecute(Bitmap bitmap) {
        if (isCancelled()) {
            bitmap = null;
        }

        if (imageViewReference != null && bitmap != null) {
            final ImageView imageView = imageViewReference.get();
            final BitmapWorkerTask bitmapWorkerTask =
                    getBitmapWorkerTask(imageView);
            if (this == bitmapWorkerTask && imageView != null) {
                imageView.setImageBitmap(bitmap);
            }
        }
    }
}
```

这个方法不仅仅适用于 ListView 与 GridView 组件，在那些需要循环利用子视图的组件中同样适用。只需要在设置图片到ImageView的地方调用 `loadBitmap` 方法。例如，在GridView 中实现这个方法会是在 getView() 方法里面调用。
