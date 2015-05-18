# 传输资源

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/assets.html>

为了通过蓝牙发送大量的二进制数据，比如图片，要将一个[Asset](http://developer.android.com/reference/com/google/android/gms/wearable/Asset.html)附加到数据元上，并放入复制而来的数据库中。

Assets 能够自动地处理数据缓存以避免重复发送，保护蓝牙带宽。一般的模式是：手持设备下载图像，将图片压缩到适合在可穿戴设备上显示的大小，并以Asset传给可穿戴设备。下面的例子演示此模式。

> **Note:** 尽管数据元的大小限制在100KB，但资源可以任意大。然而，传输大量资源会多方面地影响用户体验，因此，当传输大量资源时，要测试我们的应用以保证它有良好的用户体验。

## 传输资源

在Asset类中使用`creat..()`方法创建资源。下面，我们将一个bitmap转化为字节流，然后调用[creatFromBytes()](http://developer.android.com/reference/com/google/android/gms/wearable/Asset.html#createFromBytes(byte[]))方法创建资源。

```java
private static Asset createAssetFromBitmap(Bitmap bitmap) {
    final ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteStream);
    return Asset.createFromBytes(byteStream.toByteArray());
}
```

创建资源后，使用 [DataMap](DataMap.html) 或者 [PutDataRepuest](PutDataRequest.html) 类中的 `putAsset()` 方法将其附加到数据元上，然后用 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/DataApi.html#putDataItem(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.PutDataRequest)">putDataItem()</a> 方法将数据元放入数据库。

### 使用 PutDataRequest

```java
Bitmap bitmap = BitmapFactory.decodeResource(getResources(), R.drawable.image);
Asset asset = createAssetFromBitmap(bitmap);
PutDataRequest request = PutDataRequest.create("/image");
request.putAsset("profileImage", asset);
Wearable.DataApi.putDataItem(mGoogleApiClient, request);
```

### 使用 PutDataMapRequest

```java
Bitmap bitmap = BitmapFactory.decodeResource(getResources(), R.drawable.image);
Asset asset = createAssetFromBitmap(bitmap);
PutDataMapRequest dataMap = PutDataMapRequest.create("/image");
dataMap.getDataMap().putAsset("profileImage", asset)
PutDataRequest request = dataMap.asPutDataRequest();
PendingResult<DataApi.DataItemResult> pendingResult = Wearable.DataApi
        .putDataItem(mGoogleApiClient, request);
```

## 接收资源

创建资源后，我们可能需要在另一连接端读取资源。以下是如何实现回调以发现资源变化和提取Asset对象。

```java
@Override
public void onDataChanged(DataEventBuffer dataEvents) {
  for (DataEvent event : dataEvents) {
    if (event.getType() == DataEvent.TYPE_CHANGED &&
        event.getDataItem().getUri().getPath().equals("/image")) {
      DataMapItem dataMapItem = DataMapItem.fromDataItem(event.getDataItem());
      Asset profileAsset = dataMapItem.getDataMap().getAsset("profileImage");
      Bitmap bitmap = loadBitmapFromAsset(profileAsset);
      // Do something with the bitmap
    }
  }
}

public Bitmap loadBitmapFromAsset(Asset asset) {
    if (asset == null) {
        throw new IllegalArgumentException("Asset must be non-null");
    }
    ConnectionResult result =
           mGoogleApiClient.blockingConnect(TIMEOUT_MS, TimeUnit.MILLISECONDS);
    if (!result.isSuccess()) {
        return null;
    }
    // convert asset into a file descriptor and block until it's ready
    InputStream assetInputStream = Wearable.DataApi.getFdForAsset(
            mGoogleApiClient, asset).await().getInputStream();
            mGoogleApiClient.disconnect();

    if (assetInputStream == null) {
        Log.w(TAG, "Requested an unknown Asset.");
        return null;
    }
    // decode the stream into a bitmap
    return BitmapFactory.decodeStream(assetInputStream);
}
```



