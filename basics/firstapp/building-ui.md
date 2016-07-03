# 建立简单的用户界面

> 编写：[yuanfentiank789](https://github.com/yuanfentiank789) - 原文：<http://developer.android.com/training/basics/firstapp/building-ui.html>

在本小节里，我们将学习如何用 XML 创建一个带有文本输入框和按钮的界面，下一节课将学会使 APP 对按钮做出响应：按钮被按下时，文本框里的内容被发送到另外一个 Activity。

Android 的图形用户界面是由多个 [View] 和 [ViewGroup] 构建出来的。[View] 是通用的 UI 窗体小组件，比如按钮（[Button]）或者文本框（[text field]），而 [ViewGroup] 是不可见的，是用于定义子 View 布局方式的容器，比如网格部件（grid）和垂直列表部件（vertical list）。

Android 提供了一个对应于 [View] 和 [ViewGroup] 子类的一系列 XML 标签，我们可以在 XML 里使用层级视图元素创建自己的 UI。

Layouts 是 [ViewGroup] 的子类，接下来的练习将使用 [LinearLayout]。

![图 1: ViewGroup][figure_1_viewgroup]

**图 1** 关于 ViewGroup 对象如何组织布局分支和包含其他 View 对象。

> **可选的布局文件**
>
> 在 XML 中定义界面布局而不是在运行时去动态生成布局是有多个原因的，其中最重要的一点是这样可以使得你为不同大小的屏幕创建不同的布局文件。例如，你可以创建两个版本的布局文件，告诉系统在小的屏幕上使用其中一个布局文件，在大的屏幕上使用另外一个布局文件。更多信息，请参考 [兼容不同的设备]。

## 创建一个 LinearLayout

1. 在 Android Studio 中，从 `res/layout` 目录打开 `content_my.xml` 文件。

   上一节创建新项目时生成的 BlankActivity 包含一个 `content_my.xml` 文件，该文件根元素是一个包含 [TextView] 的 [RelativeLayout]。

2. 在 **Preview** 面板点击 ![图标：隐藏][icon_hide] 关闭右侧 Preview 面板。

   在 Android Studio 中，当打开布局文件时，可以看到一个 Preview 面板，点击这个面板中的标签，可利用 WYSIWYG（所见即所得）工具在 Design 面板看到对应的图形化效果，但在本节直接操作 XML 文件即可。

3. 删除 <[TextView]> 标签。

4. 把 <[RelativeLayout]> 标签改为 <[LinearLayout]>。

5. 为 <[LinearLayout]> 添加 [android:orientation] 属性并设置值为 `"horizontal"`。

6. 去掉 `android:padding` 属性和 `tools:context` 属性。

修改后结果如下：

res/layout/content\_my.xml

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

[LinearLayout] 是 [ViewGroup] 的一个子类，用于放置水平或者垂直方向的子视图部件，放置方向由属性 [android:orientation] 设定。[LinearLayout] 里的子布局按照 XML 里定义的顺序显示在屏幕上。

所有的 Views 都需要用到 [android:layout_width] 和 [android:layout_height] 这两个属性来设置自身的大小。

由于 [LinearLayout] 是整个视图的根布局，所以其宽和高都应充满整个屏幕的，通过指定 width 和 height 属性为 `"match_parent"`。该值表示子 View 扩张自己 width 和 height 来 *匹配* 父控件的 width 和 height。

更多关于布局属性的内容，请参考 [布局向导]。

## 添加一个文本输入框

与其它 [View] 一样，我们需要定义 XML 里的某些属性来指定 [EditText] 的属性值。以下是应该在线性布局里指定的一些属性元素：

1. 在 `activity_my.xml` 文件的 <[LinearLayout]> 标签内定义一个 <[EditText]> 标签，并设置 `id` 属性为 `@+id/edit_message`。

<!-- TODO: 原文中为 `content_my.xml`，而非 `activity_my.xml`。请确认本教程中其他章节中的引用，确认后再决定是否更新。 -->

2. 设置 `layout_width` 和 `layout_height` 属性为 `wrap_content`。

3. 设置 `hint` 属性为一个 string 值的引用 `edit_message`。

代码如下：

res/layout/content_my.xml

```xml
<EditText android:id="@+id/edit_message"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:hint="@string/edit_message" />
```

各属性说明:

#### [android:id]

这是定义 View 的唯一标识符。可以在程序代码中通过该标识符对对象进行引用，例如对这个对象进行读和修改的操作（在下一课里将会用到）。

当想从 XML 里引用资源对象的时候必须使用 `@` 符号。紧随 `@` 之后的是资源的类型（这里是 `id`），然后是资源的名字（这里使用的是 `edit_message`）。

`+` 号只是当你第一次定义一个资源 ID 的时候需要。这里是告诉 SDK 此资源 ID 需要被创建出来。在应用程序被编译之后，SDK 就可以直接使用 ID 值，edit_message 是在项目 `gen/R.java` 文件中创建一个新的标识符，这个标识符就和 [EditText] 关联起来了。一旦资源 ID 被创建了，其他资源如果引用这个 ID 就不再需要 `+` 号了。这里是唯一一个需要 `+` 号的属性。

#### [android:layout_width] 和 [android:layout_height]

对于宽和高不建议指定具体的大小，使用 `"wrap_content"` 指定之后，这个视图将只占据内容大小的空间。如果你使用了 `"match_parent"`，这时 [EditText] 将会布满整个屏幕，因为它将适应父布局的大小。更多信息，请参考 [布局向导]。

#### [android:hint]

当文本框为空的时候，会默认显示这个字符串。对于字符串 `"@string/edit_message"` 的值所引用的资源应该是定义在单独的文件里，而不是直接使用字符串。因为使用的值是存在的资源，所以不需要使用 `+` 号。然而，由于你还没有定义字符串的值，所以在添加 `@string/edit_message` 的时候会出现编译错误。在下一节的教程中你将定义字符串资源，到时候就不会报错了。

<!-- TODO
> **Resource Objects**
>
> A resource object is a unique integer name that's associated with an app resource, such as a bitmap, layout file, or string.
>
> Every resource has a corresponding resource object defined in your project's `gen/R.java` file. You can use the object names in the `R` class to refer to your resources, such as when you need to specify a string value for the [android:hint] attribute. You can also create arbitrary resource IDs that you associate with a view using the [android:id] attribute, which allows you to reference that view from other code.
>
> The SDK tools generate the `R.java` file each time you compile your app. You should never modify this file by hand.
>
> For more information, read the guide to [Providing Resources].

[Providing Resources]: //developer.android.com/guide/topics/resources/providing-resources.html
-->

> **注**：该字符串资源与 ID 使用了相同的名称（`edit_message`）。然而，对于资源的引用是区分类型的（比如 `id` 和 `字符串`），因此，使用相同的名称不会引起冲突。

## 增加字符串资源

默认情况下，你的 Android 项目包含一个字符串资源文件，`res/values/string.xml`。打开这个文件，为 `"edit_message"` 增加一个供使用的字符串定义，设置值为“Enter a message”。

1. 在 Android Studio 里，编辑 `res/values` 下的 `strings.xml` 文件。

2. 添加一个名为 `"edit_message"` 的字符串，值为“Enter a message”。

3. 再添加一个名为 `"button_send"` 的字符串，值为“Send”。

   下一节中将使用这个字符串创建一个按钮。

下边就是修改好的 `res/values/strings.xml`：

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

更多的于不同语言本字符串资源本地化的问题，请参考 [兼容不同的设备]。

## 添加一个按钮

1. 在 Android Studio 里，编辑 `res/layout` 下的 `content_my.xml` 文件。

2. 在 <[LinearLayout]> 内部，在 <[EditText]> 标签之后定义一个 <[Button]> 标签。

3. 设置按钮的 width 和 height 属性值为 `"wrap_content"` 以便让按钮的大小能完整显示其上的文本。

4. 定义按钮的文本使用 [android:text] 属性，设置值为相似上一节中定义好的 `button_send` 字符串资源。

此时的 <[LinearLayout]> 看起来应该是这样：

res/layout/content\_my.xml

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

> **注**：宽和高被设置为 `"wrap_content"`，这时按钮占据的大小就是按钮里文本的大小。这个按钮不需要指定 [android:id] 的属性，因为 Activity 代码中不会引用该 Button。

当前 [EditText] 和 [Button] 部件只是适应了他们各自内容的大小，如图 2 所示：

![图 2: EditText Wrap][figure_2_edittext_wrap]

**图 2** [EditText] 和 [Button] 窗体小组件使用 `"wrap_content"` 作为宽度属性的值。

这样设置对按钮来说很合适，但是对于文本框来说就不太好了，因为用户可能输入更长的文本内容。因此如果能够占满整个屏幕宽度会更好。[LinearLayout] 使用 *权重* 属性达到这个目，即 [android:layout_weight] 属性。

权重的值指的是每个部件所占剩余空间的大小，该值与同级部件所占空间大小有关。这就类似于饮料的成分配方：“两份伏特加酒，一份咖啡利口酒”，即该酒中伏特加酒占三分之二。例如，我们定义一个权重为 2 的 View，另一个 View 的权重是 1，那么总数就是 3；这时第一个 View 占据 2/3 的空间，第二个占据 1/3 的空间。如果再加入第三个 View，权重设为 1，那么第一个 View（权重为 2 的）会占据 1/2 的空间，剩余的另外两个 View 各占 1/4。（请注意，使用权重的前提一般是给 View 的宽或者高的大小设置为 0dp，然后系统根据上面的权重规则来计算 View 应该占据的空间。但在很多情况下，如果给 View 设置了 match_parent 的属性，那么在计算权重时则不是通常的正比，而是反比。也就是说，权重值大的反而占据空间小）。

对于所有的 View 默认的权重是 0，如果只设置了一个 View 的权重大于 0，则该 View 将占据除去别的 View 本身占据的空间的所有剩余空间。因此这里设置 EditText 的权重为 1，使其能够占据除了按钮之外的所有空间。

## 让输入框充满整个屏幕的宽度

为让 [EditText] 充满剩余空间，做如下操作：

1. 在 `content_my.xml` 文件里，设置 <[EditText]> 的 `layout_weight` 属性值为 `1`。

2. 设置 <[EditText]> 的 `layout_width` 值为 `0dp`。

res/layout/content\_my.xml

```xml
<EditText
    android:layout_weight="1"
    android:layout_width="0dp"
    ... />
```

为了提升布局的效率，在设置权重时，应该把 [EditText] 的宽度设为 0dp。如果设置宽度为 `"wrap_content"`，系统需要计算这个部件所占用的宽度；而此时的 [EditText] 因为设置了权重，所以会占据剩余空间；所以，最终导致的结果是：EditText 的宽度成了不起作用的属性。

设置 [EditText] 权重后的效果如图 3：

![图 3: EditText Gravity][figure_3_edittext_gravity]

**图 3** 因 [EditText] 窗体小组件被设置了全部权重，所以占据了 [LinearLayout] 的剩余空间。

现在看一下完整的布局文件内容：

res/layout/content\_my.xml

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
</LinearLayout>
```

## 运行应用

整个布局默认被应用于创建项目的时候 SDK 工具自动生成的 [Activity]，运行看下效果：

+ 在 Android Studio 里，点击工具栏里的 Run 按钮 ![Run 按钮][icon_run]。

+ 或者使用命令行，进入你项目的根目录直接执行:

  ```
  $ ant debug
  adb install -r app/build/outputs/apk/app-debug.apk
  ```

下一小节将学习有关如何对按钮做出相应，同时读取文本中的内容，启动另外一个 Activity 等。

[下一节：启动另一个 Activity](./starting-activity.html)


[Activity]: //developer.android.com/reference/android/app/Activity.html
[Button]:   //developer.android.com/guide/topics/ui/controls/button.html
[EditText]: //developer.android.com/reference/android/widget/EditText.html
[Layout]:   //developer.android.com/guide/topics/ui/declaring-layout.html
[LinearLayout]: //developer.android.com/reference/android/widget/LinearLayout.html
[ViewGroup]:    //developer.android.com/reference/android/view/ViewGroup.html
[View]:         //developer.android.com/reference/android/view/View.html
[android:hint]: //developer.android.com/reference/android/widget/TextView.html#attr_android:hint
[android:id]:   //developer.android.com/reference/android/view/View.html#attr_android:id
[android:layout_height]: //developer.android.com/reference/android/view/View.html#attr_android:layout_height
[android:layout_weight]: //developer.android.com/reference/android/widget/LinearLayout.LayoutParams.html#weight
[android:layout_width]:  //developer.android.com/reference/android/view/View.html#attr_android:layout_width
[android:orientation]: //developer.android.com/reference/android/widget/LinearLayout.html#attr_android:orientation
[android:text]: //developer.android.com/reference/android/widget/TextView.html#attr_android:text
[text field]:   //developer.android.com/guide/topics/ui/controls/text.html
[布局向导]:      //developer.android.com/guide/topics/ui/declaring-layout.html
[兼容不同的设备]: ../supporting-devices/index.html

[figure_1_viewgroup]:        ./viewgroup.png
[figure_2_edittext_wrap]:    ./edittext_wrap.png
[figure_3_edittext_gravity]: ./edittext_gravity.png

[icon_hide]: ./as-hide-side.png
[icon_run]:  ./eclipse-run.png
