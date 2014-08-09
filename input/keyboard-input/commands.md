# 处理按键动作

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:

当预估给予可编辑当文本域焦点时，如一个[EditText](http://developer.android.com/reference/android/widget/EditText.html)元素，而且用户拥有一个实体键盘连接，所有当输入由系统处理。然而如果你想接管或直接处理键盘输入键盘操作，通过实现接口[KeyEvent.Callback](http://developer.android.com/reference/android/view/KeyEvent.Callback.html)的回调方法，如 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a>和<a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyMultiple(int, int, android.view.KeyEvent)">onKeyMultiple()</a>.

Activity和View类都实现了[KeyEvent.Callback](http://developer.android.com/reference/android/view/KeyEvent.Callback.html)的接口，所以通常你只需要在这些重写回调方法来适当的扩展这些类。

>**注意：**当使用KeyEvent类和相关的API处理键盘事件时，你期望的应该是只从实体键盘中接收。你永远不应该指望从一个软键盘(如屏幕键盘)来接受点击事件。

## 处理单个按键点击事件

处理单个的按键点击，实现合适的 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 或 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyUp(int, android.view.KeyEvent)">onKeyUp()</a>。通常，你使用<a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyUp(int, android.view.KeyEvent)">onKeyUp()</a>来确保你只接收一个事件。如果用户点击并按住按钮不放，<a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a>会被调用多次。

举例，这是一个对一些按键控制游戏的实现：

```java
@Override
public boolean onKeyUp(int keyCode, KeyEvent event) {
    switch (keyCode) {
        case KeyEvent.KEYCODE_D:
            moveShip(MOVE_LEFT);
            return true;
        case KeyEvent.KEYCODE_F:
            moveShip(MOVE_RIGHT);
            return true;
        case KeyEvent.KEYCODE_J:
            fireMachineGun();
            return true;
        case KeyEvent.KEYCODE_K:
            fireMissile();
            return true;
        default:
            return super.onKeyUp(keyCode, event);
    }
}
```

## 处理修饰键

为了对修饰键进行回应如一个组合Shift和Control修饰键，你可以查询[KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html)传递到回调方法。一些方法提供一些信息关于修饰键如getModifiers() 和 getMetaState()。然而，最简单的解决方案时检查你关心的按键是否被按下了的方法，如 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#isShiftPressed()">isShiftPressed()</a> 和 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#isCtrlPressed()">isCtrlPressed()</a>。

例如，有一个<a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 的实现，当Shift键和一个其他当键按下当时候做一些额外的处理:

```java
@Override
public boolean onKeyUp(int keyCode, KeyEvent event) {
    switch (keyCode) {
        ...
        case KeyEvent.KEYCODE_J:
            if (event.isShiftPressed()) {
                fireLaser();
            } else {
                fireMachineGun();
            }
            return true;
        case KeyEvent.KEYCODE_K:
            if (event.isShiftPressed()) {
                fireSeekingMissle();
            } else {
                fireMissile();
            }
            return true;
        default:
            return super.onKeyUp(keyCode, event);
    }
}
```
