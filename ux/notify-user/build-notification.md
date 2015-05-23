# 建立一个Notification

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/notify-user/build-notification.html>

* 这节课向你说明如何创建与发布一个Notification。

* 这节课的例子是基于[NotificationCompat.Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)类的，[NotificationCompat.Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)在[Support Library](developer.android.com)中。为了给许多各种不同的平台提供最好的notification支持，你应该使用[NotificationCompat](developer.android.com/reference/android/support/v4/app/NotificationCompat.html)以及它的子类，特别是[NotificationCompat.Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)。


## 创建Notification Buider

* 创建Notification时，可以用[NotificationCompat.Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)对象指定Notification的UI内容与行为。一个[Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)至少包含以下内容：

  * 一个小的icon，用[setSmallIcon()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setSmallIcon(int))方法设置
  * 一个标题，用[setContentTitle()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentTitle(java.lang.CharSequence))方法设置。
  * 详细的文本，用[setContentText()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentText(java.lang.CharSequence))方法设置

例如：


```java

NotificationCompat.Builder mBuilder =
    new NotificationCompat.Builder(this)
    .setSmallIcon(R.drawable.notification_icon)
    .setContentTitle("My notification")
    .setContentText("Hello World!");

```

## 定义Notification的Action（行为）

* 尽管在Notification中Actions是可选的，但是你应该至少添加一种Action。一种Action可以让用户从Notification直接进入你应用内的[Activity](developer.android.com/reference/android/app/Activity.html)，在这个activity中他们可以查看引起Notification的事件或者做下一步的处理。在Notification中，action本身是由[PendingIntent](developer.android.com/reference/android/app/PendingIntent.html)定义的，PendingIntent包含了一个启动你应用内[Activity](developer.android.com/reference/android/app/Activity.html)的[Intent](developer.android.com/reference/android/content/Intent.html)。

* 如何构建一个[PendingIntent](developer.android.com/reference/android/app/PendingIntent.html)取决于你要启动的[activity](developer.android.com/reference/android/app/Activity.html)的类型。当从Notification中启动一个[activity](developer.android.com/reference/android/app/Activity.html)时，你必须保存用户的导航体验。在下面的代码片段中，点击Notification启动一个新的activity，这个activity有效地扩展了Notification的行为。在这种情形下，就没必要人为地去创建一个返回栈（更多关于这方面的信息，请查看 [Preserving Navigation when Starting an Activity](developer.android.com/intl/zh-cn/training/notify-user/navigation.html)）


```java

Intent resultIntent = new Intent(this, ResultActivity.class);
...
// Because clicking the notification opens a new ("special") activity, there's
// no need to create an artificial back stack.
PendingIntent resultPendingIntent =
    PendingIntent.getActivity(
    this,
    0,
    resultIntent,
    PendingIntent.FLAG_UPDATE_CURRENT
);

```

## 设置Notification的点击行为

 可以通过调用[NotificationCompat.Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)中合适的方法，将上一步创建的[PendingIntent](developer.android.com/reference/android/app/PendingIntent.html)与一个手势产生关联。比方说，当点击Notification抽屉里的Notification文本时，启动一个activity，可以通过调用[setContentIntent()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent(android.app.PendingIntent))方法把[PendingIntent](developer.android.com/reference/android/app/PendingIntent.html)添加进去。

例如：

```java

PendingIntent resultPendingIntent;
...
mBuilder.setContentIntent(resultPendingIntent);

```


## 发布Notification

为了发布notification：
    * 获取一个[NotificationManager](http://www.baidu.com/baidu?wd=NotificationManager.&tn=monline_4_dg)实例
    * 使用[notify()](developer.android.com/reference/java/lang/Object.html#notify())方法发布Notification。当你调用[notify()](developer.android.com/reference/java/lang/Object.html#notify())方法时，指定一个notification ID。你可以在以后使用这个ID来更新你的notification。这在[Managing Notifications](developer.android.com/intl/zh-cn/training/notify-user/managing.html)中有更详细的描述。
    * 调用[build()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#build())方法，会返回一个包含你的特征的[Notification](developer.android.com/reference/android/app/Notification.html)对象。

举个例子：

```java

NotificationCompat.Builder mBuilder;
...
// Sets an ID for the notification
int mNotificationId = 001;
// Gets an instance of the NotificationManager service
NotificationManager mNotifyMgr =
        (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
// Builds the notification and issues it.
mNotifyMgr.notify(mNotificationId, mBuilder.build());

```
