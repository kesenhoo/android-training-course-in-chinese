# 开发辅助程序

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/accessibility/accessible-app.html>

本课程将教您：

1. 添加内容描述(*Content Descriptions*)

2. 设计焦点导航（*Focus Navigation*）

3. 触发可达性事件(*Accessibility Events*)

4. 测试你的程序

Android平台本身有一些专注可达性的特性，这些特性可以帮助你专门为那些视觉上或生理上有缺陷的用户在应用上做特别的优化。然而，正确的优化方式或最简单利用这个特性的方法往往不是那么显而易见的。本课程将给您演示如何利用和实现这些策略和平台的特性功能，构建一个更友好的具有可达性的Android应用。

## 添加内容描述

一个好的交互界面上的元素通常不需要特别使用一个标签来表明这个元素的作用。例如对于一个任务型应用来说，一个项目旁边的勾选框表达的意思就非常明确，或者对于一个文件管理应用，垃圾桶的图标表达的意思也非常清除。然而对于具有视觉障碍的用户来说，其他类型的UI交互提示是有必要的。

幸运的是，我们可以很轻松的给一个UI元素加上标签，这样类似于[TalkBack](https://play.google.com/store/apps/details?id=com.google.android.marvin.talkback)这样的基于语音的Accessibility Service就可以将标签的内容朗读出来。如果你的标签在整个应用的生命周期中不太可能会发生变化(*比如‘停止’或者‘购买’*)，你就可以在XML布局文件中对*android:contentDescription*属性进行设置。代码如下：

```xml
<Button
    android:id=”@+id/pause_button”
    android:src=”@drawable/pause”
    android:contentDescription=”@string/pause”/>
```
然而，在很多情况下描述的内容是基于上下文环境的，比如说一个开关按钮的状态，或者在list中一片可选的数据项。在运行时编辑内容描述可以使用*setContentDescription()*方法，代码如下：

```java
String contentDescription = "Select " + strValues[position];
label.setContentDescription(contentDescription);
```

将以上功能添加进您的代码是提高您应用可达性的最简单的方法。尝试着将那些有用的地方都加入内容描述，但同时要避免像web开发者那样将所有的元素都标注，那样会产生大量的无用信息。比如说，不要将应用图标的内容描述设置为*‘应用图标’*。这只会对用户的浏览产生干扰。

来试试吧！下载TalkBack(谷歌开发的一款可达性应用)，在**Settings > Accessibility > TalkBack**将它开启。然后使用你的应用听听看TalkBack发出的语音提示。


## 设计焦点导航

你的应用除了支持触摸操作外，更应该支持其他的导航方式。很多Android设备不仅仅提供了触摸屏，还提供了其他的导航硬件比如说十字键、方向键、轨迹球等等。除此之外，最新的Android发行版本也支持蓝牙或USB的外接设备，比如键盘等等。

为了实现这种方式的导航，一切用户可以用来可导航的元素(*navigational elements*)都需要设置为focusable（*聚焦*）,它可以在运行时通过*View.setFocusable()*方法来进行设定，或者也可以在XML布局文件中使用*android:focusable*来设置。

每个UI控件有四个属性，*android:nextFocusUp*,*android:nextFocusDown*,*android:nextFocusLeft*,*android:nextFocusRight*,用户在导航时可以利用这些属性来指定下一个焦点的位置。系统会自动根据布局的方向来确定导航的顺序，如果在您的应用中系统提供的方案并不合适，您可以用这些属性来进行自定义的修改。

比如说，下面就是一个关于按钮和标签的例子，他们都是可聚焦的(*focusable*)，按向下键会将焦点从按钮移到文字上，按向上会重新将焦点移到按钮上。
```xml
<Button android:id="@+id/doSomething"
    android:focusable="true"
    android:nextFocusDown=”@id/label”
    ... />
<TextView android:id="@+id/label"
    android:focusable=”true”
    android:text="@string/labelText"
    android:nextFocusUp=”@id/doSomething”
    ... />
```
证实您的应用运行正确的直观方法，最简单的方式就是在Android虚拟机里运行您的应用，然后使用虚拟器的方向键来在各个元素之间导航，使用OK按钮来代替触摸操作。

## 触发可达性事件

如果你在你的Android框架中使用了View组件，当你选中了一个View或者是焦点变化的时候，可达性事件(*AccessibilityEvent*)都会产生。这些事件会被传递到Accessibility Service中进行处理，实现一些辅助功能，如语音提示等。

如果你写了一个自定义的View，请确保它在合适的时候产生事件。使用*sendAccessibilityEvent(int)*函数可以产生可达性事件，其中的参数表示事件的类型。完整的可达性事件类型可查阅[AccessibilityEvent](http://developer.android.com/reference/android/view/accessibility/AccessibilityEvent.html)参考文档。

比如说，你拓展了一个图片的View，你希望在它聚焦的时候使用键盘打字可以在其中插入题注，这时候发送一个*TYPE_VIEW_TEXT_CHANGED*事件就非常合适，尽管它不是本身就构建在这个图片View中的。产生事件的代码如下：
```java
public void onTextChanged(String before, String after) {
    ...
    if (AccessibilityManager.getInstance(mContext).isEnabled()) {
        sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED);
    }
    ...
}
```

## 测试你的程序

请确保您在添加可达性功能后测试它的有效性。为了测试内容描述可达性事件，请安装并启用一个Accessibility Service。比如说使用TalkBack，它是一个免费的开源的屏幕读取软件，可在Google Play上进行下载。Service启动后，请测试您应用中所有的功能，同时听听TalkBack的语音反馈。

同时，尝试着用一个方向控制器来控制你的应用，而非使用直接触摸的方式。你可以使用一个物理设备，比如十字键、轨迹球等。如果没有条件，可以使用android虚拟器，它提供了虚拟的按键控制。

在测试导航与反馈的同时，和在没有任何视觉提示的情况下，应该对你的应用大概是一个什么样子有所认识。出现问题就修复优化它们，最终就会开发出一个更易用可达的Android程序。



