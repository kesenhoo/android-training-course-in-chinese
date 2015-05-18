# 处理数据层的事件

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/events.html>

当做出数据层上的调用时，我们可以得到它完成后的调用状态，也可以用监听器监听到调用最终实现的改变。

## 等待数据层调用的状态

注意到，调用数据层API，有时会返回 [PendingResult](PendingResult.html)，如 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.html#putDataItem(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.PutDataRequest)">putDataItem()</a>。[PendingResult](http://developer.android.com/reference/com/google/android/gms/common/api/PendingResult.html) 一被创建，操作就会在后台排列等候。之后我们若无动作，这些操作最终会默默完成。然而，通常要处理操作完成后的结果，[PendingResult](http://developer.android.com/reference/com/google/android/gms/common/api/PendingResult.html) 能够让我们同步或异步地等待结果。

### 异步调用

若代码运行在主UI线程上，不要让数据层API调用阻塞UI。我们可以增加一个回调到 [PendingResult](http://developer.android.com/reference/com/google/android/gms/common/api/PendingResult.html) 对象来运行异步调用，该回调函数将在操作完成时触发。

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

### 同步调用

如果代码是运行在后台服务的一个独立的处理线程上（[WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html)的情况），则调用导致的阻塞没影响。在这种情况下,我们可以用 [PendingResult](http://developer.android.com/reference/com/google/android/gms/common/api/PendingResult.html)对象调用[await()](http://developer.android.com/reference/com/google/android/gms/common/api/PendingResult.html#await())，它将阻塞至请求完成,并返回一个Result对象：

```java
DataItemResult result = pendingResult.await();
if(result.getStatus().isSuccess()) {
    Log.d(TAG, "Data item set: " + result.getDataItem().getUri());
}
```

<a name="Listen"></a>
## 监听数据层事件

因为数据层在手持和可穿戴设备间同步并发送数据，所以通常要监听重要事件，例如创建数据元，接收消息，或连接可穿戴设备和手机。

对于监听数据层事件，有两种选择：

* 创建一个继承自 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 的 service。
* 创建一个实现 [DataApi.DataListener](http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.DataListener.html) 接口的 activity。

通过这两种选择，为我们感兴趣的事件重写数据事件回调方法。

### 使用 WearableListenerService

通常，我们在手持设备和可穿戴设备上都创建该 service 的实例。如果我们不关心其中一个应用中的数据事件，就不需要在相应的应用中实现此 service。

例如，我们可以在一个手持设备应用程序上操作数据元对象，可穿戴设备应用监听这些更新来更新自身的UI。而可穿戴不更新任何数据元，所以手持设备应用不监听任何可穿戴式设备应用的数据事件。

我们可以用 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 监听如下事件：

* [onDataChanged()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onDataChanged(com.google.android.gms.wearable.DataEventBuffer)) - 当数据元对象创建，更改，删除时调用。一连接端的事件将触发两端的回调方法。
* [onMessageReceived()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onMessageReceived(com.google.android.gms.wearable.MessageEvent)) - 消息从一连接端发出，在另一连接端触发此回调方法。
* [onPeerConnected()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onMessageReceived(com.google.android.gms.wearable.MessageEvent)) 和 [onPeerDisconnected()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onPeerDisconnected(com.google.android.gms.wearable.Node)) - 当与手持或可穿戴设备连接或断开时调用。一连接端连接状态的改变会在两端触发此回调方法。

创建[WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html)，我们需要：

1. 创建一个继承自 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 的类。
2. 监听我们关心的事件，比如 [onDataChanged()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onDataChanged(com.google.android.gms.wearable.DataEventBuffer))。
3. 在Android manifest中声明一个intent filter，把我们的 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 通知给系统。这样允许系统在需要时绑定我们的 service。

下例展示如何实现一个简单的 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html)：

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
        // to the node that created the data item.
        for (DataEvent event : events) {
            Uri uri = event.getDataItem().getUri();

            // Get the node id from the host value of the URI
            String nodeId = uri.getHost();
            // Set the data of the message to be the bytes of the URI
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

为了在数据层事件上向我们的应用传送回调方法，Google Play services 绑定到我们的WearableListenerService，并通过IPC调用回调方法。这样的结果是，我们的回调方法继承了调用进程的权限。

如果我们想在一个回调中执行权限操作，安全检查会失败，因为回调是以调用进程的身份运行，而不是应用程序进程的身份运行。

为了解决这个问题，在进入IPC后使用 [clearCallingIdentity()](http://developer.android.com/reference/android/os/Binder.html#clearCallingIdentity()) 重置身份，当完成权限操作后，使用 [restoreCallingIdentity()](http://developer.android.com/reference/android/os/Binder.html#restoreCallingIdentity(long)) 恢复身份:

```java
long token = Binder.clearCallingIdentity();
try {
    performOperationRequiringPermissions();
} finally {
    Binder.restoreCallingIdentity(token);
}
```

### 使用一个Listener Activity

如果我们的应用只关心当用户与应用交互时产生的数据层事件，并且不需要一个长时间运行的 service 来处理每一次数据的改变，那么我们可以在一个 activity 中通过实现如下一个和多个接口来监听事件：

* [DataApi.DataListener](http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.DataListener.html)
* [MessageApi.MessageListener](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.MessageListener.html)
* [NodeApi.NodeListener](http://developer.android.com/reference/com/google/android/gms/wearable/NodeApi.NodeListener.html)

创建一个 activity 监听数据事件，需要：

1. 实现所需的接口。
2. 在 [onCreate(Bundle)](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)) 中创建  [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 实例。
3. 在 [onStart()](http://developer.android.com/reference/android/app/Activity.html#onStart()) 中调用 [connect()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html#connect()) 将客户端连接到 Google Play services。
4. 当连接到Google Play services后，系统调用 [onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle))。这里是我们调用 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.html#addListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.DataApi.DataListener)">DataApi.addListener()</a>，<a href="http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.html#addListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.MessageApi.MessageListener)">MessageApi.addListener()</a> 或 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/NodeApi.html#addListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.NodeApi.NodeListener)">NodeApi.addListener()</a>，以告知Google Play services 我们的 activity 要监听数据层事件的地方。
5. 在 [onStop()](http://developer.android.com/reference/android/app/Activity.html#onStop()) 中，用 [DataApi.removeListener()](http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.html#removeListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.DataApi.DataListener)), [MessageApi.removeListener()](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.html#removeListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.MessageApi.MessageListener))或[NodeApi.removeListener()](http://developer.android.com/reference/com/google/android/gms/wearable/NodeApi.html#removeListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.NodeApi.NodeListener)) 注销监听。
6. 基于我们实现的接口继而实现 onDataChanged(), onMessageReceived(), onPeerConnected()和 onPeerDisconnected()。

这是实现DataApi.DataListener的例子 ：

```java
public class MainActivity extends Activity implements
        DataApi.DataListener, ConnectionCallbacks, OnConnectionFailedListener {

    private GoogleApiClient mGoogleApiClient;

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
}
```
