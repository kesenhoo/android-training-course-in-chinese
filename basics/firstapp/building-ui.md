# 建立简单的用户界面

> 编写:[yuanfentiank789](https://github.com/yuanfentiank789) - 原文:<http://developer.android.com/training/basics/firstapp/building-ui.html>

    在本小节里，我们将学习如何用XML创建一个带有文本输入框和按钮的界面，下一节课将学会使app对按钮做出响应：按钮被按下时，文本框里的内容被发送到另外一个Activity。


Android的图形用户界面是由多个[View](http://developer.android.com/reference/android/view/View.html)和[ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html)构建出来的。[View](http://developer.android.com/reference/android/view/View.html)是通用的UI窗体小组件，比如按钮([Button](http://developer.android.com/guide/topics/ui/controls/button.html))或者文本框([text field](http://developer.android.com/guide/topics/ui/controls/text.html))，而[ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html)是不可见的，是用于定义子View布局方式的容器，比如网格部件(grid)和垂直列表部件(list)。

Android提供了一个对应于[View](http://developer.android.com/reference/android/view/View.html)和[ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html)子类的一系列XMl标签，我们可以在XML里使用层级视图元素创建自己的UI。

Layouts是ViewGroup的子类，接下来的练习将使用[LinearLayout](http://developer.android.com/reference/android/widget/LinearLayout.html)。

![viewgroup](viewgroup.png)

**Figure 1.** 关于viewgroup对象如何组织布局分支和包含其他view对象。


> 可选的布局文件：在XML中定义界面布局而不是在运行时去动态生成布局是有多个原因的，其中最重要的一点是这样可以使得你为不同大小的屏幕创建不同的布局文件。例如，你可以创建2个版本的布局文件，告诉系统在小的屏幕上使用其中一个布局文件，在大的屏幕上使用另外一个布局文件。更多信息，请参考[兼容不同的设备](../supporting-devices/index.html)

## 创建一个LinearLayout

1 在Android Studio中，从res/layout目录打开content_my.xml文件。上一节创建新项目时生成的BlankActivity，包含一个content_my.xml文件，该文件根元素是一个包含TextView的RelativeLayout。

2 在**Preview**面板点击![image](as-hide-side.png)关闭右侧Preview面板，在Android Studio中，当打开布局文件时，可以看到一个Preview面板，点击这个面板中的标签，可利用WYSIWYG（所见即所得）工具在Design面板看到对应的图形化效果，但在本节直接操作XML文件即可。

3 删除 TextView 标签.

4 把 RelativeLayout 标签改为 LinearLayout.

5 为< LinearLayout >添加 android:orientation 属性并设置值为 "horizontal".

6 去掉android:padding 属性和tools:context 属性.


修改后结果如下：

res/layout/content_my.xml

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:orientation="horizontal"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:layout_behavior="@string/appbar_scrolling_view_behavior"
    tools:showIn="@layout/activity_my">
```

[LinearLayout](http://developer.android.com/reference/android/widget/LinearLayout.html)是[ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html)的一个子类，用于放置水平或者垂直方向的子视图部件，放置方向由属性`android:orientation`设定。LinearLayout里的子布局按照XML里定义的顺序显示在屏幕上。

所有的Views都需要用到[android:layout_width](http://developer.android.com/reference/android/view/View.html#attr_android:layout_width)和[android:layout_height](http://developer.android.com/reference/android/view/View.html#attr_android:layout_height)这两个属性来设置自身的大小。

由于LinearLayout是整个视图的根布局，所以其宽和高都应充满整个屏幕的，通过指定width 和 height属性为`"match_parent"`。该值表示子View扩张自己width和height来匹配父控件的width和height。

更多关于[Layout](http://developer.android.com/guide/topics/ui/declaring-layout.html)属性的信息，请参照XML布局向导。

## 添加一个文本输入框

与其它View一样，我们需要设置XML里的某些属性来指定EditText的属性值，以下是应该在线性布局里指定的一些属性元素：

1 在activity\_my.xml文件的 < LinearLayout > 标签内定义一个 < EditText > 标签，并设置id属性为@+id/edit_message.

2 设置layout_width和layout_height属性为 wrap_content.

3 设置hint属性为一个string 值的引用edit_message.

代码如下：

res/layout/content_my.xml

```xml
<EditText android:id="@+id/edit_message"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:hint="@string/edit_message" />
```

各属性说明:

#### [android:id](http://developer.android.com/reference/android/view/View.html#attr_android:id)

这是定义View的唯一标识符。可以在程序代码中通过该标识符对对象进行引用，例如对这个对象进行读和修改的操作(在下一课里将会用到)。

当想从XML里引用资源对象的时候必须使用@符号。紧随@之后的是资源的类型(这里是`id`)，然后是资源的名字(这里使用的是`edit_message`)。

+号只是当你第一次定义一个资源ID的时候需要。这里是告诉SDK此资源ID需要被创建出来。在应用程序被编译之后，SDK就可以直接使用ID值，edit_message是在项目`gen/R.java`文件中创建一个新的标识符，这个标识符就和[EditText](http://developer.android.com/reference/android/widget/EditText.html)关联起来了。一旦资源ID被创建了，其他资源如果引用这个ID就不再需要+号了。这里是唯一一个需要+号的属性。

#### [android:layout_width](http://developer.android.com/reference/android/view/View.html#attr_android:layout_width) 和[android:layout_height](http://developer.android.com/reference/android/view/View.html#attr_android:layout_height)

对于宽和高不建议指定具体的大小，使用`wrap_content`指定之后，这个视图将只占据内容大小的空间。如果你使用了`match_parent`，这时[EditText](http://developer.android.com/reference/android/widget/EditText.html)将会布满整个屏幕，因为它将适应父布局的大小。更多信息，请参考 [布局向导](http://developer.android.com/guide/topics/ui/declaring-layout.html)。

#### [android:hint](http://developer.android.com/reference/android/widget/TextView.html#attr_android:hint)

当文本框为空的时候,会默认显示这个字符串。对于字符串`@string/edit_message`的值所引用的资源应该是定义在单独的文件里，而不是直接使用字符串。因为使用的值是存在的资源，所以不需要使用+号。然而，由于你还没有定义字符串的值，所以在添加`@string/edit_message`时候会出现编译错误。下边你可以定义字符串资源值来去除这个错误。

> **Note**: 该字符串资源与id使用了相同的名称（edit_message）。然而，对于资源的引用是区分类型的（比如id和字符串），因此，使用相同的名称不会引起冲突。

## 增加字符串资源


默认情况下，你的Android项目包含一个字符串资源文件，`res/values/string.xml`。打开这个文件，为`"edit_message"`增加一个供使用的字符串定义，设置值为"Enter a message."

1 在Android Studio里，编辑 res/values 下的 strings.xml 文件.

2 添加一个string名为"edit_message" ,值为 "Enter a message".

3 再添加一个string名为 "button_send"，值为"Send".下面的内容将使用这个string来创建一个按钮.

下边就是修改好的`res/values/strings.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">My First App</string>
    <string name="edit_message">Enter a message</string>
    <string name="button_send">Send</string>
    <string name="action_settings">Settings</string>
</resources>
```
当你在用户界面定义一个文本的时候，你应该把每一个文本字符串列入资源文件。这样做的好处是：对于所有字符串值，字符串资源能够单独的修改，在资源文件里你可以很容易的找到并且做出相应的修改。通过选择定义每个字符串，还允许您对不同语言本地化应用程序。


更多的于不同语言本字符串资源本地化的问题，请参考[兼容不同的设备(Supporting Different Devices)](../supporting-devices/index.html) 。

## 添加一个按钮



1 在 Android Studio里, 编辑 res/layout下的 content_my.xml 文件.

2 在LinearLayout 内部, 在< EditText >标签之后定义一个< Button >标签.

3 设置Button的width 和 height 属性值为 "wrap_content" 以便让Button大小能完整显示其上的文本.

4 定义button的文本使用android:text 属性，设置其值为之前定义好的 button_send 字符串.

此时的 LinearLayout 看起来应该是这样

res/layout/content_my.xml

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:orientation="horizontal"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:layout_behavior="@string/appbar_scrolling_view_behavior"
    tools:showIn="@layout/activity_my">
        <EditText android:id="@+id/edit_message"
          android:layout_width="wrap_content"
          android:layout_height="wrap_content"
          android:hint="@string/edit_message" />
        <Button
          android:layout_width="wrap_content"
          android:layout_height="wrap_content"
          android:text="@string/button_send" />
</LinearLayout>
```

>**Note** 宽和高被设置为`"wrap_content"`，这时按钮占据的大小就是按钮里文本的大小。这个按钮不需要指定[android:id](http://developer.android.com/reference/android/view/View.html#attr_android:id)的属性，因为Activity代码中不会引用该Button。

当前EditText和Button部件只是适应了他们各自内容的大小，如下图所示：

![edittext_wrap](edittext_wrap.png)

这样设置对按钮来说很合适，但是对于文本框来说就不太好了，因为用户可能输入更长的文本内容。因此如果能够占满整个屏幕宽度会更好。LinearLayout使用*权重*属性来达到这个目的，你可以使用[android:layout_weight](http://developer.android.com/reference/android/widget/LinearLayout.LayoutParams.html#weight)属性来设置。

权重的值指的是每个部件所占剩余空间的大小，该值与同级部件所占空间大小有关。就类似于饮料的成分配方：“两份伏特加酒，一份咖啡利口酒”，即该酒中伏特加酒占三分之二。例如，我们设置一个View的权重是2，另一个View的权重是1，那么总数就是3，这时第一个View占据2/3的空间，第二个占据1/3的空间。如果你再加入第三个View，权重设为1，那么第一个View(权重为2的)会占据1/2的空间，剩余的另外两个View各占1/4。(请注意，使用权重的前提一般是给View的宽或者高的大小设置为0dp，然后系统根据上面的权重规则来计算View应该占据的空间。但是很多情况下，如果给View设置了match_parent的属性，那么上面计算权重时则不是通常的正比，而是反比，也就是权重值大的反而占据空间小)。

对于所有的View默认的权重是0，如果只设置了一个View的权重大于0，则该View将占据除去别的View本身占据的空间的所有剩余空间。因此这里设置EditText的权重为1，使其能够占据除了按钮之外的所有空间。



## 让输入框充满整个屏幕的宽度

为让 EditText充满剩余空间，做如下操作：

1  在content_my.xml文件里，设置EditText的layout_weight属性值为1 .

2  设置EditText的layout_width值为0dp.

res/layout/content_my.xml

```xml
<EditText
    android:layout_weight="1"
    android:layout_width="0dp"
    ... />
```

为了提升布局的效率，在设置权重的时候，应该把[EditText](http://developer.android.com/reference/android/widget/EditText.html)的宽度设为0dp。如果设置"wrap_content"作为宽度，系统需要自己去计算这个部件所占有的宽度，而此时的因为设置了权重，所以系统自动会占据剩余空间，EditText的宽度最终成了不起作用的属性。


设置权重后的效果图

![edittext_gravity](edittext_gravity.png)

现在看一下完整的布局文件内容：

res/layout/content_my.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
   xmlns:app="http://schemas.android.com/apk/res-auto"
   xmlns:tools="http://schemas.android.com/tools"
   android:orientation="horizontal"
   android:layout_width="match_parent"
   android:layout_height="match_parent"
   app:layout_behavior="@string/appbar_scrolling_view_behavior"
   tools:showIn="@layout/activity_my">
    <EditText android:id="@+id/edit_message"
        android:layout_weight="1"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:hint="@string/edit_message" />
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/button_send" />
</LinearLayout>```
## 运行应用
整个布局默认被应用于创建项目的时候SDK工具自动生成的Activity，运行看下效果:

+ 在Android Studio里，点击工具栏里的Run按钮<img src="eclipse-run.png" />

+ 或者使用命令行，进入你项目的根目录直接执行

```
$ ant debug
adb install -r app/build/outputs/apk/app-debug.apk
```

下一小节将学习有关如何对按钮做出相应，同时读取文本中的内容，启动另外一个Activity等。

[下一节：启动另一个Activity](starting-activity.html)
