# 避免出现程序无响应ANR(Keeping Your App Responsive)

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/articles/perf-anr.html>

可能你写的代码在性能测试上表现良好，但是你的应用仍然有时候会反应迟缓(sluggish)，停顿(hang)或者长时间卡死(frezze)，或者是应用处理输入的数据花费时间过长。对于你的应用来说最槽糕的事情是出现"程序无响应(Application Not Responding)" (ANR)的警示框。

在Android中，系统通过显示ANR警示框来保护程序的长时间无响应。对话框如下：

![anr](anr.png)

此时，你的应用已经经历过一段时间的无法响应了，因此系统提供用户可以退出应用的选择。为你的程序提供良好的响应性是至关重要的，这样才能够避免系统为用户显示ANR的警示框。

这节课描述了Android系统是如何判断一个应用不可响应的。这节课还会提供程序编写的指导原则，确保你的程序保持响应性。

## 是什么导致了ANR?(What Triggers ANR?)

通常来说，系统会在程序无法响应用户的输入事件时显示ANR。例如，如果一个程序在UI线程执行I/O操作(通常是网络请求或者是文件读写)，这样系统就无法处理用户的输入事件。或者是应用在UI线程花费了太多的时间用来建立一个复杂的在内存中的数据结构，又或者是在一个游戏程序的UI线程中执行了一个复杂耗时的计算移动的操作。确保那些计算操作高效是很重要的，不过即使是最高效的代码也是需要花时间执行的。

**对于你的应用中任何可能长时间执行的操作，你都不应该执行在UI线程**。你可以创建一个工作线程，把那些操作都执行在工作线程中。这确保了UI线程(这个线程会负责处理UI事件) 能够顺利执行，也预防了系统因代码僵死而崩溃。因为UI线程是和类级别相关联的，你可以把相应性作为一个类级别(class-level)的问题(相比来说，代码性能则属于方法级别(method-level)的问题)

在Android中，程序的响应性是由Activity Manager与Window Manager系统服务来负责监控的。当系统监测到下面的条件之一时会显示ANR的对话框:

* 对输入事件(例如硬件点击或者屏幕触摸事件)，5秒内都无响应。
* BroadReceiver不能够在10秒内结束接收到任务。

## 如何避免ANRs(How to Avoid ANRs)

Android程序通常是执行在默认的UI线程(也就是main线程)中的。这意味着在UI线程中执行的任何长时间的操作都可能触发ANR，因为程序没有给自己处理输入事件或者broadcast事件的机会。

因此，任何执行在UI线程的方法都应该尽可能的简短快速。特别是，在activity的生命周期的关键方法`onCreate()`与`onResume()`方法中应该尽可能的做比较少的事情。类似网络或者DB操作等可能长时间执行的操作，或者是类似调整bitmap大小等需要长时间计算的操作，都应该执行在工作线程中。(在DB操作中，可以通过异步的网络请求)。

为了执行一个长时间的耗时操作而创建一个工作线程最方便高效的方式是使用`AsyncTask`。只需要继承AsyncTask并实现`doInBackground()`方法来执行任务即可。为了把任务执行的进度呈现给用户，你可以执行`publishProgress()`方法，这个方法会触发`onProgressUpdate()`的回调方法。在`onProgressUpdate()`的回调方法中(它执行在UI线程)，你可以执行通知用户进度的操作，例如：

```java
private class DownloadFilesTask extends AsyncTask<URL, Integer, Long> {
    // Do the long-running work in here
    protected Long doInBackground(URL... urls) {
        int count = urls.length;
        long totalSize = 0;
        for (int i = 0; i < count; i++) {
            totalSize += Downloader.downloadFile(urls[i]);
            publishProgress((int) ((i / (float) count) * 100));
            // Escape early if cancel() is called
            if (isCancelled()) break;
        }
        return totalSize;
    }

    // This is called each time you call publishProgress()
    protected void onProgressUpdate(Integer... progress) {
        setProgressPercent(progress[0]);
    }

    // This is called when doInBackground() is finished
    protected void onPostExecute(Long result) {
        showNotification("Downloaded " + result + " bytes");
    }
}
```

为了能够执行这个工作线程，只需要创建一个实例并执行`execute()`:

```java
new DownloadFilesTask().execute(url1, url2, url3);
```

相比起AsycnTask来说，创建自己的线程或者HandlerThread稍微复杂一点。如果你想这样做，**你应该通过`Process.setThreadPriority()`并传递`THREAD_PRIORITY_BACKGROUND`来设置线程的优先级为"background"。**如果你不通过这个方式来给线程设置一个低的优先级，那么这个线程仍然会使得你的应用显得卡顿，因为这个线程默认与UI线程有着同样的优先级。

如果你实现了Thread或者HandlerThread，请确保你的UI线程不会因为等待工作线程的某个任务而去执行Thread.wait()或者Thread.sleep()。UI线程不应该去等待工作线程完成某个任务，你的UI线程应该提供一个Handler给其他工作线程，这样工作线程能够通过这个Handler在任务结束的时候通知UI线程。使用这样的方式来设计你的应用程序可以使得你的程序UI线程保持响应性，以此来避免ANR。

BroadcastReceiver有特定执行时间的限制说明了broadcast receivers应该做的是：简短快速的任务，避免执行费时的操作，例如保存数据或者注册一个Notification。正如在UI线程中执行的方法一样，程序应该避免在broadcast receiver中执行费时的长任务。但不是采用通过工作线程来执行复杂的任务的方式，你的程序应该启动一个IntentService来响应intent broadcast的长时间任务。

> **Tip:** 你可以使用StrictMode来帮助寻找因为不小心加入到UI线程的潜在的长时间执行的操作，例如网络或者DB相关的任务。

## 增加响应性(Reinforce Responsiveness)

通常来说，100ms - 200ms是用户能够察觉到卡顿的上限。这样的话，下面有一些避免ANR的技巧：

* 如果你的程序需要响应正在后台加载的任务，在你的UI中可以显示ProgressBar来显示进度。
* 对游戏程序，在工作线程执行计算的任务。
* 如果你的程序在启动阶段有一个耗时的初始化操作，可以考虑显示一个闪屏，要么尽快的显示主界面，然后马上显示一个加载的对话框，异步加载数据。无论哪种情况，你都应该显示一个进度信息，以免用户感觉程序有卡顿的情况。
* 使用性能测试工具，例如Systrace与Traceview来判断程序中影响响应性的瓶颈。

