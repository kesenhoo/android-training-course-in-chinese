# 保持向下兼容

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/search/backward-compat.html>

[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)和action bar只在Android 3.0以及以上版本可用。为了支持旧版本平台，你可以回到搜索对话框。搜索框是系统提供的UI，在调用时会覆盖在你的应用的最顶端。

##设置最小和目标API级别

要设置搜索对话框，首先在你的manifest中声明你要支持旧版本设备，并且目标平台为Android 3.0或更新版本。当你这么做之后，你的应用会自动地在Android 3.0或以上使用action bar，在旧版本的设备使用传统的目录系统:

```xml
<uses-sdk android:minSdkVersion="7" android:targetSdkVersion="15" />

<application>
...
```

##为旧版本设备提供搜索对话框

要在旧版本设备中调用搜索对话框，可以在任何时候，当用户从选项目录中选择搜索项时，调用[onSearchRequested()](reference/android/app/Activity.html#onSearchRequested())。因为Android 3.0或以上会在action bar中显示[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)(就像在第一节课中演示的那样)，所以当用户选择目录的搜索项时，只有Android 3.0以下版本的会调用[onOptionsItemSelected()](http://developer.android.com/reference/android/app/Activity.html#onOptionsItemSelected(android.view.MenuItem))。

```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    switch (item.getItemId()) {
        case R.id.search:
            onSearchRequested();
            return true;
        default:
            return false;
    }
}
```

##在运行时检查Android的构建版本

在运行时，检查设备的版本可以保证在旧版本设备中，不使用不支持的[SearchView](http://developer.android.com/reference/android/widget/SearchView.html)。在我们这个例子中，这一操作在[onCreateOptionsMenu()](http://developer.android.com/reference/android/app/Activity.html#onCreateOptionsMenu(android.view.Menu))方法中:

```java
@Override
public boolean onCreateOptionsMenu(Menu menu) {

    MenuInflater inflater = getMenuInflater();
    inflater.inflate(R.menu.options_menu, menu);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
        SearchManager searchManager =
                (SearchManager) getSystemService(Context.SEARCH_SERVICE);
        SearchView searchView =
                (SearchView) menu.findItem(R.id.search).getActionView();
        searchView.setSearchableInfo(
                searchManager.getSearchableInfo(getComponentName()));
        searchView.setIconifiedByDefault(false);
    }
    return true;
}
```
