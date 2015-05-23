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

在报告输入事件的时候，Android不会区分游戏控制器事件与非游戏控制器事件。例如，一个触屏动作会产生一个表示触摸表面上X坐标的[AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X)，但是一个摇杆动作产生的[AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X)则表示摇杆水平移动的位置。如果我们的游戏关注游戏控制器的输入，那么我们应该首先检测事件相应的来源类型。

通过调用[getSources()](http://developer.android.com/reference/android/view/InputDevice.html#getSources())来获得设备上支持的输入类型的位字段，来验证一个已连接的输入设备是一个游戏控制器。我们可以测试以查看下面的字段是否被设置：

* [SOURCE_GAMEPAD](http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_GAMEPAD)源类型表示输入设备有游戏手柄按键(如，[BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A))。注意随然一般的游戏手柄都会有方向控制键，但是这个源类型并不代表游戏控制器具有十字方向键。
* [SOURCE_DPAD](http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_DPAD)源类型表示输入设备有十字方向键(如，[DPAD_UP](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_UP))。
* [SOURCE_JOYSTICK](http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_JOYSTICK)源类型表示输入设备有遥控杆(如，会用[AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X)和[AXIS_Y](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Y)记录动作的摇杆)。

下面的一小段代码介绍了一个helper方法，它的作用是让你检验已接入的输入设备是否是游戏控制器。如果检测到是游戏控制器，那么这个方法会获取到游戏控制器的设备ID。然后，我们应该将每个设备ID与游戏中的玩家关联起来，并且单独处理每个已接入的玩家的游戏操作。想更详细地了解关于在一台Android设备中同时支持多个游戏控制器的方法，请见[支持多个游戏控制器](multi-controller.html)。

```java
public ArrayList getGameControllerIds() {
    ArrayList gameControllerDeviceIds = new ArrayList();
    int[] deviceIds = InputDevice.getDeviceIds();
    for (int deviceId : deviceIds) {
        InputDevice dev = InputDevice.getDevice(deviceId);
        int sources = dev.getSources();

        // Verify that the device has gamepad buttons, control sticks, or both.
        if (((sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD)
                || ((sources & InputDevice.SOURCE_JOYSTICK)
                == InputDevice.SOURCE_JOYSTICK)) {
            // This device is a game controller. Store its device ID.
            if (!gameControllerDeviceIds.contains(deviceId)) {
                gameControllerDeviceIds.add(deviceId);
            }
        }
    }
    return gameControllerDeviceIds;
}
```

另外，我们会想去检查已接入的游戏控制器个体的输入性能。这种检查在某些场合会很有用，例如，我们想游戏只用到游戏“知道”的物理操控。

用下面这些方法检测一个游戏控制器是否支持一个特定的按键码或者坐标码：

* 在Android 4.4(API level 19)或者更高的系统中，调用[hasKeys(int)](http://developer.android.com/reference/android/view/InputDevice.html#hasKeys(int...))来确定游戏控制器是否支持一个按键码。
* 在Android 3.1(API level 12)或者更高的系统中，首先调用[getMotionRanges()](http://developer.android.com/reference/android/view/InputDevice.html#getMotionRanges())，然后在每个返回的[InputDevice.MotionRange](http://developer.android.com/reference/android/view/InputDevice.MotionRange.html)对象中调用[getAxis()](http://developer.android.com/reference/android/view/InputDevice.MotionRange.html#getAxis())来获得坐标ID。这样就可以得到游戏控制器支持的所有可用坐标轴。

##处理游戏手柄按键

Figure 1介绍了Android如何将按键码和坐标值映射到实际的游戏手柄上。

![game-controller-profiles](game-controller-profiles.png "Figure 1. Profile for a generic game controller.")

**Figure 1.** 一个常用的游戏手柄的外形

上图的标注对应下面的内容：

1. <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_X">AXIS\_HAT\_X</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_Y">AXIS\_HAT\_Y</a>, [DPAD_UP](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_UP), [DPAD_DOWN](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_DOWN), [DPAD_LEFT](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_LEFT), [DPAD_RIGHT](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_RIGHT)
2. [AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X), [AXIS_Y](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Y), [BUTTON_THUMBL](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_THUMBL)
3. [AXIS_Z](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Z), [AXIS_RZ](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RZ), [BUTTON_THUMBR](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_THUMBR)
4. [BUTTON_X](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_X)
5. [BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A)
6. [BUTTON_Y](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_Y)
7. [BUTTON_B](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_B)
8. [BUTTON_R1](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_R1)
9. [AXIS_RTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RTRIGGER), [AXIS_THROTTLE](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_THROTTLE)
10. [AXIS_LTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_LTRIGGER), [AXIS_BRAKE](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_BRAKE)
11. [BUTTON_L1](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_L1)

游戏手柄产生的通用的按键码包括[BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A)、[BUTTON_B](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_B)、[BUTTON_SELECT](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_SELECT)和[BUTTON_START](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_START)。当按下十字方向键的中间交叉按键时，一些游戏控制器会触发[DPAD_CENTER](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_CENTER)按键码。我们的游戏可以通过调用[getKeyCode()](http://developer.android.com/reference/android/view/KeyEvent.html#getKeyCode())或者从按键事件回调(如<a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a>)得到按键码。如果一个事件与我们的游戏相关，那么将其处理成一个游戏动作。Table 1列出供大多数通用游戏手柄的按钮使用的推荐的游戏动作。

**Table 1.** 供游戏手柄使用的推荐的游戏动作

<table>
   <tr>
      <td>游戏动作</td>
      <td>按键码</td>
   </tr>
   <tr>
      <td>在主菜单中启动游戏，或者在游戏过程中暂停/取消暂停</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_START">BUTTON_START</a>*</td>
   </tr>
   <tr>
      <td>显示菜单</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_SELECT">BUTTON_SELECT</a>* 和 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_MENU">KEYCODE_MENU</a>*</td>
   </tr>
   <tr>
      <td>跟Android导航设计指导中的Back导航行为一样</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BACK">KEYCODE_BACK</a></td>
   </tr>
   <tr>
      <td>返回到菜单中上一项</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_B">BUTTON_B</a></td>
   </tr>
   <tr>
      <td>确认选择，或者执行主要的游戏动作</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A">BUTTON_A</a> 和 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_CENTER">DPAD_CENTER</a></td>
   </tr>
</table>

\* *我们的游戏不应该依赖于Start、Select或者Menu按键的存在。*

> **Tip:** 