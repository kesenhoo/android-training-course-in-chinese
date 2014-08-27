# 处理数据层的事件

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/events.html>

当做出数据层上的调用时，你可以得到它完成后的调用状态，也可以用监听器监听到调用最终实现的改变。

## 等待数据层调用状态

注意到，调用数据层API，有时会返回[PendingResult](PendingResult.html)，如 [putDataItem()](DataApi.html#putDataItem(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.PutDataRequest))。PendingResult一被创建，操作就会在后台排列等候。之后你若无动作，这些操作最终会默默完成。然而，通常要处理操作完成后的结果，PendingResult能够让你同步或异步地等待结果。

### 异步等待

若你的代码运行在主UI线程上，不使阻塞调用数据层API。你可以增加一个PendingResult对象回调来运行异步调用，将在操作完成时触发。
```java
pendingResult.setResultCallback(new ResultCallback<DataItemResult>() {
    @Override
    public void onResult(final DataItemResult result) {
        if(result.getStatus().isSuccess()) {
            Log.d(TAG, "Data item set: " + result.getDataItem().getUri());
        }
    }
});
```

### 同步等待


如果你的代码是运行在后台服务的一个单独的处理线程上（[WearableListenerService](WearableListenerService.html)的情况）,则适合调用阻塞。在这种情况下,你可以用PendingResult对象调用[await()](PendingResult.html#await()),它将阻塞至请求完成,并返回一个Result对象。
```java
DataItemResult result = pendingResult.await();
if(result.getStatus().isSuccess()) {
    Log.d(TAG, "Data item set: " + result.getDataItem().getUri());
}
```

# 监听数据层事件

因为数据层在手持和可穿戴设备间同步并发送数据,所以通常要监听重要事件,例如创建数据元,接受消息,或当可穿戴设备和手机连接时。

对于监听数据层事件，有两种选择：

* 创建一个继承自WearableListenerService的service。
* 创建一个实现[DataApi.DataListener](DataApi.DataListener.html)接口的activity。

通过这两种选择，你覆盖任何你关心的数据事件回调方法来处理您的实现。

### 使用 WearableListenerService

典型地，在你的手持设备和可穿戴设备上都创建service实例。如果你不关心其中一个应用中的数据事件，就不需要在相应的应用中实现此service。

例如,您可以在一个手持设备应用程序上操作数据元对象,可穿戴设备的应用监听这些更新并更新UI。而可穿戴不更新任何数据元,所以手持设备的应用不监听任何可穿戴式设备应用的数据事件。

你可以用 WearableListenerService监听如下事件：

* [onDataChanged()](WearableListenerService.html#onDataChanged(com.google.android.gms.wearable.DataEventBuffer)) - 当数据元对象创建，更改，删除时调用。一连接端的事件触发两端的回调方法。
* [onMessageReceived()](WearableListenerService.html#onMessageReceived(com.google.android.gms.wearable.MessageEvent)) - 	消息从一连接端发出时在另一连接端触发此回调方法。
* [onPeerConnected()](wearable/WearableListenerService.html#onMessageReceived(com.google.android.gms.wearable.MessageEvent)) 和 [onPeerDisconnected()](WearableListenerService.html#onPeerDisconnected(com.google.android.gms.wearable.Node)) - 	当与手持或可穿戴设备连接或断开时调用。一连接端连接状态的改变会在两端触发此回调方法。

创建WearableListenerService：

1. 创建一个继承自WearableListenerService的类。
2. 监听你关心的事件，比如onDataChanged()。
3. 在Android manifest中声明一个intent filter，通知系统你的WearableListenerService。这样允许系统需要时绑定你的service。

下例展示如何实现一个简单的WearableListenerService：
```java
public class DataLayerListenerService extends WearableListenerService {

    private static final String TAG = "DataLayerSample";
    private static final String START_ACTIVITY_PATH = "/start-activity";
    private static final String DATA_ITEM_RECEIVED_PATH = "/data-item-received";

    @Override
    public void onDataChanged(DataEventBuffer dataEvents) {
        if (Log.isLoggable(TAG, Log.DEBUG)) {
            Log.d(TAG, "onDataChanged: " + dataEvents);
        }
        final List events = FreezableUtils
                .freezeIterable(dataEvents);

        GoogleApiClient googleApiClient = new GoogleApiClient.Builder(this)
                .addApi(Wearable.API)
                .build();

        ConnectionResult connectionResult =
                googleApiClient.blockingConnect(30, TimeUnit.SECONDS);

        if (!connectionResult.isSuccess()) {
            Log.e(TAG, "Failed to connect to GoogleApiClient.");
            return;
        }

        // Loop through the events and send a message
        / to the node that created the data item.
        for (DataEvent event : events) {
            Uri uri = event.getDataItem().getUri();

            // Get the node id from the host value of the URI
            String nodeId = uri.getHost();
            // Set the data of the message to be the bytes of the URI.
            byte[] payload = uri.toString().getBytes();

            // Send the RPC
            Wearable.MessageApi.sendMessage(googleApiClient, nodeId,
                    DATA_ITEM_RECEIVED_PATH, payload);
        }
    }
}
```

这是Android mainfest中相应的intent filter：

```xml
<service android:name=".DataLayerListenerService">
  <intent-filter>
      <action android:name="com.google.android.gms.wearable.BIND_LISTENER" />
  </intent-filter>
</service>
```

### 数据层回调权限

为了在数据层事件上向你的程序提供回调方法，Google Play服务绑定到你的WearableListenerService，通过IPC调用回调方法。这样的结果是,你的回调方法继承了调用进程的权限。

如果你想在一个回调中执行权限操作,安全检查会失败,因为你的回调是以调用进程的身份运行,而不是应用程序进程的身份运行。

为了解决这个问题,在进入IPC后使用[clearCallingIdentity()](Binder.html#clearCallingIdentity())重置身份,当你完成权限操作后，使用[restoreCallingIdentity()](Binder.html#restoreCallingIdentity(long))恢复身份:
```java
long token = Binder.clearCallingIdentity();
try {
    performOperationRequiringPermissions();
} finally {
    Binder.restoreCallingIdentity(token);
}
```

### 使用监听 Activity

如果你的应用只关心当用户与应用交互时产生的数据层事件，并且不需要一个长时间运行的service来处理每一次数据的改变，那么你可以在一个activity中通过实现如下一个和多个接口监听事件：


* DataApi.DataListener
* MessageApi.MessageListener
* NodeApi.NodeListener

创建一个activity监听数据事件：

* 实现所需的接口。
* 在onCreate(Bundle)中创建 GoogleApiClient实例。
* 在onStart()中调用connect()  将客户端连接到 Google Play 服务。
* 当连接到Google Play 服务时，系统调用 onConnected()。这里你调用以提醒Google Play 服务你的activity要监听数据层事件。
* 在 onStop()中，用 DataApi.removeListener(), MessageApi.removeListener() 或NodeApi.removeListener() 注销监听。
* 基于你实现的接口实现 onDataChanged(), onMessageReceived(), onPeerConnected()和 onPeerDisconnected()。

这是实现DataApi.DataListener的例子 ：

```java
public class MainActivity extends Activity implements
        DataApi.DataListener, ConnectionCallbacks, OnConnectionFailedListener {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.main);
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addApi(Wearable.API)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .build();
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (!mResolvingError) {
            mGoogleApiClient.connect();
        }
    }

   @Override
    public void onConnected(Bundle connectionHint) {
        if (Log.isLoggable(TAG, Log.DEBUG)) {
            Log.d(TAG, "Connected to Google Api Service");
        }
        Wearable.DataApi.addListener(mGoogleApiClient, this);
    }

    @Override
    protected void onStop() {
        if (null != mGoogleApiClient && mGoogleApiClient.isConnected()) {
            Wearable.DataApi.removeListener(mGoogleApiClient, this);
            mGoogleApiClient.disconnect();
        }
        super.onStop();
    }

    @Override
    public void onDataChanged(DataEventBuffer dataEvents) {
        for (DataEvent event : dataEvents) {
            if (event.getType() == DataEvent.TYPE_DELETED) {
                Log.d(TAG, "DataItem deleted: " + event.getDataItem().getUri());
            } else if (event.getType() == DataEvent.TYPE_CHANGED) {
                 Log.d(TAG, "DataItem changed: " + event.getDataItem().getUri());
            }
        }
    }
```
