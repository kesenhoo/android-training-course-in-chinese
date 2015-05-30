# 创建TV游戏应用

> 编写:[dupengwei](https://github.com/dupengwei) - 原文:http://developer.android.com/training/tv/games/index.html

TV屏幕为手机游戏开发者提供了大量的新思考。这些领域包括它的大尺寸，它的控制方案和所有玩家可以同时观看的事实。

## 显示器
开发TV游戏时有两点要记住，就是TV屏幕具有共享显示器的特性，和横向设计游戏的需求。

### 考虑共享显示
客厅TV带来了多人游戏的设计挑战，客厅TV游戏时所有玩家都可以看到。这个问题与游戏，特别是依靠每个玩家用于隐藏信息的游戏（如纸牌游戏、战略游戏）息息相关。
我们可以通过实现一些机制来解决一个玩家窃取另一玩家信息的问题。这些机制是：

- 屏幕罩可以帮助隐藏信息。例如，在一个回合制游戏，像单词或卡片游戏，一次只有一个玩家能看到显示的内容。当这个玩家完成一个步骤，游戏允许他用一个能阻碍其他人看到秘密信息的罩遮住屏幕。当下一个玩家开始操作，这个罩就会打开显示他自己的信息。
- 在手机或平板电脑上运行一个伙伴app作为第二屏幕，通过这种方式让玩家隐藏信息。

### 支持横向显示
TV总是单向显示的：我们不能翻转它的屏幕，且没有纵向显示。要总是以横向显示模式设计我们的TV游戏。

## 输入设备
TV没有触摸屏接口，所以更重要的是获取控制要正确，并确保玩家使用起来要直观和有趣。处理控制器还介绍了其他一些问题需要注意，如跟踪多个控制器，，处理断开要适当。

### 支持D-pad控制
围绕方向键（D-pad）控制来计划我们的控制方案，因为这种控制是Android TV设备的默认设置。玩家需要在游戏的所有方面使用方向键（D-pad）——不仅仅是控制核心游戏设置，而且能导航菜单和广告。因此，我们还应该确保我们的Android TV游戏不能涉及触摸屏。例如，一个Android TV游戏不应该告诉玩家> 点击这里继续。
如何塑造玩家使用控制器与游戏进行互动的方式将是实现良好用户体验的关键：

- **通信控制器的要求**。利用Android市场上app的产品描述将控制器的期望传达给玩家们。如果一个游戏使用摇杆游戏手柄比只用一个方向键更合适，请将这一事实说清楚。玩家使用一个不适合游戏的控制器玩游戏很可能导致游戏体验欠佳，从而对游戏的评价造成不利影响。
- **使用一致的按钮映射**。直观和灵活的按钮映射是良好用户体验的关键。例如，我们应该遵守使用A按钮接受，而B按钮取消的既定习惯。我们也可以提供重映射形式方面的灵活性。关于按钮映射的更多信息，参见[Handling Controller Actions](http://developer.android.com/training/game-controllers/controller-input.html)。
- **检测控制器功能并相应地调整**。查询控制器的能力以优化控制器和游戏直接的匹配程度。例如，我们可能打算让一个玩家通过摇晃控制器来控制一个对象。然而，如果玩家的控制器缺少加速计和陀螺仪硬件设施，摇晃控制器并不会产生效果。所以，我们的游戏应该检查控制器，如果该控制器不支持运行检测，则切换到另一个可用的控制方案。更多关于检测控制器功能的信息，参见[Controllers Across Android Versions](http://developer.android.com/training/game-controllers/compatibility.html)。

### 提供适当的后退按钮的行为
返回按钮不应该作为切换。例如，不能使用它打开和关闭一个菜单。它应该只能导航后退，breadcrumb-style，玩家之前访问过屏幕页面，例如：游戏界面>游戏暂停界面>游戏主界面>Android主界面。
由于返回按钮应该只能进行线性导航（后退），我们可以使用返回按钮离开一个游戏内菜单（由不同的按钮打开），回到游戏界面。更多关于导航设计的信息，参见[Navigation with Back and Up](http://developer.android.com/design/patterns/navigation.html)。学习更多关于实现的信息，参见[Providing Proper Back Navigation](http://developer.android.com/training/implementing-navigation/temporal.html)。


### 使用适当的按钮
并不是所有的游戏控制器提供开始,搜索,或菜单按钮。确保我们的UI不取决于这些按钮的使用。

### 处理多个控制器
当多个玩家玩游戏,每个都有他或她自己的控制器，做好每对“玩家-控制器”的映射是很重要的。关于如何实现“控制器-数量”识别的信息，参见[Input Devices](http://developer.android.com/reference/android/view/InputDevice.html#getControllerNumber)。
  
### 处理控制器的断开
当控制器从游戏中断开时，游戏应该暂停，并弹出一个对话框促使断开的玩家重新连接他或她的控制器。
对话框还应提供排除故障的提示（如，一个弹出的对话框告诉玩家“检查我们的蓝牙连接”）关于实现输入设备支持的更多信息,参见[Handling Controller
  Actions](http://developer.android.com/training/game-controllers/controller-input.html)。具体关于蓝牙连接的信息，参见[Bluetooth](http://developer.android.com/guide/topics/connectivity/bluetooth.html)。
 
### 展示控制器说明
如果我们的游戏提供了可视化的游戏控制说明，控制器图片应该是免费的、品牌化的，并且只能包含与[Android兼容的按钮](http://developer.android.com/training/game-controllers/controller-input.html#button)。
Android兼容的控制器样图，点击[Android TV Gamepad Template (ZIP)](http://storage.googleapis.com/androiddevelopers/design/android_tv_gamepad_template-2014-10.zip)下载。它包含一个黑底的白色控制器和一个白底的黑色控制器，是一个PNG类型的Adobe®Illustrator®文件。
![game-controller-buttons_2x](game-controller-buttons_2x.png)
**Figure 1.** 控制器说明的示例请使用[Android TV Gamepad Template (ZIP)](http://storage.googleapis.com/androiddevelopers/design/android_tv_gamepad_template-2014-10.zip)

## Manifest
有一些特殊的东西应该包含在游戏的Android Manifest里。

### 在屏幕主界面显示游戏
Android TV主界面采用单独一行来显示游戏，与常规应用分开显示。为了让游戏出现在游戏列表，设置游戏的manifest清单的<application>标签下的`android:isGame`属性为`"true"`。例如：

```xml
<application
	...  
	android:isGame="true" 
	...  
>
```

### 声明游戏控制器支持

游戏控制器对于TV设备的用户来说可能不是有效的。为了适当的通知用户，游戏需要（或只支持）一个控制器，我们必须在app的manifest里包含这些条目。如果我们需要一个游戏控制器，我们必须在app的manifest中包含以下条目：

```xml
<uses-feature android:name="android.hardware.gamepad"/>
```

如果我们的游戏使用了一个游戏控制器，但是不需要，在app的manifest里包含以下的功能条目：

```xml
<uses-feature android:name="android.hardware.gamepad" android:required="false"/>
```

更多关于manifest条目的信息，参见[App Manifest](http://developer.android.com/guide/topics/manifest/manifest-intro.html)。

## Google Play Game 服务
如果我们的游戏集成了Google Play Game 服务，我们应该记住一些关于成果的注意事项，登录，保存游戏，和多人游戏。

### 成就
我们的游戏应包含至少5个(可获取的)成果。只有一个用户从一个受支持的输入设备控制游戏应该能够获得成就。关于成就的更多信息以及如何实现，参见[Achievements in Android](https://developers.google.com/games/services/android/achievements)。

### 登录
我们的游戏应该试图在启动的时候让用户登录。如果玩家连续几次拒绝登录后，游戏应该停止询问。学习更多关于登录的信息在[Implementing Sign-in on
  Android](https://developers.google.com/games/services/training/signin)。
  
### 保存
使用Google Play Services[保存游戏](https://developers.google.com/games/services/common/concepts/savedgames)来存储保存的游戏。我们应该讲保存的游戏绑定到一个特定的谷歌账号，作为唯一标识，甚至在跨设备时也不受影响。无论玩家使用手机或TV，游戏应该可以从同一个用户账号获取到保存的游戏信息。

我们也应该在我们的游戏的UI提供一个选项,让玩家删除本地和云存储端的数据。我们可能把选项放在游戏的设置界面。使用Play Services保存游戏的实现细节，参见[Saved Games in Android](https://developers.google.com/games/services/android/savedgames)

### 多人游戏
一个游戏要提供多人游戏体验，必须允许至少2个玩家进入一个房间。进一步了解Android的多人游戏信息，参见Android developer网站的[Real-time Multiplayer](https://developers.google.com/games/services/android/realtimeMultiplayer)和[Turn-based Multiplayer]()文档。

### 退出
提供一个一致和明显的UI元素,让用户适当的退出游戏。这个元素应该用方向键导航按钮访问，这样做而不是依赖Home键提供退出功能，是因为在使用不同的控制器时，若依赖Home键提供退出功能，这既不一致也不可靠。

## Web
不要让android TV的游戏浏览网页。Android TV不支持web浏览器。

> **Note：**我们可以使用[WebView](http://developer.android.com/reference/android/webkit/WebView.html)类实现登录像Google+ 和 Facebook这样的服务。

## 网络
游戏经常需要更大的带宽提供最佳的性能,许多用户宁愿选择有线网而不愿选择WiFi来提供性能。我们的app应该对有线网和WiFi连接都进行检查。如果我们的app只针对TV，我们不需要检查3G/LTE服务，而移动app则需要检查3G/LTE服务。

------------
[下一节: TV应用清单 >](../checklist.html)



































