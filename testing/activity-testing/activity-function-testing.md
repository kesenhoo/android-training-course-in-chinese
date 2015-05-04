# 创建功能测试

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/activity-functional-testing.html>

功能测试包括验证单个应用中的各个组件是否与使用者期望的那样（与其它组件）协同工作。比如，我们可以创建一个功能测试验证在用户执行UI交互时[Activity](http://developer.android.com/reference/android/app/Activity.html)是否正确启动目标[Activity](http://developer.android.com/reference/android/app/Activity.html)。

要为[Activity](http://developer.android.com/reference/android/app/Activity.html)创建功能测，我们的测试类应该对[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)进行扩展。与[ActivityUnitTestCase](http://developer.android.com/reference/android/test/ActivityUnitTestCase.html)不同，[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)中的测试可以与Android系统通信，发送键盘输入及点击事件到UI中。

要了解一个完整的测试例子可以参考示例应用中的`SenderActivityTest.java`。

## 添加测试方法验证函数的行为

我们的函数测试目标应该包括:

* 验证UI控制是否正确启动了目标Activity。
* 验证目标Activity的表现是否按照发送Activity提供的数据呈现。

我们可以这样实现测试方法:

```java
@MediumTest
public void testSendMessageToReceiverActivity() {
    final Button sendToReceiverButton = (Button)
            mSenderActivity.findViewById(R.id.send_message_button);

    final EditText senderMessageEditText = (EditText)
            mSenderActivity.findViewById(R.id.message_input_edit_text);

    // Set up an ActivityMonitor
    ...

    // Send string input value
    ...

    // Validate that ReceiverActivity is started
    ...

    // Validate that ReceiverActivity has the correct data
    ...

    // Remove the ActivityMonitor
    ...
}
```

测试会等待匹配的Activity启动，如果超时则会返回null。如果ReceiverActivity启动了，那么先前配置的[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)就会收到一次碰撞（Hit）。我们可以使用断言方法验证ReceiverActivity是否的确启动了，以及[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)记录的碰撞次数是否按照预想地那样增加。

## 设立一个ActivityMonitor

为了在应用中监视单个[Activity](http://developer.android.com/reference/android/app/Activity.html)我们可以注册一个[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)。每当一个符合要求的Activity启动时，系统会通知[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)，进而更新碰撞数目。

通常来说要使用[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)，我们可以这样：

1. 使用<a href="http://developer.android.com/reference/android/test/InstrumentationTestCase.html#getInstrumentation()">getInstrumentation()</a>方法为测试用例实现[Instrumentation](http://developer.android.com/reference/android/app/Instrumentation.html)。
2. 使用[Instrumentation](http://developer.android.com/reference/android/app/Instrumentation.html)的一种addMonitor()方法为当前instrumentation添加一个[Instrumentation.ActivityMonitor](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)实例。匹配规则可以通过[IntentFilter](http://developer.android.com/reference/android/content/IntentFilter.html)或者类名字符串。
3. 等待开启一个Activity。
4. 验证监视器撞击次数的增加。
5. 移除监视器。

下面是一个例子:

```java
// Set up an ActivityMonitor
ActivityMonitor receiverActivityMonitor =
        getInstrumentation().addMonitor(ReceiverActivity.class.getName(),
        null, false);

// Validate that ReceiverActivity is started
TouchUtils.clickView(this, sendToReceiverButton);
ReceiverActivity receiverActivity = (ReceiverActivity)
        receiverActivityMonitor.waitForActivityWithTimeout(TIMEOUT_IN_MS);
assertNotNull("ReceiverActivity is null", receiverActivity);
assertEquals("Monitor for ReceiverActivity has not been called",
        1, receiverActivityMonitor.getHits());
assertEquals("Activity is of wrong type",
        ReceiverActivity.class, receiverActivity.getClass());

// Remove the ActivityMonitor
getInstrumentation().removeMonitor(receiverActivityMonitor);
```

## 使用Instrumentation发送一个键盘输入

如果[Activity](http://developer.android.com/reference/android/app/Activity.html)有一个[EditText](http://developer.android.com/reference/android/widget/EditText.html)，我们可以测试用户是否可以给[EditText](http://developer.android.com/reference/android/widget/EditText.html)对象输入数值。

通常在[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)中给[EditText](http://developer.android.com/reference/android/widget/EditText.html)对象发送串字符，我们可以这样做：

1. 使用<a href="http://developer.android.com/reference/android/app/Instrumentation.html#runOnMainSync(java.lang.Runnable)">runOnMainSync()</a>方法在一个循环中同步地调用<a href="http://developer.android.com/reference/android/view/View.html#requestFocus()">requestFocus()</a>。这样，我们的UI线程就会在获得焦点前一直被阻塞。
2. 调用<a href="http://developer.android.com/reference/android/app/Instrumentation.html#waitForIdleSync()">waitForIdleSync()</a>方法等待主线程空闲（也就是说,没有更多事件需要处理）。
3. 调用<a href="http://developer.android.com/reference/android/app/Instrumentation.html#sendStringSync(java.lang.String)">sendStringSync()</a>方法给[EditText](http://developer.android.com/reference/android/widget/EditText.html)对象发送一个我们输入的字符串。

比如:

```java
// Send string input value
getInstrumentation().runOnMainSync(new Runnable() {
    @Override
    public void run() {
        senderMessageEditText.requestFocus();
    }
});
getInstrumentation().waitForIdleSync();
getInstrumentation().sendStringSync("Hello Android!");
getInstrumentation().waitForIdleSync();
```

本节例子[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)
