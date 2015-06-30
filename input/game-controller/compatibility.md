# 在不同的 Android 系统版本支持控制器

> 编写:[heray1990](https://github.com/heray1990) - 原文:<http://developer.android.com/training/game-controllers/compatibility.html>

如果我们正为游戏提供游戏控制器的支持，那么我们需要确保我们的游戏对于运行着不同 Android 版本的设备对控制器都有一致的响应。这会使得我们的游戏扩大用户群体，同时，我们的玩家可以享受即使他们切换或者升级 Android 设备的时候，都可以使用他们的控制器无缝对接的游戏体验。

这节课展示了如何用向下兼容的方式使用 Android 4.1 或者更高版本中可用的 API，使我们的游戏运行在 Android 2.3 或者更高的设备上时，支持下面的功能：

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

有关如何使用抽象化概念来保证应用可以在不同版本的 Android 之间，以向后兼容的方式工作的概述，请见[创建向后兼容的 UI](http://hukai.me/android-training-course-in-chinese/ui/backward-compatible-ui/index.html)。

## 添加向后兼容的接口

对于向后兼容，我们可以创建一个自定义接口，然后添加特定版本的实现。这种方法的一个优点是它可以让我们借鉴 Android 4.1（API level 16）上支持游戏控制器的公共接口。

```java
// The InputManagerCompat interface is a reference example.
// The full code is provided in the ControllerSample.zip sample.
public interface InputManagerCompat {
    ...
    public InputDevice getInputDevice(int id);
    public int[] getInputDeviceIds();

    public void registerInputDeviceListener(
            InputManagerCompat.InputDeviceListener listener,
            Handler handler);
    public void unregisterInputDeviceListener(
            InputManagerCompat.InputDeviceListener listener);

    public void onGenericMotionEvent(MotionEvent event);

    public void onPause();
    public void onResume();

    public interface InputDeviceListener {
        void onInputDeviceAdded(int deviceId);
        void onInputDeviceChanged(int deviceId);
        void onInputDeviceRemoved(int deviceId);
    }
    ...
}
```

`InputManagerCompat` 接口提供了下面的方法：

`getInputDevice()`

  借鉴 <a href="http://developer.android.com/reference/android/hardware/input/InputManager.html#getInputDevice(int)">getInputDevice()</a>。包括代表一个游戏控制器兼容性的 [InputDevice](http://developer.android.com/reference/android/view/InputDevice.html) 对象。

`getInputDeviceIds()`

  借鉴<a href="http://developer.android.com/reference/android/hardware/input/InputManager.html#getInputDeviceIds()">getInputDeviceIds()</a>。返回一个整型数组，每一个数组成员表示一个不同输入设备的 ID。这对于想要构建一个支持多玩家和检测连接了多少个控制器的游戏是很有用的。

`registerInputDeviceListener()`

  借鉴<a href="http://developer.android.com/reference/android/hardware/input/InputManager.html#registerInputDeviceListener(android.hardware.input.InputManager.InputDeviceListener, android.os.Handler)">registerInputDeviceListener()</a>。注册一个监听器，当一个新的设备添加、改变或者移除的时候，我们会收到通知。

`unregisterInputDeviceListener()`

  借鉴<a href="http://developer.android.com/reference/android/hardware/input/InputManager.html#unregisterInputDeviceListener(android.hardware.input.InputManager.InputDeviceListener)">unregisterInputDeviceListener()</a>。注销一个输入设备监听器。

`onGenericMotionEvent()`

  借鉴<a href="http://developer.android.com/reference/android/view/View.html#onGenericMotionEvent(android.view.MotionEvent)">onGenericMotionEvent()</a>。让我们的游戏截取和处理 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 对象和代表类似移动摇杆和按下模拟触发器等事件的坐标值。

`onPause()`

  当主 activity 暂停或者当游戏不再聚焦时，停止轮询游戏控制器事件。

`onResume()`

  当主 activity 恢复或者当游戏开始和在前台运行时，启动轮询游戏控制器事件。

`InputDeviceListener`

  借鉴 [InputManager.InputDeviceListener](http://developer.android.com/reference/android/hardware/input/InputManager.InputDeviceListener.html) 接口。当添加、改变或者移除游戏控制器时，会通知我们的游戏。

下一步，创建 `InputManagerCompat` 的实现，使得可以在不同平台版本间工作。如果我们的游戏运行在 Android 4.1 或者更高版本，调用 `InputManagerCompat` 方法，代理实现调用在 [InputManager](http://developer.android.com/reference/android/hardware/input/InputManager.html) 中等效的方法。然而，如果我们的游戏运行在 Andoird 2.3 到 Android 4.0，自定义的实现过程通过使用不晚于 Android 2.3 引进的 API 来调用 `InputManagerCompat` 方法。不管在运行时使用哪种特定版本的实现，实现会透明地将回调结果传给游戏。

![](backward-compatible-inputmanager.png)

**Figure 1.** 接口和特定版本实现的类图。

## 实现 Android 4.1 和更高版本的接口

`InputManagerCompatV16` 是 `InputManagerCompat` 接口的实现，该接口代理方法调用一个 [InputManager](http://developer.android.com/reference/android/hardware/input/InputManager.html) 和 [InputManager.InputDeviceListener](http://developer.android.com/reference/android/hardware/input/InputManager.InputDeviceListener.html)。[InputManager](http://developer.android.com/reference/android/hardware/input/InputManager.html)是从系统 [Context](http://developer.android.com/reference/android/content/Context.html) 得到。

```java
// The InputManagerCompatV16 class is a reference implementation.
// The full code is provided in the ControllerSample.zip sample.
public class InputManagerV16 implements InputManagerCompat {

    private final InputManager mInputManager;
    private final Map mListeners;

    public InputManagerV16(Context context) {
        mInputManager = (InputManager)
                context.getSystemService(Context.INPUT_SERVICE);
        mListeners = new HashMap();
    }

    @Override
    public InputDevice getInputDevice(int id) {
        return mInputManager.getInputDevice(id);
    }

    @Override
    public int[] getInputDeviceIds() {
        return mInputManager.getInputDeviceIds();
    }

    static class V16InputDeviceListener implements
            InputManager.InputDeviceListener {
        final InputManagerCompat.InputDeviceListener mIDL;

        public V16InputDeviceListener(InputDeviceListener idl) {
            mIDL = idl;
        }

        @Override
        public void onInputDeviceAdded(int deviceId) {
            mIDL.onInputDeviceAdded(deviceId);
        }

        // Do the same for device change and removal
        ...
    }

    @Override
    public void registerInputDeviceListener(InputDeviceListener listener,
            Handler handler) {
        V16InputDeviceListener v16Listener = new
                V16InputDeviceListener(listener);
        mInputManager.registerInputDeviceListener(v16Listener, handler);
        mListeners.put(listener, v16Listener);
    }

    // Do the same for unregistering an input device listener
    ...

    @Override
    public void onGenericMotionEvent(MotionEvent event) {
        // unused in V16
    }

    @Override
    public void onPause() {
        // unused in V16
    }

    @Override
    public void onResume() {
        // unused in V16
    }

}
```

## 实现 Android 2.3 到 Android 4.0 的接口

`InputManagerV9` 实现使用了不晚于 Android 2.3 引进的 API。为了创建一个支持 Android 2.3 到 Android 4.0 的 `InputManagerCompat` 实现，我们可以使用下面的对象：

* 设备 ID 的 [`SparseArray`](http://developer.android.com/reference/android/util/SparseArray.html) 跟踪已连接到设备的游戏控制器。
* 一个 [`Handler`](http://developer.android.com/reference/android/os/Handler.html) 来处理设备事件。当一个 app 启动或者恢复时，[`Handler`](http://developer.android.com/reference/android/os/Handler.html) 接收一个消息来开始轮询游戏控制器的断开。[`Handler`](http://developer.android.com/reference/android/os/Handler.html) 将启动一个循环来检查每个已知连接的游戏控制器并且查看是否返回一个设备 ID。返回　`null` 表示游戏控制器断开。当 app 暂停时，[`Handler`](http://developer.android.com/reference/android/os/Handler.html) 停止轮询。
* 一个 `InputManagerCompat.InputDeviceListener` 的 [`Map`](http://developer.android.com/reference/java/util/Map.html) 对象。我们会使用这个 listener 来更新跟踪游戏遥控器的连接状态。

```java
// The InputManagerCompatV9 class is a reference implementation.
// The full code is provided in the ControllerSample.zip sample.
public class InputManagerV9 implements InputManagerCompat {
    private final SparseArray mDevices;
    private final Map mListeners;
    private final Handler mDefaultHandler;
    …

    public InputManagerV9() {
        mDevices = new SparseArray();
        mListeners = new HashMap();
        mDefaultHandler = new PollingMessageHandler(this);
    }
}
```

实现继承 [`Handler`](http://developer.android.com/reference/android/os/Handler.html) 的 `PollingMessageHandler`，并重写 <a href="http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message)">`handleMessage()`</a> 方法。这个方法检查已连接的游戏控制器是否已经断开并且通知已注册的 listener。

```java
private static class PollingMessageHandler extends Handler {
    private final WeakReference mInputManager;

    PollingMessageHandler(InputManagerV9 im) {
        mInputManager = new WeakReference(im);
    }

    @Override
    public void handleMessage(Message msg) {
        super.handleMessage(msg);
        switch (msg.what) {
            case MESSAGE_TEST_FOR_DISCONNECT:
                InputManagerV9 imv = mInputManager.get();
                if (null != imv) {
                    long time = SystemClock.elapsedRealtime();
                    int size = imv.mDevices.size();
                    for (int i = 0; i < size; i++) {
                        long[] lastContact = imv.mDevices.valueAt(i);
                        if (null != lastContact) {
                            if (time - lastContact[0] > CHECK_ELAPSED_TIME) {
                                // check to see if the device has been
                                // disconnected
                                int id = imv.mDevices.keyAt(i);
                                if (null == InputDevice.getDevice(id)) {
                                    // Notify the registered listeners
                                    // that the game controller is disconnected
                                    ...
                                    imv.mDevices.remove(id);
                                } else {
                                    lastContact[0] = time;
                                }
                            }
                        }
                    }
                    sendEmptyMessageDelayed(MESSAGE_TEST_FOR_DISCONNECT,
                            CHECK_ELAPSED_TIME);
                }
                break;
        }
    }
}
```

至于启动和停止轮询游戏控制器的断开，重写这些方法：

```java
private static final int MESSAGE_TEST_FOR_DISCONNECT = 101;
private static final long CHECK_ELAPSED_TIME = 3000L;

@Override
public void onPause() {
    mDefaultHandler.removeMessages(MESSAGE_TEST_FOR_DISCONNECT);
}

@Override
public void onResume() {
    mDefaultHandler.sendEmptyMessageDelayed(MESSAGE_TEST_FOR_DISCONNECT,
            CHECK_ELAPSED_TIME);
}
```

重写 `onGenericMotionEvent()` 方法检测输入设备是否已添加。当系统通知一个动作事件时，检查这个事件是否从已经跟踪过的还是新的设备 ID 中发出。如果是新的设备 ID，通知已注册的 listener。

```java
@Override
public void onGenericMotionEvent(MotionEvent event) {
    // detect new devices
    int id = event.getDeviceId();
    long[] timeArray = mDevices.get(id);
    if (null == timeArray) {
        // Notify the registered listeners that a game controller is added
        ...
        timeArray = new long[1];
        mDevices.put(id, timeArray);
    }
    long time = SystemClock.elapsedRealtime();
    timeArray[0] = time;
}
```

listener 的通知通过使用 [`Handler`](http://developer.android.com/reference/android/os/Handler.html) 对象发送一个 `DeviceEvent` [`Runnable`](http://developer.android.com/reference/java/lang/Runnable.html) 对象到消息队列来实现。`DeviceEvent` 包含了一个 `InputManagerCompat.InputDeviceListener` 的引用。当 `DeviceEvent` 运行时，适当的 listener 回调方法会被调用，标志游戏控制器是否被添加、改变或者移除。

```java
@Override
public void registerInputDeviceListener(InputDeviceListener listener,
        Handler handler) {
    mListeners.remove(listener);
    if (handler == null) {
        handler = mDefaultHandler;
    }
    mListeners.put(listener, handler);
}

@Override
public void unregisterInputDeviceListener(InputDeviceListener listener) {
    mListeners.remove(listener);
}

private void notifyListeners(int why, int deviceId) {
    // the state of some device has changed
    if (!mListeners.isEmpty()) {
        for (InputDeviceListener listener : mListeners.keySet()) {
            Handler handler = mListeners.get(listener);
            DeviceEvent odc = DeviceEvent.getDeviceEvent(why, deviceId,
                    listener);
            handler.post(odc);
        }
    }
}

private static class DeviceEvent implements Runnable {
    private int mMessageType;
    private int mId;
    private InputDeviceListener mListener;
    private static Queue sObjectQueue =
            new ArrayDeque();
    ...

    static DeviceEvent getDeviceEvent(int messageType, int id,
            InputDeviceListener listener) {
        DeviceEvent curChanged = sObjectQueue.poll();
        if (null == curChanged) {
            curChanged = new DeviceEvent();
        }
        curChanged.mMessageType = messageType;
        curChanged.mId = id;
        curChanged.mListener = listener;
        return curChanged;
    }

    @Override
    public void run() {
        switch (mMessageType) {
            case ON_DEVICE_ADDED:
                mListener.onInputDeviceAdded(mId);
                break;
            case ON_DEVICE_CHANGED:
                mListener.onInputDeviceChanged(mId);
                break;
            case ON_DEVICE_REMOVED:
                mListener.onInputDeviceRemoved(mId);
                break;
            default:
                // Handle unknown message type
                ...
                break;
        }
        // Put this runnable back in the queue
        sObjectQueue.offer(this);
    }
}
```

我们现在已经有两个 `InputManagerCompat` 的实现：一个可以在运行 Android 4.1 或者更高版本的设备上工作，另一个可以在运行 Android 2.3 到　Android 4.0 的设备上工作。

## 使用特定版本的实现

特定版本切换的逻辑是在一个充当 <a href="https://en.wikipedia.org/wiki/Factory_(object-oriented_programming)">factory</a> 的类中实现。

```java
public static class Factory {
    public static InputManagerCompat getInputManager(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            return new InputManagerV16(context);
        } else {
            return new InputManagerV9();
        }
    }
}
```

现在我们可以简单地实例化一个 `InputManagerCompat` 对象，并且在主 [`View`](http://developer.android.com/reference/android/view/View.html) 中注册 `InputManagerCompat.InputDeviceListener`。由于我们建立的版本切换逻辑，我们的游戏会自动为设备上运行的 Android 版本使用适当的实现。

```java
public class GameView extends View implements InputDeviceListener {
    private InputManagerCompat mInputManager;
    ...

    public GameView(Context context, AttributeSet attrs) {
        mInputManager =
                InputManagerCompat.Factory.getInputManager(this.getContext());
        mInputManager.registerInputDeviceListener(this, null);
        ...
    }
}
```

下一步，重写主 View 的 <a href="http://developer.android.com/reference/android/view/View.html#onGenericMotionEvent(android.view.MotionEvent)">`onGenericMotionEvent()`</a> 方法，详见[处理从游戏控制器传来的 MotionEvent](controller-inputs.html)。我们的游戏现在应该可以一致地处理运行着 Android 2.3（API level 9）和更高版本设备上的游戏控制器事件。

```java
@Override
public boolean onGenericMotionEvent(MotionEvent event) {
    mInputManager.onGenericMotionEvent(event);

    // Handle analog input from the controller as normal
    ...
    return super.onGenericMotionEvent(event);
}
```

我们可以在上述的 `ControllerSample.zip` 示例的 `GameView` 类中找到这个兼容性的完整的代码。