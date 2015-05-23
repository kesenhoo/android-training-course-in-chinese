# 使用BigView样式

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/notify-user/expanded.html>

Notification抽屉中的Notification主要有两种视觉展示形式，normal view（平常的视图，下同） 与 big view（大视图，下同）。Notification的 big view样式只有当Notification被扩展时才能出现。当Notification在Notification抽屉的最上方或者用户点击Notification时才会展现大视图。


Big views在Android4.1被引进的，它不支持老版本设备。这节课叫你如何让把big view notifications合并进你的APP，同时提供normal view的全部功能。更多信息请见[Notifications API guide](developer.android.com/guide/topics/ui/notifiers/notifications.html#BigNotify) 。


这是一个 normal view的例子

  ![fragments-screen-mock](notifications-normalview.png)

   图1 Normal view notification.

这是一个 big view的例子

  ![fragments-screen-mock](notifications-bigview.png)
  
   图2 Big view notification.

在这节课的例子应用中， normal view 与 big view给用户相同的功能：
   *  继续小睡或者消除Notification
   *  一个查看用户设置的类似计时器的提醒文字的方法，

* normal view 通过当用户点击Notification来启动一个新的activity的方式提供这些特性，记住当你设计你的notifications时，首先在normal view 中提供这些功能，因为很多用户会与notification交互。


## 设置Notification用来登陆一个新的Activity

这个例子应用用[IntentService](developer.android.com/reference/android/app/IntentService.html)的子类（PingService）来构造以及发布notification。
 在这个代码片段中，[IntentService](developer.android.com/reference/android/app/IntentService.html)中的方法[onHandleIntent()](developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent)) 指定了当用户点击notification时启动一个新的activity。方法[setContentIntent()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent(android.app.PendingIntent))定义了pending intent在用户点击notification时被激发，因此登陆这个activity.


```java

Intent resultIntent = new Intent(this, ResultActivity.class);
resultIntent.putExtra(CommonConstants.EXTRA_MESSAGE, msg);
resultIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
        Intent.FLAG_ACTIVITY_CLEAR_TASK);

// Because clicking the notification launches a new ("special") activity,
// there's no need to create an artificial back stack.
PendingIntent resultPendingIntent =
         PendingIntent.getActivity(
         this,
         0,
         resultIntent,
         PendingIntent.FLAG_UPDATE_CURRENT
);

// This sets the pending intent that should be fired when the user clicks the
// notification. Clicking the notification launches a new activity.
builder.setContentIntent(resultPendingIntent);

```

## 构造big view
 这个代码片段展示了如何在big view中设置buttons


```java

// Sets up the Snooze and Dismiss action buttons that will appear in the
// big view of the notification.
Intent dismissIntent = new Intent(this, PingService.class);
dismissIntent.setAction(CommonConstants.ACTION_DISMISS);
PendingIntent piDismiss = PendingIntent.getService(this, 0, dismissIntent, 0);

Intent snoozeIntent = new Intent(this, PingService.class);
snoozeIntent.setAction(CommonConstants.ACTION_SNOOZE);
PendingIntent piSnooze = PendingIntent.getService(this, 0, snoozeIntent, 0);

```

 这个代码片段展示了如何构造一个[Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)对象，它设置了big view 的样式为"big text",同时设置了它的内容为提醒文字。它使用[addAction()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#addAction(android.support.v4.app.NotificationCompat.Action))方法来添加将要在big view中出现的Snooze与Dismiss按钮（以及它们相关联的pending intents).

```java
// Constructs the Builder object.
NotificationCompat.Builder builder =
        new NotificationCompat.Builder(this)
        .setSmallIcon(R.drawable.ic_stat_notification)
        .setContentTitle(getString(R.string.notification))
        .setContentText(getString(R.string.ping))
        .setDefaults(Notification.DEFAULT_ALL) // requires VIBRATE permission
        /*
         * Sets the big view "big text" style and supplies the
         * text (the user's reminder message) that will be displayed
         * in the detail area of the expanded notification.
         * These calls are ignored by the support library for
         * pre-4.1 devices.
         */
        .setStyle(new NotificationCompat.BigTextStyle()
                .bigText(msg))
        .addAction (R.drawable.ic_stat_dismiss,
                getString(R.string.dismiss), piDismiss)
        .addAction (R.drawable.ic_stat_snooze,
                getString(R.string.snooze), piSnooze);

```
