# 发送与接收消息

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/messages.html>

使用[MessageApi](MessageApi.html)发送消息，要附加以下几项：

* 任一payload(可选);
* 唯一确定的message's action 的 path。

不像数据元，Messages(消息)在手持和可穿戴应用之间没有同步。Messages是单向交流机制，这有利于远程进程调用(RPC)，比如：发送消息到可穿戴设备以开启activity。

## 发送消息

下面的例子展示如何发送消息到另一连接端开启一个activity。调用是同步的，当收到消息或请求超时时发生阻塞。

> **Note:** 阅读 [Communicate with Google Play Services](http://developer.android.com/google/auth/api-client.html#Communicating) 了解更多关于异步和同步调用，以及何时使用哪个。

```java
GoogleApiClient mGoogleApiClient;
public static final String START_ACTIVITY_PATH = "/start/MainActivity";
...

private void sendStartActivityMessage(String nodeId) {
    Wearable.MessageApi.sendMessage(
      mGoogleApiClient, nodeId, START_ACTIVITY_PATH, new byte[0]).setResultCallback(
          new ResultCallback<SendMessageResult>() {
              @Override
              public void onResult(SendMessageResult sendMessageResult) {
                  if (!sendMessageResult.getStatus().isSuccess()) {
                      Log.e(TAG, "Failed to send message with status code: "
                              + sendMessageResult.getStatus().getStatusCode());
                  }
              }
          }
      );
}
```

这是一个简单的方法，来获得一列你可能发送消息给它们的连接点：

```java
private Collection<String> getNodes() {
    HashSet <String>results = new HashSet<String>();
    NodeApi.GetConnectedNodesResult nodes =
            Wearable.NodeApi.getConnectedNodes(mGoogleApiClient).await();
    for (Node node : nodes.getNodes()) {
        results.add(node.getId());
    }
    return results;
}
```

## 接收消息

为了在收到消息时被提醒，你可以实现 [MessageListener](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.MessageListener.html)接口来提供消息事件的监听，你需要在 [MessageApi.addListener()](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.html#addListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.MessageApi.MessageListener))方法中注册监听。这个例子展示你可以通过检查 上例中发送消息时使用到的START_ACTIVITY_PATH的状态，若是true,特定的activity就会启动。

```java
@Override
public void onMessageReceived(MessageEvent messageEvent) {
    if (messageEvent.getPath().equals(START_ACTIVITY_PATH)) {
        Intent startIntent = new Intent(this, MainActivity.class);
        startIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(startIntent);
    }
}
```
这仅是实现更多细节的一小段，如何在service 或 activity 实现完整的监听，请参见 [Listening for Data Layer Events](http://developer.android.com/training/wearables/data-layer/events.html#Listen) 。


