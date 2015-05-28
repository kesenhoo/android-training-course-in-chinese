<!--# Searching within TV Apps #-->
# TV应用内搜索

> 编写:[awong1900](https://github.com/awong1900) - 原文:http://developer.android.com/training/tv/discovery/in-app-search.html

<!--Users frequently have specific content in mind when using a media app on TV. If your app contains a large catalog of content, browsing for a specific title may not be the most efficient way for users to find what they are looking for. A search interface can help your users get to the content they want faster than browsing.-->

当在TV上用媒体应用时，用户脑中通常有期望的内容。如果我们的应用包含一个大的内容目录，为用户找到他们想找到的内容时，用特定的标题浏览可能不是最有效的方式。一个搜索界面能帮助用户获得他们想快速浏览的内容。

<!--The Leanback support library provides a set of classes to enable a standard search interface within your app that is consistent with other search functions on TV and provides features such as voice input.-->

[Leanback support library](http://developer.android.com/tools/support-library/features.html#v17-leanback)提供一套类库去使用标准的搜索界面。在我们的应用内使用类库，可以和TV其他搜索功能，如语音搜索，获得一致性。

<!--This lesson discusses how to provide a search interface in your app using Leanback support library classes.-->

这节课讨论如何在我们的应用中用Leanback支持类库提供搜索界面。

<!--## Add a Search Action ##-->
## 添加搜索操作

<!--When you use the BrowseFragment class for a media browsing interface, you can enable a search interface as a standard part of the user interface. The search interface is an icon that appears in the layout when you set View.OnClickListener on the BrowseFragment object. The following sample code demonstrates this technique.-->

当我们用[BroweseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)类做一个媒体浏览界面时，我们能使用搜索界面作为用户界面的一个标准部分。当我们设置[View.OnClickListener](http://developer.android.com/reference/android/view/View.OnClickListener.html)在[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)对象时，搜索界面作为一个图标出现在布局中。接下来的示例代码展示了这个技术。

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.browse_activity);

    mBrowseFragment = (BrowseFragment)
            getFragmentManager().findFragmentById(R.id.browse_fragment);

    ...

    mBrowseFragment.setOnSearchClickedListener(new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            Intent intent = new Intent(BrowseActivity.this, SearchActivity.class);
            startActivity(intent);
        }
    });

    mBrowseFragment.setAdapter(buildAdapter());
}
```

<!-->**Note**: You can set the color of the search icon using the setSearchAffordanceColor(int).-->

>**Note**：我们能设置搜索图标的颜色用[setSearchAffordanceColor(int)](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html#setSearchAffordanceColor(int))。


<!--## Add a Search Input and Results-->
## 添加搜索输入和结果展示

<!--When a user selects the search icon, the system invokes a search activity via the defined intent. Your search activity should use a linear layout containing a SearchFragment. This fragment must also implement the SearchFragment.SearchResultProvider interface in order to display the results of a search.-->

当用户选择搜索图标，系统通过定义的intent关联一个搜索activity。我们的搜索activity应该用包括[SearchFragment](http://developer.android.com/reference/android/support/v17/leanback/app/SearchFragment.html)的线性布局。这个fragment必须实现[SearchFragment.SearchResultProvider](http://developer.android.com/reference/android/support/v17/leanback/app/SearchFragment.SearchResultProvider.html)界面去显示搜索结果。

<!--The following code sample shows how to extend the SearchFragment class to provide a search interface and results:-->

接下来的示例代码展示了如何扩展[SearchFragment](http://developer.android.com/reference/android/support/v17/leanback/app/SearchFragment.html)类去提供搜索界面和结果：

```java
public class MySearchFragment extends SearchFragment
        implements SearchFragment.SearchResultProvider {

    private static final int SEARCH_DELAY_MS = 300;
    private ArrayObjectAdapter mRowsAdapter;
    private Handler mHandler = new Handler();
    private SearchRunnable mDelayedLoad;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mRowsAdapter = new ArrayObjectAdapter(new ListRowPresenter());
        setSearchResultProvider(this);
        setOnItemClickedListener(getDefaultItemClickedListener());
        mDelayedLoad = new SearchRunnable();
    }

    @Override
    public ObjectAdapter getResultsAdapter() {
        return mRowsAdapter;
    }

    @Override
    public boolean onQueryTextChange(String newQuery) {
        mRowsAdapter.clear();
        if (!TextUtils.isEmpty(newQuery)) {
            mDelayedLoad.setSearchQuery(newQuery);
            mHandler.removeCallbacks(mDelayedLoad);
            mHandler.postDelayed(mDelayedLoad, SEARCH_DELAY_MS);
        }
        return true;
    }

    @Override
    public boolean onQueryTextSubmit(String query) {
        mRowsAdapter.clear();
        if (!TextUtils.isEmpty(query)) {
            mDelayedLoad.setSearchQuery(query);
            mHandler.removeCallbacks(mDelayedLoad);
            mHandler.postDelayed(mDelayedLoad, SEARCH_DELAY_MS);
        }
        return true;
    }
}
```

<!--The example code shown above is meant to be used with a separate SearchRunnable class that runs the search query on a separate thread. This technique keeps potentially slow-running queries from blocking the main user interface thread.-->

上面的示例代码展示了在分开的线程用独立的`SearchRunnable`类去运行搜索请求。这个技巧是从正在阻塞的主线程保持了潜在的慢运行请求。

----------------
[下一节: 创建TV游戏应用 >](../games/index.html)
