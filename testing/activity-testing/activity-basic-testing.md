# 创建与执行测试用例

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/activity-basic-testing.html>

为了验证应用的布局设计和功能是否符合预期，为应用的每个Activity建立测试非常重要。对于每一个测试，我们需要在测试用例中创建一个个独立的部分，包括测试数据，前提条件和[Activity](http://developer.android.com/reference/android/app/Activity.html)的测试方法。之后我们就可以运行测试并得到测试报告。如果有任何测试没有通过，这表明在我们代码中可能有潜在的缺陷。

> **注意**: 在测试驱动开发（TDD）方法中, 不推荐先编写大部分或整个应用，并在开发完成后再运行测试。而是应该先编写测试，然后及时编写正确的代码，以通过测试。通过更新测试案例来反映新的功能需求，并以此反复。

## 创建一个测试用例

[Activity](http://developer.android.com/reference/android/app/Activity.html)测试都是通过结构化的方式编写的。请务必把测试代码放在一个单独的包内，从而与被测试的代码分开。

按照惯例，测试包的名称应该遵循与应用包名相同的命名方式，在应用包名后接“.tests”。在创建的测试包中，为我们的测试用例添加Java类。按照惯例，测试用例名称也应遵循要测试的Java或Android的类相同的名称，并增加后缀“Test”。

要在Eclipse中创建一个新的测试用例可遵循如下步骤：

a. 在Package Explorer中，右键点击待测试工程的src/文件夹，**New > Package**。

b. 设置文件夹名称`<你的包名称>.tests`（比如, `com.example.android.testingfun.tests`）并点击**Finish**。

c. 右键点击创建的测试包，并选择**New > Calss**。

d. 设置文件名称`<你的Activity名称>Test`（比如, `MyFirstTestActivityTest`），然后点击**Finish**。

## 建立测试数据集(Fixture)

测试数据集包含运行测试前必须生成的一些对象。要建立测试数据集，可以在我们的测试中覆写<a href="http://developer.android.com/reference/junit/framework/TestCase.html#setUp()">setUp()</a>和<a href="http://developer.android.com/reference/junit/framework/TestCase.html#tearDown()">tearDown()</a>方法。测试会在运行任何其它测试方法之前自动执行<a href="http://developer.android.com/reference/junit/framework/TestCase.html#setUp()">setUp()</a>方法。我们可以用这些方法使得被测试代码与测试初始化和清理是分开的。

在你的Eclipse中建立测试数据集:

1 . 在 Package Explorer中双击测试打开之前编写的测试用例，然后修改测试用例使它继承[ActivityTestCase](http://developer.android.com/reference/android/test/ActivityTestCase.html)的子类。比如：

```java
public class MyFirstTestActivityTest
        extends ActivityInstrumentationTestCase2<MyFirstTestActivity> {
```

2 . 下一步，给测试用例添加构造函数和setUp()方法，并为我们想测试的Activity添加变量声明。比如:

```java
public class MyFirstTestActivityTest
        extends ActivityInstrumentationTestCase2<MyFirstTestActivity> {

    private MyFirstTestActivity mFirstTestActivity;
    private TextView mFirstTestText;

    public MyFirstTestActivityTest() {
        super(MyFirstTestActivity.class);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        mFirstTestActivity = getActivity();
        mFirstTestText =
                (TextView) mFirstTestActivity
                .findViewById(R.id.my_first_test_text_view);
    }
}
```

构造函数是由测试用的Runner调用，用于初始化测试类的，而<a href="http://developer.android.com/reference/junit/framework/TestCase.html#setUp()">setUp()</a>方法是由测试Runner在其他测试方法开始前运行的。

通常在`setUp()`方法中，我们应该:

* 为`setUp()` 调用父类构造函数，这是JUnit要求的。
* 初始化测试数据集的状态，具体而言：
    * 定义保存测试数据及状态的实例变量
    * 创建并保存正在测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)的引用实例。
    * 获得想要测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)中任何UI组件的引用。

我们可以使用<a href="http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#getActivity()">getActivity()</a>方法得到正在测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)的引用。

## 增加一个测试前提

我们最好在执行测试之前，检查测试数据集的设置是否正确，以及我们想要测试的对象是否已经正确地初始化。这样，测试就不会因为有测试数据集的设置错误而失败。按照惯例，验证测试数据集的方法被称为`testPreconditions()`。

例如，我们可能想添加一个像这样的`testPreconditons()`方法:

```java
public void testPreconditions() {
    assertNotNull(“mFirstTestActivity is null”, mFirstTestActivity);
    assertNotNull(“mFirstTestText is null”, mFirstTestText);
}
```

Assertion（断言，译者注）方法源自于Junit[Assert](http://developer.android.com/reference/junit/framework/Assert.html)类。通常，我们可以使用断言来验证某一特定的条件是否是真的。

* 如果条件为假，断言方法抛出一个AssertionFailedError异常，通常会由测试Runner报告。我们可以在断言失败时给断言方法添加一个字符串作为第一个参数从而给出一些上下文详细信息。
* 如果条件为真，测试通过。

在这两种情况下，Runner都会继续运行其它测试用例的测试方法。

## 添加一个测试方法来验证Activity

下一步，添加一个或多个测试方法来验证[Activity](http://developer.android.com/reference/android/app/Activity.html)布局和功能。

例如，如果我们的Activity含有一个[TextView](http://developer.android.com/reference/android/widget/TextView.html)，可以添加如下方法来检查它是否有正确的标签文本:

```java
public void testMyFirstTestTextView_labelText() {
    final String expected =
            mFirstTestActivity.getString(R.string.my_first_test);
    final String actual = mFirstTestText.getText().toString();
    assertEquals(expected, actual);
}
```

该 `testMyFirstTestTextView_labelText()` 方法只是简单的检查Layout中[TextView](http://developer.android.com/reference/android/widget/TextView.html)的默认文本是否和`strings.xml`资源中定义的文本一样。

>**注意**：当命名测试方法时，我们可以使用下划线将被测试的内容与测试用例区分开。这种风格使得我们可以更容易分清哪些是测试用例。

做这种类型的字符串比较时，推荐从资源文件中读取预期字符串，而不是在代码中硬性编写字符串做比较。这可以防止当资源文件中的字符串定义被修改时，会影响到测试的效果。

为了进行比较，预期的和实际的字符串都要做为<a href="http://developer.android.com/reference/junit/framework/Assert.html#assertEquals(java.lang.String, java.lang.String)">assertEquals()</a>方法的参数。如果值是不一样的，断言将抛出一个[AssertionFailedError](http://developer.android.com/reference/junit/framework/AssertionFailedError.html)异常。

如果添加了一个`testPreconditions()`方法，我们可以把测试方法放在testPreconditions之后。

要参看一个完整的测试案例，可以参考本节示例中的MyFirstTestActivityTest.java。

##构建和运行测试

我们可以在Eclipse中的包浏览器（Package Explorer）中运行我们的测试。

利用如下步骤构建和运行测试:

1. 连接一个Android设备，在设备或模拟器中，打开设置菜单，选择开发者选项并确保启用USB调试。

2. 在包浏览器(Package Explorer)中，右键单击测试类，并选择**Run As > Android Junit Test**。

3. 在Android设备选择对话框，选择刚才连接的设备，然后单击“确定”。

4. 在JUnit视图，验证测试是否通过,有无错误或失败。

本节示例代码[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)
