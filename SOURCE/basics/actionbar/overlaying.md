> 编写: [Vincent 4J](http://github.com/vincent4j)

> 校对:

# Action Bar 覆盖叠加

默认情况下，action bar 显示在 activity 窗口的顶部，会稍微地减少其他布局的有效空间。如果在用户交互过程中你要隐藏和显示 action bar，可以通过调用 [ActionBar](https://developer.android.com/reference/android/app/ActionBar.html) 中的 [hide()](https://developer.android.com/reference/android/app/ActionBar.html#hide()) 和 [show()](https://developer.android.com/reference/android/app/ActionBar.html#show()) 来实现。但是，这将会导致 activity 基于新尺寸重现计算和重新绘制布局。

为了避免在 action bar 隐藏和显示过程中调整布局，可以为 action bar 启用叠加模式。在叠加模式下，所有可用的空间都会被用来布局，并且 action bar 会叠加在布局之上。这样布局顶部就会被遮挡，但当 action bar 隐藏或显示时，系统不再需要调整布局而是无缝过渡。

>提示：如果你希望 action bar 下面的布局部分可见，可以创建一个背景部分透明的自定义式样的 action bar，如图 1 所示。如何定义 action bar 的背景，请查看 [Action Bar 风格化](styling.html)。

![actionbar-overlay@2x](actionbar-overlay@2x.png)
图 1. 叠加模式下的 gallery action bar

## 启用叠加模式

要为 action bar 启用叠加模式，需要自定义一个主题，该主题继承于已经存在的 action bar 主题，并设置 `android:windowActionBarOverlay` 属性的值为 `true`。

### 仅支持 Android 3.0 和以上

如果 [minSdkVersion](https://developer.android.com/guide/topics/manifest/uses-sdk-element.html#min) 为 `11` 或更高，自定义主题必须继承 [Theme.Holo](https://developer.android.com/reference/android/R.style.html#Theme_Holo) 主题（或者它的子主题）。例如：

```xml
<resources>
    <!-- the theme applied to the application or activity -->
    <style name="CustomActionBarTheme"
           parent="@android:style/Theme.Holo">
        <item name="android:windowActionBarOverlay">true</item>
    </style>
</resources>
```

###  支持 Android 2.1 和更高

如果为了兼容运行在 Android 3.0 以下版本的设备而使用了 Support 库，自定义主题必须继承 [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat) 主题（或者它的子主题）。例如：

```xml
<resources>
    <!-- the theme applied to the application or activity -->
    <style name="CustomActionBarTheme"
           parent="@android:style/Theme.AppCompat">
        <item name="android:windowActionBarOverlay">true</item>

        <!-- Support library compatibility -->
        <item name="windowActionBarOverlay">true</item>
    </style>
</resources>
```

请注意，这主题包含两种不同的 `windowActionBarOverlay` 式样定义：一个带 `android:` 前缀，另一个不带。带前缀的适用于包含该式样的 Android 版本，不带前缀的适用于通过从 Support 库中读取式样的旧版本。

## 指定布局的顶部边距

当 action bar 启用叠加模式时，它可能会遮挡住本应保持可见状态的布局。为了确保这些布局始终位于 action bar 下部，可以使用 [actionBarSize](https://developer.android.com/reference/android/R.attr.html#actionBarSize) 属性来指定顶部外边距或顶部内边距的高度来到达。例如：

```xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingTop="?android:attr/actionBarSize">
    ...
</RelativeLayout>
```

如果在 action bar 中使用 Support 库，需要移除 `android:` 前缀。例如：

```xml
<!-- Support library compatibility -->
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingTop="?attr/actionBarSize">
    ...
</RelativeLayout>
```

在这种情况下，不带前缀的 `?attr/actionBarSize` 适用于 Android 3.0 和更高的所有版本。
>>>>>>> f838ceb1481f3f90cbbd72d948fedbb59edf0735
