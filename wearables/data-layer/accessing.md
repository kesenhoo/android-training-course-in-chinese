﻿# 访问可穿戴数据层

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/accessing.html>

调用数据层API，需创建一个 [GoogleApiClient](GoogleApiClient.html) 实例，所有 Google Play services APIs的主要入口点。

[GoogleApiClient](GoogleApiClient.html) 提供了一个易于创建客户端实例的builder。最简单的[GoogleApiClient](GoogleApiClient.html)如下：

> **Note:** 目前，此小client仅足以能启动。但是，更多创建GoogleApiClient，实现回调方法和处理错误等内容，详见 [Accessing Google Play services APIs](api-client.html)。

```java
GoogleApiClient mGoogleApiClient = new GoogleApiClient.Builder(this)
        .addConnectionCallbacks(new ConnectionCallbacks() {
                @Override
                public void onConnected(Bundle connectionHint) {
                    Log.d(TAG, "onConnected: " + connectionHint);
                    // 现在你可以使用Data Layer API 了
                }
                @Override
                public void onConnectionSuspended(int cause) {
                    Log.d(TAG, "onConnectionSuspended: " + cause);
                }
        })
        .addOnConnectionFailedListener(new OnConnectionFailedListener() {
                @Override
                public void onConnectionFailed(ConnectionResult result) {
                    Log.d(TAG, "onConnectionFailed: " + result);
                }
            })
        // 请求只访问 Wearable API
        .addApi(Wearable.API)
        .build();
```

>**Important:**为了避免在并没有安装 [Android Wear app ](https://play.google.com/store/apps/details?id=com.google.android.wearable.app&hl=en) 的设备上，客户端连接失败，请使用独立的[GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 实例来仅访问 [Wearable](http://developer.android.com/reference/com/google/android/gms/wearable/Wearable.html) API。更多的信息，请参见 [Access the Wearable API](http://developer.android.com/google/auth/api-client.html#WearableApi).

在你使用数据层API之前，通过调用[connect()](GoogleApiClient.html#connect())方法进行连接，如 [Start a Connection](http://developer.android.com/google/auth/api-client.html#Starting)中所述。当系统为你的客户端调用了[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)) 方法，你就可以使用数据层API了。

