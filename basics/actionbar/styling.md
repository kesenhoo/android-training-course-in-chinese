# 自定义ActionBar的风格

> 编写:[Vincent 4J](http://github.com/vincent4j) -  原文:<http://developer.android.com/training/basics/actionbar/styling.html>

Action bar 为用户提供一种熟悉可预测的方式来展示操作和导航，但是这并不意味着我们的 app 要看起来和其他 app 一样。如果想将 action bar 的风格设计的合乎我们产品的定位，只需简单地使用 Android 的 [样式和主题](https://developer.android.com/guide/topics/ui/themes.html) 资源。

Android 包括一少部分内置的 activity 主题，这些主题中包含 “dark” 或 “light” 的 action bar 样式。我们也可以扩展这些主题，以便于更好的为 action bar 自定义外观。

> **注意**：如果我们为 action bar 使用了 Support 库的 API，那我们必须使用（或重写） [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat) 家族样式（甚至 [Theme.Holo](https://developer.android.com/reference/android/R.style.html#Theme_Holo) 家族，在 API level 11 或更高版本中可用）。如此一来，声明的每一个样式属性都必须被声明两次：一次使用系统平台的样式属性（[android:](http://developer.android.com/reference/android/R.attr.html) 属性），另一次使用 Support 库中的样式属性（[appcompat.R.attr](http://developer.android.com/reference/android/support/v7/appcompat/R.attr.html) 属性 - 这些属性的上下文其实就是我们的 app）。更多细节请查看下面的示例。

## 使用一个 Android 主题

Android 包含两个基本的 activity 主题，这两个主题决定了 action bar 的颜色：

* [Theme.Holo](https://developer.android.com/reference/android/R.style.html#Theme_Holo)，一个 “dark” 的主题
* [Theme.Holo.Light](https://developer.android.com/reference/android/R.style.html#Theme_Holo_Light)，一个 “light” 的主题

![actionbar-theme-dark@2x.png](actionbar-theme-dark@2x.png)

![actionbar-theme-light-solid@2x.png](actionbar-theme-light-solid@2x.png)

这些主题即可以被应用到 app 全局，也可以通过在 manifest 文件中设置 [`<application>`](https://developer.android.com/guide/topics/manifest/application-element.html) 元素 或 [`<activity>`](https://developer.android.com/guide/topics/manifest/application-element.html) 元素的 `android:theme` 属性，对单一的 activity 进行设置。

例如：

```xml
<application android:theme="@android:style/Theme.Holo.Light" ... />
```

可以通过声明 activity 的主题为 [Theme.Holo.Light.DarkActionBar](https://developer.android.com/reference/android/R.style.html#Theme_Holo_Light_DarkActionBar) 来达到如下效果：action bar 为dark，其他部分为light。

![actionbar-theme-light-darkactionbar@2x.png](actionbar-theme-light-darkactionbar@2x.png)

当使用 Support 库时，必须使用 [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat) 主题替代：

* [Theme.AppCompat](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat)，一个“dark”的主题
* [Theme.AppCompat.Light](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat_Light)，一个“light”的主题
* [Theme.AppCompat.Light.DarkActionBar](https://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat_Light_DarkActionBar)，一个带有“dark” action bar 的“light”主题

一定要确保我们使用的 action bar icon 的颜色与 action bar 本身的颜色有差异。[Action Bar Icon Pack](https://developer.android.com/design/downloads/index.html#action-bar-icon-pack) 为 Holo “dark”和“light”的 action bar 提供了标准的 action icon。

## 自定义背景

为改变 action bar的背景，可以通过为 activity 创建一个自定义主题，并重写 [actionBarStyle](https://developer.android.com/reference/android/R.attr.html#actionBarStyle) 属性来实现。[actionBarStyle](https://developer.android.com/reference/android/R.attr.html#actionBarStyle) 属性指向另一个样式；在该样式里，通过指定一个 drawable 资源来重写 [background](https://developer.android.com/reference/android/R.attr.html#background) 属性。

![actionbar-theme-custom@2x.png](actionbar-theme-custom@2x.png)

如果我们的 app 使用了 [navigation tabs](https://developer.android.com/guide/topics/ui/actionbar.html#Tabs) 或 [split action bar](https://developer.android.com/guide/topics/ui/actionbar.html#SplitBar) ，也可以通过分别设置 [backgroundStacked](https://developer.android.com/reference/android/R.attr.html#backgroundStacked) 和 [backgroundSplit](https://developer.android.com/reference/android/R.attr.html#backgroundSplit) 属性来为这些条指定背景。

> **Note**：为自定义主题和样式声明一个合适的父主题，这点很重要。如果没有父样式，action bar将会失去很多默认的样式属性，除非我们自己显式的对他们进行声明。

### 仅支持 Android 3.0 和更高

当仅支持 Android 3.0 和更高版本时，可以通过如下方式定义 action bar 的背景：

`res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 应用于程序或者活动的主题 -->
    <style name="CustomActionBarTheme"
           parent="@android:style/Theme.Holo.Light.DarkActionBar">
        <item name="android:actionBarStyle">@style/MyActionBar</item>
    </style>

    <!-- ActionBar 样式 -->
    <style name="MyActionBar"
           parent="@android:style/Widget.Holo.Light.ActionBar.Solid.Inverse">
        <item name="android:background">@drawable/actionbar_background</item>
    </style>
</resources>
```

然后，将主题应用到 app 全局或单个的 activity 之中：

```xml
<application android:theme="@style/CustomActionBarTheme" ... />
```

### 支持 Android 2.1 和更高

当使用 Support 库时，上面同样的主题必须被替代成如下：

`res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 应用于程序或者活动的主题 -->
    <style name="CustomActionBarTheme"
           parent="@style/Theme.AppCompat.Light.DarkActionBar">
        <item name="android:actionBarStyle">@style/MyActionBar</item>

        <!-- 支持库兼容 -->
        <item name="actionBarStyle">@style/MyActionBar</item>
    </style>

    <!-- ActionBar 样式 -->
    <style name="MyActionBar"
           parent="@style/Widget.AppCompat.Light.ActionBar.Solid.Inverse">
        <item name="android:background">@drawable/actionbar_background</item>

        <!-- 支持库兼容 -->
        <item name="background">@drawable/actionbar_background</item>
    </style>
</resources>
```

然后，将主题应用到 app 全局或单个的 activity 之中：

```xml
<application android:theme="@style/CustomActionBarTheme" ... />
```

## 自定义文本颜色

修改 action bar 中的文本颜色，需要分别设置每个元素的属性：

* Action bar 的标题：创建一种自定义样式，并指定 `textColor` 属性；同时，在自定义的 [actionBarStyle](https://developer.android.com/reference/android/R.attr.html#actionBarStyle) 中为 [titleTextStyle](https://developer.android.com/reference/android/R.attr.html#titleTextStyle) 属性指定为刚才的自定义样式。

> **注意**：被应用到 [titleTextStyle](https://developer.android.com/reference/android/R.attr.html#titleTextStyle) 的自定义样式应该使用 [TextAppearance.Holo.Widget.ActionBar.Title](https://developer.android.com/reference/android/R.style.html#TextAppearance_Holo_Widget_ActionBar_Title) 作为父样式。


* Action bar tabs：在 activity 主题中重写 [ actionBarTabTextStyle](https://developer.android.com/reference/android/R.attr.html#actionBarTabTextStyle)
* Action 按钮：在 activity 主题中重写 [actionMenuTextColor](https://developer.android.com/reference/android/R.attr.html#actionMenuTextColor)

### 仅支持 Android 3.0 和更高

当仅支持 Android 3.0 和更高时，样式 XML 文件应该是这样的：

`res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 应用于程序或者活动的主题 -->
    <style name="CustomActionBarTheme"
           parent="@style/Theme.Holo">
        <item name="android:actionBarStyle">@style/MyActionBar</item>
        <item name="android:actionBarTabTextStyle">@style/MyActionBarTabText</item>
        <item name="android:actionMenuTextColor">@color/actionbar_text</item>
    </style>

    <!-- ActionBar 样式 -->
    <style name="MyActionBar"
           parent="@style/Widget.Holo.ActionBar">
        <item name="android:titleTextStyle">@style/MyActionBarTitleText</item>
    </style>

    <!-- ActionBar 标题文本 -->
    <style name="MyActionBarTitleText"
           parent="@style/TextAppearance.Holo.Widget.ActionBar.Title">
        <item name="android:textColor">@color/actionbar_text</item>
    </style>

    <!-- ActionBar Tab标签 文本样式 -->
    <style name="MyActionBarTabText"
           parent="@style/Widget.Holo.ActionBar.TabText">
        <item name="android:textColor">@color/actionbar_text</item>
    </style>
</resources>
```

### 支持 Android 2.1 和更高

当使用 Support 库时，样式 XML 文件应该是这样的：

`res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 应用于程序或者活动的主题 -->
    <style name="CustomActionBarTheme"
           parent="@style/Theme.AppCompat">
        <item name="android:actionBarStyle">@style/MyActionBar</item>
        <item name="android:actionBarTabTextStyle">@style/MyActionBarTabText</item>
        <item name="android:actionMenuTextColor">@color/actionbar_text</item>

        <!-- 支持库兼容 -->
        <item name="actionBarStyle">@style/MyActionBar</item>
        <item name="actionBarTabTextStyle">@style/MyActionBarTabText</item>
        <item name="actionMenuTextColor">@color/actionbar_text</item>
    </style>

    <!-- ActionBar 样式 -->
    <style name="MyActionBar"
           parent="@style/Widget.AppCompat.ActionBar">
        <item name="android:titleTextStyle">@style/MyActionBarTitleText</item>

        <!-- 支持库兼容 -->
        <item name="titleTextStyle">@style/MyActionBarTitleText</item>
    </style>

    <!-- ActionBar 标题文本 -->
    <style name="MyActionBarTitleText"
           parent="@style/TextAppearance.AppCompat.Widget.ActionBar.Title">
        <item name="android:textColor">@color/actionbar_text</item>
        <!-- 文本颜色属性textColor是可以配合支持库向后兼容的 -->
    </style>

    <!-- ActionBar Tab标签文本样式 -->
    <style name="MyActionBarTabText"
           parent="@style/Widget.AppCompat.ActionBar.TabText">
        <item name="android:textColor">@color/actionbar_text</item>
        <!-- 文本颜色属性textColor是可以配合支持库向后兼容的 -->
    </style>
</resources>
```

## 自定义 Tab Indicator

为 activity 创建一个自定义主题，通过重写 [actionBarTabStyle](https://developer.android.com/reference/android/R.attr.html#actionBarTabStyle) 属性来改变 [navigation tabs](https://developer.android.com/guide/topics/ui/actionbar.html#Tabs) 使用的指示器。[actionBarTabStyle](https://developer.android.com/reference/android/R.attr.html#actionBarTabStyle) 属性指向另一个样式资源；在该样式资源里，通过指定一个state-list drawable 来重写 [background](https://developer.android.com/reference/android/R.attr.html#background) 属性。
![](actionbar-theme-custom-tabs@2x.png)

> **注意**：一个state-list drawable 是重要的，它可以通过不同的背景来指出当前选择的 tab 与其他 tab 的区别。更多关于如何创建一个 drawable 资源来处理多个按钮状态，请阅读 [State List](https://developer.android.com/guide/topics/resources/drawable-resource.html#StateList) 文档。

例如，这是一个状态列表 drawable，为一个 action bar tab 的多种不同状态分别指定背景图片：

`res/drawable/actionbar_tab_indicator.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">

<!-- 按钮没有按下的状态 -->

    <!-- 没有焦点的状态 -->
    <item android:state_focused="false" android:state_selected="false"
          android:state_pressed="false"
          android:drawable="@drawable/tab_unselected" />
    <item android:state_focused="false" android:state_selected="true"
          android:state_pressed="false"
          android:drawable="@drawable/tab_selected" />

    <!-- 有焦点的状态 (例如D-Pad控制或者鼠标经过) -->
    <item android:state_focused="true" android:state_selected="false"
          android:state_pressed="false"
          android:drawable="@drawable/tab_unselected_focused" />
    <item android:state_focused="true" android:state_selected="true"
          android:state_pressed="false"
          android:drawable="@drawable/tab_selected_focused" />


<!--  按钮按下的状态D -->

    <!-- 没有焦点的状态 -->
    <item android:state_focused="false" android:state_selected="false"
          android:state_pressed="true"
          android:drawable="@drawable/tab_unselected_pressed" />
    <item android:state_focused="false" android:state_selected="true"
        android:state_pressed="true"
        android:drawable="@drawable/tab_selected_pressed" />

    <!--有焦点的状态 (例如D-Pad控制或者鼠标经过)-->
    <item android:state_focused="true" android:state_selected="false"
          android:state_pressed="true"
          android:drawable="@drawable/tab_unselected_pressed" />
    <item android:state_focused="true" android:state_selected="true"
          android:state_pressed="true"
          android:drawable="@drawable/tab_selected_pressed" />
</selector>
```

### 仅支持 Android 3.0 和更高

当仅支持 Android 3.0 和更高时，样式 XML 文件应该是这样的：

`res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 应用于程序或活动的主题 -->
    <style name="CustomActionBarTheme"
           parent="@style/Theme.Holo">
        <item name="android:actionBarTabStyle">@style/MyActionBarTabs</item>
    </style>

    <!-- ActionBar tabs 标签样式 -->
    <style name="MyActionBarTabs"
           parent="@style/Widget.Holo.ActionBar.TabView">
        <!-- 标签指示器 -->
        <item name="android:background">@drawable/actionbar_tab_indicator</item>
    </style>
</resources>
```

### 支持 Android 2.1 和更高

当使用 Support 库时，样式 XML 文件应该是这样的：

`res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 应用于程序或活动的主题 -->
    <style name="CustomActionBarTheme"
           parent="@style/Theme.AppCompat">
        <item name="android:actionBarTabStyle">@style/MyActionBarTabs</item>

        <!-- 支持库兼容 -->
        <item name="actionBarTabStyle">@style/MyActionBarTabs</item>
    </style>

    <!-- ActionBar tabs 样式 -->
    <style name="MyActionBarTabs"
           parent="@style/Widget.AppCompat.ActionBar.TabView">
        <!-- 标签指示器 -->
        <item name="android:background">@drawable/actionbar_tab_indicator</item>

        <!-- 支持库兼容 -->
        <item name="background">@drawable/actionbar_tab_indicator</item>
    </style>
</resources>
```

> **更多资源**
* 关于 action bar 的更多样式属性，请查看 [Action Bar](https://developer.android.com/guide/topics/ui/actionbar.html#Style) 指南
* 学习更多样式的工作机制，请查看 [样式和主题](https://developer.android.com/guide/topics/ui/themes.html) 指南
* 全面的 action bar 样式，请尝试 [Android Action Bar 样式生成器](http://www.actionbarstylegenerator.com/)
