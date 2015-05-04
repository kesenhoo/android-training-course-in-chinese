# 使用Intent修改联系人信息

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/contacts-provider/modify-data.html>

这一课介绍如何使用[Intent](http://developer.android.com/reference/android/content/Intent.html)去插入一个新的联系人或者修改联系人的数据。我们不是直接访问Contacts Provider，而是通过Intent启动Contacts应用去运行适当的[Activity](http://developer.android.com/reference/android/app/Activity.html)。对于这一课中描述的数据修改行为，如果你向Intent发送扩展的数据，它会自动填充进启动的Activity页面中。

使用Intent去插入或者更新一个联系人是比较推荐的修改Contacts Provider的做法。原因如下：

* 节省了我们自行开发UI和编写代码的时间和精力。
* 避免了由于不按照Contacts Provider的规则去修改而产生的错误。
* 减少应用需要申请的权限数量。因为我们的应用把修改行为委托给已经拥有写Contacts Provider权限的Contacts应用，所以我们的应用不需要再去申请这个权限，。

## 使用Intent插入新的联系人

当我们的应用接收到新的数据时，我们通常会允许用户去插入一个新的联系人。例如，一个餐馆评论应用可以允许用户在评论餐馆的时候，把这个餐馆添加为一个联系人。可以使用Intent去做这个任务，使用我们拥有的尽可能多的数据去创建对应的Intent，然后发送这个Intent到Contacts应用。

使用Contacts应用去插入一个联系人将会向Contacts Provider中的[ContactsContract.RawContacts](http://developer.android.com/reference/android/provider/ContactsContract.RawContacts.html)表中插入一个原始联系人。必要的情况下，在创建原始联系人的时候，Contacts应用将会提示用户选择账户类型和要使用的账户。如果联系人已经存在，Contacts应用也会告知用户。用户将会有取消插入的选项，在这种情况下不会有联系人被创建。想要知道更多关于原始联系人的信息，请参阅[Contacts Provider](http://developer.android.com/guide/topics/providers/contacts-provider.html)的API指导。

### 创建一个Intent

利用Intents.Insert.ACTION创建一个新的Intent对象，并设置其MIME类型为[RawContacts.CONTENT_TYPE](http://developer.android.com/reference/android/provider/ContactsContract.RawContacts.html#CONTENT_TYPE)。例如：

```java
...
// Creates a new Intent to insert a contact
Intent intent = new Intent(Intents.Insert.ACTION);
// Sets the MIME type to match the Contacts Provider
intent.setType(ContactsContract.RawContacts.CONTENT_TYPE);
```

如果我们已经获得了此联系人的详细信息，比如说电话号码或者email地址，那么我们可以把它们作为扩展数据添加到Intent中。对于键值，需要使用[Intents.Insert](http://developer.android.com/reference/android/provider/ContactsContract.Intents.Insert.html)中对应的常量。Contacts应用将会在插入界面显示这些数据，以便用户作进一步的数据编辑和数据添加。

```java
/* Assumes EditText fields in your UI contain an email address
 * and a phone number.
 *
 */
private EditText mEmailAddress = (EditText) findViewById(R.id.email);
private EditText mPhoneNumber = (EditText) findViewById(R.id.phone);
...
/*
 * Inserts new data into the Intent. This data is passed to the
 * contacts app's Insert screen
 */
// Inserts an email address
intent.putExtra(Intents.Insert.EMAIL, mEmailAddress.getText())
/*
 * In this example, sets the email type to be a work email.
 * You can set other email types as necessary.
 */
      .putExtra(Intents.Insert.EMAIL_TYPE, CommonDataKinds.Email.TYPE_WORK)
// Inserts a phone number
      .putExtra(Intents.Insert.PHONE, mPhoneNumber.getText())
/*
 * In this example, sets the phone type to be a work phone.
 * You can set other phone types as necessary.
 */
      .putExtra(Intents.Insert.PHONE_TYPE, Phone.TYPE_WORK);
```

一旦我们创建好Intent，调用startActivity()将其发送到Contacts应用。

```java
	/* Sends the Intent
     */
    startActivity(intent);
```

这个调用将会打开Contacts应用的界面，并允许用户进入一个新的联系人。这个联系人的账户类型和账户名字列在屏幕的上方。一旦用户输入数据并点击*确定*，Contacts应用的联系人列表则会显示出来。用户可以点击*Back*键返回到我们自己创建的应用。

## 使用Intent编辑已经存在的联系人

如果用户已经选择了一个感兴趣的联系人，使用Intent去编辑这个已存在的联系人会很有用。例如，一个用来查找拥有邮政地址但是缺少邮政编码的联系人的应用，可以给用户提供查找邮政编码的选项，然后把找到的邮政编码添加到这个联系人中。

使用Intent编辑已经存在的联系人，同插入一个联系人的步骤类似。像前面介绍的[使用Intent插入新的联系人]()创建一个Intent，但是需要给这个Intent添加对应联系人的<a href="http://developer.android.com/reference/android/provider/ContactsContract.Contacts.html#CONTENT_LOOKUP_URI">Contacts.CONTENT\_LOOKUP\_URI</a>和MIME类型<a href="http://developer.android.com/reference/android/provider/ContactsContract.Contacts.html#CONTENT_ITEM_TYPE">Contacts.CONTENT\_ITEM\_TYPE</a>。如果想要使用已经拥有的详情信息编辑这个联系人，我们需要把这些数据放到Intent的扩展数据中。同时注意有些列是不能使用Intent编辑的，这些不可编辑的列在[ContactsContract.Contacts](http://developer.android.com/reference/android/provider/ContactsContract.Contacts.html) 摘要部分“Update”标题下有列出。

最后，发送这个Intent。Contacts应用会显示一个编辑界面作为回应。当用户编辑完成并保存，Contacts应用会显示一个联系人列表。当用户点击*Back*，我们自己的应用会出现。

### 创建Intent

为了能够编辑一个联系人，需要调用Intent(action)去创建一个拥有ACTION\_EDIT行为的Intent。调用setDataAndType()去设置这个Intent要编辑的联系人的Contacts.CONTENT\_LOOKUP\_URI和MIME类型Contacts.CONTENT\_ITEM\_TYPE。因为调用setType()会重写Intent当前的数据，所以我们必须同时设置数据和MIME类型。

为了得到联系人的Contacts.CONTENT\_LOOKUP\_URI，需要调用Contacts.getLookupUri(id, lookupkey)方法，该方法的参数分别是联系人的Contacts.\_ID和Contacts.LOOKUP\_KEY。

以下的代码片段展示了如何创建这个Intent：

```java
// The Cursor that contains the Contact row
    public Cursor mCursor;
    // The index of the lookup key column in the cursor
    public int mLookupKeyIndex;
    // The index of the contact's _ID value
    public int mIdIndex;
    // The lookup key from the Cursor
    public String mCurrentLookupKey;
    // The _ID value from the Cursor
    public long mCurrentId;
    // A content URI pointing to the contact
    Uri mSelectedContactUri;
    ...
    /*
     * Once the user has selected a contact to edit,
     * this gets the contact's lookup key and _ID values from the
     * cursor and creates the necessary URI.
     */
    // Gets the lookup key column index
    mLookupKeyIndex = mCursor.getColumnIndex(Contacts.LOOKUP_KEY);
    // Gets the lookup key value
    mCurrentLookupKey = mCursor.getString(mLookupKeyIndex);
    // Gets the _ID column index
    mIdIndex = mCursor.getColumnIndex(Contacts._ID);
    mCurrentId = mCursor.getLong(mIdIndex);
    mSelectedContactUri =
            Contacts.getLookupUri(mCurrentId, mCurrentLookupKey);
    ...
    // Creates a new Intent to edit a contact
    Intent editIntent = new Intent(Intent.ACTION_EDIT);
    /*
     * Sets the contact URI to edit, and the data type that the
     * Intent must match
     */
    editIntent.setDataAndType(mSelectedContactUri,Contacts.CONTENT_ITEM_TYPE);
```

### 添加导航标志

在Android 4.0（API版本14）和更高的版本，Contacts应用中的一个问题会导致错误的页面导航。我们的应用发送一个编辑联系人的Intent到Contacts应用，用户编辑并保存这个联系人，当用户点击*Back*键的时候会看到联系人列表页面。用户需要点击最近使用的应用，然后选择我们的应用，才能返回到我们自己的应用。

要在Android 4.0.3（API版本15）及以后的版本解决此问题，需要添加`finishActivityOnSaveCompleted`扩展数据参数到这个Intent，并将它的值设置为true。Android 4.0之前的版本也能够接受这个参数，但是不起作用。为了设置扩展数据，请按照以下方式去做：

```java
	// Sets the special extended data for navigation
    editIntent.putExtra("finishActivityOnSaveCompleted", true);
```

### 添加其他的扩展数据

对Intent添加额外的扩展数据，需要调用putExtra()。可以为常见的联系人数据字段添加扩展数据，这些常见字段的key值可以从[Intents.Insert](http://developer.android.com/reference/android/provider/ContactsContract.Intents.Insert.html) API参考文档中查到。记住ContactsContract.Contacts表中有些列是不能编辑的，这些列在[ContactsContract.Contacts](http://developer.android.com/reference/android/provider/ContactsContract.Contacts.html)的摘要部分“Update”标题下有列出。

### 发送Intent

最后，发送我们已经构建好的Intent。例如：

```java
	// Sends the Intent
    startActivity(editIntent);
```

## 使用Intent让用户去选择是插入还是编辑联系人

我们可以通过发送带有`ACTION_INSERT_OR_EDIT`行为的Intent，让用户去选择是插入联系人还是编辑已有的联系人。例如，一个email客户端应用会允许用户添加一个收件地址到新的联系人，或者仅仅作为额外的邮件地址添加到已有的联系人。需要为这个Intent设置MIME类型Contacts.CONTENT\_ITEM\_TYPE，但是不需要设置数据URI。

当我们发送这个Intent后，Contacts应用会展示一个联系人列表。用户可以选择是插入一个新的联系人还是挑选一个存在的联系人去编辑。任何添加到Intent中的扩展数据字段都会填充在界面上。我们可以使用任何在[Intents.Insert](http://developer.android.com/reference/android/provider/ContactsContract.Intents.Insert.html)中指定的的key值。以下的代码片段展示了如何构建和发送这个Intent：

```java
// Creates a new Intent to insert or edit a contact
    Intent intentInsertEdit = new Intent(Intent.ACTION_INSERT_OR_EDIT);
    // Sets the MIME type
    intentInsertEdit.setType(Contacts.CONTENT_ITEM_TYPE);
    // Add code here to insert extended data, if desired
    ...
    // Sends the Intent with an request ID
    startActivity(intentInsertEdit);
```

