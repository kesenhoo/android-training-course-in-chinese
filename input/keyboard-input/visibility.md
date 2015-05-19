# 处理输入法可见性

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:<http://developer.android.com/training/keyboard-input/visibility.html>

当输入焦点移入或移出可编辑当文本域时，Android系统会相应地显示或隐藏输入法（如屏幕输入法）。系统也会对输入法上方UI和文本域的显示进行调整。举例来说，当屏幕上竖直空间被压缩时，文本域可能填充所有的输入法上方的空间。对于多数的应用来说，这些默认的行为基本就足够了。

然而，在某些情况中，我们可能会希望直接控制输入法的显示，指定在输入法显示时的布局等。这节课会讲解如何对输入法的可见性进行控制和响应。

## 在Activity启动时显示输入法

尽管Android会在Activity启动时给予第一个文本域焦点，但是并不会显示输入法。由于大多数情况下输入文本可能并不是Activity中的首要任务，所以这是合理的。可是，如果输入文本确实是首要的任务（如登录界面）,我们就可能需要输入法在默认状态下可以显示出来。

为了在Activity启动时展示输入法，添加[android:windowSoftInputMode](http://developer.android.com/guide/topics/manifest/activity-element.html#wsoft)属性到&lt;activity&gt;标签中，并使用`stateVisible`作为值，如下所示：

```xml
<application ... >
    <activity
        android:windowSoftInputMode="stateVisible" ... >
        ...
    </activity>
    ...
</application>
```

>**注意：**如果用户接入了一个实体键盘，软键盘输入法不会显示。

## 需要时显示输入法

如果在Activity生命周期中，我们需要在某个方法内确保输入法是可见的，可以使用[InputMethodManager](http://developer.android.com/reference/android/view/inputmethod/InputMethodManager.html)来实现。

举例来说，下面的方法接收一个[View](http://developer.android.com/reference/android/view/View.html)作为参数，该View即用户需要进行输入的View。通过调用<a href="http://developer.android.com/reference/android/view/View.html#requestFocus()">requestFocus()</a> 来获取焦点，然后 调用<a href="http://developer.android.com/reference/android/view/inputmethod/InputMethodManager.html#showSoftInput(android.view.View, int)">showSoftInput()</a>来打开输入法。

```java
public void showSoftKeyboard(View view) {
    if (view.requestFocus()) {
        InputMethodManager imm = (InputMethodManager)
                getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.showSoftInput(view, InputMethodManager.SHOW_IMPLICIT);
    }
}
```

>**注意：**一旦输入法处于可见状态，不要通过代码的方式将其隐藏。系统会在用户结束文本域的任务时进行隐藏，或者用户可以使用系统控制（如返回键）将其隐藏。

## 指定UI响应方式

当输入法在屏幕上显示时，它会减少UI中的可用空间。系统会为对UI进行调整，但是其结果可能并非是我们期望的。为了确保应用的最佳表现，我们应该指定在剩余空间中如何展示UI。

要声明在Activity中所期望的处理方案，在清单文件中的&lt;activity&gt;标签下使用`android:windowSoftInputMode`属性，并将某种`adjust`作为值。

举例来说，为了确保系统会在可用空间中重新调整布局的大小以确保所有布局内容都是可用的（尽管可能需要滑动），可以使用`adjustResize`:

```xml
<application ... >
    <activity
        android:windowSoftInputMode="adjustResize" ... >
        ...
    </activity>
    ...
</application>
```

我们也可以结合多种模式：

```xml
 <activity
        android:windowSoftInputMode="stateVisible|adjustResize" ... >
        ...
    </activity>
```

如果UI中包含用户在输入过程中需要立即执行的控制功能，那么使用`adjustResize`非常重要。例如，如果我们使用相对布局在屏幕底部放置了一个按钮，使用`adjustResize`来重新调整布局后，就可以让按钮栏出现在输入法上方。
