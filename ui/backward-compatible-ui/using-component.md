# 使用能感知版本的组件

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/backward-compatible-ui/using-component.html>

既然对`TabHelper`和`CompatTab`你已经有了两种具体实现，一个为Android 3.0和其后版本，一个为Android 3.0之前的版本。现在，该使用这些实现做些事情了。这一课讨论了创建在这两种实现之前切换的逻辑，创建能够感知版本的界面布局，最终使用我们创建的后向兼容的UI组件。

## 添加切换逻辑
`TabHelper`抽象类基于当前设备的平台版本，是用来创建适当版本的`TabHelper`和`CompatTab`实例的工厂类：

```java
public abstract class TabHelper {
    ...
    // Usage is TabHelper.createInstance(activity)
    public static TabHelper createInstance(FragmentActivity activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
            return new TabHelperHoneycomb(activity);
        } else {
            return new TabHelperEclair(activity);
        }
    }

    // Usage is mTabHelper.newTab("tag")
    public CompatTab newTab(String tag) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
            return new CompatTabHoneycomb(mActivity, tag);
        } else {
            return new CompatTabEclair(mActivity, tag);
        }
    }
    ...
}
```

## 创建能感知版本的Activity布局

下一步是提供能够支持两种tab实现的Activity界面布局。对于老的实现（TabHelperEclair），你需要确保你的界面布局包含TabWidget和TabHost，同时存在一个包含tab内容的布局容器。

res/layout/main.xml:

```java
<!-- This layout is for API level 5-10 only. -->
<TabHost xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@android:id/tabhost"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <LinearLayout
        android:orientation="vertical"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:padding="5dp">

        <TabWidget
            android:id="@android:id/tabs"
            android:layout_width="match_parent"
            android:layout_height="wrap_content" />

        <FrameLayout
            android:id="@android:id/tabcontent"
            android:layout_width="match_parent"
            android:layout_height="0dp"
            android:layout_weight="1" />

    </LinearLayout>
</TabHost>
```

对于`TabHelperHoneycomb`的实现，你唯一要做的就是一个包含tab内容的[FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html)，这是由于[ActionBar](http://developer.android.com/reference/android/app/ActionBar.html)已经提供了tab相关的页面。

res/layout-v11/main.xml:

```java
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@android:id/tabcontent"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

在运行的时候，Android将会根据平台版本去决定使用哪个版本的`main.xml`布局文件。这根上一节中选择哪一个版本的`TabHelper`所展示的逻辑是相同的。

## 在Activity中使用TabHelper

在Activity的[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))方法中，你可以获得一个`TabHelper`对象，并且使用以下代码添加tabs：

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    setContentView(R.layout.main);

    TabHelper tabHelper = TabHelper.createInstance(this);
    tabHelper.setUp();

    CompatTab photosTab = tabHelper
            .newTab("photos")
            .setText(R.string.tab_photos);
    tabHelper.addTab(photosTab);

    CompatTab videosTab = tabHelper
            .newTab("videos")
            .setText(R.string.tab_videos);
    tabHelper.addTab(videosTab);
}
```

当运行这个应用的时候，代码会自动显示对应的界面布局和实例化对应的`TabHelperHoneycomb`或`TabHelperEclair`对象，而实际使用的类对于Actvity来说是不透明的，因为它们拥有共同的`TabHelper`接口。

以下是这种实现运行在Android 2.3和Android 4.0上的界面截图：

![backward-compatible-ui-gb](backward-compatible-ui-gb.png)
![backward-compatible-ui-ics](backward-compatible-ui-ics.png)

* 图1.向后兼容的tabs运行在Android 2.3设备上（使用TabHelperEclair）和运行在Android 4.0设备上的截图

