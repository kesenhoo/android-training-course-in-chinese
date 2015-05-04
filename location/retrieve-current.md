# 获取最后可知位置

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:<http://developer.android.com/training/location/retrieve-current.html>

使用Google Play services location APIs，我们的应用可以请求获得用户设备的最后可知位置。大多数情况下，我们会对用户的当前位置比较感兴趣。而通常用户的当前位置相当于设备的最后可知位置。

特别地，使用[fused location provider](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html)来获取设备的最后可知位置。fused location provider是Google Play services location APIs中的一个。它处理基本定位技术并提供一个简单的API，使得我们可以指定高水平的需求，如高精度或者低功耗。同时它优化了设备的耗电情况。

这节课介绍如何通过使用fused location provider的[getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient))方法为设备的位置构造一个单一请求。

## 安装Google Play Services
为了访问fused location provider，我们的应用开发工程必须包括Google Play services。通过[SDK Manager](http://developer.android.com/tools/help/sdk-manager.html)下载和安装Google Play services组件，添加相关的库到我们的工程。更详细的介绍，请看[Setting Up Google Play Services](http://developer.android.com/google/play-services/setup.html)。

## 确定应用的权限

使用位置服务的应用必须请求用户位置权限。Android拥有两种位置权限：[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION) 和 [ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)。我们选择的权限决定API返回的位置信息的精度。如果我们选择了[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION)，API返回的位置信息的精确度大体相当于一个城市街区。

这节课只要求粗略的定位。在我们应用的manifest文件中，用`uses-permission`节点请求这个权限，如下所示：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.gms.location.sample.basiclocationsample" >
  
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
</manifest>
```

## 连接Google Play Services

为了连接到API，我们需要创建一个Google Play services API客户端实例。关于使用这个客户端的更详细的介绍，请看[Accessing Google APIs](http://developer.android.com/google/auth/api-client.html#Starting)。

在我们的activity的[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))方法中，用[GoogleApiClient.Builder](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.Builder.html)创建一个Google API Client实例。使用这个builder添加[LocationServices](http://developer.android.com/reference/com/google/android/gms/location/LocationServices.html) API。

实例应用定义了一个`buildGoogleApiClient()`方法，这个方法在activity的onCreate()方法中被调用。`buildGoogleApiClient()`方法包括下面的代码。

```java
protected synchronized void buildGoogleApiClient() {
    mGoogleApiClient = new GoogleApiClient.Builder(this)
        .addConnectionCallbacks(this)
        .addOnConnectionFailedListener(this)
        .addApi(LocationServices.API)
        .build();
}
```

## 获取最后可知位置

一旦我们将Google Play services和location services API连接完成后，我们就可以获取用户设备的最后可知位置。当我们的应用连接到这些服务之后，我们可以用fused location provider的[getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient))方法来获取设备的位置。调用这个方法返回的定位精确度是由我们在应用的manifest文件里添加的权限决定的，如本文的[确定应用的权限]()部分描述的内容一样。

为了请求最后可知位置，调用[getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient))方法，并将我们创建的[GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html)对象的实例传给该方法。在Google API Client提供的[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle))回调函数里调用[getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient))方法，这个回调函数在client准备好的时候被调用。下面的示例代码说明了请求和一个对响应简单的处理：

```java
public class MainActivity extends ActionBarActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    @Override
    public void onConnected(Bundle connectionHint) {
        mLastLocation = LocationServices.FusedLocationApi.getLastLocation(
                mGoogleApiClient);
        if (mLastLocation != null) {
            mLatitudeText.setText(String.valueOf(mLastLocation.getLatitude()));
            mLongitudeText.setText(String.valueOf(mLastLocation.getLongitude()));
        }
    }
}
```

[getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient))方法返回一个[Location](http://developer.android.com/reference/android/location/Location.html)对象。通过[Location](http://developer.android.com/reference/android/location/Location.html)对象，我们可以取得地理位置的经度和纬度坐标。在少数情况下，当位置不可用时，这个Location对象会返回null。

下一课，[获取位置更新](receive-location-updates.html)，教你如何周期性地获取位置信息更新。

