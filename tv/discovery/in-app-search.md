<!--# Searching within TV Apps #-->
# TV应用内进行搜索

> 编写:[awong1900](https://github.com/awong1900) - 原文:http://developer.android.com/training/tv/discovery/in-app-search.html

<!--Users frequently have specific content in mind when using a media app on TV. If your app contains a large catalog of content, browsing for a specific title may not be the most efficient way for users to find what they are looking for. A search interface can help your users get to the content they want faster than browsing.-->

用户经常有特殊的内容在脑子里当在TV上用媒体应用时。如果你的应用包含一个大的内容目录，浏览为特定的标题可能不是最有效的方式为用户去发现他们在找什么。一个搜索界面能帮助你的用户获得内容他们想更快的浏览。

<!--The Leanback support library provides a set of classes to enable a standard search interface within your app that is consistent with other search functions on TV and provides features such as voice input.-->

[Leanback support library](http://developer.android.com/tools/support-library/features.html#v17-leanback)提供一套类去使用标准的搜索界面在你的应用内一致的和其他搜索功能在TV和提供细节如声音输入。

<!--This lesson discusses how to provide a search interface in your app using Leanback support library classes.-->

这节课讨论如何去提供搜索界面在你的应用中去用Leanback支持库类。

<!--## Add a Search Action ##-->
## 添加搜索操作

<!--When you use the BrowseFragment class for a media browsing interface, you can enable a search interface as a standard part of the user interface. The search interface is an icon that appears in the layout when you set View.OnClickListener on the BrowseFragment object. The following sample code demonstrates this technique.-->

当你用[BroweseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)类为一个媒体浏览界面，你能使用一个搜索界面作为用户界面的标准部分。搜索界面是一个图标出现在布局当你设置[View.OnClickListener](http://developer.android.com/reference/android/view/View.OnClickListener.html)在[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)对象。接下来的示例代码展示了这个细节。

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

>**Note**：你能设置搜索图标的颜色用[setSearchAffordanceColor(int)](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html#setSearchAffordanceColor(int))。


<!--## Add a Search Input and Results-->
## 添加一个搜索输入和结果

<!--When a user selects the search icon, the system invokes a search activity via the defined intent. Your search activity should use a linear layout containing a SearchFragment. This fragment must also implement the SearchFragment.SearchResultProvider interface in order to display the results of a search.-->

当用户选择搜索图标，系统关联一个搜索activity通过定义的intent。你的搜索activity应该用啊线性布局包括[SearchFragment](http://developer.android.com/reference/android/support/v17/leanback/app/SearchFragment.html)。这个fragment必须实现[SearchFragment.SearchResultProvider](http://developer.android.com/reference/android/support/v17/leanback/app/SearchFragment.SearchResultProvider.html)界面为了去显示搜索结果。

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

示例代码展示上面是意味着啊分开的`SearchRunnable`类去运行搜索请求在分开的线程。这个技巧保持潜在的慢运行请求从阻塞主用线程。

----------------
[下一节: 创建TV游戏](../games/index.html)
