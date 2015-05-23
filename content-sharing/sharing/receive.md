# 接收从其他App传送来的数据

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/sharing/receive.html>

就像我们的程序能够分享数据给其他程序一样，其也能方便的接收来自其他程序的数据。需要考虑的是用户与我们的程序如何进行交互，以及我们想要从其他程序接收数据的类型。例如，一个社交网络程序可能会希望能够从其他程序接受文本数据，比如一个有趣的网址链接。Google+的Android客户端会接受文本数据与单张或者多张图片。用户可以简单的从Gallery程序选择一张图片来启动Google+，并利用其发布文本或图片。

<!-- more -->

## 更新我们的manifest文件(Update Your Manifest)

Intent filters告诉Android系统一个程序愿意接受的数据类型。类似于上一课，我们可以创建intent filters来表明程序能够接收的action类型。下面是个例子，对三个activit分别指定接受单张图片，文本与多张图片。(Intent filter相关资料，请参考[Intents and Intent Filters](http://developer.android.com/guide/topics/intents/intents-filters.html#ifs))

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

当某个程序尝试通过创建一个intent并将其传递给startActivity来分享一些东西时，我们的程序会被呈现在一个列表中让用户进行选择。如果用户选择了我们的程序，相应的activity会被调用开启，这个时候就是我们如何处理获取到的数据的问题了。

## 处理接受到的数据(Handle the Incoming Content)

为了处理从Intent带来的数据，可以通过调用getIntent()方法来获取到Intent对象。拿到这个对象后，我们可以对其中面的数据进行判断，从而决定下一步行为。请记住，如果一个activity可以被其他的程序启动，我们需要在检查intent的时候考虑这种情况(是被其他程序而调用启动的)。

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

请注意，由于无法知道其他程序发送过来的数据内容是文本还是其他类型的数据，若数据量巨大，则需要大量处理时间，因此我们应避免在UI线程里面去处理那些获取到的数据。

更新UI可以像更新EditText一样简单，也可以是更加复杂一点的操作，例如过滤出感兴趣的图片。这完全取决于我们的应用接下来要做些什么。

*********************************
