# 兼容键盘导航

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:<http://developer.android.com/training/keyboard-input/navigation.html>

除了软键盘输入法（如屏幕键盘）以外，Android还支持接入物理键盘。键盘不仅为文本输入提供了一种方便的模式，还可以给予用户另一种与应用交互的方法。尽管多数诸如手机之类的手持设备使用触摸作为主要的交互方式，然而平板等设备的逐步流行，使得越来越多的用户喜欢接入外接键盘。

由于越来越多的Android设备开始支持这样的用户体验，因此优化应用的键盘交互是很重要的。这节课将介绍如何为键盘导航提供更好的支持。

>**注意：**在应用中支持方向导航非常重要，这样可以确保那些不用视觉提示元素的用户可以正常使用我们的应用。在应用中完全支持方向性导航中还可以帮助我们利用诸如[uiautomator](http://developer.android.com/tools/help/uiautomator/index.html)等工具进行[自动化用户界面测试](http://developer.android.com/tools/testing/testing_ui.html)。

## 测试我们的应用

由于Android系统默认支持大多数必要的键盘导航功能，所以有可能我们的应用默认情况下就已经支持键盘导航了。

所有由Android框架提供的可交互控件（如Button和EditText）都是可获得焦点的。这意味着用户可以使用一些控制设备如D-pad或键盘来导航，另外在控件获得焦点后，其外观会发亮或者出现一些其他形式的改变。

为了测试我们的应用：

1. 在具有实体键盘的设备上安装应用

  如果你没有自带实体键盘的设备，可以连接一个蓝牙键盘或者USB键盘（并不是所有的设备都支持USB连接）

  当然我们还可以使用Android虚拟机

  1. 在AVD管理器中，或者点击**New Device**或者选择一个已存在的文档点击**Clone**。
  2. 在出现的窗口中，确保已启用键盘和D-pad。

2. 为了测试我们的应用，我们只用Tab键来进行UI导航，确保每一个UI控制都能按照预期那样获得焦点。对于那些焦点不按照预期移动的实例，我们需要对其额外关注。
   
3. 从头开始，这次使用方向键（键盘上的箭头按键）来控制应用的导航。
   对每一个在你UI中可获得焦点的元素，按上、下、左、右。对于那些焦点不按照预期移动的实例，我们需要对其额外关注。

如果遇到任何使用Tab键或方向键后，其结果同预期不相符合的实例，我们需要在布局文件中指定焦点的移动方式，该细节将在下面的章节展开。

## 处理Tab导航

当一个用户使用键盘上到Tab键进行导航时，系统会在元素之间传递焦点，顺序取决于他们在布局文件中的显示顺序。如果使用相对布局，且在屏幕上元素的显示顺序与文件中元素的顺序不一致，此时我们可能需要手动指定焦点顺序。

举例来说，在下面的布局文件中，两个按钮对齐屏幕的右边，另一个文本编辑框对齐第二个按钮的左边导航。为了把焦点从第一个按钮传递到文本域，然后再传递到第二个按钮，布局文件需要清楚的为每一个可聚焦的元素定义焦点顺序，使用属性[android:nextFocusForward](http://developer.android.com/reference/android/view/View.html#attr_android:nextFocusForward)：

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
现在焦点的移动顺序从之前的`button1`到`button2`再到`editText1`改成了出现在屏幕上的顺序，即从`button1`到`editText1`再到`button2`。

## 处理方向导航

用户也能够使用键盘上的方向键在应用中导航（这种行为与使用D-pad或轨迹球导航是一致的）。系统会基于频幕中的布局决定焦点传递给哪一个控件。当然有时候系统难免会做出错误的决定。

如果系统在给定了某个方向后，没有正确地传递焦点，我们需要使用如下属性指定哪一个视图应当接收焦点：

* android:nextFocusUp
* android:nextFocusDown
* android:nextFocusLeft
* android:nextFocusRight

每一个属性通过View的ID，指定了当用户在该方向上进行导航时，下一个接收焦点的View。举例来说：

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
