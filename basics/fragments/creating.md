# 创建 Fragment

> 编写：[fastcome1985] - 原文：<https://developer.android.com/training/basics/fragments/creating.html>

可以把 Fragment 想象成 Activity 的模块，它拥有自己的生命周期、接收输入事件，可以在 Acvitity 运行过程中添加或者移除（有点像“子 Activity”，可以在不同的 Activity 里重复使用）。这一课教我们将学习继承 [Support Library] 中的 [Fragment]，使 APP 在 Android 1.6 这样的低版本上仍能保持兼容。

在开始之前，必须在项目中先引用 Support Library。如果你从未使用过 Support Library，可根据文档 [设置 Support Library] 在项目中使用 **v4** 库。当然，也可以使用包含 [APP Bar] 的 **v7 appcompat** 库。该库兼容 Android 2.1 (API level 7)，同时也包含了 [Fragment] API。

## 创建 Fragment 类

首先从 [Fragment] 继承并创建 Fragment，然后在关键的生命周期方法中插入代码（就和在处理 [Activity] 时一样）。

其中一个区别是：创建 [Fragment] 时，必须重写 [onCreateView()] 回调方法来定义布局。事实上，这是唯一一个为使 Fragment 运行起来需要重写的回调方法。比如，下面是一个自定义布局的示例 Fragment：

```java
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.ViewGroup;

public class ArticleFragment extends Fragment {
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
        Bundle savedInstanceState) {
        // 拉伸该 Fragment 的布局
        return inflater.inflate(R.layout.article_view, container, false);
    }
}
```

和 Activity 一样，当 Fragment 从 Activity 添加或者移除、或 Activity 生命周期发生变化时，Fragment 通过生命周期回调函数管理其状态。例如，当 Activity 的 [onPause()<!--Activity.onPause()-->] 被调用时，它内部所有 Fragment 的 [onPause()<!--Fragment.onPause()-->] 方法也会被触发。

更多关于 Fragment 的声明周期和回调方法，详见 [Fragments] 开发指南.

## 用 XML 将 Fragment 添加到 Activity

Fragments 是可重用的、模块化的 UI 组件。每个 [Fragment] 实例都必须与一个 [FragmentActivity] 关联。我们可以在 Activity 的 XML 布局文件中逐个定义 Fragment 来实现这种关联。

> **注：** [FragmentActivity] 是 Support Library 提供的一种特殊 Activity，用于处理 API 11 版本以下的 Fragment。如果我们 APP 中的最低版本大于等于 11，则可以使用普通的 [Activity]。

以下是一个 XML 布局的例子：当屏幕被认为是 "large"（用目录名称中的 `large` 字符来区分）时，它在布局中增加了两个 Fragment。

res/layout-large/news_articles.xml

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="horizontal"
    android:layout_width="fill_parent"
    android:layout_height="fill_parent">

    <fragment android:name="com.example.android.fragments.HeadlinesFragment"
              android:id="@+id/headlines_fragment"
              android:layout_weight="1"
              android:layout_width="0dp"
              android:layout_height="match_parent" />

    <fragment android:name="com.example.android.fragments.ArticleFragment"
              android:id="@+id/article_fragment"
              android:layout_weight="2"
              android:layout_width="0dp"
              android:layout_height="match_parent" />

</LinearLayout>
```

> **提示：** 更多关于不同屏幕尺寸创建不同布局的信息，请阅读 [兼容不同屏幕尺寸]。

然后将这个布局文件用到 Activity 中。

```java
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;

public class MainActivity extends FragmentActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.news_articles);
    }
}
```

如果使用 [v7 appcompat 库]，Activity 应该改为继承自 [AppCompatActivity]，AppCompatActivity 是 [FragmentActivity] 的子类（更多关于这方面的内容，请阅读 [添加 App Bar]）。

> **注：** 当通过 XML 布局文件的方式将 Fragment 添加进 Activity 时，Fragment 是不能被动态移除的。如果想要在用户交互的时候把 Fragment 切入与切出，必须在 Activity 启动后，再将 Fragment 添加进 Activity。这部分内容将在下节课阐述。


[fastcome1985]: https://github.com/fastcome1985

[Support Library]: https://developer.android.com/tools/support-library/index.html
[Fragment]: https://developer.android.com/reference/android/support/v4/app/Fragment.html
[设置 Support Library]: https://developer.android.com/tools/support-library/setup.html
[Action Bar]: http://developer.android.com/guide/topics/ui/actionbar.html
[APP Bar]: https://developer.android.com/training/appbar/index.html
[Activity]: https://developer.android.com/reference/android/app/Activity.html
[onCreateView()]: https://developer.android.com/reference/android/support/v4/app/Fragment.html#onCreateView(android.view.LayoutInflater,%20android.view.ViewGroup,%20android.os.Bundle)
[onPause()<!--Activity.onPause()-->]: https://developer.android.com/reference/android/app/Activity.html#onPause()
[onPause()<!--Fragment.onPause()-->]: https://developer.android.com/reference/android/support/v4/app/Fragment.html#onPause()
[Fragments]: https://developer.android.com/guide/components/fragments.html
[FragmentActivity]: https://developer.android.com/reference/android/support/v4/app/FragmentActivity.html
[兼容不同屏幕尺寸]: ../../ui/multiscreen/screen-sizes.html
[v7 appcompat 库]: https://developer.android.com/tools/support-library/features.html#v7-appcompat
[AppCompatActivity]: https://developer.android.com/reference/android/support/v7/app/AppCompatActivity.html
[FragmentActivity]: https://developer.android.com/reference/android/support/v4/app/FragmentActivity.html
[添加 App Bar]: https://developer.android.com/training/appbar/index.html
<!--
TODO:
翻译 https://developer.android.com/training/appbar/index.html
-->
