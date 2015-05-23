# 构建表盘服务

> 编写:[heray1990](https://github.com/heray1990) - 原文: <http://developer.android.com/training/wearables/watch-faces/service.html>

Android Wear 的表盘在可穿戴应用中实现为[服务（services）](http://developer.android.com/guide/components/services.html)和包。当用户安装一个包含表盘的可穿戴应用的手持式应用时，这些表盘在手持式设备的 [Android Wear 配套应用](https://play.google.com/store/apps/details?id=com.google.android.wearable.app&hl=en)和可穿戴表盘选择器中可用。当用户选择一个可用的表盘时，可穿戴设备会显示表盘并且按需要调用它的服务毁掉方法。

这节课介绍如何配置包含表盘的 Android 工程和如何实现表盘服务。

## 创建并配置工程

在 Android Studio 中为表盘创建一个 Android 工程，需要：

1. 打开 Android Studio。
2. 创建一个新的工程：
	* 如果没有打开过任何工程，那么在 **Welcome** 界面中点击 **New Project**。
	* 如果已经打开过工程，那么在 **File** 菜单中选择 **New Project**。
3. 填写应用名字，然后点击 **Next**。
4. 选择 **Phone and Tablet** 尺寸系数。
5. 在 **Minimum SDK** 下拉菜单选择 API 18。
6. 选择 **Wear** 尺寸系数。
7. 在 **Minimum SDK** 下拉菜单选择 API 21，然后点击 **Next**。
8. 选择 **Add No Activity** 然后在接下来的两个界面点击 **Next** 。
9. 点击 **Finish**。
10. 在 IDE 窗口点击 **View > Tool Windows > Project**。

至此，Android Studio 创建了一个含有 `wear` 和 `mobile` 模块的工程。更多关于创建工程的内容，请见 [Creating a Project](http://developer.android.com/sdk/installing/create-project.html)。

### 依赖

Wearable Support 库提供了必要的类，我们可以继承这些类来创建表盘的实现。需要用Google Play services client 库（`play-services` 和 `play-services-wearable`）在配套设备和含有[可穿戴数据层 API](http://hukai.me/android-training-course-in-chinese/wearables/data-layer/index.html) 的可穿戴应用之间同步数据项。

当我们按照上述的方法创建工程时，Android Studio 会自动添加需要的条目到 `build.gradle` 文件。

### Wearable Support 库 API 参考资源

该参考文档提供了用于实现表盘的详细信息。详见 [API 参考文档](http://developer.android.com/reference/android/support/wearable/watchface/package-summary.html)。

### 在 Eclipse ADT 中下载 Wearable Support 库

如果你使用 Eclipse ADT，那么请下载 [Wearable Support 库](http://developer.android.com/shareables/training/wearable-support-lib.zip) 并且将该库作为依赖包含在你的工程当中。

### 声明权限

表盘需要 `PROVIDE_BACKGROUND` 和 `WAKE_LOCK` 权限。在可穿戴和手持式应用的 manifest 文件中 `manifest` 节点下添加如下权限：

```xml
<manifest ...>
    <uses-permission
        android:name="com.google.android.permission.PROVIDE_BACKGROUND" />
    <uses-permission
        android:name="android.permission.WAKE_LOCK" />
    ...
</manifest>
```

> **Caution:** 手持式应用必须包括所有在可穿戴应用中声明的权限。

## 实现服务和回调方法

Android Wear 的表盘实现为[服务(services)](http://developer.android.com/guide/components/services.html)。当表盘处于活动状态时，系统会在时间改变或者出现重要的时间（如切换到环境模式或者接收到一个新的通知）的时候调用服务的方法。服务实现接着根据更新的时间和其它相关的数据将表盘绘制到屏幕上。

实现一个表盘，我们需要继承 `CanvasWatchFaceService` 和 `CanvasWatchFaceService.Engine` 类，然后重写 `CanvasWatchFaceService.Engine` 类的回调方法。这些类都包含在 Wearable Support 库里。

下面的代码片段略述了我们需要实现的主要方法：

```java
public class AnalogWatchFaceService extends CanvasWatchFaceService {

    @Override
    public Engine onCreateEngine() {
        /* provide your watch face implementation */
        return new Engine();
    }

    /* implement service callback methods */
    private class Engine extends CanvasWatchFaceService.Engine {

        @Override
        public void onCreate(SurfaceHolder holder) {
            super.onCreate(holder);
            /* initialize your watch face */
        }

        @Override
        public void onPropertiesChanged(Bundle properties) {
            super.onPropertiesChanged(properties);
            /* get device features (burn-in, low-bit ambient) */
        }

        @Override
        public void onTimeTick() {
            super.onTimeTick();
            /* the time changed */
        }

        @Override
        public void onAmbientModeChanged(boolean inAmbientMode) {
            super.onAmbientModeChanged(inAmbientMode);
            /* the wearable switched between modes */
        }

        @Override
        public void onDraw(Canvas canvas, Rect bounds) {
            /* draw your watch face */
        }

        @Override
        public void onVisibilityChanged(boolean visible) {
            super.onVisibilityChanged(visible);
            /* the watch face became visible or invisible */
        }
    }
}
```

> **Note:** Android SDK 里的 *WatchFace* 示例示范了如何通过继承 `CanvasWatchFaceService ` 类来实现模拟和数字表盘。这个示例位于 `android-sdk/samples/android-21/wearable/WatchFace` 目录。

`CanvasWatchFaceService` 类提供一个类似 [View.invalidate()](http://developer.android.com/reference/android/view/View.html#invalidate()) 方法的销毁机制。当我们想要系统重新绘制表盘时，我们可以在实现中调用 `invalidate()` 方法。在主 UI 线程中，我们可以只用 `invalidate()` 方法。然后调用 `postInvalidate()` 方法从其它的的线程中销毁画布。

更多关于实现 `CanvasWatchFaceService.Engine` 类的方法，请见[绘制表盘](drawing.html)。

## 注册表盘服务

实现完表盘服务之后，我们需要在可穿戴应用的 manifest 文件中注册该实现。当用户安装此应用时，系统会使用关于服务的信息，使得可穿戴设备上 Android Wear 配套应用和表盘选择器里的表盘可用。

下面的代码片段介绍了如何在 [application](http://developer.android.com/guide/topics/manifest/application-element.html) 节点下注册一个表盘实现：

```xml
<service
    android:name=".AnalogWatchFaceService"
    android:label="@string/analog_name"
    android:allowEmbedded="true"
    android:taskAffinity=""
    android:permission="android.permission.BIND_WALLPAPER" >
    <meta-data
        android:name="android.service.wallpaper"
        android:resource="@xml/watch_face" />
    <meta-data
        android:name="com.google.android.wearable.watchface.preview"
        android:resource="@drawable/preview_analog" />
    <meta-data
        android:name="com.google.android.wearable.watchface.preview_circular"
        android:resource="@drawable/preview_analog_circular" />
    <intent-filter>
        <action android:name="android.service.wallpaper.WallpaperService" />
        <category
            android:name=
            "com.google.android.wearable.watchface.category.WATCH_FACE" />
    </intent-filter>
</service>
```

当向用户展示所有安装在可穿戴设备的表盘时，设备上的Android Wear 配套应用和表盘选择器使用 `com.google.android.wearable.watchface.preview` 元数据项定义的预览图。为了取得这个 drawable，可以运行 Android Wear 设备或者模拟器上的表盘并截图。在 hdpi 屏幕的 Android Wear 设备上，预览图像一般是 320x320 像素。

圆形设备上看起来非常不同的表盘可以提供圆形和方形的预览图。使用 `com.google.android.wearable.watchface.preview` 元数据项指定一个圆形的预览图。如果一个表盘包含两种预览图，可穿戴应用上的配套应用和表盘选择器会根据手表的形状选择适合的预览图。如果没有包含圆形的预览图，那么方形和圆形的设备都会用方形的预览图。对于圆形的设备，方形的预览图会被一个圆形剪裁掉。

`android.service.wallpaper` 元数据项指定包含 `wallpaper` 节点的 `watch_face.xml` 资源文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<wallpaper xmlns:android="http://schemas.android.com/apk/res/android" />
```

我们的可穿戴应用可以包含多个表盘。我们必须为每个表盘实现添加一个服务节点到可穿戴应用的 manifest 文件中。