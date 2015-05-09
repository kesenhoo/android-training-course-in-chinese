# 为可穿戴设备创建Notification

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文: <http://developer.android.com/training/wearables/notifications/creating.html>

使用 [NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html) 来创建可以发送给可穿戴设备的手持设备Notification。当我们使用这个类创建Notification之后，无论Notification出现在手持式设备上还是可穿戴设备上，系统都会把Notification正确地显示出来。

> **Note：**使用 [RemoteViews](http://developer.android.com/reference/android/widget/RemoteViews.html) 的Notification会剥除自定义的 layout，并且可穿戴设备上只显示文本和图标。但是，通过创建一个运行在可穿戴设备上的应用，开发者能够使用自定义的卡片布局[创建自定义Notifications](http://hukai.me/android-training-course-in-chinese/wearables/apps/layouts.html#CustomNotifications)。

## Import必要的类

为了引入必要的包，在我们的 `build.gradle` 文件中加入如下内容：

```java
compile "com.android.support:support-v4:20.0.+"
```

现在我们的项目能够访问关键的包，接下来从support library中引入必要的类：

```java
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.app.NotificationCompat.WearableExtender;
```

## 通过Notification Builder创建Notification

[v4 support library](http://developer.android.com/tools/support-library/features.html#v4)能够让开发者使用最新的特性去创建 Notification，诸如action 按钮和大的图标，而且兼容Android1.6（API level4）及以上的版本。

为了通过support library创建一个Notification，我们需要创建一个 [NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html) 的实例，然后通过将该实例传给 [notify()](http://developer.android.com/reference/java/lang/Object.html#notify()) 来发出 Notification。例如：

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

当该Notification出现在手持设备上时，用户能够通过触摸Notification来触发之前通过[setContentIntent()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent(android.app.PendingIntent)设置的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)。当该Notification出现在可穿戴设备上时，用户能够通过向左滑动该Notification显示**Open**的action，点击这个action能够激活手持设备上的Intent。

## 添加Action按钮

除了通过 [setContentIntent()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentIntent(android.app.PendingIntent)) 定义的主要内容action之外，我们还可以通过传递一个 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html) 给 [addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#addAction(android.support.v4.app.NotificationCompat.Action)) 来添加其它action。

![](circle_email_action.png)

例如，下面的代码展示了创建一个同之前相仿的Notification，只不过添加了一个在地图上查看事件位置的action。

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

在手持设备上，action表现为在Notification上附加的一个额外按钮。而在可穿戴设备上，action表现为Notification左滑后出现的大按钮。当用户点击action时，能够触发手持设备上对应的intent。

> **Tip：**如果我们的Notification包含了一个"回复"的action(例如短信类app)，我们可以通过支持直接从Android可穿戴设备返回的语音输入，来加强该功能的体验。更多信息，详见[在Notification中接收语音输入](voice-input.html)。

## 可穿戴式独有的 Actions

如果开发者想要可穿戴式设备上的action与手持式设备不一样的话，可以使用 [WearableExtender.addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addAction(android.support.v4.app.NotificationCompat.Action))，一旦我们通过这种方式添加了action，可穿戴式设备便不会显示任何其他通过 [NotificationCompat.Builder.addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#addAction(android.support.v4.app.NotificationCompat.Action)) 添加的action。这是因为，只有通过 [WearableExtender.addAction()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#addAction(android.support.v4.app.NotificationCompat.Action)) 添加的action才能只在可穿戴设备上显示且不在手持式设备上显示。

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

## 添加一个Big View

开发者可以在Notification中通过添加某种"big view"风格来插入扩展文本。在手持式设备上，用户能够通过展开Notification看见big view的内容。在可穿戴式设备上，big view内容是默认可见的。

![](06_images.png)

可以通过 [NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html) 对象调用 [setStyle()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setStyle(android.support.v4.app.NotificationCompat.Style))，并设置参数为 [BigTextStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigTextStyle.html) 或 [InboxStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.InboxStyle.html) 的实例，从而将扩展内容添加到 Notification 中。

比如，下面的代码为事件 Notification 添加了一个 [NotificationCompat.BigTextStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigTextStyle.html) 的实例，目的是为了包含完整的事件描述(这能够包含比 [setContentText()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setContentText(java.lang.CharSequence)) 提供的空间所能容纳的字数更多的文字)。

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

要注意的是，开发者可以通过 [setLargeIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setLargeIcon(android.graphics.Bitmap)) 方法为任何 Notification 添加一个大图标。但是，这些图标在可穿戴设备上会显示成大的背景图片，并且由于这些图标会被放大以适应可穿戴设备的屏幕，导致这些图标显示的效果不好。想要为 Notification 添加一个可穿戴设备适用的背景图片，请看下面一小节[为 Notification 添加可穿戴式特性](creating.html#AddWearableFeatures)。更多关于大图片在 Notification 上的设计，详见 [Design Principles of Android Wear](http://developer.android.com/design/wear/index.html)。

##为Notification添加可穿戴式特性

如果我们需要为 Notification 添加一些可穿戴式的特性设置，比如制定额外的内容页，或者让用户通过语音输入一些文字，那么我们可以使用
[NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html) 来制定这些设置。为了适用这个 API，我们需要：

1. 创建一个 [WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html) 的实例，为 Notification 设置可穿戴设备独有的特性。
2. 创建一个 [NotificationCompat.Builder](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html) 的实例，就像本课程先前所说的，设置需要的 Notification 属性。
3. 调用 Notification 上的 [extend()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#extend(android.support.v4.app.NotificationCompat.Extender)) 并将 [WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html) 传进该方法。这在 Notification 上应用了可穿戴设备的选项。
4. 调用 [build()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#build()) 去构建一个 Notification。

例如，以下代码调用 [setHintHideIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setHintHideIcon(boolean)) 方法把应用的图标从 Notification 卡片上删掉。

```java
// Create a WearableExtender to add functionality for wearables
NotificationCompat.WearableExtender wearableExtender =
        new NotificationCompat.WearableExtender()
        .setHintHideIcon(true)
        .setBackground(mBitmap);

// Create a NotificationCompat.Builder to build a standard notification
// then extend it with the WearableExtender
Notification notif = new NotificationCompat.Builder(mContext)
        .setContentTitle("New mail from " + sender)
        .setContentText(subject)
        .setSmallIcon(R.drawable.new_mail)
        .extend(wearableExtender)
        .build();
```

[setHintHideIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setHintHideIcon(boolean)) 和 [setBackground()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setBackground(android.graphics.Bitmap)) 这两个方法是 [NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html) 可用的新 Noticication 特性的两个例子。

> **Note：**[setBackground()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setBackground(android.graphics.Bitmap)) 中使用的位图在不滚动的背景下应该是 400x400 的分辨率，在支持视差滚动的背景下应该是 640x640。将这些位图放在 `res/drawable-nodpi` 目录下。将可穿戴 Notification 中使用的其它不是位图的资源放到 `res/drawable-hdpi` 目录，例如 [setContentIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#setContentIcon(int)) 用到的那些资源。

如果开发者需要稍后去读取可穿戴特性的设置，可以使用设置相应的get方法，该例子通过调用 [getHintHideIcon()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html#getHintHideIcon()) 去获取当前 Notification 是否隐藏了图标。

```java
NotificationCompat.WearableExtender wearableExtender =
        new NotificationCompat.WearableExtender(notif);
boolean hintHideIcon = wearableExtender.getHintHideIcon();
```

## 传递 Notification

如果开发者想要传递自己的 Notification，请使用 [NotificationManagerCompat](http://developer.android.com/reference/android/support/v4/app/NotificationManagerCompat.html) 的API代替 [NotificationManager](http://developer.android.com/reference/android/app/NotificationManager.html)：

```java
// Get an instance of the NotificationManager service
NotificationManagerCompat notificationManager =
        NotificationManagerCompat.from(mContext);

// Issue the notification with notification manager.
notificationManager.notify(notificationId, notif);
```

如果开发者使用了framework中的 [NotificationManager](http://developer.android.com/reference/android/app/NotificationManager.html) ，那么 [NotificationCompat.WearableExtender](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.WearableExtender.html) 中的一些特性就会失效，所以，请确保使用 [NotificationManagerCompat](http://developer.android.com/reference/android/support/v4/app/NotificationManagerCompat.html)。

下一课：[在 Notifcation 中接收语音输入](voice-input.html)


