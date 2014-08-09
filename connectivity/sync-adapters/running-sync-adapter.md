# 执行Sync Adpater

> 编写:[jdneo](https://github.com/jdneo) - 原文:

在这系列课程中之前的一些课程中，你学习了如何创建一个封装数据传输代码的Sync Adapter组件，以及如何添加其它的组件，来允许你将Sync Adapter集成到系统当中。现在我们已经拥有了所有需要的东西，来安装包含有一个Sync Adapter的应用，但是这里是没有任何代码是去运行Sync Adapter的。

你应该基于计划任务的调度或者一些事件的间接结果来执行Sync Adapter。例如，你可能希望你的Sync Adapter运行一个定期的计划任务，每隔一段时间或每天的一个固定的时间。或者你还希望当设备上的数据发生变化后，执行你的Sync Adapter。你应该避免将运行Sync Adapter作为用户某个行为的直接结果，因为这样做的话你就无法利用Sync Adapter框架可以按计划调度的特性。例如，你应该在UI中避免使用刷新按钮。

下列情况可以作为运行Sync Adapter的时机：

**当服务器数据变更时：**

运行Sync Adapter以响应来自服务器的消息，指明服务端的数据变化了。这一选项允许从服务器刷新数据到设备上，这一方法可以避免降低性能，或者由于轮询服务器所造成的电量损耗。

**当设备的数据变更时：**

当设备上的数据发生变化时，运行Sync Adapter。这一选项允许你将修改后的数据从设备发送给服务器，如果你需要保证服务器端的数据一直保持最新，那么这一选项非常有用。如果你将数据存储于你的Content Provider，那么这一选项的实现将会非常直接。如果你使用的是一个Stub Content Provider，检测数据的变化可能会比较困难。

**当系统发送了一个网络消息：**

当Android系统发送了一个网络消息来保持TCP/IP连接开启时，运行Sync Adapter。这个消息是网络框架的一个基本部分。使用这一选项是自动运行Sync Adapter的一个方法。可以考虑配合基于时间间隔的Sync Adapter一起使用。

**每隔固定的时间间隔后：**

在你定的时间间隔过了之后，运行Sync Adapter，或者在每天的固定时间运行它。

**按照要求：**

运行Sync Adapter以响应用户的行为。然而，为了提供最佳的用户体验，你应该主要依赖更多自动类型的选项。使用自动化的选项，你可以节省大量的电量以及网络资源。

本课程的后续部分会详细介绍每个选项。

## 当服务器数据变化时，运行Sync Adapter

如果你的应用从服务器传输数据，且服务器的数据频繁的发生变化，你可以使用一个Sync Adapter通过下载数据来响应服务端数据的变化。要运行Sync Adapter，让服务端向你的应用的[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)发送一条特殊的消息。要响应这条消息，可以调用[ContentResolver.requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))方法，来向Sync Adapter框架发出信号，让它运行你的Sync Adapter。

谷歌云消息（[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)，GCM）提供了你需要的服务端组件和设备端组件，来让这一消息提供能够运行。使用GCM激活数据传输比通过向服务器轮询的方式要更加可靠，也更加有效。因为轮询需要一个一直处于活跃状态的[Service](http://developer.android.com/reference/android/app/Service.html)，而GCM使用的[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)仅在消息到达时会激活。另外，即使没有更新的内容，定期的轮询也会消耗大量的电池电量，而GCM仅在需要时才会发出消息。

> **Note：**如果你使用GCM，通过一个到所有安装了你的应用的设备的广播，来激活你的Sync Adapter，要记住他们会在同一时间（粗略地）收到你的消息。这会导致在同一时间有多个Sync Adapter的实例在运行，进而导致服务器和网络的负载过重。要避免这一情况，你应该考虑让每个设备的Sync Adapter启动的时间有所差异。

下面的代码展示了如何运行[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))以响应一个接收到的GCM消息：

```java
public class GcmBroadcastReceiver extends BroadcastReceiver {
    ...
    // Constants
    // Content provider authority
    public static final String AUTHORITY = "com.example.android.datasync.provider"
    // Account type
    public static final String ACCOUNT_TYPE = "com.example.android.datasync";
    // Account
    public static final String ACCOUNT = "default_account";
    // Incoming Intent key for extended data
    public static final String KEY_SYNC_REQUEST =
            "com.example.android.datasync.KEY_SYNC_REQUEST";
    ...
    @Override
    public void onReceive(Context context, Intent intent) {
        // Get a GCM object instance
        GoogleCloudMessaging gcm =
                GoogleCloudMessaging.getInstance(context);
        // Get the type of GCM message
        String messageType = gcm.getMessageType(intent);
        /*
         * Test the message type and examine the message contents.
         * Since GCM is a general-purpose messaging system, you
         * may receive normal messages that don't require a sync
         * adapter run.
         * The following code tests for a a boolean flag indicating
         * that the message is requesting a transfer from the device.
         */
        if (GoogleCloudMessaging.MESSAGE_TYPE_MESSAGE.equals(messageType)
            &&
            intent.getBooleanExtra(KEY_SYNC_REQUEST)) {
            /*
             * Signal the framework to run your sync adapter. Assume that
             * app initialization has already created the account.
             */
            ContentResolver.requestSync(ACCOUNT, AUTHORITY, null);
            ...
        }
        ...
    }
    ...
}
```

## 当Content Provider的数据变化时，运行Sync Adapter

如果你的应用在一个Content Provider中收集数据，并且你希望当你更新提供器的时候一起更新服务器的数据，你可以配置你的Sync Adapter来让它自动运行。要做到这一点，你首先应该为Content Provider注册一个观察器（observer）。当你的Content Provider的数据发生了变化以后，Content Provider框架会调用观察器。在观察器中，调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))来告诉框架运行你的Sync Adapter。

> **Note：**如果你使用的是一个空的Content Provider，那么你在Content Provider中没有任何数据，并且[onChange()](http://developer.android.com/reference/android/database/ContentObserver.html#onChange\(boolean\))方法从来没有被调用。在这种情况下，你不得不提供你自己的机制来检测设备数据的变化。这一机制还要负责当数据发生变化时调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))。

为了给你的Content Provider创建一个观察器，继承[ContentObserver](http://developer.android.com/reference/android/database/ContentObserver.html)类，并且实现[onChange()](http://developer.android.com/reference/android/database/ContentObserver.html#onChange(boolean))方法的几种形式。在[onChange()](http://developer.android.com/reference/android/database/ContentObserver.html#onChange(boolean))中，调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))来启动Sync Adapter。

要注册观察器，将它作为参数传递给[registerContentObserver()](http://developer.android.com/reference/android/content/ContentResolver.html#registerContentObserver\(android.net.Uri, boolean, android.database.ContentObserver\))。在这个调用中，你还要传递一个你想要监视的内容URI。Content Provider框架会将这个监视的URI和通过[ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)方法（如[ContentResolver.insert()](http://developer.android.com/reference/android/content/ContentResolver.html#insert\(android.net.Uri, android.content.ContentValues\))）所传递过来的修改了你的提供器的URI进行对比，如果匹配上了，那么你所实现的[ContentObserver.onChange()](http://developer.android.com/reference/android/database/ContentObserver.html#onChange\(boolean\))将会被调用。

下面的代码片段展示了如何定义一个[ContentObserver](http://developer.android.com/reference/android/database/ContentObserver.html)，当表发生变化时调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))：

```java
public class MainActivity extends FragmentActivity {
    ...
    // Constants
    // Content provider scheme
    public static final String SCHEME = "content://";
    // Content provider authority
    public static final String AUTHORITY = "com.example.android.datasync.provider";
    // Path for the content provider table
    public static final String TABLE_PATH = "data_table";
    // Account
    public static final String ACCOUNT = "default_account";
    // Global variables
    // A content URI for the content provider's data table
    Uri mUri;
    // A content resolver for accessing the provider
    ContentResolver mResolver;
    ...
    public class TableObserver extends ContentObserver {
        /*
         * Define a method that's called when data in the
         * observed content provider changes.
         * This method signature is provided for compatibility with
         * older platforms.
         */
        @Override
        public void onChange(boolean selfChange) {
            /*
             * Invoke the method signature available as of
             * Android platform version 4.1, with a null URI.
             */
            onChange(selfChange, null);
        }
        /*
         * Define a method that's called when data in the
         * observed content provider changes.
         */
        @Override
        public void onChange(boolean selfChange, Uri changeUri) {
            /*
             * Ask the framework to run your sync adapter.
             * To maintain backward compatibility, assume that
             * changeUri is null.
            ContentResolver.requestSync(ACCOUNT, AUTHORITY, null);
        }
        ...
    }
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ...
        // Get the content resolver object for your app
        mResolver = getContentResolver();
        // Construct a URI that points to the content provider data table
        mUri = new Uri.Builder()
                  .scheme(SCHEME)
                  .authority(AUTHORITY)
                  .path(TABLE_PATH)
                  .build();
        /*
         * Create a content observer object.
         * Its code does not mutate the provider, so set
         * selfChange to "false"
         */
        TableObserver observer = new TableObserver(false);
        /*
         * Register the observer for the data table. The table's path
         * and any of its subpaths trigger the observer.
         */
        mResolver.registerContentObserver(mUri, true, observer);
        ...
    }
    ...
}
```

## 在一个网络消息之后，运行Sync Adapter

当一个网络连接可获得时，Android系统会每隔几秒发送一条消息来保持TCP/IP连接打开。这一消息也会传递到每个应用的[ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)中。通过调用[setSyncAutomatically()](http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically\(android.accounts.Account, java.lang.String, boolean\))，你可以在[ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)收到消息后，运行Sync Adapter。

当网络可获得的时候，通过调度你的Sync Adapter运行，来保证你的Sync Adapter在可以获得网络时都会被调度。如果不是每次数据变化时就要以数据传输来响应，但是又希望自己的数据会被定期地更新，那么可以用这一选项。类似地，如果你不想要给你的Sync Adapter配置一个定期调度，但你希望经常运行它，你也可以使用这一选项。

由于[setSyncAutomatically()](http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically\(android.accounts.Account, java.lang.String, boolean\))方法不会禁用[addPeriodicSync()](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long\))，你的Sync Adapter可能会在一小段时间内重复地被激活。如果你想要定期地运行你的Sync Adapter，你应该禁用[setSyncAutomatically()](http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically\(android.accounts.Account, java.lang.String, boolean\))。

下面的代码片段向你展示如何配置你的[ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)来运行你的Sync Adapter，响应网络消息：

```java
public class MainActivity extends FragmentActivity {
    ...
    // Constants
    // Content provider authority
    public static final String AUTHORITY = "com.example.android.datasync.provider";
    // Account
    public static final String ACCOUNT = "default_account";
    // Global variables
    // A content resolver for accessing the provider
    ContentResolver mResolver;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ...
        // Get the content resolver for your app
        mResolver = getContentResolver();
        // Turn on automatic syncing for the default account and authority
        mResolver.setSyncAutomatically(ACCOUNT, AUTHORITY, true);
        ...
    }
    ...
}
```

## 定期地运行Sync Adapter

你可以设置一个每次运行期间的间隔时间来定期运行你的Sync Adapter，或者在每天的固定时间运行，或者两者都有。定期地运行你的Sync Adapter可以让你与你的服务器更新间隔粗略地保持一致。

同样地，当你的服务器相对来说比较空闲时，你可以从设备更新数据，方法可以是在夜间定期调用Sync Adapter。大多数用户晚上会不关机并对收集充电，所以这一方法是可行的。而且，那个时间设备不会运行其他的任务除了你的Sync Adapter。如果你使用这个方法的话，你需要注意每台设备会在略微不同的时间激活数据传输。如果所有设备在同一时间运行你的Sync Adapter，那么你的服务器将很有可能负载过重。

一般来说，如果你的用户不需要实时更新，但希望定期更新，定期运行会很有用。如果你希望在获取实时数据和一个不过度使用用户设备资源的，高效的且更微型的Sync Adapter这两者之间进行一个平衡，那么定期执行是一个不错的选择。

要定期运行你的Sync Adapter，调用[addPeriodicSync()](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync\(android.accounts.Account, java.lang.String, android.os.Bundle, long\))。这样每隔一段时间，Sync Adapter就会运行。由于Sync Adapter框架会考虑其他Sync Adapter的执行，并尝试最大化电池效率，间隔时间会动态做出细微调整。同时，如果网络不可获得，框架不会运行你的Sync Adapter。

注意，[addPeriodicSync()](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync\(android.accounts.Account, java.lang.String, android.os.Bundle, long\))方法不会每天某个时间自动运行。要让你的Sync Adapter每天某个时间内自动执行，使用一个重复计时器作为激发器。重复计时器的更多细节可以阅读：[AlarmManager](http://developer.android.com/reference/android/app/AlarmManager.html)。如果你使用[setInexactRepeating()](http://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating\(int, long, long, android.app.PendingIntent\))方法来设置每天激活的时间具有一些变化，你仍然应该将不同设备的Sync Adapter的运行时间随机化，使得它们的执行交错开来。

[addPeriodicSync()](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync\(android.accounts.Account, java.lang.String, android.os.Bundle, long\))方法不会禁用[setSyncAutomatically()](http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically\(android.accounts.Account, java.lang.String, boolean\))，所以你可能会在一小段时间内获取多个同步执行。同样，仅有一些Sync Adapter的控制标识会在[addPeriodicSync()](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync\(android.accounts.Account, java.lang.String, android.os.Bundle, long\))方法中被允许。不允许的标识在该方法的[文档](http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync\(android.accounts.Account,%20java.lang.String,%20android.os.Bundle,%20long\))中可以查看。

下面的代码样例展示了如何定期执行Sync Adapter：

```java
public class MainActivity extends FragmentActivity {
    ...
    // Constants
    // Content provider authority
    public static final String AUTHORITY = "com.example.android.datasync.provider";
    // Account
    public static final String ACCOUNT = "default_account";
    // Sync interval constants
    public static final long MILLISECONDS_PER_SECOND = 1000L;
    public static final long SECONDS_PER_MINUTE = 60L;
    public static final long SYNC_INTERVAL_IN_MINUTES = 60L;
    public static final long SYNC_INTERVAL =
            SYNC_INTERVAL_IN_MINUTES *
            SECONDS_PER_MINUTE *
            MILLISECONDS_PER_SECOND;
    // Global variables
    // A content resolver for accessing the provider
    ContentResolver mResolver;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ...
        // Get the content resolver for your app
        mResolver = getContentResolver();
        /*
         * Turn on periodic syncing
         */
        ContentResolver.addPeriodicSync(
                ACCOUNT,
                AUTHORITY,
                null,
                SYNC_INTERVAL);
        ...
    }
    ...
}
```

## 按需求执行Sync Adapter

运行你的Sync Adapter来响应一个用户需求是运行一个Sync Adapter最不推荐的策略。要知道，框架是被特别设计成根据计划运行Sync Adapter时可以最大化保留电量。既然更新数据的过程后损耗电量，那么在数据变化时响应一个Sync Adapter的同步选项应该有效地使用电量。

相比之下，允许用户按照需求运行Sync Adapter意味着Sync Adapter会自己运行，这对电量和网络来说会导致使用效率的下降。同时，向用户提供同步，会让用户甚至没有证据表明数据发生变化了以后也请求一个更新，这会导致对电量的低效率使用，一般来说，你的应用应该使用其它信号来激活一个同步更新或者定期地去做它们，而不是依赖于用户的输入。

不过，如果你仍然想要按照需求运行Sync Adapter，将Sync Adapter标识设置为人为运行的Sync Adapter，之后调用[ContentResolver.requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle))。

使用下列标识来执行按需求的数据传输：

[**SYNC_EXTRAS_MANUAL**](http://developer.android.com/reference/android/content/ContentResolver.html#SYNC_EXTRAS_MANUAL)

强制执行人为的同步更新。Sync Adapter框架会忽略当前的设置，如被[setSyncAutomatically()](http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically\(android.accounts.Account, java.lang.String, boolean\))方法设置的标识。

[**SYNC_EXTRAS_EXPEDITED**](http://developer.android.com/reference/android/content/ContentResolver.html#SYNC_EXTRAS_EXPEDITED)

强制同步立即执行。如果你不设置此项，系统可能会在运行同步需求之前等待一小段时间，因为它会尝试通过将多个请求在一小段时间内调度来尝试优化电量。

下面的代码片段将向你展示如何调用[requestSync()](http://developer.android.com/reference/android/content/ContentResolver.html#requestSync\(android.accounts.Account, java.lang.String, android.os.Bundle\))来响应一个按钮的点击：

```java
public class MainActivity extends FragmentActivity {
    ...
    // Constants
    // Content provider authority
    public static final String AUTHORITY =
            "com.example.android.datasync.provider"
    // Account type
    public static final String ACCOUNT_TYPE = "com.example.android.datasync";
    // Account
    public static final String ACCOUNT = "default_account";
    // Instance fields
    Account mAccount;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ...
        /*
         * Create the dummy account. The code for CreateSyncAccount
         * is listed in the lesson Creating a Sync Adapter
         */

        mAccount = CreateSyncAccount(this);
        ...
    }
    /**
     * Respond to a button click by calling requestSync(). This is an
     * asynchronous operation.
     *
     * This method is attached to the refresh button in the layout
     * XML file
     *
     * @param v The View associated with the method call,
     * in this case a Button
     */
    public void onRefreshButtonClick(View v) {
        ...
        // Pass the settings flags by inserting them in a bundle
        Bundle settingsBundle = new Bundle();
        settingsBundle.putBoolean(
                ContentResolver.SYNC_EXTRAS_MANUAL, true);
        settingsBundle.putBoolean(
                ContentResolver.SYNC_EXTRAS_EXPEDITED, true);
        /*
         * Request the sync for the default account, authority, and
         * manual sync settings
         */
        ContentResolver.requestSync(mAccount, AUTHORITY, settingsBundle);
    }
```
