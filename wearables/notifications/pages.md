# 为 Notification 添加页面

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文:<http://developer.android.com/training/wearables/notifications/pages.html>

当开发者想要在不需要用户在他们的手机上打开app的情况下，还可以允许表达更多的信息，那么开发者可以在可穿戴设备上的Notification中添加一个或多个的页面。添加的页面会马上出现在主 Notification 卡片的右边。

![](09_pages.png)
![](08_pages.png)

为了创建一个拥有多个页面的 Notification，开发者需要：

1. 通过[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)创建主Notification（首页），以开发者想要的方式使其出现在手持设备上。
2. 通过[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)为可穿戴设备添加更多的页面。
3. 通过[addPage()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addPage(android.app.Notification))方法将这些页面应用到主 Notification 中，或者通过[addPages()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addPage(android.app.Notification))将多个页面添加到一个[Collection](http://developer.android.com/reference/java/util/Collection.html)。

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
