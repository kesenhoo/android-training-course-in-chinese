# 创建与执行测试用例

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:

为了验证布局设计和功能行为在你的应用程序有没有发生变化(不符合预期)， 为应用的每个Activity建立测试是很重要。对于每一个测试，你需要在测试用例中创建一个个独立的部分,包括固定测试，前提测试方法和[Activity](http://developer.android.com/reference/android/app/Activity.html)的测试方法。然后你就可以运行测试并得到测试报告。如果任何测试方法失败，这表明在你的代码中有可能潜在的缺陷。

**注意**

在测试驱动开发（TDD）方法中,你应该编写足够的有效代码，以满足你的测试依赖关系，更新你的测试案例并以反映新的功能需求，并反复重复这样的,你而不是在你写大部分或全部前期代码后再开始测试周期。

##创建一个测试用例

[Activity](http://developer.android.com/reference/android/app/Activity.html)都是通过结构化的方式编写的。请务必把你的测试代码放在一个单独的包内,从而与其它的正在测试的代码分开。

按照惯例，你的测试包的名称应该遵循与应用包名相同的命名方式,在应用包名后接“.tests”。在你创建的测试包，为你的测试用例添加Java类。按照惯例，你的测试用例名称也应遵循你要测试的Java或Android的类相同的名称，但后缀为“Test”。

要在Eclipse中创建一个新的测试用例：

a. 在Package Explorer中,右键点击你要测试工程的src/文件夹**New > Package**。

b. 设置文件夹名称(比如,com.example.android.testingfun.tests)并点击**Finish**。

c. 右键点击你创的测试包,并选择**New>Calss**。

d. 设置文件名称(比如,MyFirstTestActivityTest),然后点击***Finishi*。

##建立你的测试夹具(Fixture)

(夹具是用来快速,安全的测试组件功能的工具)

测试夹具由对象必须由一个或多个正在运行测试来初始化。要建立测试夹具,你可以在你的测试中重写[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())和[tearDown()](http://developer.android.com/reference/junit/framework/TestCase.html#tearDown())方法。测试会在运行任何其它测试方法之前自动[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())方法。你可以用这些方法来保持代码的测试初始化和清理是分开。

在你的Eclipse中建立夹具:

1. 在 Package Explorer中双击测试打开之前编写的测试用例,然后修改你的测试用例使它扩展[ActivityTestCase](http://developer.android.com/reference/android/test/ActivityTestCase.html)的子类。比如这样:

```xml
public class MyFirstTestActivityTest
        extends ActivityInstrumentationTestCase2<MyFirstTestActivity> {
```

2. 下一步，给你的测试用例添加构造函数和setUp（）方法，并你想测试的Activity添加变量声明。比如:

```xml
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

构造函数是由测试运行者初始化测试类反射的,而[setUp()](http://developer.android.com/reference/junit/framework/TestCase.html#setUp())方法是由测试运行者运行其它测试类之前反射的。

通常在setUp()方法中你应该这样:

*. 为setUp()反射父类构造器,这是JUnit所必须的。

*. 通过下面这样初始化测试夹具的状态:

```xlm

定义实例变量夹具的状态存储。

为正在测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)创建和存储的引用实例。

在你想测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)中获得任何UI组件的一个引用。

```

你可以使用[getActivity()](http://developer.android.com/reference/android/test/ActivityInstrumentationTestCase2.html#getActivity())方法得到正在测试的[Activity](http://developer.android.com/reference/android/app/Activity.html)的引用。

##增加一个测试前提

作为一个全面的检查,确认测试夹具的设置是正确的是很好的做法,那样你想要测试的对象就会正确地实例化和初始化。这样，你的测试就不会因为有你的测试夹具的设置错误而失败。按照惯例，验证你的测试夹具的方法被称为testpreconditions()。

例如，你可能想添加一个像这样的testpreconditons()方法:

```xml
public void testPreconditions() {
    assertNotNull(“mFirstTestActivity is null”, mFirstTestActivity);
    assertNotNull(“mFirstTestText is null”, mFirstTestText);
}
```

断言方法是从Junit[Assert](http://developer.android.com/reference/junit/framework/Assert.html)类来的。通常,你可以使用断言验证你想测试一个特定的条件是否是真的。

*. 如果条件为假，断言方法抛出一个assertionfailederror异常，这是典型的测试者报告。你可以在你的断言失败时给你的断言方法添加一个字符串作为第一个参数从而给出一些上下文详细信息。

*. 如果条件为真，测试通过。

在这两种情况下，测试者继续运行其它测试用例的测试方法。

##添加一个测试方法验证你的Activity

下一步，添加一个或多个测试方法来验证你的[Activity](http://developer.android.com/reference/android/app/Activity.html)布局和功能性行为。

例如，如果你的活动含有一个[TextView](http://developer.android.com/reference/android/widget/TextView.html)，你可以添加一个像这样的方法来检查它是否有正确的标签文本:

```xml
public void testMyFirstTestTextView_labelText() {
    final String expected =
            mFirstTestActivity.getString(R.string.my_first_test);
    final String actual = mFirstTestText.getText().toString();
    assertEquals(expected, actual);
}
```

该 testMyFirstTestTextView_labelText()方法只是简单的检查程序是[TextView](http://developer.android.com/reference/android/widget/TextView.html)的默认文本是否是由strings.xml资源中定义的预期文本设定的。

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
