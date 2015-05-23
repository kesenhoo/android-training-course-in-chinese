# 更新Notification

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/notify-user/managing.html>

当你需要对同一事件发布多次Notification时，你应该避免每次都生成一个全新的Notification。相反，你应该考虑去更新先前的Notification，或者改变它的值，或者增加一些值，或者两者同时进行。

下面的章节描述了如何更新Notifications，以及如何移除它们。



## 改变一个Notification

想要设置一个可以被更新的Notification，需要在发布它的时候调用[NotificationManager.notify(ID, notification)](developer.android.com/reference/android/app/NotificationManager.html#notify(int,%20android.app.Notification))方法为它指定一个notification ID。更新一个已经发布的Notification，需要更新或者创建一个[NotificationCompat.Builder](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)对象，并从这个对象创建一个[Notification](developer.android.com/reference/android/app/Notification.html)对象，然后用与先前一样的ID去发布这个[Notification](developer.android.com/reference/android/app/Notification.html)。

下面的代码片段演示了更新一个notification来反映事件发生的次数，它把notification堆积起来，显示一个总数。


```java

mNotificationManager =
        (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
// Sets an ID for the notification, so it can be updated
int notifyID = 1;
mNotifyBuilder = new NotificationCompat.Builder(this)
    .setContentTitle("New Message")
    .setContentText("You've received new messages.")
    .setSmallIcon(R.drawable.ic_notify_status)
numMessages = 0;
// Start of a loop that processes data and then notifies the user
...
    mNotifyBuilder.setContentText(currentText)
        .setNumber(++numMessages);
    // Because the ID remains unchanged, the existing notification is
    // updated.
    mNotificationManager.notify(
            notifyID,
            mNotifyBuilder.build());
...

```

## 移除Notification

Notifications 将持续可见，除非下面任何一种情况发生。


    * 用户清除Notification单独地或者使用“清除所有”（如果Notification能被清除）。
    * 你在创建notification时调用了 setAutoCancel(developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setAutoCancel(boolean))方法，以及用户点击了这个notification，
    * 你为一个指定的 notification ID调用了[cancel()](developer.android.com/reference/android/app/NotificationManager.html#cancel(int))方法。这个方法也会删除正在进行的notifications。
    * 你调用了[cancelAll()](developer.android.com/reference/android/app/NotificationManager.html#cancelAll())方法，它将会移除你先前发布的所有Notification。
