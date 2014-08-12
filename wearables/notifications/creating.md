# 创建Notification

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文: <http://developer.android.com/training/wearables/notifications/creating.html>

为了创建一个手持设备上的并且也能同时发送给可穿戴设备的Notification，需要使用 [NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)。当你使用这个类创建Notification之后，如何正确展示的工作就交由系统去完成，无论是在手持式设备上还是可穿戴设备上。

> **Note:** Notification使用[RemoteViews](http://developer.android.com/reference/android/widget/RemoteViews.html)的话能够自定义layout，并且可穿戴设备上只能够显示文本和icon。但是，你能够通过创建一个运行在可穿戴式设备上的采用了自定义card layout的app去创建Notification 。请参考[创建自定义的Notification](/apps/layouts.html#CustomNotification)。

## Import必要的类

在你开始之前，从support library中import关键的类：

```java
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.app.NotificationCompat.WearableExtender;
```

## 通过Notification Builder创建Notification

[v4 support library](http://developer.android.com/tools/support-library/features.html#v4)能够让你采用最新的特性，诸如放置action button或采用large icon，去实现一个Notification，兼容Android1.6（API level4）及以上。

为了通过support library创建一个Notification，你需要创建一个[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)的实例，然后通过[notify()](http://developer.android.com/reference/java/lang/Object.html#notify()去激活。例如：

```java
int notificationId = 001;
// Build intent for notification content
Intent viewIntent = new Intent(this, ViewEventActivity.class);
viewIntent.putExtra(EXTRA_EVENT_ID, eventId);
PendingIntent viewPendingIntent =
        PendingIntent.getActivity(this, 0, viewIntent, 0);

NotificationCompat.Builder notificationBuilder =
        new NotificationCompat.Builder(this)
        .setSmallIcon(R.drawable.ic_event)
        .setContentTitle(eventTitle)
        .setContentText(eventLocation)
        .setContentIntent(viewPendingIntent);

// Get an instance of the NotificationManager service
NotificationManagerCompat notificationManager =
        NotificationManagerCompat.from(this);

// Build the notification and issues it with notification manager.
notificationManager.notify(notificationId, notificationBuilder.build());
```

当该Notification出现在手持设备上时，用户能够通过触摸Notification来触发之前通过[setContentIntent()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent(android.app.PendingIntent)设置的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)。当该Notification出现在可穿戴设备上时，用户能够通过向左滑动该Notification显示**Open**的action，点击这个action能够触发响应的Intent，作用在手持设备上。

## 添加Action按钮

除了通过[setContentIntent()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent(android.app.PendingIntent)定义的主要的action之外，你还可以通过传递一个[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)给[addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#addAction(android.support.v4.app.NotificationCompat.Action)的参数，从而添加更多的action。

![](circle_email_action.png)

例如，下面的代码展示了同上面一样的Notification，只不过添加了一个在地图上查看事件位置的action。

```java
// Build an intent for an action to view a map
Intent mapIntent = new Intent(Intent.ACTION_VIEW);
Uri geoUri = Uri.parse("geo:0,0?q=" + Uri.encode(location));
mapIntent.setData(geoUri);
PendingIntent mapPendingIntent =
        PendingIntent.getActivity(this, 0, mapIntent, 0);

NotificationCompat.Builder notificationBuilder =
        new NotificationCompat.Builder(this)
        .setSmallIcon(R.drawable.ic_event)
        .setContentTitle(eventTitle)
        .setContentText(eventLocation)
        .setContentIntent(viewPendingIntent)
        .addAction(R.drawable.ic_map,
                getString(R.string.map), mapPendingIntent);
```

在手持设备上，action表现为在Notification上附加的一个额外按钮。在可穿戴设备上，action表现为Notification左滑后出现的大按钮。当用户点击action时，能够触发手持设备上对应的intent。

> **提示:** 如果你的Notification包含了一个"Reply"的action(例如短信类app)，你可以通过支持直接从Android可穿戴设备返回的语音输入，来加强该功能的使用。更多信息，详见[Receiving Voice Input from a Notification](voice-input.html)。

## 指定可穿戴设备独有的Actions

如果你想要可穿戴式设备上的action与手持式设备不一样的话，可以使用[WearableExtender.addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addAction(android.support.v4.app.NotificationCompat.Action)，一旦你通过这种方式添加了action，可穿戴式设备便不会显示任何其他通过[NotificationCompat.Builder.addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#addAction(android.support.v4.app.NotificationCompat.Action)添加的action。这是因为，只有通过[WearableExtender.addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addAction(android.support.v4.app.NotificationCompat.Action)添加的action才能只在可穿戴设备上显示且不在手持式设备上显示。

```java
// Create an intent for the reply action
Intent actionIntent = new Intent(this, ActionActivity.class);
PendingIntent actionPendingIntent =
        PendingIntent.getActivity(this, 0, actionIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

// Create the action
NotificationCompat.Action action =
        new NotificationCompat.Action.Builder(R.drawable.ic_action,
                getString(R.string.label, actionPendingIntent))
                .build();

// Build the notification and add the action via WearableExtender
Notification notification =
        new NotificationCompat.Builder(mContext)
                .setSmallIcon(R.drawable.ic_message)
                .setContentTitle(getString(R.string.title))
                .setContentText(getString(R.string.content))
                .extend(new WearableExtender().addAction(action))
                .build();
```

## 添加Big View

你可以在Notification中通过添加某种"big view"的style来插入扩展文本。在手持式设备上，用户能够通过扩展的Notification看见big view的内容。在可穿戴式设备上，big view内容是默认可见的。

![](06_images.png)

可以通过对[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)的对象调用[setStyle()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setStyle(android.support.v4.app.NotificationCompat.Style)，设置参数为[BigTextStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigTextStyle.html)或[InboxStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.InboxStyle.html)的实例。

比如，下面的代码为事件的Notification添加了一个[NotificationCompat.BigTextStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigTextStyle.html)的实例，目的是为了包含完整的事件描述(这能够包含比[setContentText()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentText(java.lang.CharSequence)所提供的空间所能容纳的字数更多的文字)。

```java
// Specify the 'big view' content to display the long
// event description that may not fit the normal content text.
BigTextStyle bigStyle = new NotificationCompat.BigTextStyle();
bigStyle.bigText(eventDescription);

NotificationCompat.Builder notificationBuilder =
        new NotificationCompat.Builder(this)
        .setSmallIcon(R.drawable.ic_event)
        .setLargeIcon(BitmapFractory.decodeResource(
                getResources(), R.drawable.notif_background))
        .setContentTitle(eventTitle)
        .setContentText(eventLocation)
        .setContentIntent(viewPendingIntent)
        .addAction(R.drawable.ic_map,
                getString(R.string.map), mapPendingIntent)
        .setStyle(bigStyle);
```

要注意的是，你可以通过[setLargeIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setLargeIcon(android.graphics.Bitmap)方法为任何Notification添加一张较大的背景图片。更多关于大图片在Notification上的设计，详见[Design Principles of Android Wear](http://developer.android.com/design/wear/index.html)。

##为Notification添加可穿戴特性

如果你需要为Notification添加一些可穿戴的特性设置，比如制定额外的内容页，或者让用户通过语音输入一些文字，那么你可以使用
[NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html)来制定这些设置。请使用如下的API：
1. 创建一个[WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html)的实例，设置可穿戴独有的Notification的选项。
2. 创建一个[NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html)的实例，就像本课程先前所说的，设置需要的Notification属性。
3. 执行Notification的[extend()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#extend(android.support.v4.app.NotificationCompat.Extender))方法，参数是WearableExtender实例。
4. 调用[build()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#build()去build一个Notification。

例如，以下代码调用[setHintHideIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setHintHideIcon(boolean)把app 的icon从Notification的卡片上remove掉。

```java
// Create a WearableExtender to add functionality for wearables
NotificationCompat.WearableExtender wearableExtender =
        new NotificationCompat.WearableExtender()
        .setHintHideIcon(true);

// Create a NotificationCompat.Builder to build a standard notification
// then extend it with the WearableExtender
Notification notif = new NotificationCompat.Builder(mContext)
        .setContentTitle("New mail from " + sender)
        .setContentText(subject)
        .setSmallIcon(R.drawable.new_mail);
        .extend(wearableExtender)
        .build();
```

这个[setHintHideIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setHintHideIcon(boolean)方法只是使用[NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html)构建notification新特性的一个例子。

如果你需要获取可穿戴特性的内容，可以使用相应的get方法，该例子通过调用[getHintHideIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#getHintHideIcon()去获取当前Notification是否隐藏了icon。

```java
NotificationCompat.WearableExtender wearableExtender =
        new NotificationCompat.WearableExtender(notif);
boolean hintHideIcon = wearableExtender.getHintHideIcon();
```

## 交付显示Notification

如果你想要交付显示你的Notification，请使用[NotificationManagerCompat](http://developer.android.com/reference/android/support/v4/app/NotificationManagerCompat.html)的API代替[NotificationManager](http://developer.android.com/reference/android/app/NotificationManager.html)：

```java
// Get an instance of the NotificationManager service
NotificationManagerCompat notificationManager =
        NotificationManagerCompat.from(mContext);

// Issue the notification with notification manager.
notificationManager.notify(notificationId, notif);
```

如果你使用了framework中的[NotificationManager](http://developer.android.com/reference/android/app/NotificationManager.html)，那么[NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html)中的一些特性就会失效，所以，请确保使用[NotificationManagerCompat](http://developer.android.com/reference/android/support/v4/app/NotificationManagerCompat.html)。

```java
NotificationCompat.WearableExtender wearableExtender =
        new NotificationCompat.WearableExtender(notif);
boolean hintHideIcon = wearableExtender.getHintHideIcon();
```

[NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html)的API允许你为Notification、stack Notification等添加额外的内容页。下面的课程将学习这些特性。


下一课：[在Notifcation中接收语音输入](voice-input.html)


