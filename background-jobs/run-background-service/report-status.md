# 报告任务执行状态

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/report-status.html>

这章节会演示如何回传IntentService中执行的任务状态与结果给发送方。 例如，回传任务的状态给Activity并进行更新UI。推荐的方式是使用[LocalBroadcastManager](http://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html)，这个组件可以限制broadcast Intent只在自己的App中进行传递。

## 利用IntentService 发送任务状态
为了在IntentService中向其他组件发送任务状态，首先创建一个Intent并在data字段中包含需要传递的信息。作为一个可选项，还可以给这个Intent添加一个action与data URI。

下一步，通过执行[LocalBroadcastManager.sendBroadcast()](http://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html#sendBroadcast(android.content.Intent)) )来发送Intent。Intent被发送到任何有注册接受它的组件中。为了获取到LocalBroadcastManager的实例，可以执行getInstance().代码示例如下：

```java
public final class Constants {
    ...
    // 定义一个自定义的Intent动作名
    public static final String BROADCAST_ACTION =
        "com.example.android.threadsample.BROADCAST";
    ...

    // 定义一个附加键名来表示状态用于包装在一个Intent中
    public static final String EXTENDED_DATA_STATUS =
        "com.example.android.threadsample.STATUS";
    ...
}
public class RSSPullService extends IntentService {
    ...
    /*
     * 创建一个新的包含名Uri的对象
     * BROADCAST_ACTION是一个自定义的Intent动作
     *
     */
    Intent localIntent =
            new Intent(Constants.BROADCAST_ACTION)
            // 把status放到Intent中
            .putExtra(Constants.EXTENDED_DATA_STATUS, status);
    // 广播Intent给应用中的接收器
    LocalBroadcastManager.getInstance(this).sendBroadcast(localIntent);
...
}
```

<!-- More -->

下一步是在发送任务的组件中接收发送出来的broadcast数据。

## 接收来自IntentService的状态广播

为了接受广播的数据对象，需要使用BroadcastReceiver的子类并实现[BroadcastReceiver.onReceive()](http://developer.android.com/reference/android/content/BroadcastReceiver.html#onReceive(android.content.Context,android.content.Intent) )的方法，这里可以接收LocalBroadcastManager发出的广播数据。

```java

// 广播接收器，用于接受IntentService更新的状态
private class ResponseReceiver extends BroadcastReceiver
{
    // 防止实例化
    private DownloadStateReceiver() {
    }

    // 它会被注册来接收Intent，当广播接收器获得这个Intent时调用。
    @Override
    public void onReceive(Context context, Intent intent) {
    ...
        /*
         * 在这里处理Intent.
         */
    ...
    }
}
```

一旦定义了BroadcastReceiver，也应该定义actions，categories与data用来做广播过滤。为了实现这些，需要使用[IntentFilter](http://developer.android.com/reference/android/content/IntentFilter.html).如下所示：

```java
// 用于现实照片的类
public class DisplayActivity extends FragmentActivity {
    ...
    public void onCreate(Bundle stateBundle) {
        ...
        super.onCreate(stateBundle);
        ...
        // 过滤器的动作条件是自定义的BROADCAST_ACTION
        IntentFilter mStatusIntentFilter = new IntentFilter(
                Constants.BROADCAST_ACTION);

        // 为http协议添加一个数据过滤器
        mStatusIntentFilter.addDataScheme("http");

```

为了给系统注册这个BroadcastReceiver和IntentFilter，需要通过LocalBroadcastManager执行registerReceiver()的方法。如下所示：

```java
        // 实例化一个新的 DownloadStateReceiver
        DownloadStateReceiver mDownloadStateReceiver =
                new DownloadStateReceiver();

        // 注册DownloadStateReceiver和Intent过滤器
        LocalBroadcastManager.getInstance(this).registerReceiver(
                mDownloadStateReceiver,
                mStatusIntentFilter);
        ...
```

一个BroadcastReceiver可以处理多种类型的广播数据。每个广播数据都有自己的ACTION。这个功能使得不用定义多个不同的BroadcastReceiver来分别处理不同的ACTION数据。为BroadcastReceiver定义另外一个IntentFilter，只需要创建一个新的IntentFilter并重复执行registerReceiver()即可。例如:

```java
        /*
         * 实例化一个新的动作过滤器.
         * 不需要数据类型过滤器.
         */
        statusIntentFilter = new IntentFilter(Constants.ACTION_ZOOM_IMAGE);
        ...
        // Registers the receiver with the new filter
        // 用新的意图过滤器注册广播接收器
        LocalBroadcastManager.getInstance(getActivity()).registerReceiver(
                mDownloadStateReceiver,
                mIntentFilter);
```

发送一个广播Intent并不会启动或重启一个Activity。即使是你的app在后台运行，Activity的BroadcastReceiver也可以接收、处理Intent对象。但是这不会迫使你的app进入前台。当你的app不可见时，如果想通知用户一个发生在后台的事件，建议使用[Notification](http://developer.android.com/reference/android/app/Notification.html)。永远不要为了响应一个广播Intent而去启动Activity。

***
**笔者评论:**使用LocalBroadcastManager结合IntentService其实是一种很典型高效的做法，同时也更符合OO的思想，通过广播注册与反注册的方式，对两个组件进行解耦。如果使用Handler传递到后台线程作为回调，容易带来的内存泄漏。原因是：匿名内部类对外面的Actvitiy持有引用，如果在Acitivity被销毁的时候，没有对Handler进行显式的解绑，会导致Activity无法正常销毁，这样自然就有了内存泄漏。当然，如果用文章中的方案，通常也要记得在Activity的onPause的时候进行unRegisterReceiver，除非你有充足的理由为解释这里为何要继续保留。
