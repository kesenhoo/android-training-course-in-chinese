# 同步数据单元

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/data-items.html>

[DataItem](http://developer.android.com/reference/com/google/android/gms/wearable/DataItem.html)是指系统用于同步手持设备与可穿戴设备间数据的接口。一个[DataItem](http://developer.android.com/reference/com/google/android/gms/wearable/DataItem.html)通常包括以下几点：

* **Pyload**- 一个字节数组，你可以用来设置任何数据，让你的object序列化和反序列化。Pyload的大小限制在100k之内。

* **Path**- 唯一且以前斜线开头的string (如："/path/to/data")。


通常不直接实现[DataItem](DataItem.html)，而是：

1. 创建一个[PutdataRequest](PutDataRequest.html)对象，指明一个string path 以唯一确定该 item。
2. 调用[setData](PutDataRequest.html#setData)()方法设置Pyload。
3. 调用[DataApi.putDataItem](DataApi.html#putDataItem)()方法，请求系统创建数据元。
4. 当请求的时候，系统会返回正确实现DataItem接口的对象。

然而，我们建议使用[Data Map](data-items.html#data-map)来显示装在一个易用的类似[Bundle](Bundle.html)接口中的数据元，而用不是setData()来处理原始字节。

## 用 Data Map 同步数据

使用[DataMap](DataMap.html)类，将数据元处理为 Android [Bundle](Bundle.html)的形式，因此对象的序列化和反序列化就会完成，你就可以以 key-value 对的形式操纵数据。

如何使用：

1. 创建一个 [PutDataMapRequest](PutDataMapRequest.html)对象，设置数据元的path。
> **Note:** path 字符串对数据元是唯一确定的，这样能够使你从另一连接端访问。Path须以前斜线开始。如果你想在应用中使用分层数据，就要创建一个适合数据结构的路径方案。
2.  调用[PutDataMapRequest.getDataMap()](PutDataMapRequest.html#getDataMap())获取一个你可以使用的data map 对象。
3.  使用put...()方法，如：[putString()](DataMap.html#putString(java.lang.String, java.lang.String)),为data map设置数据。
4.  调用[PutDataMapRequest.asPutDataRequest()](PutDataMapRequest.html#asPutDataRequest())获得[PutDataRequest](PutDataRequest.html)对象。
5.  调用 [DataApi.putDataItem()](DataApi.html#putDataItem(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.PutDataRequest)) 请求系统创建数据元
> **Note:** 如果手机和可穿戴设备没有连接，数据会缓冲并在重新建立连接时同步。

接下的例子中的increaseCounter()方法展示了如何创建一个data map，并设置数据：
```java
public class MainActivity extends Activity implements
        DataApi.DataListener,
        GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener {

    private static final String COUNT_KEY = "com.example.key.count";

    private GoogleApiClient mGoogleApiClient;
    private int count = 0;

    ...

    // 创建一个 data map 并设置数据
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

如果一端的数据层的数据发生改变，想要在另一端被告知此改变，你可以通过实现一个数据元事件的监听器来完成。

下面例子的代码片段能够通知你的app，当定义在上一个例子中的counter的值发生改变时。

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

这个activity是实现了[ DataItem.DataListener ](http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.DataListener.html)接口，并在onConnected()方法中增加自身成为数据元事件的监听者，和在onPause()方法中移除监听。

你也可以用一个service实现监听，请见 [Listening for Data Layer Events](events.html)。


