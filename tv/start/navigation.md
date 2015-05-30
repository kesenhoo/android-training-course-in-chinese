<!-- # Creating TV Navigation # -->
# 创建TV导航

> 编写:[awong1900](https://github.com/awong1900) - 原文:<http://developer.android.com/training/tv/start/navigation.html>

<!-- TV devices provide a limited set of navigation controls for apps. Creating an effective navigation scheme for your TV app depends on understanding these limited controls and the limits of users' perception while operating your app. As you build your Android app for TVs, pay special attention to how the user actually Android navigates around your app when using remote control buttons instead of a touch screen.
-->

TV设备为应用程序提供一组有限的导航控件。为我们的TV应用创建有效的导航方案取决于理解这些有限的控件和用户操作应用时的限制。因此当我们为TV创建Android应用时，额外注意用户是用遥控器按键,而不是用触摸屏导航我们的应用程序。

<!-- This lesson explains the minimum requirements for creating effective TV app navigation scheme and how to apply those requirements to your app. -->

这节课解释了创建有效的TV应用导航方案的最低要求和如何对应用程序使用这些要求。

<!-- ## Enable D-pad Navigation ## -->
## 使用D-pad导航

<!-- On a TV device, users navigate with controls on a remote control device, using either a directional pad (D-pad) or arrow keys. This type of control limits movement to up, down, left, and right. To build a great TV-optimized app, you must provide a navigation scheme where the user can quickly learn how to navigate your app using these limited controls. -->

在TV设备上，用户用遥控器设备的方向手柄（D-pad）或者方向键去控制控件。这类控制器限制为上下左右移动。为了创建最优化的TV应用，我们必须提供一个用户能快速学习如何使用有限控件导航的方案。

<!-- The Android framework handles directional navigation between layout elements automatically, so you typically do not need to do anything extra for your app. However, you should thoroughly test navigation with a D-pad controller to discover any navigation problems. Follow these guidelines to test that your app's navigation system works well with a D-pad on a TV device: -->

Android framework自动地处理布局元素之间的方向导航操作，因此我们不需要在应用中做额外的事情。不管怎样，我们也应该用D-pad控制器实际测试去发现任何导航问题。接下来的指引是如何在TV设备上用D-pad测试应用的导航。

<!-- 
- Ensure that a user with a D-pad controller can navigate to all visible controls on the screen.
- For scrolling lists with focus, make sure that the D-pad up and down keys scroll the list, and the Enter key selects an item in the list. Verify that users can select an element in the list and that the list still scrolls when an element is selected.
- Ensure that switching between controls between controls is straightforward and predictable.
-->

- 确保用户能用D-pad控制器导航所有屏幕可见的控件。
- 对于滚动列表上的焦点，确保D-pad上下键能滚动列表，并且确定键能选择列表中的项。检查用户可以选择列表中的元素并且选中元素后仍可以滚动列表。
- 确保在控件之间切换是直接的和可预测的。

<!-- ### Modifying directional navigation ### -->
### 修改导航的方向

<!-- The Android framework automatically applies a directional navigation scheme based on the relative position of focusable elements in your layouts. You should test the generated navigation scheme in your app using a D-pad controller. After testing, if you decide you want users to move through your layouts in a specific way, you can set up explicit directional navigation for your controls. -->

基于布局元素中可选中的元素的相对位置，Android framwork自动应用导航方向方案。我们应该用D-pad控制器测试生成的导航方案。在测试后，如果我们想规定用户以一个特定的方式在布局中移动，我们可以在控件中设置明确的导航方向。

<!-- >**Note**: You should only use these attributes to modify the navigation order if the default order that the system applies does not work well. -->

>**Note**: 如果系统使用的默认顺序不是很好，我们应该仅用这些属性去修改导航顺序。

<!-- The following code sample shows how to define the next control to receive focus for a TextView layout object: -->
接下来的示例代码展示如何为TextView布局控件定义下一个控件焦点。

```xml
<TextView android:id="@+id/Category1"
        android:nextFocusDown="@+id/Category2"\>
```

<!-- The following table lists all of the available navigation attributes for Android user interface widgets: -->
接下来的列表展示了用户接口控件所有可用的导航属性。

属性          |	功能
:-----------|:----------------
[nextFocusDown](http://developer.android.com/reference/android/R.attr.html#nextFocusDown) |定义用户按下导航时的焦点
[nextFocusLeft](http://developer.android.com/reference/android/R.attr.html#nextFocusLeft) |定义用户按左导航时的焦点
[nextFocusRight](http://developer.android.com/reference/android/R.attr.html#nextFocusRight)|定义用户按右导航时的焦点
[nextFocusUp](http://developer.android.com/reference/android/R.attr.html#nextFocusUp)   |定义用户按上导航时的焦点

<!-- To use one of these explicit navigation attributes, set the value to the ID (android:id value) of another widget in the layout. You should set up the navigation order as a loop, so that the last control directs focus back to the first one. -->
去使用这些明确的导航属性，设置另一个布局控件的ID值（`android:id`值）。我们应该设置导航顺序为一个循环，因此最后一个控件返回至第一个焦点。

<!-- ## Provide Clear Focus and Selection ## -->
## 提供清楚的焦点和选中状态

<!-- The success of an app's navigation scheme on TV devices is depends on how easy it is for a user to determine what user interface element is in focus on screen. If you do not provide clear indications of focused items (and therefore what item a user can take action on), they can quickly become frustrated and exit your app. For the same reason, it is important to always have an item in focus that a user can take action on immediately after your app starts, or any time it is idle. -->

在TV设备上的应用导航方案的成功是基于用户如何容易的决定屏幕上界面元素的焦点。如果我们不提供清晰的焦点项显示（和用户能操作的选项），他们会很快泄气并退出我们的应用。同样的原因，重要的是当我们的应用开始或者任何无操作的时间中，总是有焦点项可以立即操作。

<!-- Your app layout and implementation should use color, size, animation, or a combination of these attributes to help users easily determine what actions they can take next. Use a uniform scheme for indicating focus across your application. -->

我们的应用布局和实现应该用颜色，大小，动画或者它们组在一起来帮助用户容易地决定下一步操作。在应用中用一致的焦点显示方案。

<!-- Android provides Drawable State List Resources to implement highlights for focused and selected controls. The following code example demonstrates how to enable visual behavior for a button to indicate that a user has navigated to the control and then selected it: -->
Android提供[Drawable State List Resources](http://developer.android.com/guide/topics/resources/drawable-resource.html#StateList)来实现高亮选中的焦点。接下来的示例代码展示了如何为用户导航到控件并选择它时使用视觉化按钮显示：

```xml
<!-- res/drawable/button.xml -->
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_pressed="true"
          android:drawable="@drawable/button_pressed" /> <!-- pressed -->
    <item android:state_focused="true"
          android:drawable="@drawable/button_focused" /> <!-- focused -->
    <item android:state_hovered="true"
          android:drawable="@drawable/button_focused" /> <!-- hovered -->
    <item android:drawable="@drawable/button_normal" /> <!-- default -->
</selector>
```

<!-- The following layout XML sample code applies the previous state list drawable to a Button: -->
接下来的XML示例代码对按钮控件应用了上面的按键状态列表drawable：

```xml
<Button
    android:layout_height="wrap_content"
    android:layout_width="wrap_content"
    android:background="@drawable/button" />
```

<!-- Make sure to provide sufficient padding within the focusable and selectable controls so that the highlights around them are clearly visible. -->
确保在可定为焦点的和可选中的控件中提供了充分的填充，以便围绕它们的高亮是清楚的。

<!-- For more recommendations on designing effective selection and focus for your TV app, see Patterns for TV. -->
更多建议关于TV应用中设计有效的选中和焦点，看[Patterns of TV](http://developer.android.com/design/tv/patterns.html)。

-------------
[下一节: 创建TV播放应用 >](../playback/index.html)
