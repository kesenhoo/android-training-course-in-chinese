# 创建一个Fragment

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/basics/fragments/creating.html>

* 你可以把fragment想象成activity中一个模块化的部分，它拥有自己的生命周期，接收自己的输入事件，可以在acvitity运行过程中添加或者移除（有点像"子activity"，你可以在不同的activities里面重复使用）。这一课教你继承[Support Library ](http://developer.android.com/tools/support-library/index.html)中的[Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)，以使你的应用在Android1.6这样的低版本上仍能保持兼容。

> **Note：** 如果的你的APP的最低API版本是11或以上，你不必使用Support Library，你可以直接使用API框架里面的[Fragment](http://developer.android.com/reference/android/app/Fragment.html)，这节课主要是讲基于Support Library的API，Support Library有一个特殊的包名，有时候与平台版本的API名字有些轻微的不一样。

* 在开始这节课前，你必须先让你的项目引用Support Library。如果你没有使用过Support Library，你可以根据文档  [Support Library Setup](http://developer.android.com/intl/zh-cn/tools/support-library/setup.html) 来设置你的项目使用Support Library。当然，你也可以使用包含[action bar](http://developer.android.com/guide/topics/ui/actionbar.html)的 **v7 appcompat** library。v7 appcompat library 兼容Android2.1(API level 7)，也包含了[Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html) APIs。

## 创建一个Fragment类

* 创建一个fragment，首先需要继承[Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)类，然后在关键的生命周期方法中插入你APP的逻辑，就像[activity](http://developer.android.com/reference/android/app/Activity.html)一样。

* 其中一个区别是当你创建[Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)的时候，你必须重写<a href="http://developer.android.com/reference/android/support/v4/app/Fragment.html#onCreateView(android.view.LayoutInflater, android.view.ViewGroup, android.os.Bundle)">onCreateView()</a>回调方法来定义你的布局。事实上，这是使Fragment运行起来，唯一一个需要你重写的回调方法。比如，下面是一个自定义布局的示例fragment.

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

* 就像activity一样，当fragment从activity添加或者移除、当activity生命周期发生变化时，fragment应该是实现生命周期回调来管理它的状态。例如，当activity的onPause()被调用时，它里面的所有fragment的onPause()方法也会被触发。

更多关于fragment的声明周期和回调方法，详见[Fragments](http://developer.android.com/guide/components/fragments.html) developer guide.

## 用XML将fragment添加到activity


* fragments是可以重用的，模块化的UI组件，每一个Fragment的实例都必须与一个[FragmentActivity](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html)关联。你可以在activity的XML布局文件中定义每一个fragment来实现这种关联。

> **Notes：**[FragmentActivity](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html)是Support Library提供的一个特殊activity ，用来在API11版本以下的系统上处理fragment。如果你APP中的最低版本大于等于11，你可以使用普通的[Activity](http://developer.android.com/reference/android/app/Activity.html)。

* 下面是一个XML布局的例子，当屏幕被认为是large(用目录名称中的`large`字符来区分)时，它在布局中增加了两个fragment.

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

> **Notes：**更多关于不同屏幕尺寸创建不同布局的信息，请阅读[Supporting Different Screen Sizes](../../ui/multiscreen/screen-sizes.html)

* 然后将这个布局文件用到你的activity中。

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

* 如果你用的是[ v7 appcompat library](http://developer.android.com/intl/zh-cn/tools/support-library/features.html#v7-appcompat)，你的activity应该改为继承[ActionBarActivity](http://developer.android.com/reference/android/support/v7/app/ActionBarActivity.html)，ActionBarActivity是FragmentActivity的一个子类（更多关于这方面的内容，请阅读[Adding the Action Bar](http://developer.android.com/training/basics/actionbar/index.html)）。

> **Note：**当你用XML布局文件的方式将Fragment添加进activity时，你的Fragment是不能被动态移除的。如果你想要在用户交互的时候把fragment切入与切出，你必须在activity启动后，再将fragment添加进activity。这将在下节课讲到。
