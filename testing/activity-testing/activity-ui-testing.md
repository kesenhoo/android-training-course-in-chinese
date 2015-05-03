# 测试UI组件

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/activity-ui-testing.html>

通常情况下，[Activity](http://developer.android.com/reference/android/app/Activity.html)，包括用户界面组件（如按钮，复选框，可编辑的文本域，和选框）允许用户与Android应用程序交互。本节介绍如何对一个简单的带有按钮的界面交互测试。我们可以使用相同的步骤来测试其他更复杂的UI组件。

> **注意**: 这一节的测试方法叫做白盒测试，因为我们拥有要测试应用程序的源码。Android Instrumentation框架适用于创建应用程序中UI部件的白盒测试。用户界面测试的另一种类型是黑盒测试，即无法得知应用程序源代码的类型。这种类型的测试可以用来测试应用程序如何与其他应用程序，或与系统进行交互。黑盒测试不包括在本节中。了解更多关于如何在你的Android应用程序进行黑盒测试，请阅读[UI Testing guide](http://developer.android.com/tools/testing/testing_ui.html)。

要参看完整的测试案例，可以查看本节示例代码中的`ClickFunActivityTest.java`文件。

## 使用 Instrumentation 建立UI测试

当测试拥有UI的Activity时，被测试的Activity在UI线程中运行。然而，测试程序会在程序自己的进程中，单独的一个线程内运行。这意味着，我们的测试程序可以获得UI线程的对象，但是如果它尝试改变UI线程对象的值，会得到`WrongThreadException`错误。

为了安全地将`Intent`注入到`Activity`，或是在UI线程中执行测试方法，我们可以让测试类继承于[ActivityInstrumentationTestCase2](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html)。要学习如何在UI线程运行测试方法，请看[在UI线程测试](http://developer.android.com/tools/testing/activity_testing.html#RunOnUIThread)。

### 建立测试数据集（Fixture）

当为UI测试建立测试数据集时，我们应该在<a href="http://developer.android.com/reference/junit/framework/TestCase.html#setUp()">setUp()</a>方法中指定[touch mode](http://developer.android.com/guide/topics/ui/ui-events.html#TouchMode)。把touch mode设置为真可以防止在执行编写的测试方法时，人为的UI操作获取到控件的焦点（比如,一个按钮会触发它的点击监听器）。确保在调用<a href="http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#getActivity()">getActivity()</a>方法前调用了[setActivityInitialTouchMode](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#setActivityInitialTouchMode(boolean))。

比如:

```java
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

## 添加测试方法确认UI响应表现

UI测试目标应包括:

*. 检验[Activity](http://developer.android.com/reference/android/app/Activity.html)启动时[Button](http://developer.android.com/reference/android/widget/Button.html)在正确布局位置显示。
*. 检验[TextView](http://developer.android.com/reference/android/widget/TextView.html)初始化时是隐藏的。
*. 检验[TextView](http://developer.android.com/reference/android/widget/TextView.html)在[Button](http://developer.android.com/reference/android/widget/Button.html)点击时显示预期的字符串

接下来的部分会演示怎样实现上述验证方法

### 验证Button布局参数

我们应该像如下添加的测试方法那样。验证[Activity](http://developer.android.com/reference/android/app/Activity.html)中的按钮是否正确显示:

```java
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

在调用<a href="http://developer.android.com/reference/android/test/ViewAsserts.html#assertOnScreen(android.view.View, android.view.View)">assertOnScreen()</a>方法时，传递根视图以及期望呈现在屏幕上的视图作为参数。如果想呈现的视图没有在根视图中,该方法会抛出一个[AssertionFailedError](http://developer.android.com/reference/junit/framework/AssertionFailedError.html)异常，否则测试通过。

我们也可以通过获取一个[ViewGroup.LayoutParams](http://developer.android.com/reference/android/view/ViewGroup.LayoutParams.html)对象的引用验证[Button](http://developer.android.com/reference/android/widget/Button.html)布局是否正确，然后调用`assert`方法验证[Button](http://developer.android.com/reference/android/widget/Button.html)对象的宽高属性值是否与预期值一致。

`@MediumTest`注解指定测试是如何归类的（和它的执行时间相关）。要了解更多有关测试的注解，见本节示例。

### 验证TextView的布局参数

可以像这样添加一个测试方法来验证[TextView](http://developer.android.com/reference/android/widget/TextView.html)最初是隐藏在[Activity](http://developer.android.com/reference/android/app/Activity.html)中的:

```java
@MediumTest
public void testInfoTextView_layout() {
    final View decorView = mClickFunActivity.getWindow().getDecorView();
    ViewAsserts.assertOnScreen(decorView, mInfoTextView);
    assertTrue(View.GONE == mInfoTextView.getVisibility());
}
```

我们可以调用`getDecorView()`方法得到一个[Activity](http://developer.android.com/reference/android/app/Activity.html)中修饰试图（Decor View）的引用。要修饰的View在布局层次视图中是最上层的ViewGroup([FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html))

### 验证按钮的行为

可以使用如下测试方法来验证当按下按钮时[TextView](http://developer.android.com/reference/android/widget/TextView.html)变得可见:

```java
@MediumTest
public void testClickMeButton_clickButtonAndExpectInfoText() {
    String expectedInfoText = mClickFunActivity.getString(R.string.info_text);
    TouchUtils.clickView(this, mClickMeButton);
    assertTrue(View.VISIBLE == mInfoTextView.getVisibility());
    assertEquals(expectedInfoText, mInfoTextView.getText());
}
```

在测试中调用<a href="http://developer.android.com/reference/android/test/TouchUtils.html#clickView(android.test.InstrumentationTestCase, android.view.View)">clickView()</a>可以让我们用编程方式点击一个按钮。我们必须传递正在运行的测试用例的一个引用和要操作按钮的引用。

> **注意**:[TouchUtils](http://developer.android.com/reference/android/test/TouchUtils.html)辅助类提供与应用程序交互的方法可以方便进行模拟触摸操作。我们可以使用这些方法来模拟点击，轻敲，或应用程序屏幕拖动View。

> **警告**[TouchUtils](http://developer.android.com/reference/android/test/TouchUtils.html)方法的目的是将事件安全地从测试线程发送到UI线程。我们不可以直接在UI线程或任何标注@UIThread的测试方法中使用[TouchUtils](http://developer.android.com/reference/android/test/TouchUtils.html)这样做可能会增加错误线程异常。

## 应用测试注解

[@SmallTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/SmallTest.html)

    标志该测试方法是小型测试的一部分。

[@MediumTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/MediumTest.html)

    标志该测试方法是中等测试的一部分。

[@LargeTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/LargeTest.html)

    标志该测试方法是大型测试的一部分。

通常情况下，如果测试方法只需要几毫秒的时间，那么它应该被标记为[@SmallTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/SmallTest.html)，长时间运行的测试（100毫秒或更多）通常被标记为[@MediumTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/MediumTest.html)或[@LargeTest](http://developer.android.com/reference/android/test/suitebuilder/annotation/LargeTest.html)，这主要取决于测试访问资源在网络上或在本地系统。 可以参看[Android Tools Protip](https://plus.google.com/+AndroidDevelopers/posts/TPy1EeSaSg8)，它可以更好地指导我们使用测试注释

我们可以创建其它的测试注释来控制测试的组织和运行。要了解更多关于其他注释的信息，见[Annotation](http://developer.android.com/reference/java/lang/annotation/Annotation.html)类参考。

本节示例代码[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)
