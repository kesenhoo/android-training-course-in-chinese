# 创建一个 Fragment

> 编写：[fastcome1985](https://github.com/fastcome1985) - 原文：<http://developer.android.com/training/basics/fragments/creating.html>

我们可以把 Fragment 想象成 Activity 中一个模块化的部分，它拥有自己的生命周期，接收自己的输入事件，可以在 Acvitity 运行过程中添加或者移除（有点像“子 Activity”，可以在不同的 Activity 里面重复使用）。这一课教我们将学习继承 [Support Library](http://developer.android.com/tools/support-library/index.html) 中的 [Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)，使应用在 Android 1.6 这样的低版本上仍能保持兼容。

> **Note：** 如果 APP 的最低 API 版本是 11 或以上，则不必使用 Support Library，我们可以直接使用 API 框架中的 [Fragment](http://developer.android.com/reference/android/app/Fragment.html)，本课主要讲解基于 Support Library 的 API，Support Library 有一个特殊的包名，有时与平台版本的 API 名字存在略微不同。

在开始这节课前，必须先让在项目中引用 Support Library。如果没有使用过 Support Library，可以根据文档 [Support Library Setup](http://developer.android.com/intl/zh-cn/tools/support-library/setup.html) 来设置项目使用 Support Library。当然，也可以使用包含 [Action Bar](http://developer.android.com/guide/topics/ui/actionbar.html) 的 **v7 appcompat** library。v7 appcompat library 兼容 Android 2.1 (API level 7)，也包含了 [Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html) API。

## 创建一个 Fragment 类

* 创建一个 Fragment，首先需要继承 [Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html) 类，然后在关键的生命周期方法中插入 APP 的逻辑，就像 [Activity](http://developer.android.com/reference/android/app/Activity.html) 一样。

* 其中一个区别是当创建 [Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html) 的时，必须重写 <a href="http://developer.android.com/reference/android/support/v4/app/Fragment.html#onCreateView(android.view.LayoutInflater, android.view.ViewGroup, android.os.Bundle)">onCreateView()</a> 回调方法来定义布局。事实上，这是使 Fragment 运行起来，唯一一个需要我们重写的回调方法。比如，下面是一个自定义布局的示例 Fragment。

```java
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.ViewGroup;

public class ArticleFragment extends Fragment {
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
        Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.article_view, container, false);
    }
}
```

* 就像 Activity 一样，当 Fragment 从 Activity 添加或者移除、当 Activity 生命周期发生变化时，Fragment 通过生命周期回调函数管理其状态。例如，当 Activity 的 onPause() 被调用时，它里面的所有 Fragment 的 onPause() 方法也会被触发。

更多关于 Fragment 的声明周期和回调方法，详见 [Fragments](http://developer.android.com/guide/components/fragments.html) developer guide.

## 用 XML 将 Fragment 添加到 Activity

* Fragments 是可重用的，模块化的 UI 组件，每个 Fragment 的实例都必须与一个 [FragmentActivity](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html) 关联。我们可以在 Activity 的 XML 布局文件中定义每一个 Fragment 来实现这种关联。

> **Notes：** [FragmentActivity](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html) 是 Support Library 提供的一个特殊 Activity，用于处理 API 11 版本以下的 Fragment。如果我们 APP 中的最低版本大于等于 11，则可以使用普通的 [Activity](http://developer.android.com/reference/android/app/Activity.html)。

* 下面是一个 XML 布局的例子，当屏幕被认为是 large（用目录名称中的 `large` 字符来区分）时，它在布局中增加了两个 Fragment。

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

> **Notes：** 更多关于不同屏幕尺寸创建不同布局的信息，请阅读 [Supporting Different Screen Sizes](../../ui/multiscreen/screen-sizes.html)。

* 然后将这个布局文件用到 Activity 中。

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

* 如果用的是 [v7 appcompat library](http://developer.android.com/intl/zh-cn/tools/support-library/features.html#v7-appcompat)，Activity 应该改为继承 [ActionBarActivity](http://developer.android.com/reference/android/support/v7/app/ActionBarActivity.html)，ActionBarActivity 是 FragmentActivity 的一个子类（更多关于这方面的内容，请阅读 [Adding the Action Bar](http://developer.android.com/training/basics/actionbar/index.html)）。

> **Note：** 当通过 XML 布局文件的方式将 Fragment 添加进 Activity 时，Fragment 是不能被动态移除的。如果想要在用户交互的时候把 Fragment 切入与切出，必须在 Activity 启动后，再将 Fragment 添加进 Activity。这部分内容将在下节课阐述。
