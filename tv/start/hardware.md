<!-- # Handling TV Hardware -->
# 处理TV硬件

> 编写:[awong1900](https://github.com/awong1900) - 原文:<http://developer.android.com/training/tv/start/hardware.html>

<!-- TV hardware is substantially different from other Android devices. TVs do not include some of the hardware features found on other Android devices, such as touch screens, cameras, and GPS receivers. TVs are also completely dependent on secondary hardware devices. In order for users to interact with TV apps, they must use a remote control or game pad. When you build an app for TV, you must carefully consider the hardware limitations and requirements of operating on TV hardware. -->

TV硬件和其他Android设备有实质性的不同。TV不包含一些其他Android设备具备的硬件特性，如触摸屏，摄像头，和GPS。TV操作也完全依赖于其他辅助硬件设备。为了让用户与TV应用交互，他们必须使用遥控器或者游戏手柄。当我们创建TV应用时，必须小心的考虑到TV硬件的限制和操作要求。


<!-- This lesson discusses how to check if your app is running on a TV, how to handle unsupported hardware features, and discusses the requirements for handling controllers for TV devices. -->

本节课程讨论如何检查应用是不是运行在TV上，怎样去处理不支持的硬件特性，和讨论处理TV设备控制器的要求。



<!-- ## Check for a TV Device ## -->
## TV设备的检测

<!-- If you are building an app that operates both on TV devices and other devices, you may need to check what kind of device your app is running on and adjust the operation of your app. For instance, if you have an app that can be started through an Intent, your application should check the device properties to determine if it should start a TV-oriented activity or a phone activity. -->

如果我们创建的应用同时支持TV设备和其他设备，我们可能需要检测应用当前运行在哪种设备上，并调整应用的执行。例如，如果有一个应用通过[Intent](http://developer.android.com/reference/android/content/Intent.html)启动，应用应该检查设备特性然后决定是应该启动TV方面的activity还是手机的activity。


<!-- The recommended way to determine if your app is running on a TV device is to use the UiModeManager.getCurrentModeType() method to check if the device is running in television mode. The following example code shows you how to check if your app is running on a TV device: -->

检查应用是否运行在TV设备上，推荐的方式是用[UiModeManager.getCurrentModeType()](http://developer.android.com/reference/android/app/UiModeManager.html#getCurrentModeType())方法检测设备是否运行在TV模式。下面的示例代码展示了如何检查应用是否运行在TV设备上：

```java
public static final String TAG = "DeviceTypeRuntimeCheck";

UiModeManager uiModeManager = (UiModeManager) getSystemService(UI_MODE_SERVICE);
if (uiModeManager.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION) {
    Log.d(TAG, "Running on a TV Device")
} else {
    Log.d(TAG, "Running on a non-TV Device")
}
```


<!-- ## Handle Unsupported Hardware Features ## -->
## 处理不支持的硬件特性

<!-- Depending on the design and functionality of your app, you may be able to work around certain hardware features being unavailable. This section discusses what hardware features are typically not available for TV, how to detect missing hardware features, and suggests alternatives to using these features. -->

基于应用的设计和功能，我们可能需要在某些硬件特性不可用的情况下工作。这节讨论哪些硬件特性对于TV是典型不可用的，如何去检测缺少的硬件特性，并且去用这些特性的推荐替代方法。


<!-- ### Unsupported TV hardware features ### -->
### 不支持的TV硬件特性

<!-- TVs have a different purpose from other devices, and so they do not have hardware features that other Android-powered devices often have. For this reason, the Android system does not support the following features for a TV device: -->

TV和其他设备有不同的目的，因此它们没有一些其他Android设备通常有的硬件特性。由于这个原因，TV设备的Android系统不支持以下特性：

硬件      				|	 Android特性描述
:-----------------------|:-------------------------------------
触屏						|	`android.hardware.touchscreen`
触屏模拟器				|	`android.hardware.faketouch`
电话						|	`android.hardware.telephony`
摄像头					|	`android.hardware.camera`
蓝牙						|	`android.hardware.bluetooth`
近场通讯（NFC）			|	`android.hardware.nfc`
GPS						|	`android.hardware.location.gps`
麦克风 **[1]**			|	`android.hardware.microphone`
传感器					|	`android.hardware.sensor`

<!-- >**[1]** Some TV controllers have a microphone, which is not the same as the microphone hardware feature described here. The controller microphone is fully supported. -->

>**[1]** 一些TV控制器有麦克风，但不是这里描述的麦克风硬件特性。控制器麦克风是完全被支持的。

<!-- See the Features Reference for a complete list of features, subfeatures, and their descriptors. -->

查看[Features Reference](http://developer.android.com/guide/topics/manifest/uses-feature-element.html#features-reference)获得完全的特性和子特性列表，和它们的描述。


<!-- ### Declaring hardware requirements for TV ### -->
### 声明TV硬件需求

<!-- Android apps can declare hardware feature requirements in the app manifest to ensure that they do not get installed on devices that do not provide those features. If you are extending an existing app for use on TV, closely review your app's manifest for any hardware requirement declarations that might prevent it from being installed on a TV device. -->

Android应用能通过在manifest中定义硬件特性需求来确保应用不能被安装在不提供这些特性的设备上。如果我们正在扩展应用到TV上，仔细地审查我们的manifest的硬件特性需求，它有可能阻止应用安装到TV设备上。


<!-- If your app uses hardware features (such as a touchscreen or camera) that are not available on TV, but can operate without the use of those features, modify your app's manifest to indicate that these features are not required by your app. The following manifest code snippet demonstrates how to declare that your app does not require hardware features which are unavailable on TV devices, even though your app may use these features on non-TV devices: -->

即使我们的应用使用了TV上不存在的硬件特性（如触屏或者摄像头），应用也可以在没有那些特性的情况下工作，需要修改应用的manifest来表明这些特性不是必须的。接下来的manifest代码片段示范了如何声明在TV设备中不可用的硬件特性，尽管我们的应用在非TV设备上可能会用上这些特性。

```xml
<uses-feature android:name="android.hardware.touchscreen"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.faketouch"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.telephony"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.camera"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.bluetooth"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.nfc"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.gps"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.microphone"
        android:required="false"></uses>
<uses-feature android:name="android.hardware.sensor"
        android:required="false"></uses>
```

<!-- >Note: Some features have subfeatures like `android.hardware.camera.front`, as described in the Feature Reference. Be sure to mark as `required="false"` any subfeatures also used in your app. -->

>**Note**：一些特性有子特性，如`android.hardware.camera.front`，参考：[Feature Reference](http://developer.android.com/guide/topics/manifest/uses-feature-element.html#features-reference)。确保应用中任何子特性也标记为`required="false"`。


<!-- All apps intended for use on TV devices must declare that the touch screen feature is not required as described in Get Started with TV Apps. If your app normally uses one or more of the features listed above, change the android:required attribute setting to false for those features in your manifest. -->

所有想用在TV设备上的应用必须声明触屏特性不被需要，在[创建TV应用的第一步](http://developer.android.com/training/tv/start/start.html#no-touchscreen)有描述。如果我们的应用使用了一个或更多的上面列表上的特性，改变manifest特性的`android:required`属性为`false`。


<!-- >**Caution**: Declaring a hardware feature as required by setting its value to `true` prevents your app from being installed on TV devices or appearing in the Android TV home screen launcher. -->

>**Caution**：表明一个硬件特性是必须的，设置它的值为`true`可以阻止应用在TV设备上安装或者出现在AndroidTV的主屏幕启动列表上。


<!-- Once you decide to make hardware features optional for your app, you must check for the availability of those features at runtime and then adjust your app's behavior. The next section discusses how to check for hardware features and suggests some approaches for changing the behavior of your app. -->

一旦我们决定了应用的硬件特性选项，那就必须检查在运行时这些特性的可用性，然后调整应用的行为。下一节讨论如何检查硬件特性和改变应用行为的建议处理。


<!-- For more information on filtering and declaring features in the manifest, see the uses-feature guide. -->

更多关于filter和在manifest里声明特性，参考：[uses-feature](http://developer.android.com/guide/topics/manifest/uses-feature-element.html)。



<!-- ### Declaring permissions that imply hardware features ### -->
### 声明权限会隐含硬件特性 ###

<!-- Some uses-permission manifest declarations imply hardware features. This behavior means that requesting some permissions in your app manifest can exclude your app from being installed and used on TV devices. The following commonly requested permissions create an implicit hardware feature requirement: -->

一些[uses-permission](http://developer.android.com/guide/topics/manifest/uses-permission-element.html) manifest声明隐含了硬件特性。这些行为意味着在应用中请求一些权限能导致应用不能安装和使用在TV设备上。下面普通的权限请求包含了一个隐式的硬件特性需求：

权限                       |	隐式的硬件需求
:-------------------------|:--------------------------------
[RECORD_AUDIO]()          |	`android.hardware.microphone`
[CAMERA]()                |	`android.hardware.camera` *and* `android.hardware.camera.autofocus`
[ACCESS_COARSE_LOCATION]()|	`android.hardware.location` *and* `android.hardware.location.network`
[ACCESS_FINE_LOCATION]()  |	`android.hardware.location` *and* `android.hardware.location.gps`

<!-- For a complete list of permission requests that imply a hardware feature requirement, see the uses-feature guide. If your app requests one of the features listed above, include a uses-feature declaration in your manifest for the implied hardware feature that indicates it is not required (android:required="false"). -->

包含隐式硬件特性需求的完整权限需求列表，参考：[uses-feature](http://developer.android.com/guide/topics/manifest/uses-feature-element.html#permissions-features)。如果我们的应用请求了上面列表上的特性的任何一个，在manifest中设置它的隐式硬件特性为不需要（`android:required="false"`）。


<!-- ### Checking for hardware features ### -->
### 检查硬件特性

<!-- The Android framework can tell you if hardware features are not available on the device where your app is running. Use the hasSystemFeature(String) method to check for specific features at runtime. This method takes a single string argument that specifies the feature you want to check. -->

在应用运行时，Android framework能告诉硬件特性是否可用。用[hasSystemFeature(String)](http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String))方法在运行时检查特定的特性。这个方法只需要一个字符串参数，即想检查的特性名字。


<!-- The following code example demonstrates how to detect the availability of hardware features at runtime: -->

接下来的示例代码展示了如何在运行时检测硬件特性的可用性：

```java
// Check if the telephony hardware feature is available.
if (getPackageManager().hasSystemFeature("android.hardware.telephony")) {
    Log.d("HardwareFeatureTest", "Device can make phone calls");
}

// Check if android.hardware.touchscreen feature is available.
if (getPackageManager().hasSystemFeature("android.hardware.touchscreen")) {
    Log.d("HardwareFeatureTest", "Device has a touch screen.");
}
```

<!-- ### Touch screen ### -->
### 触屏

<!-- Since most TVs do not have touch screens, Android does not support touch screen interaction for TV devices. Furthermore, using a touch screen is not consistent with a viewing environment where the user is seated 10 feet away from the display. Make sure that your UI elements and text do not require or imply the use of a touchscreen. -->

因为大部分的TV没有触摸屏，在TV设备上，Android不支持触屏交互。此外，用触屏交互和坐在离显示器3米外观看是相互矛盾的。

<!-- On TV devices, you should design your app to work with this interaction model by supporting navigation using a directional pad (D-pad) on a TV remote control. For more information on properly supporting navigation using TV-friendly controls, see Creating TV Navigation. -->

在TV设备中，我们应该设计出支持遥控器方向键（D-pad）远程操作的交互模式。更多关于正确地支持TV友好的控制器操作的信息，参考[Creating TV Navigation](http://developer.android.com/training/tv/start/navigation.html)。


<!-- ### Camera ### -->
### 摄像头

<!-- Although a TV typically does not have a camera, you can still provide a photography-related app on a TV. For example, if you have an app that takes, views, and edits photos, you can disable its picture-taking functionality for TVs and still allow users to view and even edit photos. If you decide to enable your camera-related app to work on a TV, add the following feature declaration your app manifest: -->

尽管TV通常没有摄像头，但是我们仍然可以提供拍照相关的TV应用，如果应用有拍照，查看和编辑图片功能，在TV上可以关闭拍照功能但仍可以允许用户查看甚至编辑图片。如果我们决定在TV上使用摄像相关的应用，在manifest里添加接下来的特性声明：

```xml
<uses-feature android:name="android.hardware.camera" android:required="false" ></uses>
```

<!-- If you enable your app to run without a camera, add code to your app that detects if the camera feature is available and makes adjustments to the operation of your app. The following code example demonstrates how to detect the presence of a camera: -->

如果在缺少摄像头情况下运行应用，在我们应用中添加代码去检测是否摄像头特性可用，并且调整应用的操作。接下来的示例代码展示了如何检测一个摄像头的存在：

```java
// Check if the camera hardware feature is available.
if (getPackageManager().hasSystemFeature("android.hardware.camera")) {
    Log.d("Camera test", "Camera available!");
} else {
    Log.d("Camera test", "No camera available. View and edit features only.");
}
```

<!-- ### GPS ### -->
### GPS

<!-- TVs are stationary, indoor devices, and do not have built-in global positioning system (GPS) receivers. If your app uses location information, you can still allow users to search for a location, or use a static location provider such as a zip code configured during the TV device setup. -->

TV是固定的室内设备，并且没有内置的全球定位系统（GPS）接收器。如果我们应用使用定位信息，我们仍可以允许用户搜索位置，或者用固定位置提供商代替，如在TV设置中设置邮政编码。

```java
// Request a static location from the location manager
LocationManager locationManager = (LocationManager) this.getSystemService(
        Context.LOCATION_SERVICE);
Location location = locationManager.getLastKnownLocation("static");

// Attempt to get postal or zip code from the static location object
Geocoder geocoder = new Geocoder(this);
Address address = null;
try {
  address = geocoder.getFromLocation(location.getLatitude(),
          location.getLongitude(), 1).get(0);
  Log.d("Zip code", address.getPostalCode());

} catch (IOException e) {
  Log.e(TAG, "Geocoder error", e);
}
```

<!-- ## Handling Controllers ## -->
## 处理控制器

<!-- TV devices require a secondary hardware device for interacting with apps, in the form of a basic remote controller or game controller. This means that your app must support D-pad input. It also means that your app may need to handle controllers going offline and input from more than one type of controller. -->

TV设备需要辅助硬件设备与应用交互，如一个基本形式的遥控器或者游戏手柄。这意味着我们应用必须支持D-pad（十字方向键）输入。它也意味着我们应用可能需要处理手柄掉线和更多类型的手柄输入。


<!-- ### D-pad minimum controls ### -->
### D-pad最低控制要求

<!-- The default controller for a TV device is a D-pad. In general, your app should be operable from a remote controller that only has up, down, left, right, select, Back, and Home buttons. If your app is a game that typically requires a game controller with additional controls, your app should attempt to allow gameplay with these D-pad controls. In this case, your app should also warn the user that a controller is required and allow them to exit your game gracefully using the D-pad controller. For more information about handling navigation with D-pad controller for TV devices, see Creating TV Navigation. -->

默认的TV设备控制器是D-pad。通常，我们可以用遥控器的上，下，左，右，选择，返回，和Home键操作应用。如果应用是一个游戏而需要游戏手柄额外的控制，它也应该尝试允许用D-pad操作。这种情况下，应用也应该警告用户需要手柄，并且允许他们用D-pad优雅的退出游戏。更多关于在TV设备如理D-pad的操作，参考[Creating TV Navigation](http://developer.android.com/training/tv/start/navigation.html)。


<!-- ### Handle controller disconnects ### -->
### 处理手柄掉线

<!-- Controllers for TV are frequently Bluetooth devices which may attempt to save power by periodically going into sleep mode and disconnecting from the TV device. This means that an app might be interrupted or restarted if it is not configured to handle these reconnect events. These events can happen in any of the following circumstances: -->

TV的手柄通常是蓝牙设备，它为了省电而定期的休眠并且与TV设备断开连接。这意味着如果不处理这些重连事件，应用可能被中断或者重新开始。这些事件可以发生在下面任何情景中：

<!--
- While watching a video which is several minutes long, a D-Pad or game controller goes into sleep mode, disconnects from the TV device and then reconnects later on.
- During gameplay, a new player joins the game using a game controller that is not currently connected.
- During gameplay, a player leaves the game and disconnects a game controller.
-->

- 当在看几分钟的视频，D-Pad或者游戏手柄进入了睡眠模式，从TV设备上断开连接并且随后重新连接。
- 在玩游戏时，新玩家用不是当前连接的游戏手柄加入游戏。
- 在玩游戏时，一个玩家离开游戏并且断开游戏手柄。

<!-- Any TV app activity that is subject to disconnect and reconnect events must be configured to handle reconnection events in the app manifest. The following code sample demonstrates how to enable an activity to handle configuration changes, including a keyboard or navigation device connecting, disconnecting, or reconnecting: -->

任何TV应用activity相关于断开和重连事件。这些事件必须在应用的manifest配置去处理。接下来的示例代码展示了如何确保一个activity去处理配置改变，包括键盘或者操作设备连接，断开连接，或者重新连接：

```java
<activity
  android:name="com.example.android.TvActivity"
  android:label="@string/app_name"
  android:configChanges="keyboard|keyboardHidden|navigation"
  android:theme="@style/Theme.Leanback">

  <intent-filter>
    <action android:name="android.intent.action.MAIN" ></action>
    <category android:name="android.intent.category.LEANBACK_LAUNCHER" ></category>
  </intent-filter>
  ...
</activity>
```

<!-- This configuration change allows the app to continue running through a reconnection event, rather than being restarted by the Android framework, which is not a good user experience. -->

这个配置改变属性允许应用通过重连事件继续运行，比较而言Android framework强制重启应用会导致一个不好的用户体验。

<!-- ### Handle D-pad input variations ### -->
### 处理D-pad变种输入

<!-- TV device users may have more than one type of controller that they use with their TV. For example, a user might have both a basic D-pad controller and a game controller. The key codes provided by a game controller when it is being used for D-pad functions may vary from the key codes sent by a physical D-pad. -->

TV设备用户可能有超过一种类型的控制器来操作TV。例如，一个用户可能有基本D-pad控制器和一个游戏控制器。游戏控制器用于D-pad功能的按键代码可能和物理十字键提供的不相同。

<!-- Your app should handle the variations of D-pad input from a game controller, so the user does not have to physically switch controllers to operate your app. For more information on handling these input variations, see Handling Controller Actions. -->

我们的应用应该处理游戏控制器D-pad的变种输入，这样用户不需要通过手动切换控制器去操作应用。更多信息关于处理这些变种输入，参考[Handling Controller Actions](http://developer.android.com/training/tv/start/hardware.html)。

-------------
[下一节: 创建TV布局 >](layouts.html)
