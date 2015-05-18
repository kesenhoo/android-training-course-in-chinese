# 发送与接收消息

> 编写:[wly2014](https://github.com/wly2014) - 原文: <http://developer.android.com/training/wearables/data-layer/messages.html>

使用[MessageApi](MessageApi.html)发送消息，要附加以下几项：

* 任一payload（可选）
* 唯一标识消息动作的路径

不像数据元，Messages（消息）在手持和可穿戴应用之间没有同步。Messages是单向交流机制，这有利于远程进程调用(RPC)，比如：发送消息到可穿戴设备以开启activity。

多个可穿戴设备可以连接到一台用户的手持设备。在网络中每个已连接的设备被视为一个*节点*（*node*）。由于有多个已连接的设备，我们必须考虑哪个节点收到消息。例如，在一个在可穿戴设备上接收语音数据的语音转录应用中，我们应该发送消息到一个具有处理能力和电池容量的节点来处理请求，例如一个手持式设备。

> **Note:** Google Play services 7.3.0版之前，一次只有一个可穿戴设备可以连接到手持设备。我们需要将现有的代码升级，以考虑到多个连接节点的功能。如果我们不作出修改，那么我们的消息可能不会传到想要的设备。

## 发送消息

一个可穿戴应用可以为用户提供如语音转录等功能。用户可以对着他们可穿戴设备的麦克风说话，然后就会将语音保存成一个笔记。由于一个可穿戴设备通常没有足够的处理能力和电池容量来处理语音转录activity，所以应用应该将这个工作留给一个更加有能力的、已连接的设备来处理。

下面几个小节介绍如何通知那些可以处理activity请求的设备节点，发现有能力满足请求的节点，并发送消息给那些节点。

### 通知节点功能

使用 [MessageApi](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.html) 类发送请求，来从一个可穿戴设备启动一个手持设备的activity。由于一个手持式设备可以连接多个可穿戴设备，所以可穿戴应用需要确定一个已连接的节点是否有能力启动activity。在我们的手持式应用中，通知其它节点：我们的手持式应用所在的节点提供了上述指定的功能。

为了把我们的手持式应用的功能通知其它节点，需要：

1. 在工程的 `res/values/` 目录下创建一个名为 `wear.xml` 的 XML 文件。
2. 在 `wear.xml` 文件中添加一个名为 `android_wear_capabilities` 的资源。
3. 定义设备可以提供的功能。

> **Note:** 功能是我们自定义的字符串，它在我们的应用中必须是唯一的。

下面这个例子介绍了如何将一个名为 `voice_transcription` 的功能添加到 `wear.xml`中：

```xml
<resources>
    <string-array name="android_wear_capabilities">
        <item>voice_transcription</item>
    </string-array>
</resources>
```

### 检索具有相关功能的节点

首先，我们可以通过调用 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/CapabilityApi.html#getCapability(com.google.android.gms.common.api.GoogleApiClient, java.lang.String, int)">CapabilityApi.getCapability()</a> 方法来检测具有相关功能的节点。下面的例子介绍了如何手动检索具有 `voice_transcription` 功能的节点：

```java
private static final String
        VOICE_TRANSCRIPTION_CAPABILITY_NAME = "voice_transcription";

private GoogleApiClient mGoogleApiClient;

...

private void setupVoiceTranscription() {
    CapabilityApi.GetCapabilityResult result =
            Wearable.CapabilityApi.getCapability(
                    mGoogleApiClient, VOICE_TRANSCRIPTION_CAPABILITY_NAME,
                    CapabilityApi.FILTER_REACHABLE).await();

    updateTranscriptionCapability(result.getCapability());
}
```

为了在连接到可穿戴设备的时候检测有能力的节点，注册一个 [CapabilityApi.CapabilityListener()](http://developer.android.com/reference/com/google/android/gms/wearable/CapabilityApi.CapabilityListener.html) 实例到 [GoogleApiClient](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.html)。下面的例子介绍了如何注册该监听器和检索具有 `voice_transcription` 功能的节点。

```java
private void setupVoiceTranscription() {
    ...

    CapabilityApi.CapabilityListener capabilityListener =
            new CapabilityApi.CapabilityListener() {
                @Override
                public void onCapabilityChanged(CapabilityInfo capabilityInfo) {
                    updateTranscriptionCapability(capabilityInfo);
                }
            };

    Wearable.CapabilityApi.addCapabilityListener(
            mGoogleApiClient,
            capabilityListener,
            VOICE_TRANSCRIPTION_CAPABILITY_NAME);
}
```

> **Note:** 如果我们创建一个继承 [WearableListenerService](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html) 的 service 来检测功能的变化，我们可能要重写 [onConnectedNodes()](http://developer.android.com/reference/com/google/android/gms/wearable/WearableListenerService.html#onConnectedNodes(java.util.List<com.google.android.gms.wearable.Node>)) 方法来监听细微的连接细节，例如，一个可穿戴设备与手持式设备从Wi-Fi连接切换到蓝牙连接。关于一个实现的例子，请查看在 [FindMyPhone](https://github.com/googlesamples/android-FindMyPhone/) 示例中的 `DisconnectListenerService` 类。更多关于如何监听重要事件的内容，请见[监听数据层事件](events.html#Listen)。

检测到有能力的节点之后，需要确定将消息发送到哪里。我们需要选择与可穿戴设备邻近的节点，这样可以最小化多个节点间的消息路由。一个邻近的节点被定义为一个直接与设备连接的节点。调用 [Node.isNearby()](http://developer.android.com/reference/com/google/android/gms/wearable/Node.html#isNearby()) 来确定一个节点是否是邻近的。

下面的例子介绍了如何确定最佳节点：

```java
private String transcriptionNodeId = null;

private void updateTranscriptionCapability(CapabilityInfo capabilityInfo) {
    Set<Node> connectedNodes = capabilityInfo.getNodes();

    transcriptionNodeId = pickBestNodeId(connectedNodes);
}

private String pickBestNodeId(Set<Node> nodes) {
    String bestNodeId = null;
    // Find a nearby node or pick one arbitrarily
    for (Node node : nodes) {
        if (node.isNearby()) {
            return node.getId();
         }
         bestNodeId = node.getId();
    }
    return bestNodeId;
}
```

### 传送消息

一旦我们确定了最佳节点，使用 [MessageApi](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.html) 发送消息。

下面的例子介绍了如何从一个可穿戴设备发送消息到具有语音转录功能的节点。在我们试图发送消息之前，需要判断节点是否可用。这个调用是同步的，它在系统将传送的消息放到队列前会一直阻塞。

> **Note:** 一个成功结果码并不保证消息是否传送成功。如果我们的应用需要数据的可靠性，那么使用 [DataItem](http://developer.android.com/reference/com/google/android/gms/wearable/DataItem.html) 对象或者 [ChannelApi](http://developer.android.com/reference/com/google/android/gms/wearable/ChannelApi.html) 类在设备间发送数据。

```java
public static final String VOICE_TRANSCRIPTION_MESSAGE_PATH = "/voice_transcription";

private void requestTranscription(byte[] voiceData) {
    if (transcriptionNodeId != null) {
        Wearable.MessageApi.sendMessage(googleApiClient, transcriptionNodeId,
            VOICE_TRANSCRIPTION_MESSAGE_PATH, voiceData).setResultCallback(
                  new ResultCallback() {
                      @Override
                      public void onResult(SendMessageResult sendMessageResult) {
                          if (!sendMessageResult.getStatus().isSuccess()) {
                              // Failed to send message
                          }
                      }
                  }
            );
    } else {
        // Unable to retrieve node with transcription capability
    }
}
```
> **Note:** 阅读 [Communicate with Google Play Services](http://developer.android.com/google/auth/api-client.html#Communicating) 了解更多关于异步和同步调用，以及何时使用哪个。

我们还可以广播消息给所有已连接的节点。为了获得我们可以发送消息的已连接节点，需要实现下面的代码：

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

为了在收到消息时被提醒，我们可以实现 [MessageListener](http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.MessageListener.html) 接口来提供消息事件的监听。然后，我们需要在 <a href="http://developer.android.com/reference/com/google/android/gms/wearable/MessageApi.html#addListener(com.google.android.gms.common.api.GoogleApiClient, com.google.android.gms.wearable.MessageApi.MessageListener)">MessageApi.addListener()</a> 方法中注册监听。这个例子展示如何通过检查 `VOICE_TRANSCRIPTION_MESSAGE_PATH` 来实现监听器。如果该条件是true，就会启动特定的activity来处理语音数据。

```java
@Override
public void onMessageReceived(MessageEvent messageEvent) {
    if (messageEvent.getPath().equals(VOICE_TRANSCRIPTION_MESSAGE_PATH)) {
        Intent startIntent = new Intent(this, MainActivity.class);
        startIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startIntent.putExtra("VOICE_DATA", messageEvent.getData());
        startActivity(startIntent);
    }
}
```

这仅是实现更多细节的一小段。关于如何在 service 或 activity 实现完整的监听，请参见 [监听数据传输层事件](events.html#Listen) 。


