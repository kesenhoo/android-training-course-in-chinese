# 接收从其他App返回的数据

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/sharing/receive.html>

就像你的程序能够发送数据到其他程序一样，其他程序也能够方便的接收发送过来的数据。需要考虑的是用户与你的程序如何进行交互，你想要从其他程序接收哪些数据类型。例如，一个社交网络程序会希望能够从其他程序接受文本数据，像一个有趣的网址链接。Google+的Android客户端会接受文本数据与单张或者多张图片。用这个app，用户可以简单的从Gallery程序选择一张图片来启动Google+进行发布。

<!-- more -->

## 更新你的manifest文件(Update Your Manifest)

Intent filters通知了Android系统说，一个程序会接受哪些数据。像上一课一样，你可以创建intent filters来表明程序能够接收哪些action。下面是个例子，对三个activit分别指定接受单张图片，文本与多张图片。(这里有不清楚Intent filter的，请参考[Intents and Intent Filters](http://developer.android.com/guide/topics/intents/intents-filters.html#ifs))

```xml
<activity android:name=".ui.MyActivity" >
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="image/*" />
    </intent-filter>
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="text/plain" />
    </intent-filter>
    <intent-filter>
        <action android:name="android.intent.action.SEND_MULTIPLE" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="image/*" />
    </intent-filter>
</activity>
```

当另外一个程序尝试分享一些东西的时候，你的程序会被呈现在一个列表里面让用户进行选择。如果用户选择了你的程序，相应的activity就应该被调用开启，这个时候就是你如何处理获取到的数据的问题了。

## 处理接受到的数据(Handle the Incoming Content)

为了处理从Intent带过来的数据，可以通过调用getIntent()方法来获取到Intent对象。一旦你拿到这个对象，你可以对里面的数据进行判断，从而决定下一步应该做什么。请记住，如果一个activity可以被其他的程序启动，你需要在检查intent的时候考虑这种情况(是被其他程序而调用启动的)。

```java
void onCreate (Bundle savedInstanceState) {
    ...
    // Get intent, action and MIME type
    Intent intent = getIntent();
    String action = intent.getAction();
    String type = intent.getType();

    if (Intent.ACTION_SEND.equals(action) && type != null) {
        if ("text/plain".equals(type)) {
            handleSendText(intent); // Handle text being sent
        } else if (type.startsWith("image/")) {
            handleSendImage(intent); // Handle single image being sent
        }
    } else if (Intent.ACTION_SEND_MULTIPLE.equals(action) && type != null) {
        if (type.startsWith("image/")) {
            handleSendMultipleImages(intent); // Handle multiple images being sent
        }
    } else {
        // Handle other intents, such as being started from the home screen
    }
    ...
}

void handleSendText(Intent intent) {
    String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
    if (sharedText != null) {
        // Update UI to reflect text being shared
    }
}

void handleSendImage(Intent intent) {
    Uri imageUri = (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
    if (imageUri != null) {
        // Update UI to reflect image being shared
    }
}

void handleSendMultipleImages(Intent intent) {
    ArrayList<Uri> imageUris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
    if (imageUris != null) {
        // Update UI to reflect multiple images being shared
    }
}
```

请注意，因为你无法知道其他程序发送过来的数据内容是文本还是其他的数据，因此你需要避免在UI线程里面去处理那些获取到的数据。
更新UI可以像更新EditText一样简单，也可以是更加复杂一点的操作，例如过滤出感兴趣的图片。这完全取决于你的应用接下来要做些什么。

*********************************
