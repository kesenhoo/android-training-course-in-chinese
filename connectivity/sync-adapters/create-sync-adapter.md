# 创建Sync Adpater

> 编写:[jdneo](https://github.com/jdneo) - 原文:

在你应用中的Sync Adapter组件会封装在设备和服务器之间传输数据的任务代码。基于你提供的调度和触发器，Sync Adapter框架会在Sync Adapter组件中运行你的代码。要将同步适配组件添加到你的应用，你需要添加下列部件：

**Sync Adapter类**

这将你的数据传输代码封装到一个接口中，该接口与Sync Adapter框架兼容。

**捆绑[Service](http://developer.android.com/reference/android/app/Service.html)**

一个组件，它可以允许Sync Adapter框架在你的Sync Adapter类中运行代码。

**Sync Adapter的XML元数据文件**

一个文件，包含了你的Sync Adapter信息。框架会读取该文件并确定应该如何加载并调度你的数据传输任务。

**应用清单文件的声明**

在XML文件中声明的捆绑服务，并指出Sync Adapter的元数据。

这节课将会向你展示如何定义这些元素。

## 创建一个Sync Adapter类

在这部分课程中，你将会学习如何创建Sync Adapter类，该类封装了数据传输的代码。创建该类并继承Sync Adapter的基类，为该类定义构造函数，并实现你定义的数据传输任务的方法。

### 继承Sync Adapter基类：AbstractThreadedSyncAdapter

要创建Sync Adapter组件，首先继承[AbstractThreadedSyncAdapter](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html)，然后编写它的构造函数。每次你的Sync Adapter组件创建的时候，构造函数就会执行配置任务，和你使用[Activity.onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate\(android.os.Bundle\))配置Activity是一样的。例如，如果你的应用使用一个Content Provider来存储数据，那么使用构造函数来获取一个[ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)实例。由于从Android 3.0开始添加了第二种形式的构造函数，来支持parallelSyncs参数，所以你需要创建两种形式的构造函数来保证兼容性。

> **Note：**Sync Adapter框架是设计成和Sync Adapter组件的单例一起工作的。实例化Sync Adapter组件的更多细节，可以阅读：[Bind the Sync Adapter to the Framework](http://developer.android.com/training/sync-adapters/creating-sync-adapter.html#CreateSyncAdapterService)。

下面的代码展示了如何实现[AbstractThreadedSyncAdapter](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html)和它的构造函数：

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

### 在onPerformSync()中添加数据传输代码

Sync Adapter组件并不会自动地执行数据传输。相反地，它只是对你的数据传输代码进行封装，所以Sync Adapter框架可以在后台执行数据传输，而不会牵连到你的应用。当框架准备同步你的应用数据时，它会调用你的[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))方法的实现。

为了便于将你的数据从你的应用程序代码转移到Sync Adapter组件，Sync Adapter框架调用[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))，它具有下面的参数：

**账户（Account）**

该[Account](http://developer.android.com/reference/android/accounts/Account.html)对象是和激活Sync Adapter的事件相关联的。如果你的服务不需要使用账户，你不需要使用这个对象内的信息。

**额外数据（Extras）**

一个Bundle对象，它包含了激活Sync Adapter的事件所发送的标识。

**权限（Authority）**

系统Content Provider的Authority。你的应用必须要有访问它的权限。通常，Authority对应于你应用的Content Provider。

**Content Provider客户端（Content provider client）**

一个Content Provider的[ContentProviderClient](http://developer.android.com/reference/android/content/ContentProviderClient.html)对象是由Authority参数所指定的。一个[ContentProviderClient](http://developer.android.com/reference/android/content/ContentProviderClient.html)是一个Content Provider的轻量级共有接口。它的基本功能和一个[ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)一样。如果你正在使用一个Content Provider来存储你的应用的数据，你可以用该对象和提供器连接。否则的话你可以忽略它。

**同步结果（Sync result）**

一个[SyncResult](http://developer.android.com/reference/android/content/SyncResult.html)对象，你可以使用它来将信息发送到Sync Adapter框架。

下面的代码片段展示了[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))函数的整体架构：

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

但是实际的[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))实现是要根据你的应用数据的同步需求以及服务器的连接协议来制定的，有一些你应该要实现的基本任务，如下所示：

**连接到一个服务器**

尽管你可以假定当你开始传输数据时，可以获取到网络连接，但是Sync Adapter框架并不会自动地连接到一个服务器。

**下载和上传数据**

一个Sync Adapter不会自动执行数据传输。如果你想要从一个服务器下载数据并将它存储到一个Content Provider中，你必须提供请求数据，下载数据和将数据插入到提供器里的代码。同样地，如果你想把数据发送到一个服务器，你必须要从一个文件，数据库或者Provider中读取数据，并且发送必需的上传请求。你也需要处理在你执行数据传输时所发生的网络错误。

**处理数据冲突或者确定当前的数据是怎样的**

一个Sync Adapter不会自动地解决服务器数据与设备数据的冲突。同时，它也不会检测服务器上的数据是否比设备上的数据要新，反之亦然。因此，你必须提供处理此状况的算法。

**清理**

在数据传输的尾声，记得要关闭网络连接，清除临时文件和缓存。

> **Note：**Sync Adapter框架在一个后台线程中执行[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))方法，所以你不需要配置你自己的后台处理任务。

另外，你应该尝试将你的定期网络相关的任务结合起来，并将它们添加到[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))中。通过将所有网络任务集中到该方法中，你可以节省由启动和停止网络接口所造成的电量损失。有关更多如何在进行网络访问时更高效地使用电池，可以阅读：[Transferring Data Without Draining the Battery](/efficient-downloads/index.html)，它描述了一些你的数据传输代码可以包含的网络访问任务。

## 将Sync Adapter和框架进行绑定

你现在在一个Sync Adapter框架中已经封装了你的数据传输代码，但是你必须向框架提供你的代码。为了做这一点，你需要创建一个捆绑[Service](http://developer.android.com/reference/android/app/Service.html)，它将一个特殊的Android binder对象从Sync Adapter组件传递给框架。有了这一binder对象，框架可以激活[onPerformSync()](http://developer.android.com/reference/android/content/AbstractThreadedSyncAdapter.html#onPerformSync\(android.accounts.Account, android.os.Bundle, java.lang.String, android.content.ContentProviderClient, android.content.SyncResult\))方法并将数据传递给binder对象。

在你的服务的[onCreate()](http://developer.android.com/reference/android/app/Service.html#onCreate\(\))方法中将你的Sync Adapter组件实例化为一个单例。通过在[onCreate()](http://developer.android.com/reference/android/app/Service.html#onCreate\(\))方法中实例化该组件，你可以延迟到服务启动后再创建它，这会在框架第一次尝试执行你的数据传输时发生。你需要通过一种线程安全的方法来实例化组件，来防止Sync Adapter框架在响应激活和调度时会将Sync Adapter的执行排成多个队列。

作为例子，下面的代码片段展示了你应该如何创建一个捆绑[Service](http://developer.android.com/reference/android/app/Service.html)的类的实现，实例化你的Sync Adapter组件，并获取Android binder对象：

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

> **Note：**要看更多Sync Adapter的捆绑服务的例子，可以阅读样例代码。

## 添加框架所需的账户

Sync Adapter框架需要每个Sync Adapter拥有一个账户类型。在[创建Stub授权器](creating-authenticator.html)章节中，你声明了账户类型的值。现在你需要在Android系统中配置该账户类型。要配置账户类型，通过调用[addAccountExplicitly()](http://developer.android.com/reference/android/accounts/AccountManager.html#addAccountExplicitly\(android.accounts.Account, java.lang.String, android.os.Bundle\))添加一个假的账户并使用其账户类型。

最佳的调用该方法的地方是在你的应用的启动Activity的[onCreate()](http://developer.android.com/reference/android/support/v4/app/FragmentActivity.html#onCreate\(android.os.Bundle\))方法中。下面的代码样例展示了你应该怎么做：

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

## 添加Sync Adapter的元数据文件

要将你的Sync Adapter组件添加到框架中，你需要向框架提供描述组件的元数据，以及额外的标识信息。元数据指定了你为你的Sync Adapter所创建的账户类型，声明了一个和你的应用相关联的Content Provider Authority，对和Sync Adapter相关的一部分系统用户接口进行控制，并声明了其它同步相关的标识。在你的项目中的“/res/xml/”目录下的一个特定的文件内声明这一元数据，你可以为这个文件任意起一个名字，不过通常都叫做：“syncadapter.xml”。

在这一文件中包含了一个单一的XML元素`<sync-adapter>`，并且它包含了下列的属性字段：

**android:contentAuthority**

你的Content Provider的URI Authority。如果你在前一节课程中为你的应用创建了一个Stub Content Provider，使用你在清单文件中添加的[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签内的[android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth)属性的值。这一属性的更多细节在章节[创建Stub Content Provider](creating-stub-provider.html)中有更多的介绍。

如果你正在使用Sync Adapter，从Content Provider将数据传输到服务器，这个值应该和你的数据的URI Authority的值是一样的。这个值也是你在清单文件中添加的[`<provider>`](http://developer.android.com/guide/topics/manifest/provider-element.html)标签内的android:authorities属性的值。

**android:accountType**

Sync Adapter框架所需要的账户类型。这个值必须和你创建验证器的元数据文件中所提供的一致（详细内容可以阅读：[创建Stub授权器](creating-authenticator.html)）。这也是你在上一节中代码片段里的常量“ACCOUNT_TYPE”的值。

**配置相关属性**
* **android:userVisible**：指的是Sync Adapter框架所需要的账户类型。默认地，和账户类型相关联的账户图标和标签在系统的设置里的账户选项中可以看见，所以你需要将你的Sync Adapter对用户不可见，除非你拥有一个账户类型或者域名，它们可以轻松地和你的应用相关联。如果你将你的账户类型设置为不可见，你仍然可以允许用户通过应用的一个activity内的用户接口来控制你的Sync Adapter。
* **android:supportsUploading**：允许你将数据上传到云。如果你的应用仅仅下载数据，那么设置为“false”。
* **android:allowParallelSyncs**：允许在同一时间你的Sync Adapter组件的多个实例运行。如果你的应用支持多个用户账户并且你希望多个用户并行地传输数据，那么使用这个属性。如果你从不执行多个数据传输，这个选项是没用的。
* **android:isAlwaysSyncable**：指明Sync Adapter框架可以在任何你指定的时间运行你的Sync Adapter。如果你希望通过代码来控制Sync Adapter的运行，将这个标识设置为“false”，然后调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))来执行Sync Adapter。要学习更多关于运行一个Sync Adapter的知识，可以阅读：[执行Sync Adapter](running-sync-adapter.html)。

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

## 在清单文件中声明Sync Adapter

一旦你将Sync Adapter组件添加到了你的应用中，你需要声明相关的权限来使用它，并且你需要声明你所添加的捆绑[Service](http://developer.android.com/reference/android/app/Service.html)。

由于Sync Adapter组件运行网络与设备之间传输数据的代码，你需要使用网络的权限。另外，你的应用需要权限来读写Sync Adapter的配置信息，这样你才能通过你应用中的其它组件去控制Sync Adapter。你还需要一个特殊的权限允许你的应用使用你在[创建Stub授权器](creating-authenticator.html)中所创建的授权器组件。

要请求这些权限，将下列内容添加到你的应用清单文件中，并作为[`<manifest>`](http://developer.android.com/guide/topics/manifest/manifest-element.html)标签的子标签：

[**android.permission.INTERNET**](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET)

允许Sync Adapter访问网络，使得它可以从设备下载和上传数据到服务器。如果之前请求了该权限，那么你就不需要重复请求了。

[**android.permission.READ_SYNC_SETTINGS**](http://developer.android.com/reference/android/Manifest.permission.html#READ_SYNC_SETTINGS)

允许你的应用读取当前的Sync Adapter配置。例如，你需要该权限来调用[getIsSyncable()](http://developer.android.com/reference/android/content/ContentResolver.html#getIsSyncable\(android.accounts.Account, java.lang.String\))。

[**android.permission.WRITE_SYNC_SETTINGS**](http://developer.android.com/reference/android/Manifest.permission.html#WRITE_SYNC_SETTINGS)

允许你的应用对Sync Adapter的配置进行控制。你需要这一权限来通过[addPeriodicSync()](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync\(android.accounts.Account, java.lang.String, android.os.Bundle, long\))设置执行同步的时间间隔。另外，调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))不需要用到该权限。更多信息可以阅读：[执行Sync Adapter](running-sync-adapter.html)。

[**android.permission.AUTHENTICATE_ACCOUNTS**](http://developer.android.com/reference/android/Manifest.permission.html#AUTHENTICATE_ACCOUNTS)

允许你使用在[创建Stub授权器](creating-authenticator.html)中所创建的验证器组件。

下面的代码片段展示了如何添加权限：

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

最后，要声明框架使用的捆绑[Service](http://developer.android.com/reference/android/app/Service.html)和你的Sync Adapter进行交互，添加下列的XML代码到你的应用清单文件中，作为[`<application>`](http://developer.android.com/guide/topics/manifest/application-element.html)标签的子标签：

```xml
        <service
                android:name="com.example.android.datasync.SyncService"
                android:exported="true"
                android:process=":sync">
            <intent-filter>com.example.android.datasync.provider
                <action android:name="android.content.SyncAdapter"/>
            </intent-filter>
            <meta-data android:name="android.content.SyncAdapter"
                    android:resource="@xml/syncadapter" />
        </service>
```

[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签配置了一个过滤器，它会被带有“android.content.SyncAdapter”这一action的intent所激活，而这一intent一般是由系统为了运行Sync Adapter而发出的。当过滤器被激活时，系统会启动你所创建的捆绑服务，在例子中它叫做“SyncService”。属性[android:exported="true"](http://developer.android.com/guide/topics/manifest/service-element.html#exported)允许你应用之外的其它进程（包括系统）访问这一[Service](http://developer.android.com/reference/android/app/Service.html)。属性[android:process=":sync"](http://developer.android.com/guide/topics/manifest/service-element.html#proc)告诉系统在一个全局共享，且称之为“sync”的进程内运行[Service](http://developer.android.com/reference/android/app/Service.html)。如果你的应用中有多个Sync Adapter，那么它们可以共享该进程，这有助于减少开销。

[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)标签提供了你之前为Sync Adapter所创建的元数据文件。属性[android:name](http://developer.android.com/guide/topics/manifest/meta-data-element.html#nm)指出这一元数据是针对于Sync Adapter框架的。而[android:resource](http://developer.android.com/guide/topics/manifest/meta-data-element.html#rsrc)标签则指定了元数据文件的文字。

现在你拥有了所有Sync Adapter的相关组件。下一节课将讲授如何让Sync Adapter框架运行你的Sync Adapter，既可以通过响应一个事件的方式，也可以通过执行一个定期任务调度的方式。
