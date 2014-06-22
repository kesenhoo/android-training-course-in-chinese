> 编写:

> 校对:

# 建立 Action Bar

Action bar 最基本的形式，就是为 activity 显示标题，并且在标题左边显示一个 app icon。即使在这样简单的形式下，对于所有的 activity 来说，action bar 对告知用户他们当前所处的位置十分有用，并为你的 app 保持了一致性。   
![actionbar-basic](actionbar-basic.png)     
图 1. 一个有 app icon 和 activity 标题的 action bar

设置一个基本的 action bar，需要你的 app 使用一个 action bar 可用的 activity 主题。如何声明这样的主题取决于你的 app 支持的 Android 最低版本。所以本课程根据你的 app 支持的 Android 最低版本分为两部分。

## 仅支持 Android 3.0 及以上版本

从 Android 3.0(API lever 11) 开始，所有使用 Theme.Holo 主题（或者它的子类）的所有 activity 都包含 action bar，当 `targetSdkVersion` 或 `minSdkVersion` 属性被设置成 “11” 或更大时，它是默认主题。

所以，为你的 activity 添加 action bar，只需简单地设置属性为 `11` 或者更大。例如：

```xml
<manifest ... >
    <uses-sdk android:minSdkVersion="11" ... />
    ...
</manifest>
```

>注释：如果创建一个自定义主题，需确保它使用一个 Theme.Holo 主题作为父辈。详情请参见 [Action bar 的式样](http://developer.android.com/training/basics/actionbar/styling.html)

到此，你的 app 使用了 Theme.Holo 主题，并且所有的 activity 都显示 action bar。

## 支持 Android 2.1 及以上版本

当 app 运行在 Andriod 3.0 以下版本（不低于 Android 2.1）时，如果要添加 action bar，需要加载 Android Support 库。

通过阅读 `安装 Support 库` 文档和安装 `v7 appcompat 库` 来开始（下载完库包之后，按照 `添加资源库` 的说明来添加）。

一旦 Support 库集成到你的 app 工程之中：

1. 更新 activity，以便于它继承于 ActionBarActivity。例如：
```java
public class MainActivity extends ActionBarActivity { ... }
```

2. 在 mainfest 文件中，更新 `<application>` 元素或者单一的 `<activity>` 元素来使用一个 `Theme.AppCompat` 主题。例如：
```xml
<activity android:theme="@style/Theme.AppCompat.Light" ... >
```

>注释：如果创建一个自定义主题，需确保它使用一个 Theme.AppCompat 主题作为父辈。详情请参加 [Action bar 的式样](http://developer.android.com/training/basics/actionbar/styling.html)

当 app 运行在 Android 2.1(API level 7) 或者以上时，activity 将包含 action bar。

切记，在 manifest 中正确地设置 app 支持的 API level：

```xml
<manifest ... >
    <uses-sdk android:minSdkVersion="7"  android:targetSdkVersion="18" />
    ...
</manifest>
```

