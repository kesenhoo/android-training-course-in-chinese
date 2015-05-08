# 获取位置更新

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:<http://developer.android.com/training/location/receive-location-updates.html>

如果我们的应用可以周期性地跟踪位置，那么应用可以给用户提供更多相关信息。例如，如果我们的应用在用户行走或者驾车时帮助找到他们的路，或者如果我们的应用跟踪用户的位置，那么它需要定期获取设备的位置。除了地理位置之外（经度和纬度），我们可能还想为用户提供更多的信息，例如方位（行驶的水平方向）、海拔或者设备的速度。这些信息可以在 [Location](http://developer.android.com/reference/android/location/Location.html) 对象中获得，我们的应用可以从 [fused location provider](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html) 中得到这个对象。

当我们用 [getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient)) 获取设备的位置时，如上一节课[获取最后可知位置](retrieve-current.html)介绍的一样，一个更加直接的方法是从 fused location provider 中请求周期性的更新。作为回应，API根据现有的位置供应源，如Wifi和GPS（Global Positioning System），用最佳位置周期地更新我们的应用。这些providers、我们请求的权限和我们在位置请求中设置的选项决定了位置的精确度。

这节课介绍如何用fused location provider的<a href="http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#requestLocationUpdates(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.LocationRequest, com.google.android.gms.location.LocationListener)">requestLocationUpdates()</a>方法来请求定期更新设备的位置。

## 连接Location Services

应用的 Location Services 由 Google Play services 和 fused location provider 提供。为了用这些服务，用 Google API Client 连接到我们的应用，然后请求位置更新。用 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 进行连接的详细步骤请见[获取最后可知位置](retrieve-current.html)，包括了请求当前位置。

设备的最后可知位置提供有关起点的基准信息，在开始定期更新位置信息前，保证应用拥有一个可知的位置。[获取最后可知位置](retrieve-current.html)介绍了如何通过调用 [getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient)) 获取最后可知位置。接下来的内容假设我们的应用已经取得最后可知位置，并已将最后可知位置作为一个 [Location](http://developer.android.com/reference/android/location/Location.html) 对象保存在全局变量 `mCurrentLocation`中。

使用位置服务的应用必须请求位置权限。在这节课中我们需要很好的定位检测，使得我们的应用可以从可用的位置供应源得到尽可能精确的位置数据。在我们应用的manifest文件中，用`uses-permission`节点请求位置权限，如下所示：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.gms.location.sample.locationupdates" >

  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
</manifest>
```

## 设置位置请求

创建一个 [LocationRequest](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html) 以保存请求 fused location provider 的参数。这些参数决定了请求精确度的水平。对于位置请求中所有可用的选项，请见 [LocationRequest](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html) 类的参考文档。这节课设置更新间隔、最快更新间隔和优先级。如下所述：

**更新间隔**

[setInterval()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setInterval(long)) - 这个方法设置应用接收位置更新的速率（每毫秒）。注意如果另一个应用正在接收一个更快的或者更慢的更新速率，又或者根本没有更新（例如，设备还没有连接），那么我们应用的位置更新速率可能会比`setInterval()`设置的速率更快。

**最快更新间隔**

[setFastestInterval()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setFastestInterval(long)) - 这个方法设置应用可以处理位置更新的**最快**速率（每毫秒）。因为其它应用会影响到已发送出去的位置更新的速率，所以我们需要设置这个最快速率。Google Play services location APIs 发送任何应用用 [setInterval()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setInterval(long)) 请求的最快的更新速率。如果这个速率比我们的应用可以处理的速率还要快，那么我们可能会遇到UI闪烁或者数据溢出等问题。为了避免这个问题，调用 [setFastestInterval()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setFastestInterval(long)) 限制更新速率的上限。

**优先级**

[setPriority()](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setPriority(int)) - 这个方法设置请求的优先级，为 Google Play services 位置服务提供了关于使用哪个位置源的强烈的暗示。支持下面几个值：

* <a href="http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_BALANCED_POWER_ACCURACY">PRIORITY\_BALANCED\_POWER\_ACCURACY</a> - 这个设置请求一个城市街区范围的位置精确度（精确度约为100米）。这被认为是一个粗略的精确度，也可能是耗电较小的设置。对于这个设置，位置服务可能使用 WiFi 和基站进行定位。注意，无论如何，位置供应源的选择依赖于很多其它的因素。

* <a href="http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_HIGH_ACCURACY">PRIORITY\_HIGH\_ACCURACY</a> - 这个设置请求最高精度的位置信息。对于这个设置，位置服务更可能使用 GPS(Global Positioning System) 来定位。

* <a href="http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_LOW_POWER"> PRIORITY\_LOW\_POWER</a> - 这个设置请求一个城市范围的精确度（精确度约为10公里）。这被认为是一个粗略的精确度，也可能是耗电较小的设置。

* <a href="http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_NO_POWER">PRIORITY\_NO\_POWER</a> - 如果需要对功率消耗的影响微乎其微，但又想在可用的时候接收位置更新，那么使用这个设置。对于这个设置，我们的应用不会触发任何位置更新，但是会接收由其它应用触发的位置。

下面的示例介绍创建位置请求和设置相关的参数：

```java
protected void createLocationRequest() {
    LocationRequest mLocationRequest = new LocationRequest();
    mLocationRequest.setInterval(10000);
    mLocationRequest.setFastestInterval(5000);
    mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
}
```

<a href="http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_HIGH_ACCURACY">PRIORITY\_HIGH\_ACCURACY</a> 的优先级联合在我们应用的 manifest 文件中定义的 <a href="http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION">ACCESS\_FINE\_LOCATION</a> 权限和一个5000毫秒（5秒）的更新间隔。该优先级使 fused location provider 返回精确到几英尺之内的位置更新。这个方法适用于需要实时显示位置的地图应用。

> **性能提示：**如果我们的应用在接收一个位置更新后接入网络或者执行持续时间长的工作，那么将最快更新间隔调整到一个更慢的值。这个调整防止我们的应用接收不可用的更新。一旦持续时间长的工作完成，将最快更新间隔改回一个快的值。

## 请求位置更新

我们已经设置了包含应用位置更新要求的位置请求，我们可以调用 <a href="http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#requestLocationUpdates(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.LocationRequest, com.google.android.gms.location.LocationListener)">requestLocationUpdates()</a> 来启动周期性的更新。在 Google API Client 提供的 [onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)) 回调函数（当 client 准备好之后会调用这个回调函数）中启动周期性更新。 

根据请求的形式，fused location provider 要么调用 [LocationListener.onLocationChanged()](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html) 回调函数并传递一个 [Location](http://developer.android.com/reference/android/location/Location.html) 对象，要么发出一个将位置信息包含在扩展数据的 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)。更新的精确度和频率受已请求的位置权限和在位置请求对象中设置的选项等因素影响。

这节课介绍如何使用 [LocationListener](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html) 回调函数获取位置更新。调用 <a href="http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#requestLocationUpdates(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.LocationRequest, com.google.android.gms.location.LocationListener)">requestLocationUpdates()</a> ,并传入 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 的实例、[LocationRequest](http://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html) 对象和一个 [LocationListener](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html)。定义一个 `startLocationUpdates()` 方法，该方法在 [onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)) 回调函数被调用，如下面的示例代码所示：

```java
@Override
public void onConnected(Bundle connectionHint) {
    ...
    if (mRequestingLocationUpdates) {
        startLocationUpdates();
    }
}

protected void startLocationUpdates() {
    LocationServices.FusedLocationApi.requestLocationUpdates(
            mGoogleApiClient, mLocationRequest, this);
}
```

注意到上述的代码片段提到一个布尔标志位，`mRequestingLocationUpdates`，该标志位用于判断用户将位置更新打开还是关闭。关于这个标志位更详细的介绍，请见下面的[保存 Activity 的状态]()的内容。

## 定义位置更新回调函数

fused location provider 调用 [LocationListener.onLocationChanged()](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html#onLocationChanged(android.location.Location)) 回调函数。这个回调函数传入的参数是一个含有位置经纬度的 [Location](http://developer.android.com/reference/android/location/Location.html) 对象。下面的代码介绍了如何实现 [LocationListener](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html) 接口和定义方法，然后获取位置更新的时间戳并在应用用户界面上显示经度、纬度和时间戳：

```java
public class MainActivity extends ActionBarActivity implements
        ConnectionCallbacks, OnConnectionFailedListener, LocationListener {
    ...
    @Override
    public void onLocationChanged(Location location) {
        mCurrentLocation = location;
        mLastUpdateTime = DateFormat.getTimeInstance().format(new Date());
        updateUI();
    }

    private void updateUI() {
        mLatitudeTextView.setText(String.valueOf(mCurrentLocation.getLatitude()));
        mLongitudeTextView.setText(String.valueOf(mCurrentLocation.getLongitude()));
        mLastUpdateTimeTextView.setText(mLastUpdateTime);
    }
}
```

## 停止位置更新

我们需要考虑当 activity 不在焦点上时我们是否需要停止位置更新，例如，当用户切换到另一个应用或者同一个应用的不同 activity 的情况。假如应用即使在后台运行时也不需要收集用户数据，将会有利于降低功耗。这节课会介绍如何在 activity 的 [onPause()](http://developer.android.com/reference/android/app/Activity.html#onPause()) 方法里停止位置更新。

为了停止位置更新，调用 <a href="http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#removeLocationUpdates(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.LocationListener)">removeLocationUpdates()</a>，并传入 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 对象的实例和一个 [LocationListener](http://developer.android.com/reference/com/google/android/gms/location/LocationListener.html)，如下面的示例代码所示：

```java
@Override
protected void onPause() {
    super.onPause();
    stopLocationUpdates();
}

protected void stopLocationUpdates() {
    LocationServices.FusedLocationApi.removeLocationUpdates(
            mGoogleApiClient, this);
}
```

使用一个布尔值，`mRequestingLocationUpdates`，来判断当前位置更新是否打开。在 activity 的 [onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume()) 方法里，检查当前的位置更新是否起作用。如果位置更新不起作用，那么激活它：

```java
@Override
public void onResume() {
    super.onResume();
    if (mGoogleApiClient.isConnected() && !mRequestingLocationUpdates) {
        startLocationUpdates();
    }
}
```

## 保存 Activity 的状态

一个设备配置的变动，如旋转屏幕或者改变语言，可以导致当前的 activity 崩溃。我们的应用必须保存任何在重新创建 activity 时需要用到的信息。一种方法是通过一个保存在 [Bundle](http://developer.android.com/reference/android/os/Bundle.html) 对象的实例状态来解决这个问题。

下面的示例代码介绍了如何用 activity 的 [onSaveInstanceState()](http://developer.android.com/reference/android/app/Activity.html#onSaveInstanceState(android.os.Bundle)) 回调函数来保存实例状态：

```java
public void onSaveInstanceState(Bundle savedInstanceState) {
    savedInstanceState.putBoolean(REQUESTING_LOCATION_UPDATES_KEY,
            mRequestingLocationUpdates);
    savedInstanceState.putParcelable(LOCATION_KEY, mCurrentLocation);
    savedInstanceState.putString(LAST_UPDATED_TIME_STRING_KEY, mLastUpdateTime);
    super.onSaveInstanceState(savedInstanceState);
}
```

定义一个 `updateValuesFromBundle()` 方法来恢复保存在 activity 的上一个实例的值（如果这些值可用的话）。在 [onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)) 中调用这个方法。如下所示：

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    ...
    updateValuesFromBundle(savedInstanceState);
}

private void updateValuesFromBundle(Bundle savedInstanceState) {
    if (savedInstanceState != null) {
        // Update the value of mRequestingLocationUpdates from the Bundle, and
        // make sure that the Start Updates and Stop Updates buttons are
        // correctly enabled or disabled.
        if (savedInstanceState.keySet().contains(REQUESTING_LOCATION_UPDATES_KEY)) {
            mRequestingLocationUpdates = savedInstanceState.getBoolean(
                    REQUESTING_LOCATION_UPDATES_KEY);
            setButtonsEnabledState();
        }

        // Update the value of mCurrentLocation from the Bundle and update the
        // UI to show the correct latitude and longitude.
        if (savedInstanceState.keySet().contains(LOCATION_KEY)) {
            // Since LOCATION_KEY was found in the Bundle, we can be sure that
            // mCurrentLocationis not null.
            mCurrentLocation = savedInstanceState.getParcelable(LOCATION_KEY);
        }

        // Update the value of mLastUpdateTime from the Bundle and update the UI.
        if (savedInstanceState.keySet().contains(LAST_UPDATED_TIME_STRING_KEY)) {
            mLastUpdateTime = savedInstanceState.getString(
                    LAST_UPDATED_TIME_STRING_KEY);
        }
        updateUI();
    }
}
```

更多关于保存实例状态的内容，请看 [Android Activity](http://developer.android.com/reference/android/app/Activity.html#ConfigurationChanges) 类的参考文档。

> **Note：**为了可以更加持久地存储，我们可以将用户的偏好设定保存在应用的 [SharedPreferences](http://developer.android.com/reference/android/content/SharedPreferences.html) 中。在 activity 的 [onPause()](http://developer.android.com/reference/android/app/Activity.html#onPause()) 方法中设置偏好设定，在 [onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume()) 中获取这些设定。更多关于偏好设定的内容，请见[保存到 Rreference](http://hukai.me/android-training-course-in-chinese/basics/data-storage/shared-preference.html)。

下一节课，[显示位置地址](display-address.html)，介绍如何显示指定位置的街道地址。