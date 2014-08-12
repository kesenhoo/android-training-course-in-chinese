# 访问可穿戴数据层

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/accessing.html>

调用数据层API，需创建一个[GoogleApiClient](GoogleApiClient.html)实例，所有 Google Play services APIs的主要入口点。

[GoogleApiClient](GoogleApiClient.html) 提供了一个易于创建客户端实例的builder。最简单的[GoogleApiClient](GoogleApiClient.html)如下：

> **Note:** 目前，此client可以启动。但是，更多创建GoogleApiClient，实现回调方法和处理错误等内容，详见 [Accessing Google Play services APIs](api-client.html)。

```java
GoogleApiClient mGoogleAppiClient = new GoogleApiClient.Builder(this)
        .addConnectionCallbacks(new ConnectionCallbacks() {
                @Override
                public void onConnected(Bundle connectionHint) {
                    Log.d(TAG, "onConnected: " + connectionHint);
                    // Now you can use the data layer API
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
        .addApi(Wearable.API)
        .build();
```

在你使用数据层API之前，通过调用[connect()](GoogleApiClient.html#connect())方法进行连接，如 Accessing Google Play services APIs中所述。当系统为你的客户端调用了onConnected()方法，你就可以使用数据层API了。

