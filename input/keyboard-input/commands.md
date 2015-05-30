# 处理按键动作

> 编写:[zhaochunqi](https://github.com/zhaochunqi) - 原文:<http://developer.android.com/training/keyboard-input/commands.html>

当用户选中一个可编辑的文本 view（如 [EditText](http://developer.android.com/reference/android/widget/EditText.html) 组件），而且用户连接了一个实体键盘时，所有输入由系统处理。然而，如果我们想接管或直接处理键盘输入，那么可以通过实现 [KeyEvent.Callback](http://developer.android.com/reference/android/view/KeyEvent.Callback.html) 接口的回调方法，如 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 和 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyMultiple(int, int, android.view.KeyEvent)">onKeyMultiple()</a> 来完成上述目的。

因为 Activity 和 View 类都实现了 [KeyEvent.Callback](http://developer.android.com/reference/android/view/KeyEvent.Callback.html) 接口，所以通常我们应该在这些类的继承中重写回调方法。

> **Note:** 当使用 KeyEvent 类和相关的 API 处理键盘事件时，我们应该期望这种键盘事件只从实体键盘发出。我们永远不应该依赖从一个软输入法（如屏幕键盘）来接收按键事件。

## 处理单个按键事件

处理单个的按键点击，需要适当地实现 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 或 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyUp(int, android.view.KeyEvent)">onKeyUp()</a>。通常，我们使用 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyUp(int, android.view.KeyEvent)">onKeyUp()</a> 来确保我们只接收一个事件。如果用户点击并按住按钮不放，<a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 会被调用多次。

举例，这个实现响应一些键盘按键来控制游戏：

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

为了对修饰键（例如将一个按键与 Shift 或者 Control 键组合）进行回应，我们可以查询 [KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html) 来传递到回调方法。一些方法，如 getModifiers() 和 getMetaState()，提供一些关于修饰键的信息。然而，最简单的解决方案是用像 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#isShiftPressed()">isShiftPressed()</a> 和 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#isCtrlPressed()">isCtrlPressed()</a> 等方法，检查我们关心的修饰键是否正在被按下。

例如，有一个 <a href="http://developer.android.com/reference/android/view/KeyEvent.Callback.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 的实现，当Shift键和一个其他按键按下时，做一些额外的处理:

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
