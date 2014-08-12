# 处理查询的结果

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:

正如前面一节课讲到的，你应该在 [onCreateLoader()](1)的回调里面使用CursorLoader执行加载数据的操作。接下去Loader会提供查询数据的结果给Activity或者FragmentActivity实现的[LoaderCallbacks.onLoadFinished()](2)回调方法。这个回调方法的参数之一是[Cursor](4)，它包含了查询的数据。你可以使用Cursor对象来更新需要显示的数据或者进行下一步的处理。

除了[onCreateLoader()](1)与[onLoadFinished()](2)，你也需要实现[onLoaderReset()](3)。这个方法在CursorLoader检测到[Cursor](4)上的数据发生变化的时候会被触发。当数据发生变化时，系统会触发重新查询的操作。

<!-- More -->

## Handle Query Results

为了显示CursorLoader返回的Cursor数据，需要使用实现AdapterView的类，并为这个类绑定一个实现了CursorAdapter的Adapter。系统会自动把Cursor中的数据显示到View上。

你可以在显示数据之前建立View与Adapter的关联。然后在[onLoadFinished()](2)的时候把Cursor与Adapter进行绑定。一旦你把Cursor鱼Adapter进行绑定之后，系统会自动更新View。当Cursor上的内容发生改变的时候，也会触发这些操作。

例如:

```java
public String[] mFromColumns = {
    DataProviderContract.IMAGE_PICTURENAME_COLUMN
};
public int[] mToFields = {
    R.id.PictureName
};
// Gets a handle to a List View
ListView mListView = (ListView) findViewById(R.id.dataList);
/*
 * Defines a SimpleCursorAdapter for the ListView
 *
 */
SimpleCursorAdapter mAdapter =
    new SimpleCursorAdapter(
            this,                // Current context
            R.layout.list_item,  // Layout for a single row
            null,                // No Cursor yet
            mFromColumns,        // Cursor columns to use
            mToFields,           // Layout fields to use
            0                    // No flags
    );
// Sets the adapter for the view
mListView.setAdapter(mAdapter);
...
/*
 * Defines the callback that CursorLoader calls
 * when it's finished its query
 */
@Override
public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
    ...
    /*
     * Moves the query results into the adapter, causing the
     * ListView fronting this adapter to re-display
     */
    mAdapter.changeCursor(cursor);
}
```

## Delete Old Cursor References

当Cursor失效的时候，CursorLoader会被重置。这通常发生在Cursor相关的数据改变的时候。在重新执行查询操作之前，系统会执行你的[onLoaderReset()](3)回调方法。在这个回调方法中，你应该删除当前Cursor上的所有数据，避免发生内存泄露。一旦onLoaderReset()执行结束，CursorLoader就会重新执行查询操作。

例如:

```java
/*
 * Invoked when the CursorLoader is being reset. For example, this is
 * called if the data in the provider changes and the Cursor becomes stale.
 */
@Override
public void onLoaderReset(Loader<Cursor> loader) {

    /*
     * Clears out the adapter's reference to the Cursor.
     * This prevents memory leaks.
     */
    mAdapter.changeCursor(null);
}
```

***

[1]: http://example.com/  "onCreateLoader()"
[2]: http://example.com/  "onLoadFinished()"
[3]: http://example.com/  "onLoaderReset()"
[4]: http://example.com/  "Cursor"

