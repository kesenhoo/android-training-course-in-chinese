# Android Wear 上的位置检测

> 编写:[heray1990](https://github.com/heray1990) - 原文: <http://developer.android.com/training/articles/wear-location-detection.html>

可穿戴设备上的位置感知让我们可以创建为用户提供更好地了解地理位置、移动和周围事物的应用。由于可穿戴设备小型和方便的特点，我们可以构建低摩擦应用来记录和响应位置数据。

一些可穿戴设备带有 GPS 感应器，它们可以在不需要其它设备的帮助下检索位置数据。无论如何，当我们在可穿戴应用上请求获取位置数据，我们不需要担心位置数据从哪里发出；系统会用最节能的方法来检索位置更新。我们的应用应该可以处理位置数据的丢失，以防没有内置 GPS 感应器的可穿戴设备与配套设备断开连接。

这篇文章介绍如何检查设备上的位置感应器、检索位置数据和监视数据连接。

> **Note:** 这篇文章假设我们知道如何使用 Google Play services API 来检索位置数据。更多相关的内容，请见 [Android 位置信息](http://hukai.me/android-training-course-in-chinese/location/index.html)。

## 连接 Google Play Services

可穿戴设备上的位置数据可以通过 Google Play services location APIs 来获取。我们可以使用 [FusedLocationProviderApi](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html) 和它伴随的类来获取这个数据。为了访问位置服务，可以创建 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 实例，这个实例是任何 Google Play services APIs 的主要入口。

> **Caution:** 不要使用 Android 框架已有的 [Location](http://developer.android.com/reference/android/location/package-summary.html) APIs。检索位置更新最好的方法是通过这篇文章介绍的 Google Play services API 获取。

为了连接 Google Play services，配置应用来创建 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 实例：

1. 创建一个 activity 来指定 [ConnectionCallbacks](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html)、[OnConnectionFailedListener](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.OnConnectionFailedListener.html) 和 [LocationListener](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html) 接口的实现。
2. 在 activity 的 [onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)) 方法中，创建 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 实例和添加位置服务。
3. 为了优雅地管理连接的生命周期，在 [onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume()) 方法里调用 [connect()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html#connect()) 和在 [onPause()](http://developer.android.com/reference/android/app/Activity.html#onPause()) 方法里调用 [disconnect()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html#disconnect())。

下面的代码示例介绍了一个 activity 的实现来实现 [LocationListener](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html) 接口：

```java
public class WearableMainActivity extends Activity implements
    GoogleApiClient.ConnectionCallbacks,
    GoogleApiClient.OnConnectionFailedListener,
    LocationListener {

    private GoogleApiClient mGoogleApiClient;
    ...

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ...
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addApi(LocationServices.API)
                .addApi(Wearable.API)  // used for data layer API
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .build();
    }

    @Override
    protected void onResume() {
        super.onResume();
        mGoogleApiClient.connect();
        ...
    }

    @Override
    protected void onPause() {
        super.onPause();
        ...
        mGoogleApiClient.disconnect();
    }
}
```

更多关于连接 Google Play services 的内容，请见 [Accessing Google APIs](http://developer.android.com/google/auth/api-client.html)。

## 请求位置更新

应用连接到 Google Play services API 之后，它已经准备好开始接收位置更新了。当系统为我们的客户端调用 [onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)) 回调函数时，我们可以按照下面的步骤构建位置更新请求：

1. 创建一个 [LocationRequest](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html) 对象并且用像 [setPriority()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setPriority(int)) 这样的方法设置选项。
2. 使用 <a href="http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#requestLocationUpdates(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.LocationRequest, com.google.android.gms.location.LocationListener)">requestLocationUpdates()</a> 请求位置更新。
3. 在 [onPause()]() 方法里使用 <a href="http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#removeLocationUpdates(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.LocationListener)">removeLocationUpdates()</a> 删除位置更新。

下面的例子介绍了如何接收和删除位置更新：

```java
@Override
public void onConnected(Bundle bundle) {
    LocationRequest locationRequest = LocationRequest.create()
            .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY)
            .setInterval(UPDATE_INTERVAL_MS)
            .setFastestInterval(FASTEST_INTERVAL_MS);

    LocationServices.FusedLocationApi
            .requestLocationUpdates(mGoogleApiClient, locationRequest, this)
            .setResultCallback(new ResultCallback() {

                @Override
                public void onResult(Status status) {
                    if (status.getStatus().isSuccess()) {
                        if (Log.isLoggable(TAG, Log.DEBUG)) {
                            Log.d(TAG, "Successfully requested location updates");
                        }
                    } else {
                        Log.e(TAG,
                                "Failed in requesting location updates, "
                                        + "status code: "
                                        + status.getStatusCode()
                                        + ", message: "
                                        + status.getStatusMessage());
                    }
                }
            });
}

@Override
protected void onPause() {
    super.onPause();
    if (mGoogleApiClient.isConnected()) {
        LocationServices.FusedLocationApi
             .removeLocationUpdates(mGoogleApiClient, this);
    }
    mGoogleApiClient.disconnect();
}

@Override
public void onConnectionSuspended(int i) {
    if (Log.isLoggable(TAG, Log.DEBUG)) {
        Log.d(TAG, "connection to location client suspended");
    }
}
```

至此，我们已经打开了位置更新，系统调用 [onLocationChanged()](http://developer.android.com/reference/android/location/LocationListener.html#onLocationChanged(android.location.Location)) 方法，同时按照 [setInterval()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setInterval(long)) 指定的时间间隔更新位置。

## 检测设备上的 GPS

不是所有的可穿戴设备都有 GPS 感应器。如果用户出去外面并且将他们的手机放在家里，那么我们的可穿戴应用无法通过一个绑定连接来接收位置数据。如果可穿戴设备没有 GPS 感应器，那么我们应该检测到这种情况并且警告用户位置功能不可用。

使用 [hasSystemFeature()](http://developer.android.com/reference/android/content/pm/PackageManager.html#hasSystemFeature(java.lang.String)) 方法确定 Android Wear 设备是否有内置的 GPS 感应器。下面的代码用于当我们启动一个 activity 时，检测设备是否有内置的 GPS 感应器：

```java
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    setContentView(R.layout.main_activity);
    if (!hasGps()) {
        Log.d(TAG, "This hardware doesn't have GPS.");
        // Fall back to functionality that does not use location or
        // warn the user that location function is not available.
    }

    ...
}

private boolean hasGps() {
    return getPackageManager().hasSystemFeature(PackageManager.FEATURE_LOCATION_GPS);
}
```

## 处理断开事件

可穿戴设备在回答绑定连接位置数据时可能会突然断开连接。如果我们的可穿戴应用期待持续的数据，那么我们必须处理数据中断或者不可用的断线问题。在一个不带有 GPS 感应器的可穿戴设备上，当设备与绑定数据连接断开时，位置数据会丢失。

以防基于绑定位置数据连接的应用和可穿戴设备没有 GPS 感应器，我们应该检测连接的断线，警告用户和优雅地降低应用的功能。

为了检测数据连接的断线：

1. 继承 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 来监听重要的数据层事件。
2. 在 Android manifest 文件中声明一个 intent filter 来把[WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 通知给系统。这个 filter 允许系统按需绑定我们的服务。
```xml
<service android:name=".NodeListenerService">
    <intent-filter>
        <action android:name="com.google.android.gms.wearable.BIND_LISTENER" />
    </intent-filter>
</service>
```
3. 实现 [onPeerDisconnected()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onPeerDisconnected(com.google.android.gms.wearable.Node)) 方法并处理设备是否有内置 GPS 的情况。

```java
public class NodeListenerService extends WearableListenerService {

    private static final String TAG = "NodeListenerService";

    @Override
    public void onPeerDisconnected(Node peer) {
        Log.d(TAG, "You have been disconnected.");
        if(!hasGPS()) {
            // Notify user to bring tethered handset
            // Fall back to functionality that does not use location
        }
    }
    ...
}
```

更多相关的信息，请见 [监听数据层事件](http://hukai.me/android-training-course-in-chinese/wearables/data-layer/events.html#Listen) 指南。

## 处理找不到位置的情况

当 GPS 信号丢失了，我们仍然可以使用 [getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient)) 检索最后可知位置。这个方法在我们无法修复 GPS 连接或者设备没有内置 GPS 并且断开与手机连接的情况下很有用。

下面的代码使用 [getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient)) 检索最后可知位置：

```java
Location location = LocationServices.FusedLocationApi
                .getLastLocation(mGoogleApiClient);
```

## 同步数据

如果可穿戴应用使用内置 GPS 记录数据，那么我们可能想要与手持应用同步位置数据。对于 [LocationListener](http://developer.android.com/reference/android/location/LocationListener.html)，我们可以实现 [onLocationChanged()](http://developer.android.com/reference/android/location/LocationListener.html#onLocationChanged(android.location.Location)) 方法来检测和记录它改变的位置。

下面的可穿戴应用代码检测位置变化和使用数据层 API 来保存用于手机应用日后检索的数据：

```java
@Override
public void onLocationChanged(Location location) {
    ...
    addLocationEntry(location.getLatitude(), location.getLongitude());

}

private void addLocationEntry(double latitude, double longitude) {
    if (!mSaveGpsLocation || !mGoogleApiClient.isConnected()) {
        return;
    }

    mCalendar.setTimeInMillis(System.currentTimeMillis());

    // Set the path of the data map
    String path = Constants.PATH + "/" + mCalendar.getTimeInMillis();
    PutDataMapRequest putDataMapRequest = PutDataMapRequest.create(path);

    // Set the location values in the data map
    putDataMapRequest.getDataMap()
            .putDouble(Constants.KEY_LATITUDE, latitude);
    putDataMapRequest.getDataMap()
            .putDouble(Constants.KEY_LONGITUDE, longitude);
    putDataMapRequest.getDataMap()
            .putLong(Constants.KEY_TIME, mCalendar.getTimeInMillis());

    // Prepare the data map for the request
    PutDataRequest request = putDataMapRequest.asPutDataRequest();

    // Request the system to create the data item
    Wearable.DataApi.putDataItem(mGoogleApiClient, request)
            .setResultCallback(new ResultCallback() {
                @Override
                public void onResult(DataApi.DataItemResult dataItemResult) {
                    if (!dataItemResult.getStatus().isSuccess()) {
                        Log.e(TAG, "Failed to set the data, "
                                + "status: " + dataItemResult.getStatus()
                                .getStatusCode());
                    }
                }
            });
}
```

更多关于如何使用数据层 API 的内容，请见 [发送与同步数据](http://hukai.me/android-training-course-in-chinese/wearables/data-layer/index.html) 指南。