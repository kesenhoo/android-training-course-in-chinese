# 建立ActionBar

> 编写:[Vincent 4J](http://github.com/vincent4j) - 原文:<http://developer.android.com/training/basics/actionbar/setting-up.html>

Action bar 最基本的形式，就是为 Activity 显示标题，并且在标题左边显示一个 app icon。即使在这样简单的形式下，action bar对于所有的 activity 来说是十分有用的。它告知用户他们当前所处的位置，并为你的 app 维护了持续的同一标识。

![actionbar-basic](actionbar-basic.png)

图 1. 一个有 app icon 和 Activity 标题的 action bar

设置一个基本的 action bar，需要 app 使用一个 activity 主题，该主题必须是 action bar 可用的。如何声明这样的主题取决于我们 app 支持的 Android 最低版本。本课程根据我们 app 支持的 Android 最低版本分为两部分。

## 仅支持 Android 3.0 及以上版本

从 Android 3.0(API lever 11) 开始，所有使用 [Theme.Holo](http://developer.android.com/reference/android/R.style.html#Theme_Holo) 主题（或者它的子类）的 Activity 都包含了 action bar，当 [targetSdkVersion](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html#target) 或 [minSdkVersion](http://developer.android.com/guide/topics/manifest/uses-sdk-element.html#min) 属性被设置成 “11” 或更大时，它是默认主题。

所以，要为 activity 添加 action bar，只需简单地设置属性为 `11` 或者更大。例如：

```xml
<manifest ... >
    <uses-sdk android:minSdkVersion="11" ... />
    ...
</manifest>
```

> **注意**: 如果创建了一个自定义主题，需确保这个主题使用一个 Theme.Holo的主题作为父类。详情见 [Action bar 的风格化](styling.html)

到此，我们的 app 使用了 `Theme.Holo` 主题，并且所有的 activity 都显示 action bar。

## 支持 Android 2.1 及以上版本

当 app 运行在 Andriod 3.0 以下版本（不低于 Android 2.1）时，如果要添加 action bar，需要加载 Android Support 库。

开始之前，通过阅读[Support Library Setup](http://developer.android.com/tools/support-library/setup.html)文档来建立**v7 appcompat** library（下载完library包之后，按照[Adding libraries with resources](http://developer.android.com/tools/support-library/setup.html#libs-with-res)的指引进行操作）。

在 Support Library集成到你的 app 工程中之后：

1、更新 activity，以便于它继承于 [ActionBarActivity](http://developer.android.com/reference/android/support/v7/app/ActionBarActivity.html)。例如：

```java
public class MainActivity extends ActionBarActivity { ... }
```

2、在 mainfest 文件中，更新 [`<application>`](http://developer.android.com/guide/topics/manifest/application-element.html) 标签或者单一的 [`<activity>`](http://developer.android.com/guide/topics/manifest/application-element.html) 标签来使用一个 [Theme.AppCompat](http://developer.android.com/reference/android/support/v7/appcompat/R.style.html#Theme_AppCompat) 主题。例如：

```xml
<activity android:theme="@style/Theme.AppCompat.Light" ... >
```

> **注意**: 如果创建一个自定义主题，需确保其使用一个 `Theme.AppCompat` 主题作为父类。详情见 [Action bar 风格化](styling.html)

现在，当 app 运行在 Android 2.1(API level 7) 或者以上时，activity 将包含 action bar。

切记，在 manifest 中正确地设置 app 支持的 API level：

```xml
<manifest ... >
    <uses-sdk android:minSdkVersion="7"  android:targetSdkVersion="18" />
    ...
</manifest>
```

