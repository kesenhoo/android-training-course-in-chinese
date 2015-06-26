# 创建 Sync Adpater

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/sync-adapters/creating-sync-adapter.html>

设备和服务器之间执行数据传输的代码会封装在应用的 Sync Adapter 组件中。Sync Adapter 框架会基于我们的调度和触发操作，运行 Sync Adapter 组件中的代码。要将同步适配组件添加到应用当中，我们需要添加下列部件：

Sync Adapter 类

  将我们的数据传输代码封装到一个与 Sync Adapter 框架兼容的接口当中。

绑定 [Service](http://developer.android.com/reference/android/app/Service.html)

  通过一个绑定服务，允许 Sync Adapter 框架运行 Sync Adapter 类中的代码。

Sync Adapter 的 XML 元数据文件

  该文件包含了有关 Sync Adapter 的信息。框架会根据该文件确定应该如何加载并调度数据传输任务。

应用 manifest 清单文件的声明

  需要在应用的 manifest 清单文件中声明绑定服务；同时还需要指出 Sync Adapter 的元数据。

这节课将会向我们展示如何定义他们。

## 创建一个 Sync Adapter 类

在这部分课程中，我们将会学习如何创建封装了数据传输代码的 Sync Adapter 类。创建该类需要继承 Sync Adapter 的基类；为该类定义构造函数；以及实现相关的方法。在这些方法中，我们定义数据传输任务。

### 继承 Sync Adapter 基类：AbstractThreadedSyncAdapter

要创建 Sync Adapter 组件，首先继承 [AbstractThreadedSyncAdapter](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html)，然后编写它的构造函数。与使用 <a href="http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)">Activity.onCreate()</a> 配置 Activity 时一样，每次我们重新创建 Sync Adapter 组件的时候，使用构造函数执行相关的配置。例如，如果我们的应用使用一个 Content Provider 来存储数据，那么使用构造函数来获取一个 [ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html) 实例。由于从 Android 3.0 开始添加了第二种形式的构造函数，来支持 `parallelSyncs` 参数，所以我们需要创建两种形式的构造函数来保证兼容性。

> **Note：**Sync Adapter 框架是设计成和 Sync Adapter 组件的单例一起工作的。实例化 Sync Adapter 组件的更多细节，会在后面的章节中展开。

下面的代码展示了如何实现 [AbstractThreadedSyncAdapter](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html) 和它的构造函数：

```java
/**
 * Handle the transfer of data between a server and an
 * app, using the Android sync adapter framework.
 */
public class SyncAdapter extends AbstractThreadedSyncAdapter {
    ...
    // Global variables
    // Define a variable to contain a content resolver instance
    ContentResolver mContentResolver;
    /**
     * Set up the sync adapter
     */
    public SyncAdapter(Context context, boolean autoInitialize) {
        super(context, autoInitialize);
        /*
         * If your app uses a content resolver, get an instance of it
         * from the incoming Context
         */
        mContentResolver = context.getContentResolver();
    }
    ...
    /**
     * Set up the sync adapter. This form of the
     * constructor maintains compatibility with Android 3.0
     * and later platform versions
     */
    public SyncAdapter(
            Context context,
            boolean autoInitialize,
            boolean allowParallelSyncs) {
        super(context, autoInitialize, allowParallelSyncs);
        /*
         * If your app uses a content resolver, get an instance of it
         * from the incoming Context
         */
        mContentResolver = context.getContentResolver();
        ...
    }
```

### 在 onPerformSync() 中添加数据传输代码

Sync Adapter 组件并不会自动地执行数据传输。它对我们的数据传输代码进行封装，使得 Sync Adapter 框架可以在后台执行数据传输，而不会牵连到我们的应用。当框架准备同步我们的应用数据时，它会调用我们所实现的 <a href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a> 方法。

为了便于将数据从应用程序转移到 Sync Adapter 组件中，Sync Adapter 框架调用 <a href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a>，它具有下面的参数：

Account

  该 [Account](http://developer.android.com/reference/android/accounts/Account.html) 对象与触发 Sync Adapter 的事件相关联。如果服务端不需要使用账户，那么我们不需要使用这个对象内的信息。

Extras

  一个 Bundle 对象，它包含了一些标识，这些标识由触发 Sync Adapter 的事件所发送。

Authority

  系统中某个 Content Provider 的 Authority。我们的应用必须要有访问它的权限。通常，该 Authority 对应于应用的 Content Provider。

Content provider client

  [ContentProviderClient](http://developer.android.com/reference/android/content/ContentProviderClient.html) 针对于由 `Authority` 参数所指向的Content Provider。[ContentProviderClient](http://developer.android.com/reference/android/content/ContentProviderClient.html) 是一个 Content Provider 的轻量级共有接口。它的基本功能和 [ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html) 一样。如果我们正在使用 Content Provider 来存储应用数据，那么我们可以利用它连接 Content Provider。反之，则将其忽略。

Sync result

  一个 [SyncResult](http://developer.android.com/reference/android/content/SyncResult.html) 对象，我们可以使用它将信息发送给 Sync Adapter 框架。

下面的代码片段展示了 <a href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a> 函数的整体结构：

```java
    /*
     * Specify the code you want to run in the sync adapter. The entire
     * sync adapter runs in a background thread, so you don't have to set
     * up your own background processing.
     */
    @Override
    public void onPerformSync(
            Account account,
            Bundle extras,
            String authority,
            ContentProviderClient provider,
            SyncResult syncResult) {
    /*
     * Put the data transfer code here.
     */
    ...
    }
```

虽然实际的<a  href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a> 实现是要根据应用数据的同步需求以及服务器的连接协议来制定，但是我们的实现只需要执行一些常规任务：

连接到一个服务器

  尽管我们可以假定在开始传输数据时，已经获取到了网络连接，但是 Sync Adapter 框架并不会自动地连接到一个服务器。

下载和上传数据

  Sync Adapter 不会自动执行数据传输。如果我们想要从服务器下载数据并将它存储到 Content Provider 中，我们必须提供请求数据，下载数据和将数据插入到 Provider 中的代码。类似地，如果我们想把数据发送到服务器，我们需要从一个文件，数据库或者 Provider 中读取数据，并且发送必需的上传请求。同时我们还需要处理在执行数据传输时所发生的网络错误。

处理数据冲突或者确定当前数据的状态

  Sync Adapter 不会自动地解决服务器数据与设备数据之间的冲突。同时，它也不会自动检测服务器上的数据是否比设备上的数据要新，反之亦然。因此，我们必须自己提供处理这些状况的算法。

清理

  在数据传输的尾声，记得要关闭网络连接，清除临时文件和缓存。

> **Note：**Sync Adapter 框架会在一个后台线程中执行 <a href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a> 方法，所以我们不需要配置后台处理任务。

除了和同步相关的任务之外，我们还应该尝试将一些周期性的网络相关的任务合并起来，并将它们添加到 <a href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a> 中。将所有网络任务集中到该方法内处理，可以减少由启动和停止网络接口所造成的电量损失。有关更多如何在进行网络访问时更高效地使用电池方面的知识，可以阅读：[Transferring Data Without Draining the Battery](../efficient-downloads/index.html)，它描述了一些在数据传输代码中可以包含的网络访问任务。

## 将 Sync Adapter 绑定到框架上

现在，我们已经将数据传输代码封装在 Sync Adapter 组件中，但是我们必须让框架可以访问我们的代码。为了做到这一点，我们需要创建一个绑定 [Service](http://developer.android.com/reference/android/app/Service.html)，它将一个特殊的 Android Binder 对象从 Sync Adapter 组件传递给框架。有了这一 Binder 对象，框架就可以调用 <a href="http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult)">onPerformSync()</a> 方法并将数据传递给它。

在服务的 <a href="http://developer.android.com/reference/android/app/Service.html#onCreate()">onCreate()</a> 方法中将我们的 Sync Adapter 组件实例化为一个单例。通过在 <a href="http://developer.android.com/reference/android/app/Service.html#onCreate()">onCreate()</a> 方法中实例化该组件，我们可以推迟到服务启动后再创建它，这会在框架第一次尝试执行数据传输时发生。我们需要通过一种线程安全的方法来实例化组件，以防止 Sync Adapter 框架在响应触发和调度时，形成含有多个 Sync Adapter 执行的队列。

下面的代码片段展示了我们应该如何实现一个绑定 [Service](http://developer.android.com/reference/android/app/Service.html) 的类，实例化我们的 Sync Adapter 组件，并获取 Android Binder 对象：

```java
package com.example.android.syncadapter;
/**
 * Define a Service that returns an IBinder for the
 * sync adapter class, allowing the sync adapter framework to call
 * onPerformSync().
 */
public class SyncService extends Service {
    // Storage for an instance of the sync adapter
    private static SyncAdapter sSyncAdapter = null;
    // Object to use as a thread-safe lock
    private static final Object sSyncAdapterLock = new Object();
    /*
     * Instantiate the sync adapter object.
     */
    @Override
    public void onCreate() {
        /*
         * Create the sync adapter as a singleton.
         * Set the sync adapter as syncable
         * Disallow parallel syncs
         */
        synchronized (sSyncAdapterLock) {
            if (sSyncAdapter == null) {
                sSyncAdapter = new SyncAdapter(getApplicationContext(), true);
            }
        }
    }
    /**
     * Return an object that allows the system to invoke
     * the sync adapter.
     *
     */
    @Override
    public IBinder onBind(Intent intent) {
        /*
         * Get the object that allows external processes
         * to call onPerformSync(). The object is created
         * in the base class code when the SyncAdapter
         * constructors call super()
         */
        return sSyncAdapter.getSyncAdapterBinder();
    }
}
```

> **Note：**要看更多 Sync Adapter 绑定服务的例子，可以阅读样例代码。

## 添加框架所需的账户

Sync Adapter 框架需要每个 Sync Adapter 拥有一个账户类型。在[创建 Stub 授权器](create-authenticator.html)章节中，我们已经声明了账户类型的值。现在我们需要在 Android 系统中配置该账户类型。要配置账户类型，通过调用 <a href="http://developer.android.com/reference/android/accounts/AccountManager.html#addAccountExplicitly(android.accounts.Account, java.lang.String, android.os.Bundle)">addAccountExplicitly()</a> 添加一个使用其账户类型的虚拟账户。

调用该方法最合适的地方是在应用的启动 Activity 的 <a href="http://developer.android.com/reference/android/app/Service.html#onCreate()">onCreate()</a> 方法中。如下面的代码样例所示：

```java
public class MainActivity extends FragmentActivity {
    ...
    ...
    // Constants
    // The authority for the sync adapter's content provider
    public static final String AUTHORITY = "com.example.android.datasync.provider"
    // An account type, in the form of a domain name
    public static final String ACCOUNT_TYPE = "example.com";
    // The account name
    public static final String ACCOUNT = "dummyaccount";
    // Instance fields
    Account mAccount;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ...
        // Create the dummy account
        mAccount = CreateSyncAccount(this);
        ...
    }
    ...
    /**
     * Create a new dummy account for the sync adapter
     *
     * @param context The application context
     */
    public static Account CreateSyncAccount(Context context) {
        // Create the account type and default account
        Account newAccount = new Account(
                ACCOUNT, ACCOUNT_TYPE);
        // Get an instance of the Android account manager
        AccountManager accountManager =
                (AccountManager) context.getSystemService(
                        ACCOUNT_SERVICE);
        /*
         * Add the account and account type, no password or user data
         * If successful, return the Account object, otherwise report an error.
         */
        if (accountManager.addAccountExplicitly(newAccount, null, null))) {
            /*
             * If you don't set android:syncable="true" in
             * in your <provider> element in the manifest,
             * then call context.setIsSyncable(account, AUTHORITY, 1)
             * here.
             */
        } else {
            /*
             * The account exists or some other error occurred. Log this, report it,
             * or handle it internally.
             */
        }
    }
    ...
}
```

## 添加 Sync Adapter 的元数据文件

要将我们的 Sync Adapter 组件集成到框架中，我们需要向框架提供描述组件的元数据，以及额外的标识信息。元数据指定了我们为 Sync Adapter 所创建的账户类型，声明了一个和应用相关联的 Content Provider Authority，对和 Sync Adapter 相关的一部分系统用户接口进行控制，同时还声明了其它同步相关的标识。在我们项目的 `/res/xml/` 目录下的一个特定文件内声明这一元数据，我们可以为这个文件命名，不过通常来说我们将其命名为 `syncadapter.xml`。

在这一文件中包含了一个 XML 标签 `<sync-adapter>`，它包含了下列的属性字段：

`android:contentAuthority`

  Content Provider 的 URI Authority。如果我们在前一节课程中为应用创建了一个 Stub Content Provider，那么请使用在 manifest 清单文件中添加在  [`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html) 标签内的 [android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth) 属性值。这一属性的更多细节在本章后续章节中有更多的介绍。

  如果我们正使用 Sync Adapter 将数据从 Content Provider 传输到服务器上，该属性的值应该和数据的 Content URI Authority 保持一致。这个值也是我们在 manifest 清单文件中添加在 [`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html) 标签内 `android:authorities` 属性的值。

`android:accountType`

  Sync Adapter 框架所需要的账户类型。这个值必须和我们所创建的验证器元数据文件内所提供的账户类型一致（详细内容可以阅读：[创建 Stub 授权器](create-authenticator.html)）。这也是在上一节的代码片段中。常量 `ACCOUNT_TYPE` 的值。

配置相关属性

  `android:userVisible`

  该属性设置 Sync Adapter 框架的账户类型是否可见。默认地，和账户类型相关联的账户图标和标签在系统设置的账户选项中可以看见，所以我们应该将 Sync Adapter 设置为对用户不可见（除非我们确实拥有一个账户类型或者域名或者它们可以轻松地和我们的应用相关联）。如果我们将账户类型设置为不可见，那么我们仍然可以允许用户通过一个 Activity 中的用户接口来控制 Sync Adapter。

  `android:supportsUploading`

  允许我们将数据上传到云。如果应用仅仅下载数据，那么请将该属性设置为 `false`。

  `android:allowParallelSyncs`

  允许多个 Sync Adapter 组件的实例同时运行。如果应用支持多个用户账户并且我们希望多个用户并行地传输数据，那么可以使用该特性。如果我们从不执行多个数据传输，那么这个选项是没用的。

  `android:isAlwaysSyncable`

  指明 Sync Adapter 框架可以在任何我们指定的时间运行 Sync Adapter。如果我们希望通过代码来控制 Sync Adapter 的运行时机，请将该属性设置为 `false`。然后调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a> 来运行 Sync Adapter。要学习更多关于运行 Sync Adapter 的知识，可以阅读：[执行 Sync Adapter](running-sync-adapter.html)。

下面的代码展示了应该如何通过 XML 配置一个使用单个虚拟账户，并且只执行下载的 Sync Adapter：

```xml
<?xml version="1.0" encoding="utf-8"?>
<sync-adapter
        xmlns:android="http://schemas.android.com/apk/res/android"
        android:contentAuthority="com.example.android.datasync.provider"
        android:accountType="com.android.example.datasync"
        android:userVisible="false"
        android:supportsUploading="false"
        android:allowParallelSyncs="false"
        android:isAlwaysSyncable="true"/>
```

## 在 Manifest 清单文件中声明 Sync Adapter

一旦我们将 Sync Adapter 组件集成到应用中，我们需要声明相关的权限来使用它，并且还需要声明我们所添加的绑定 [Service](http://developer.android.com/reference/android/app/Service.html)。

由于 Sync Adapter 组件会运行设备与网络之间传输数据的代码，所以我们需要请求使用网络的权限。同时，我们的应用还需要读写 Sync Adapter 配置信息的权限，这样我们才能通过应用中的其它组件去控制 Sync Adapter。另外，我们还需要一个特殊的权限，来允许应用使用我们在[创建 Stub 授权器](create-authenticator.html)中所创建的授权器组件。

要请求这些权限，将下列内容添加到应用 manifest 清单文件中，并作为 [`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html) 标签的子标签：

[`android.permission.INTERNET`](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET)

  允许 Sync Adapter 访问网络，使得它可以从设备下载和上传数据到服务器。如果之前已经请求了该权限，那么就不需要重复请求了。

[`android.permission.READ_SYNC_SETTINGS`](http://developer.android.com/reference/android/Manifest.permission.html#READ_SYNC_SETTINGS)

  允许应用读取当前的 Sync Adapter 配置。例如，我们需要该权限来调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#getIsSyncable(android.accounts.Account, java.lang.String)">getIsSyncable()</a>。

[`android.permission.WRITE_SYNC_SETTINGS`](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_SYNC_SETTINGS)

  允许我们的应用 对Sync Adapter 的配置进行控制。我们需要这一权限来通过 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long)">addPeriodicSync()</a> 方法设置执行同步的时间间隔。另外，调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a> 方法不需要用到该权限。更多信息可以阅读：[执行 Sync Adapter](running-sync-adapter.html)。

[`android.permission.AUTHENTICATE_ACCOUNTS`](http://developer.android.com/reference/android/Manifest.permission.html#AUTHENTICATE_ACCOUNTS)

  允许我们使用在[创建 Stub 授权器](create-authenticator.html)中所创建的验证器组件。

下面的代码片段展示了如何添加这些权限：

```xml
<manifest>
...
    <uses-permission
            android:name="android.permission.INTERNET"/>
    <uses-permission
            android:name="android.permission.READ_SYNC_SETTINGS"/>
    <uses-permission
            android:name="android.permission.WRITE_SYNC_SETTINGS"/>
    <uses-permission
            android:name="android.permission.AUTHENTICATE_ACCOUNTS"/>
...
</manifest>
```

最后，要声明框架用来和 Sync Adapter 进行交互的绑定 [Service](http://developer.android.com/reference/android/app/Service.html)，添加下列的 XML 代码到应用 manifest  清单文件中，作为 [`<application>`](http://developer.android.com/guide/topics/manifest/application-element.html) 标签的子标签：

```xml
        <service
                android:name="com.example.android.datasync.SyncService"
                android:exported="true"
                android:process=":sync">
            <intent-filter>
                <action android:name="android.content.SyncAdapter"/>
            </intent-filter>
            <meta-data android:name="android.content.SyncAdapter"
                    android:resource="@xml/syncadapter" />
        </service>
```

[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html) 标签配置了一个过滤器，它会被带有 `android.content.SyncAdapter` 这一 Action 的 Intent 所触发，该 Intent 一般是由系统为了运行 Sync Adapter 而发出的。当过滤器被触发后，系统会启动我们所创建的绑定服务，在本例中它叫做 `SyncService`。属性 [android:exported="true"](http://developer.android.com/guide/topics/manifest/service-element.html#exported) 允许我们应用之外的其它进程（包括系统）访问这一 [Service](http://developer.android.com/reference/android/app/Service.html)。属性 [android:process=":sync"](http://developer.android.com/guide/topics/manifest/service-element.html#proc) 告诉系统应该在一个全局共享的，且名字叫做 `sync` 的进程内运行该 [Service](http://developer.android.com/reference/android/app/Service.html)。如果我们的应用中有多个 Sync Adapter，那么它们可以共享该进程，这有助于减少开销。

[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html) 标签提供了我们之前为 Sync Adapter 所创建的元数据 XML 文件的文件名。属性 [android:name](http://developer.android.com/guide/topics/manifest/meta-data-element.html#nm) 指出这一元数据是针对于 Sync Adapter 框架的。而 [android:resource](http://developer.android.com/guide/topics/manifest/meta-data-element.html#rsrc) 标签则指定了元数据文件的名称。

现在我们已经为 Sync Adapter 准备好所有相关的组件了。下一节课将讲授如何让 Sync Adapter 框架运行 Sync Adapter。要实现这一点，既可以通过响应一个事件的方式，也可以通过执行一个周期性任务的方式。
