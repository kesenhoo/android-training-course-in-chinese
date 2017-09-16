# 建立简单的用户界面

> 编写：[crazypudding](https://github.com/crazypudding) - 原文：<http://developer.android.com/training/basics/firstapp/building-ui.html>

在本小节里，我们将学习使用Android Studio布局编辑器创建一个带有文本输入框和按钮的界面。下一节课将学会使 APP 对按钮做出响应——按钮被按下时，文本框里的内容被发送到另外一个 [Activity]。

Android 的图形用户界面由多个 *视图*（[View]）和 *布局*（[ViewGroup]）构建而成。[View] 是通用的 UI 窗体小组件，如：按钮（[Button]）、文本框（[Text field]）；而 [ViewGroup] 则是用来控制子视图如何显示在屏幕上的不可见的容器，如：网格部件（grid）、垂直列表部件（vertical list）。

![图 1: ViewGroup][figure_1_viewgroup]

**图 1** 关于 [ViewGroup] 对象如何组织布局分支和包含其他 [View] 对象。

Android 提供了一系列对应于 [View] 和 [ViewGroup] 子类的 XML 标签，大多数情况下，我们都会使用 XML 来定义自己的UI。不过这节课中我们不会练习 XML 语法，而是练习使用 Android Studio 的布局编辑器来创建布局，布局编辑器通过拖放 View 的方式可以更容易的创建一个布局。

## 打开布局编辑器

> **注意：** 下面的内容都假定我们使用Android Studio 2.3或2.3以上的版本并且通过[之前的课程]的内容创建了一个Android项目。

开始之前，按照如下步骤设置好工作台：

1.在Android Studio 的 Project 面板中，打开文件 `app/res/layout/activity_main.xml`。

2.为布局编辑器留出更多空间，通过选择 `View > Tool Windows > Project` 来关闭 **Project** 面板（或者点击 Android Studio 左侧的![window-project][figure_window-project]按钮）。

3.如果编辑器显示的是 XML 源码，点击左下角 **Design** 标签切换到 Design 模式。

4.点击 **Show Blueprint** ![layout-editor-blueprint][figure_layout-editor-blueprint]只显示蓝图布局。

5.在布局中显示 Constraints。将鼠标放在工具栏中 ![layout-editor-hide-constraints][figure_layout-editor-hide-constraints]按钮上会看到提示： **Hide Constraints**（当前为显示 Constraints）。

6.关闭自动连接功能。将鼠标放在工具栏中 ![layout-editor-autoconnect-on][figure_layout-editor-autoconnect-on]按钮上会看到提示： **Turn On Autoconnect**（当前为关闭状态）。

7.点击工具栏中 **Default Margins** ![layout-editor-margin][figure_layout-editor-margin]按钮并选择 **16**（稍后仍可以单独为每个 View 调整间距）。

8.点击工具栏中 **Device in Editor** ![layout-editor-device][figure_layout-editor-device]按钮并选择 **Pixel XL**。

以上操作完成后，Android Studio窗口应该如下图2所示

![图2_layout-editor_2x][figure_layout-editor_2x]

**图 2.** 显示 `activity_main.xml` 的布局编辑器

左下角的 **Component Tree** 面板显示的是当前布局中所有 View 的层级结构。本例中，根 View 是一个 `ConstraintLayout`，其中只包含一个 `TextView` 对象。

`ConstraintLayout` 根据每个 View 和与它平级的兄弟 View 以及父布局之间的约束来确定它的位置。通过这个方法，我们可以创建简单或者复杂但是层级结构扁平化的布局。这样一来，就避免了嵌套布局的出现（如图1展示的那样，一个 ViewGroup 嵌套另一个 ViewGroup），缩短了绘制
 UI 的时间。
 
例如，我们可以这样创建布局（如图3）：

* View A 距父布局顶部16dp
* View A 距父布局左边缘16dp
* View B 距 View A 右边16dp
* View B 与 View A 顶部对齐

![图3_traint-example_2x][figure_constraint-example_2x]

**图 3.** `ConstraintLayout`中两个 View 的位置
 
在本节后面的部分中，我们将实际建立一个类似的布局。
 
## 添加一个文本框

1.首先，要删除布局中已经存在的 View，在 **Component Tree** 面板中选中并删除 **TextView**。

2.在左侧 **Palette** 面板的左半部分窗格中选中 **Text** 分类，从右半部分窗格中拖出 **Plain Text** 并把它放到编辑器中靠近布局顶部的地方。这是一个可以输入纯文本的 [EditText]

3.点击编辑器中的 View。可以看到，在每个角上都有一个方形的锚点，这是用来控制 View 的大小的；在每条边中间都有一个圆形锚点，这是用来添加约束的。

  为了更准确的控制这些锚点，可以通过工具栏中的缩放按钮来缩放虚拟 UI 界面。
  
4.按住 View 顶部的圆形锚点，将它拖动到父布局顶部，直到有吸附效果时放开。可以看到 View 和父布局顶部之间出现一条带箭头的细线，这就是一个约束——它指定 View 距离父布局顶部16dp（因为刚刚设置的默认值是16dp）。

5.同样的，在 View 的左边和父布局的左边缘创建一个约束。

最终的效果应该如图4所示。

![图4_constraint-textbox_2x][figure_constraint-textbox_2x]

**图 4.** 文本框与父布局顶部和左边形成约束

## 添加一个按钮

1.同样的，在 **Palette** 面板左侧部分选中 **Widgets** 分类，然后拖出 **Button** 并放到编辑器中靠近父布局右上角的地方。

2.在 Button 的左侧与 EditText 右侧建立一个约束。

3.针对可显示文字的 View ，我们可以通过在每个 View 的文字基线之间建立约束从而使得它们水平对齐。在编辑器中选中一个 View ，这个被选中的 View 下方会出现一个 **Baseline Constraint** ![layout-editor-action-baseline][figure_layout-editor-action-baseline]按钮。例如选中本例中的 Button ，Button 里面会出现一个线状的锚点，将这个锚点拖放到 EditText 中的基线锚点上。

现在可以看到的效果如图5所示。

![图5_constraint-button_2x][figure_constraint-button_2x]

**图 5.** Button 左侧和 EditText 右侧以及彼此的基线之间建立了约束

> **注意：** 我们也可以用 Button 顶部或底部的锚点建立约束从而达到水平对齐的目的，但是由于在 Button 内部是有一个 padding 值的，所以通过这种方式建立约束并不会真正实现水平对齐。

## 改变 UI 中显示的字符串

点击工具栏中的 **Show Design** ![layout-editor-design][figure_layout-editor-design]按钮可以预览我们的 UI，可以看到 EditText 默认显示的字符串是 “Name”， Button 默认显示的字符串是 “Button”。接下来我们的目的就是修改这些字符串。

1.打开 **Project** 面板，然后打开文件 `app/res/values/strings.xml`。

  `strings.xml`是一个[字符串资源文件]，我们应该把 UI 布局中出现的字符串定义在这个文件中。相比于在布局或逻辑代码中硬编码，这样在一个文件集中管理所有的字符串更利于字符串的查找、修改甚至是本地化操作。

2.点击右上角的 **Open editor** 按钮可以打开 [**Translations Editor**]，在这个编辑器中不仅可以增加、修改默认字符串，还能很好的管理所有字符串的翻译版本。

3.点击左上角 **Add Key** ![add-sign-green-icon][figure_add-sign-green-icon]按钮为 EditText 新增一个提示文字（hint text）：

  1.在 Key 那一栏填入 "edit_message" , 这就是这个字符串的 id。
  
  2.在 Default Value 那一栏填入 "Enter a message" ，这就是字符串的内容，会显示到 UI 中。
  
  3.点击 **OK**。
  
![图6_add-string_2x][figure_add-string_2x]

**图 6.** 新增字符串资源的对话框

4.新增另一个字符串资源， Key 为 "button_send" ，Default Value 为 "Send"。

现在可以通过点击标签栏的 **activity_main.xml** 返回布局文件通过以下步骤为每个 View 设置相应的字符串资源：

1.在布局编辑器中选中 EditText 对象，如果在窗口右侧没有出现 **Propreties** 面板的话可以点击右边侧边栏中的 **Properities** ![window-properties][figure_window-properties]按钮。 **Propreties** 面板会显示选中对象的属性。

2.在 **Propreties** 面板中找到 *hint* 属性，然后点击文本框右边的 **Pick a Resource** ![pick-resource][figure_pick-resource]按钮，在弹出的对话框中双击 **edit_message**。

3.同样在 EditText 的 **Propreties** 面板中删除 *text* 属性的值（当前值为 "Name"）。

4.在布局编辑器中选中 Button 对象切换到 Button 对应的 **Propreties** 面板，将 Button 的 *text* 属性值更换成 id 为 "button_send" 的字符串资源。

## 让文本输入框大小灵活

为了创建一个可以适应不同大小的屏幕，我们需要调整 EditText，使得它可以在计算完 Button 的宽度和 Margin 间距之后，自行伸展至占有所有的剩余宽度。

在继续之前，点击 **Show Blueprint** ![layout-editor-blueprint][figure_layout-editor-blueprint]按钮，我们依然在蓝图模式下工作。

1.选择所有的 View 对象（选中其中一个，按住 Shift 并选中另一个），鼠标右击其中一个 View 对象，从菜单中选择 **Center Horizontally**。
  
  虽然我们的目标不是让所有的 View 对象水平居中，但是这种方法可以在这些 View 之间快速建立起一个*约束链*(constraint chain)。约束链是在两个或多个 View 对象之间形成的一个双向约束，它可以将这些 View 对象链接起来多为一个整体进行编排布局。不过这样会消除 View 对象之间水平方向的间距，所以后面需要手动更改。设置完约束链的效果如下图：
  
![图7_constraint-centered_2x][figure_constraint-centered_2x]
  
2.选中 Button 并打开相应的 **Propreties** 面板，将左右 margin 设置为16。

3.选中 EditText 并将 left margin 设置为16。

4.在 EditText 的 **Propreties** 面板中，点击图8中标示为1处的按钮（这是宽度指示符）直到出现 ![layout-width-match][figure_layout-width-match]为止，这表示我们已经将 EditText 的 *width* 属性设置为 **Match Constraints** 了。
  
  "Match Constraints"的意思是 View 的宽度受水平方向的约束和间距影响。因此，EditText 的宽度会伸展至占用所有剩余的水平空间（在计算完 Button 的宽度和 Margin 间距之后）。
  
![图8_properties-margin_2x][figure_properties-margin_2x]

**图 8.** 设置 width 属性值为 "Match Constraints"

目前为止，我们已经完成了本节课程中布局的所有内容。最终效果应该如图9所示。

![图9_constraint-chain_2x][figure_constraint-chain_2x]

**图 9.** EditText 占有所有剩余空间

如果您的布局没有达到预期的效果，可以查看下面的完整代码进行对比（各属性出现的顺序不会影响布局的样式）。以下是完整代码：

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context="com.example.myfirstapp.MainActivity">

    <EditText
        android:id="@+id/editText"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:ems="10"
        android:hint="@string/edit_message"
        android:inputType="textPersonName"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintRight_toLeftOf="@+id/button"
        android:layout_marginLeft="16dp" />

    <Button
        android:id="@+id/button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/button_send"
        app:layout_constraintBaseline_toBaselineOf="@+id/editText"
        app:layout_constraintLeft_toRightOf="@+id/editText"
        app:layout_constraintRight_toRightOf="parent"
        android:layout_marginLeft="16dp"
        android:layout_marginRight="16dp" />
</android.support.constraint.ConstraintLayout>
```

想要了解更多关于 chain 的信息或者更多关于 *ConstraintLayout* 的使用方法，可以参考[Build a Responsive UI with ConstraintLayout]。

## 运行我们的 app

如果在上一课中已经将 app 安装在设备上了，只要点击工具栏中 **Apply Changes** ![toolbar-apply-changes][figure_toolbar-apply-changes]按钮就可以将最新的布局更新到手机上。或者点击 **Run** ![toolbar-run][figure_toolbar-run]按钮将 app 安装到手机上并运行。

目前为止，当我们点击 Button 时仍然不会有任何反应，下一课中我们将完善 app，点击 Button 时会启动另一个 Activity。

[下一节：启动另一个 Activity](./starting-activity.html)


[Activity]: //developer.android.com/reference/android/app/Activity.html
[Button]:   //developer.android.com/guide/topics/ui/controls/button.html
[EditText]: //developer.android.com/reference/android/widget/EditText.html
[Layout]:   //developer.android.com/guide/topics/ui/declaring-layout.html
[TextView]: //developer.android.com/reference/android/widget/TextView.html
[ViewGroup]:    //developer.android.com/reference/android/view/ViewGroup.html
[View]:         //developer.android.com/reference/android/view/View.html
[text field]:    //developer.android.com/guide/topics/ui/controls/text.html
[**Translations Editor**]:  //developer.android.com/studio/write/translations-editor.html
[Build a Responsive UI with ConstraintLayout]:  //developer.android.com/training/constraint-layout/index.html
[之前的课程]:    ./creating-prokect.html
[字符串资源文件]:  //developer.android.com/guide/topics/resources/string-resource.html

[figure_1_viewgroup]:                     ./viewgroup.png
[figure_window-project]:                  ./window-project.png
[figure_layout-editor-blueprint]:         ./layout-editor-blueprint.png
[figure_toolbar-run]:                     ./toolbar-run.png
[figure_toolbar-apply-changes]:           ./toolbar-apply-changes.png
[figure_window-project]:                  ./window-project.png
[figure_layout-editor-blueprint]:         ./layout-editor-blueprint.png
[figure_layout-editor-hide-constraints]:  ./layout-editor-hide-constraints.png
[figure_layout-editor-autoconnect-on]:    ./layout-editor-autoconnect-on.png
[figure_layout-editor-margin]:            ./layout-editor-margin.png
[figure_layout-editor-device]:            ./layout-editor-device.png
[figure_layout-editor_2x]:                ./layout-editor_2x.png
[figure_constraint-example_2x]:           ./constraint-example_2x.png
[figure_constraint-textbox_2x]:           ./constraint-textbox_2x.png
[figure_layout-editor-action-baseline]:   ./layout-editor-action-baseline.png
[figure_constraint-button_2x]:            ./constraint-button_2x.png
[figure_layout-editor-design]:            ./layout-editor-design.png
[figure_add-sign-green-icon]:             ./add-sign-green-icon.png
[figure_add-string_2x]:                   ./add-string_2x.png
[figure_window-properties]:               ./window-properties.png
[figure_pick-resource]:                   ./pick-resource.png
[figure_layout-editor-blueprint]:         ./layout-editor-blueprint.png
[figure_constraint-centered_2x]:          ./constraint-centered_2x.png
[figure_layout-width-match]:              ./layout-width-match.png
[figure_properties-margin_2x]:            ./properties-margin_2x.png
[figure_constraint-chain_2x]:             ./constraint-chain_2x.png
