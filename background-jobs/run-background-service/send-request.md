# 向后台服务发送任务请求

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/send-request.html>

前一篇文章演示了如何创建一个IntentService类。这次会演示如何通过发送一个Intent来触发IntentService执行任务。这个Intent可以传递一些数据给IntentService。可以在Activity或者Fragment的任何时间点发送这个Intent。

## 创建任务请求（Work Request）并发送到IntentService

为了创建一个任务请求并发送到IntentService。需要先创建一个explicit Intent，并将请求数据添加到intent，然后通过调用
[startService()](http://developer.android.com/reference/android/content/Context.html#startService(android.content.Intent) ) 函数把工作请求数据发送到IntentService。

下面的是代码示例：

* 创建一个新的显式的Intent用来启动IntentService。

```java
/*
 * 创建一个新的Intent来启动RSSPullService，通过intent的"data"属性传入一个URI
 */
mServiceIntent = new Intent(getActivity(), RSSPullService.class);
mServiceIntent.setData(Uri.parse(dataUrl));
```

<!-- More -->

* 执行startService()

```java
// 启动IntentService
getActivity().startService(mServiceIntent);
```

注意可以在Activity或者Fragment的任何位置发送任务请求。例如，如果你先获取用户输入,您可以从一个回调发送请求,响应按钮单击或类似的手势。

一旦执行了startService()，IntentService在自己本身的[onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent))方法里面开始执行这个任务，然后停止。

下一步是如何把工作任务的执行结果返回给发送任务的Activity或者Fragment。下节课会演示如何使用[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)来完成这个任务。
