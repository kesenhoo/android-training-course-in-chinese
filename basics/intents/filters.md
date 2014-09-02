# Intent过滤

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/intents/filters.html>

前两节课主要讲了从你的app启动另外一个app。但如果你的app的功能对别的app也有用，那么你的app应该做好响应的准备。例如，如果你创建了一个social app，它可以分享messages 或者 photos 给好友，那么最好你的app能够接收`ACTION_SEND` 的intent,这样当用户在其他app触发分享功能的时候，你的app能够出现在待选对话框。

为了使得其他的app能够启动你的activity，你需要在你的manifest文件的[`<activity>`](http://developer.android.com/guide/topics/manifest/activity-element.html)标签下添加[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)的属性。

当你的app被安装到设备上时，系统可以识别你的intent filter并把这些信息记录下来。当其他app通过执行 startActivity() 或者 startActivityForResult()方法，并使用implicit intent时，系统可以自动查找出那些可以响应这个intent的activity。

<!-- more -->

## 添加Intent Filter

为了尽可能确切的定义你的activity能够handle哪些intent，每一个intent filter都应该尽可能详尽的定义好action与data。

如果activity中的intent filt满足以下intent对象的标准，系统就能够把特定的intent发送给activity：

* **Action**:一个想要执行的动作的名称。通常是系统已经定义好的值，例如`ACTION_SEND`或者`ACTION_VIEW`。
在intent filt中用[`<action>`](http://developer.android.com/guide/topics/manifest/action-element.html)指定它的值，值的类型必须为字符串，而不是API中的常量(看下面的例子)

* **Data**:Intent附带数据的描述。在intent filt中用[`<data>`](http://developer.android.com/guide/topics/manifest/data-element.html)指定它的值，可以使用一个或者多个属性，你可以只定义MIME type或者是只指定URI prefix，也可以只定义一个URI scheme，或者是他们综合使用。

> **Note:** 如果你不想handle Uri 类型的数据，那么你应该指定 android:mimeType 属性。例如 text/plain or image/jpeg.

* **Category**:提供一个附加的方法来标识这个activity能够handle的intent。通常与用户的手势或者是启动位置有关。系统有支持几种不同的categories,但是大多数都不怎么用的到。而且，所有的implicit intents都默认是 CATEGORY_DEFAULT 类型的。在intent filt中用[`<category>`](http://developer.android.com/guide/topics/manifest/category-element.html)指定它的值。

在你的intent filter中，你可以在`<intent-filter>`元素中定义对应的XML元素来声明你的activity使用何种标准。

例如，这个有intent filter的activity，当数据类型为文本或图像时会处理`ACTION_SEND`的intent。

```xml
<activity android:name="ShareActivity">
    <intent-filter>
        <action android:name="android.intent.action.SEND"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:mimeType="text/plain"/>
        <data android:mimeType="image/*"/>
    </intent-filter>
</activity>
```

每一个发送出来的intent只会包含一个action与type，但是handle这个intent的activity的 `<intent-filter>`是可以声明多个`<action>`, `<category>`与`<data>` 的。

如果任何的两对action与data是互相矛盾的，你应该创建不同的intent fliter来指定特定的action与type。

例如，假设你的activity可以handle 文本与图片，无论是`ACTION_SEND`还是`ACTION_SENDTO` 的intent。在这种情况下，你必须为两个action定义两个不同的intent filter。因为`ACTION_SENDTO` intent 必须使用 Uri 类型来指定接收者使用 send 或 sendto 的地址。例如：

```xml
<activity android:name="ShareActivity">
    <!-- filter for sending text; accepts SENDTO action with sms URI schemes -->
    <intent-filter>
        <action android:name="android.intent.action.SENDTO"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:scheme="sms" />
        <data android:scheme="smsto" />
    </intent-filter>
    <!-- filter for sending text or images; accepts SEND action and text or image data -->
    <intent-filter>
        <action android:name="android.intent.action.SEND"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:mimeType="image/*"/>
        <data android:mimeType="text/plain"/>
    </intent-filter>
</activity>
```

> **Note:**为了接受implicit intents, 你必须在你的intent filter中包含 CATEGORY_DEFAULT 的category。

关于更多sending 与 receiving ACTION_SEND intents来执行social sharing行为的，请查看上一课：[接收Activity返回的结果(Getting a Result from an Activity)](result.html)

## 在你的Activity中Handle发送过来的Intent

为了决定采用哪个action，你可以读取Intent的内容。

你可以执行<a href="http://developer.android.com/reference/android/app/Activity.html#getIntent()">getIntent()</a> 来获取启动你的activity的那个intent。你可以在activity生命周期的任何时候去执行这个方法，但是你最好是在`onCreate()`或者` onStart()`里面去执行。

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    setContentView(R.layout.main);

    // Get the intent that started this activity
    Intent intent = getIntent();
    Uri data = intent.getData();

    // Figure out what to do based on the intent type
    if (intent.getType().indexOf("image/") != -1) {
        // Handle intents with image data ...
    } else if (intent.getType().equals("text/plain")) {
        // Handle intents with text ...
    }
}
```

## 返回Result

如果你想返回一个result给启动你的那个activity，仅仅需要执行<a href="http://developer.android.com/reference/android/app/Activity.html#setResult(int, android.content.Intent)">setResult()</a>，通过指定一个result code与result intent。当你的操作成功之后，用户需要返回到原来的activity，通过执行finish() 来关闭被叫起的activity。

```java
 // Create intent to deliver some kind of result data
Intent result = new Intent("com.example.RESULT_ACTION", Uri.parse("content://result_uri");
setResult(Activity.RESULT_OK, result);
finish();
```

你必须总是指定一个result code。通常不是`RESULT_OK`就是`RESULT_CANCELED`。你可以通过Intent 来添加需要返回的数据。

> **Note:**默认的result code是`RESULT_CANCELED`.因此，如果用户在没有完成操作之前点击了back key，那么之前的activity接受到的result code就是"canceled"。

如果你只是纯粹想要返回一个int来表示某些返回的result数据之一，你可以设置result code为任何大于0的数值。如果你返回的result只是一个int，那么连intent都可以不需要返回了，你可以调用`setResult()`然后只传递result code如下：

```java
setResult(RESULT_COLOR_RED);
finish();
```

> **Note:**我们没有必要在意你的activity是被用startActivity() 还是 startActivityForResult()方法所叫起的。系统会自动去判断改如何传递result。在不需要的result的case下，result会被自动忽略。
