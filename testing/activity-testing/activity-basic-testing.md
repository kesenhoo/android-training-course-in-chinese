# 创建与执行测试用例

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/activity-basic-testing.html>

为了验证布局设计和功能行为在你的应用程序有没有发生变化(不符合预期)， 为应用的每个Activity建立测试是很重要。对于每一个测试，你需要在测试用例中创建一个个独立的部分,包括固定测试数据，前提测试方法和[Activity](http://developer.android.com/reference/android/app/Activity.html)的测试方法。然后你就可以运行测试并得到测试报告。如果任何测试方法失败，这表明在你的代码中有可能潜在的缺陷。

> **注意**: 在测试驱动开发（TDD）方法中, 你不应该先编写大部分或整个app，然后在开发完后来运行测试 ，而是应该先编写测试，然后及时编写足够的app代码，以通过你的测试。通过更新你的测试案例来反映新的功能需求，并反复重复这样的。

## 创建一个测试用例

[Activity](http://developer.android.com/reference/android/app/Activity.html)测试都是通过结构化的方式编写的。请务必把你的测试代码放在一个单独的包内,从而与被测试的代码分开。

按照惯例，你的测试包的名称应该遵循与应用包名相同的命名方式,在应用包名后接“.tests”。在你创建的测试包，为你的测试用例添加Java类。按照惯例，你的测试用例名称也应遵循你要测试的Java或Android的类相同的名称，但后缀为“Test”。

要在Eclipse中创建一个新的测试用例：

a. 在Package Explorer中,右键点击你要测试工程的src/文件夹**New > Package**。

b. 设置文件夹名称`<你的包名称>.tests` (比如, `com.example.android.testingfun.tests`) 并点击**Finish**。

c. 右键点击你创的测试包,并选择**New > Calss**。

d. 设置文件名称`<你的Activity名称>Test`(比如, `MyFirstTestActivityTest`), 然后点击**Finish**。

## 建立你的测试数据集(Fixture)

测试数据集包含运行测试前必须生成的一些对象。要建立测试数据集,你可以在你的测试中覆写[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())和[tearDown()](http://developer.android.com/reference/junit/framework/TestCase.html#tearDown())方法。测试会在运行任何其它测试方法之前自动[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())方法。你可以用这些方法来保持代码的测试初始化和清理是分开。

在你的Eclipse中建立测试数据集:

1 . 在 Package Explorer中双击测试打开之前编写的测试用例,然后修改你的测试用例使它继承[ActivityTestCase](http://developer.android.com/reference/android/test/ActivityTestCase.html)的子类。比如这样:

```java
public class MyFirstTestActivityTest
        extends ActivityInstrumentationTestCase2<MyFirstTestActivity> {
```

2 . 下一步，给你的测试用例添加构造函数和setUp()方法，并你想测试的Activity添加变量声明。比如:

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

构造函数是由测试用的Runner调用，用于初始化测试类的，而[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())方法是由测试Runner在其他测试方法开始前运行的。

通常在`setUp()`方法中你应该:

* 为`setUp()` 调用父类构造函数，这是JUnit要求的。
* 通过下面这样初始化测试数据集的状态:
    * 定义保存测试数据及状态的实例变量
    * 创建并保存正在测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)的引用实例。
    * 获得你想测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)中获得任何UI组件的引用。

你可以使用[getActivity()](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#getActivity())方法得到正在测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)的引用。

## 增加一个测试前提

作为一个常规检查，最好是确认测试数据集的设置是正确的,以及你想要测试的对象已经正确地初始化。这样，你的测试就不会因为有你的测试数据集的设置错误而失败。按照惯例，验证你的测试数据集的方法被称为`testPreconditions()`。

例如，你可能想添加一个像这样的`testPreconditons()`方法:

```java
public void testPreconditions() {
    assertNotNull(“mFirstTestActivity is null”, mFirstTestActivity);
    assertNotNull(“mFirstTestText is null”, mFirstTestText);
}
```

Assertion（断言，译者注）方法是从Junit[Assert](http://developer.android.com/reference/junit/framework/Assert.html)类来的。通常，你可以使用断言验证你想测试一个特定的条件是否是真的。

* 如果条件为假，断言方法抛出一个AssertionFailedError异常，这是典型的测试者报告。你可以在你的断言失败时给你的断言方法添加一个字符串作为第一个参数从而给出一些上下文详细信息。
* 如果条件为真，测试通过。

在这两种情况下，Runner都会继续运行其它测试用例的测试方法。

## 添加一个测试方法验证你的Activity

下一步，添加一个或多个测试方法来验证你的[Activity](http://developer.android.com/reference/android/app/Activity.html)布局和功能性行为。

例如，如果你的Activity含有一个[TextView](http://developer.android.com/reference/android/widget/TextView.html)，你可以添加一个像这样的方法来检查它是否有正确的标签文本:

```java
public void testMyFirstTestTextView_labelText() {
    final String expected =
            mFirstTestActivity.getString(R.string.my_first_test);
    final String actual = mFirstTestText.getText().toString();
    assertEquals(expected, actual);
}
```

该 `testMyFirstTestTextView_labelText()` 方法只是简单的检查Layout中的[TextView](http://developer.android.com/reference/android/widget/TextView.html)的默认文本是否和`strings.xml`资源中定义的文本一样。

**注意**

当命名测试方法，你可以使用下划线将被测试的内容从正在测试的具体用例中分离出来。这种风格使它更容易看清楚的那部分正在被测试。

做这种类型的字符串比较时，从你的资源文件中读取预期字符串是良好的做法，而不是在你代码中硬性编写字符串做比较。这可以防止当字符串定义在资源文件被修改时轻易的打断你的测试。

为进行比较,预期的和实际的字符串都要做为[assertEquals()](http://developer.android.com/reference/junit/framework/Assert.html#assertEquals(java.lang.String, java.lang.String))方法的参数。如果值是不一样的，断言将抛出一个[AssertionFailedError](http://developer.android.com/reference/junit/framework/AssertionFailedError.html)异常。

如果你添加了一个testPreconditions()方法，把你的测试方法放在testPreconditions之后。

要参看一个完整的测试案例，在参看本节示例中的MyFirstTestActivityTest.java。

##构建和运行你的测试

你可以在Eclipse中的包浏览器(Package Explorer)中运行你的测试。

这样构建和运行你的测试:

1. 连接一个Android设备到你的机器。在设备或模拟器，打开设置菜单，选择开发者选项并确保启用USB调试。

2. 在包浏览器(Package Explorer)中，右键单击测试类，并选择**Run As > Android Junit Test**。

3. 在Android设备选择对话框，选择刚才连接的设备，然后单击“确定”。

4. 在JUnit视图，验证测试是否通过,有无错误或失败。


本节示例代码[AndroidTestingFun.zip](http://developer.android.com/shareables/training/AndroidTestingFun.zip)
