<!-- # TV Apps Checklist -->
# TV应用清单

> 编写:[awong1900](https://github.com/awong1900) - 原文:http://developer.android.com/training/tv/publishing/checklist.html

<!-- Users enjoy the TV app experience when it is consistent, logical, and predictable. They should be able to navigate within your app and throughout Android TV without getting lost or having to "reset" the UI and start over. Users appreciate clear, colorful, and functional interfaces that make the experience magical. With these ideas in mind, you can create an app that fits nicely in Android TV and performs as users expect. -->

用户喜欢的TV应用应是体验一致的，有逻辑的和可预测的。他们可以在应用内四处浏览，并且不会迷失在应用从而重设UI导致重头开始。用户欣赏干净的，有色彩的和起作用的界面，这样的体验会很好。把这些想法放在脑子中，我们能创造适合Android TV的应用并达到用户的期望。

<!-- This checklist covers the main aspects of development for both apps and games and provides guidelines to ensure that your app provides the best possible experience. Additional considerations for games only are covered in the Games section. -->

这个清单覆盖了应用和游戏的开发的主要方面去确保我们的应用提供了最好的体验。额外的游戏注意事项仅被包含在游戏小节。

<!-- For criteria that qualify an Android TV app on Google Play, see TV App Quality. -->
关于Google Play中Android TV应用的质量标准，参考[TV App Quality](http://developer.android.com/distribute/essentials/quality/tv.html)。

<!-- ## TV Form Factor Support ## -->
## TV格式因素的支持

<!-- These checklist items apply to **Games** and **Apps**. -->
这些清单项目使用在**游戏**和**应用**中。

<!-- 
1. Identify the main TV activity with the CATEGORY_LEANBACK_LAUNCHER filter in the manifest.  
See Declare a TV Activity.
2. Provide a home screen banner for each language supported by your app
	- Launcher app banner measures 320x180 px
	- Banner resource is located in the drawables/xhdpi directory
 	- Banner image includes localized text to identify the app.  
	See Provide a home screen banner.
3. Eliminate requirements for unsupported hardware in your app.  
See Declaring hardware requirements for TV.
4. Ensure permissions do not imply hardware requirements  
See Declaring permissions that imply hardware features.
-->

1. 确定manifest的主activity使用`CATEGORY_LEANBACK_LAUNCHER`。
	查看[Declare a TV Activity](http://developer.android.com/training/tv/start/start.html#tv-activity)。
2. 提供每种语言的主屏幕横幅支持。
    - 启动应用横幅大小为320x180 px 
    - 横幅资源放在`drawables/xhdpi`目录
    - 横幅图像包含本地化的文本去识别应用。
    查看[Provide a home screen banner](http://developer.android.com/training/tv/start/start.html#banner)。
3. 消除不支持的硬件要求。
    查看[Declaring hardware requirements for TV](http://developer.android.com/training/tv/start/hardware.html#declare-hardware-requirements)。
4. 确保没有隐式的权限需求。
    查看[Declaring permissions that imply hardware features](http://developer.android.com/training/tv/start/hardware.html#hardware-permissions)。

<!-- ## User Interface Design ## -->
## 用户界面设计

<!-- These checklist items apply to **Games** and **Apps**. -->
这些清单项使用在**游戏**和**应用**中。

<!-- 
1. Provide appropriate layout resources for landscape mode. 
See [Build Basic TV Layouts]().
2. Ensure that text and controls are large enough to be visible from a distance.  
See Build Useable Text and Controls.
3. Provide high-resolution bitmaps and icons for HDTV screens.  
See Manage Layout Resources for TV.
4. Make sure your icons and logo conform to Android TV specifications.  
See Manage Layout Resources for TV.
5. Allow for overscan in your layout.  
See Overscan.
6. Make every UI element work with both D-pad and game controllers.  
See Creating Navigation and Handling Controllers.
7. Change the background image as users browse through content.  
See Update the Background.
8. Customize the background color to match your branding in Leanback fragments.  
See Customize the Card View.
9. Ensure that your UI does not require a touch screen.  
See Touch screen and Declare touch screen not required.
10. Follow guidelines for effective advertising.  
See Provide Effective Advertising.
-->

1. 提供适合横屏模式的布局资源。
	查看 [Build Basic TV Layouts](http://developer.android.com/training/tv/start/layouts.html#structure)。
2. 确保文本和控件在一定距离外看是足够大的。
	查看[Build Useable Text and Controls](http://developer.android.com/training/tv/start/layouts.html#visibility)。
3. 为HDTV屏幕提供高分辨率的位图和图标。
	查看 [Manage Layout Resources for TV](http://developer.android.com/design/tv/patterns.html#icons)。
4. 确保我们的图标和logo符合Android TV的规范。
	查看[Manage Layout Resources for TV](http://developer.android.com/design/tv/patterns.html#icons)。
5. 允许布局使用overscan。
	查看[Overscan](http://developer.android.com/training/tv/start/layouts.html#overscan)。
6. 使每一个布局元素都能用D-pad和游戏控制器操作。
	查看 [Creating Navigation](http://developer.android.com/training/tv/start/navigation.html) 和[Handling Controllers](http://developer.android.com/training/tv/start/navigation.html)。
7. 当用户通过文本搜索时改变背景图像。
	查看[Update the Background](http://developer.android.com/training/tv/playback/browse.html#background)。
8. 在Leanback fragments中定制背景颜色去匹配品牌。
	查看[Customize the Card View](http://developer.android.com/training/tv/playback/card.html#background)。
9. 确保我们的UI不需要触摸屏。
	查看[Touch screen](http://developer.android.com/training/tv/start/hardware.html#no-touchscreen) and [Declare touch screen not required](http://developer.android.com/training/tv/start/start.html#no-touchscreen)。
10. 遵循有效的广告的指导。
	查看[Provide Effective Advertising](http://developer.android.com/training/tv/start/layouts.html#advertising)。

<!-- ## Search and Content Discovery ## -->
## 搜索和发现内容

<!-- These checklist items apply to **Games** and **Apps**. -->
这些清单项使用在**游戏**和**应用**中。

<!-- 
1. Provide search results from your app in the Android TV global search box.  
See Provide Data.
2. Provide TV-specific data fields for search.  
See Identify Columns.
3. Make sure your app presents discovered content in a details screen that lets the user start watching the content immediately.  
See Display Your App in the Details Screen.
4. Put relevant, actionable content and categories on the main screen, making it easy to discover content.  
See Recommending TV Content.
-->

1. 在Android TV全局搜索框中提供搜索结果。
	查看[Provide Data](http://developer.android.com/training/tv/discovery/searchable.html#provide)。
2. 提供TV特定数据字段的搜索。
	查看[Identify Columns](http://developer.android.com/training/tv/discovery/searchable.html#columns)。
3. 确保应用的详情屏幕有可发现的内容以便用户立即开始观看。
	查看[Display Your App in the Details Screen](http://developer.android.com/training/tv/discovery/searchable.html#details)。
4. 放置相关的，可操作的内容和目录在主屏幕，使用户容易的发现内容。
	查看[Recommending TV Content](http://developer.android.com/training/tv/discovery/recommendations.html)。

<!-- ## Games ## -->
## 游戏

<!-- These checklist items apply to **Games**. -->
这些清单项目使用在**游戏**。

<!-- 
1. Show your game on the home screen with the isGame flag in the manifest.  
See Show your game on the home screen.
2. Make sure game controller support does not depend upon the Start, Select, or Menu buttons (not all controllers have these).  
See Input Devices.
3. Use a generic gamepad graphic (without specific controller branding) to show game button mappings.  
See Show controller instructions.
4. Check for both ethernet and WiFi connectivity.  
See Networking.
5. Provide users with a clean exit.  
See Exit. and Apps.
-->

1. 在manifest中用`isGame`标记让游戏显示在主屏幕上。
	查看[Show your game on the home screen](http://developer.android.com/training/tv/games/index.html#Launcher)。
2. 确保游戏控制器可以不依靠开始，选择，或者菜单键操作(不是所有控制器有这些按键)。
	查看[Input Devices](http://developer.android.com/training/tv/games/index.html#control)。
3. 使用通常的游戏手柄布局（不包括特殊的控制器品牌）去显示游戏按键示意图。
	查看[Show controller instructions](http://developer.android.com/training/tv/games/index.html#ControllerHelp)。
4. 检查网络和WiFi连接。
	查看[Networking](http://developer.android.com/training/tv/games/index.html#networking)。
5. 提供给用户清晰的退出提示。
	查看[Exit](http://developer.android.com/training/tv/games/index.html#exit)。

----------------
