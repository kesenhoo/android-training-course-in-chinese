# 创建单元测试

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/activity-unit-testing.html>

[Activity](http://developer.android.com/reference/android/app/Activity.html)单元测试可以快速且独立地（和系统其它部分分离）验证一个[Activity](http://developer.android.com/reference/android/app/Activity.html)的状态以及其与其它组件交互的正确性。一个单元测试通常用来测试代码中最小单位的代码块（可以是一个方法，类，或者组件），而且也不依赖于系统或网络资源。比如说，你可以写一个单元测试去检查Activity是否正确地布局或者是否可以正确地触发一个Intent对象。

单元测试一般不适合测试与系统有复杂交互的UI。我们应该使用如同[测试UI组件](activity-ui-testing.md)所描述的`ActivityInstrumentationTestCase2`来对这类UI交互进行测试。

这节内容将会讲解如何编写一个单元测试来验证一个[Intent](http://developer.android.com/reference/android/content/Intent.html)是否正确地触发了另一个[Activity](http://developer.android.com/reference/android/app/Activity.html)。由于测试是与环境独立的，所以[Intent](http://developer.android.com/reference/android/content/Intent.html)实际上并没有发送给Android系统，但我们可以检查Intent对象的载荷数据是否正确。读者可以参考一下示例代码中的`LaunchActivityTest.java`，将它作为一个例子，了解完备的测试用例是怎么样的。

> **注意**: 如果要针对系统或者外部依赖进行测试，我们可以使用Mocking Framework的Mock类，并把它集成到我们的你的单元测试中。要了解更多关于Android提供的Mocking Framework内容请参考[Mock Object Classes](http://developer.android.com/tools/testing/testing_android.html#MockObjectClasses)。

## 编写一个Android单元测试例子

ActiviUnitTestCase类提供对于单个[Activity](http://developer.android.com/reference/android/app/Activity.html)进行分离测试的支持。要创建单元测试，我们的测试类应该继承自`ActiviUnitTestCase`。继承`ActiviUnitTestCase`的Activity不会被Android自动启动。要单独启动Activity，我们需要显式的调用startActivity()方法，并传递一个[Intent](http://developer.android.com/reference/android/content/Intent.html)来启动我们的目标[Activity](http://developer.android.com/reference/android/app/Activity.html)。

例如：

```java
public class LaunchActivityTest
        extends ActivityUnitTestCase<LaunchActivity> {
    ...

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        mLaunchIntent = new Intent(getInstrumentation()
                .getTargetContext(), LaunchActivity.class);
        startActivity(mLaunchIntent, null, null);
        final Button launchNextButton =
                (Button) getActivity()
                .findViewById(R.id.launch_next_activity_button);
    }
}
```

## 验证另一个Activity的启动

我们的单元测试目标可能包括:

* 验证当Button被按下时，启动的LaunchActivity是否正确。
* 验证启动的Intent是否包含有效的数据。

为了验证一个触发[Intent](http://developer.android.com/reference/android/content/Intent.html)的Button的事件，我们可以使用<a href="http://developer.android.com/reference/android/test/ActivityUnitTestCase.html#getStartedActivityIntent()">getStartedActivityIntent()</a>方法。通过使用断言方法，我们可以验证返回的[Intent](http://developer.android.com/reference/android/content/Intent.html)是否为空，以及是否包含了预期的数据来启动下一个Activity。如果两个断言值都是真，那么我们就成功地验证了Activity发送的Intent是正确的了。

我们可以这样实现测试方法:

```java
@MediumTest
public void testNextActivityWasLaunchedWithIntent() {
    startActivity(mLaunchIntent, null, null);
    final Button launchNextButton =
            (Button) getActivity()
            .findViewById(R.id.launch_next_activity_button);
    launchNextButton.performClick();

    final Intent launchIntent = getStartedActivityIntent();
    assertNotNull("Intent was null", launchIntent);
    assertTrue(isFinishCalled());

    final String payload =
            launchIntent.getStringExtra(NextActivity.EXTRAS_PAYLOAD_KEY);
    assertEquals("Payload is empty", LaunchActivity.STRING_PAYLOAD, payload);
}
```

因为LaunchActivity是独立运行的，所以不可以使用[TouchUtils](http://developer.android.com/reference/android/test/TouchUtils.html)库来操作UI。如果要直接进行[Button](http://developer.android.com/reference/android/widget/Button.html)点击，我们可以调用<a href="http://developer.android.com/reference/android/view/View.html#performClick()">perfoemClick()</a>方法。

本节示例代码[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)

