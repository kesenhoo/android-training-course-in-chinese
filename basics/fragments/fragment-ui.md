# 建立灵活动态的UI

> 编写：[fastcome1985](https://github.com/fastcome1985) - 原文：<http://developer.android.com/training/basics/fragments/fragment-ui.html>

* 如果我们的 APP 设计成要支持范围广泛的屏幕尺寸时，在可利用的屏幕空间内，我们可以通过在不同的布局配置中重用 Fragment 来优化用户体验。

* 比如，一个手持设备可能适合一次只有一个 Fragment 的单面板用户交互。而在更大屏幕尺寸的平板电脑上，我们可能更想要两个 Fragment 并排在一起，用来向用户展示更多信息。

![fragments-screen-mock](fragments-screen-mock.png)

**图1：** 两个 Fragments，在同一个 Activity 不同屏幕尺寸中用不同的配置来展示。在大屏幕上，两个 Fragment 被并排放置，在手持设备上，一次只放置一个 Fragment，所以在用户导航中，两个 Fragment 必须进行替换。

* [FragmentManager](http://developer.android.com/reference/android/support/v4/app/FragmentManager.html) 类为在 Activity 运行时对 Fragment 进行添加，移除，替换等操作提供了方法，来实现动态的用户体验。

## 在 Activity 运行时添加 Fragment

* 比起用 `<fragment>` 标签在 Activity 的布局文件中定义 Fragment，就像 [上节课](creating.html) 说的，我们还可以在 Activity 运行时动态添加 Fragment，如果打算在 Activity 的生命周期内替换 Fragment，这是必须的。

* 为了执行 Fragment 的增加或者移除操作，必须通过 [FragmentManager](http://developer.android.com/reference/android/support/v4/app/FragmentManager.html) 创建一个 [FragmentTransaction](http://developer.android.com/intl/zh-cn/reference/android/support/v4/app/FragmentTransaction.html) 对象, FragmentTransaction 提供了用来增加、移除、替换以及其它一些操作的 API。

* 如果我们的 Activity 允许 Fragment 移除或者替换，我们应该在 Activity 的 <a href="http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)">onCreate()</a> 方法中添加初始化 Fragment(s)。

* 运用 Fragment（尤其是那些在运行时添加的）的一个很重要的规则就是在布局中必须有一个容器 [View](http://developer.android.com/reference/android/view/View.html)，Fragment 的 Layout 将会放在这个 View 里面。

* 下面的这个布局是 [上节课](creating.html) 的一次只显示一个 Fragment 的布局的替代布局。为了替换 Fragment，这个 Activity 的布局包含了一个空的 [FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html) 作为 Fragment 的容器。

* 注意文件名与上节课的布局一样，但是文件目录没有 `large` 标识， 所以这一布局将会在比 large 小的屏幕上被使用，因为该屏幕无法满足同时放置两个 Fragments。

res/layout/news_articles.xml:

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragment_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

* 在 Activity 中，用 Support Library API 调用 [getSupportFragmentManager()](http://developer.android.com/intl/zh-cn/reference/android/support/v4/app/FragmentActivity.html#getSupportFragmentManager%28%29) 方法获取 [FragmentManager](http://developer.android.com/reference/android/support/v4/app/FragmentManager.html) 对象，然后调用 <a href="http://developer.android.com/reference/android/support/v4/app/FragmentManager.html#beginTransaction()">beginTransaction()</a> 方法创建一个 [FragmentTransaction](http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html) 对象，然后调用 <a href="http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#add(android.support.v4.app.Fragment,%20java.lang.String)">add()</a> 方法添加一个 Fragment。

* 可以使用同一个 [FragmentTransaction](http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html) 进行多次 Fragment 事务。完成这些变化操作，准备开始执行改变时，必须调用 <a href="http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#commit()">commit()</a> 方法。

下例显示了如何添加一个 Fragment 到之前的 Layout 中：

```java
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;

public class MainActivity extends FragmentActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.news_articles);

        // Check that the activity is using the layout version with
        // the fragment_container FrameLayout
        if (findViewById(R.id.fragment_container) != null) {

            // However, if we're being restored from a previous state,
            // then we don't need to do anything and should return or else
            // we could end up with overlapping fragments.
            if (savedInstanceState != null) {
                return;
            }

            // Create a new Fragment to be placed in the activity layout
            HeadlinesFragment firstFragment = new HeadlinesFragment();

            // In case this activity was started with special instructions from an
            // Intent, pass the Intent's extras to the fragment as arguments
            firstFragment.setArguments(getIntent().getExtras());

            // Add the fragment to the 'fragment_container' FrameLayout
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.fragment_container, firstFragment).commit();
        }
    }
}
```

* 因为 Fragment 是在 Activity 运行时被添加进来时（不是在 XML 布局中用 `<fragment>` 定义的），Activity 可以移除这个 Fragment 或者用另外一个来替换它。

## 替换 Fragment

* 替换 Fragment 的过程类似于添加过程，只需要将 <a href="http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#add(android.support.v4.app.Fragment,%20java.lang.String)">add()</a> 方法替换为 <a href="http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#replace(int,%20android.support.v4.app.Fragment)">replace()</a> 方法。

* 记住在执行 Fragment 事务时，如移除或者替换，我们经常要适当地让用户可以向后导航与“撤销”这次改变。为了让用户向后导航 Fragment 事务，我们必须在 [FragmentTransaction](http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html) 提交前调用 <a href="http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#addToBackStack(java.lang.String)">addToBackStack()</a> 方法。

> **Note：** 当移除或者替换一个 Fragment 并把它放入返回栈中时，被移除的 Fragment 的生命周期是 Stopped（不是 Destoryed）。当用户返回重新恢复这个 Fragment，它的生命周期是 Restarts。如果没有把 Fragment 放入返回栈中，那么当它被移除或者替换时，其生命周期是 Destoryed。

* 下面是一个 Fragment 替换的例子：

```java
// Create fragment and give it an argument specifying the article it should show
ArticleFragment newFragment = new ArticleFragment();
Bundle args = new Bundle();
args.putInt(ArticleFragment.ARG_POSITION, position);
newFragment.setArguments(args);

FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

// Replace whatever is in the fragment_container view with this fragment,
// and add the transaction to the back stack so the user can navigate back
transaction.replace(R.id.fragment_container, newFragment);
transaction.addToBackStack(null);

// Commit the transaction
transaction.commit();
```

* <a href="http://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#addToBackStack(java.lang.String)">addToBackStack()</a> 方法提供了一个可选的 String 参数为事务指定了一个唯一的名字。除非打算用 [FragmentManager.BackStackEntry](http://developer.android.com/reference/android/support/v4/app/FragmentManager.BackStackEntry.html) API 来进行一些高级的 Fragments 操作，这个名字不是必须的。
