# 报告任务执行状态

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/report-status.html>

这章节会演示如何回传IntentService中执行的任务状态与结果给发送方。 例如，回传任务的执行状态给Activity并进行更新UI。推荐的方式是使用[LocalBroadcastManager](http://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html)，这个组件可以限制broadcast intent只在自己的app中进行传递。

## 利用IntentService 发送任务状态

为了在IntentService中向其他组件发送任务状态，首先创建一个Intent并在data字段中包含需要传递的信息。作为一个可选项，还可以给这个Intent添加一个action与data URI。

下一步，通过执行`LocalBroadcastManager.sendBroadcast()` 来发送Intent。Intent被发送到任何有注册接受它的组件中。为了获取到LocalBroadcastManager的实例，可以执行getInstance()。代码示例如下：

```java
public final class Constants {
    ...
    // Defines a custom Intent action
    public static final String BROADCAST_ACTION =
        "com.example.android.threadsample.BROADCAST";
    ...
    // Defines the key for the status "extra" in an Intent
    public static final String EXTENDED_DATA_STATUS =
        "com.example.android.threadsample.STATUS";
    ...
}
public class RSSPullService extends IntentService {
...
    /*
     * Creates a new Intent containing a Uri object
     * BROADCAST_ACTION is a custom Intent action
     */
    Intent localIntent =
            new Intent(Constants.BROADCAST_ACTION)
            // Puts the status into the Intent
            .putExtra(Constants.EXTENDED_DATA_STATUS, status);
    // Broadcasts the Intent to receivers in this app.
    LocalBroadcastManager.getInstance(this).sendBroadcast(localIntent);
...
}
```

<!-- More -->

下一步是在发送任务的组件中接收发送出来的broadcast数据。

## 接收来自IntentService的状态广播

为了接受广播的数据对象，需要使用BroadcastReceiver的子类并实现`BroadcastReceiver.onReceive()` 的方法，这里可以接收LocalBroadcastManager发出的广播数据。

```java
// Broadcast receiver for receiving status updates from the IntentService
private class ResponseReceiver extends BroadcastReceiver
{
    // Prevents instantiation
    private DownloadStateReceiver() {
    }
    // Called when the BroadcastReceiver gets an Intent it's registered to receive
    @
    public void onReceive(Context context, Intent intent) {
...
        /*
         * Handle Intents here.
         */
...
    }
}
```

一旦定义了BroadcastReceiver，也应该定义actions，categories与data用过滤广播。为了实现这些，需要使用[IntentFilter](http://developer.android.com/reference/android/content/IntentFilter.html)。如下所示：

```java
// Class that displays photos
public class DisplayActivity extends FragmentActivity {
    ...
    public void onCreate(Bundle stateBundle) {
        ...
        super.onCreate(stateBundle);
        ...
        // The filter's action is BROADCAST_ACTION
        IntentFilter mStatusIntentFilter = new IntentFilter(
                Constants.BROADCAST_ACTION);

        // Adds a data filter for the HTTP scheme
        mStatusIntentFilter.addDataScheme("http");
        ...
```

为了给系统注册这个BroadcastReceiver和IntentFilter，需要通过LocalBroadcastManager执行registerReceiver()的方法。如下所示：

```java
// Instantiates a new DownloadStateReceiver
DownloadStateReceiver mDownloadStateReceiver =
        new DownloadStateReceiver();
// Registers the DownloadStateReceiver and its intent filters
LocalBroadcastManager.getInstance(this).registerReceiver(
        mDownloadStateReceiver,
        mStatusIntentFilter);
...
```

一个BroadcastReceiver可以处理多种类型的广播数据。每个广播数据都有自己的ACTION。这个功能使得不用定义多个不同的BroadcastReceiver来分别处理不同的ACTION数据。为BroadcastReceiver定义另外一个IntentFilter，只需要创建一个新的IntentFilter并重复执行registerReceiver()即可。例如:

```java
/*
 * Instantiates a new action filter.
 * No data filter is needed.
 */
statusIntentFilter = new IntentFilter(Constants.ACTION_ZOOM_IMAGE);
...
// Registers the receiver with the new filter
LocalBroadcastManager.getInstance(getActivity()).registerReceiver(
        mDownloadStateReceiver,
        mIntentFilter);
```

发送一个广播Intent并不会启动或重启一个Activity。即使是你的app在后台运行，Activity的BroadcastReceiver也可以接收、处理Intent对象。但是这不会迫使你的app进入前台。当你的app不可见时，如果想通知用户一个发生在后台的事件，建议使用[Notification](http://developer.android.com/reference/android/app/Notification.html)。**永远**不要为了响应一个广播Intent而去启动Activity。
