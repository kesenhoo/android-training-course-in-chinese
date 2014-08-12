# 创建Stub Content Provider

> 编写:[jdneo](https://github.com/jdneo) - 原文:

Sync Adapter框架是设计成用来和设备数据一起工作的，这些设备的数据被灵活且高安全的Content Provider所管理。因此，Sync Adapter框架会期望应用所使用的框架已经为它的本地数据定义了Content Provider。如果Sync Adapter框架尝试去运行你的Sync Adapter，而你的应用没有一个Content Provider的话，那么你的Sync Adapter将会崩溃。

如果你正在开发一个新的应用，它将数据从服务器传输到一台设备上，那么你务必应该考虑将本地数据存储于Content Provider中。因为它对于Sync Adapter来说是很重要的，另外Content Provider可以给予许多安全上的好处，并且是专门被设计成在Android设备上处理数据存储的。要学习如何创建一个Content Provider，可以阅读：[Creating a Content Provider](http://developer.android.com/guide/topics/providers/content-provider-creating.html)。

然而，如果你已经通过别的形式来存储本地数据，你仍然可以使用Sync Adapter来处理数据传输。为了满足Sync Adapter框架对于Content Provider的要求，可以在你的应用中添加一个空的Content Provider（Stub Content Provider）。一个Stub Content Provider实现了Content Provider类，但是所有的方法都返回null或者0。如果你添加了一个空提供器，你可以使用Sync Adapter从任何你选择的存储机制来传输数据。

如果你在你的应用中已经有了一个Content Provider，那么你就不需要一个Stub Content Provider了。在这种情况下，你可以略过这节课程，直接进入：[创建Sync Adapter](creating-sync-adapter.html)。如果你还没有一个Content Provider，这节课将向你展示如何添加一个Stub Content Provider，来允许你将你的Sync Adapter添加到框架中。

## 添加一个Stub Content Provider

要为你的应用创建一个Stub Content Provider，继承[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)并且置空它需要的方法。下面的代码片段展示了你应该如何创建Stub Content Provider：

```java
/*
 * Define an implementation of ContentProvider that stubs out
 * all methods
 */
public class StubProvider extends ContentProvider {
    /*
     * Always return true, indicating that the
     * provider loaded correctly.
     */
    @Override
    public boolean onCreate() {
        return true;
    }
    /*
     * Return an empty String for MIME type
     */
    @Override
    public String getType() {
        return new String();
    }
    /*
     * query() always returns no results
     *
     */
    @Override
    public Cursor query(
            Uri uri,
            String[] projection,
            String selection,
            String[] selectionArgs,
            String sortOrder) {
        return null;
    }
    /*
     * insert() always returns null (no URI)
     */
    @Override
    public Uri insert(Uri uri, ContentValues values) {
        return null;
    }
    /*
     * delete() always returns "no rows affected" (0)
     */
    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }
    /*
     * update() always returns "no rows affected" (0)
     */
    public int update(
            Uri uri,
            ContentValues values,
            String selection,
            String[] selectionArgs) {
        return 0;
    }
}
```

## 在清单文件中声明提供器

Sync Adapter框架会检查你的应用在清单文件中是否声明了一个Provider来验证你的应用是否有一个Content Provider。为了在清单文件中声明Stub Content Provider，添加一个[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签，并让它拥有下列属性字段：

**android:name="com.example.android.datasync.provider.StubProvider"**

指定一个实现了Stub Content Provider的类的完整包名。

**android:authorities="com.example.android.datasync.provider"**

一个URI Authority来指定Stub Content Provider。让它的值是你的应用包名加上字符串“.provider”。虽然你在这向系统声明了你的空提供器，但是这并不会导致对提供器的访问。

**android:exported="false"**

确定其它应用是否可以访问Content Provider。对于你的Stub Content Provider，由于没有让其它应用访问提供器的必要，将值设置为“false”。该值并不会影响Sync Adapter框架和Content Provider之间的交互。

**android:syncable="true"**

设置一个指明该提供器是可同步的标识。如果将这个值设置为“true”，你不需要在你的代码中调用[setIsSyncable()](http://developer.android.com/reference/android/content/ContentResolver.html#setIsSyncable\(android.accounts.Account, java.lang.String, int\))。这一标识将会允许Sync Adapter框架和Content Provider进行数据传输，但是仅仅在你显式地执行这一传输时才会进行。

下面的代码片段展示了你应该如何将[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)添加到应用清单文件中：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.android.network.sync.BasicSyncAdapter"
    android:versionCode="1"
    android:versionName="1.0" >
    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme" >
    ...
    <provider
        android:name="com.example.android.datasync.provider.StubProvider"
        android:authorities="com.example.android.datasync.provider"
        android:export="false"
        android:syncable="true"/>
    ...
    </application>
</manifest>
```

现在你已经创建了Sync Adapter框架所需要的依赖关系，你可以创建封装你的数据传输代码的组件了。该组件就叫做Sync Adapter。下节课将会展示如何将它添加到你的应用中。
