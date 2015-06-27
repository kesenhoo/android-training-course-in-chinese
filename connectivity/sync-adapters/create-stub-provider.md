# 创建 Stub Content Provider

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/sync-adapters/creating-stub-provider.html>

Sync Adapter 框架是设计成用来和设备数据一起工作的，而这些设备数据应该被灵活且安全的 Content Provider 框架管理。因此，Sync Adapter 框架会期望应用已经为它的本地数据定义了 Content Provider。如果 Sync Adapter 框架尝试去运行我们的 Sync Adapter，而我们的应用没有一个 Content Provider 的话，那么 Sync Adapter 将会崩溃。

如果我们正在开发一个新的应用，它将数据从服务器传输到一台设备上，那么我们务必考虑将本地数据存储于 Content Provider 中。除了它对于 Sync Adapter 的重要性之外，Content Provider 还可以提供许多安全上的好处，更何况它是专门为了在 Android 设备上处理数据存储而设计的。要学习如何创建一个 Content Provider，可以阅读：[Creating a Content Provider](http://developer.android.com/guide/topics/providers/content-provider-creating.html)。

然而，如果我们已经通过别的形式来存储本地数据，我们仍然可以使用 Sync Adapter 来处理数据传输。为了满足 Sync Adapter 框架对于 Content Provider 的要求，我们可以在应用中添加一个 Stub Content Provider。一个 Stub Content Provider 实现了 Content Provider 类，但是所有的方法都返回 `null` 或者 `0`。如果我们添加了一个 Stub Content Provider，那么无论数据存储机制是什么，我们都可以使用 Sync Adapter 来传输数据。

如果在我们的应用中已经有了一个 Content Provider，那么我们就不需要创建 Stub Content Provider 了。在这种情况下，我们可以略过这节课程，直接进入：[创建 Sync Adapter](create-sync-adapter.html)。如果你还没有创建 Content Provider，这节课将向你展示如何通过添加一个 Stub Content Provider，将你的 Sync Adapter 添加到框架中。

## 添加一个 Stub Content Provider

要为我们的应用创建一个 Stub Content Provider，首先继承 [ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html) 类，并且在所有需要重写的方法中，我们一律不进行任何处理而是直接返回。下面的代码片段展示了我们应该如何创建一个 Stub Content Provider：

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

## 在 Manifest 清单文件中声明 Provider

Sync Adapter 框架会通过查看应用的 manifest 文件中是否声明了 provider，来验证我们的应用是否使用了 Content Provider。为了在 manifest 清单文件中声明我们的 Stub Content Provider，添加一个 [`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html) 标签，并让它拥有下列属性字段：

`android:name="com.example.android.datasync.provider.StubProvider"`

  指定实现 Stub Content Provider 类的完整包名。

`android:authorities="com.example.android.datasync.provider"`

  指定 Stub Content Provider 的 URI Authority。用应用的包名加上字符串 `".provider"` 作为该属性字段的值。虽然我们在这里向系统声明了 Stub Content Provider，但是不会尝试访问 Provider 本身。

`android:exported="false"`

  确定其它应用是否可以访问 Content Provider。对于 Stub Content Provider 而言，由于没有让其它应用访问该 Provider 的必要，所以我们将该值设置为 `false`。该值并不会影响 Sync Adapter 框架和 Content Provider 之间的交互。

`android:syncable="true"`

  该标识指明 Provider 是可同步的。如果将这个值设置为 `true`，那么将不需要在代码中调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#setIsSyncable(android.accounts.Account, java.lang.String, int)">setIsSyncable()</a>。这一标识将会允许 Sync Adapter 框架和 Content Provider 进行数据传输，但是仅仅在我们显式地执行相关调用时，这一传输时才会进行。

下面的代码片段展示了我们应该如何将 [`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html) 标签添加到应用的 manifest 清单文件中：

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
        android:exported="false"
        android:syncable="true"/>
    ...
    </application>
</manifest>
```

现在我们已经创建了所有 Sync Adapter 框架所需要的依赖项，接下来我们可以创建封装数据传输代码的组件了。该组件就叫做 Sync Adapter。在下节课中，我们将会展示如何将这一组件添加到应用中。
