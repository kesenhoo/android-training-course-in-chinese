# 创建后台服务

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/create-service.html>

IntentService为在单个后台线程执行一个操作提供了一种直接的实现方式。它可以处理一个长时间操作的任务并确保不影响到UI的响应性。而且IntentService的执行并不受UI的生命周期的影响。所以继续运行的情况下将关闭一个AsyncTask。

IntentService有下面几个局限性：

* 不可以直接和UI做交互。为了把他执行的结果体现在UI上，需要发送给Activity。
* 工作任务队列是顺序执行的，如果一个任务正在IntentService中执行，此时你再发送一个任务请求，这个任务会一直等待直到前面一个任务执行完毕。
* 正在执行的任务无法打断。

然而，在大多数情况下，IntentService都是简单后台任务操作的理想选择。

这节课会演示如何创建继承的IntentService。同样也会演示如何创建必须实现的回调[onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent) )。最后，还会解释如何在manifest文件中定义这个IntentService。

<!-- More -->

## 1)创建IntentService
为你的app创建一个IntentService组件，需要定义一个类，并继承IntentService类，在里面重写onHandleIntent()方法，如下所示：

```java
public class RSSPullService extends IntentService {
    @Override
    protected void onHandleIntent(Intent workIntent) {
        // 从传入的intent获取数据
        String dataString = workIntent.getDataString();
        ...
        // 根据dataString的内容在这里进行操作
        ...
    }
}
```

注意一个普通Service组件的其他回调，例如`onStartCommand()`会被IntentService自动调用。在IntentService中，要避免重写那些回调。

## 2)在Manifest文件中定义IntentService
IntentService需要在manifest文件添加相应的条目，将此条目`<service>`作为`<application>`元素的子元素下进行定义，如下所示：

```xml
<application
        android:icon="@drawable/icon"
        android:label="@string/app_name">
        ...
        <!--
            因为android:exported 被设置为false，该服务只能在本应用中使用
        -->
        <service
            android:name=".RSSPullService"
            android:exported="false"/>
        ...
<application/>
```

`android:name`属性指明了IntentService的名字。

注意`<service>`标签并没有包含任何intent filter。因为发送任务给IntentService的Activity需要使用显式Intent，所以不需要filter。这也意味着只有在同一个app或者其他使用同一个UserID的组件才能够访问到这个Service。

至此，你已经有了一个基本的IntentService类，你可以通过Intent对象向它发送操作请求。构造这些对象以及发送它们到你的IntentService的方式，将在接下来的课程中描述。
