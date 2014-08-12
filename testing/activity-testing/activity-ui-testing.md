# 测试UI组件

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:

通常情况下，你的[Activity](http://developer.android.com/reference/android/app/Activity.html)，包括用户界面组件（如按钮，复选框，可编辑的文本域，和选框）允许你的用户与Android应用程序交互。本节介绍如何用一个简单的按钮的界面交互测试。你可以使用相同的步骤来测试其他的，更复杂的UI组件。

**注意**

这一节叫做白盒测试，因为你拥有要测试应用程序的源码。Android仪表框架适用于创建应用程序中UI部件的白盒测试。用户界面测试的另一种类型是黑盒测试就是那种你可能无法得知应用程序源代码的类型。这种类型的测试可以用来测试你的应用程序如何与其他应用程序，或与系统进行交互。黑盒测试是不包括在本节中的。了解更多关于如何在你的Android应用程序进行黑盒测试，请参看[UI Testing guide](http://developer.android.com/tools/testing/testing_ui.html)。

要参看一个完整的测试案例，可以在本节示例代码中的clickfunactivitytest.java查看。


##建立你的测试夹具(Fixture)

(夹具是用来快速,安全的测试组件功能的工具)

当为UI测试建立夹具时,你应该在[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())方法中指定[touch mode](http://developer.android.com/guide/topics/ui/ui-events.html#TouchMode)。把touch mode设置为真可以防止UI组件抢夺你编程指定的点击方法的焦点事件(比如,一个按钮会撤销它的点击监听器)。确定你在调用[getActivity()](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#getActivity())方法前调用了[setActivityInitialTouchMode](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#setActivityInitialTouchMode(boolean))。

比如:

```xml
public class ClickFunActivityTest
        extends ActivityInstrumentationTestCase2 {
    ...
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        setActivityInitialTouchMode(true);

        mClickFunActivity = getActivity();
        mClickMeButton = (Button)
                mClickFunActivity
                .findViewById(R.id.launch_next_activity_button);
        mInfoTextView = (TextView)
                mClickFunActivity.findViewById(R.id.info_text_view);
    }
}
```

##添加测试方法确认UI响应表现

你的UI测试目标应包括:

*. 检验[Activity](http://developer.android.com/reference/android/app/Activity.html)启动时[Button](http://developer.android.com/reference/android/widget/Button.html)是按照正确布局显示的。

*. 检验[TextView](http://developer.android.com/reference/android/widget/TextView.html)初始化时是隐藏的。

*. 检验[TextView](http://developer.android.com/reference/android/widget/TextView.html)在[Button](http://developer.android.com/reference/android/widget/Button.html)点击时显示预期的字符串

接下来的部分会演示怎样实现上述验证方法

##验证Button布局参数

你应该像这样添加的测试方法验证在你的[Activity](http://developer.android.com/reference/android/app/Activity.html)中按钮是否正确显示:

```xml
@MediumTest
public void testClickMeButton_layout() {
    final View decorView = mClickFunActivity.getWindow().getDecorView();

    ViewAsserts.assertOnScreen(decorView, mClickMeButton);

    final ViewGroup.LayoutParams layoutParams =
            mClickMeButton.getLayoutParams();
    assertNotNull(layoutParams);
    assertEquals(layoutParams.width, WindowManager.LayoutParams.MATCH_PARENT);
    assertEquals(layoutParams.height, WindowManager.LayoutParams.WRAP_CONTENT);
}
```

在调用[assertOnScreen()](http://developer.android.com/reference/android/test/ViewAsserts.html#assertOnScreen(android.view.View, android.view.View))方法时,你传递根视图以及你期望呈现在屏幕上的视图作为参数。如果你想呈现的视图没有在根视图中,该方法会抛出一个[AssertionFailedError](http://developer.android.com/reference/junit/framework/AssertionFailedError.html)异常,除非测试通过。

你也可以通过获取一个[ViewGroup.LayoutParams](http://developer.android.com/reference/android/view/ViewGroup.LayoutParams.html)对象的引用验证[Button](http://developer.android.com/reference/android/widget/Button.html)布局是否正确,然后调用声明方法验证[Button](http://developer.android.com/reference/android/widget/Button.html)对象的宽高属性值是否与预期值一致。

 @MediumTest注释指定测试在于它刚生成时是如何归类的。要了解更多有关使用测试的注释，见本节示例。

##验证TextView的布局参数

你应该像这样添加一个测试方法来验证一个[TextView](http://developer.android.com/reference/android/widget/TextView.html)最初是隐藏在你的[Activity](http://developer.android.com/reference/android/app/Activity.html)的:

```xml
@MediumTest
public void testInfoTextView_layout() {
    final View decorView = mClickFunActivity.getWindow().getDecorView();
    ViewAsserts.assertOnScreen(decorView, mInfoTextView);
    assertTrue(View.GONE == mInfoTextView.getVisibility());
}
```

你可以调用getdecorview()方法得到一个[Activity](http://developer.android.com/reference/android/app/Activity.html)中要修饰的View的引用。要修饰的View在布局层次视图中是最上层的ViewGroup([FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html))

##验证按钮的行为

你可以使用一个这样的测试方法来验证当按下按钮时[TextView](http://developer.android.com/reference/android/widget/TextView.html)变得可见:

```xml
@MediumTest
public void testClickMeButton_clickButtonAndExpectInfoText() {
    String expectedInfoText = mClickFunActivity.getString(R.string.info_text);
    TouchUtils.clickView(this, mClickMeButton);
    assertTrue(View.VISIBLE == mInfoTextView.getVisibility());
    assertEquals(expectedInfoText, mInfoTextView.getText());
}
```

在你的的测试中调用[clickview()](http://developer.android.com/reference/android/test/TouchUtils.html#clickView(android.test.InstrumentationTestCase, android.view.View))以编程方式点击一个按钮。你必须给正在运行的测试用例传递一个引用和要操作按钮的引用。

**注意**:[Touchutils](http://developer.android.com/reference/android/test/TouchUtils.html)助手类提供与应用程序交互的方法可以方便进行模拟触摸操作。你可以使用这些方法来模拟点击，轻敲，或应用程序屏幕拖动View。

**警告**[Touchutils](http://developer.android.com/reference/android/test/TouchUtils.html)方法的目的是将事件安全地从测试线程发送到UI线程。你不应该用[Touchutils](http://developer.android.com/reference/android/test/TouchUtils.html)直接在UI线程或任何标注@UIThread的测试方法这样做可能会增加错误线程异常。

##应用测试的注释

[@SmallTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/SmallTest.html)

    标志着一个测试运行的小型测试的一部分。

[@MediumTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/MediumTest.html)

    标志着一个测试运行的中等测试的一部分。

[@LargeTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/LargeTest.html)

    标志着一个测试运行的大型测试的一部分。

通常情况下，只需要几毫秒的时间的应该被标记为[@SmallTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/SmallTest.html),长时间运行的测试（100毫秒或更多）通常被标记为[@MediumTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/MediumTest.html),[@LargeTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/LargeTest.html),主要取决于测试访问资源在网络上或在本地系统。 可以参看[Android Tools Protip](https://plus.google.com/+AndroidDevelopers/posts/TPy1EeSaSg8)更好的指导你使用测试注释

你可以创建其它的测试注释来控制测试的组织和运行。要了解更多关于其他注释的信息，见[Annotation](http://developer.android.com/reference/java/lang/annotation/Annotation.html)类参考。

本节示例代码[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)
