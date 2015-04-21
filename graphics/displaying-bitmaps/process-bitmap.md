# 非UI线程处理Bitmap

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/displaying-bitmaps/process-bitmap.html>

在上一课中介绍了一系列的<a href="http://developer.android.com/reference/android/graphics/BitmapFactory.html#decodeByteArray(byte[], int, int, android.graphics.BitmapFactory.Options">BitmapFactory.decode*</a>方法，当图片来源是网络或者是存储卡时（或者是任何不在内存中的形式），这些方法都不应该在UI 线程中执行。因为在上述情况下加载数据时，其执行时间是不可估计的，它依赖于许多因素（从网络或者存储卡读取数据的速度，图片的大小，CPU的速度等）。如果其中任何一个子操作阻塞了UI线程，系统都会容易出现应用无响应的错误。

这一节课会介绍如何使用AsyncTask在后台线程中处理Bitmap并且演示如何处理并发（concurrency）的问题。

## 使用AsyncTask(Use a AsyncTask)

[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 类提供了一个在后台线程执行一些操作的简单方法，它还可以把后台的执行结果呈现到UI线程中。下面是一个加载大图的示例：

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

为[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)使用[WeakReference](http://developer.android.com/reference/java/lang/ref/WeakReference.html)确保了AsyncTask所引用的资源可以被垃圾回收器回收。由于当任务结束时不能确保[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)仍然存在，因此我们必须在`onPostExecute()`里面对引用进行检查。该ImageView在有些情况下可能已经不存在了，例如，在任务结束之前用户使用了回退操作，或者是配置发生了改变（如旋转屏幕等）。

开始异步加载位图，只需要创建一个新的任务并执行它即可:

```java
public void loadBitmap(int resId, ImageView imageView) {
    BitmapWorkerTask task = new BitmapWorkerTask(imageView);
    task.execute(resId);
}
```

## 处理并发问题(Handle Concurrency)

通常类似ListView与GridView等视图控件在使用上面演示的AsyncTask 方法时，会同时带来并发的问题。首先为了更高的效率，ListView与GridView的子Item视图会在用户滑动屏幕时被循环使用。如果每一个子视图都触发一个AsyncTask，那么就无法确保关联的视图在结束任务时，分配的视图已经进入循环队列中，给另外一个子视图进行重用。而且， 无法确保所有的异步任务的完成顺序和他们本身的启动顺序保持一致。

[Multithreading for Performance](http://android-developers.blogspot.com/2010/07/multithreading-for-performance.html) 这篇博文更进一步的讨论了如何处理并发问题，并且提供了一种解决方法：ImageView保存最近使用的AsyncTask的引用，这个引用可以在任务完成的时候再次读取检查。使用这种方式, 就可以对前面提到的AsyncTask进行扩展。

创建一个专用的[Drawable](http://developer.android.com/reference/android/graphics/drawable/Drawable.html)的子类来储存任务的引用。在这种情况下，我们使用了一个[BitmapDrawable](http://developer.android.com/reference/android/graphics/drawable/BitmapDrawable.html)，在任务执行的过程中，一个占位图片会显示在[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)中:

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

在执行[BitmapWorkerTask](http://developer.android.com/training/displaying-bitmaps/process-bitmap.html#BitmapWorkerTask) 之前，你需要创建一个AsyncDrawable并且将它绑定到目标控件ImageView中：

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

在上面的代码示例中，`cancelPotentialWork` 方法检查是否有另一个正在执行的任务与该ImageView关联了起来，如果的确是这样，它通过执行`cancel()`方法来取消另一个任务。在少数情况下, 新创建的任务数据可能会与已经存在的任务相吻合，这样的话就不需要进行下一步动作了。下面是 `cancelPotentialWork`方法的实现 。

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

在上面的代码中有一个辅助方法：`getBitmapWorkerTask()`，它被用作检索AsyncTask是否已经被分配到指定的ImageView:

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

最后一步是在BitmapWorkerTask的`onPostExecute()` 方法里面做更新操作:

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

这个方法不仅仅适用于ListView与GridView控件，在那些需要循环利用子视图的控件中同样适用：只需要在设置图片到ImageView的地方调用 `loadBitmap`方法。例如，在GridView 中实现这个方法可以在 getView()中调用。
