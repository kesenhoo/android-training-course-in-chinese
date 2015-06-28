# 向后台服务发送任务请求

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/send-request.html>

前一篇文章演示了如何创建一个IntentService类。这次会演示如何通过发送一个Intent来触发IntentService执行任务。这个Intent可以传递一些数据给IntentService。我们可以在Activity或者Fragment的任何时间点发送这个Intent。

## 创建任务请求并发送到IntentService

为了创建一个任务请求并发送到IntentService。需要先创建一个显式Intent，并将请求数据添加到intent中，然后通过调用
`startService()` 方法把任务请求数据发送到IntentService。

下面的是代码示例：

* 创建一个新的显式Intent用来启动IntentService。

```java
/*
 * Creates a new Intent to start the RSSPullService
 * IntentService. Passes a URI in the
 * Intent's "data" field.
 */
mServiceIntent = new Intent(getActivity(), RSSPullService.class);
mServiceIntent.setData(Uri.parse(dataUrl));
```

<!-- More -->

* 执行`startService()`

```java
// Starts the IntentService
getActivity().startService(mServiceIntent);
```

注意可以在Activity或者Fragment的任何位置发送任务请求。例如，如果你先获取用户输入，您可以从响应按钮单击或类似手势的回调方法里面发送任务请求。

一旦执行了startService()，IntentService在自己本身的`onHandleIntent()`方法里面开始执行这个任务，任务结束之后，会自动停止这个Service。

下一步是如何把工作任务的执行结果返回给发送任务的Activity或者Fragment。下节课会演示如何使用[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)来完成这个任务。
