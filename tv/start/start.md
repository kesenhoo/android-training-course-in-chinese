# 创建TV应用的第一步

> 编写:[awong1900](https://github.com/awong1900) - 原文:<http://developer.android.com/training/tv/start/start.html>

TV应用使用与手机和平板同样的架构。 这种相似性意味着你可以修改现有的应用到TV设备或者用以前开发安卓应用的经验用于TV应用。

>**Important**: 在Google Play中的TV应用应满足这些特定要求。更多信息, 参考[TV App Quality](http://developer.android.com/distribute/essentials/quality/tv.html)中的要求列表。

本课程介绍如何准备您的开发环境构建电视应用,和所需的最小变化使应用能够运行在TV设备。

## 创建一个TV项目

本节讨论如何修改现有的应用程序运行在电视设备,或创建一个新的。创建在TV设备运行的应用所需要的主要的组件:

* **Activity for TV** (必须) - 在application manifest中, 声明一个可在TV设备上运行的activity。
* **TV Support Libraries** (可选) - 有几个支持库[Support Libraries](http://developer.android.com/training/tv/start/start.html#tv-libraries) 提供widgets用于TV设备界面的布局。

### 前提条件

在创建TV应用前, 必须做以下事情:

- [Update your SDK tools to version 24.0.0 or higher](http://developer.android.com/sdk/installing/adding-packages.html#GetTools)  
SDK tools 确保能编译和测试TV应用

- [Update your SDK with Android 5.0 (API 21) or higher](http://developer.android.com/sdk/installing/adding-packages.html#GetTools)  
platform 提供TV应用的APIs

- [Create or update your app project](http://developer.android.com/sdk/installing/create-project.html)  
为了能适应支持TV的新APIs, 创建新项目或者修改原项目为Android 5.0 (API level 21)或者更高。

### 声明一个TV Activity

<!-- An application intended to run on TV devices must declare a launcher activity for TV in its manifest using a [CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER) intent filter. This filter identifies your app as being enabled for TV, and is required for your app to be considered a TV app in Google Play. Declaring this intent also identifies which activity in your app to launch when a user selects its icon on the TV home screen. -->

一个应用activity想要运行在TV设备中，必须在它的manifest中定义一个启动activity，用intent filter包含[CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER)。这个filter表明你的应用是在TV上可用，并且Google Play上发布TV应用所必须。定义这个intent也意味着在TV主屏幕显示图标，可以被用户选择启动。

<!-- The following code snippet shows how to include this intent filter in your manifest: -->

接下来的代码片段显示如何在manifest中包含intent filter：

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

例子中第二个activity清单是TV设备中另一个启动入口。

<!-- > **Caution**: If you do not include the [CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER) intent filter in your app, it is not visible to users running the Google Play store on TV devices. Also, if your app does not have this filter when you load it onto a TV device using developer tools, the app does not appear in the TV user interface. -->

> **Caution**：如果在你的应用中不包含[CATEGORY_LEANBACK_LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LEANBACK_LAUNCHER) intent filter，会导致用户在Google Play的TV设备应用中找不到。并且，即使你把不包含此filter的应用用开发工具装载到TV设备中，用户仍然不能在TV用户界面看到此应用。

<!-- If you are modifying an existing app for use on TV, your app should not use the same activity layout for TV that it does for phones and tablets. The user interface of your TV app (or TV portion of your existing app) should provide a simpler interface that can be easily navigated using a remote control from a couch. For guidelines on designing an app for TV, see the [TV Design](http://developer.android.com/design/tv/index.html) guide. For more information on the minimum implementation requirements for interface layouts on TV, see [Building TV Layouts](http://developer.android.com/training/tv/start/layouts.html). -->

如果你正在为TV设备修改现有的应用，不应该用与手机和平板同样的activity布局。TV的用户界面（或者现有应用的TV部分）应该提供一个更简单的界面，更容易坐在沙发上用遥控器导航。TV应用设计指南，参考[TV Design](http://developer.android.com/design/tv/index.html)指导。TV的用户界面布局的最小要求，更多信息：[Building TV Layouts](http://developer.android.com/training/tv/start/layouts.html)。

<!-- ### Declare Leanback support -->

### 定义Leanback支持

<!-- Declare that your app uses the Leanback user interface required by Android TV. If you are developing an app that runs on mobile (phones, wearables, tablets, etc.) as well as Android TV, set the required attribute value to `false`. If you set the `required` attribute value to `true`, your app will run only on devices that use the Leanback UI. -->

安卓TV需要你的应用使用Leanback用户界面。如果你正开发一个运行在移动设备（手机，可穿戴，平板等等）以及安卓TV的应用，设置required属性为`false`。因为如果设置为`true`，你的应用仅能运行在支持Leanback UI的设备上。

```java
<manifest>
    <uses-feature android:name="android.software.leanback"
        android:required="false" />
    ...
</manifest>
```

<!-- ### Declare touchscreen not required -->

### 定义触屏不被需要

<!-- Applications that are intended to run on TV devices do not rely on touch screens for input. In order to make this clear, the manifest of your TV app must declare that a the android.hardware.touchscreen feature is not required. This setting identifies your app as being able to work on a TV device, and is required for your app to be considered a TV app in Google Play. The following code example shows how to include this manifest declaration: -->

运行在TV设备上的应用不依靠触屏去输入。为了清楚表明这一点，TV应用的manifest必须定义`android.hardware.touchscreen`不需要。这个设置确定应用能够工作在TV设备上，并且也是Google Play认定你的应用为TV应用的要求。接下来的示例代码展示这个manifest定义：

```java
<manifest>
    <uses-feature android:name="android.hardware.touchscreen"
              android:required="false" />
    ...
</manifest>
```

<!-- >**Caution**: You must declare that a touch screen is not required in your app manifest, as shown this example code, or your app cannot appear in the Google Play store on TV devices. -->

>**Caution**：必须在manifest中定义触屏是不需要的，否则应用不会出现在TV设备的Google Play中。

<!-- ### Provide a home screen banner -->

### 提供一个主屏幕横幅

<!-- An application must provide a home screen banner for each localization if it includes a Leanback launcher intent filter. The banner is the app launch point that appears on the home screen in the apps and games rows. Desribe the banner in the manifest as follows: -->

如果支持Leanback intent filter，应用必须提供每个本地化的主屏幕横幅。横幅是应用和游戏栏的主屏应用的启动点。在manifest中描述横幅：

```java
<application
    ...
    android:banner="@drawable/banner" >

    ...
</application>
```

<!-- Use the [android:banner](http://developer.android.com/guide/topics/manifest/application-element.html#banner) attribute with the [application](http://developer.android.com/guide/topics/manifest/application.html) tag to supply a default banner for all application activities, or with the [activity](http://developer.android.com/guide/topics/manifest/activity-element.html) tag to supply a banner for a specific activity. -->

在[`application`](http://developer.android.com/guide/topics/manifest/application.html)中添加[`android:banner`](http://developer.android.com/guide/topics/manifest/application-element.html#banner)属性为所有的应用activity提供默认的横幅，或者在特定的activity的[`activity`](http://developer.android.com/guide/topics/manifest/activity-element.html)中添加横幅。

<!-- See [Banners](http://developer.android.com/design/tv/patterns.html#banner) in the UI Patterns for TV design guide. -->

在UI模式和TV设计指导中查看[Banners](http://developer.android.com/design/tv/patterns.html#banner)。

## Add TV Support Libraries
## 添加TV支持库

The Android SDK includes support libraries that are intended for use with TV apps. These libraries provide APIs and user interface widgets for use on TV devices. The libraries are located in the <sdk>/extras/android/support/ directory. Here is a list of the libraries and their general purpose:

* [v17 leanback library](http://developer.android.com/tools/support-library/features.html#v17-leanback) - Provides user interface widgets for TV apps, particularly for apps that do media playback.
* [v7 recyclerview library](http://developer.android.com/tools/support-library/features.html#v7-recyclerview) - Provides classes for managing display of long lists in a memory efficient manner. Several classes in the v17 leanback library depend on the classes in this library.
* [v7 cardview library](http://developer.android.com/tools/support-library/features.html#v7-cardview) - Provides user interface widgets for displaying information cards, such as media item pictures and descriptions.

>**Note**: You are not required to use these support libraries for your TV app. However, we strongly recommend using them, particularly for apps that provide a media catalog browsing interface.

If you decide to use the v17 leanback library for your app, you should note that it is dependent on the [v4 support library](http://developer.android.com/tools/support-library/features.html#v4). This means that apps that use the leanback support library should include all of these support libraries:

* v4 support library
* v7 recyclerview support library
* v17 leanback support library

The v17 leanback library contains resources, which require you to take specific steps to include it in app projects. For instructions on importing a support library with resources, see [Support Library Setup]((http://developer.android.com/tools/support-library/setup.html#libs-with-res)).

## Build TV Apps
## 编译TV应用

After you have completed the steps described above, it's time to start building apps for the big screen! Check out these additional topics to help you build your app for TV:

* [Building TV Playback Apps](http://developer.android.com/training/tv/playback/index.html) - TVs are built to entertain, so Android provides a set of user interface tools and widgets for building TV apps that play videos and music, and let users browse for the content they want.
* [Helping Users Find Your Content on TV](http://developer.android.com/training/tv/discovery/index.html) - With all the content choices at users' fingertips, helping them find content they enjoy is almost as important as providing that content. This training discusses how to surface your content on TV devices.
* [Games for TV](http://developer.android.com/training/tv/discovery/index.html) - TV devices are a great platform for games. See this topic for information on building great game experiences for TV.

## Run TV Apps
## 运行TV应用

<!-- Running your app is an important part of the development process. The AVD Manager in the Android SDK provides the device definitions that allow you to create virtual TV devices for running and testing your applications. -->

在开发过程中运行应用是一个重要的部分。在安卓SDK中的AVD管理器提供了允许创建虚拟TV设备的功能，可以让应用在虚拟设备中运行和测试。

<!-- To create an virtual TV device: -->  

创建一个虚拟TV设备  

1. Start the AVD Manager. For more information, see the AVD Manager help.  
2. In the AVD Manager dialog, click the Device Definitions tab.  
3. Select one of the Android TV device definitions and click Create AVD.  
4. Select the emulator options and click OK to create the AVD.   

>**Note**: For best performance of the TV emulator device, enable the Use Host GPU option and, where supported, use virtual device acceleration. For more information on hardware acceleration of the emulator, see [Using the Emulator](http://developer.android.com/tools/devices/emulator.html#acceleration).    

<!-- To test your application on the virtual TV device: -->  

在虚拟设备中测试应用

1. Compile your TV application in your development environment.
2. Run the application from your development environment and choose the TV virtual device as the target.

For more information about using emulators see, [Using the Emulator](http://developer.android.com/tools/devices/emulator.html). For more information on deploying apps from Android Studio to virtual devices, see [Debugging with Android Studio](http://developer.android.com/sdk/installing/studio-debug.html). For more information about deploying apps to emulators from Eclipse with ADT, see [Building and Running from Eclipse with ADT](http://developer.android.com/tools/building/building-eclipse.html).