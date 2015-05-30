# 处理输入法可见性

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:<http://developer.android.com/training/keyboard-input/visibility.html>

当输入焦点移入或移出可编辑的文本框时，Android会相应的显示或隐藏输入法（如虚拟键盘）。系统也会决定输入法上方的 UI 和文本框的显示方式。举例来说，当屏幕上垂直空间被压缩时，文本框可能填充输入法上方所有的空间。对于多数的应用来说，这些默认的行为基本就足够了。

然而，在一些事例中，我们可能会想要更加直接地控制输入法的显示，指定在输入法显示的时候，如何显示我们的布局。这节课会解释如何控制和响应输入法的可见性。

<a name="ShowOnStart"></a>
## 在Activity启动时显示输入法

尽管Android会在Activity启动时将焦点放在布局中的第一个文本框，但是并不会显示输入法。因为输入文本可能并不是activity中的首要任务，所以不显示输入法是很合理的。可是，如果输入文本确实是首要的任务（如在登录界面中），那么可能需要默认显示输入法。

为了在activity启动时显示输入法，添加 [android:windowSoftInputMode](http://developer.android.com/guide/topics/manifest/activity-element.html#wsoft)  属性到 &lt;activity&gt; 节点中，并将该属性的值设为 `"stateVisible"`。如下：

```xml
<application ... >
    <activity
        android:windowSoftInputMode="stateVisible" ... >
        ...
    </activity>
    ...
</application>
```

> **Note:** 如果用户的设备有一个实体键盘，那么*不会*显示软输入法。

## 根据需要显示输入法

如果我们想要确保输入法在activity生命周期的某个方法中是可见的，那么可以使用 [InputMethodManager](http://developer.android.com/reference/android/view/inputmethod/InputMethodManager.html) 来实现。

举例来说，下面的方法调用了一个需要用户填写文本的[View](http://developer.android.com/reference/android/view/View.html)，调用了 <a href="http://developer.android.com/reference/android/view/View.html#requestFocus()">requestFocus()</a> 来获取焦点，然后调用 <a href="http://developer.android.com/reference/android/view/inputmethod/InputMethodManager.html#showSoftInput(android.view.View, int)">showSoftInput()</a> 来打开输入法。

```java
public void showSoftKeyboard(View view) {
    if (view.requestFocus()) {
        InputMethodManager imm = (InputMethodManager)
                getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.showSoftInput(view, InputMethodManager.SHOW_IMPLICIT);
    }
}
```

> **Note:** 一旦输入法可见，我们不应该以编程的方式来隐藏它。系统会在用户结束文本框的任务时隐藏输入法，或者可以使用系统控制（如*返回*键）来隐藏。

## 指定 UI 的响应方式

当输入法显示在屏幕上时，会减少 app UI 中的可用空间。系统会决定如何调整 UI 可见的部分，但是这样做不一定正确。为了确保应用的最佳表现，我们应该在 UI 的剩余空间中展示我们想要展示的系统界面。

为了在activity中声明合适的处理方法，可以在 manifest 文件的 &lt;activity&gt; 节点中使用 [android:windowSoftInputMode](http://developer.android.com/guide/topics/manifest/activity-element.html#wsoft) 属性，并将该属性的值设为"adjust"。

举例来说，为了确保系统会在可用空间中重新调整布局的大小——确保所有的布局内容都可以被使用（尽管可能需要滑动）——使用 `"adjustResize"`:

```xml
<application ... >
    <activity
        android:windowSoftInputMode="adjustResize" ... >
        ...
    </activity>
    ...
</application>
```

我们可以结合上述调整说明和[初始化输入法可见性](#ShowOnStart)说明：

```xml
    <activity
        android:windowSoftInputMode="stateVisible|adjustResize" ... >
        ...
    </activity>
```

如果 UI 中包含用户可能需要在文本输入时立即执行的事情，那么使用 `"adjustResize"` 是很重要的。例如，如果我们使用相对布局（relative layout）在屏幕底部放置一个按钮，用 `"adjustResize"` 来重新调整大小，使得按钮栏出现在输入法上方。