# 处理控制器输入动作

> 编写:[heray1990](https://github.com/heray1990) - 原文:<http://developer.android.com/training/game-controllers/controller-input.html>

在系统层面上，Android会以Android键值和坐标值的形式来报告来自游戏控制器的输入事件。在我们的游戏应用里，我们可以接收这些键值和坐标值，并将它们转化成特定的游戏行为。

当玩家将一个游戏控制器通过有线连接或者无线配对到基于Android的设备时，系统会自动检测控制器，将它设置成输入设备并且开始报告它的输入事件。我们的游戏应用可以通过在活动的[Activity](http://developer.android.com/reference/android/app/Activity.html)或者聚焦的[View](http://developer.android.com/reference/android/view/View.html)里调用下面这些回调方法来接收上述输入事件(要么在[Activity](http://developer.android.com/reference/android/app/Activity.html)，要么在[View](http://developer.android.com/reference/android/view/View.html)中实现实现这些回调方法，不要两个地方都实现回调)。

* From [Activity](http://developer.android.com/reference/android/app/Activity.html)
	* [dispatchGenericMotionEvent(android.view. MotionEvent)](http://developer.android.com/reference/android/app/Activity.html#dispatchGenericMotionEvent(android.view.MotionEvent))
		* 处理一般的运动事件，如摇动摇杆
	* [dispatchKeyEvent(android.view.KeyEvent)](http://developer.android.com/reference/android/app/Activity.html#dispatchKeyEvent(android.view.KeyEvent))
		* 处理按键事件，如按下或者释放游戏键盘的按键或者十字方向键。
* From [View](http://developer.android.com/reference/android/view/View.html)
	* [onGenericMotionEvent(android.view.MotionEvent)](http://developer.android.com/reference/android/view/View.html#onGenericMotionEvent(android.view.MotionEvent))
		* 处理一般的运动事件，如摇动摇杆
	* <a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown(int, android.view.KeyEvent)</a>
		* 处理按下一个按键的事件，如按下游戏键盘的按键或者十字方向键。
	* <a href="http://developer.android.com/reference/android/view/View.html#onKeyUp(int, android.view.KeyEvent)">onKeyUp(int, android.view.KeyEvent)</a>
		* 处理释放一个按键的事件，如释放游戏键盘的按键或者十字方向键。

建议的方法是从与用户交互的[View](http://developer.android.com/reference/android/view/View.html)对象捕获事件。请查看下面回调提供的对象，从而获取关于接收到的输入事件的类型：

[KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html)：描述方向按键和游戏按键事件的对象。按键事件伴随着一个表示特定按键触发的*按键码值(key code)*，如[DPAD_DOWN](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_DOWN)或者[BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A)。我们可以通过调用[getKeyCode()](http://developer.android.com/reference/android/view/KeyEvent.html#getKeyCode())或者从按键事件回调方法(如<a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a>)来获得按键码值。

[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)：描述摇杆和肩键运动的输入。动作事件伴随着一个动作码(action code)和一系列*坐标值(axis values)*。动作码表示出现变化的状态，例如摇动一个摇杆。坐标值描述了位置和其它运动属性，例如[AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X)或者[AXIS_RTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RTRIGGER)。我们可以通过调用[getAction()](http://developer.android.com/reference/android/view/MotionEvent.html#getAction())来获得动作码，通过调用[getAxisValue()](http://developer.android.com/reference/android/view/MotionEvent.html#getAxisValue(int))来获得坐标值。

这节课主要介绍如何通过上述的[View](http://developer.android.com/reference/android/view/View.html)回调方法和处理[KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html)和[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)对象来处理常用控制器(游戏键盘按键、方向按键和摇杆)的输入。

##验证游戏控制器是否已连接

