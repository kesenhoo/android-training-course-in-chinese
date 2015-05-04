# 获取联系人列表

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/contacts-provider/retrieve-names.html>

这一课展示了如何根据要搜索的字符串去匹配联系人的数据，从而得到联系人列表，你可以使用以下方法去实现：

**匹配联系人名字**

通过搜索字符串来匹配联系人名字的全部或者部分来获得联系人列表。因为Contacts Provider允许多个实例拥有相同的名字，所以这种方法能够返回匹配的列表。

**匹配特定的数据类型，比如电话号码**

通过搜索字符串来匹配联系人的某一特定数据类型（如电子邮件地址），来取得符合要求的联系人列表。例如，这种方法可以列出电子邮件地址与搜索字符相匹配的所有联系人。

**匹配任意类型的数据**

通过搜索字符串来匹配联系人详情的所有数据类型，包括名字、电话号码、地址、电子邮件地址等等。例如，这种方法接受任意数据类型的搜索字符串，并列出与这个搜索字符串相匹配的联系人。

> **Note：**这一课的所有例子都使用CursorLoader获取Contacts Provider中的数据。CursorLoader在一个与UI线程相独立的工作线程进行查询操作。这保证了数据查询不会降低UI响应的时间，以免引起槽糕的用户体验。更多信息，请参照[在后台加载数据](http://hukai.me/android-training-course-in-chinese/background-jobs/load-data-background/index.html)。

## 请求读取联系人的权限

为了能够在Contacts Provider中做任意类型的搜索，我们的应用必须拥有READ_CONTACTS权限。为了拥有这个权限，我们需要在项目的manifest文件的<manifest\>节点中添加<uses-permission>子结点，如下：

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

## 根据名字取得联系人并列出结果

这种方法根据搜索字符串，去匹配Contacts Provider的ContactsContract.Contacts表中的联系人名字。通常希望在ListView中展示结果，去让用户在所有匹配的联系人中做选择。

### 定义ListView和列表项的布局

为了能够将搜索结果展示在列表中，我们需要一个包含ListView以及其他布局控件的主布局文件，和一个定义列表中每一项的布局文件。例如，可以使用以下XML代码去创建主布局文件res/layout/contacts\_list\_view.xml：

```xml
<?xml version="1.0" encoding="utf-8"?>
<ListView xmlns:android="http://schemas.android.com/apk/res/android"
      android:id="@android:id/list"
      android:layout_width="match_parent"
      android:layout_height="match_parent"/>
```

这个XML代码使用了Android内建的ListView控件,他的id是android:id/list。

使用以下XML代码定义列表项布局文件contacts\_list\_item.xml：

```xml
<?xml version="1.0" encoding="utf-8"?>
<TextView xmlns:android="http://schemas.android.com/apk/res/android"
      android:id="@android:id/text1"
      android:layout_width="match_parent"
      android:layout_height="wrap_content"
      android:clickable="true"/>
```

这个XML代码使用了Android内建的TextView控件,他的id是android:text1。

> **Note：**本课并不会描述如何从用户那里获取搜索字符串的界面，因为我们可能会间接地获取这个字符串。比如说，我们可能会给用户一个选项去输入文字信息，把这些文字信息作为搜索字符串去匹配联系人的名字。

刚刚写的这两个布局文件定义了一个显示ListView的用户界面。下一步是编写使用这个用户界面显示联系人列表的代码。

### 定义一个显示联系人列表的Fragment

为了显示联系人列表，需要定义一个由Activity加载的Fragment。使用Fragment是一个比较灵活的方法，因为我们可以使用一个Fragment去显示列表，用另一个Fragment显示用户在列表中选择的联系人的详情。使用这种方式，我们可以将本课程中展示的方法和另外一课[获取联系人详情](retrieve-detail.html)的方法联系起来。

想要学习如何在Activity中使用一个或者多个Fragment，请阅读培训课程[使用Fragment建立动态UI](http://hukai.me/android-training-course-in-chinese/basics/fragments/index.html)。

为了方便我们编写对Contacts Provider的查询，Android框架提供了一个叫做ContactsContract的契约类，这个类定义了一些对查询Contacts Provider很有用的常量和方法。当我们使用这个类的时候，我们不用自己定义内容URI、表名、列名等常量。使用这个类，只需要引入以下类声明：

```java
import android.provider.ContactsContract;
```

由于代码中使用了CursorLoader去获取provider的数据，所以我们必须实现加载器接口LoaderManager.LoaderCallbacks。同时，为了检测用户从结果列表中选择了哪一个联系人，必须实现适配器接口AdapterView.OnItemClickListener。例如：

```java
...
import android.support.v4.app.Fragment;
import android.support.v4.app.LoaderManager.LoaderCallbacks;
import android.widget.AdapterView;
...
public class ContactsFragment extends Fragment implements
    LoaderManager.LoaderCallbacks<Cursor>,
    AdapterView.OnItemClickListener {
```

### 定义全局变量

定义在其他代部分码中使用的全局变量：

```java
...
/*
 * Defines an array that contains column names to move from
 * the Cursor to the ListView.
 */
@SuppressLint("InlinedApi")
private final static String[] FROM_COLUMNS = {
        Build.VERSION.SDK_INT
                >= Build.VERSION_CODES.HONEYCOMB ?
                Contacts.DISPLAY_NAME_PRIMARY :
                Contacts.DISPLAY_NAME
};
/*
 * Defines an array that contains resource ids for the layout views
 * that get the Cursor column contents. The id is pre-defined in
 * the Android framework, so it is prefaced with "android.R.id"
 */
private final static int[] TO_IDS = {
       android.R.id.text1
};
// Define global mutable variables
// Define a ListView object
ListView mContactsList;
// Define variables for the contact the user selects
// The contact's _ID value
long mContactId;
// The contact's LOOKUP_KEY
String mContactKey;
// A content URI for the selected contact
Uri mContactUri;
// An adapter that binds the result Cursor to the ListView
private SimpleCursorAdapter mCursorAdapter;
...
```

> **Note：**由于Contacts.DISPLAY\_NAME\_PRIMARY需要在Android 3.0（API版本11）或者更高的版本才能使用，如果应用的minSdkVersion是10或者更低，会在eclipse中产生警告信息。为了关闭这个警告，我们可以在FROM_COLUMNS定义之前加上@SuppressLint("InlinedApi")注解。

### 初始化Fragment

为了初始化Fragment，Android系统需要我们为这个Fragment添加空的、公有的构造方法，同时在回调方法onCreateView()中绑定界面。例如：

```java
// Empty public constructor, required by the system
public ContactsFragment() {}
// A UI Fragment must inflate its View
@Override
public View onCreateView(LayoutInflater inflater, ViewGroup container,
        Bundle savedInstanceState) {
    // Inflate the fragment layout
    return inflater.inflate(R.layout.contact_list_fragment,
        container, false);
}
```

### 为ListView设置CursorAdapter

设置SimpleCursorAdapter，将搜索结果绑定到ListView。为了获得显示联系人列表的ListView控件，需要使用Fragment的父Activity调用Activity.findViewById()。当调用setAdapter()的时候，需要使用父Activity的上下文（Context）。

```java
public void onActivityCreated(Bundle savedInstanceState) {
    super.onActivityCreated(savedInstanceState);
    ...
    // Gets the ListView from the View list of the parent activity
    mContactsList =
        (ListView) getActivity().findViewById(R.layout.contact_list_view);
    // Gets a CursorAdapter
    mCursorAdapter = new SimpleCursorAdapter(
            getActivity(),
            R.layout.contact_list_item,
            null,
            FROM_COLUMNS, TO_IDS,
            0);
    // Sets the adapter for the ListView
    mContactsList.setAdapter(mCursorAdapter);
}
```

### 为选择的联系人设置监听器

当我们显示搜索列表结果的时候，我们通常会让用户选择某一个联系人去做进一步的处理。例如，当用户选择某一个联系人的时候，可以在地图上显示这个联系人的地址。为了能够提供这个功能，我们需要定义当前的Fragment为一个点击监听器，这需要这个类实现AdapterView.OnItemClickListener接口，就像前面介绍的**定义显示联系人列表的Fragment**那样。

继续设置这个监听器，需要在onActivityCreated()方法中调用setOnItemClickListener()以使得这个监听器绑定到ListView。例如：

```java
public void onActivityCreated(Bundle savedInstanceState) {
    ...
    // Set the item click listener to be the current fragment.
    mContactsList.setOnItemClickListener(this);
    ...
}
```

由于指定了当前的Fragment作为ListView的点击监听器，现在我们需要实现处理点击事件的onItemClick()方法。这个会在随后讨论。

### 定义查询映射

定义一个常量，这个常量包含我们想要从查询结果中返回的列。Listview中的每一项显示了一个联系人的名字。在Android 3.0（API version 11）或者更高的版本，这个列的名字是Contacts.DISPLAY\_NAME\_PRIMARY；在Android 3.0之前，这个列的名字是Contacts.DISPLAY\_NAME。

在SimpleCursorAdapter绑定过程中会用到Contacts.\_ID列。 Contacts.\_ID和LOOKUP\_KEY一同用来构建用户选择的联系人的内容URI。

```java
...
@SuppressLint("InlinedApi")
private static final String[] PROJECTION = {
    Contacts._ID,
    Contacts.LOOKUP_KEY,
    Build.VERSION.SDK_INT
            >= Build.VERSION_CODES.HONEYCOMB ?
            Contacts.DISPLAY_NAME_PRIMARY :
            Contacts.DISPLAY_NAME
};
```

### 定义Cursor的列索引常量

为了从Cursor中获得单独某一列的数据，我们需要知道这一列在Cursor中的索引值。我们需要定义Cursor列的索引值，这些索引值与我们定义查询映射的列的顺序是一样的。例如：

```java
// The column index for the _ID column
private static final int CONTACT_ID_INDEX = 0;
// The column index for the LOOKUP_KEY column
private static final int LOOKUP_KEY_INDEX = 1;
```

### 指定查询标准

为了指定我们想要的数据，我们需要创建一个包含文本表达式和变量的组合，去告诉provider我们需要的数据列和想要的值。

对于文本表达式，定义一个常量，列出所有搜索到的列。尽管这个表达式可以包含变量值，但是建议用"?"占位符来替代这个值。在搜索的时候，占位符里的值会被数组里的值所取代。使用"?"占位符确保了搜索条件是由绑定产生而不是由SQL编译产生。这个方法消除了恶意SQL注入的可能。例如：

```java
// Defines the text expression
@SuppressLint("InlinedApi")
private static final String SELECTION =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB ?
        Contacts.DISPLAY_NAME_PRIMARY + " LIKE ?" :
        Contacts.DISPLAY_NAME + " LIKE ?";
// Defines a variable for the search string
private String mSearchString;
// Defines the array to hold values that replace the ?
private String[] mSelectionArgs = { mSearchString };
```

### 定义onItemClick()方法

在之前的内容中，我们为Listview设置了列表项点击监听器，现在需要定义AdapterView.OnItemClickListener.onItemClick()方法以实现监听器行为：

```java
@Override
public void onItemClick(
    AdapterView<?> parent, View item, int position, long rowID) {
    // Get the Cursor
    Cursor cursor = parent.getAdapter().getCursor();
    // Move to the selected contact
    cursor.moveToPosition(position);
    // Get the _ID value
    mContactId = getLong(CONTACT_ID_INDEX);
    // Get the selected LOOKUP KEY
    mContactKey = getString(CONTACT_KEY_INDEX);
    // Create the contact's content Uri
    mContactUri = Contacts.getLookupUri(mContactId, mContactKey);
    /*
     * You can use mContactUri as the content URI for retrieving
     * the details for a contact.
     */
}
```

### 初始化Loader

由于使用了CursorLoader获取数据，我们必须初始化后台线程和其他的控制异步获取数据的变量。需要在onActivityCreated()方法中做初始化的工作，这个方法是在Fragment的界面显示之前被调用的，相关代码展示如下：

```java
public class ContactsFragment extends Fragment implements
    LoaderManager.LoaderCallbacks<Cursor> {
...
	// Called just before the Fragment displays its UI
	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
    	// Always call the super method first
    	super.onActivityCreated(savedInstanceState);
    	...
    	// Initializes the loader
    	getLoaderManager().initLoader(0, null, this);
```

### 实现onCreateLoader()方法

我们需要实现onCreateLoader()方法，这个方法是在调用initLoader()后马上被loader框架调用的。

在onCreateLoader()方法中，设置搜索字符串模式。为了让一个字符串符合一个模式，插入"%"字符代表0个或多个字符，插入"_"代表一个字符。例如，模式%Jefferson%将会匹配“Thomas Jefferson”和“Jefferson Davis”。

这个方法返回一个CursorLoader对象。对于内容URI，则使用了Contacts.CONTENT_URI，这个URI关联到整个表，例子如下所示：

```java
...
@Override
public Loader<Cursor> onCreateLoader(int loaderId, Bundle args) {
    /*
     * Makes search string into pattern and
     * stores it in the selection array
     */
    mSelectionArgs[0] = "%" + mSearchString + "%";
    // Starts the query
    return new CursorLoader(
            getActivity(),
            Contacts.CONTENT_URI,
            PROJECTION,
            SELECTION,
            mSelectionArgs,
            null
    );
}
```

### 实现onLoadFinished()方法和onLoaderReset()方法

实现onLoadFinished()方法。当Contacts Provider返回查询结果的时候，loader框架会调用onLoadFinished()方法。在这个方法中，将查询结果Cursor传给SimpleCursorAdapter，这将会使用这个搜索结果自动更新ListView。

```java
public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
    // Put the result Cursor in the adapter for the ListView
    mCursorAdapter.swapCursor(cursor);
}
```

当loader框架检测到结果集Cursor包含过时的数据时，它会调用onLoaderReset()。我们需要删除SimpleCursorAdapter对已经存在Cursor的引用。如果不这么做的话，loader框架将不会回收Cursor对象，这将会导致内存泄漏。例如：

```java
@Override
public void onLoaderReset(Loader<Cursor> loader) {
    // Delete the reference to the existing Cursor
    mCursorAdapter.swapCursor(null);
}
```

我们现在已经实现了一个应用的关键部分，即根据搜索字符串匹配联系人名字和将获得的结果展示在ListView中。用户可以点击选择一个联系人名字，这将会触发一个监听器，在监听器的回调函数中，你可以使用此联系人的数据做进一步的处理。例如，你可以进一步获取此联系人的详情，想要知道何如获取联系人详情，请继续学习下一课[获取联系人详情](retrieve-detail.html)。

想要了解更多搜索用户界面的知识，请参考API指南[Creating a Search Interface](http://developer.android.com/guide/topics/search/search-dialog.html)。

这一课的以下内容展示了在Contacts Provider中查找联系人的其他方法。

## 根据特定的数据类型匹配联系人

这种方法可以让我们指定想要匹配的数据类型。根据名字去检索是这种类型的查询的一个具体例子。但也可以用任何与联系人详情数据相关的数据类型去做查询。例如，我们可以检索具有特定邮政编码联系人，在这种情况下，搜索字符串将会去匹配存储在一个邮政编码列中的数据。

为了实现这种类型的检索，首先实现以下的代码，正如之前的内容所展示的：

* 请求读取联系人的权限
* 定义列表和列表项的布局
* 定义显示联系人列表的Fragment
* 定义全局变量
* 初始化Fragment
* 为ListView设置CursorAdapter
* 设置选择联系人的监听器
* 定义Cursor的列索引常量

	尽管我们现在从不同的表中取数据，检索列的映射顺序是一样的，所以我们可以为这个Cursor使用同样的索引常量。
* 定义onItemClick()方法
* 初始化loader
* 实现onLoadFinished()方法和onLoaderReset()方法

为了将搜索字符串匹配特定的详请数据类型并显示结果，以下的步骤展示了我们需要额外添加的代码。

### 选择要查询的数据类型和数据库表

为了从特定类型的详请数据中查询，我们必须知道的数据类型的自定义MIME类型的值。每一个数据类型拥有唯一的`MIME`类型值，这个值在ContactsContract.CommonDataKinds的子类中被定义为常量`CONTENT_ITEM_TYPE`，并且与实际的数据类型相关。子类的名字会表明它们的实际数据类型。例如，email数据的子类是`ContactsContract.CommonDataKinds.Email`，并且email的自定义MIME类型是`Email.CONTENT_ITEM_TYPE`。

在搜索中需要使用ContactsContract.Data类。同时所有需要的常量，包括数据映射、选择字句、排序规则都是由这个类定义或继承自此类。

### 定义查询映射

为了定义一个查询映射，请选择一个或者多个定义在ContactsContract.Data表或其子类的列。Contacts Provider在返回行结果集之前，隐式的连接了ContactsContract.Data表和其他表。例如：

```java
@SuppressLint("InlinedApi")
private static final String[] PROJECTION = {
    /*
     * The detail data row ID. To make a ListView work,
     * this column is required.
     */
    Data._ID,
    // The primary display name
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB ?
            Data.DISPLAY_NAME_PRIMARY :
            Data.DISPLAY_NAME,
    // The contact's _ID, to construct a content URI
    Data.CONTACT_ID
    // The contact's LOOKUP_KEY, to construct a content URI
    Data.LOOKUP_KEY (a permanent link to the contact
};
```

### 定义查询标准

为了根据特定的联系人数据类型查询字符串，请按照以下方法构建查询选择子句：

* 包含搜索字符串的列名。这个名字根据数据类型所变化，所以我们需要找到与数据类型对应的ContactsContract.CommonDataKinds的子类，并从这个子类中选择列名。例如，想要搜索email地址，需要使用Email.ADDRESS列。
* 搜索字符串本身，请在查询选择子句里使用"?"表示。
* 列名包含自定义的MIME类型值。这个列名字总是Data.MIMETYPE。
* 自定义MIME类型值的数据类型。如之前描述，这需要使用ContactsContract.CommonDataKinds子类中的`CONTENT_ITEM_TYPE`常量。例如，email数据的MIME类型值是`Email.CONTENT_ITEM_TYPE`。需要在这个常量值的开头和结尾加上"'"（单引号）。否则，provider会把这个值翻译成一个变量而不是一个字符串。我们不需要为这个值提供占位符，因为我们在使用一个常量而不是用户提供的值。例如：

```java
/*
 * Constructs search criteria from the search string
 * and email MIME type
 */
private static final String SELECTION =
    /*
     * Searches for an email address
     * that matches the search string
     */
    Email.ADDRESS + " LIKE ? " + "AND " +
    /*
     * Searches for a MIME type that matches
     * the value of the constant
     * Email.CONTENT_ITEM_TYPE. Note the
     * single quotes surrounding Email.CONTENT_ITEM_TYPE.
     */
    Data.MIMETYPE + " = '" + Email.CONTENT_ITEM_TYPE + "'";
```

下一步，定义包含选择字符串的变量：

```java
String mSearchString;
String[] mSelectionArgs = { "" };
```

### 实现onCreateLoader()方法

现在，我们已经详述了想要的数据和如何找到这些数据，如何在onCreateLoader()方法中定义一个查询。使用你的数据映射、查询选择表达式和一个数组作为选择表达式的参数，并从这个方法中返回一个新的CursorLoader对象。而内容URI需要使用Data.CONTENT_URI，例如：

```java
@Override
public Loader<Cursor> onCreateLoader(int loaderId, Bundle args) {
    // OPTIONAL: Makes search string into pattern
    mSearchString = "%" + mSearchString + "%";
    // Puts the search string into the selection criteria
    mSelectionArgs[0] = mSearchString;
    // Starts the query
    return new CursorLoader(
            getActivity(),
            Data.CONTENT_URI,
            PROJECTION,
            SELECTION,
            mSelectionArgs,
            null
    );
}
```

这段代码片段是基于特定的联系人详情数据类型的简单反向查找。如果我们的应用关注于某一种特定的数据类型，比如说email地址，并且允许用户获得与此数据相关的联系人名字，这种形式的查询是最好的方法。

## 根据任意类型的数据匹配联系人

根据任意数据类型获取联系人时，如果联系人的数据（这些数据包括名字、email地址、邮件地址和电话号码等等）能匹配要搜索的字符串，那么该联系人信息将会被返回。这种搜索结果会比较广泛。例如，如果搜索字符串是"Doe"，搜索任意类型的数据将会返回名字为"Jone Doe"的联系人，也会返回一个住在"Doe Street"的联系人。

为了完成这种类型的查询，就像之前展示的那样，首先需要实现以下代码：

* 请求读取联系人的权限
* 定义列表和列表项的布局
* 定义显示联系人列表的Fragment
* 定义全局变量
* 初始化Fragment
* 为ListView设置CursorAdapter
* 设置选择联系人的监听器
* 定义Cursor的列索引常量

	对于这种形式的查询，你需要使用与在“使用特定类型的数据匹配联系人”那一节中相同的表，也可以使用相同的列索引。
* 定义onItemClick()方法
* 初始化loader
* 实现onLoadFinished()方法和onLoaderReset()方法

以下的步骤展示了为了能够根据任意的数据类型去匹配查询字符串并显示结果列表，我们需要添加的额外代码。

### 去除查询标准

不需要为mSelectionArgs定义查询标准常量SELECTION。这些内容在这种类型的检索不会被用到。

### 实现onCreateLoader()方法

实现onCreateLoader()方法，返回一个新的CursorLoader对象。我们不需要把搜索字符串转化成一个搜索模式，因为Contacts Provider会自动做这件事。使用Contacts.CONTENT\_FILTER\_URI作为基础查询URI，并使用Uri.withAppendedPath()方法将搜索字符串添加到基础URI中。使用这个URI会自动触发对任意数据类型的搜索，就像以下例子所示：

```java
@Override
public Loader<Cursor> onCreateLoader(int loaderId, Bundle args) {
    /*
     * Appends the search string to the base URI. Always
     * encode search strings to ensure they're in proper
     * format.
     */
    Uri contentUri = Uri.withAppendedPath(
            Contacts.CONTENT_FILTER_URI,
            Uri.encode(mSearchString));
    // Starts the query
    return new CursorLoader(
            getActivity(),
            contentUri,
            PROJECTION,
            null,
            null,
            null
    );
}
```

这段代码片段，是想要在Contacts Provider中建立广泛搜索类型应用的基础部分。这种方法对那些想要实现与通讯录应用联系人列表中相似搜索功能的应用，会很有帮助。
