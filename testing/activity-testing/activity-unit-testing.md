# 创建单元测试

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:

一个[Activity](http://developer.android.com/reference/android/app/Activity.html)测试单元是快速验证一个[Activity](http://developer.android.com/reference/android/app/Activity.html)的状态以及与其它独立组件(也就是和系统其它部分分离的部分)交互的最优方式。一个测试单元通常是测试代码中可能性最小的代码块(可以是一个方法,类,或者组件),而且也不依赖于系统或网络资源。比如说,你可以写一个测试单元去检查Activity是否有正确的布局或者它的触发器,以及Intent对象的正确性。

测试单元一般不适合测试与系统有复杂交互事件的UI。相反,你应该使用像ActivityInstrumentationTestCase2的类作为测试UI组建的描述。

这节内容将会教你编写一个测试单元来验证一个Intent是否正确触发了另一个[Activity](http://developer.android.com/reference/android/app/Activity.html)。由于测试是与环境独立的,所以[Intent](http://developer.android.com/reference/android/content/Intent.html)被发送给Android系统的,但你可以检查Intent对象的有效数据的正确性。对于一个完备的测试案例, 可以参考一下示例代码中的LaunchActivityTest.java。

**注意**要测试对系统或外部的依赖,你可以使用来自Mocking Framework的Mock类并把它插入你的测试单元。要了解更多关于Android提供的Mocking Framework内容请参看[Mock Object Classes](http://developer.android.com/tools/testing/testing_android.html#MockObjectClasses)。

##编写一个Android单元测试例子

ActiviUnitTestCase类提供了单个[Activity](http://developer.android.com/reference/android/app/Activity.html)测试的支持。要创建测试单元,你的测试类应该继承自ActiviUnitTestCase。继承ActiviUnitTestCase的Activity不会被Android自动启动的。要单独启动Activity,你需要显式的调用startActivity()方法,并传递一个[Intent](http://developer.android.com/reference/android/content/Intent.html)来启动你的目标[Activity](http://developer.android.com/reference/android/app/Activity.html)。

For example:


```xml
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

##验证另一个Activity的启动

你的单元测试目标可能包括:

* 验证当Button被按下是启动的LaunchActivity是否正确。

* 验证启动的Intent是否包含有效的数据。

为验证一个[Intent](http://developer.android.com/reference/android/content/Intent.html)Button触发的事件,你可以使用[getStartedActivityIntent](http://developer.android.com/reference/android/test/ActivityUnitTestCase.html#getStartedActivityIntent())()方法。通过使用断言方法,你可以验证返回的[Intent](http://developer.android.com/reference/android/content/Intent.html)是否为空,以及是否包含了预期的数据来启动下一个Activity。如果你俩个断言值都是真,那你就成功的验证了你Activity发送的Intent的正确性了。

你应该这样实现你的方法:


```xml
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

因为LaunchActivity是独立运行的,所以不可以使用[TouchUtils](http://developer.android.com/reference/android/test/TouchUtils.html)库来操作UI。要正确处理[Button](http://developer.android.com/reference/android/widget/Button.html)点击,你可以调用[perfoemClick()](http://developer.android.com/reference/android/view/View.html#performClick())方法

本节示例代码[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)

