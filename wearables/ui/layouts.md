# 定义Layouts

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/layouts.html>

可穿戴设备使用与手持Android设备同样的布局技术，但需要有具体的约束来设计。不要以一个手持app的角度开发功能和UI并期待得到一个好的体验。关于如何设计优秀的可穿戴应用的更多信息，请阅读[Android Wear Design Guidelines](https://developer.android.com/design/wear/index.html)。

当为Android Wear应用创建layout时，我们需要同时考虑方形和圆形屏幕的设备。在圆形Android Wear设备上所有放置在靠近屏幕边角的内容可能会被剪裁掉，所以为方形屏幕设计的layouts在圆形设备上不能很好地显示出来。对这类问题的示范请查看这个视频[Full Screen Apps for Android Wear](https://www.youtube.com/watch?v=naf_WbtFAlY)。

举个例子，figure 1展示了下面的layout在圆形和方形屏幕上的效果：

![](01_uilib.png)

**Figure 1.** 为方形屏幕设计的layouts在圆形设备上不能很好显示的示范

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <TextView
        android:id="@+id/text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/hello_square" />
</LinearLayout>
```

上述范例的文本没有正确地显示在圆形屏幕上。

Wearable UI库为这个问题提供了两种不同的解决方案：

* 为圆形和方形屏幕定义不同的layouts。我们的app会在运行时检查设备屏幕形状并inflate正确的layout。

* 用一个包含在库里面的特殊layout同时适配方形和圆形设备。这个layout会在不同形状的设备屏幕窗口中插入不同的间隔。

当我们希望应用在不同形状的屏幕上看起来不同时，一般会使用第一种方案。当我们希望用一个相似的layout在两种屏幕上且在圆形屏幕上没有视图被边缘剪裁时，可以使用第二种方案。

## 添加Wearable UI库

当我们使用Android Studio的工程向导时，Android Studio会自动地在`wear`模块中包含Wearable UI库。为了在工程中编译到这个库，确保 *Extras > Google Repository* 包已经被安装在Android SDK manager里，下面的依赖被包含在`wear`模块的`build.gradle`文件中：

```xml
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'com.google.android.support:wearable:+'
    compile 'com.google.android.gms:play-services-wearable:+'
}
```

要实现以下的布局方法需要用到 `'com.google.android.support:wearable'` 依赖。

浏览[API reference documentation](https://developer.android.com/reference/android/support/wearable/view/package-summary.html)查看Wearable UI库的类。

## 为方形和圆形屏幕指定不同的Layouts

包含在Wearable UI库中的`WatchViewStub`类允许我们为方形和圆形屏幕指定不同的layout。这个类会在运行时检查屏幕形状并inflate相应的layout。

为了在我们的应用中使用这个类以应对不同的屏幕形状，我们需要：

* 添加`WatchViewStub`作为activity的layout的主元素。
* 使用`rectLayout`属性为方形屏幕指定一个layout文件。
* 使用`roundLayout`属性为圆形屏幕指定一个layout文件。

类似下面定义activity的layout：

```xml
<android.support.wearable.view.WatchViewStub
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/watch_view_stub"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:rectLayout="@layout/rect_activity_wear"
    app:roundLayout="@layout/round_activity_wear">
</android.support.wearable.view.WatchViewStub>
```

在activity中inflate这个layout：

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_wear);
}
```

然后为方形和圆形屏幕创建不同的layout文件，在这个例子中，我们需要创建`res/layout/rect_activity_wear.xml`和`res/layout/round_activity_wear.xml`两个文件。像创建手持应用的layouts一样定义这些layouts，但需要考虑可穿戴设备的限制。系统会在运行时根据屏幕形状来inflate适合的layout。

### 取得layout views

我们为方形或圆形屏幕定义的layouts在`WatchViewStub`检测到屏幕形状之前不会被inflate，所以你的app不能立即取得它们的view。为了取得这些view，需要在我们的activity中设置一个listener，当屏幕适配的layout被inflate时会通知这个listener：

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_wear);

    WatchViewStub stub = (WatchViewStub) findViewById(R.id.watch_view_stub);
    stub.setOnLayoutInflatedListener(new WatchViewStub.OnLayoutInflatedListener() {
        @Override public void onLayoutInflated(WatchViewStub stub) {
            // Now you can access your views
            TextView tv = (TextView) stub.findViewById(R.id.text);
            ...
        }
    });
}
```

<a name="same-layout"></a>
## 使用感知形状的Layout

包含在Wearable UI库中的`BoxInsetLayout`类继承自 [FrameLayout](https://developer.android.com/reference/android/widget/FrameLayout.html)，该类允许我们定义一个同时适配方形和圆形屏幕的layout。这个类适用于需要根据屏幕形状插入间隔的情况，并让我们容易地将view对其到屏幕的边缘或中心。

![](02_uilib.png)

**Figure 2.** 在圆形屏幕上的窗口间隔

figure 2中灰色的部分显示了在应用了窗口间隔之后，`BoxInsetLayout`自动将它的子view放置在圆形屏幕的区域。为了显示在这个区域内，子view需要用下面这些值指定 `layout_box`属性：

* 一个`top`、`bottom`、`left`和`right`的组合。比如，`"left|top"`将子view的左和上边缘定位在figure 2的灰色区域里面。
* `all`将所有子view的内容定位在figure 2的灰色区域里面。

在方形屏幕上，窗口间隔为0，`layout_box`属性会被忽略。

![](03_uilib.png)

**Figure 3.** 同一个layout工作在方形和圆形屏幕上

在figure 3中展示的layout使用了`BoxInsetLayout`，该layout在圆形和方形屏幕上都可以使用：

```xml
<android.support.wearable.view.BoxInsetLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:background="@drawable/robot_background"
    android:layout_height="match_parent"
    android:layout_width="match_parent"
    android:padding="15dp">

    <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:padding="5dp"
        app:layout_box="all">

        <TextView
            android:gravity="center"
            android:layout_height="wrap_content"
            android:layout_width="match_parent"
            android:text="@string/sometext"
            android:textColor="@color/black" />

        <ImageButton
            android:background="@null"
            android:layout_gravity="bottom|left"
            android:layout_height="50dp"
            android:layout_width="50dp"
            android:src="@drawable/ok" />

        <ImageButton
            android:background="@null"
            android:layout_gravity="bottom|right"
            android:layout_height="50dp"
            android:layout_width="50dp"
            android:src="@drawable/cancel" />
    </FrameLayout>
</android.support.wearable.view.BoxInsetLayout>
```
	
注意layout中的这些部分：

* `android:padding="15dp"`
 
这行指定了`BoxInsetLayout`元素的padding。因为在圆形设备上窗口间隔大于15dp，所以这个padding只应用在方形屏幕上。
  
* `android:padding="5dp"`
 
这行指定内部`FrameLayout`元素的padding。这个padding同时应用在方形和圆形屏幕上。在方形屏幕上，按钮和窗口间隔总的padding是20dp(15+5)，在圆形屏幕上是5dp。

* `app:layout_box="all"`
 
这行声明`FrameLayout`和它的子views都被放在圆形屏幕上窗口间隔定义的区域里。这行在方形屏幕上没有任何效果。