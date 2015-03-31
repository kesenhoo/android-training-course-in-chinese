# 建立搜索界面

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/search/setup.html>

从Android 3.0开始，在action bar中使用[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)作为item，是在你的app中提供搜索的一种更好方法。像其他所有在action bar中的item一样，你可以定义[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)在有足够空间的时候总是显示，或设置为一个折叠操作(collapsible action),一开始[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)作为一个图标显示，当用户点击图标时再显示搜索框占据整个action bar。

>**Note**:在本课程的后面，你会学习对那些不支持[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)的设备，如何使你的app向下兼容至Android 2.1(API level 7)版本。

##添加Search View到action bar中

为了在action bar中添加[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)，在你的工程目录`res/menu/`中创建一个名为`options_menu.xml`的文件，再把下列代码添加到文件中。这段代码定义了如何创建search item，比如使用的图标和item的标题。`collapseActionView`属性允许你的[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)占据整个action bar，在不使用的时候折叠成普通的action bar item。由于在手持设备中action bar的空间有限，建议使用`collapsibleActionView`属性来提供更好的用户体验。

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@+id/search"
          android:title="@string/search_title"
          android:icon="@drawable/ic_search"
          android:showAsAction="collapseActionView|ifRoom"
          android:actionViewClass="android.widget.SearchView" />
</menu>
```

>**Note**:如果你的menu items已经有一个XML文件，你可以只把`<item>`元素添加入文件。

要在action bar中显示[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)，在你的activity中[onCreateOptionsMenu()](http://developer.android.com/reference/android/app/Activity.html#onCreateOptionsMenu(android.view.Menu))方法内填充XML菜单资源(`res/menu/options_menu.xml`):

```java
@Override
public boolean onCreateOptionsMenu(Menu menu) {
    MenuInflater inflater = getMenuInflater();
    inflater.inflate(R.menu.options_menu, menu);

    return true;
}
```

如果你立即运行你的app，[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)就会显示在你app的action bar中，但还无法使用。你现在需要定义[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)如何运行。

##创建一个检索配置

[检索配置(searchable configuration)](http://developer.android.com/guide/topics/search/searchable-config.html)在 `res/xml/searchable.xml`文件中定义了[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)如何运行。检索配置中至少要包含一个`android:label`属性，与Android manifest中的`<application>`或`<activity>` `android:label`属性值相同。但我们还是建议添加`android:hint`属性来告诉用户应该在搜索框中输入什么内容:

```xml
<?xml version="1.0" encoding="utf-8"?>

<searchable xmlns:android="http://schemas.android.com/apk/res/android"
        android:label="@string/app_name"
        android:hint="@string/search_hint" />
```

在你的应用的manifest文件中，声明一个指向`res/xml/searchable.xml`文件的[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)元素，来告诉你的应用在哪里能找到检索配置。在你想要显示[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)的`<activity>`中声明`<meta-data>`元素:

```xml
<activity ... >
    ...
    <meta-data android:name="android.app.searchable"
            android:resource="@xml/searchable" />

</activity>
```

在你之前创建的[onCreateOptionsMenu()](http://developer.android.com/reference/android/app/Activity.html#onCreateOptionsMenu(android.view.Menu))方法中，调用[setSearchableInfo(SearchableInfo)](http://developer.android.com/reference/android/widget/SearchView.html#setSearchableInfo(android.app.SearchableInfo))把[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)和检索配置关联在一起:

```xml
@Override
public boolean onCreateOptionsMenu(Menu menu) {
    MenuInflater inflater = getMenuInflater();
    inflater.inflate(R.menu.options_menu, menu);

    // 关联检索配置和SearchView
    SearchManager searchManager =
           (SearchManager) getSystemService(Context.SEARCH_SERVICE);
    SearchView searchView =
            (SearchView) menu.findItem(R.id.search).getActionView();
    searchView.setSearchableInfo(
            searchManager.getSearchableInfo(getComponentName()));

    return true;
}
```

调用[getSearchableInfo()](http://developer.android.com/reference/android/app/SearchManager.html#getSearchableInfo(android.content.ComponentName))返回一个[SearchableInfo](http://developer.android.com/reference/android/app/SearchableInfo.html)由检索配置XML文件创建的对象。检索配置与[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)正确关联后，当用户提交一个搜索请求时，[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)会以[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent启动一个activity。所以你现在需要一个能过滤这个intent和处理搜索请求的activity。

##创建一个检索activity

当用户提交一个搜索请求时，[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)会尝试以[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH)启动一个activity。检索activity会过滤[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent并在某种数据集中根据请求进行搜索。要创建一个检索activity，在你选择的activity中声明对[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent过滤:

```xml
<activity android:name=".SearchResultsActivity" ... >
    ...
    <intent-filter>
        <action android:name="android.intent.action.SEARCH" />
    </intent-filter>
    ...
</activity>
```

在你的检索activity中，通过在[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))方法中检查[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent来处理它。

>**Note**:如果你的检索activity在single top mode下启动(`android:launchMode="singleTop"`)，也要在[onNewIntent()](http://developer.android.com/reference/android/app/Activity.html#onNewIntent(android.content.Intent))方法中处理[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent。在single top mode下你的activity只有一个会被创建，而随后启动的activity将不会在栈中创建新的activity。这种启动模式很有用，因为用户可以在当前activity中进行搜索，而不用在每次搜索时都创建一个activity实例。

```java
public class SearchResultsActivity extends Activity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        ...
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        ...
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {

        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            String query = intent.getStringExtra(SearchManager.QUERY);
            //通过某种方法，根据请求检索你的数据
        }
    }
    ...
}
```

如果你现在运行你的app，[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)就能接收用户的搜索请求，以[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent启动你的检索activity。现在就由你来解决如何依据请求来储存和搜索数据。
