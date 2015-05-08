# 维护兼容性

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <https://developer.android.com/training/material/compatibility.html>

有些Material Design特性，比如主题和自定义Activits切换效果等，只在Android 5.0 (API level 21) 以上中可用。不过，你仍然可以使用这些特性实现Material Design，并保持对旧版本Android 系统的兼容。

## 定义备选Style

你可以配置你的应用，在支持Material Design的设备上使用Material主题，在旧版本Android上使用旧的主题：

1. 在`res/values/styles/xml`中定义一个主题继承自旧主题（比如Holo）
2. 在`res/values-v21/styles.xml`中定义一个同名的主题，继承自Material 主题
3. 在`AndroidManifest.xml`中，将这个主题设置为应用的主题

> **Note:** 如果你的应用设置了一个主题，但是没有提供备选Style，你可能无法在低于Android 5.0版本的系统中运行应用。

## 提供备选layout

如果你根据Material Design设计的应用的Layout中没有使用任何Android 5.0 (API level 21)中新的XML属性，他们在旧版本Android中就能正常工作。否则，你要提供备选Layout。你可以在备选Layout中定义你的应用在旧版本系统中的界面。

在`res/layout-v21/`中定义Android 5.0 (API level 21) 以上系统的Layout，在`res/layout`中定义早前版本Android的Layout。比如，`res/layout/my_activity.xml`是对于`res/layout-v21/my_activity.xml`的一个备选Layout。

为了避免代码重复，在`res/values`中定义style，然后在`res/values-v21`中修改新API需要的style。使用style的继承，在`res/values/`中定义父style，在`res/values-v21/`中继承。

## 使用 Support Library

[v7 support libraries r21](https://developer.android.com/tools/support-library/features.html#v7) 及更高版本包含了以下Material Design 特性：

* 当你应用一个 `Theme.AppCompat` 主题时， 会得到为一些系统控件准备的 Material Design style
* `Theme.AppCompat`主题包含调色板主体属性
* `RecyclerView` 组件用于显示数据集
* `CardView` 组件用于创建卡片
* `Palette` 类用于从图片提取主色调

### 系统组件

`Theme.AppCompat` 主题中提供了这些组件的 Material Design style：

* EditText
* Spinner
* CheckBox
* RadioButton
* SwitchCompat
* CheckedTextView

### 调色板

要获取Material Design style，并用v7 support library自定义调色板，就要应用以下中的一个Theme.AppCompat主题：

```xml
<!-- extend one of the Theme.AppCompat themes -->
<style name="Theme.MyTheme" parent="Theme.AppCompat.Light">
    <!-- customize the color palette -->
    <item name="colorPrimary">@color/material_blue_500</item>
    <item name="colorPrimaryDark">@color/material_blue_700</item>
    <item name="colorAccent">@color/material_green_A200</item>
</style>
```

### 列表和卡片

`RecyclerView`和`CardView`组件可通过v7 support libraries支持旧版本Android，但有以下限制：

* CardView需要编程实现阴影和其他的padding
* CardView不能将附着与原件有重合部分的子视图

### 依赖

要在Android 5.0之前的版本使用这些特性，需要在项目的Gradle依赖中加入Android v7 support library:

```
dependencies {
    compile 'com.android.support:appcompat-v7:21.0.+'
    compile 'com.android.support:cardview-v7:21.0.+'
    compile 'com.android.support:recyclerview-v7:21.0.+'
}
```

## 检查系统版本

以下特性只在Android 5.0 (API level 21) 及以上版本中可用：

* Activity 切换动画
* 触摸反馈
* Reveal 动画（填充动画效果，译者注）
* 基于路径的动画
* 矢量drawable
* Drawable染色

要保持向下兼容，请在使用这些特性是，使用以下代码在运行时检查系统版本：

```java
// Check if we're running on Android 5.0 or higher
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    // Call some material design APIs here
} else {
    // Implement this feature without material design
}
```

> **Note:**要声明应用支持哪些Android 版本，在manifest文件中使用`android:minSdkVersion`和`android:targetSdkVersion`属性。要在Android 5.0中使用Material Design特性，设置`android:targetSdkVersion`属性为21。更多信息，参见[`<uses-sdk>` API指南](https://developer.android.com/guide/topics/manifest/uses-sdk-element.html)。
