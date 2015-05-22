# 提供配置 Activity

> 编写:[heray1990](https://github.com/heray1990) - 原文: <http://developer.android.com/training/wearables/watch-faces/configuration.html>

当用户安装一个包含表盘的可穿戴应用的手持式应用时，它们可以在手持式设备上的 Android Wear 配套应用和在可穿戴设备上的表盘选择器中使用。用户可以在配套应用上或者在可穿戴设备的表盘选择器上选择使用哪个表盘。

一些表盘提供配置参数，让用户客制化表盘的外观和行为。例如，一些表盘让用户选择自定义的背景颜色，另一些表盘提供两个不同时区的时间，使得用户可以选择感兴趣的时区。

提供配置参数的表盘让用户通过可穿戴应用的一个 activity、手持应用的一个 activity或者两者的 activity 来客制化表盘。用户可以启动可穿戴设备上的可穿戴配置 activity，他们也可以启动 Android Wear 配套应用的配套配置 activity。

Android SDK 中 *WatchFace* 示例的数字表盘介绍了如何实现手持式和可穿戴配置 activity 和如何应配置变化而更新表盘。这个示例位于 `android-sdk/samples/android-21/wearable/WatchFace` 目录。

<a name="Intent"></a>
## 指定配置 activity 的 Intent

如果表盘包括配置的 activity，那么添加下面的元数据项到可穿戴应用 manifest 文件的服务声明部分：

```xml
<service
    android:name=".DigitalWatchFaceService" ... />
    <!-- companion configuration activity -->
    <meta-data
        android:name=
           "com.google.android.wearable.watchface.companionConfigurationAction"
        android:value=
           "com.example.android.wearable.watchface.CONFIG_DIGITAL" />
    <!-- wearable configuration activity -->
    <meta-data
        android:name=
           "com.google.android.wearable.watchface.wearableConfigurationAction"
        android:value=
           "com.example.android.wearable.watchface.CONFIG_DIGITAL" />
    ...
</service>
```

在应用的包名之前定义这些元数据项的值。配置 activity 为这个 intent 注册 intent filters，然后系统在用户想配置表盘时启动这个 intent。

如果表盘只包括一个配套或者可穿戴配置 activity，那么我们只需要包括上述例子响应的元数据项。

## 创建可穿戴配置 activity

可穿戴配置 activity 提供了有限组表盘客制化选择，这是因为复杂的菜单在小屏幕上很难导航。我们的可穿戴配置 activity 应该提供二元选择和很少的选项来客制化表盘主要的方面。

为了创建一个可穿戴配置 activity，添加一个新的 activity 到可穿戴应用并且在可穿戴应用的 manifest 文件中声明下面的 intent filter：

```xml
<activity
    android:name=".DigitalWatchFaceWearableConfigActivity"
    android:label="@string/digital_config_name">
    <intent-filter>
        <action android:name=
            "com.example.android.wearable.watchface.CONFIG_DIGITAL" />
        <category android:name=
        "com.google.android.wearable.watchface.category.WEARABLE_CONFIGURATION" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```

这个 intent filter 的 action 的名字必须与之前在[指定配置 activity 的 Intent](#Intent)定义的 intent 名字一样。

在我们的配置 activity 中，构建一个简单的 UI 为用户提供选择来客制化表盘。当用户做出选择时，使用[可穿戴数据层 API](http://hukai.me/android-training-course-in-chinese/wearables/data-layer/index.html)传达配置的变化给表盘 activity。

更多详细内容，请见 *WatchFace* 示例中的 `DigitalWatchFaceWearableConfigActivity` 和 `DigitalWatchFaceUtil` 类。

## 创建配套配置 activity
配套配置 activity 让用户可以访问全套表盘客制化选择，这是因为在手持式设备更大的屏幕上，用户更加容易与复杂的菜单互动。例如，手持设备上的一个配置 activity 向用户显示复杂的颜色选择器，让用户从该选择器中选择表盘的背景颜色。

为了创建配套配置 activity，添加一个新的 activity 到手持应用并且在手持应用的 manifest 文件中声明下面的 intent filter：

```xml
<activity
    android:name=".DigitalWatchFaceCompanionConfigActivity"
    android:label="@string/app_name">
    <intent-filter>
        <action android:name=
            "com.example.android.wearable.watchface.CONFIG_DIGITAL" />
        <category android:name=
        "com.google.android.wearable.watchface.category.COMPANION_CONFIGURATION" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```

在我们的配置 activity 中，构建一个 UI 为用户提供选项来客制化表盘所有的可配置组件。当用户做出选择时，使用[可穿戴数据层 API](http://hukai.me/android-training-course-in-chinese/wearables/data-layer/index.html)传达配置的变化给表盘 activity。

更多详细内容，请见 *WatchFace* 示例中的 `DigitalWatchFaceCompanionConfigActivity` 类。

## 在可穿戴应用中创建一个监听器服务

为了接收配置 activity 中已更新的配置参数，需要在可穿戴应用创建一个服务来实现[可穿戴数据层 API](http://hukai.me/android-training-course-in-chinese/wearables/data-layer/index.html) 的 `WearableListenerService` 接口。我们的表盘实现可以在配置参数改变时重新绘制表盘。

更多详细内容，请见 *WatchFace* 示例的 `DigitalWatchFaceConfigListenerService` 和 `DigitalWatchFaceService` 类。