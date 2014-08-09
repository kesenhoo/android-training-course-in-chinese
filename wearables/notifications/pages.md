# 为Notification添加显示页面

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文:<http://developer.android.com/training/wearables/notifications/pages.html>

当你想要在不需要用户在他们的手机上打开你的app的情况下，还可以让你表达更多的信息，那么你可以在wear上的Notification中添加一个或更多的页面。

![](09_pages.png)
![](08_pages.png)

为了创建一个多页的Notification，你需要：

1. 通过[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)创建主Notification（首页），这个首页也是你想要呈现在手持设备上的。
2. 通过[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)为wear添加更多的页面。
3.通过[addPage()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addPage(android.app.Notification)方法为主Notification应用这些添加的页面，或者通过[addPage()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addPage(android.app.Notification)添加一个[Collection](http://developer.android.com/reference/java/util/Collection.html)的多个页面。

举个例子，以下代码为Notification添加了第二个页面：

```java
// Create builder for the main notification
NotificationCompat.Builder notificationBuilder =
        new NotificationCompat.Builder(this)
        .setSmallIcon(R.drawable.new_message)
        .setContentTitle("Page 1")
        .setContentText("Short message")
        .setContentIntent(viewPendingIntent);

// Create a big text style for the second page
BigTextStyle secondPageStyle = new NotificationCompat.BigTextStyle();
secondPageStyle.setBigContentTitle("Page 2")
               .bigText("A lot of text...");

// Create second page notification
Notification secondPageNotification =
        new NotificationCompat.Builder(this)
        .setStyle(secondPageStyle)
        .build();

// Add second page with wearable extender and extend the main notification
Notification twoPageNotification =
        new WearableExtender()
                .addPage(secondPageNotification)
                .extend(notificationBuilder)
                .build();

// Issue the notification
notificationManager =
        NotificationManagerCompat.from(this);
notificationManager.notify(notificationId, twoPageNotification);
```

下一课：[以Stack的方式显示Notifications](stacks.html)
