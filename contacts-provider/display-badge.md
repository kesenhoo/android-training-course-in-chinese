# 显示联系人头像

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/contacts-provider/display-contact-badge.html>

这一课展示了如何在我们的应用界面上添加一个[QuickContactBadge]()，以及如何为它绑定数据。
QuickContactBadge是一个在初始情况下显示联系人缩略图头像的widget。尽管我们可以使用任何[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)作为缩略图头像，但是我们通常会使用从联系人照片缩略图中解码出来的Bitmap。

这个小的图片是一个控件，当用户点击它时，QuickContactBadge会展开一个包含以下内容的对话框：

* 一个大的联系人头像

	与这个联系人关联的大的头像，如果此人没有设置头像，则显示预留的图案。

* 应用程序图标

	根据联系人详情数据，显示每一个能够被手机中的应用所处理的数据的图标。例如，如果联系人的数据包含一个或多个email地址，就会显示email应用的图标。当用户点击这个图标的时候，这个联系人所有的email地址都会显示出来。当用户点击其中一个email地址时，email应用将会显示一个界面，让用户为选中的地址撰写邮件。

QuickContactBadge视图提供了对联系人数据的即时访问，是一种与联系人沟通的快捷方式。用户不用查询一个联系人，查找并复制信息，然后把信息粘贴到合适的应用中。他们可以点击QuickContactBadge，选择他们想要的沟通方式，然后直接把信息发送给合适的应用中。

## 添加一个QuickContactBadge视图

为了添加一个QuickContactBadge视图，需要在布局文件中插入一个QuickContactBadge。例如：

```xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
                android:layout_width="match_parent"
                android:layout_height="match_parent">
...
    <QuickContactBadge
               android:id=@+id/quickbadge
               android:layout_height="wrap_content"
               android:layout_width="wrap_content"
               android:scaleType="centerCrop"/>
    ...
</RelativeLayout>
```

## 获取Contacts Provider的数据

为了能在QuickContactBadge中显示联系人，我们需要这个联系人的内容URI和显示头像的Bitmap。我们可以从在Contacts Provider中获取到的数据列中生成这两个数据。需要指定这些列作为查询映射去把数据加载到Cursor中。

对于Android 3.0（API版本为11）以及以后的版本，需要在查询映射中添加以下列：

* [Contacts._ID](http://developer.android.com/reference/android/provider/BaseColumns.html#_ID)
* [Contacts.LOOKUP_KEY](http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#LOOKUP_KEY)
* [Contacts.PHOTO_THUMBNAIL_URI](http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#PHOTO_THUMBNAIL_URI)

对于Android 2.3.3（API版本为10）以及之前的版本，则使用以下列：

* [Contacts._ID](http://developer.android.com/reference/android/provider/BaseColumns.html#_ID)
* [Contacts.LOOKUP_KEY](http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#LOOKUP_KEY)

这一课的剩余部分假设你已经获取到了包含这些以及其他你可能选择的数据列的Cursor对象。想要学习如何获取这些列对象的Cursor，请参阅课程[获取联系人列表](retrieve-names.html)。

## 设置联系人URI和缩略图

一旦我们已经拥有了所需的数据列，那么我们就可以为QuickContactBadge视图绑定数据了。

### 设置联系人URI

为了设置联系人URI，需要调用[getLookupUri(id, lookupKey)]()去获取[CONTENT_LOOKUP_URI](http://developer.android.com/reference/android/provider/ContactsContract.Contacts.html#CONTENT_LOOKUP_URI)，然后调用[assignContactUri()](http://developer.android.com/reference/android/widget/QuickContactBadge.html#assignContactUri(android.net.Uri))去为QuickContactBadge设置对应的联系人。例如：

```java
// The Cursor that contains contact rows
Cursor mCursor;
// The index of the _ID column in the Cursor
int mIdColumn;
// The index of the LOOKUP_KEY column in the Cursor
int mLookupKeyColumn;
// A content URI for the desired contact
Uri mContactUri;
// A handle to the QuickContactBadge view
QuickContactBadge mBadge;
...
mBadge = (QuickContactBadge) findViewById(R.id.quickbadge);
/*
 * Insert code here to move to the desired cursor row
 */
// Gets the _ID column index
mIdColumn = mCursor.getColumnIndex(Contacts._ID);
// Gets the LOOKUP_KEY index
mLookupKeyColumn = mCursor.getColumnIndex(Contacts.LOOKUP_KEY);
// Gets a content URI for the contact
mContactUri =
        Contacts.getLookupUri(
            mCursor.getLong(mIdColumn),
            mCursor.getString(mLookupKeyColumn)
        );
mBadge.assignContactUri(mContactUri);
```

当用户点击QuickContactBadge图标的时候，这个联系人的详细信息将会自动展现在对话框中。

### 设置联系人照片的缩略图

为QuickContactBadge设置联系人URI并不会自动加载联系人的缩略图照片。为了加载联系人照片，需要从联系人的Cursor对象的一行数据中获取照片的URI，使用这个URI去打开包含压缩的缩略图文件，并把这个文件读到Bitmap对象中。

> **Note：**<a href="http://developer.android.com/reference/android/provider/ContactsContract.ContactsColumns.html#PHOTO_THUMBNAIL_URI">PHOTO\_THUMBNAIL\_URI</a>这一列在Android 3.0之前的版本是不存在的。对于这些版本，我们必须从[Contacts.Photo](http://developer.android.com/reference/android/provider/ContactsContract.Contacts.Photo.html)表中获取照片的URI。

首先，为包含Contacts._ID和Contacts.LOOKUP_KEY的Cursor数据列设置对应的变量，这在之前已经有描述：

```java
// The column in which to find the thumbnail ID
int mThumbnailColumn;
/*
 * The thumbnail URI, expressed as a String.
 * Contacts Provider stores URIs as String values.
 */
String mThumbnailUri;
...
/*
 * Gets the photo thumbnail column index if
 * platform version >= Honeycomb
 */
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
    mThumbnailColumn =
            mCursor.getColumnIndex(Contacts.PHOTO_THUMBNAIL_URI);
// Otherwise, sets the thumbnail column to the _ID column
} else {
    mThumbnailColumn = mIdColumn;
}
/*
 * Assuming the current Cursor position is the contact you want,
 * gets the thumbnail ID
 */
mThumbnailUri = mCursor.getString(mThumbnailColumn);
...
```

定义一个方法，使用与这个联系人的照片有关的数据和目标视图的尺寸作为参数，返回一个尺寸合适的缩略图Bitmap对象。下面先构建一个指向这个缩略图的URI：

```java
 /**
 * Load a contact photo thumbnail and return it as a Bitmap,
 * resizing the image to the provided image dimensions as needed.
 * @param photoData photo ID Prior to Honeycomb, the contact's _ID value.
 * For Honeycomb and later, the value of PHOTO_THUMBNAIL_URI.
 * @return A thumbnail Bitmap, sized to the provided width and height.
 * Returns null if the thumbnail is not found.
 */
private Bitmap loadContactPhotoThumbnail(String photoData) {
    // Creates an asset file descriptor for the thumbnail file.
    AssetFileDescriptor afd = null;
    // try-catch block for file not found
    try {
        // Creates a holder for the URI.
        Uri thumbUri;
        // If Android 3.0 or later
        if (Build.VERSION.SDK_INT
                >=
            Build.VERSION_CODES.HONEYCOMB) {
            // Sets the URI from the incoming PHOTO_THUMBNAIL_URI
            thumbUri = Uri.parse(photoData);
        } else {
        // Prior to Android 3.0, constructs a photo Uri using _ID
            /*
             * Creates a contact URI from the Contacts content URI
             * incoming photoData (_ID)
             */
            final Uri contactUri = Uri.withAppendedPath(
                    Contacts.CONTENT_URI, photoData);
            /*
             * Creates a photo URI by appending the content URI of
             * Contacts.Photo.
             */
            thumbUri =
                    Uri.withAppendedPath(
                            contactUri, Photo.CONTENT_DIRECTORY);
        }

    /*
     * Retrieves an AssetFileDescriptor object for the thumbnail
     * URI
     * using ContentResolver.openAssetFileDescriptor
     */
    afd = getActivity().getContentResolver().
            openAssetFileDescriptor(thumbUri, "r");
    /*
     * Gets a file descriptor from the asset file descriptor.
     * This object can be used across processes.
     */
    FileDescriptor fileDescriptor = afd.getFileDescriptor();
    // Decode the photo file and return the result as a Bitmap
    // If the file descriptor is valid
    if (fileDescriptor != null) {
        // Decodes the bitmap
        return BitmapFactory.decodeFileDescriptor(
                fileDescriptor, null, null);
        }
    // If the file isn't found
    } catch (FileNotFoundException e) {
        /*
         * Handle file not found errors
         */
    }
    // In all cases, close the asset file descriptor
    } finally {
        if (afd != null) {
            try {
                afd.close();
            } catch (IOException e) {}
        }
    }
    return null;
}
```

在代码中调用loadContactPhotoThumbnail()去获取缩略图Bitmap对象，使用获取的Bitmap对象去设置QuickContactBadge头像缩略图。


```java
...
/*
 * Decodes the thumbnail file to a Bitmap.
 */
Bitmap mThumbnail =
        loadContactPhotoThumbnail(mThumbnailUri);
/*
 * Sets the image in the QuickContactBadge
 * QuickContactBadge inherits from ImageView, so
 */
mBadge.setImageBitmap(mThumbnail);
```

## 把QuickContactBadge添加到ListView


QuickContactBadge对于一个展示联系人列表的ListView来说是一个非常有用的添加功能。使用QuickContactBadge去为每一个联系人显示一个缩略图，当用户点击这个缩略图时，QuickContactBadge对话框将会显示。

### 为ListView添加QuickContactBadge

首先，在列表项布局文件中添加QuickContactBadge视图元素。例如，如果我们想为获取到的每一个联系人显示QuickContactBadge和名字，把以下的XML内容放到对应的布局文件中：

```xml
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
                android:layout_width="match_parent"
                android:layout_height="wrap_content">
    <QuickContactBadge
        android:id="@+id/quickcontact"
        android:layout_height="wrap_content"
        android:layout_width="wrap_content"
        android:scaleType="centerCrop"/>
    <TextView android:id="@+id/displayname"
              android:layout_width="match_parent"
              android:layout_height="wrap_content"
              android:layout_toRightOf="@+id/quickcontact"
              android:gravity="center_vertical"
              android:layout_alignParentRight="true"
              android:layout_alignParentTop="true"/>
</RelativeLayout>
```

在以下的章节中，这个文件被称为`contact_item_layout.xml`。

### 设置自定义的CursorAdapter

定义一个继承自CursorAdapter的adapter来将CursorAdapter绑定到一个包含QuickContactBadge的ListView中。这种方式允许我们在绑定数据到QuickContactBadge之前对Cursor中的数据进行处理。同时也能将多个Cursor中的列绑定到QuickContactBadge。而使用普通的CursorAdapter是不能完成这些操作的。

我们定义的CursorAdapter的子类必须重写以下方法：

* [CursorAdapter.newView()]()

	填充一个View对象去持有列表项布局。在重写这个方法的过程中，需要保存这个布局的子View的handles，包括QuickContactBadge的handles。通过采用这种方法，避免了每次在填充新的布局时都去获取子View的handles。

	我们必须重写这个方法以便能够获取每个子View对象的handles。这种方法允许我们控制这些子View对象在CursorAdapter.bindView()方法中的绑定。

* [CursorAdapter.bindView()]()

	将数据从当前Cursor行绑定到列表项布局的子View对象中。必须重写这个方法以便能够将联系人的URI和缩略图信息绑定到QuickContactBadge。这个方法的默认实现仅仅允许在数据列和View之间的一对一映射。


以下的代码片段是一个包含了自定义CursorAdapter子类的例子。

### 定义自定义的列表Adapter

定义CursorAdapter的子类包括编写这个类的构造方法，以及重写newView()和bindView():

```java
private class ContactsAdapter extends CursorAdapter {
    private LayoutInflater mInflater;
    ...
    public ContactsAdapter(Context context) {
        super(context, null, 0);

        /*
         * Gets an inflater that can instantiate
         * the ListView layout from the file.
         */
        mInflater = LayoutInflater.from(context);
        ...
    }
    ...
    /**
     * Defines a class that hold resource IDs of each item layout
     * row to prevent having to look them up each time data is
     * bound to a row.
     */
    private class ViewHolder {
        TextView displayname;
        QuickContactBadge quickcontact;
    }
    ..
    @Override
    public View newView(
            Context context,
            Cursor cursor,
            ViewGroup viewGroup) {
        /* Inflates the item layout. Stores resource IDs in a
         * in a ViewHolder class to prevent having to look
         * them up each time bindView() is called.
         */
        final View itemView =
                mInflater.inflate(
                        R.layout.contact_list_layout,
                        viewGroup,
                        false
                );
        final ViewHolder holder = new ViewHolder();
        holder.displayname =
                (TextView) view.findViewById(R.id.displayname);
        holder.quickcontact =
                (QuickContactBadge)
                        view.findViewById(R.id.quickcontact);
        view.setTag(holder);
        return view;
    }
    ...
    @Override
    public void bindView(
            View view,
            Context context,
            Cursor cursor) {
        final ViewHolder holder = (ViewHolder) view.getTag();
        final String photoData =
                cursor.getString(mPhotoDataIndex);
        final String displayName =
                cursor.getString(mDisplayNameIndex);
        ...
        // Sets the display name in the layout
        holder.displayname = cursor.getString(mDisplayNameIndex);
        ...
        /*
         * Generates a contact URI for the QuickContactBadge.
         */
        final Uri contactUri = Contacts.getLookupUri(
                cursor.getLong(mIdIndex),
                cursor.getString(mLookupKeyIndex));
        holder.quickcontact.assignContactUri(contactUri);
        String photoData = cursor.getString(mPhotoDataIndex);
        /*
         * Decodes the thumbnail file to a Bitmap.
         * The method loadContactPhotoThumbnail() is defined
         * in the section "Set the Contact URI and Thumbnail"
         */
        Bitmap thumbnailBitmap =
                loadContactPhotoThumbnail(photoData);
        /*
         * Sets the image in the QuickContactBadge
         * QuickContactBadge inherits from ImageView
         */
        holder.quickcontact.setImageBitmap(thumbnailBitmap);
}
```

### 设置变量

在代码中，设置相关变量，添加一个包括必须数据列的Cursor。

> **Note：**以下的代码片段使用了方法`loadContactPhotoThumbnail()`，这个方法是在[设置联系人URI和缩略图]()那一节中定义的。

例如：

```java
public class ContactsFragment extends Fragment implements
        LoaderManager.LoaderCallbacks<Cursor> {
...
// Defines a ListView
private ListView mListView;
// Defines a ContactsAdapter
private ContactsAdapter mAdapter;
...
// Defines a Cursor to contain the retrieved data
private Cursor mCursor;
/*
 * Defines a projection based on platform version. This ensures
 * that you retrieve the correct columns.
 */
private static final String[] PROJECTION =
        {
            Contacts._ID,
            Contacts.LOOKUP_KEY,
            (Build.VERSION.SDK_INT >=
             Build.VERSION_CODES.HONEYCOMB) ?
                    Contacts.DISPLAY_NAME_PRIMARY :
                    Contacts.DISPLAY_NAME
            (Build.VERSION.SDK_INT >=
             Build.VERSION_CODES.HONEYCOMB) ?
                    Contacts.PHOTO_THUMBNAIL_ID :
                    /*
                     * Although it's not necessary to include the
                     * column twice, this keeps the number of
                     * columns the same regardless of version
                     */
                    Contacts_ID
            ...
        };
/*
 * As a shortcut, defines constants for the
 * column indexes in the Cursor. The index is
 * 0-based and always matches the column order
 * in the projection.
 */
// Column index of the _ID column
private int mIdIndex = 0;
// Column index of the LOOKUP_KEY column
private int mLookupKeyIndex = 1;
// Column index of the display name column
private int mDisplayNameIndex = 3;
/*
 * Column index of the photo data column.
 * It's PHOTO_THUMBNAIL_URI for Honeycomb and later,
 * and _ID for previous versions.
 */
private int mPhotoDataIndex =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB ?
        3 :
        0;
...
```

### 设置ListView

在[Fragment.onCreate()](http://developer.android.com/reference/android/support/v4/app/Fragment.html#onCreate(android.os.Bundle))方法中，实例化自定义的adapter对象，获得一个ListView的handle。

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    ...
    /*
     * Instantiates the subclass of
     * CursorAdapter
     */
    ContactsAdapter mContactsAdapter =
            new ContactsAdapter(getActivity());
    /*
     * Gets a handle to the ListView in the file
     * contact_list_layout.xml
     */
    mListView = (ListView) findViewById(R.layout.contact_list_layout);
    ...
}
...
```

在[onActivityCreated()](http://developer.android.com/reference/android/support/v4/app/Fragment.html#onActivityCreated(android.os.Bundle))方法中，将ContactsAdapter绑定到ListView。

```java
@Override
public void onActivityCreated(Bundle savedInstanceState) {
    ...
    // Sets up the adapter for the ListView
    mListView.setAdapter(mAdapter);
    ...
}
...
```

当获取到一个包含联系人数据的Cursor时（通常在onLoadFinished()的时候），调用swapCursor()把Cursor中的数据绑定到ListView。这将会为联系人列表中的每一项都显示一个QuickContactBadge。

```java
public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
    // When the loader has completed, swap the cursor into the adapter.
    mContactsAdapter.swapCursor(cursor);
}
```

当我们使用CursorAdapter或其子类中将Cursor中的数据绑定到ListView，并且使用了CursorLoader去加载Cursor数据时，记得要在onLoaderReset()方法的实现中清理对Cursor对象的引用。例如：

```java
@Override
public void onLoaderReset(Loader<Cursor> loader) {
    // Removes remaining reference to the previous Cursor
    mContactsAdapter.swapCursor(null);
}
```




