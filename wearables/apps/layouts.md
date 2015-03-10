# 创建自定义的布局

> 编写: [kesenhoo](https://github.com/kesenhoo) - 原文: <http://developer.android.com/training/wearables/apps/layouts.html>

为可穿戴设备创建布局是和手持设备是一样的。但是 不要期望通过搬迁手持应用的功能与UI到可穿戴上会有一个好的用户体验。仅仅在有需要的时候，你才应该创建自定义的布局。请参考可穿戴设备的[design guidelines](http://developer.android.com/design/wear/index.html)学习如何设计一个优秀的可穿戴应用。

<a name="CustomNotification"></a>
## 创建自定义Notification

通常来说，你应该在手持应用上创建好notification，然后让它自动同步到可穿戴设备上。这使得你只需要创建一次notification，然后可以在不同类型的设备(不仅仅是可穿戴设备，也包含车载设备与电视)上进行显示，免去为不同设备进行重新设计。

如果标准的notification风格无法满足你的需求(例如[NotificationCompat.BigTextStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigTextStyle.html) 或者 [NotificationCompat.InboxStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.InboxStyle.html))，你可以使用activity，显示一个自定义的布局来达到目的。在可穿戴设备上你只可以创建并处理自定义的notification，同时系统无法为这些notification同步到手持设备上。

**Note:**当在可穿戴设备上创建自定义的notification时，你可以使用API Level 20上标准的APIs，不需要使用Support Library。

为了创建自定义的notification，步骤如下：

1. 创建布局并设置这个布局为需要显示的activity的content view:
```java
public void onCreate(Bundle bundle){
    ...
    setContentView(R.layout.notification_activity);
}
```
2. 为了使得activity能够显示在可穿戴设备上，需要在manifest文件中为activity定义必须的属性。你需要把activity声明为exportable，embeddable以及拥有一个空的task affinity。我们也推荐把activity的主题设置为` Theme.DeviceDefault.Light`。例如：
```xml
<activity android:name="com.example.MyDisplayActivity"
     android:exported="true"
     android:allowEmbedded="true"
     android:taskAffinity=""
     android:theme="@android:style/Theme.DeviceDefault.Light" />
```
3. 为activity创建[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)，例如：：
```java
Intent notificationIntent = new Intent(this, NotificationActivity.class);
PendingIntent notificationPendingIntent = PendingIntent.getActivity(this, 0, notificationIntent,
        PendingIntent.FLAG_UPDATE_CURRENT);
```
4. 创建[Notification](http://developer.android.com/reference/android/app/Notification.html)并执行[setDisplayIntent()](http://developer.android.com/reference/android/app/Notification.WearableExtender.html#setDisplayIntent(android.app.PendingIntent))方法，参数是前面创建的PendingIntent。当用户查看这个notification时，系统使用这个PendingIntent来启动activity。
5. 触发notification使用[notify()](http://developer.android.com/reference/java/lang/Object.html#notify())的方法。

> **Note:** 当notification呈现在主页时，系统会根据notification的语义，使用一个标准的模板来呈现它。这个模板可以在所有的表盘上进行显示。当用户往上滑动notification时，将会看到为这个notification准备的自定义的activity。

## 使用Wearable UI库创建布局

当你使用Android Studio的引导功能创建一个Wearable应用的时候，会自动包含一个非官方的UI库文件。你也可以通过给build.gradle文件添加下面的依赖声明把库文件添加到项目：
```xml
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'com.google.android.support:wearable:+'
    compile 'com.google.android.gms:play-services-wearable:+'
}
```
这个库文件帮助你建立你设计的UI。下面是一些主要的类：
* **BoxInsetLayout** - 一个能够感知屏幕的形状并把子控件居中摆放的FrameLayout，。
* **CardFragment** - 一个能够可拉伸，垂直可滑动卡片的fragment。
* **CircledImageView** - 一个圆形的image view。
* **ConfirmationActivity** - 一个在用户完成一个操作之后用来显示确认动画的activity。* **DismissOverlayView** - 一个用来实现长按消失的View。
* **GridViewPager** - 一个可以横向与纵向滑动的局部控制器。你需要提供一个GridPagerAdapter用来生成显示页面的数据。
* **GridPagerAdapter** - 一个提供给GridViewPager显示页面的适配器。
* **FragmentGridPagerAdapter** - 一个为每个页面提供单独的fragment的适配器。
* **WatchViewStub** - 一个可以根据屏幕的形状生成特定布局的类。
* **WearableListView** - 一个针对可穿戴设备优化过后的ListView。它会垂直的显示列表内容，并在用户停止滑动时自动显示最靠近的Item。

> [点击下载完整的API说明文档](http://developer.android.com/shareables/training/wearable-support-docs.zip) 这个文档会详细的介绍每一个UI组件。

