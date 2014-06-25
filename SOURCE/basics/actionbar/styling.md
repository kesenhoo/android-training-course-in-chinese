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











