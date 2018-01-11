# 与其他 Fragment 交互

> 编写：[fastcome1985] - 原文：<https://developer.android.com/training/basics/fragments/communicating.html>

为了重用 Fragment UI 组件，你应该把每个 Fragment 都构建成完全自包含的、模块化的组件，即，定义它们自己的布局与行为。一旦你定义了这些可重用的 Fragment，你就可以通过应用程序逻辑让它们关联到 Activity，以实现整体的复合 UI。

通常 Fragment 之间可能会需要交互，比如基于用户事件的内容变更。所有 Fragment 之间的交互应通过与之关联的 Activity 来完成。两个 Fragment 之间不应直接交互。

## 定义接口

为了让 Fragment 与包含它的 Activity 进行交互，可以在 Fragment 类中定义一个接口，并在 Activity 中实现。该 Fragment 在它的 onAttach() 方法生命周期中获取该接口的实现，然后调用接口的方法，以便与 Activity 进行交互。（译注：意即，若该 Fragment 中实现了 onAttach() 方法，则会被自动调用。）

以下是 Fragment 与 Activity 交互的例子：

```java
public class HeadlinesFragment extends ListFragment {
    OnHeadlineSelectedListener mCallback;

    // 容器 Activity 必须实现该接口
    // （译注：“容器 Activity”意即“包含该 Fragment 的 Activity”）
    public interface OnHeadlineSelectedListener {
        public void onArticleSelected(int position);
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);

        // 确认容器 Activity 已实现该回调接口。否则，抛出异常
        try {
            mCallback = (OnHeadlineSelectedListener) activity;
        } catch (ClassCastException e) {
            throw new ClassCastException(activity.toString()
                    + " must implement OnHeadlineSelectedListener");
        }
    }

    ...
}
```

现在 Fragment 可以通过调用 `mCallback`（`OnHeadlineSelectedListener` 接口的实例）的 `onArticleSelected()` 方法（也可以是其它方法）与 Activity 进行消息传递。

例如，当用户点击列表条目时，Fragment 中的下面的方法将被调用。Fragment 用回调接口将事件传递给父 Activity。

```java
    @Override
    public void onListItemClick(ListView l, View v, int position, long id) {
        // 向宿主 Activity 传送事件
        mCallback.onArticleSelected(position);
    }
```

## 实现接口

为了接收回调事件，宿主 Activity 必须实现在 Fragment 中定义的接口。

例如，下面的 Activity 实现了上面例子中的接口。

```java
public static class MainActivity extends Activity
        implements HeadlinesFragment.OnHeadlineSelectedListener{
    ...

    public void onArticleSelected(int position) {
        // 用户从 HeadlinesFragment 选择了一篇文章的标题
        // 在这里做点什么，以显示该文章
    }
}
```

## 向 Fragment 传递消息

宿主 Activity 通过 [findFragmentById()] 获取 [Fragment] 的实例，然后直接调用 Fragment 的 public 方法向 Fragment 传递消息。

例如，假设上面所示的 Activity 可能包含另一个 Fragment，该 Fragment 用于展示从上面的回调方法中返回的指定的数据。在这种情况下，Activity 可以把从回调方法中接收到的信息传递到这个展示数据的 Fragment。

```java
public static class MainActivity extends Activity
        implements HeadlinesFragment.OnHeadlineSelectedListener{
    ...

    public void onArticleSelected(int position) {
        // 用户从 HeadlinesFragment 选择了一篇文章的标题
        // 在这里做点什么，以显示该文章

        ArticleFragment articleFrag = (ArticleFragment)
                getSupportFragmentManager().findFragmentById(R.id.article_fragment);

        if (articleFrag != null) {
            // 若 articleFrag 有效，则表示我们正在处理两格布局（two-pane layout）……

            // 调用 ArticleFragment 的方法，以更新其内容
            articleFrag.updateArticleView(position);
        } else {
            // 否则，我们正在处理单格布局（one-pane layout）。此时需要 swap frags...

            // 创建 Fragment，向其传递包含被选文章的参数
            ArticleFragment newFragment = new ArticleFragment();
            Bundle args = new Bundle();
            args.putInt(ArticleFragment.ARG_POSITION, position);
            newFragment.setArguments(args);

            FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

            // 无论 fragment_container 视图里是什么，用该 Fragment 替换它。并将
            // 该事务添加至回栈，以便用户可以往回导航（译注：回栈，即 Back Stack。
            // 在有多个 Activity 的 APP 中，将这些 Activity 按创建次序组织起来的
            // 栈，称为回栈）
            transaction.replace(R.id.fragment_container, newFragment);
            transaction.addToBackStack(null);

            // 执行事务
            transaction.commit();
        }
    }
}
```


[fastcome1985]: https://github.com/fastcome1985

[findFragmentById()]: http://developer.android.com/reference/android/support/v4/app/FragmentManager.html#findFragmentById(int)
[Fragment]: http://developer.android.com/reference/android/support/v4/app/Fragment.html
