# 执行 Sync Adpater

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/sync-adapters/running-sync-adapter.html>

在本节课之前，我们已经学习了如何创建一个封装了数据传输代码的 Sync Adapter 组件，以及如何添加其它的组件，使得我们可以将 Sync Adapter 集成到系统当中。现在我们已经拥有了所有部件，来安装一个包含有 Sync Adapter 的应用了，但是这里还没有任何代码是负责去运行 Sync Adapter。

执行 Sync Adapter 的时机，一般应该基于某个计划任务或者一些事件的间接结果。例如，我们可能希望 Sync Adapter 以一个定期计划任务的形式运行（比如每隔一段时间或者在每天的一个固定时间运行）。或者也可能希望当设备上的数据发生变化后，执行 Sync Adapter。我们应该避免将运行 Sync Adapter 作为用户某个行为的直接结果，因为这样做的话我们就无法利用 Sync Adapter 框架可以按计划调度的特性。例如，我们应该在 UI 中避免使用刷新按钮。

下列情况可以作为运行 Sync Adapter 的时机：

当服务端数据变更时：

  当服务端发送消息告知服务端数据发生变化时，运行 Sync Adapter 以响应这一来自服务端的消息。这一选项允许从服务器更新数据到设备上，该方法可以避免由于轮询服务器所造成的执行效率下降，或者电量损耗。

当设备的数据变更时：

  当设备上的数据发生变化时，运行 Sync Adapter。这一选项允许我们将修改后的数据从设备发送给服务器。如果需要保证服务器端一直拥有设备上最新的数据，那么这一选项非常有用。如果我们将数据存储于 Content Provider，那么这一选项的实现将会非常直接。如果使用的是一个 Stub Content Provider，检测数据的变化可能会比较困难。

当系统发送了一个网络消息：

  当 Android 系统发送了一个网络消息来保持 TCP/IP 连接开启时，运行 Sync Adapter。这个消息是网络框架（Networking Framework）的一个基本部分。可以将这一选项作为自动运行 Sync Adapter 的一个方法。另外还可以考虑将它和基于时间间隔运行 Sync Adapter 的策略结合起来使用。

每隔一定时间：

  可以每隔一段指定的时间间隔后，运行 Sync Adapter，或者在每天的固定时间运行它。

根据需求：

  运行 Sync Adapter 以响应用户的行为。然而，为了提供最佳的用户体验，我们应该主要依赖那些更加自动式的选项。使用自动式的选项，可以节省大量的电量以及网络资源。

本课程的后续部分会详细介绍每个选项。

## 当服务器数据变化时，运行 Sync Adapter

如果我们的应用从服务器传输数据，且服务器的数据会频繁地发生变化，那么可以使用一个 Sync Adapter 通过下载数据来响应服务端数据的变化。要运行 Sync Adapter，我们需要让服务端向应用的 [BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html) 发送一条特殊的消息。为了响应这条消息，可以调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">ContentResolver.requestSync()</a> 方法，向 Sync Adapter 框架发出信号，让它运行 Sync Adapter。

谷歌云消息（[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)，GCM）提供了我们需要的服务端组件和设备端组件，来让上述消息系统能够运行。使用 GCM 触发数据传输比通过向服务器轮询的方式要更加可靠，也更加有效。因为轮询需要一个一直处于活跃状态的 [Service](http://developer.android.com/reference/android/app/Service.html)，而 GCM 使用的 [BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html) 仅在消息到达时会被激活。另外，即使没有更新的内容，定期的轮询也会消耗大量的电池电量，而 GCM 仅在需要时才会发出消息。

> **Note：**如果我们使用 GCM，将广播消息发送到所有安装了我们的应用的设备，来激活 Sync Adapter。要记住他们会在同一时间（粗略地）收到我们的消息。这会导致在同一时段内有多个 Sync Adapter 的实例在运行，进而导致服务器和网络的负载过重。要避免这一情况，我们应该考虑为不同的设备设定不同的 Sync Adapter 来延迟启动时间。

下面的代码展示了如何通过 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a> 响应一个接收到的 GCM 消息：

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

## 当 Content Provider 的数据变化时，运行 Sync Adapter

如果我们的应用在一个 Content Provider 中收集数据，并且希望当我们更新了 Content Provider 的时候，同时更新服务器的数据，我们可以配置 Sync Adapter 来让它自动运行。要做到这一点，首先应该为 Content Provider 注册一个 Observer。当 Content Provider 的数据发生了变化之后，Content Provider 框架会调用 Observer。在 Observer 中，调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a> 来告诉框架现在应该运行 Sync Adapter 了。

> **Note：**如果我们使用的是一个 Stub Content Provider，那么在 Content Provider 中不会有任何数据，并且不会调用 <a href="http://developer.android.com/reference/android/database/ContentObserver.html#onChange(boolean)">onChange()</a> 方法。在这种情况下，我们不得不提供自己的某种机制来检测设备数据的变化。这一机制还要负责在数据发生变化时调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a>。

为了给 Content Provider 创建一个 Observer，继承 [ContentObserver](http://developer.android.com/reference/android/database/ContentObserver.html) 类，并且实现 <a href="http://developer.android.com/reference/android/database/ContentObserver.html#onChange(boolean)">onChange()</a> 方法的两种形式。在 <a href="http://developer.android.com/reference/android/database/ContentObserver.html#onChange(boolean)">onChange()</a> 中，调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a> 来启动 Sync Adapter。

要注册 Observer，需要将它作为参数传递给 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#registerContentObserver(android.net.Uri, boolean, android.database.ContentObserver)">registerContentObserver()</a>。在该方法中，我们还要传递一个我们想要监视的 Content URI。Content Provider 框架会将这个需要监视的 URI 与其它一些 Content URIs 进行比较，这些其它的 Content URIs 来自于 [ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html) 中那些可以修改 Provider 的方法（如 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#insert(android.net.Uri, android.content.ContentValues)">ContentResolver.insert()</a>）所传入的参数。如果出现了变化，那么我们所实现的 <a href="http://developer.android.com/reference/android/database/ContentObserver.html#onChange(boolean)">ContentObserver.onChange()</a> 将会被调用。

下面的代码片段展示了如何定义一个 [ContentObserver](http://developer.android.com/reference/android/database/ContentObserver.html)，它在表数据发生变化后调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a>：

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

## 在一个网络消息之后，运行 Sync Adapter

当可以获得一个网络连接时，Android 系统会每隔几秒发送一条消息来保持 TCP/IP 连接处于开启状态。这一消息也会传递到每个应用的 [ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html) 中。通过调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically(android.accounts.Account, java.lang.String, boolean)">setSyncAutomatically()</a>，我们可以在 [ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html) 收到消息后，运行 Sync Adapter。

每当网络消息被发送后运行 Sync Adapter，通过这样的调度方式可以保证每次运行 Sync Adapter 时都可以访问网络。如果不是每次数据变化时就要以数据传输来响应，但是又希望自己的数据会被定期地更新，那么我们可以用这一选项。类似地，如果我们不想要定期执行 Sync Adapter，但希望经常运行它，我们也可以使用这一选项。

由于 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically(android.accounts.Account, java.lang.String, boolean)">setSyncAutomatically()</a> 方法不会禁用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long)">addPeriodicSync()</a>，所以 Sync Adapter 可能会在一小段时间内重复地被触发激活。如果我们想要定期地运行 Sync Adapter，应该禁用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically(android.accounts.Account, java.lang.String, boolean)">setSyncAutomatically()</a>。

下面的代码片段展示如何配置 [ContentResolver](http://developer.android.com/reference/android/content/ContentResolver.html)，利用它来响应网络消息，从而运行 Sync Adapter：

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

我们可以设置一个在运行之间的时间间隔来定期运行 Sync Adapter，或者在每天的固定时间运行它，还可以两种策略同时使用。定期地运行 Sync Adapter 可以让服务器的更新间隔大致保持一致。

同样地，当服务器相对来说比较空闲时，我们可以通过在夜间定期调用 Sync Adapter，把设备上的数据上传到服务器。大多数用户在晚上不会关机，并为手机充电，所以这一方法是可行的。而且，通常来说，设备不会在深夜运行除了 Sync Adapter 之外的其他的任务。然而，如果我们使用这个方法的话，我们需要注意让每台设备在略微不同的时间触发数据传输。如果所有设备在同一时间运行我们的 Sync Adapter，那么我们的服务器和移动运营商的网络将很有可能负载过重。

一般来说，当我们的用户不需要实时更新，而希望定期更新时，使用定期运行的策咯会很有用。如果我们希望在数据的实时性和 Sync Adapter 的资源消耗之间进行一个平衡，那么定期执行是一个不错的选择。

要定期运行我们的 Sync Adapter，调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long)">addPeriodicSync()</a>。这样每隔一段时间，Sync Adapter 就会运行。由于 Sync Adapter 框架会考虑其他 Sync Adapter 的执行，并尝试最大化电池效率，所以间隔时间会动态地进行细微调整。同时，如果当前无法获得网络连接，框架不会运行我们的 Sync Adapter。

注意，<a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long)">addPeriodicSync()</a> 方法不会让 Sync Adapter 每天在某个时间自动运行。要让我们的 Sync Adapter 在每天的某个时刻自动执行，可以使用一个重复计时器作为触发器。重复计时器的更多细节可以阅读：[AlarmManager](http://developer.android.com/reference/android/app/AlarmManager.html)。如果我们使用 <a href="http://developer.android.com/reference/android/app/AlarmManager.html#setInexactRepeating(int, long, long, android.app.PendingIntent)">setInexactRepeating()</a> 方法设置了一个每天的触发时刻会有粗略变化的触发器，我们仍然应该将不同设备 Sync Adapter 的运行时间随机化，使得它们的执行交错开来。

<a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long)">addPeriodicSync()</a> 方法不会禁用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically(android.accounts.Account, java.lang.String, boolean)">setSyncAutomatically()</a>，所以我们可能会在一小段时间内产生多个 Sync Adapter 的运行实例。另外，仅有一部分 Sync Adapter 的控制标识可以在调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account, java.lang.String, android.os.Bundle, long)">addPeriodicSync()</a> 时使用。不被允许的标识在该方法的<a href="http://developer.android.com/reference/android/content/ContentResolver.html#addPeriodicSync(android.accounts.Account,%20java.lang.String,%20android.os.Bundle,%20long)">文档</a>中可以查看。

下面的代码样例展示了如何定期执行 Sync Adapter：

```java
public class MainActivity extends FragmentActivity {
    ...
    // Constants
    // Content provider authority
    public static final String AUTHORITY = "com.example.android.datasync.provider";
    // Account
    public static final String ACCOUNT = "default_account";
    // Sync interval constants
    public static final long SECONDS_PER_MINUTE = 60L;
    public static final long SYNC_INTERVAL_IN_MINUTES = 60L;
    public static final long SYNC_INTERVAL =
            SYNC_INTERVAL_IN_MINUTES *
            SECONDS_PER_MINUTE;
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
                Bundle.EMPTY,
                SYNC_INTERVAL);
        ...
    }
    ...
}
```

## 按需求执行 Sync Adapter

以响应用户请求的方式运行 Sync Adapter 是最不推荐的策略。要知道，该框架是被特别设计的，它可以让 Sync Adapter 在根据某个调度规则运行时，能够尽量最高效地使用手机电量。显然，在数据改变的时候执行同步可以更有效的使用手机电量，因为电量都消耗在了更新新的数据上。

相比之下，允许用户按照自己的需求运行 Sync Adapter 意味着 Sync Adapter 会自己运行，这将无法有效地使用电量和网络资源。如果根据需求执行同步，会诱导用户即便没有证据表明数据发生了变化也请求一个更新，这些无用的更新会导致对电量的低效率使用。一般来说，我们的应用应该使用其它信号来触发一个同步更新或者让它们定期地去执行，而不是依赖于用户的输入。

不过，如果我们仍然想要按照需求运行 Sync Adapter，可以将 Sync Adapter 的配置标识设置为手动执行，之后调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">ContentResolver.requestSync()</a> 来触发一次更新。

通过下列标识来执行按需求的数据传输：

[`SYNC_EXTRAS_MANUAL`](http://developer.android.com/reference/android/content/ContentResolver.html#SYNC_EXTRAS_MANUAL)

  强制执行手动的同步更新。Sync Adapter 框架会忽略当前的设置，比如通过 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#setSyncAutomatically(android.accounts.Account, java.lang.String, boolean)">setSyncAutomatically()</a> 方法设置的标识。

[`SYNC_EXTRAS_EXPEDITED`](http://developer.android.com/reference/android/content/ContentResolver.html#SYNC_EXTRAS_EXPEDITED)

  强制同步立即执行。如果我们不设置此项，系统可能会在运行同步请求之前等待一小段时间，因为它会尝试将一小段时间内的多个请求集中在一起调度，目的是为了优化电量的使用。

下面的代码片段将展示如何调用 <a href="http://developer.android.com/reference/android/content/ContentResolver.html#requestSync(android.accounts.Account, java.lang.String, android.os.Bundle)">requestSync()</a> 来响应一个按钮点击事件：

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
