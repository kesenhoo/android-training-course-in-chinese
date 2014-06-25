> 编写: [Vincent 4J](http://github.com/vincent4j)

> 校对:

# Action Bar 风格化

Action bar 为用户提供一种熟悉可预测的方式来展示操作和导航，但是这并不意味着你的 app 要看起来和其他 app 一样。如果你想将 action bar 的风格设计的合乎你产品的定位，你只需简单地使用 Android 的 [式样和主题](https://developer.android.com/guide/topics/ui/themes.html) 资源。

Android 包括一少部分内置的 activity 主题，这些主题中包含 “暗” 或 “淡” 的 action bar 式样。你也可以扩展这些主题，以便于更好的为你的 action bar 自定义外观。

>注释：如果你为 action bar 使用了 Support 库的 API，那你必须使用（或重写） [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat) 家族式样（甚至 [Theme.Holo](https://developer.android.com/reference/android/R.style.html#Theme_Holo) 家族，在 API level 11 或更高版本中可用）。如此一来，你声明的每一个式样属性都必须被声明两次：一次使用平台的式样属性（`android:` 属性），另一次使用 Support 库中的式样属性（`appcompat.R.attr` 属性 —— 这些属性的上下文其实就是你的 app）。更多细节请查看下面的示例。

## 使用一个 Android 主题

Android 包含两个基本的 activity 主题，这两个主题决定了 action bar 的颜色：

- [Theme.Holo](https://developer.android.com/reference/android/R.style.html#Theme_Holo)，一个 “暗” 的主题
- [Theme.Holo.Light](https://developer.android.com/reference/android/R.style.html#Theme_Holo_Light)，一个 “淡” 的主题

![actionbar-theme-dark@2x.png](actionbar-theme-dark@2x.png)

![actionbar-theme-light-solid@2x.png](actionbar-theme-light-solid@2x.png)

这些主题即可以被应用到 app 全局，又可以为单一的 activity 通过在 manifest 文件中设置 [application](https://developer.android.com/guide/topics/manifest/application-element.html) 元素 或 [activity](https://developer.android.com/guide/topics/manifest/application-element.html) 元素的 `android:theme` 属性。

例如：
```xml
<application android:theme="@android:style/Theme.Holo.Light" ... />
```

你可以通过声明 activity 的主题为 [Theme.Holo.Light.DarkActionBar](https://developer.android.com/reference/android/R.style.html#Theme_Holo_Light_DarkActionBar) 来达到如下效果：action bar 为暗色，其他部分为淡色。

![actionbar-theme-light-darkactionbar@2x.png](actionbar-theme-light-darkactionbar@2x.png)

当使用 Support 库时，必须使用 [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat) 主题替代：
- [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat)，一个“暗”的主题
- [Theme.AppCompat.Light](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat_Light)，一个“淡”的主题
- [Theme.AppCompat.Light.DarkActionBar](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat_Light_DarkActionBar)，一个带有“暗” action bar 的“淡”主题

一定要确保你使用的 action bar icon 的颜色与 action bar 本身的颜色有差异。为了能帮助到你，[Action Bar Icon Pack](https://developer.android.com/design/downloads/index.html#action-bar-icon-pack) 为 Holo “暗”和“淡”的 action bar 提供了标准的 action icon。

## 自定义背景

为 activity 创建一个自定义主题，通过重写 [actionBarStyle](https://developer.android.com/reference/android/R.attr.html#actionBarStyle) 属性来改变 action bar 的背景。[actionBarStyle](https://developer.android.com/reference/android/R.attr.html#actionBarStyle) 属性指向另一个式样；在该式样里，通过指定一个 drawable 资源来重写 [background](https://developer.android.com/reference/android/R.attr.html#background) 属性。

如果你的 app 使用了 [navigation tabs](https://developer.android.com/guide/topics/ui/actionbar.html#Tabs) 或 [split action bar](https://developer.android.com/guide/topics/ui/actionbar.html#SplitBar) ，你也可以通过分别设置 [backgroundStacked](https://developer.android.com/reference/android/R.attr.html#backgroundStacked) 和 [backgroundSplit](https://developer.android.com/reference/android/R.attr.html#backgroundSplit) 属性来为这些条指定背景。

>注意：声明一个合适的父主题，进而你的自定义主题和式样可以继承父主题的式样，这点很重要。如果没有父式样，你的 action bar 将会失去很多式样属性，除非你自己显式的对他们进行声明。

### 仅支持 Android 3.0 和更高

当仅支持 Android 3.0 和更高版本时，你可以像这样定义 action bar 的背景：

res/values/themes.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- the theme applied to the application or activity -->
    <style name="CustomActionBarTheme"
           parent="@android:style/Theme.Holo.Light.DarkActionBar">
        <item name="android:actionBarStyle">@style/MyActionBar</item>
    </style>

    <!-- ActionBar styles -->
    <style name="MyActionBar"
           parent="@android:style/Widget.Holo.Light.ActionBar.Solid.Inverse">
        <item name="android:background">@drawable/actionbar_background</item>
    </style>
</resources>
```

然后，将你的主题应该到你的 app 全局或单个的 activity 之中：
```xml
<application android:theme="@style/CustomActionBarTheme" ... />
```

### 支持 Android 2.1 和更高

当使用 Support 库时，上面同样的主题必须被替代成如下：

res/values/themes.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- the theme applied to the application or activity -->
    <style name="CustomActionBarTheme"
           parent="@style/Theme.AppCompat.Light.DarkActionBar">
        <item name="android:actionBarStyle">@style/MyActionBar</item>

        <!-- Support library compatibility -->
        <item name="actionBarStyle">@style/MyActionBar</item>
    </style>

    <!-- ActionBar styles -->
    <style name="MyActionBar"
           parent="@style/Widget.AppCompat.Light.ActionBar.Solid.Inverse">
        <item name="android:background">@drawable/actionbar_background</item>

        <!-- Support library compatibility -->
        <item name="background">@drawable/actionbar_background</item>
    </style>
</resources>
```
然后，将你的主题应该到你的 app 全局或单个的 activity 之中：
```xml
<application android:theme="@style/CustomActionBarTheme" ... />
```















