> 编写:[zhaochunqi](https://github.com/zhaochunqi)

> 校对:

# 处理输入法可见性

当输入焦点移入或移出可编辑当文本域时，Android会相应的显示或隐藏输入法(如屏幕输入法)。系统也会决定你的输入法上方UI和文本域的显示。举例来说，当屏幕上竖直空间被压缩时，文本域可能填充所有的输入法上方的空间。对于多数的应用来说，这些默认的行为基本就足够了。

然而，在一些栗子中，你可能会想要更加直接的控制输入法的显示，指定你的布局在在输入法显示时候的表现。这节课会向你解释如何控制和回应输入法的可见性。

## 在Activity启动时显示输入法

尽管Android会在Activity启动时给予第一个文本域焦点，但是他并不会显示输入法。因为进入文本可能并不是activity中的主要任务，所以这项行为是合理的。然而，如果进入文本确实需要是首要的任务(如登录界面),你可能虚呀输入法默认显示。

为了在activity启动时展示输入法，添加android:windowSoftInputMode 属性到`<activity>`元素中，使用值 "stateVisible"，如下：

```xml
<application ... >
    <activity
        android:windowSoftInputMode="stateVisible" ... >
        ...
    </activity>
    ...
</application>
```

>**注意：**如果用户设备有一个实体键盘，软键盘输入法可能不显示。

## 需要时显示输入法

如果有一个方法在你的activity生命周期中你想要确保输入法到可见性，你可以使用 InputMethodManager 来表现。

举例来说，下面的方法调用了一个需要用户填写文本的View，调用了requestFocus() 来获取焦点，然后 showSoftInput()来打开输入法。

```java
public void showSoftKeyboard(View view) {
    if (view.requestFocus()) {
        InputMethodManager imm = (InputMethodManager)
                getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.showSoftInput(view, InputMethodManager.SHOW_IMPLICIT);
    }
}
```

>**注意：**一旦输入法设定可见了，你不应该用程序来隐藏。系统会在用户结束文本域的任务的时候隐藏，或者可以使用系统控制(如返回键)来隐藏。

## 指定你的UI回应方式

当你的输入法显示在屏幕上，减少了UI中的可用空间。系统会为你的UI的可见区的UI做调整但是可能并非很正确。为了确保你应用的最佳表现，你应该在UI的剩余空间中展示你想要展示的系统界面。

为了声明你在activity中的合适的对待，使用 android:windowSoftInputMode 属性在你的清单文件中的`<activity`元素使用某个"adjust"值。

举例来说，为了确保系统会在可用空间中重新调整布局的大小。为了确保你所有的布局内容都是可用的(尽管可能需要滑动)使用"adjustResize":

```xml
<application ... >
    <activity
        android:windowSoftInputMode="adjustResize" ... >
        ...
    </activity>
    ...
</application>
```

你可以结合调整和使用上面的初始输入法可见性来指定：

```xml
 <activity
        android:windowSoftInputMode="stateVisible|adjustResize" ... >
        ...
    </activity>
```

如果你的UI中包含用户可能需要在文本输入时立即执行的，那么使用"adjustResize"时很重要的。例如，如果你使用相对布局在屏幕地步放置一个按钮，使用"adjustResize"来重新调整大小，使得按钮栏出现在输入法上方。
