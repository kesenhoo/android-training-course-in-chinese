# Sending Work Requests to the Background Service:发送任务请求到IntentService

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:

前一篇文章演示了如何创建一个IntentService类。这次会演示如何通过发送一个Intent来触发IntentService执行任务。这个Intent可以传递一些数据给IntentService。可以在Activity或者Fragment的任何时间点发送这个Intent。

为了创建一个工作请求并发送到IntentService。需要先创建一个explicit Intent，添加数据到intent，然后通过执行[startService()](http://developer.android.com/reference/android/content/Context.html#startService(android.content.Intent)) 把它发送到IntentService。

下面的是代码示例：

* 创建一个新的显式的Intent用来启动IntentService。

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

* 执行startService()

```java
// Starts the IntentService
getActivity().startService(mServiceIntent);
```

**注意：**可以在Activity或者Fragment的任何位置发送任务请求。

一旦执行了startService()，IntentService在自己本身的[onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent))方法里面开始执行这个任务。

下一步是如何把工作任务的执行结果返回给发送任务的Activity或者Fragment。下节课会演示如何使用[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)来完成这个任务。
