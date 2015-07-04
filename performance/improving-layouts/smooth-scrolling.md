# 使得ListView滑动顺畅

> 编写:[allenlsy](https://github.com/allenlsy) - 原文:<http://developer.android.com/training/improving-layouts/smooth-scrolling.html>

保持程序流畅的关键，是让主线程（UI 线程）不要进行大量运算。你要确保在其他线程执行磁盘读写、网络读写或是 SQL 操作等。为了测试你的应用的状态，你可以启用 [StrictMode](http://developer.android.com/reference/android/os/StrictMode.html)。

## 使用后台线程

你应该把主线程中的耗时间的操作，提取到一个后台线程（也叫做“worker thread工作线程”）中，使得主线程只关注 UI 绘画。很多时候，使用 [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 是一个简单的在主线程以外进行操作的方法。系统会自动把`execute()`的请求放入队列中并线性调用执行。这个行为是全局的，这意味着你不需要考虑自己定义线程池的事情。

在下面的例子中，一个 AsyncTask 被用于在后台线程载入图片，并在载入完成后把图片显示到 UI  上。当图片正在载入时，它还会显示一个进度提示。

```java
// Using an AsyncTask to load the slow images in a background thread
new AsyncTask<ViewHolder, Void, Bitmap>() {
    private ViewHolder v;

    @Override
    protected Bitmap doInBackground(ViewHolder... params) {
        v = params[0];
        return mFakeImageLoader.getImage();
    }

    @Override
    protected void onPostExecute(Bitmap result) {
        super.onPostExecute(result);
        if (v.position == position) {
            // If this item hasn't been recycled already, hide the
            // progress and set and show the image
            v.progress.setVisibility(View.GONE);
            v.icon.setVisibility(View.VISIBLE);
            v.icon.setImageBitmap(result);
        }
    }
}.execute(holder);
```

从 Android 3.0 (API level 11) 开始, AsyncTask 有个新特性，那就是它可以在多个 CPU 核上运行。你可以调用 `executeOnExecutor()`而不是`execute()`，前者可以根据CPU的核心数来触发多个任务同时进行。

## 在 ViewHolder 中填入视图对象

你的代码可能在 ListView 滑动时经常使用 `findViewById()`，这样会降低性能。即使是 Adapter 返回一个用于回收的 inflate 后的视图，你仍然需要查看这个元素并更新它。避免频繁调用 `findViewById()` 的方法之一，就是使用 ViewHolder（视图占位符）的设计模式。

一个 ViewHolder 对象存储了他的标签下的每个视图。这样你不用频繁查找这个元素。第一，你需要创建一个类来存储你会用到的视图。比如：

```java
static class ViewHolder {
  TextView text;
  TextView timestamp;
  ImageView icon;
  ProgressBar progress;
  int position;
}
```

然后，在 Layout 的类中生成一个 ViewHolder 对象：

```java
ViewHolder holder = new ViewHolder();
holder.icon = (ImageView) convertView.findViewById(R.id.listitem_image);
holder.text = (TextView) convertView.findViewById(R.id.listitem_text);
holder.timestamp = (TextView) convertView.findViewById(R.id.listitem_timestamp);
holder.progress = (ProgressBar) convertView.findViewById(R.id.progress_spinner);
convertView.setTag(holder);
```

这样你就可以轻松获取每个视图，而不是使用 `findViewById()` 来不断查找子视图，节省了宝贵的运算时间。
