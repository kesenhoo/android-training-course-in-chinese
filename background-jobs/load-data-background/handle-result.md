# 处理查询的结果

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/load-data-background/handle-results.html>

正如前面一节课讲到的，你应该在 [onCreateLoader()](1)的回调里面使用CursorLoader执行加载数据的操作。Loader查询完后会调用Activity或者FragmentActivity的[LoaderCallbacks.onLoadFinished()](2)将结果回调回来。这个回调方法的参数之一是[Cursor](4)，它包含了查询的数据。你可以使用Cursor对象来更新需要显示的数据或者进行下一步的处理。

除了[onCreateLoader()](1)与[onLoadFinished()](2)，你也需要实现[onLoaderReset()](3)。这个方法在CursorLoader检测到[Cursor](4)上的数据发生变化的时候会被触发。当数据发生变化时，系统会触发重新查询的操作。

<!-- More -->

## Handle Query Results

为了显示CursorLoader返回的Cursor数据，需要使用实现AdapterView的类，并为这个类绑定一个实现了CursorAdapter的Adapter。系统会自动把Cursor中的数据显示到View上。

你可以在显示数据之前建立View与Adapter的关联。然后在[onLoadFinished()](2)的时候把Cursor与Adapter进行绑定。一旦你把Cursor与Adapter进行绑定之后，系统会自动更新View。当Cursor上的内容发生改变的时候，也会触发这些操作。

例如:

```java
public String[] mFromColumns = {
    DataProviderContract.IMAGE_PICTURENAME_COLUMN
};
public int[] mToFields = {
    R.id.PictureName
};
// 取得ListView的引用[原词是句柄handle]
ListView mListView = (ListView) findViewById(R.id.dataList);
/*
 * 为ListView定义一个SimpleCursorAdapter
 */
SimpleCursorAdapter mAdapter =
    new SimpleCursorAdapter(
            this,                // 当前上下文
            R.layout.list_item,  // 一个只有单行的文本的布局
            null,                // 暂时还没有Cursor游标
            mFromColumns,        // 要使用游标的列
            mToFields,           // Layout fields to use
            0                    // No flags
    );
// 为View设置适配器
mListView.setAdapter(mAdapter);
...
/*
 * 定义CursorLoader完成查询时候的回调
 */
@Override
public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
    ...

     /*
      * 转移查询结果给适配器，并激发适配器更新前端的ListView数据
      */
    mAdapter.changeCursor(cursor);
}
```

## Delete Old Cursor References

当Cursor失效的时候，CursorLoader会被重置。这通常发生在Cursor相关的数据改变的时候。在重新执行查询操作之前，系统会执行你的[onLoaderReset()](3)回调方法。在这个回调方法中，你应该删除当前Cursor上的所有数据，避免发生内存泄露。一旦onLoaderReset()执行结束，CursorLoader就会重新执行查询操作。

例如:

```java
/*
 * CursorLoader被重置时调用。举个栗子，当提供者中的数据发生变动Cursor变得陈旧
 * 时会被调用。
 */
@Override
public void onLoaderReset(Loader<Cursor> loader) {

    /*
     * 清除适配器里对Cursor的引用，可以防止内存泄漏。
     */
    mAdapter.changeCursor(null);
}
```

***

[1]: http://example.com/  "onCreateLoader()"
[2]: http://example.com/  "onLoadFinished()"
[3]: http://example.com/  "onLoaderReset()"
[4]: http://example.com/  "Cursor"

