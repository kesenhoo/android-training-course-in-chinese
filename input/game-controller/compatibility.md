# 在不同的 Android 系统版本支持控制器

> 编写:[heray1990](https://github.com/heray1990) - 原文:<http://developer.android.com/training/game-controllers/compatibility.html>

如果我们正为游戏提供游戏控制器的支持，那么我们需要确保我们的游戏对于运行着不同 Android 版本的设备对控制器都有一致的响应。这会使得我们的游戏扩大用户群体，同时，我们的玩家可以享受即使他们切换或者升级 Android 设备的时候，都可以使用他们的控制器无缝对接的游戏体验。

这节课展示了如何用向后兼容的方式使用 Android 4.1 或者更高版本中可用的 API，使我们的游戏运行在 Android 2.3 或者更高的设备上时，支持下面的功能：

* 游戏可以检测是否有一个新的游戏控制器接入、变更或者移除。
* 游戏可以查询游戏控制器的兼容性。
* 游戏可以识别从游戏控制器传入的动作事件。

这节课的例子是基于 [`ControllerSample.zip`](http://developer.android.com/shareables/training/ControllerSample.zip) 提供的参考实现。这个示例介绍了如何实现 `InputManagerCompat` 接口来支持不同的 Android 版本。我们必须使用 Android 4.1（API level 16）或者更高的版本来编译这个示例代码。一旦编译完成，生成的示例 app 可以在任何运行着 Android 2.3（API level 9）或者更高版本的设备上运行。

## 准备支持游戏控制器的抽象 API

假设我们想确定在运行着 Android 2.3（API level 9）的设备上，游戏控制器的连接状态是否发生改变。无论如何，API 只在 Android 4.1（API level 16）或者更高的版本上可用，所以我们需要提供一个支持 Android 4.1（API level 16）或者更高版本的实现方法的同时，提供一个支持从 Android 2.3 到 Android 4.0 的回退机制。

为了帮助我们确定哪个功能需要这样的回退机制，table 1 列出了 Android 2.3（API level 9）、3.1（API level 12）和 4.1（API level 16）之间，对于支持游戏控制器的不同之处。

**Table 1.** API 在不同 Android 版本间对游戏控制器支持的不同点

<table>
   <tr>
      <td>Controller Information</td>
      <td>Controller API</td>
      <td>API level 9</td>
      <td>API level 12</td>
      <td>API level 16</td>
   </tr>
   <tr>
      <td rowspan="5">Device Identification</td>
      <td><a href="http://developer.android.com/reference/android/hardware/input/InputManager.html#getInputDeviceIds()">getInputDeviceIds()</a></td>
      <td></td>
      <td></td>
      <td>*</td>
   </tr>
   <tr>
      <td><a href="http://developer.android.com/reference/android/hardware/input/InputManager.html#getInputDevice(int)">getInputDevice()</a></td>
      <td></td>
      <td></td>
      <td>*</td>
   </tr>
   <tr>
      <td><a href="http://developer.android.com/reference/android/view/InputDevice.html#getVibrator()">getVibrator()</a></td>
      <td></td>
      <td></td>
      <td>*</td>
   </tr>
   <tr>
      <td><a href="http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_JOYSTICK">SOURCE_JOYSTICK</a></td>
      <td></td>
      <td>*</td>
      <td>*</td>
   </tr>
   <tr>
      <td><a href="http://developer.android.com/reference/android/view/InputDevice.html#SOURCE_GAMEPAD">SOURCE_GAMEPAD</a></td>
      <td></td>
      <td>*</td>
      <td>*</td>
   </tr>
   <tr>
      <td rowspan="3">Connection Status</td>
      <td><a href="http://developer.android.com/reference/android/hardware/input/InputManager.InputDeviceListener.html#onInputDeviceAdded(int)">onInputDeviceAdded()</a></td>
      <td></td>
      <td></td>
      <td>*</td>
   </tr>
   <tr>
      <td><a href="http://developer.android.com/reference/android/hardware/input/InputManager.InputDeviceListener.html#onInputDeviceChanged(int)">onInputDeviceChanged()</a></td>
      <td></td>
      <td></td>
      <td>*</td>
   </tr>
   <tr>
      <td><a href="http://developer.android.com/reference/android/hardware/input/InputManager.InputDeviceListener.html#onInputDeviceRemoved(int)">onInputDeviceRemoved()</a></td>
      <td></td>
      <td></td>
      <td>*</td>
   </tr>
   <tr>
      <td rowspan="4">Input Event Identification</td>
      <td>D-pad press ( <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_UP">KEYCODE_DPAD_UP</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_DOWN">KEYCODE_DPAD_DOWN</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_LEFT">KEYCODE_DPAD_LEFT</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_RIGHT">KEYCODE_DPAD_RIGHT</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_DPAD_CENTER">KEYCODE_DPAD_CENTER</a>)</td>
      <td>*</td>
      <td>*</td>
      <td>*</td>
   </tr>
   <tr>
      <td>Gamepad button press ( <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_A">BUTTON_A</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_B">BUTTON_B</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_THUMBL">BUTTON_THUMBL</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_THUMBR">BUTTON_THUMBR</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_SELECT">BUTTON_SELECT</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_START">BUTTON_START</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_R1">BUTTON_R1</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_L1">BUTTON_L1</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_R2">BUTTON_R2</a>, <a href="http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_BUTTON_L2">BUTTON_L2</a>)</td>
      <td></td>
      <td>*</td>
      <td>*</td>
   </tr>
   <tr>
      <td>Joystick and hat switch movement ( <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_X">AXIS_X</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Y">AXIS_Y</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_Z">AXIS_Z</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RZ">AXIS_RZ</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_X">AXIS_HAT_X</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_HAT_Y">AXIS_HAT_Y</a>)</td>
      <td></td>
      <td>*</td>
      <td>*</td>
   </tr>
   <tr>
      <td>Analog trigger press ( <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_LTRIGGER">AXIS_LTRIGGER</a>, <a href="http://developer.android.com/reference/android/view/MotionEvent.html#AXIS_RTRIGGER">AXIS_RTRIGGER</a>)</td>
      <td></td>
      <td>*</td>
      <td>*</td>
   </tr>
</table>

我们可以使用抽象化概念来建立能够工作在不同平台的版本识别的游戏控制器支持。这种方法包括下面几个步骤：

1. 定义一个中间 Java 接口来抽象化我们游戏需要的游戏控制器功能的实现。

2. 创建一个使用 Android 4.1 和更高版本 API 的接口的代理实现。

3. 创建一个使用 Android 2.3 到 Android 4.0 之间可用的 API 的接口的自定义实现。

4. 创建在运行时，在这上述这些实现之间切换的逻辑，并且开始使用我们游戏中的接口。

