# 创建功能测试

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:

功能测试包括验证单个应用组件是否与使用者期望的那样(与其它组件)协同工作。比如,你可以创建一个功能测试验证在用户执行UI交互时[Activity](http://developer.android.com/reference/android/app/Activity.html)是否正确启动目标[Activity](http://developer.android.com/reference/android/app/Activity.html)。

要为你的[Activity](http://developer.android.com/reference/android/app/Activity.html)创建功能测试,你的测试类应该扩展[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)。与[ActivityUnitTestCase](http://developer.android.com/reference/android/test/ActivityUnitTestCase.html)不同的是在[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)中可以与Android系统通信以及发送键盘输入和点击事件到UI。

要了解一个完整的测试例子,看一下示例应用中的SenderActivityTest.java。

##添加测试方法验证函数的行为

你的函数测试目标应该包括:

* 验证UI控制是否正确启动了目标Activity。

* 验证目标Activity的表现是否按照发送Activity提供的数据呈现。

你应该这样实现你的方法:

```xml
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

测试等待与屏幕匹配的Activity,否则返回会在超时后返回null。如果ReceiverActivity启动了,那么你先前设立的[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)就会收到一次撞击。你可以使用断言方法验证ReceiverActivity是否的确启动了,并且[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)记录撞击次数会按照预想的那样增加。

##设立一个ActivityMonitor

为了再你的应用中监视单个[Activity](http://developer.android.com/reference/android/app/Activity.html),你可以注册一个[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)。[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)是由系统在每当一个Activity与你的要求符合是开启的。如果发现匹配,监视器的撞击计数就会更新。

通常来说要使用[ActivityMoniter](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html),你应该这样:

1. 使用[getInstrumentation()](http://developer.android.com/reference/android/test/InstrumentationTestCase.html#getInstrumentation())方法为你的测试用例实现[Instrumentation](http://developer.android.com/reference/android/app/Instrumentation.html)。

2. 为当前使用[Instrumentation](http://developer.android.com/reference/android/app/Instrumentation.html)addMonitor()方法的instrumentation添加一个[Instrumentation.ActivityMonitor](http://developer.android.com/reference/android/app/Instrumentation.ActivityMonitor.html)实例。匹配规则可以是通过[IntentFilter](http://developer.android.com/reference/android/content/IntentFilter.html)或者一个类名。

3. 等待开启一个Activity。

4. 验证监视器撞击次数的增加。

5. 移除监视器。

下面是一个例子:

```xml
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

##使用Instrumentation发送一个键盘输入

如果你的[Activity](http://developer.android.com/reference/android/app/Activity.html)有一个[EditText](http://developer.android.com/reference/android/widget/EditText.html),你想要测试用户是否可以给[EditText](http://developer.android.com/reference/android/widget/EditText.html)对象输入数值。

通常在[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)中给[EditText](http://developer.android.com/reference/android/widget/EditText.html)对象发送串字符,你应该这样作:

1. 使用[runOnMainSync()](http://developer.android.com/reference/android/app/Instrumentation.html#runOnMainSync(java.lang.Runnable))方法在一个循环中同步调用[requestFocus()](http://developer.android.com/reference/android/view/View.html#requestFocus())。这样,你的UI线程就会在获得焦点前一直被阻塞。

2. 调用[waitForIdleSync()](http://developer.android.com/reference/android/app/Instrumentation.html#waitForIdleSync())方法等待主线程空闲(也就是说,没有更多的运行事件)。

3. 调用[sendStringSync()](http://developer.android.com/reference/android/app/Instrumentation.html#sendStringSync(java.lang.String))方法给[EditText](http://developer.android.com/reference/android/widget/EditText.html)对象发送一个你输入的字符串。

想这样:

```xml
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
