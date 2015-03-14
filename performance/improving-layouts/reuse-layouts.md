# 使用include标签重用layouts

> 编写:[allenlsy](https://github.com/allenlsy) - 原文:<http://developer.android.com/training/improving-layouts/reusing-layouts.html>

虽然 Android 提供很多小的可重用的交互组件，你仍然可能需要重用复杂一点的组件，这也许会用到 Layout。为了高效重用整个的 Layout，你可以使用 `<include/>` 和 `<merge/>` 标签把其他 Layout 嵌入当前 Layout。

重用 Layout 非常强大，它让你可以创建复杂的可重用 Layout。比如，一个 yes/no 按钮面板，或者带有文字的自定义进度条。这也意味着，任何在多个 Layout 中重复出现的元素可以被提取出来，被单独管理，再添加到 Layout 中。所以，虽然可以添加一个自定义 View 来实现单独的 UI 组件，你可以更简单的直接重用某个 Layout 文件。

## 创建可重用 Layout

如果你已经知道你需要重用的 Layout，就先创建一个新的 XML 文件并定义 Layout 。比如，以下是一个来自 G-Kenya codelab 的 Layout，定义了一个需要添加到每个 Activity 中的标题栏（titlebar.xml)：

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width=”match_parent”
    android:layout_height="wrap_content"
    android:background="@color/titlebar_bg">

    <ImageView android:layout_width="wrap_content"
               android:layout_height="wrap_content"
               android:src="@drawable/gafricalogo" />
</FrameLayout>
```

根节点 View 就是你想添加入的 Layout 类型。

## 使用`<include>`标签

使用 `<include>` 标签，可以在 Layout 中添加可重用的组件。比如，这里有一个来自 G-Kenya codelab 的 Layout 需要包含上面的那个标题栏：

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width=”match_parent”
    android:layout_height=”match_parent”
    android:background="@color/app_bg"
    android:gravity="center_horizontal">

    <include layout="@layout/titlebar"/>

    <TextView android:layout_width=”match_parent”
              android:layout_height="wrap_content"
              android:text="@string/hello"
              android:padding="10dp" />

    ...

</LinearLayout>
```

你也可以覆写被添加的 Layout 的所有 Layout 参数（任何 android:layout_* 属性），通过在 `<include/>` 中声明他们来完成。比如：

```xml
<include android:id="@+id/news_title"
         android:layout_width="match_parent"
         android:layout_height="match_parent"
         layout="@layout/title"/>
```

然而，如果你要在 `<include>` 中覆写某些属性，你必须先覆写 `android:layout_height` 和 `android:layout_width`。

## 使用`<merge>`标签

`<merge />` 标签在你嵌套 Layout 时取消了 UI 层级中冗余的 ViewGroup 。比如，如果你有一个 Layout 是一个竖直方向的 LinearLayout，其中包含两个连续的 View 可以在别的 Layout 中重用，那么你会做一个 LinearLayout 来包含这两个 View ，以便重用。不过，当使用一个 LinearLayout 作为另一个 LinearLayout 的根节点时，这种嵌套 LinearLayout 的方式除了减慢你的 UI 性能外没有任何意义。

为了避免这种情况，你可以用 `<merge>` 元素来替代可重用 Layout 的根节点。例如：

```xml
<merge xmlns:android="http://schemas.android.com/apk/res/android">

    <Button
        android:layout_width="fill_parent"
        android:layout_height="wrap_content"
        android:text="@string/add"/>

    <Button
        android:layout_width="fill_parent"
        android:layout_height="wrap_content"
        android:text="@string/delete"/>

</merge>
```

现在，当你要将这个 Layout 包含到另一个 Layout 中时（并且使用了 `<include/>` 标签），系统会忽略 `<merge>` 标签，直接把两个 Button 放到 Layout 中 `<include>` 的所在位置。
