# 兼容键盘导航

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:

除了软键盘输入法(如屏幕键盘)以外，Android支持物理键盘连接到设备上。一个键盘不仅提供为文本输入提供方便地模式，而提供一个合适的方法来导航和与应用交互。尽管多数的手持设备像手机使用触摸作为主要的交互方式，平板和一些其他的设备正在逐步流行起来，许多用户喜欢外接键盘。

随着更多的Android设备提供这种体验，为你的应用添加通过键盘进行交互的支持优化是很重要的。这节课介绍了怎样为键盘导航提供更好的支持。

>**注意：**对那些没有使用可见导航提示的应用来说，在应用中支持方向性的导航对于应用的可用性也是很重要的。完全支持方向性导航在你的应用中还可以帮助你使用诸如[uiautomator](http://developer.android.com/tools/help/uiautomator/index.html)进行[自动化用户界面测试化](http://developer.android.com/tools/testing/testing_ui.html)。

## 测试你的应用

可能用户已经可以在你的应用中使用键盘导航了，因为Android系统默认开启了大多是必要的行为。

所有由Android framework(如Button和EditText) 提供的交互 widgets是可获得焦点的。这意味着用户可以使手控设备如D-pad或键盘或widgets发亮或者其他一些获得输入焦点的行为改变外观。

为了测试你的应用：

1. 在实体键盘的设备上安装你的应用

  如果你没有带实体键盘的设备，连接一个蓝牙键盘或者USB键盘(尽管并不是所有的设备都支持USB连接)

  你还可以使用Android虚拟机

  1. 在AVD管理器中，或者点击New Device或者选择一个已存在的文档点击Clone.
  2. 在出现的窗口中，确保键盘和D-pad开启。

2. 为了验证你的应用，只是用Tab键来进行UI导航，确保每一个UI控制的焦点如预期的一致。
   查看每个不在预期焦点的实例。
3. 从头开始，使用方向键(键盘上的箭头键)来控制你应用的导航。
   从每一个在你UI中的焦点元素，按上、下、左、右。
   查看每个不在预期焦点的实例

如果你遇到任何使用Tab键或方向键不如预期，在布局文件中指定应该的焦点，如下面几部分所讨论的。

## 处理Tab导航

当一个用户使用键盘上到Tab键导航到你的应用时，系统会在元素之间传递焦点，取决于他们在布局文件中的显示顺序。如果你使用相对布局，在屏幕上的元素顺序与文件中元素的顺序不一致，那样你可能需要手动的指定焦点顺序。

举例来说，在下面的布局文件中，两个对其右边的按钮和一个对齐第二个按钮导航。为了把焦点从第一个按钮传递到文本域，然后再传递到第二个按钮，布局文件需要清楚的为每一个可聚焦的元素定义焦点顺序，使用属性[android:nextFocusForward](http://developer.android.com/reference/android/view/View.html#attr_android:nextFocusForward)：

```xml
<RelativeLayout ...>
    <Button
        android:id="@+id/button1"
        android:layout_alignParentTop="true"
        android:layout_alignParentRight="true"
        android:nextFocusForward="@+id/editText1"
        ... />
    <Button
        android:id="@+id/button2"
        android:layout_below="@id/button1"
        android:nextFocusForward="@+id/button1"
        ... />
    <EditText
        android:id="@id/editText1"
        android:layout_alignBottom="@+id/button2"
        android:layout_toLeftOf="@id/button2"
        android:nextFocusForward="@+id/button2"
        ...  />
    ...
</RelativeLayout>
```
现在焦点从button1到button2再到editText1改成了合适的按照出现在屏幕上顺序到从button1到editText1再到button2.

## 处理直接的导航

用户也能够使用键盘上的方向键在你的app中导航(这种行为与在D-pad和轨迹球中的导航一致)。系统提供了一个最佳猜测对于哪个视图应该给予焦点在一个基于方向的基于布局文件的在屏幕上展现的布局。然而有时，系统会猜测错误。

如果你的系统没有传递焦点到合适的视图中在导航到一个给定的视图中的时候，指定一个视图使用如下的属性：

* android:nextFocusUp
* android:nextFocusDown
* android:nextFocusLeft
* android:nextFocusRight

每一个属性设计了下一个接受焦点的视图当用户导航到那个方向时，如指定当view的ID一样。举例来说：

```xml
<Button
    android:id="@+id/button1"
    android:nextFocusRight="@+id/button2"
    android:nextFocusDown="@+id/editText1"
    ... />
<Button
    android:id="@id/button2"
    android:nextFocusLeft="@id/button1"
    android:nextFocusDown="@id/editText1"
    ... />
<EditText
    android:id="@id/editText1"
    android:nextFocusUp="@id/button1"
    ...  />
```

