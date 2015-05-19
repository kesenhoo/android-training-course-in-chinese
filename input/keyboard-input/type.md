# 指定输入法类型

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:<http://developer.android.com/training/keyboard-input/style.html>

每个文本域会期望输入特定的文本类型，如Email，电话号码，或者纯文本。所以在应用中为每一个文本域指定特定的输入类型，可以让系统展示更为合适的软键盘输入法（比如屏幕上键盘）。

除了输入法的按钮类型之外，我们还需要指定输入法的行为，例如是否需要提供拼写建议，句子首字母是否需要大写，或者把“发送”按钮替换成**完成**或者**下一步**的按钮。这节课将讲解如何指定这些输入法特性。

## 指定键盘类型

通过添加[android:inputType](http://developer.android.com/reference/android/widget/TextView.html#attr_android:inputType)属性到 [&lt;EditText&gt;](http://developer.android.com/reference/android/widget/EditText.html) 标签中，可以为文本域定义输入的类型。

举例来说，如果我们想要输入电话号码，可以填写`phone`作为值:
![edittext-phone](edittext-phone.png "Figure 1. The phone input type.")

```xml
<EditText
    android:id="@+id/phone"
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:hint="@string/phone_hint"
    android:inputType="phone" />
```

或着如果文本域是密码，使用`textPassword`作为值来隐藏用户的输入:
![ime_password](ime_password.png )

```xml
<EditText
    android:id="@+id/password"
    android:hint="@string/password_hint"
    android:inputType="textPassword"
    ... />
```
[android:inputType](http://developer.android.com/reference/android/widget/TextView.html)属性有几种可供选择的值，其中一些输入类型可以与特定的输入法样式及行为组合起来使用。

## 开启拼写建议和其他的行为

`android:inputType`属性允许我们为输入法指定不同的行为。如果文本域被用作一些基本的文本输入（如短信息），那么我们应该使用`textAutoCorrect`来开启拼写检查。

我们可以在`android:inputType`属性中，组合不同的行为和输入形式。下面的例子展示了如何创建一个句子首字母大写并开启拼写检查的文本域：

![ime_autocorrect](ime_autocorrect.png)

```xml
<EditText
    android:id="@+id/message"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:inputType=
        "textCapSentences|textAutoCorrect"
    ... />
```

## 指定输入法的行为

多数的软键盘输入法会在底部角落里为用户提供一个合适的动作按钮来触发符合当前文本域情况的特定操作。默认情况下，系统使用**下一步(Next)**或者**完成(Done)**作为该按钮的具体行为。除非文本域允许多行（如android:inputType="textMultiLine"），这种情况下，动作按钮就是回车换行。当然，我们可以指定其它更适合文本域的动作，比如**发送**等。

将[android:imeOptions](http://developer.android.com/reference/android/widget/TextView.html#attr_android:imeOptions)属性的值设为`actionSend`或`actionSearch`，以指定特定的动作按钮。如：

![edittext-actionsend](edittext-actionsend.png)

```xml
<EditText
    android:id="@+id/search"
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:hint="@string/search_hint"
    android:inputType="text"
    android:imeOptions="actionSend" />
```
然后我们可以通过为[EditText](http://developer.android.com/reference/android/widget/EditText.html)定义[TextView.OnEditorActionListener](http://developer.android.com/reference/android/widget/TextView.OnEditorActionListener.html)来监听动作按钮点击事件。在监听器中，根据[EditorInfo](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html)类中定义的IME动作ID（如 [IME_ACTION_SEND](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_SEND)）进行恰当的响应。例如:

```java
EditText editText = (EditText) findViewById(R.id.search);
editText.setOnEditorActionListener(new OnEditorActionListener() {
    @Override
    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
        boolean handled = false;
        if (actionId == EditorInfo.IME_ACTION_SEND) {
            sendMessage();
            handled = true;
        }
        return handled;
    }
});
```
