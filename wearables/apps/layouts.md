# 创建自定义的布局

> 编写: [kesenhoo](https://github.com/kesenhoo) - 原文: <http://developer.android.com/training/wearables/apps/layouts.html>

为可穿戴设备创建布局是和手持设备是一样的，除了我们需要为屏幕的尺寸和glanceability进行设计。但是不要期望通过搬迁手持应用的功能与UI到可穿戴上会有一个好的用户体验。仅仅在有需要的时候，我们才应该创建自定义的布局。请参考可穿戴设备的[design guidelines](http://developer.android.com/design/wear/index.html)学习如何设计一个优秀的可穿戴应用。

<a name="CustomNotification"></a>
## 创建自定义Notification

通常来说，我们应该在手持应用上创建好notification，然后让它自动同步到可穿戴设备上。这让我们只需要创建一次notification，然后可以在不同类型的设备(不仅仅是可穿戴设备，也包含车载设备与电视)上进行显示，免去为不同设备进行重新设计。

如果标准的notification风格无法满足我们的需求(例如[NotificationCompat.BigTextStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigTextStyle.html) 或者 [NotificationCompat.InboxStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.InboxStyle.html))，我们可以显示一个使用自定义布局的activity。我们只可以在可穿戴设备上创建并处理自定义的notification，同时系统不会将这些notification同步到手持设备上。

**Note:** 当在可穿戴设备上创建自定义的notification时，我们可以使用标准notification API（API Level 20），不需要使用Support Library。

为了创建自定义的notification，步骤如下：

1. 创建布局并设置这个布局为需要显示的activity的content view:
```java
public void onCreate(Bundle bundle){
    ...
    setContentView(R.layout.notification_activity);
}
```
2. 为了使得activity能够显示在可穿戴设备上，需要在manifest文件中为activity定义必须的属性。我们需要把activity声明为exportable，embeddable以及拥有一个空的task affinity。我们也推荐把activity的主题设置为` Theme.DeviceDefault.Light`。例如：
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
5. 使用[notify()](http://developer.android.com/reference/java/lang/Object.html#notify())方法触发notification。

> **Note:** 当notification呈现在主页时，系统会根据notification的语义，使用一个标准的模板来呈现它。这个模板可以在所有的表盘上进行显示。当用户往上滑动notification时，将会看到为这个notification准备的自定义的activity。

<a name="UiLibrary"></a>
## 使用Wearable UI库创建布局

当我们使用Android Studio的工程向导创建一个Wearable应用的时候，会自动包含Wearable UI库。你也可以通过给`build.gradle`文件添加下面的依赖声明把库文件添加到项目：

```xml
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'com.google.android.support:wearable:+'
    compile 'com.google.android.gms:play-services-wearable:+'
}
```

这个库文件帮助我们建立为可穿戴设备设计的UI。更详细的介绍请看[为可穿戴设备创建自定义UI](http://hukai.me/android-training-course-in-chinese/wearables/ui/index.html)。

下面是一些Wearable UI库中主要的类：

* **BoxInsetLayout** - 一个能够感知屏幕的形状并把子控件居中摆放在一个圆形屏幕的FrameLayout。
* **CardFragment** - 一个能够可拉伸，垂直可滑动卡片的fragment。
* **CircledImageView** - 一个圆形的image view。
* **ConfirmationActivity** - 一个在用户完成一个操作之后用来显示确认动画的activity。
* **CrossFadeDrawable** - 一个drawable。该drawable包含两个子drawable和提供方法来调整这两个子drawable的融合方式。
* **DelayedConfirmationView** - 一个view。提供一个圆形倒计时器，这个计时器通常用于在一段短暂的延迟结束后自动确认某个操作。
* **DismissOverlayView** - 一个用来实现长按消失的View。
* **DotsPageIndicator** - 一个为GridViewPager提供的指示标记，用于指定当前页面相对于所有页面的位置。
* **GridViewPager** - 一个可以横向与纵向滑动的局部控制器。你需要提供一个GridPagerAdapter用来生成显示页面的数据。
* **GridPagerAdapter** - 一个提供给GridViewPager显示页面的adapter。
* **FragmentGridPagerAdapter** - 一个将每个页面表示为一个fragment的GridPagerAdapter实现。
* **WatchViewStub** - 一个可以根据屏幕的形状生成特定布局的类。
* **WearableListView** - 一个针对可穿戴设备优化过后的ListView。它会垂直的显示列表内容，并在用户停止滑动时自动显示最靠近的Item。

### Wear UI library API reference

这个参考文献解释了如何详细地使用每个UI组件。查看[Wear API reference documentation](http://developer.android.com/reference/android/support/wearable/view/package-summary.html)了解上述类的用法。

### 为用于Eclipse ADT下载Wearable UI库

如果你正在使用Eclipse ADT，那么下载[Wearable UI library](http://developer.android.com/shareables/training/wearable-support-lib.zip)将Wearable UI库导入到你的工程当中。

> **Note:** 我们推荐使用[Android Studio](http://developer.android.com/sdk/index.html)来开发可穿戴应用。

