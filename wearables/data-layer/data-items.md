# 同步数据单元

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/data-items.html>

[DataItem](http://developer.android.com/reference/com/google/android/gms/wearable/DataItem.html)是指系统用于同步手持设备与可穿戴设备间数据的接口。一个[DataItem](http://developer.android.com/reference/com/google/android/gms/wearable/DataItem.html)通常包括以下几点：

* **Pyload** - 一个字节数组，我们可以用来设置任何数据，让我们的对象序列化和反序列化。Pyload的大小限制在100k之内。

* **Path** - 唯一且以前斜线开头的字符串（如："/path/to/data"）。


通常不直接实现[DataItem](http://developer.android.com/reference/com/google/android/gms/wearable/DataItem.html)，而是：

1. 创建一个[PutdataRequest](http://developer.android.com/reference/com/google/android/gms/wearable/PutDataRequest.html)对象，指明一个字符串路径以唯一确定该 item。
2. 调用[setData()](http://developer.android.com/reference/com/google/android/gms/wearable/PutDataRequest.html#setData(byte[]))方法设置Pyload。
3. 调用<a href="http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.html#putDataItem(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.PutDataRequest)">DataApi.putDataItem()</a>方法，请求系统创建数据元。
4. 当请求数据元的时候，系统会返回正确实现DataItem接口的对象。

然而，我们建议使用[Data Map](data-items.html#data-map)来显示装在一个易用的类似[Bundle](Bundle.html)接口中的数据元，而不是用setData()来处理原始字节。

## 用 Data Map 同步数据

使用[DataMap](DataMap.html)类，将数据元处理为 Android [Bundle](Bundle.html)的形式，因此会完成对象的序列化和反序列化，我们就可以以键值对（key-value）的形式操纵数据。

如何使用data map：

1. 创建一个 [PutDataMapRequest](http://developer.android.com/reference/com/google/android/gms/wearable/PutDataMapRequest.html)对象，设置数据元的路径。
> **Note:** 数据元的路径字符串是唯一确定的，这样能够使我们从连接任意一端访问数据元。路径须以前斜线开始。如果我们想在应用中使用分层数据，就要创建一个适合数据结构的路径方案。
2. 调用[PutDataMapRequest.getDataMap()](http://developer.android.com/reference/com/google/android/gms/wearable/PutDataMapRequest.html#getDataMap())获取一个我们可以使用的data map 对象。
3. 使用put...()方法，如：<a href="http://developer.android.com/reference/com/google/android/gms/wearable/DataMap.html#putString(java.lang.String, java.lang.String)">putString()</a>，为data map设置数据。
4. 调用[PutDataMapRequest.asPutDataRequest()](http://developer.android.com/reference/com/google/android/gms/wearable/PutDataMapRequest.html#asPutDataRequest())获得[PutDataRequest](http://developer.android.com/reference/com/google/android/gms/wearable/PutDataRequest.html)对象。
5. 调用 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.html#putDataItem(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.PutDataRequest)">DataApi.putDataItem()</a> 请求系统创建数据元。
> **Note:** 如果手机和可穿戴设备没有连接，数据会缓冲并在重新建立连接时同步。

接下的例子中的`increaseCounter()`方法展示了如何创建一个data map，并设置数据：

```java
public class MainActivity extends Activity implements
        DataApi.DataListener,
        GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener {

    private static final String COUNT_KEY = "com.example.key.count";

    private GoogleApiClient mGoogleApiClient;
    private int count = 0;

    ...

    // Create a data map and put data in it
    private void increaseCounter() {
        PutDataMapRequest putDataMapReq = PutDataMapRequest.create("/count");
        putDataMapReq.getDataMap().putInt(COUNT_KEY, count++);
        PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
        PendingResult<DataApi.DataItemResult> pendingResult =
                Wearable.DataApi.putDataItem(mGoogleApiClient, putDataReq);
    }

    ...
}
```
有关控制 [PendingResult](http://developer.android.com/reference/com/google/android/gms/common/api/PendingResult.html) 对象的更多信息，请参见 [Wait for the Status of Data Layer Calls](http://developer.android.com/training/wearables/data-layer/events.html#Wait) 。

## 监听数据元事件

如果数据层连接的一端数据发生改变，我们很可能想要被告知在连接的另一端发生的任何改变。我们可以通过实现一个数据元事件的监听器来完成。

当定义在上一个例子中的counter的值发生改变时，下面例子的代码片段能够通知我们的app。

```java
public class MainActivity extends Activity implements
        DataApi.DataListener,
        GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener {

    private static final String COUNT_KEY = "com.example.key.count";

    private GoogleApiClient mGoogleApiClient;
    private int count = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addApi(Wearable.API)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .build();
    }

    @Override
    protected void onResume() {
        super.onStart();
        mGoogleApiClient.connect();
    }

    @Override
    public void onConnected(Bundle bundle) {
        Wearable.DataApi.addListener(mGoogleApiClient, this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        Wearable.DataApi.removeListener(mGoogleApiClient, this);
        mGoogleApiClient.disconnect();
    }

    @Override
    public void onDataChanged(DataEventBuffer dataEvents) {
        for (DataEvent event : dataEvents) {
            if (event.getType() == DataEvent.TYPE_CHANGED) {
                // DataItem 改变了
                DataItem item = event.getDataItem();
                if (item.getUri().getPath().compareTo("/count") == 0) {
                    DataMap dataMap = DataMapItem.fromDataItem(item).getDataMap();
                    updateCount(dataMap.getInt(COUNT_KEY));
                }
            } else if (event.getType() == DataEvent.TYPE_DELETED) {
                // DataItem 删除了
            }
        }
    }

    // 我们的更新 count 的方法
    private void updateCount(int c) { ... }

    ...
}
```

这个activity是实现了[ DataItem.DataListener ](http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.DataListener.html)接口。该activity在`onConnected()`方法中增加自身成为数据元事件的监听器，并在`onPause()`方法中移除监听器。

我们也可以用一个service实现监听，请见 [监听数据层事件](events.html#Listen)。


