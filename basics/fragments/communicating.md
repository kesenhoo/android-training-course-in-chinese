# Fragments之间的交互

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/basics/fragments/communicating.html>

* 为了重用Fragment UI组件，我们应该把每一个fragment都构建成完全的自包含的、模块化的组件，定义他们自己的布局与行为。定义好这些模块化的Fragment后，就可以让他们关联activity，使他们与application的逻辑结合起来，实现全局的复合的UI。

* 通常fragment之间可能会需要交互，比如基于用户事件改变fragment的内容。所有fragment之间的交互需要通过他们关联的activity，两个fragment之间不应该直接交互。

## 定义一个接口

* 为了让fragment与activity交互，可以在Fragment 类中定义一个接口，并在activity中实现。Fragment在他们生命周期的onAttach()方法中获取接口的实现，然后调用接口的方法来与Activity交互。

下面是一个fragment与activity交互的例子：

```java
public class HeadlinesFragment extends ListFragment {
    OnHeadlineSelectedListener mCallback;

    // Container Activity must implement this interface
    public interface OnHeadlineSelectedListener {
        public void onArticleSelected(int position);
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);

        // This makes sure that the container activity has implemented
        // the callback interface. If not, it throws an exception
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

* 现在Fragment就可以通过调用`OnHeadlineSelectedListener`接口实例的`mCallback`中的`onArticleSelected()`（也可以是其它方法）方法与activity传递消息。

* 举个例子，在fragment中的下面的方法在用户点击列表条目时被调用，fragment 用回调接口来传递事件给父Activity.

```java
 @Override
    public void onListItemClick(ListView l, View v, int position, long id) {
        // Send the event to the host activity
        mCallback.onArticleSelected(position);
    }
```

## 实现接口

* 为了接收回调事件，宿主activity必须实现在Fragment中定义的接口。

* 举个例子，下面的activity实现了上面例子中的接口。

```java
public static class MainActivity extends Activity
        implements HeadlinesFragment.OnHeadlineSelectedListener{
    ...

    public void onArticleSelected(int position) {
        // The user selected the headline of an article from the HeadlinesFragment
        // Do something here to display that article
    }
}
```


## 传消息给Fragment

* 宿主activity通过<a href="http://developer.android.com/reference/android/support/v4/app/FragmentManager.html#findFragmentById(int)">findFragmentById()</a>方法获取[fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)的实例，然后直接调用Fragment的public方法来向fragment传递消息。

* 例如，假设上面所示的activity可能包含另外一个fragment,这个fragment用来展示从上面的回调方法中返回的指定的数据。在这种情况下，activity可以把从回调方法中接收到的信息传递给这个展示数据的Fragment.

```java
public static class MainActivity extends Activity
        implements HeadlinesFragment.OnHeadlineSelectedListener{
    ...

    public void onArticleSelected(int position) {
        // The user selected the headline of an article from the HeadlinesFragment
        // Do something here to display that article

        ArticleFragment articleFrag = (ArticleFragment)
                getSupportFragmentManager().findFragmentById(R.id.article_fragment);

        if (articleFrag != null) {
            // If article frag is available, we're in two-pane layout...

            // Call a method in the ArticleFragment to update its content
            articleFrag.updateArticleView(position);
        } else {
            // Otherwise, we're in the one-pane layout and must swap frags...

            // Create fragment and give it an argument for the selected article
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
        }
    }
}
```
