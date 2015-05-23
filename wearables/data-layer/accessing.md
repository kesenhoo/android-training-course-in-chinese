# 访问可穿戴数据层

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/accessing.html>

调用数据层API，需创建一个 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 实例，所有 Google Play services APIs的主要入口点。

[GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html) 提供了一个易于创建客户端实例的builder。最简单的[GoogleApiClient](GoogleApiClient.html)如下：

> **Note:** 目前，此小client仅足以能启动。但是，更多创建GoogleApiClient，实现回调方法和处理错误等内容，详见 [Accessing Google Play services APIs](http://developer.android.com/google/auth/api-client.html)。

```java
GoogleApiClient mGoogleApiClient = new GoogleApiClient.Builder(this)
        .addConnectionCallbacks(new ConnectionCallbacks() {
                @Override
                public void onConnected(Bundle connectionHint) {
                    Log.d(TAG, "onConnected: " + connectionHint);
                    // Now you can use the Data Layer API
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
        // Request access only to the Wearable API
        .addApi(Wearable.API)
        .build();
```

> **Important:** 如果我们添加多个API到一个GoogleApiClient，那么可能会在没有安装[Android Wear app ](https://play.google.com/store/apps/details?id=com.google.android.wearable.app&hl=en) 的设备上遇到连接错误。为了连接错误，调用<a href="http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.Builder.html#addApiIfAvailable(com.google.android.gms.common.api.Api<? extends com.google.android.gms.common.api.Api.ApiOptions.NotRequiredOptions>, com.google.android.gms.common.api.Scope...)">addApiIfAvailable()</a>方法，并以[Wearable](http://developer.android.com/reference/com/google/android/gms/wearable/Wearable.html) API为参数传进该方法，从而表明client应该处理缺失的API。更多的信息，请见 [Access the Wearable API](http://developer.android.com/google/auth/api-client.html#WearableApi).

在使用数据层API之前，通过调用[connect()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html#connect())方法进行连接，如 [Start a Connection](http://developer.android.com/google/auth/api-client.html#Starting) 中所述。当系统为我们的客户端调用了[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)) 方法，我们就可以使用数据层API了。

