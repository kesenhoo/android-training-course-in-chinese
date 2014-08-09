# 发送与接收消息

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/messages.html>

使用[MessageApi](MessageApi.html)发送消息，要附加以下几项：

* 任一payload(可选);
* 唯一确定消息action的path。

不像数据元，消息在手持设备和可穿戴应用之间没有同步Messages是单向交流机制，意味着 "fire-and-forget" tasks，比如：发送消息到可穿戴设备以开启activity。也可以用请求/回应的模式，一连接端发送消息，完成任务，传回响应消息。

## 发送消息

下面的例子展示如何发送消息到另一连接端开启一个activity。调用是同步的，当收到消息或请求超时时发生阻塞。

> **Note:** 阅读 [Communicate with Google Play Services](api-client.html#Communicating) 了解更多关于异步和同步调用，以及何时使用哪个。

```java
Node node; // the connected device to send the message to
GoogleApiClient mGoogleApiClient;
public static final START_ACTIVITY_PATH = "/start/MainActivity";
...

    SendMessageResult result = Wearable.MessageApi.sendMessage(
            mGoogleApiClient, node, START_ACTIVITY_PATH, null).await();
    if (!result.getStatus().isSuccess()) {
        Log.e(TAG, "ERROR: failed to send Message: " + result.getStatus());
    }
```

这是一个简单的方法获得一列你可能发送消息的节点：

```java
private Collection<String> getNodes() {
    HashSet <String>results= new HashSet<String>();
    NodeApi.GetConnectedNodesResult nodes =
            Wearable.NodeApi.getConnectedNodes(mGoogleApiClient).await();
    for (Node node : nodes.getNodes()) {
        results.add(node.getId());
    }
    return results;
}
```

## 接收消息

如要在收到消息时被提醒，需要实现消息事件的监听。这个例子展示你可以通过检查 上例中发送消息时使用到的START_ACTIVITY_PATH的状态，若是true,特定的activity就会启动。

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


