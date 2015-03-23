# 使用CursorLoader执行查询任务

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/load-data-background/setup-loader.html>

CursorLoader通过ContentProvider在后台执行一个异步的查询操作，并且返回数据给调用它的Activity或者FragmentActivity。这使得Activity 或者 FragmentActivity 能够在查询任务正在执行可以继续与用户进行其他的交互。

## 定义使用CursorLoader的Activity

为了在Activity或者FragmentActivity中使用CursorLoader，它们需要实现[LoaderCallbacks<Cursor>](file:///Users/hook/Desktop/docs/reference/android/support/v4/app/LoaderManager.LoaderCallbacks.html)接口。CursorLoader会调用LoaderCallbacks<Cursor>定义的这些回调方法与这些类进行交互；这节课与下节课会详细介绍每一个回调方法。

<!-- More -->

例如，下面演示了FragmentActivity如何使用CursorLoader。

```java
public class PhotoThumbnailFragment extends FragmentActivity implements
        LoaderManager.LoaderCallbacks<Cursor> {
...
}
```

## 初始化查询

为了初始化查询，需要执行[LoaderManager.initLoader()](file:///Users/hook/Desktop/docs/reference/android/support/v4/app/LoaderManager.html#initLoader(int, android.os.Bundle, android.support.v4.app.LoaderManager.LoaderCallbacks<D>))。这个方法可以初始化后台查询框架。你可以在用户输入查询条件之后触发初始化的操作，如果你不需要用户输入数据作为查询条件，你可以触发这个方法在`onCreate()`或者`onCreateView()`。例如：

```java
// 标识一个特定的Loader加载器来使用这个组件
    private static final int URL_LOADER = 0;
    ...
     /**
       * 当系统已经准备好显示Fragment时，
       * 这里显示Fragment的布局
       */
    public View onCreateView(
            LayoutInflater inflater,
            ViewGroup viewGroup,
            Bundle bundle) {
        ...
        /*
         *初始化一个CursorLoader.  URL_LOADER 值最终会被传递到
         *  onCreateLoader().
         */
        getLoaderManager().initLoader(URL_LOADER, null, this);
        ...
    }
```

> **Note:** `getLoaderManager()`仅仅是在Fragment类中可以直接访问。为了在FragmentActivity中获取到LoaderManager，需要执行`getSupportLoaderManager()`.

## 开始查询

一旦后台任务被初始化好，它会执行你实现的回调方法[onCreateLoader()](file:///Users/hook/Desktop/docs/reference/android/support/v4/app/LoaderManager.LoaderCallbacks.html#onCreateLoader(int, android.os.Bundle))。为了启动查询任务，会在这个方法里面返回CursorLoader。你可以初始化一个空的CursorLoader然后使用它的方法来定义你的查询条件，或者你可以在初始化CursorLoader对象的时候就同时定义好查询条件：

```java
/**
 * 系统在完成Loader的初始化并且准备好查询的时候会回调这个方法。
 * 这个通常在initLoader()方法被调用发生。包含loaderID值的参数
 * 通过initLoader()方法的传递得到。
 */
@Override
public Loader<Cursor> onCreateLoader(int loaderID, Bundle bundle)
{
     /*
      * 通过加载器ID执行创建加载器动作
      */
    switch (loaderID) {
        case URL_LOADER:
            // Returns a new CursorLoader
            return new CursorLoader(
                        getActivity(),   // 父Activity上下文
                        mDataUrl,        // 要查询的表
                        mProjection,     // 要返回的Projection
                        null,            // 没有条件从句
                        null,            // 没有条件参数
                        null             // 默认排序
        );
        default:
            // 一个非法的id传入
            return null;
    }
}
```

一旦后台查询任务获取到了这个Loader对象，就开始在后台执行查询的任务。当查询完成之后，会执行[onLoadFinished()](file:///Users/hook/Desktop/docs/reference/android/support/v4/app/LoaderManager.LoaderCallbacks.html#onLoadFinished(android.support.v4.content.Loader<D>, D))这个回调函数，关于这些内容会在下一节讲到。

