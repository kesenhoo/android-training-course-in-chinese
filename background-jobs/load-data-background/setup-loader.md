# 使用CursorLoader执行查询任务

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/load-data-background/setup-loader.html>

CursorLoader通过ContentProvider在后台执行一个异步的查询操作，并且返回数据给调用它的Activity或者FragmentActivity。这使得Activity或者FragmentActivity能够在查询任务正在执行的同时继续与用户进行其他的交互操作。

## 定义使用CursorLoader的Activity

为了在Activity或者FragmentActivity中使用CursorLoader，它们需要实现`LoaderCallbacks<Cursor>`接口。CursorLoader会调用`LoaderCallbacks<Cursor>`定义的这些回调方法与Activity进行交互；这节课与下节课会详细介绍每一个回调方法。

<!-- More -->

例如，下面演示了FragmentActivity如何使用CursorLoader。

```java
public class PhotoThumbnailFragment extends FragmentActivity implements
        LoaderManager.LoaderCallbacks<Cursor> {
...
}
```

## 初始化查询

为了初始化查询，需要调用`LoaderManager.initLoader()`。这个方法可以初始化LoaderManager的后台查询框架。你可以在用户输入查询条件之后触发初始化的操作，如果你不需要用户输入数据作为查询条件，你可以在`onCreate()`或者`onCreateView()`里面触发这个方法。例如：

```java
// Identifies a particular Loader being used in this component
private static final int URL_LOADER = 0;
...
/* When the system is ready for the Fragment to appear, this displays
 * the Fragment's View
 */
public View onCreateView(
        LayoutInflater inflater,
        ViewGroup viewGroup,
        Bundle bundle) {
    ...
    /*
     * Initializes the CursorLoader. The URL_LOADER value is eventually passed
     * to onCreateLoader().
     */
    getLoaderManager().initLoader(URL_LOADER, null, this);
    ...
}
```

> **Note:** `getLoaderManager()`仅仅是在Fragment类中可以直接访问。为了在FragmentActivity中获取到LoaderManager，需要执行`getSupportLoaderManager()`.

## 开始查询

一旦后台任务被初始化好，它会执行你实现的回调方法`onCreateLoader()`。为了启动查询任务，会在这个方法里面返回CursorLoader。你可以初始化一个空的CursorLoader然后使用它的方法来定义你的查询条件，或者你可以在初始化CursorLoader对象的时候就同时定义好查询条件：

```java
/*
* Callback that's invoked when the system has initialized the Loader and
* is ready to start the query. This usually happens when initLoader() is
* called. The loaderID argument contains the ID value passed to the
* initLoader() call.
*/
@Override
public Loader<Cursor> onCreateLoader(int loaderID, Bundle bundle)
{
    /*
     * Takes action based on the ID of the Loader that's being created
     */
    switch (loaderID) {
        case URL_LOADER:
            // Returns a new CursorLoader
            return new CursorLoader(
                        getActivity(),   // Parent activity context
                        mDataUrl,        // Table to query
                        mProjection,     // Projection to return
                        null,            // No selection clause
                        null,            // No selection arguments
                        null             // Default sort order
        );
        default:
            // An invalid id was passed in
            return null;
    }
}
```

一旦后台查询任务获取到了这个Loader对象，就开始在后台执行查询的任务。当查询完成之后，会执行`onLoadFinished()`这个回调函数，关于这些内容会在下一节讲到。

