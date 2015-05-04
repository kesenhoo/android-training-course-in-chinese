# 获取联系人详情

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/contacts-provider/retrieve-details.html>

这一课展示了如何取得一个联系人的详细信息，比如email地址、电话号码等。当使用者去获取联系人信息的时候，这些信息正是他们所查找的。我们可以给他们关于一个联系人的所有信息，或者仅仅显示一个特定的数据类型，比如email地址。

这一课假设你已经获取到了一个用户所选取的联系人的[ContactsContract.Contacts](http://developer.android.com/reference/android/provider/ContactsContract.Contacts.html)数据项。在[获取联系人名字](retrieve-names.html)那一课展示了如何获取联系人列表。

## 获取联系人的所有详细信息

为了取得一个联系人的所有详情，查找[ContactsContract.Data](http://developer.android.com/reference/android/provider/ContactsContract.Data.html)表中包含联系人[LOOKUP_KEY](http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#LOOKUP_KEY)列的任意行。因为Contacts Provider隐式地连接了ContactsContract.Contacts表和ContactsContract.Data表，所以这个[LOOKUP_KEY](http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#LOOKUP_KEY)列在ContactsContract.Data表中是可用的。关于[LOOKUP_KEY](http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#LOOKUP_KEY)列，在[获取联系人名字](retrieve-names.html)那一课有详细的描述。

> **Note：**检索一个联系人的所有信息会降低设备的性能，因为这需要检索ContactsContract.Data表的所有列。在使用这种方法之前，请认真考虑对性能影响。

### 请求权限

为了能够读Contacts Provider，我们的应用必须拥有[READ_CONTACTS](http://developer.android.com/reference/android/Manifest.permission.html#READ_CONTACTS)权限。为了请求这个权限，需要在manifest文件的<manifest\>中添加如下子节点：

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

### 设置查询映射

根据一行数据的数据类型，它可能会使用很多列或者只使用几列。另外，数据会根据不同的数据类型而出现在不同的列中。为了确保能够获取所有数据类型的所有可能的数据列，需要在查询映射中添加所有列的名字。如果要把Cursor绑定到ListView，记得要获取Data._ID，否则的话，界面绑定就不会起作用。同时也需要获取[Data.MIMETYPE](http://developer.android.com/reference/android/provider/ContactsContract.DataColumns.html#MIMETYPE)列，这样才能识别我们获取到的每一行数据的数据类型。例如：

```java
private static final String PROJECTION =
            {
                Data._ID,
                Data.MIMETYPE,
                Data.DATA1,
                Data.DATA2,
                Data.DATA3,
                Data.DATA4,
                Data.DATA5,
                Data.DATA6,
                Data.DATA7,
                Data.DATA8,
                Data.DATA9,
                Data.DATA10,
                Data.DATA11,
                Data.DATA12,
                Data.DATA13,
                Data.DATA14,
                Data.DATA15
            };
```

这个查询映射使用了ContactsContract.Data类中定义的列名字，去获取ContactsContract.Data表中一行的所有数据列。

我们也可以使用由ContactsContract.Data或其子类定义的列常量去设置查询映射。需要注意的是，从SYNC1到SYNC4的数据列是sync adapter同步数据所使用的，它们的值对我们没有意义。

### 定义查询标准

为查询选择子句定义一个常量，一个包含查询选择参数的数组，以及一个保存查询选择值的变量。使用Contacts.LOOKUP_KEY列去查找这个联系人。例如：

```java
	// Defines the selection clause
    private static final String SELECTION = Data.LOOKUP_KEY + " = ?";
    // Defines the array to hold the search criteria
    private String[] mSelectionArgs = { "" };
    /*
     * Defines a variable to contain the selection value. Once you
     * have the Cursor from the Contacts table, and you've selected
     * the desired row, move the row's LOOKUP_KEY value into this
     * variable.
     */
    private String mLookupKey;
```

在查询选择表达式中使用 “?”占位符，确保了搜索是由绑定生成而不是由SQL编译生成。这种方法消除了恶意SQL注入的可能性。

### 定义排序顺序

定义在查询结果Cursor中希望的排序顺序。按照Data.MIMETYPE去排序，可以让特定数据类型的所有行排列在一起。这种形式的查询排序参数让所有具有email的行排在一起，让所有具有电话的行排在一起……例如：

```java
	/*
     * Defines a string that specifies a sort order of MIME type
     */
    private static final String SORT_ORDER = Data.MIMETYPE;
```

> **Note：**一些数据类型不使用子类型，所以不能按照子类型来排序。作为替代方法，我们不得不遍历返回的Cursor，去判定当前行的数据类型，为那些使用子类型的数据行保存数据。当读取完cursor后，我们可以根据子类型去排序每一个数据类型并显示结果。

### 初始化查询loader

永远在后台线程中去检索Contacts Provider(或者其他content provider)的数据。使用Loader框架中的LoaderManager类和LoaderManager.LoaderCallbacks在后台去做获取数据的工作。

当我们已经准备好去获取数据行，需要通过调用initLoader()方法去初始化loader框架。传递一个Integer类型的标识符给initLoader()方法，这个标识符会传递给LoaderManager.LoaderCallbacks方法。当在一个应用中使用多个loader时，这个标识符能够帮助我们区分它们。

以下的代码片段展示了如何初始化loader框架：

```java
public class DetailsFragment extends Fragment implements
        LoaderManager.LoaderCallbacks<Cursor> {
    ...
    // Defines a constant that identifies the loader
    DETAILS_QUERY_ID = 0;
    ...
    /*
     * Invoked when the parent Activity is instantiated
     * and the Fragment's UI is ready. Put final initialization
     * steps here.
     */
    @Override
    onActivityCreated(Bundle savedInstanceState) {
        ...
        // Initializes the loader framework
        getLoaderManager().initLoader(DETAILS_QUERY_ID, null, this);
```

### 实现onCreateLoader()方法

实现onCreateLoader()方法。loader框架会在我们调用initLoader()方法后立即调用onCreateLoader()方法。这个方法会返回一个CursorLoader对象。由于搜索的是ContactsContract.Data表，所以需要使用常量Data.CONTENT_URI作为内容URI。例如：


```java
	@Override
    public Loader<Cursor> onCreateLoader(int loaderId, Bundle args) {
        // Choose the proper action
        switch (loaderId) {
            case DETAILS_QUERY_ID:
            // Assigns the selection parameter
            mSelectionArgs[0] = mLookupKey;
            // Starts the query
            CursorLoader mLoader =
                    new CursorLoader(
                            getActivity(),
                            Data.CONTENT_URI,
                            PROJECTION,
                            SELECTION,
                            mSelectionArgs,
                            SORT_ORDER
                    );
            ...
    }
```

### 实现onLoadFinished()方法和onLoaderReset()方法

实现onLoadFinished()方法。当Contacts Provider返回查询结果的时候，loader框架会调用onLoadFinished()方法。例如：

```java
public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
        switch (loader.getId()) {
            case DETAILS_QUERY_ID:
                    /*
                     * Process the resulting Cursor here.
                     */
                }
                break;
            ...
        }
    }
```

当loader框架检测到结果集Cursor所对应的数据已经发生变化的时候，会调用onLoaderReset()方法。这时，需要通过把Cursor设置为null来移除对已经存在Cursor对象的引用。否则，loader框架就不会销毁旧的Cursor对象，从而导致内存泄漏。例如：

```java
	@Override
    public void onLoaderReset(Loader<Cursor> loader) {
        switch (loader.getId()) {
            case DETAILS_QUERY_ID:
                /*
                 * If you have current references to the Cursor,
                 * remove them here.
                 */
                }
                break;
    }
```

## 获取联系人的特定类型的信息

获取联系人的特定类型的信息，例如所有的email信息，跟获取联系人的所有详细信息类似。下面的内容是在[获取联系人的所有详细信息]()列出的代码的基础上作出的修改：

查询映射

修改查询映射使得能够针对特定的数据类型去获取列。同时需要修改查询映射，来把在ContactsContract.CommonDataKinds子类中定义的列常量与数据类型对应起来。

查询选择

修改查询选择子句去搜索特定类型的MIMETYPE值。

排序顺序

由于仅仅搜索一种类型的详细数据，所以不需要将返回的Cursor按照Data.MIMETYPE进行分组。

这些修改将会在下面的小节中详细描述。

### 设置查询映射

使用ContactsContract.CommonDataKinds的特定类型子类所定义的列名称常量，定义我们想要获取的数据列。如果我们打算把Cursor绑定到ListView，确保要获取`_ID`列。例如，为了获取email数据，需要定义以下数据映射：

```java
private static final String[] PROJECTION =
            {
                Email._ID,
                Email.ADDRESS,
                Email.TYPE,
                Email.LABEL
            };
```

需要注意的是，这个查询映射使用在ContactsContract.CommonDataKinds.Email类中定义的列名称，来替代ContactsContract.Data类中定义的列名称。使用email类型的列名称使得代码更具可读性。

在查询映射中，我们也可以使用ContactsContract.CommonDataKinds子类所定义的其他数据列。

### 定义查询标准

根据我们想要找的特定联系人的LOOKUP_KEY和联系人详细信息的Data.MIMETYPE定义一个搜索表达式，去获取数据。把MIMETYPE的值从头到尾用单引号括住，否则的话，content provider将会把这个常量当成变量名而不是字符串。因为我们使用的是常量，而不是用户提供的值，所以这里不需要使用占位符。例如：

```java
/*
     * Defines the selection clause. Search for a lookup key
     * and the Email MIME type
     */
    private static final String SELECTION =
            Data.LOOKUP_KEY + " = ?" +
            " AND " +
            Data.MIMETYPE + " = " +
            "'" + Email.CONTENT_ITEM_TYPE + "'";
    // Defines the array to hold the search criteria
    private String[] mSelectionArgs = { "" };
```


### 定义排序规则

为查询返回的[Cursor](http://developer.android.com/reference/android/database/Cursor.html)定义一个排序规则。由于是检索特定的数据类型，删除根据[MIMETYPE](http://developer.android.com/reference/android/provider/ContactsContract.DataColumns.html#MIMETYPE)来排序的部分。而如果查询的详细数据类型包含子类型，可以根据这个子类型去排序。例如，对于email数据，我们可以根据[Email.TYPE](http://developer.android.com/reference/android/provider/ContactsContract.CommonDataKinds.CommonColumns.html#TYPE)排序：

```java
private static final String SORT_ORDER = Email.TYPE + " ASC ";
```





