# Intent过滤

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/intents/filters.html>

前两节课主要讲了从一个app启动另外一个app。但如果我们的app的功能对别的app也有用，那么其应该做好响应的准备。例如，如果创建了一个social app，它可以分享messages 或者 photos 给好友，那么最好我们的app能够接收`ACTION_SEND` 的intent,这样当用户在其他app触发分享功能的时候，我们的app能够出现在待选对话框。

通过在manifest文件中的[`<activity>`](http://developer.android.com/guide/topics/manifest/activity-element.html)标签下添加[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)的属性，使其他的app能够启动我们的activity。

当app被安装到设备上时，系统可以识别intent filter并把这些信息记录下来。当其他app使用implicit intent执行 startActivity() 或者 startActivityForResult()时，系统会自动查找出那些可以响应该intent的activity。

<!-- more -->

## 添加Intent Filter

为了尽可能确切的定义activity能够handle的intent，每一个intent filter都应该尽可能详尽的定义好action与data。

若activity中的intent filter满足以下intent对象的标准，系统就能够把特定的intent发送给activity：

* **Action**:一个想要执行的动作的名称。通常是系统已经定义好的值，如`ACTION_SEND`或`ACTION_VIEW`。
在intent filter中通过[`<action>`](http://developer.android.com/guide/topics/manifest/action-element.html)指定它的值，值的类型必须为字符串，而不是API中的常量(看下面的例子)

* **Data**:Intent附带数据的描述。在intent filter中通过[`<data>`](http://developer.android.com/guide/topics/manifest/data-element.html)指定它的值，可以使用一个或者多个属性，我们可以只定义MIME type或者是只指定URI prefix，也可以只定义一个URI scheme，或者是他们综合使用。

> **Note:** 如果不想handle Uri 类型的数据，那么应该指定 android:mimeType 属性。例如 text/plain or image/jpeg.

* **Category**:提供一个附加的方法来标识这个activity能够handle的intent。通常与用户的手势或者是启动位置有关。系统有支持几种不同的categories,但是大多数都很少用到。而且，所有的implicit intents都默认是 CATEGORY_DEFAULT 类型的。在intent filter中用[`<category>`](http://developer.android.com/guide/topics/manifest/category-element.html)指定它的值。

在我们的intent filter中，可以在`<intent-filter>`元素中定义对应的XML元素来声明我们的activity使用何种标准。

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

每一个发送出来的intent只会包含一个action与data类型，但handle这个intent的activity的 `<intent-filter>`可以声明多个`<action>`, `<category>`与`<data>` 。

如果任何的两对action与data是互相矛盾的，就应该创建不同的intent filter来指定特定的action与type。

例如，假设我们的activity可以handle 文本与图片，无论是`ACTION_SEND`还是`ACTION_SENDTO` 的intent。在这种情况下，就必须为两个action定义两个不同的intent filter。因为`ACTION_SENDTO` intent 必须使用 Uri 类型来指定接收者使用 send 或 sendto 的地址。例如：

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

> **Note:**为了接受implicit intents, 必须在我们的intent filter中包含 CATEGORY_DEFAULT 的category。startActivity()和startActivityForResult()方法将所有intent视为声明了CATEGORY_DEFAULT category。如果没有在的intent filter中声明CATEGORY_DEFAULT，activity将无法对implicit intent做出响应。

更多sending 与 receiving ACTION_SEND intents执行social sharing行为的，请查看上一课：[接收Activity返回的结果(Getting a Result from an Activity)](result.html)

## 在Activity中Handle发送过来的Intent

为了决定采用哪个action，我们可以读取Intent的内容。

可以执行<a href="http://developer.android.com/reference/android/app/Activity.html#getIntent()">getIntent()</a> 来获取启动我们activity的那个intent。我们可以在activity生命周期的任何时候去执行这个方法，但最好是在`onCreate()`或者` onStart()`里面去执行。

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

如果想返回一个result给启动的那个activity，仅仅需要执行<a href="http://developer.android.com/reference/android/app/Activity.html#setResult(int, android.content.Intent)">setResult()</a>，通过指定一个result code与result intent。操作完成之后，用户需要返回到原来的activity，通过执行finish() 关闭被唤起的activity。

```java
 // Create intent to deliver some kind of result data
Intent result = new Intent("com.example.RESULT_ACTION", Uri.parse("content://result_uri");
setResult(Activity.RESULT_OK, result);
finish();
```

我们必须总是指定一个result code。通常不是`RESULT_OK`就是`RESULT_CANCELED`。我们可以通过Intent 来添加需要返回的数据。

> **Note:**默认的result code是`RESULT_CANCELED`.因此，如果用户在没有完成操作之前点击了back key，那么之前的activity接受到的result code就是"canceled"。

如果只是纯粹想要返回一个int来表示某些返回的result数据之一，则可以设置result code为任何大于0的数值。如果我们返回的result只是一个int，那么连intent都可以不需要返回了，可以调用`setResult()`然后只传递result code如下：

```java
setResult(RESULT_COLOR_RED);
finish();
```

> **Note:**我们没有必要在意自己的activity是被用startActivity() 还是 startActivityForResult()方法所叫起的。系统会自动去判断该如何传递result。在不需要的result的case下，result会被自动忽略。
