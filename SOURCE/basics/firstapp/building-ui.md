> 编写:[yuanfentiank789](https://github.com/yuanfentiank789)

> 校对:

# 建立一个简单的用户界面
Android的图形用户界面使用View和ViewGroup的层级关系进行创建。View类是通用的UI窗体小部件，比如按钮或者文本框，而ViewGroup是不可见的用于定义子View布局的方式view容器，比如网格部件(grid)和垂直列表部件(list)。

Android提供了一个对应于View和ViewGroup子类的XMl标签词汇表，你可以在XML里使用层级视图元素创建自己的UI。

![viewgroup](viewgroup.png)

在本小节里，你将学到怎样用XML创建一个带有文本输入框和按钮的界面。在接下来的课里，你将学会对按钮做出响应，当按钮被按下的时候文本框里的内容被发送到另外一个Activity。

## 创建一个LinearLayout

从目录res/layout里打开fragment_main.xml文件。

注意：在eclipse中，当你打开布局文件的时候，首先看到的是图形化布局编辑器，这个编辑页是使用所见即所得的工具帮助你创建布局。对于本课来说，你是直接在XML里进行操作，因此点击屏幕下方的main.xml标签进入XML编辑页。

你创建项目时选择的BlankActivity 模板生成的fragment_main.xml文件包含一个RelativeLayou的根View和一个TextView的子View。

首先，删除`TextView`标签并修改`RelativeLayou`为 `LinearLayout`,然后添加`android:orientation` 属性并设置该属性为"horizontal"，修改后结果如下：

```java
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal" >
</LinearLayout>
```

LinearLayout是ViewGroup的一个子类，用于放置水平或者垂直放置子视图的部件，由属性android：orientation来设定方向。LinearLayout里的子布局按照XML里设定的布局方向显示在屏幕上。

另外的两个属性`android:layout_width`和`android:layout_height`，对于所有的Views都需要对这两个属性进行设这。

在这里因为LinearLayout是整个视图的根布局，所以对于宽和高都应该是充满整个屏幕的，通过指定width 和 height属性为"match_parent"。该值表示子View扩张自己width和height来匹配父控件的width和height。

想要获得更多关于[布局](http://developer.android.com/guide/topics/ui/declaring-layout.html)属性的信息，请参照XML布局向导。

## 添加一个文本输入框

在[LinearLayout](http://developer.android.com/reference/android/widget/LinearLayout.html)里添加一个[EditText](http://developer.android.com/reference/android/widget/EditText.html)元素就可以创建一个用户可编辑的文本框，和其它View一样，你需要设置XML里的某些属性来指定EditText的具体功能，下边是你应该在线性布局里指定的一些属性元素：

```java
<EditText android:id="@+id/edit_message"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:hint="@string/edit_message" />
```

属性说明:

[android:id](http://developer.android.com/reference/android/view/View.html#attr_android:id)

这里定义的是View的唯一标示符，你可以在程序的代码里进行引用，你可以对这个类进行读和修改的操作(在下一课里将会用到)

当你想从XML里使用资源类的时候必须使用@符号，紧随@之后的是资源的类型(这里是id)，然后是资源的名字(这里使用的是edit_message)。(其他的资源可以使用相同的名字只要他们不是相同的资源类型，例如：字符串资源可以使用相同的名字)。

+号只是当你第一次定义一个资源ID的时候需要。这里是告诉SDK此资源ID需要被创建出来。在应用程序被编译之后，SDK就可以直接使用ID值，edit_message是在项目gen/R.java文件中创建一个新的标示符，这个标示符就和[EditText](http://developer.android.com/reference/android/widget/EditText.html)关联起来了。一旦资源ID被创建了，其他资源如果引用这个ID就不再需要+号了。这里是唯一一个需要+号的属性。可以参考右栏获取更多关于资源类的信息。

[android:layout_width](http://developer.android.com/reference/android/view/View.html#attr_android:layout_width) 和[android:layout_height](http://developer.android.com/reference/android/view/View.html#attr_android:layout_height)

对于宽和高不建议指定具体的大小，使用`wrap_content`指定之后，这个视图只是占据内容大小的空间。如果你使用了`fill_parent`，这时[EditText](http://developer.android.com/reference/android/widget/EditText.html)将会布满整个屏幕，因为它将适应父布局的大小。想要看到更多信息，请参考XML [布局向导](http://developer.android.com/guide/topics/ui/declaring-layout.html)。

[android:hint](http://developer.android.com/reference/android/widget/TextView.html#attr_android:hint)

当文本框为空的时候,会默认显示这个字符串。对于字符串`@string/edit_message`的值所引用的资源应该是定义在单独的文件里，而不是直接使用字符串。因为使用的是值是存在的资源，所以不需要使用+号。然而，由于你还没有定义字符串的值，所以在添加`@string/edit_message`时候会出现编译错误。下边你可以定义字符串资源值来去除这个错误。

**注意**: 该字符串资源与id使用了相同的名称（edit_message）。然而，对于资源的引用是区分类型的（比如id和字符串），因此，使用相同的名称不会引起冲突。

## 增加字符串资源

当你在用户界面定义一个文本的时候，你应该把每一个文本字符串列入资源文件。对于所有字符串值，字符串资源能够单独的修改，在资源文件里你可以很容易的找到并且做出相应的修改。通过选择定义每个字符串，还允许您对不同语言本地化应用程序。
默认情况下，在res/values/string.xml里，你的Android项目包含一个字符串资源文件。打开这个文件，删除已经存在的"hello"字符串，为"edit_message"增加一个供使用的字符串值。
同时在这个文件里，再给button添加一个字符串，命名为"button_send".
下边就是定义好的string.xml文件内容：

```java
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">My First App</string>
    <string name="edit_message">Enter a message</string>
    <string name="button_send">Send</string>
    <string name="action_settings">Settings</string>
    <string name="title_activity_main">MainActivity</string>
</resources>
```

要想获得跟多的对于不同语言本字符串资源本地化的问题，请参考[兼容不同的设备(Supporting Different Devices)](/supporting-devices/index.html) 。

## 添加一个按钮

紧跟[EditText](http://developer.android.com/reference/android/widget/EditText.html)后边，添加一个[Button](http://developer.android.com/reference/android/widget/Button.html)到布局里。

```java
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/button_send" />
```

宽和高被设置为"wrap_content"，这时按钮占据的大小就是按钮里文本的大小。这个按钮不需要指定android:id的属性，因为在Activity代码里不被引用到。

## 让输入框充满整个屏幕的宽度

当前EditText和Button部件只是适应了他们各自内容的大小，如下图所示：

![edittext_wrap](edittext_wrap.png)

这样设置对按钮来说很合适，但是对于文本框来说就不太好了，因为用户可能输入更长的文本内容，需要在左边留有一定的空白空间。因此如果能够沾满整个宽度会更好。LinearLayout使用权重的属性来达到这个目的，你可以使用android:layout_weitht属性来设置。

你可以根据每一个部件所占的空间来指定权重值的大小，它的总数是有同级别的部件来决定的。就类似于饮料的成分配方：“两份伏特加酒，一份咖啡利口酒”，意思就是这个酒中伏特加酒占三分之二。例如，你设置一个View的权重是2，另一个View的权重是1，那么总数就是3，这时第一个View占据2/3的空间，第二个占据1/3的空间。如果你再加入第三个View，权重设为1，那么第一个View会占据1/2的空间，剩余的被另外两个View平分。

对于所有的View默认的权重是0，如果你只设置了一个View的权重大于0，那么这个View将占据除去别的View本身占据的空间的的所有剩余空间。因此这里设置EditText的权重为1，使其能够占据除了按钮之外的所有空间。

```java
<EditText
    android:layout_weight="1"
    ... />
```

为了达到更有效的布局，在你设置权重的时候，你应该把[EditText](http://developer.android.com/reference/android/widget/EditText.html)的宽度设置为0。如果你设置为"wrap_content"作为宽度，系统需要自己去计算这个部件所占有的宽度，而此时的因为你设置了权重，所以系统自动回占据剩余空间，EditText的宽度最终成了不起作用的属性。

```java
<EditText
    android:layout_weight="1"
    android:layout_width="0dp"
    ... />
```

下图展示了设置权重时候的结果

![edittext_gravity](edittext_gravity.png)

现在看一下完整的布局文件内容：

```java
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal">
    <EditText android:id="@+id/edit_message"
        android:layout_weight="1"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:hint="@string/edit_message" />
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/button_send" />
</LinearLayout>
```

整个布局默认被[Activity](http://developer.android.com/reference/android/app/Activity.html)类使用，Activity类是在你创建一个项目的时候SDK工具自动生成的，你可以直接运行app查看运行结果:

在Eclipse里，点击工具栏里的Run![eclipse-run](eclipse-run.png)

或者使用命令行，进入你项目的根目录直接执行

```java
ant debug
adb install bin/MyFirstApp-debug.apk
```

继续下一小节学习有关怎么对按钮做出相应，同时读取文本里的内容，启动另外一个Activity，以及更多信息。

[下一节：启动另外的Activity](starting-activity.html)
