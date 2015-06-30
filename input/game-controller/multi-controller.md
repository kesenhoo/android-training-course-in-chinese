# 支持多个游戏控制器

> 编写:[heray1990](https://github.com/heray1990) - 原文:<http://developer.android.com/training/game-controllers/multiple-controllers.html>

尽管大部分的游戏都被设计成一台 Android 设备支持一个用户，但是仍然有可能支持在同一台 Android 设备上同时连接的多个游戏控制器（即多个用户）。

这节课覆盖了一些处理单个设备多个玩家（或者多个控制器）输入的基本技术。这包括维护一个在玩家化身和每个控制器之间的映射，以及适当地处理控制器的输入事件。

## 映射玩家到控制器的设备 ID

当一个游戏控制器连接到一台 Android 设备，系统会为控制器指定一个整型的设备 ID。我们可以通过调用 <a href="http://developer.android.com/reference/android/view/InputDevice.html#getDeviceIds()">`InputDevice.getDeviceIds()`</a> 来取得已连接的游戏控制器的设备 ID，如[验证游戏控制器是否已连接](http://developer.android.com/training/game-controllers/controller-input.html#input)介绍的一样。我们可以将每个设备 ID 与游戏中的玩家关联起来，然后分别处理每个玩家的游戏动作。

> **Note：**在运行着 Android 4.1（API level 16）或者更高版本的设备上，我们可以通过使用 <a href="http://developer.android.com/reference/android/view/InputDevice.html#getDescriptor()">`getDescriptor()`</a> 来取得输入设备的描述符。上述函数为输入设备返回一个唯一连续的字符串值。不同于设备 ID，即使在输入设备断开、重连或者重新配置时，描述符都不会变化。

下面的代码介绍了如何使用 [SparseArray](http://developer.android.com/reference/android/util/SparseArray.html) 来关联玩家化身与一个特定的控制器。在这个例子中，`mShips` 变量保存了一个 `Ship` 对象的集合。当一个新的控制器连接到一个用户时，会创建一个新的玩家化身。当已关联的控制器被移除时，对应的玩家化身会被移除。

`onInputDeviceAdded()` 和 `onInputDeviceRemoved()` 回调函数是[在不同的 Android 系统版本支持控制器](compatibility.html)中介绍的抽象层的一部分。通过实现这些 listener 回调，我们的游戏可以在添加或者移除控制器的时候，识别出游戏控制器的设备 ID。这个检测兼容 Android 2.3（API level 9）和更高的版本。

```java
private final SparseArray<Ship> mShips = new SparseArray<Ship>();

@Override
public void onInputDeviceAdded(int deviceId) {
    getShipForID(deviceId);
}

@Override
public void onInputDeviceRemoved(int deviceId) {
    removeShipForID(deviceId);
}

private Ship getShipForID(int shipID) {
    Ship currentShip = mShips.get(shipID);
    if ( null == currentShip ) {
        currentShip = new Ship();
        mShips.append(shipID, currentShip);
    }
    return currentShip;
}

private void removeShipForID(int shipID) {
    mShips.remove(shipID);
}
```

## 处理多个控制器输入

我们的游戏应该执行下面的循环来处理多个控制器的输入：

1. 检测是否出现一个输入事件。

2. 识别输入源和它的设备 ID。

3. 根据以输入事件按键码或者坐标值的形式表示的 action，更新玩家化身与设备 ID 的关联关系。

4. 渲染和更新用户界面。

[keyEvent](http://developer.android.com/reference/android/view/KeyEvent.html) 和 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 输入事件与设备 ID 相关联。我们的游戏可以利用这个关联来确定输入事件从哪个控制器发出，并且更新玩家化身与控制器的关联。

下面的代码介绍了我们如何将一个玩家化身引用相应的游戏控制器设备 ID，并且根据用户按下控制器的按键来更新游戏。

```java
@Override
public boolean onKeyDown(int keyCode, KeyEvent event) {
    if ((event.getSource() & InputDevice.SOURCE_GAMEPAD)
                == InputDevice.SOURCE_GAMEPAD) {
        int deviceId = event.getDeviceId();
        if (deviceId != -1) {
            Ship currentShip = getShipForId(deviceId);
            // Based on which key was pressed, update the player avatar
            // (e.g. set the ship headings or fire lasers)
            ...
            return true;
        }
    }
    return super.onKeyDown(keyCode, event);
}
```

> **Note：**一个最佳做法，当用户的游戏控制器断开时，我们应该停止游戏并询问用户是否像要重新连接。