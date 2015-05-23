# 创建自定义的View类

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/custom-views/create-view.html>

设计良好的类总是相似的。它使用一个好用的接口来封装一个特定的功能，它有效的使用CPU与内存，等等。为了成为一个设计良好的类，自定义的view应该:

* 遵守Android标准规则。
* 提供自定义的风格属性值并能够被Android XML Layout所识别。
* 发出可访问的事件。
* 能够兼容Android的不同平台。

Android的framework提供了许多基类与XML标签用来帮助你创建一个符合上面要求的View。这节课会介绍如何使用Android framework来创建一个view的核心功能。


## 继承一个View
Android framework里面定义的view类都继承自View。你自定义的view也可以直接继承View，或者你可以通过继承既有的一个子类(例如Button)来节约一点时间。

为了让Android Developer Tools能够识别你的view，你必须至少提供一个constructor，它包含一个Contenx与一个AttributeSet对象作为参数。这个constructor允许layout editor创建并编辑你的view的实例。

```java
class PieChart extends View {
    public PieChart(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
}
```

## 定义自定义属性
为了添加一个内置的View到你的UI上，你需要通过XML属性来指定它的样式与行为。良好的自定义views可以通过XML添加和改变样式，为了让你的自定义的view也有如此的行为，你应该:

* 为你的view在<declare-styleable>资源标签下定义自设的属性
* 在你的XML layout中指定属性值
* 在运行时获取属性值
* 把获取到的属性值应用在你的view上

这一节讨论如何定义自定义属性以及指定属性值，下一节将会实现在运行时获取属性值并将它应用。

为了定义自设的属性，添加 <declare-styleable> 资源到你的项目中。放置于res/values/attrs.xml文件中。下面是一个attrs.xml文件的示例:

```xml
<resources>
   <declare-styleable name="PieChart">
       <attr name="showText" format="boolean" />
       <attr name="labelPosition" format="enum">
           <enum name="left" value="0"/>
           <enum name="right" value="1"/>
       </attr>
   </declare-styleable>
</resources>
```

上面的代码声明了2个自设的属性，**showText**与**labelPosition**，它们都归属于PieChart的项目下的styleable实例。styleable实例的名字，通常与自定义的view名字一致。尽管这并没有严格规定要遵守这个convention，但是许多流行的代码编辑器都依靠这个命名规则来提供statement completion。

一旦你定义了自设的属性，你可以在layout XML文件中使用它们，就像内置属性一样。唯一不同的是你自设的属性是归属于不同的命名空间。不是属于`http://schemas.android.com/apk/res/android`的命名空间，它们归属于`http://schemas.android.com/apk/res/[your package name]`。例如，下面演示了如何为PieChart使用上面定义的属性：

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
   xmlns:custom="http://schemas.android.com/apk/res/com.example.customviews">
 <com.example.customviews.charting.PieChart
     custom:showText="true"
     custom:labelPosition="left" />
</LinearLayout>
```

为了避免输入长串的namespace名字，示例上面使用了`xmlns`指令，这个指令可以指派`custom`作为`http://schemas.android.com/apk/res/com.example.customviews`namespace的别名。你也可以选择其他的别名作为你的namespace。

请注意，如果你的view是一个inner class，你必须指定这个view的outer class。同样的，如果PieChart有一个inner class叫做PieView。为了使用这个类中自设的属性，你应该使用com.example.customviews.charting.PieChart$PieView.

## 应用自定义属性
当view从XML layout被创建的时候，在xml标签下的属性值都是从resource下读取出来并传递到view的constructor作为一个AttributeSet参数。尽管可以从AttributeSet中直接读取数值，可是这样做有些弊端：

* 拥有属性的资源并没有经过解析
* Styles并没有运用上

> 翻译注：通过 attrs 的方法是可以直接获取到属性值的，但是不能确定值类型，如:
```java
String title = attrs.getAttributeValue(null, "title");
int resId = attrs.getAttributeResourceValue(null, "title", 0);
title = context.getText(resId));
```
>都能获取到 "title" 属性，但你不知道值是字符串还是resId，处理起来就容易出问题，下面的方法则能在编译时就发现问题

取而代之的是，通过obtainStyledAttributes()来获取属性值。这个方法会传递一个[TypedArray](http://developer.android.com/reference/android/content/res/TypedArray.html)对象，它是间接referenced并且styled的。

Android资源编译器帮你做了许多工作来使调用[obtainStyledAttributes()](http://developer.android.com/reference/android/content/res/Resources.Theme.html#obtainStyledAttributes(android.util.AttributeSet, int[], int, int))更简单。对res目录里的每一个`<declare-styleable>`资源，自动生成的R.java文件定义了存放属性ID的数组和常量，常量用来索引数组中每个属性。你可以使用这些预先定义的常量来从[TypedArray](http://developer.android.com/reference/android/content/res/TypedArray.html)中读取属性。这里就是`PieChart`类如何读取它的属性:

```java
public PieChart(Context context, AttributeSet attrs) {
   super(context, attrs);
   TypedArray a = context.getTheme().obtainStyledAttributes(
        attrs,
        R.styleable.PieChart,
        0, 0);

   try {
       mShowText = a.getBoolean(R.styleable.PieChart_showText, false);
       mTextPos = a.getInteger(R.styleable.PieChart_labelPosition, 0);
   } finally {
       a.recycle();
   }
}
```

清注意TypedArray对象是一个共享资源，必须被在使用后进行回收。

## 添加属性和事件
Attributes是一个强大的控制view的行为与外观的方法，但是他们仅仅能够在view被初始化的时候被读取到。为了提供一个动态的行为，需要暴露出一些合适的getter 与setter方法。下面的代码演示了如何使用这个技巧:

```java
public boolean isShowText() {
   return mShowText;
}

public void setShowText(boolean showText) {
   mShowText = showText;
   invalidate();
   requestLayout();
}
```

请注意，在setShowText方法里面有调用[invalidate()](http://developer.android.com/reference/android/view/View.html#invalidate()) and [requestLayout()](http://developer.android.com/reference/android/view/View.html#requestLayout()). 这两个调用是确保稳定运行的关键。当view的某些内容发生变化的时候，需要调用invalidate来通知系统对这个view进行redraw，当某些元素变化会引起组件大小变化时，需要调用requestLayout方法。调用时若忘了这两个方法，将会导致hard-to-find bugs。

自定义的view也需要能够支持响应事件的监听器。例如，`PieChart`暴露了一个自定义的事件`OnCurrentItemChanged`来通知监听器，用户已经切换了焦点到一个新的组件上。

我们很容易忘记了暴露属性与事件，特别是当你是这个view的唯一用户时。请花费一些时间来仔细定义你的view的交互。一个好的规则是总是暴露任何属性与事件。

## 设计可访问性

自定义view应该支持广泛的用户群体，包含一些不能看到或使用触屏的残障人士。为了支持残障人士，我们应该：

* 使用`android:contentDescription`属性标记输入字段。
* 在适当的时候通过调用`sendAccessibilityEvent()` 发送访问事件。
* 支持备用控制器，如方向键（D-pad）和轨迹球（trackball）等。


对于创建使用的 views的更多消息, 请参见Android Developers Guide中的 [Making Applications Accessible](http://developer.android.com/guide/topics/ui/accessibility/apps.html#custom-views) 。
