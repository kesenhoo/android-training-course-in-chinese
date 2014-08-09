# 在Notifcation中接收语音输入

> 编写:[wangyachen](https://github.com/wangyacheng) - 原文:<http://developer.android.com/training/wearables/notifications/voice-input.html>

如果你的手持式设备上的Notification包含了一个输入文本的action，比如回复邮件，那么这个action正常情况下应该会调起一个activity让用户进行输入。但是，当这个action出现在可穿戴式设备上时，是没有键盘可以让用户进行输入的，所以你应该让用户口述一个回复或者通过[RemoteInput](http://developer.android.com/reference/android/support/v4/app/RemoteInput.html)预先设定好文本信息。

当用户通过语音或者选择已经存在可用的消息进行回复时，系统会将文本的反馈信息与你指定的Notification中的action中的[Intent](http://developer.android.com/reference/android/content/Intent.html)进行绑定，并且将该intent发送给你的手持设备中的app。

> **Note:** Android模拟器并不支持语音输入。如果使用可穿戴式设备的模拟器的话，可以打开AVD设置中的**Hardware keyboard present**，实现用打字代替语音。

![](03_actions.png)![](13_voicereply.png)

## 定义语音输入

为了创建一个支持语音输入的action，需要创建一个[RemoteInput.Builder](http://developer.android.com/reference/android/support/v4/app/RemoteInput.Builder.html)的实例，将其加到你的Notification的action中。这个类的构造函数接受一个String类型的参数，该参数的含义是系统用来作为语音输入的key，这个key可以用来在手持设备中检索出所需要的那一次语音输入的内容。

举个例子，下面展示了如何创建一个[RemoteInput](http://developer.android.com/reference/android/support/v4/app/RemoteInput.html)对象，并且提供了一个自定义的label用于提示语音输入。

```java
// Key for the string that's delivered in the action's intent
private static final String EXTRA_VOICE_REPLY = "extra_voice_reply";

String replyLabel = getResources().getString(R.string.reply_label);

RemoteInput remoteInput = new RemoteInput.Builder(EXTRA_VOICE_REPLY)
        .setLabel(replyLabel)
        .build();
```

### 添加预先设定的文本反馈

除了要打开语音输入支持之外，你还可以提供多达5条的文本反馈，这样用户可以直接进行选择实现快速回复。该功能可通过调用[setChoices()](http://developer.android.com/reference/android/support/v4/app/RemoteInput.Builder.html#setChoices(java.lang.CharSequence[])并传递一个String数组实现。

![](12_voicereply.png)

举个例子，你可以用resource数组的方式定义这些反馈。

res/values/strings.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string-array name="reply_choices">
        <item>Yes</item>
        <item>No</item>
        <item>Maybe</item>
    </string-array>
</resources>
```

然后，获得该数组，并将其添加到[RemoteInput](http://developer.android.com/reference/android/support/v4/app/RemoteInput.html)中：

```java
public static final EXTRA_VOICE_REPLY = "extra_voice_reply";
...
String replyLabel = getResources().getString(R.string.reply_label);
String[] replyChoices = getResources().getStringArray(R.array.reply_choices);

RemoteInput remoteInput = new RemoteInput.Builder(EXTRA_VOICE_REPLY)
        .setLabel(replyLabel)
        .setChoices(replyChoices)
        .build();
```

## 添加语音输入作为Notification的action

为了实现设置语音输入，可以把你的[RemoteInput](http://developer.android.com/reference/android/support/v4/app/RemoteInput.html)对象通过[addRemoteInput()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Action.Builder.html#addRemoteInput(android.support.v4.app.RemoteInput)设置到一个action中。然后你可以将这个action应用到Notification中，例如：

```java
// Create an intent for the reply action
Intent replyIntent = new Intent(this, ReplyActivity.class);
PendingIntent replyPendingIntent =
        PendingIntent.getActivity(this, 0, replyIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

// Create the reply action and add the remote input
NotificationCompat.Action action =
        new NotificationCompat.Action.Builder(R.drawable.ic_reply_icon,
                getString(R.string.label, replyPendingIntent))
                .addRemoteInput(remoteInput)
                .build();

// Build the notification and add the action via WearableExtender
Notification notification =
        new NotificationCompat.Builder(mContext)
                .setSmallIcon(R.drawable.ic_message)
                .setContentTitle(getString(R.string.title))
                .setContentText(getString(R.string.content))
                .extend(new WearableExtender().addAction(action))
                .build();

// Issue the notification
NotificationManagerCompat notificationManager =
        NotificationManagerCompat.from(mContext);
notificationManager.notify(notificationId, notification);
```

当程序发出这个Notification的时候，用户在wear上左滑便可以看到reply的按钮。

## 接受语音输入作为String值

通过调用[getResultsFromIntent()](http://developer.android.com/reference/android/support/v4/app/RemoteInput.html#getResultsFromIntent(android.content.Intent)方法，将返回的值放在"Reply"的action指定的intent中，你便可以在回复的action的intent中指定的activity里，接收到用户转录后的消息。

该方法返回的是一个[Bundle](http://developer.android.com/reference/android/os/Bundle.html)，里面包含了文本反馈的内容，接下来你可以通过查询[Bundle](http://developer.android.com/reference/android/os/Bundle.html)中的内容来获得这条反馈。

> **Note:**请不要使用[Intent.getExtras()](http://developer.android.com/reference/android/content/Intent.html#getExtras()来获取语音输入的结果，因为语音输入的内容是保存成[ClipData](http://developer.android.com/reference/android/content/ClipData.html)形式的。[getResultsFromIntent()](http://developer.android.com/reference/android/support/v4/app/RemoteInput.html#getResultsFromIntent(android.content.Intent)提供了一条很方便的途径来接收字符数组类型的语音信息，并且不需要你自己来处理[ClipData](http://developer.android.com/reference/android/content/ClipData.html)数据。

下面的代码展示了一个接收intent，并且返回语音反馈信息的方法，该方法是依据之前例子中的`EXTRA_VOICE_REPLY`作为key进行检索。

```java
/**
 * Obtain the intent that started this activity by calling
 * Activity.getIntent() and pass it into this method to
 * get the associated voice input string.
 */

private CharSequence getMessageText(Intent intent) {
    Bundle remoteInput = RemoteInput.getResultsFromIntent(intent);
        if (remoteInput != null) {
            return remoteInput.getCharSequence(EXTRA_VOICE_REPLY);
        }
    }
    return null;
}
```

下一课：[为Notification添加显示页面](pages.html)



