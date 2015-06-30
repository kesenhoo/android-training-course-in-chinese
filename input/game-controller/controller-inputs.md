# 处理控制器输入动作

> 编写:[heray1990](https://github.com/heray1990) - 原文:<http://developer.android.com/training/game-controllers/controller-input.html>

在系统层面上，Android 会以 Android 按键码值和坐标值的形式来报告来自游戏控制器的输入事件。在我们的游戏应用里，我们可以接收这些码值和坐标值，并将它们转化成特定的游戏行为。

当玩家将一个游戏控制器通过有线连接或者无线配对到 Android 设备时，系统会自动检测控制器，将它设置成输入设备并且开始报告它的输入事件。我们的游戏应用可以通过在活动的 [Activity](http://developer.android.com/reference/android/app/Activity.html) 或者被选中的 [View](http://developer.android.com/reference/android/view/View.html) 里调用下面这些回调方法，来接收上述输入事件（要么在 [Activity](http://developer.android.com/reference/android/app/Activity.html)，要么在 [View](http://developer.android.com/reference/android/view/View.html) 中实现实现这些回调方法，不要两个地方都实现回调）。

* 在 [Activity](http://developer.android.com/reference/android/app/Activity.html) 中：
	* <a href="http://developer.android.com/reference/android/app/Activity.html#dispatchGenericMotionEvent(android.view.MotionEvent)">dispatchGenericMotionEvent(android.view.MotionEvent)</a>
		* 处理一般的运动事件，如摇动摇杆
	* <a href="http://developer.android.com/reference/android/app/Activity.html#dispatchKeyEvent(android.view.KeyEvent)">dispatchKeyEvent(android.view.KeyEvent)</a>
		* 处理按键事件，如按下或者释放游戏键盘的按键或者 D-pad 按钮。
* 在 [View](http://developer.android.com/reference/android/view/View.html) 中：
	* <a href="http://developer.android.com/reference/android/view/View.html#onGenericMotionEvent(android.view.MotionEvent)">onGenericMotionEvent(android.view.MotionEvent)</a>
		* 处理一般的运动事件，如摇动摇杆
	* <a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown(int, android.view.KeyEvent)</a>
		* 处理按下一个按键的事件，如按下游戏键盘的按键或者 D-pad 按钮。
	* <a href="http://developer.android.com/reference/android/view/View.html#onKeyUp(int, android.view.KeyEvent)">onKeyUp(int, android.view.KeyEvent)</a>
		* 处理释放一个按键的事件，如释放游戏键盘的按键或者 D-pad 按钮。

建议的方法是从与用户交互的 [View](http://developer.android.com/reference/android/view/View.html) 对象捕获事件。请查看下面回调函数的对象，来获取关于接收到输入事件的类型：

[KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html)：描述方向按键（D-pad）和游戏按键事件的对象。按键事件伴随着一个表示特定按键触发的*按键码值(key code)*，如 [DPAD_DOWN](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_DOWN) 或者 [BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A)。我们可以通过调用 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#getKeyCode()">getKeyCode()</a> 或者从按键事件回调方法（如 <a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a>）来获得按键码值。

[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)：描述摇杆和肩键运动的输入。动作事件伴随着一个动作码（action code）和一系列*坐标值*（*axis values*）。动作码表示出现变化的状态，例如摇动一个摇杆。坐标值描述了特定物理操控的位置和其它运动属性，例如 [AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X) 或者 [AXIS_RTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RTRIGGER)。我们可以通过调用 <a href="http://developer.android.com/reference/android/view/MotionEvent.html#getAction()">getAction()</a> 来获得动作码，通过调用 <a href="http://developer.android.com/reference/android/view/MotionEvent.html#getAxisValue(int)">getAxisValue()</a> 来获得坐标值。

这节课主要介绍如何通过实现上述的 [View](http://developer.android.com/reference/android/view/View.html) 回调方法与处理 [KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html) 和 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 对象，来处理常用控制器（游戏键盘按键、方向按键和摇杆）的输入。

<a name="input=></a>
## 验证游戏控制器是否已连接

在报告输入事件的时候，Android 不会区分游戏控制器事件与非游戏控制器事件。例如，一个触屏动作会产生一个表示触摸表面上 X 坐标的 [AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X)，但是一个摇杆动作产生的 [AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X) 则表示摇杆水平移动的位置。如果我们的游戏关注游戏控制器的输入，那么我们应该首先检测相应的事件来源类型。

通过调用 <a href="http://developer.android.com/reference/android/view/InputDevice.html#getSources()">getSources()</a> 来获得设备上支持的输入类型的位字段，来判断一个已连接的输入设备是不是一个游戏控制器。我们可以通过测试以查看下面的字段是否被设置：

* [SOURCE_GAMEPAD](http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_GAMEPAD) 源类型表示输入设备有游戏手柄按键（如，[BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A)）。注意虽然一般的游戏手柄都会有方向控制键，但是这个源类型并不代表游戏控制器具有 D-pad 按钮。
* [SOURCE_DPAD](http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_DPAD) 源类型表示输入设备有 D-pad 按钮（如，[DPAD_UP](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_UP)）。
* [SOURCE_JOYSTICK](http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_JOYSTICK) 源类型表示输入设备有遥控杆（如，会通过 [AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X) 和 [AXIS_Y](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Y) 记录动作的摇杆）。

下面的一小段代码介绍了一个 helper 方法，它的作用是让我们检验已接入的输入设备是否是游戏控制器。如果检测到是游戏控制器，那么这个方法会获得游戏控制器的设备 ID。然后，我们应该将每个设备 ID 与游戏中的玩家关联起来，并且单独处理每个已接入的玩家的游戏操作。想更详细地了解关于在一台Android设备中同时支持多个游戏控制器的方法，请见[支持多个游戏控制器](multi-controller.html)。

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

另外，我们可能想去检查已接入的单个游戏控制器的输入性能。这种检查在某些场合会很有用，例如，我们希望游戏只用到兼容的物理操控。

用下面这些方法检测一个游戏控制器是否支持一个特定的按键码或者坐标码：

* 在Android 4.4（API level 19）或者更高的系统中，调用 <a href="http://developer.android.com/reference/android/view/InputDevice.html#hasKeys(int...)">hasKeys(int)</a> 来确定游戏控制器是否支持某个按键码。
* 在Android 3.1（API level 12）或者更高的系统中，首先调用 <a href="http://developer.android.com/reference/android/view/InputDevice.html#getMotionRanges()">getMotionRanges()</a>，然后在每个返回的 [InputDevice.MotionRange](http://developer.android.com/reference/android/view/InputDevice.MotionRange.html) 对象中调用 <a href="http://developer.android.com/reference/android/view/InputDevice.MotionRange.html#getAxis()">getAxis()</a> 来获得坐标 ID。这样就可以得到游戏控制器支持的所有可用坐标轴。

## 处理游戏手柄按键

Figure 1介绍了 Android 如何将按键码和坐标值映射到实际的游戏手柄上。

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

游戏手柄产生的通用的按键码包括 [BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A)、[BUTTON_B](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_B)、[BUTTON_SELECT](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_SELECT) 和 [BUTTON_START](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_START)。当按下 D-pad 中间的交叉按键时，一些游戏控制器会触发 [DPAD_CENTER](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_CENTER) 按键码。我们的游戏可以通过调用 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#getKeyCode()">getKeyCode()</a> 或者从按键事件回调（如<a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a>）得到按键码。如果一个事件与我们的游戏相关，那么将其处理成一个游戏动作。Table 1列出供大多数通用游戏手柄按钮使用的推荐游戏动作。

**Table 1.** 供游戏手柄使用的推荐游戏动作

<table>
   <tr>
      <td>游戏动作</td>
      <td>按键码</td>
   </tr>
   <tr>
      <td>在主菜单中启动游戏，或者在游戏过程中暂停/取消暂停</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_START">BUTTON_START</a></td>
   </tr>
   <tr>
      <td>显示菜单</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_SELECT">BUTTON_SELECT</a> 和 <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_MENU">KEYCODE_MENU</a></td>
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

> **Tip:** 可以考虑在游戏中提供一个配置界面，使得用户可以个性化游戏控制器与游戏动作的映射。

下面的代码介绍了如何重写 <a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 来将 [BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A) 和 [DPAD_CENTER](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_CENTER) 按钮结合到一个游戏动作。

```java
public class GameView extends View {
    ...

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        boolean handled = false;
        if ((event.getSource() & InputDevice.SOURCE_GAMEPAD)
                == InputDevice.SOURCE_GAMEPAD) {
            if (event.getRepeatCount() == 0) {
                switch (keyCode) {
                    // Handle gamepad and D-pad button presses to
                    // navigate the ship
                    ...

                    default:
                         if (isFireKey(keyCode)) {
                             // Update the ship object to fire lasers
                             ...
                             handled = true;
                         }
                     break;
                }
            }
            if (handled) {
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    private static boolean isFireKey(int keyCode) {
        // Here we treat Button_A and DPAD_CENTER as the primary action
        // keys for the game.
        return keyCode == KeyEvent.KEYCODE_DPAD_CENTER
                || keyCode == KeyEvent.KEYCODE_BUTTON_A;
    }
}
```

> **Note:** 在 Android 4.2（API level 17）和更低版本的系统中，系统默认会把 [BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A) 当作 Android *Back*（*返回*）键。如果我们的应用支持这些 Android 版本，请确保将 [BUTTON_A](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A) 转换成主要的游戏动作。引用 [Build.VERSION.SDK_INT](http://developer.android.com/reference/android/os/Build.VERSION.html#SDK_INT) 值来决定设备上当前的 Android SDK 版本。

## 处理 D-pad 输入

四方向的方向键（D-pad）在很多游戏控制器中是一种很常见的物理控制。Android 将 D-pad 的上和下按键按压报告成 [AXIS_HAT_Y](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_Y) 事件（范围从-1.0（上）到1.0（下）），将 D-pad 的左或者右按键按压报告成 [AXIS_HAT_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_X) 事件（范围从-1.0（左）到1.0（右））。

一些游戏控制器会将 D-pad 按压报告成一个按键码。如果我们的游戏有检测 D-pad 的按压，那么我们应该将坐标值事件和 D-pad 按键码当成一样的输入事件，如 table 2 介绍的一样。

**Table 2.** D-pad 按键码和坐标值的推荐默认游戏动作。

<table>
   <tr>
      <td>游戏动作</td>
      <td>D-pad 按键码</td>
      <td>坐标值</td>
   </tr>
   <tr>
      <td>向上</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_UP">KEYCODE_DPAD_UP</a></td>
      <td><a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_Y">AXIS_HAT_Y</a> （从 0 到 -1.0）</td>
   </tr>
   <tr>
      <td>向下</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_DOWN">KEYCODE_DPAD_DOWN</a></td>
      <td><a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_Y">AXIS_HAT_Y</a> （从 0 到 1.0）</td>
   </tr>
   <tr>
      <td>向左</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_LEFT">KEYCODE_DPAD_LEFT</a></td>
      <td><a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_X">AXIS_HAT_X</a> （从 0 到 -1.0）</td>
   </tr>
   <tr>
      <td>向右</td>
      <td><a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_RIGHT">KEYCODE_DPAD_RIGHT</a></td>
      <td><a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_X">AXIS_HAT_X</a> （从 0 到 1.0）</td>
   </tr>
</table>

下面的代码介绍了通过一个 helper 类，来检查从一个输入事件来决定 D-pad 方向的坐标值和按键码。

```java
public class Dpad {
    final static int UP       = 0;
    final static int LEFT     = 1;
    final static int RIGHT    = 2;
    final static int DOWN     = 3;
    final static int CENTER   = 4;

    int directionPressed = -1; // initialized to -1

    public int getDirectionPressed(InputEvent event) {
        if (!isDpadDevice(event)) {
           return -1;
        }

        // If the input event is a MotionEvent, check its hat axis values.
        if (event instanceof MotionEvent) {

            // Use the hat axis value to find the D-pad direction
            MotionEvent motionEvent = (MotionEvent) event;
            float xaxis = motionEvent.getAxisValue(MotionEvent.AXIS_HAT_X);
            float yaxis = motionEvent.getAxisValue(MotionEvent.AXIS_HAT_Y);

            // Check if the AXIS_HAT_X value is -1 or 1, and set the D-pad
            // LEFT and RIGHT direction accordingly.
            if (Float.compare(xaxis, -1.0f) == 0) {
                directionPressed =  Dpad.LEFT;
            } else if (Float.compare(xaxis, 1.0f) == 0) {
                directionPressed =  Dpad.RIGHT;
            }
            // Check if the AXIS_HAT_Y value is -1 or 1, and set the D-pad
            // UP and DOWN direction accordingly.
            else if (Float.compare(yaxis, -1.0f) == 0) {
                directionPressed =  Dpad.UP;
            } else if (Float.compare(yaxis, 1.0f) == 0) {
                directionPressed =  Dpad.DOWN;
            }
        }

        // If the input event is a KeyEvent, check its key code.
        else if (event instanceof KeyEvent) {

           // Use the key code to find the D-pad direction.
            KeyEvent keyEvent = (KeyEvent) event;
            if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_LEFT) {
                directionPressed = Dpad.LEFT;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_RIGHT) {
                directionPressed = Dpad.RIGHT;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_UP) {
                directionPressed = Dpad.UP;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_DOWN) {
                directionPressed = Dpad.DOWN;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_CENTER) {
                directionPressed = Dpad.CENTER;
            }
        }
        return directionPressed;
    }

    public static boolean isDpadDevice(InputEvent event) {
        // Check that input comes from a device with directional pads.
        if ((event.getSource() & InputDevice.SOURCE_DPAD)
             != InputDevice.SOURCE_DPAD) {
             return true;
         } else {
             return false;
         }
     }
}
```

我们可以在任意想要处理 D-pad 输入（例如，在 <a href="http://developer.android.com/reference/android/view/View.html#onGenericMotionEvent(android.view.MotionEvent)">onGenericMotionEvent()</a> 或者 <a href="http://developer.android.com/reference/android/view/View.html#onKeyDown(int, android.view.KeyEvent)">onKeyDown()</a> 回调函数）的地方使用这个 helper 类。

例如：

```java
Dpad mDpad = new Dpad();
...
@Override
public boolean onGenericMotionEvent(MotionEvent event) {

    // Check if this event if from a D-pad and process accordingly.
    if (Dpad.isDpadDevice(event)) {

       int press = mDpad.getDirectionPressed(event);
       switch (press) {
            case LEFT:
                // Do something for LEFT direction press
                ...
                return true;
            case RIGHT:
                // Do something for RIGHT direction press
                ...
                return true;
            case UP:
                // Do something for UP direction press
                ...
                return true;
            ...
        }
    }

    // Check if this event is from a joystick movement and process accordingly.
    ...
}
```

## 处理摇杆动作

当玩家移动游戏控制器上的摇杆时，Android 会报告一个包含 [ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE) 动作码和更新摇杆在坐标轴的位置的 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)。我们的游戏可以使用 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 提供的数据来确定是否发生摇杆的动作。

注意到摇杆移动会在单个对象中批处理多个移动示例。[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 对象包含每个摇杆坐标当前的位置和每个坐标轴上的多个历史位置。当用 [ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE) 动作码（例如摇杆移动）来报告移动事件时，Android 会高效地批处理坐标值。由坐标值组成的不同的历史值比当前的坐标值要旧，比之前报告的任意移动事件要新。详情见 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)  参考文档。

我们可以使用历史信息，根据摇杆输入更精确地表达游戏对象的活动。调用 <a href="http://developer.android.com/reference/android/view/MotionEvent.html#getAxisValue(int)">getAxisValue()</a> 或者 <a href="http://developer.android.com/reference/android/view/MotionEvent.html#getHistoricalAxisValue(int, int)">getHistoricalAxisValue()</a> 来获取现在和历史的值。我们也可以通过调用 <a href="http://developer.android.com/reference/android/view/MotionEvent.html#getHistorySize()">getHistorySize()</a> 来找到摇杆事件的历史点号码。

下面的代码介绍了如何重写 <a href="http://developer.android.com/reference/android/view/View.html#onGenericMotionEvent(android.view.MotionEvent)">onGenericMotionEvent()</a> 回调函数来处理摇杆输入。我们应该首先处理历史坐标值，然后处理当前值。

```java
public class GameView extends View {

    @Override
    public boolean onGenericMotionEvent(MotionEvent event) {

        // Check that the event came from a game controller
        if ((event.getSource() & InputDevice.SOURCE_JOYSTICK) ==
                InputDevice.SOURCE_JOYSTICK &&
                event.getAction() == MotionEvent.ACTION_MOVE) {

            // Process all historical movement samples in the batch
            final int historySize = event.getHistorySize();

            // Process the movements starting from the
            // earliest historical position in the batch
            for (int i = 0; i < historySize; i++) {
                // Process the event at historical position i
                processJoystickInput(event, i);
            }

            // Process the current movement sample in the batch (position -1)
            processJoystickInput(event, -1);
            return true;
        }
        return super.onGenericMotionEvent(event);
    }
}
```

在使用摇杆输入之前，我们需要确定摇杆是否居中，然后计算相应的坐标移动距离。一般摇杆会有一个平面区，即在坐标 (0, 0) 附近一个值范围内的坐标点都被当作是中点。如果 Android 系统报告坐标值掉落在平面区内，那么我们应该认为控制器处于静止（即沿着 x、y 两个坐标轴都是静止的）。

下面的代码介绍了一个用于计算沿着每个坐标轴的移动距离的 helper 方法。我们将在后面讨论的 `processJoystickInput()` 方法中调用这个 helper 方法。

```java
private static float getCenteredAxis(MotionEvent event,
        InputDevice device, int axis, int historyPos) {
    final InputDevice.MotionRange range =
            device.getMotionRange(axis, event.getSource());

    // A joystick at rest does not always report an absolute position of
    // (0,0). Use the getFlat() method to determine the range of values
    // bounding the joystick axis center.
    if (range != null) {
        final float flat = range.getFlat();
        final float value =
                historyPos < 0 ? event.getAxisValue(axis):
                event.getHistoricalAxisValue(axis, historyPos);

        // Ignore axis values that are within the 'flat' region of the
        // joystick axis center.
        if (Math.abs(value) > flat) {
            return value;
        }
    }
    return 0;
}
```

将它们都放在一起，下面是我们如何在游戏中处理摇杆移动：

```java
private void processJoystickInput(MotionEvent event,
        int historyPos) {

    InputDevice mInputDevice = event.getDevice();

    // Calculate the horizontal distance to move by
    // using the input value from one of these physical controls:
    // the left control stick, hat axis, or the right control stick.
    float x = getCenteredAxis(event, mInputDevice,
            MotionEvent.AXIS_X, historyPos);
    if (x == 0) {
        x = getCenteredAxis(event, mInputDevice,
                MotionEvent.AXIS_HAT_X, historyPos);
    }
    if (x == 0) {
        x = getCenteredAxis(event, mInputDevice,
                MotionEvent.AXIS_Z, historyPos);
    }

    // Calculate the vertical distance to move by
    // using the input value from one of these physical controls:
    // the left control stick, hat switch, or the right control stick.
    float y = getCenteredAxis(event, mInputDevice,
            MotionEvent.AXIS_Y, historyPos);
    if (y == 0) {
        y = getCenteredAxis(event, mInputDevice,
                MotionEvent.AXIS_HAT_Y, historyPos);
    }
    if (y == 0) {
        y = getCenteredAxis(event, mInputDevice,
                MotionEvent.AXIS_RZ, historyPos);
    }

    // Update the ship object based on the new x and y values
}
```

为了支持除了单个摇杆之外更多复杂的功能，按照下面的做法：

* **处理两个控制器摇杆。**很多游戏控制器左右两边都有摇杆。对于左摇杆，Android 会报告水平方向的移动为 [AXIS_X](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X) 事件，垂直方向的移动为 [AXIS_Y](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Y) 事件。对于右摇杆，Android 会报告水平方向的移动为 [AXIS_Z](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Z) 事件，垂直方向的移动为 [AXIS_RZ](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RZ) 事件。确保在代码中处理两个摇杆。

* **处理肩键按压（但需要提供另一种输入方法）。**一些控制器会有左右肩键。如果存在这些按键，那么 Android 报告左肩键按压为一个 [AXIS_LTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_LTRIGGER) 事件，右肩键按压为一个 [AXIS_RTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RTRIGGER) 事件。在 Android 4.3（API level 18）中，一个产生了 [AXIS_LTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_LTRIGGER) 事件的控制器也会报告一个完全一样的 [AXIS_BRAKE](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_BRAKE) 坐标值。同样，[AXIS_RTRIGGER](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RTRIGGER) 对应 [AXIS_GAS](http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_GAS)。Android 会报告模拟按键按压为从 0.0（释放）到 1.0（按下）的标准值。并不是所有的控制器都有肩键，所以需要允许玩家用其它按钮来执行那些游戏动作。