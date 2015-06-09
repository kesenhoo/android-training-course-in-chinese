<!-- Get Started with TV Apps -->
# 创建TV应用的第一步

> 编写:[awong1900](https://github.com/awong1900) - 原文:<http://developer.android.com/training/tv/start/start.html>

<!-- TV apps use the same structure as those for phones and tablets. This similarity means you can modify your existing apps to also run on TV devices or create new apps based on what you already know about building apps for Android. -->

TV应用使用与手机和平板同样的架构。这种相似性意味着我们可以修改现有的应用到TV设备或者用以前安卓应用的经验开发TV应用。

<!-- Important: There are specific requirements your app must meet to qualify as an Android TV app on Google Play. For more information, see the requirements listed in TV App Quality. -->

>**Important**: 想把Android TV应用放在Google Play中应满足一些特定要求。更多信息, 参考[TV App Quality](http://developer.android.com/distribute/essentials/quality/tv.html)中的要求列表。

<!-- This lesson describes how to prepare your development environment for building TV apps, and the minimum required changes to enable an app to run on TV devices. -->

本课程介绍如何准备TV应用开发环境,和使应用能够运行在TV设备上的最低要求。


<!-- ## Determine Media Format Support -->
## 查明支持的媒体格式
<!--
See the following documentation for information about the codecs, protocols, and formats supported by Android TV.

- Supported Media Formats
- DRM
- android.drm
- ExoPlayer
- android.media.MediaPlayer
-->

查看以下文档信息，包括代码，协议和Android TV支持的格式。

- [支持的媒体格式](http://developer.android.com/guide/appendix/media-formats.html)
- [DRM](https://source.android.com/devices/drm.html)
- [android.drm](http://developer.android.com/reference/android/drm/package-summary.html)
- [ExoPlayer](http://developer.android.com/guide/topics/media/exoplayer.html)
- [android.media.MediaPlay](http://developer.android.com/reference/android/media/MediaPlayer.html)


<!-- ## Determine Media Format Support -->
## 查明支持的媒体格式
<!--
See the following documentation for information about the codecs, protocols, and formats supported by Android TV.

- Supported Media Formats
- DRM
- android.drm
- ExoPlayer
- android.media.MediaPlayer
-->

查看一下文档关于代码，协议和Android TV支持的格式。

- [支持的媒体格式](http://developer.android.com/guide/appendix/media-formats.html)
- [DRM](https://source.android.com/devices/drm.html)
- [android.drm](http://developer.android.com/reference/android/drm/package-summary.html)
- [ExoPlayer](http://developer.android.com/guide/topics/media/exoplayer.html)
- [android.media.MediaPlay](http://developer.android.com/reference/android/media/MediaPlayer.html)

<!--Set up a TV Project -->
## 创建TV项目

<!--This section discusses how to modify an existing app to run on TV devices, or create a new one. These are the main components you must use to create an app that runs on TV devices: -->

本节讨论如何修改已有的应用或者新建一个应用使之能够运行在电视设备上。在TV设备上运行的应用必须使用这些主要组件:

<!--
* Activity for TV (Required) - In your application manifest, declare an activity that is intended to run on TV devices.
* TV Support Libraries (Optional) - There are several Support Libraries available for TV devices that provide widgets for building user interfaces. -->

* **Activity for TV** (必须) - 在您的application manifest中, 声明一个可在TV设备上运行的activity。
* **TV Support Libraries** (可选) - 这些支持库[Support Libraries](http://developer.android.com/training/tv/start/start.html#tv-libraries) 可以提供搭建TV用户界面的控件。

<!-- Prerequisites -->
### 前提条件

<!-- Before you begin building apps for TV, you must: -->
在创建TV应用前, 必须做以下事情:

<!--
* Update your SDK tools to version 24.0.0 or higher
	The updated SDK tools enable you to build and test apps for TV.
* Update your SDK with Android 5.0 (API 21) or higher
	The updated platform version provides new APIs for TV apps.
* Create or update your app project
	In order to access new APIs for TV devices, you must create a project or modify an existing project that targets Android 5.0 (API level 21) or higher.
-->

- [更新SDK tools到版本24.0.0或更高](http://developer.android.com/sdk/installing/adding-packages.html#GetTools)
	更新的SDK工具能确保编译和测试TV应用

- [更新SDK为Android 5.0 (API 21)或更高](http://developer.android.com/sdk/installing/adding-packages.html#GetTools)
	更新的平台版本为TV应用提供更新的API

- [创建或更新应用工程](http://developer.android.com/sdk/installing/create-project.html)
	为了支持TV新API, 我们必须创建一个新工程或者修改原工程的目标平台为Android 5.0 (API版本21)或者更高。


<!-- Declare a TV Activity -->
### 声明一个TV Activity

<!-- An application intended to run on TV devices must declare a launcher activity for TV in its manifest using a [CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER) intent filter. This filter identifies your app as being enabled for TV, and is required for your app to be considered a TV app in Google Play. Declaring this intent also identifies which activity in your app to launch when a user selects its icon on the TV home screen. -->

一个应用想要运行在TV设备中，必须在它的manifest中定义一个启动activity，用intent filter包含[CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER)。这个filter表明你的应用是在TV上可用，并且为Google Play上发布TV应用所必须。定义这个intent也意味着点击主屏幕的应用图标时，就是打开的这个activity。

<!-- The following code snippet shows how to include this intent filter in your manifest: -->
接下来的代码片段显示如何在manifest中包含这个intent filter：

```java
<application
  android:banner="@drawable/banner" >
  ...
  <activity
    android:name="com.example.android.MainActivity"
    android:label="@string/app_name" >

    <intent-filter>
      <action android:name="android.intent.action.MAIN" />
      <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
  </activity>

  <activity
    android:name="com.example.android.TvActivity"
    android:label="@string/app_name"
    android:theme="@style/Theme.Leanback">

    <intent-filter>
      <action android:name="android.intent.action.MAIN" />
      <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
    </intent-filter>

  </activity>
</application>
```

<!-- The second activity manifest entry in this example specifies that activity as the one to launch on a TV device. -->
例子中第二个activity manifest定义的activity是TV设备中的一个启动入口。

<!-- > **Caution**: If you do not include the [CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER) intent filter in your app, it is not visible to users running the Google Play store on TV devices. Also, if your app does not have this filter when you load it onto a TV device using developer tools, the app does not appear in the TV user interface. -->

> **Caution**：如果在你的应用中不包含[CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER) intent filter，它不会出现在TV设备的Google Play商店中。并且，即使你把不包含此filter的应用用开发工具装载到TV设备中，应用仍然不会出现在TV用户界面上。


<!-- If you are modifying an existing app for use on TV, your app should not use the same activity layout for TV that it does for phones and tablets. The user interface of your TV app (or TV portion of your existing app) should provide a simpler interface that can be easily navigated using a remote control from a couch. For guidelines on designing an app for TV, see the [TV Design](http://developer.android.com/design/tv/index.html) guide. For more information on the minimum implementation requirements for interface layouts on TV, see [Building TV Layouts](http://developer.android.com/training/tv/start/layouts.html). -->

如果你正在为TV设备修改现有的应用，就不应该与手机和平板用同样的activity布局。TV的用户界面（或者现有应用的TV部分）应该提供一个更简单的界面，更容易坐在沙发上用遥控器操作。TV应用设计指南，参考[TV Design](http://developer.android.com/design/tv/index.html)指导。查看TV界面布局的最低要求，参考：[Building TV Layouts](http://developer.android.com/training/tv/start/layouts.html)。


<!-- ### Declare Leanback support -->
### 声明Leanback支持

<!-- Declare that your app uses the Leanback user interface required by Android TV. If you are developing an app that runs on mobile (phones, wearables, tablets, etc.) as well as Android TV, set the required attribute value to `false`. If you set the `required` attribute value to `true`, your app will run only on devices that use the Leanback UI. -->

Android TV需要你的应用使用Leanback用户界面。如果你正在开发一个运行在移动设备（手机，可穿戴，平板等等）也包括TV的应用，设置`required`属性为`false`。因为如果设置为`true`，你的应用将仅能运行在用Leanback UI的设备上。

```java
<manifest>
    <uses-feature android:name="android.software.leanback"
        android:required="false" />
    ...
</manifest>
```

<!-- ### Declare touchscreen not required -->
### 声明不需要触屏

<!-- Applications that are intended to run on TV devices do not rely on touch screens for input. In order to make this clear, the manifest of your TV app must declare that a the android.hardware.touchscreen feature is not required. This setting identifies your app as being able to work on a TV device, and is required for your app to be considered a TV app in Google Play. The following code example shows how to include this manifest declaration: -->

运行在TV设备上的应用不依靠触屏去输入。为了清楚表明这一点，TV应用的manifest必须声明`android.hardware.touchscreen`为不需要。这个设置表明应用能够工作在TV设备上，并且也是Google Play认定你的应用为TV应用的要求。接下来的示例代码展示这个manifest声明：

```java
<manifest>
    <uses-feature android:name="android.hardware.touchscreen"
              android:required="false" />
    ...
</manifest>
```

<!-- >**Caution**: You must declare that a touch screen is not required in your app manifest, as shown this example code, or your app cannot appear in the Google Play store on TV devices. -->

>**Caution**：必须在manifest中声明触屏是不需要的，否则应用不会出现在TV设备的Google Play商店中。

<!-- ### Provide a home screen banner -->
### 提供一个主屏幕横幅

<!-- An application must provide a home screen banner for each localization if it includes a Leanback launcher intent filter. The banner is the app launch point that appears on the home screen in the apps and games rows. Desribe the banner in the manifest as follows: -->

如果应用包含一个Leanback的intent filter，它必须提供每个语言的主屏幕横幅。横幅是出现在应用和游戏栏的主屏的启动点。在manifest中这样描述横幅：

```java
<application
    ...
    android:banner="@drawable/banner" >

    ...
</application>
```

<!-- Use the [android:banner] attribute with the [application] tag to supply a default banner for all application activities, or with the [activity] tag to supply a banner for a specific activity. -->

在[`application`](http://developer.android.com/guide/topics/manifest/application.html)中添加[`android:banner`](http://developer.android.com/guide/topics/manifest/application-element.html#banner)属性为所有的应用activity提供默认的横幅，或者在特定activity的[`activity`](http://developer.android.com/guide/topics/manifest/activity-element.html)中添加横幅。

<!-- See [Banners](http://developer.android.com/design/tv/patterns.html#banner) in the UI Patterns for TV design guide. -->
在UI模式和TV设计指导中查看[Banners](http://developer.android.com/design/tv/patterns.html#banner)。


<!-- ## Add TV Support Libraries -->
## 添加TV支持库

<!-- The Android SDK includes support libraries that are intended for use with TV apps. These libraries provide APIs and user interface widgets for use on TV devices. The libraries are located in the <sdk>/extras/android/support/ directory. Here is a list of the libraries and their general purpose: -->

Android SDK包含用于TV应用的支持库。这些库为TV设备提供API和用户界面控件。这些库位于`<sdk>/extras/android/support/`目录。以下是这些库的列表和它们的作用介绍：

<!--
* [v17 leanback library](http://developer.android.com/tools/support-library/features.html#v17-leanback) - Provides user interface widgets for TV apps, particularly for apps that do media playback.
* [v7 recyclerview library](http://developer.android.com/tools/support-library/features.html#v7-recyclerview) - Provides classes for managing display of long lists in a memory efficient manner. Several classes in the v17 leanback library depend on the classes in this library.
* [v7 cardview library](http://developer.android.com/tools/support-library/features.html#v7-cardview) - Provides user interface widgets for displaying information cards, such as media item pictures and descriptions.
-->

* [v17 leanback library](http://developer.android.com/tools/support-library/features.html#v17-leanback) - 提供TV应用的用户界面控件，特别是用于媒体播放应用的控件。
* [v7 recyclerview library](http://developer.android.com/tools/support-library/features.html#v7-recyclerview) - 提供了内存高效方式的长列表的管理显示类。有一些v17 leanback库的类依赖于本库的类。
* [v7 cardview library](http://developer.android.com/tools/support-library/features.html#v7-cardview) - 提供显示信息卡的用户界面控件，如媒体图片和描述。


<!-- >**Note**: You are not required to use these support libraries for your TV app. However, we strongly recommend using them, particularly for apps that provide a media catalog browsing interface. -->

>**Note**：TV应用中可以不用这些库。但是，我们强烈推荐使用它们，特别是为应用提供媒体目录浏览界面时。


<!-- If you decide to use the v17 leanback library for your app, you should note that it is dependent on the [v4 support library](http://developer.android.com/tools/support-library/features.html#v4). This means that apps that use the leanback support library should include all of these support libraries: -->

如果我们决定用`v17 leanback library`，我们应该注意它依赖于[v4 support library](http://developer.android.com/tools/support-library/features.html#v4)。这意味着要用leanback支持库必须包含以下所有的支持库：

* v4 support library
* v7 recyclerview support library
* v17 leanback support library


<!-- The v17 leanback library contains resources, which require you to take specific steps to include it in app projects. For instructions on importing a support library with resources, see [Support Library Setup]. -->

`v17 leanback library`包含资源文件，需要你在应用中采取特定的步骤去包含它。插入带资源文件的支持库的说明，查看[Support Library Setup](http://developer.android.com/tools/support-library/setup.html#libs-with-res)。


<!-- ## Build TV Apps -->
## 创建TV应用

<!-- After you have completed the steps described above, it's time to start building apps for the big screen! Check out these additional topics to help you build your app for TV: -->

在完成上面的步骤之后，到了给大屏幕创建应用的时候了！检查一下这些额外的专题可以帮助我们创建TV应用：

<!--
* [Building TV Playback Apps](http://developer.android.com/training/tv/playback/index.html) - TVs are built to entertain, so Android provides a set of user interface tools and widgets for building TV apps that play videos and music, and let users browse for the content they want.
* [Helping Users Find Your Content on TV](http://developer.android.com/training/tv/discovery/index.html) - With all the content choices at users' fingertips, helping them find content they enjoy is almost as important as providing that content. This training discusses how to surface your content on TV devices.
* [Games for TV](http://developer.android.com/training/tv/discovery/index.html) - TV devices are a great platform for games. See this topic for information on building great game experiences for TV.
-->

* [创建TV播放应用](http://developer.android.com/training/tv/playback/index.html) - TV就是用来娱乐的，因此安卓提供了一套用户界面工具和控件，用来创建视频和音乐的TV应用，并且让用户浏览想看到的内容。
* [帮助用户找到TV内容](http://developer.android.com/training/tv/discovery/index.html) - 因为所有的内容选择都用手指操作遥控器，所以帮助用户找到想要的内容几乎和提供内容同样重要。这个主题讨论如何在TV设备中处理内容。
* [TV游戏](http://developer.android.com/training/tv/games/index.html) - TV设备是非常好的游戏平台。参考这个主题去创造更好的TV游戏体验。

<!-- ## Run TV Apps -->
## 运行TV应用

<!-- Running your app is an important part of the development process. The AVD Manager in the Android SDK provides the device definitions that allow you to create virtual TV devices for running and testing your applications. -->

运行应用是在开发过程中的一个重要的部分。在安卓SDK中的AVD管理器提供了创建虚拟TV设备的功能，可以让应用在虚拟设备中运行和测试。

<!-- To create an virtual TV device: -->
创建一个虚拟TV设备

<!--
1. Start the AVD Manager. For more information, see the AVD Manager help.
2. In the AVD Manager dialog, click the Device Definitions tab.
3. Select one of the Android TV device definitions and click Create AVD.
4. Select the emulator options and click OK to create the AVD.
-->

1. 打开AVD管理器。更多信息，参考[AVD管理器](http://developer.android.com/tools/help/avd-manager.html)帮助。
2. 在AVD管理器窗口，点击**Device Definitions**标签。
3. 选择一个Android TV设备描述，并且点击**Create AVD**。
4. 选择模拟器选项并且点击**OK**创建AVD。

<!-- >**Note**: For best performance of the TV emulator device, enable the Use Host GPU option and, where supported, use virtual device acceleration. For more information on hardware acceleration of the emulator, see [Using the Emulator](http://developer.android.com/tools/devices/emulator.html#acceleration). -->

>**Note**：获得TV模拟器设备的最佳性能，打开**Use Host GPU option**，支持虚拟设备加速。更多模拟器硬件加速信息，参考[Using the Emulator](http://developer.android.com/tools/devices/emulator.html#acceleration)。

<!-- To test your application on the virtual TV device: -->
在虚拟设备中测试应用

<!--
1. Compile your TV application in your development environment.
2. Run the application from your development environment and choose the TV virtual device as the target.
-->

1. 在开发环境中编译TV应用。
2. 从开发环境中运行应用并选择目标为TV虚拟设备。


<!-- For more information about using emulators see, [Using the Emulator](http://developer.android.com/tools/devices/emulator.html). For more information on deploying apps from Android Studio to virtual devices, see [Debugging with Android Studio](http://developer.android.com/sdk/installing/studio-debug.html). For more information about deploying apps to emulators from Eclipse with ADT, see [Building and Running from Eclipse with ADT ](http://developer.android.com/tools/building/building-eclipse.html) -->

更多模拟器信息：[Using the Emulator](http://developer.android.com/tools/devices/emulator.html)。 用Android Studio部署应用到模拟器，查看[Debugging with Android Studio](http://developer.android.com/sdk/installing/studio-debug.html)。用带ADT插件的Eclipse部署应用到模拟器，查看[Building and Running from Eclipse with ADT ](http://developer.android.com/tools/building/building-eclipse.html)。

-------------------------
[下一节: 处理TV硬件 >](hardware.html)
