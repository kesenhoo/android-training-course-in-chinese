# 启动Activity时保留导航

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/notify-user/navigation.html>

部分设计一个notification的目的是为了保持用户的导航体验。为了详细讨论这个课题，请看 [Notifications](developer.android.com/guide/topics/ui/notifiers/notifications.html#NotificationResponse) API引导，分为下列两种主要情况：

    * 常规的activity
    你启动的是你application工作流中的一部分[Activity](developer.android.com/reference/android/app/Activity.html)。
    * 特定的activity
    用户只能从notification中启动，才能看到这个[Activity](http://developer.android.com/intl/zh-cn/reference/android/app/Activity.html)，在某种意义上，这个[Activity](http://developer.android.com/intl/zh-cn/reference/android/app/Activity.html)是notification的扩展，额外展示了一些notification本身难以展示的信息。


## 设置一个常规的Activity PendingIntent

设置一个直接启动的入口Activity的PendingIntent，遵循以下步骤：



1  在manifest中定义你application的[Activity](developer.android.com/reference/android/app/Activity.html)层次，最终的manifest文件应该像这个：


```java
<activity
    android:name=".MainActivity"
    android:label="@string/app_name" >
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
<activity
    android:name=".ResultActivity"
    android:parentActivityName=".MainActivity">
    <meta-data
        android:name="android.support.PARENT_ACTIVITY"
        android:value=".MainActivity"/>
</activity>

```

2 在基于启动[Activity](developer.android.com/reference/android/app/Activity.html)的[Intent](developer.android.com/reference/android/content/Intent.html)中创建一个返回栈，比如：


```java
int id = 1;
...
Intent resultIntent = new Intent(this, ResultActivity.class);
TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
// Adds the back stack
stackBuilder.addParentStack(ResultActivity.class);
// Adds the Intent to the top of the stack
stackBuilder.addNextIntent(resultIntent);
// Gets a PendingIntent containing the entire back stack
PendingIntent resultPendingIntent =
        stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);
...
NotificationCompat.Builder builder = new NotificationCompat.Builder(this);
builder.setContentIntent(resultPendingIntent);
NotificationManager mNotificationManager =
    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
mNotificationManager.notify(id, builder.build());

```

## 设置一个特定的Activity PendingIntent

一个特定的[Activity](developer.android.com/reference/android/app/Activity.html)不需要一个返回栈，所以你不需要在manifest中定义[Activity](developer.android.com/reference/android/app/Activity.html)的层次，以及你不需要调用 [addParentStack()](developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html#addParentStack(android.app.Activity))方法去构建一个返回栈。作为代替，你需要用manifest设置[Activity](developer.android.com/reference/android/app/Activity.html)任务选项，以及调用 [getActivity()](developer.android.com/reference/android/app/PendingIntent.html#getActivity(android.content.Context,%20int,%20android.content.Intent,%20int))创建[PendingIntent](developer.android.com/reference/android/app/PendingIntent.html)

1. manifest中，在[Activity](developer.android.com/reference/android/app/Activity.html)的 [<activity>](developer.android.com/guide/topics/manifest/activity-element.html) 标签中增加下列属性：
  [android:name="activityclass"](developer.android.com/guide/topics/manifest/activity-element.html#nm)
    activity的完整的类名。
  [android:taskAffinity=""](developer.android.com/guide/topics/manifest/activity-element.html#aff)
  结合你在代码里设置的[FLAG_ACTIVITY_NEW_TASK](developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_NEW_TASK)标识， 确保这个[Activity](developer.android.com/reference/android/app/Activity.html)不会进入application的默认任务。任何与 application的默认任务有密切关系的任务都不会受到影响。
  [android:excludeFromRecents="true"](developer.android.com/guide/topics/manifest/activity-element.html#exclude)
  将新任务从最近列表中排除，目的是为了防止用户不小心返回到它。

2. 建立以及发布notification：
  a.创建一个启动[Activity](developer.android.com/reference/android/app/Activity.html)的[Intent](developer.android.com/reference/android/content/Intent.html).
  b.通过调用[setFlags()](developer.android.com/reference/android/content/Intent.html#setFlags(int))方法并设置标识[FLAG_ACTIVITY_NEW_TASK](developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_NEW_TASK) 与 [FLAG_ACTIVITY_CLEAR_TASK](developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_CLEAR_TASK)，来设置[Activity](developer.android.com/reference/android/app/Activity.html)在一个新的，空的任务中启动。
  c.在[Intent](developer.android.com/reference/android/content/Intent.html)中设置其他你需要的选项。
  d.通过调用 [getActivity()](http://developer.android.com/intl/zh-cn/reference/android/app/PendingIntent.html#getActivity%28android.content.Context,%20int,%20android.content.Intent,%20int%29)方法从[Intent](developer.android.com/reference/android/content/Intent.html)中创建一个 [PendingIntent](developer.android.com/reference/android/app/PendingIntent.html)，你可以把这个[PendingIntent](developer.android.com/reference/android/app/PendingIntent.html) 当做 [setContentIntent()](http://developer.android.com/intl/zh-cn/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent%28android.app.PendingIntent%29)的参数来使用。
下面的代码片段演示了这个过程：

```java
// Instantiate a Builder object.
NotificationCompat.Builder builder = new NotificationCompat.Builder(this);
// Creates an Intent for the Activity
Intent notifyIntent =
        new Intent(new ComponentName(this, ResultActivity.class));
// Sets the Activity to start in a new, empty task
notifyIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
        Intent.FLAG_ACTIVITY_CLEAR_TASK);
// Creates the PendingIntent
PendingIntent notifyIntent =
        PendingIntent.getActivity(
        this,
        0,
        notifyIntent,
        PendingIntent.FLAG_UPDATE_CURRENT
);

// Puts the PendingIntent into the notification builder
builder.setContentIntent(notifyIntent);
// Notifications are issued by sending them to the
// NotificationManager system service.
NotificationManager mNotificationManager =
    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
// Builds an anonymous Notification object from the builder, and
// passes it to the NotificationManager
mNotificationManager.notify(id, builder.build());

```
