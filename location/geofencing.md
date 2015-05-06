# 创建和监视地理围栏

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:<http://developer.android.com/training/location/geofencing.html>

地理围栏将用户当前位置感知和附件地点特征感知相结合。为了标示一个感兴趣的位置，我们需要指定这个位置的经纬度。为了调整位置的邻近度，需要添加一个半径。经纬度和半径定义一个地理围栏，即在感兴趣的位置创建一个圆形区域或者围栏。

我们可以有多个活动的地理围栏（限制是一个设备用户100个）。对于每个地理围栏，我们可以让 Location Services 发出进入和离开事件，或者我们可以在触发一个事件之前，指定在某个地理围栏区域等待一段时间或者停留。通过指定一个以毫秒为单位的截止时间，我们可以限制任何一个地理围栏的持续时间。当地理围栏失效后，Location Services 会自动删除这个地理围栏。

![geofence](geofence.png)

这节课介绍如何添加和删除地理围栏，和用 [IntentService](http://developer.android.com/reference/android/app/IntentService.html) 监听地理位置变化。

## 设置地理围栏监视

请求地理围栏监视的第一步就是设置必要的权限。在使用地理围栏时，我们必须设置 <a href="http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION">ACCESS\_FINE\_LOCATION</a> 权限。在应用的 manifest 文件中添加如下子节点即可：

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

如果想要用 [IntentService](http://developer.android.com/reference/android/app/IntentService.html) 监听地理位置变化，那么还需要添加一个节点来指定服务名字。这个节点必须是 [<application>](http://developer.android.com/guide/topics/manifest/application-element.html) 的子节点：

```xml
<application
   android:allowBackup="true">
   ...
   <service android:name=".GeofenceTransitionsIntentService"/>
<application/>
```

为了访问位置 API，我们需要创建一个 Google Play services API client 的实例。想要学习如何连接 client，请见[连接Google Play Services](retrieve-current.html)。

### 创建和添加地理围栏

我们的应用需要用位置 API 的 builder 类来创建地理围栏，用 convenience 类来添加地理围栏。另外，我们可以定义一个 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)（将在这节课介绍）来处理当地理位置发生迁移时，Location Services 发出的 intent。

### 创建地理围栏对象

首先，用 [Geofence.Builder](http://developer.android.com/reference/com/google/android/gms/location/Geofence.Builder.%20%20%20%20html) 创建一个地理围栏，设置想要的半径，持续时间，和地理围栏迁移的类型。例如，填充一个叫做 `mGeofenceList` 的 list 对象：

```java
mGeofenceList.add(new Geofence.Builder()
    // Set the request ID of the geofence. This is a string to identify this
    // geofence.
    .setRequestId(entry.getKey())

    .setCircularRegion(
            entry.getValue().latitude,
            entry.getValue().longitude,
            Constants.GEOFENCE_RADIUS_IN_METERS
    )
    .setExpirationDuration(Constants.GEOFENCE_EXPIRATION_IN_MILLISECONDS)
    .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER |
            Geofence.GEOFENCE_TRANSITION_EXIT)
    .build());
```

这个例子从一个固定的文件中获取数据。在实际情况下，应用可能会根据用户的位置动态地创建地理围栏。

### 指定地理围栏和初始化触发器

下面的代码用到 [GeofencingRequest](http://developer.android.com/reference/com/google/android/gms/location/GeofencingRequest.html) 类。该类嵌套了 [GeofencingRequestBuilder](http://developer.android.com/reference/com/google/android/gms/location/GeofencingRequest.Builder.html) 类来需要监视的地理围栏和设置如何触发地理围栏事件：

```java
private GeofencingRequest getGeofencingRequest() {
    GeofencingRequest.Builder builder = new GeofencingRequest.Builder();
    builder.setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER);
    builder.addGeofences(mGeofenceList);
    return builder.build();
}
```

这个例子介绍了两个地理围栏触发器。当设备进入一个地理围栏时， <a href="http://developer.android.com/reference/com/google/android/gms/location/Geofence.html#GEOFENCE_TRANSITION_ENTER">GEOFENCE\_TRANSITION\_ENTER</a> 转移会触发。当设备离开一个地理围栏时， <a href="http://developer.android.com/reference/com/google/android/gms/location/Geofence.html#GEOFENCE_TRANSITION_EXIT">GEOFENCE\_TRANSITION\_EXIT</a> 转移会触发。如果设备已经在地理围栏里面，那么指定 <a href="http://developer.android.com/reference/com/google/android/gms/location/GeofencingRequest.html#INITIAL_TRIGGER_ENTER">INITIAL\_TRIGGER\_ENTER</a> 来通知位置服务触发 <a href="http://developer.android.com/reference/com/google/android/gms/location/Geofence.html#GEOFENCE_TRANSITION_ENTER">GEOFENCE\_TRANSITION\_ENTER</a>。

在很多情况下，使用 <a href="http://developer.android.com/reference/com/google/android/gms/location/GeofencingRequest.html#INITIAL_TRIGGER_DWELL">INITIAL\_TRIGGER\_DWELL</a> 可能会更好。仅仅当由于到达地理围栏中已定义好的持续时间，而导致用户停止时，<a href="http://developer.android.com/reference/com/google/android/gms/location/GeofencingRequest.html#INITIAL_TRIGGER_DWELL">INITIAL\_TRIGGER\_DWELL</a> 才会触发事件。这个方法可以减少当设备短暂地进入和离开地理围栏时，由大量的通知造成的“垃圾警告信息”。另一种获取最好的地理围栏结果的策略是设置最小半径为100米。这有助于估计典型的 Wifi 网络的位置精确度，也有利于降低设备的功耗。

### 为地理围栏转移定义Intent

从 Location Services 发送来的Intent能够触发各种应用内的动作，但是不能用它来打开一个 Activity 或者 Fragment，这是因为应用内的组件只能在响应用户动作时才可见。大多数情况下，处理这一类 Intent 最好使用 [IntentService](http://developer.android.com/reference/android/app/IntentService.html)。一个 [IntentService](http://developer.android.com/reference/android/app/IntentService.html) 可以推送一个通知，可以进行长时间的后台作业，可以将 intent 发送给其他的 services ，还可以发送一个广播 intent。下面的代码展示了如何定义一个 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html) 来启动一个 [IntentService](http://developer.android.com/reference/android/app/IntentService.html):

```java
public class MainActivity extends FragmentActivity {
    ...
    private PendingIntent getGeofencePendingIntent() {
        // Reuse the PendingIntent if we already have it.
        if (mGeofencePendingIntent != null) {
            return mGeofencePendingIntent;
        }
        Intent intent = new Intent(this, GeofenceTransitionsIntentService.class);
        // We use FLAG_UPDATE_CURRENT so that we get the same pending intent back when
        // calling addGeofences() and removeGeofences().
        return PendingIntent.getService(this, 0, intent, PendingIntent.
                FLAG_UPDATE_CURRENT);
    }
```

### 添加地理围栏

使用 <a href="http://developer.android.com/reference/com/google/android/gms/location/GeofencingApi.html#addGeofences(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.location.GeofencingRequest, android.app.PendingIntent)">GeoencingApi.addGeofences()</a> 方法来添加地理围栏。为该方法提供 Google API client，[GeofencingRequest](http://developer.android.com/reference/com/google/android/gms/location/GeofencingRequest) 对象和 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)。下面的代码，在 [onResult()](http://developer.android.com/reference/com/google/android/gms/common/api/ResultCallback.html#onResult(R)) 中处理结果，假设主 activity 实现 [ResultCallback](http://developer.android.com/reference/com/google/android/gms/common/api/ResultCallback.html)。

```java
public class MainActivity extends FragmentActivity {
    ...
    LocationServices.GeofencingApi.addGeofences(
                mGoogleApiClient,
                getGeofencingRequest(),
                getGeofencePendingIntent()
        ).setResultCallback(this);
```

## 处理地理围栏转移

当 Location Services 探测到用户进入或者离开一个地理围栏，它会发送一个包含在 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html) 的 Intent，这个 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html) 就是在添加地理围栏时被我们包括在请求当中。这个 Intent 被一个类似 `GeofenceTransitionsIntentService` 的 service 接收，这个 service 从 intent 得到地理围栏事件，决定地理围栏转移的类型，和决定触发哪个已定义的地理围栏。然后它会发出一个通知。

下面的代码介绍了如何定义一个 IntentService。这个 IntentService 在地理围栏转移出现时，会推送一个通知。当用户点击这个通知，那么应用的主 activity 会出现：

```java
public class GeofenceTransitionsIntentService extends IntentService {
   ...
    protected void onHandleIntent(Intent intent) {
        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);
        if (geofencingEvent.hasError()) {
            String errorMessage = GeofenceErrorMessages.getErrorString(this,
                    geofencingEvent.getErrorCode());
            Log.e(TAG, errorMessage);
            return;
        }

        // Get the transition type.
        int geofenceTransition = geofencingEvent.getGeofenceTransition();

        // Test that the reported transition was of interest.
        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER ||
                geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {

            // Get the geofences that were triggered. A single event can trigger
            // multiple geofences.
            List triggeringGeofences = geofencingEvent.getTriggeringGeofences();

            // Get the transition details as a String.
            String geofenceTransitionDetails = getGeofenceTransitionDetails(
                    this,
                    geofenceTransition,
                    triggeringGeofences
            );

            // Send notification and log the transition details.
            sendNotification(geofenceTransitionDetails);
            Log.i(TAG, geofenceTransitionDetails);
        } else {
            // Log the error.
            Log.e(TAG, getString(R.string.geofence_transition_invalid_type,
                    geofenceTransition));
        }
    }
```

在通过 PendingIntent 检测转移事件之后，这个 IntentService 获取地理围栏转移类型和测试一个事件是不是应用用来触发通知的 —— 要么是 GEOFENCE_TRANSITION_ENTER，要么是 GEOFENCE_TRANSITION_EXIT。然后，这个 service 会发出一个通知并且记录转移的详细信息。

## 停止地理围栏监视

当不再需要监视地理围栏或者想要节省设备的电池电量和 CPU 周期时，需要停止地理围栏监视。我们可以在用于添加和删除地理围栏的主 activity 里停止地理围栏监视；删除地理围栏会导致它马上停止。API 要么通过 request IDs，要么通过删除与指定 PendingIntent 相关的地理围栏来删除地理围栏。

下面的代码通过 PendingIntent 删除地理围栏，当设备进入或者离开之前已经添加的地理围栏时，停止所有通知：

```java
LocationServices.GeofencingApi.removeGeofences(
            mGoogleApiClient,
            // This is the same pending intent that was used in addGeofences().
            getGeofencePendingIntent()
    ).setResultCallback(this); // Result processed in onResult().
}
```

你可以将地理围栏同其他位置感知的特性结合起来，比如周期性的位置更新。像要了解更多的信息，请看本章的其它课程。
