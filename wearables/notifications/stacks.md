# 将 Notification 放成一叠

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文: <http://developer.android.com/training/wearables/notifications/stacks.html>

当为手持式设备创建Notification时，开发者应该将多个相似的Notification合并成一个概括式的Notification。例如，如果app创建了一系列接收短信的Notification，开发者不应该将多于一个Notification显示到可穿戴设备上——当接收到多于一条消息的时候，用一个Notification提供一个摘要，比如"2条新消息"。

尽管如此，一个概括式的Notification在可穿戴设备上并不是很有用处，因为用户不能在可穿戴设备上阅读每条消息的详细内容(他们必须在手持式设备上打开相应的app才能看到更多信息)。所以对可穿戴设备而言，开发者应该将所有的Notification都集中起来，放成一叠。这叠Notification以一张卡片的形式显示出来，用户可以将它展开，分别看到每个Notification的详细内容。通过新方法[setGroup()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setGroup(java.lang.String))能够实现该功能，同时，也能保持手持式设备上显示为一条概括式的Notification。

![](11_bundles_A.png)
![](11_bundles_B.png)

## 将每个Notification添加到一个群组中

为了创建一个stack，可以对每个想要放入该stack的Notification调用[setGroup()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setGroup(java.lang.String))，并且指定一个group key。然后调用[notify()](http://developer.android.com/reference/java/lang/Object.html#notify())将其发送至可穿戴设备上。

```java
final static String GROUP_KEY_EMAILS = "group_key_emails";

// Build the notification, setting the group appropriately
Notification notif = new NotificationCompat.Builder(mContext)
         .setContentTitle("New mail from " + sender1)
         .setContentText(subject1)
         .setSmallIcon(R.drawable.new_mail);
         .setGroup(GROUP_KEY_EMAILS)
         .build();

// Issue the notification
NotificationManagerCompat notificationManager =
        NotificationManagerCompat.from(this);
notificationManager.notify(notificationId1, notif);
```

稍后，当开发者创建另一个Notification的时候，指定同样的group key。当在调用[notify()](http://developer.android.com/reference/java/lang/Object.html#notify())的时候，这个Notification就会出现在之前那个Notification的同一个stack中，而非新建一张卡片。

```java
Notification notif2 = new NotificationCompat.Builder(mContext)
         .setContentTitle("New mail from " + sender2)
         .setContentText(subject2)
         .setSmallIcon(R.drawable.new_mail);
         .setGroup(GROUP_KEY_EMAILS)
         .build();

notificationManager.notify(notificationId2, notif2);
```

在默认的情况下，Notification的排列顺序由开发者添加的先后顺序决定，最近的Notification会被放置在最顶端。你可以通过[setSortKey()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setSortKey(java.lang.String))来修改Notification的排顺序。

## 添加概括式Notification

在手持设备上提供一个概括式的Notification是很重要的。因此除了要将每条单独的Notification放置在同一个stack group中，还需要添加一个概括式的Notification，并对其调用[setGroupSummary()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setGroupSummary(boolean))即可实现。

该Notification并不会出现在可穿戴设备上的stack中，只会出现在手持式设备上。

![](notif_summary_framed.png)

```java
Bitmap largeIcon = BitmapFactory.decodeResource(getResources(),
        R.drawable.ic_large_icon);

// Create an InboxStyle notification
Notification summaryNotification = new NotificationCompat.Builder(mContext)
        .setContentTitle("2 new messages")
        .setSmallIcon(R.drawable.ic_small_icon)
        .setLargeIcon(largeIcon)
        .setStyle(new NotificationCompat.InboxStyle()
                .addLine("Alex Faaborg   Check this out")
                .addLine("Jeff Chang   Launch Party")
                .setBigContentTitle("2 new messages")
                .setSummaryText("johndoe@gmail.com"))
        .setGroup(GROUP_KEY_EMAILS)
        .setGroupSummary(true)
        .build();

notificationManager.notify(notificationId3, summaryNotification);
```

该Notification使用了[NotificationCompat.InboxStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.InboxStyle.html)，这个style能够让开发者很轻松地创建邮件或者短信app的Notifications。开发者可以对概括式Notification使用这个style，或者[NotificationCompat](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.html)中定义的其他style，或者不使用任何style也可以。

> **Tip：**如果想要和上面截图中一样的设计文本，请参考[Styling with HTML markup](http://developer.android.com/guide/topics/resources/string-resource.html#StylingWithHTML)和[Styling with Spannables](http://developer.android.com/guide/topics/resources/string-resource.html#StylingWithSpannables)。

概括式Notification能够在不显示在可穿戴设备上的前提下做到影响可穿戴设备上的Notification。当开发者创建一个概括式Notification时，可以利用[NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html)，调用[setBackground()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setBackground(android.graphics.Bitmap))或者[addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addAction(android.support.v4.app.NotificationCompat.Action))为可穿戴设备上的整个stack设置一个背景图片或者一个action。以下代码展示了如何为整个stack设置背景：

```java
Bitmap background = BitmapFactory.decodeResource(getResources(),
        R.drawable.ic_background);

NotificationCompat.WearableExtender wearableExtender =
        new NotificationCompat.WearableExtender()
        .setBackground(background);

// Create an InboxStyle notification
Notification summaryNotificationWithBackground =
        new NotificationCompat.Builder(mContext)
        .setContentTitle("2 new messages")
        ...
        .extend(wearableExtender)
        .setGroup(GROUP_KEY_EMAILS)
        .setGroupSummary(true)
        .build();
```

下一课：[创建可穿戴的应用](apps/index.html)



