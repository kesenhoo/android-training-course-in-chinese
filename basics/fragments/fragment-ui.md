# 建立灵活动态的 UI

> 编写：[fastcome1985] - 原文：<https://developer.android.com/training/basics/fragments/fragment-ui.html>

在设计支持各种屏幕尺寸的应用时，你可以在不同的布局配置中重复使用 Fragment，以便根据相应的屏幕空间提供更出色的用户体验。

例如，一次只显示一个 Fragment 可能就很适合手机这种单窗格界面，但在平板电脑上，你可能需要设置并列的 Fragment，因为平板电脑的屏幕尺寸较宽阔，可向用户显示更多信息。

![][fragments-screen-mock]

**图1：** 两个 Fragment，显示在不同尺寸屏幕上同一 Activity 的不同配置中。在较宽阔的屏幕上，两个 Fragment 可并列显示；在手机上，一次只能显示一个 Fragment，因此必须在用户导航时更换 Fragment。

利用 [FragmentManager] 类提供的方法，你可以在运行时添加、移除和替换 Activity 中的 Fragment，以便为用户提供一种动态体验。

## 在运行时向 Activity 添加 Fragment

你可以在 Activity 运行时向其添加 Fragment，而不用像 [上一课] 中介绍的那样，使用 `<fragment>` 元素在布局文件中为 Activity 定义 Fragment。如果你打算在 Activity 运行周期内更改 Fragment，就必须这样做。

要执行添加或移除 Fragment 等事务，你必须使用 [FragmentManager] 创建一个 [FragmentTransaction]，后者可提供用于执行添加、移除、替换以及其他 Fragment 事务的 API。

如果 Activity 中的 Fragment 可以移除和替换，你应在调用 Activity 的 [onCreate()] 方法期间为 Activity 添加初始 Fragment(s)。

在处理 Fragment（特别是在运行时添加的 Fragment）时，请谨记以下重要规则：必须在布局中为 Fragment 提供 [View] 容器，以便保存 Fragment 的布局。

下面是 [上一课] 所示布局的替代布局，这种布局一次只会显示一个 Fragment。要用一个 Fragment 替换另一个 Fragment，Activity 的布局中需要包含一个作为 Fragment 容器的空 [FrameLayout]。

请注意，该文件名与上一课中布局文件的名称相同，但布局目录没有 `large` 这一限定符。因此，此布局会在设备屏幕小于“large”的情况下使用，原因是尺寸较小的屏幕不适合同时显示两个 Fragment。

res/layout/news_articles.xml:

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragment_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

在 Activity 中，用 Support Library API 调用 [getSupportFragmentManager()] 以获取 [FragmentManager]，然后调用 [beginTransaction()] 创建 [FragmentTransaction]，然后调用 [add()] 添加 Fragment。

你可以使用同一个 [FragmentTransaction] 对 Activity 执行多 Fragment 事务。当你准备好进行更改时，必须调用 [commit()]。

例如，下面介绍了如何为上述布局添加 Fragment：

```java
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;

public class MainActivity extends FragmentActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.news_articles);

        // 确认 Activity 使用的布局版本包含 fragment_container FrameLayout
        if (findViewById(R.id.fragment_container) != null) {

            // 不过，如果我们要从先前的状态还原，则无需执行任何操作而应返回，否则
            // 就会得到重叠的 Fragment。
            if (savedInstanceState != null) {
                return;
            }

            // 创建一个要放入 Activity 布局中的新 Fragment
            HeadlinesFragment firstFragment = new HeadlinesFragment();

            // 如果此 Activity 是通过 Intent 发出的特殊指令来启动的，
            // 请将该 Intent 的 extras 以参数形式传递给该 Fragment
            firstFragment.setArguments(getIntent().getExtras());

            // 将该 Fragment 添加到“fragment_container” FrameLayout 中
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.fragment_container, firstFragment).commit();
        }
    }
}
```

由于该 Fragment 已在运行时添加到 [FrameLayout] 容器中，而不是在 Activity 布局中通过 `<fragment>` 元素进行定义，因此该 Activity 可以移除和替换这个 Fragment。

## 用一个 Fragment 替换另一个 Fragment

替换 Fragment 的步骤与添加 Fragment 的步骤相似，但需要调用 [replace()] 方法，而非 [add()]。

请注意，当你执行替换或移除 Fragment 等 Fragment 事务时，最好能让用户向后导航和“撤消”所做更改。要通过 Fragment 事务允许用户向后导航，你必须调用 [addToBackStack()]，然后再执行 [FragmentTransaction]。

> **注：** 当你移除或替换 Fragment 并向返回堆栈添加事务时，已移除的 Fragment 会停止（而不是销毁）。如果用户向后导航，还原该 Fragment，它会重新启动。如果你没有向返回堆栈添加事务，那么该 Fragment 在移除或替换时就会被销毁。

替换 Fragment 的示例：

```java
// 创建 Fragment 并为其添加一个参数，用来指定应显示的文章
ArticleFragment newFragment = new ArticleFragment();
Bundle args = new Bundle();
args.putInt(ArticleFragment.ARG_POSITION, position);
newFragment.setArguments(args);

FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

// 将 fragment_container View 中的内容替换为此 Fragment，
// 然后将该事务添加到返回堆栈，以便用户可以向后导航
transaction.replace(R.id.fragment_container, newFragment);
transaction.addToBackStack(null);

// 执行事务
transaction.commit();
```

[addToBackStack()] 方法可接受可选的字符串参数，来为事务指定独一无二的名称。除非你打算使用 [FragmentManager.BackStackEntry] API 执行高级 Fragment 操作，否则无需使用此名称。


[fastcome1985]: https://github.com/fastcome1985

[FragmentManager]: https://developer.android.com/reference/android/support/v4/app/FragmentManager.html
[上一课]: ./creating.html
[FragmentTransaction]: https://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html
[onCreate()]: https://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)
[View]: https://developer.android.com/reference/android/view/View.html
[FrameLayout]: https://developer.android.com/reference/android/widget/FrameLayout.html
[getSupportFragmentManager()]: https://developer.android.com/reference/android/support/v4/app/FragmentActivity.html#getSupportFragmentManager()
[beginTransaction()]: https://developer.android.com/reference/android/support/v4/app/FragmentManager.html#beginTransaction()
[add()]: https://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#add(android.support.v4.app.Fragment,%20java.lang.String)
[commit()]: https://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#commit()
[replace()]: https://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#replace(int,%20android.support.v4.app.Fragment)
[addToBackStack()]: https://developer.android.com/reference/android/support/v4/app/FragmentTransaction.html#addToBackStack(java.lang.String)
[FragmentManager.BackStackEntry]: https://developer.android.com/reference/android/support/v4/app/FragmentManager.BackStackEntry.html

[fragments-screen-mock]: ./fragments-screen-mock.png
