# 适配不同的系统版本

> 编写:[Lin-H](http://github.com/Lin-H) - 原文:<http://developer.android.com/training/basics/supporting-devices/platforms.html>

新的Android版本会为我们的app提供更棒的APIs，但我们的app仍应支持旧版本的Android，直到更多的设备升级到新版本为止。这节课程将展示如何在利用新的APIs的同时仍支持旧版本Android。

[Platform Versions](http://developer.android.com/about/dashboards/index.html)的控制面板会定时更新，通过统计访问Google Play Store的设备数量，来显示运行每个版本的安卓设备的分布。一般情况下，在更新app至最新Android版本时，最好先保证新版的app可以支持90%的设备使用。

> **Tip**:为了能在几个Android版本中都能提供最好的特性和功能，应该在我们的app中使用[Android Support Library](https://developer.android.com/tools/support-library/index.html)，它能使我们的app能在旧平台上使用最近的几个平台的APIs。

## 指定最小和目标API级别

[AndroidManifest.xml](https://developer.android.com/guide/topics/manifest/manifest-intro.html)文件中描述了我们的app的细节及app支持哪些Android版本。具体来说，[`<uses-sdk>`](https://developer.android.com/guide/topics/manifest/uses-sdk-element.html)元素中的`minSdkVersion`和`targetSdkVersion` 属性，标明在设计和测试app时，最低兼容API的级别和最高适用的API级别(这个最高的级别是需要通过我们的测试的)。例如：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" ... >
    <uses-sdk android:minSdkVersion="4" android:targetSdkVersion="15" />
    ...
</manifest>
```

随着新版本Android的发布，一些风格和行为可能会改变，为了能使app能利用这些变化，而且能适配不同风格的用户的设备，我们应该将`targetSdkVersion`的值尽量的设置与最新可用的Android版本匹配。

## 运行时检查系统版本

Android在[Build](https://developer.android.com/reference/android/os/Build.html)常量类中提供了对每一个版本的唯一代号，在我们的app中使用这些代号可以建立条件，保证依赖于高级别的API的代码，只会在这些API在当前系统中可用时，才会执行。

```java
private void setUpActionBar() {
    // Make sure we're running on Honeycomb or higher to use ActionBar APIs
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
        ActionBar actionBar = getActionBar();
        actionBar.setDisplayHomeAsUpEnabled(true);
    }
}
```

> **Note**:当解析XML资源时，Android会忽略当前设备不支持的XML属性。所以我们可以安全地使用较新版本的XML属性，而不需要担心旧版本Android遇到这些代码时会崩溃。例如如果我们设置`targetSdkVersion="11"`，app会在Android 3.0或更高时默认包含[ActionBar](https://developer.android.com/reference/android/app/ActionBar.html)。然后添加menu items到action bar时，我们需要在自己的menu XML资源中设置`android:showAsAction="ifRoom"`。在跨版本的XML文件中这么做是安全的，因为旧版本的Android会简单地忽略`showAsAction`属性(就是这样，你并不需要用到`res/menu-v11/`中单独版本的文件)。

## 使用平台风格和主题

Android提供了用户体验主题，为app提供基础操作系统的外观和体验。这些主题可以在manifest文件中被应用于app中。通过使用内置的风格和主题，我们的app自然地随着Android新版本的发布，自动适配最新的外观和体验.

使activity看起来像对话框:

```xml
<activity android:theme="@android:style/Theme.Dialog">
```

使activity有一个透明背景:

```xml
<activity android:theme="@android:style/Theme.Translucent">
```

应用在`/res/values/styles.xml`中定义的自定义主题:

```xml
<activity android:theme="@style/CustomTheme">
```

使整个app应用一个主题(全部activities)在[<application\\>](https://developer.android.com/guide/topics/manifest/application-element.html)元素中添加`android:theme`属性:

```xml
<application android:theme="@style/CustomTheme">
```

更多关于创建和使用主题，详见[Styles and Themes](https://developer.android.com/guide/topics/ui/themes.html)。
