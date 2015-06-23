# 使用Google Cloud Messaging（已废弃）

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/cloudsync/gcm.html>

谷歌云消息（GCM）是一个用来给Android设备发送消息的免费服务，它可以极大地提升用户体验。利用GCM消息，你的应用可以一直保持更新的状态，同时不会使你的设备在服务器端没有可用更新时，唤醒无线电并对服务器发起轮询（这会消耗大量的电量）。同时，GCM可以让你最多一次性将一条消息发送给1,000个人，使得你可以在恰当地时机很轻松地联系大量的用户，同时大量地减轻你的服务器负担。

这节课将包含一些把GCM集成到应用中的最佳实践方法，前提是假定你已经对该服务的基本实现有了一个了解。如果不是这样的话，你可以先阅读一下：[GCM demo app tutorial](http://developer.android.com/google/gcm/demo.html)。

## 高效地发送多播消息

一个GCM最有用的特性之一是单条消息最多可以发送给1,000个接收者。这个功能可以更加简单地将重要消息发送给你的所有用户群体。例如，比方说你有一条消息需要发送给1,000,000个人，而你的服务器每秒能发送500条消息。如果你的每条消息只能发送给一个接收者，那么整个消息发送过程将会耗时1,000,000/500=2,000秒，大约半小时。然而，如果一条消息可以一次性地发送给1,000个人的话，那么耗时将会是(1,000,000/1,000)/500=2秒。这不仅仅体现出了GCM的实用性，同时对于一些实时消息而言，其重要性也是不言而喻的。就比如灾难预警或者体育比分播报，如果延迟了30分钟，消息的价值就大打折扣了。

想要利用这一功能非常简单。如果你使用的是Java语言版本的[GCM helper library](http://developer.android.com/google/gcm/gs.html#libs)，只需要向`send`或者`sendNoRetry`方法提供一个注册ID的List就行了（不要只给单个的注册ID）：

```java
// This method name is completely fabricated, but you get the idea.
List regIds = whoShouldISendThisTo(message);

// If you want the SDK to automatically retry a certain number of times, use the
// standard send method.
MulticastResult result = sender.send(message, regIds, 5);

// Otherwise, use sendNoRetry.
MulticastResult result = sender.sendNoRetry(message, regIds);
```

如果想用除了Java之外的语言实现GCM支持，可以构建一个带有下列头部信息的HTTP POST请求：

```
Authorization: key=YOUR_API_KEY
Content-type: application/json
```

之后将你想要使用的参数编码成一个JSON对象，列出所有在`registration_ids`这个Key下的注册ID。下面的代码片段是一个例子。除了`registration_ids`之外的所有参数都是可选的，在`data`内的项目代表了用户定义的载荷数据，而非GCM定义的参数。这个HTTP POST消息将会发送到：`https://android.googleapis.com/gcm/send`：

```
{ "collapse_key": "score_update",
   "time_to_live": 108,
   "delay_while_idle": true,
   "data": {
       "score": "4 x 8",
       "time": "15:16.2342"
   },
   "registration_ids":["4", "8", "15", "16", "23", "42"]
}
```
关于更多GCM多播消息的格式，可以阅读：[Sending Messages](http://developer.android.com/google/gcm/gcm.html#send-msg)。

## 对可替换的消息执行折叠

GCM经常被用作为一个触发器，它告诉移动应用向服务器发起链接并更新数据。在GCM中，可以（也推荐）在新消息要替代旧消息时，使用可折叠的消息（Collapsible Messages）。我们用体育比赛作为例子，如果你向所有用户发送了一条包含了当前比赛比分的消息，15分钟之后，又发送了一条消息更新比分，那么第一条消息就没有意义了。对于那些还没有收到第一条消息的用户，就没有必要将这两条消息全部接收下来，何况如果要接收两条消息，那么设备不得不进行两次响应（比如对用户发出通知或警告），但实际上两条消息中只有一条是重要的。

当你定义了一个折叠Key，此时如果有多个消息在GCM服务器中，以队列的形式等待发送给同一个用户，那么只有最后的那一条消息会被发出。对于之前所说的体育比分的例子，这样做能让设备免于处理不必要的任务，也不会让设备对用户造成太多打扰。对于其他的一些场景比如与服务器同步数据（检查邮件接收），这样做的话可以减少设备需要执行同步的次数。例如，如果有10封邮件在服务器中等待被接收，并且有10条GCM消息发送到设备提醒它有新的邮件，那么实际上只需要一个GCM就够了，因为设备可以一次性把10封邮件都同步了。

为了使用这一特性，只需要在你要发出的消息中添加一个消息折叠Key。如果你在使用[GCM helper library](http://developer.android.com/google/gcm/gs.html#libs)，那么就使用Message类的`collapseKey(String key)`方法。

```java
Message message = new Message.Builder(regId)
    .collapseKey("game4_scores") // The key for game 4.
    .ttl(600) // Time in seconds to keep message queued if device offline.
    .delayWhileIdle(true) // Wait for device to become active before sending.
    .addPayload("key1", "value1")
    .addPayload("key2", "value2")
    .build();
```

如果你没有使用[GCM helper library](http://developer.android.com/google/gcm/gs.html#libs)，那么就直接在你要构建的POST头部中添加一个字段。将`collapse_key`作为字段名，并将Key的名称作为该字段的值。

## 在GCM消息中嵌入数据


通常， GCM消息被用作为一个触发器，或者用来告诉设备，在服务器或者别的地方有一些待更新的数据。然而，一条GCM消息的大小最大可以有4kb，因此，有时候可以在GCM消息中放置一些简单的数据，这样的话设备就不需要再去和服务器发起连接了。在下列条件都满足的情况下，我们可以将数据放置在GCM消息中：

* 数据的总大小在4kb以内。
* 每一条消息都很重要，且需要保留。
* 这些消息不适用于消息折叠的使用情形。

例如，短消息或者回合制网游中玩家的移动数据等都是将数据直接嵌入在GCM消息中的例子。而电子邮件就是反面例子了，因为电子邮件的数据量一般都大于4kb，而且用户一般不需要对每一封新邮件都收到一个GCM提醒的消息。

同时在发送多播消息时，也可以考虑这一方法，这样的话就不会导致大量用户在接收到GCM的更新提醒后，同时向你的服务器发起连接。

这一策略不适用于发送大量的数据，有这么一些原因：

* 为了防止恶意软件发送垃圾消息，GCM有发送频率的限制。
* 无法保证消息按照既定的发送顺序到达。
* 无法保证消息可以在你发送后立即到达。假设设备每一秒都接收一条消息，消息的大小限制在1K，那么传输速率为8kbps，或者说是1990年代的家庭拨号上网的速度。那么如此大量的消息，一定会让你的应用在Google Play上的评分非常尴尬。

如果恰当地使用，直接将数据嵌入到GCM消息中，可以加速你的应用的“感知速度”，因为这样一来它就不必再去服务器获取数据了。

## 智能地响应GCM消息

你的应用不应该仅仅对收到的GCM消息进行响应就够了，还应该响应地更智能一些。至于如何响应需要结合具体情况而定。

**不要太过激进**

当提醒用户去更新数据时，很容易不小心从“有用的消息”变成“干扰消息”。如果你的应用使用状态栏通知，那么应该[更新现有的通知](http://developer.android.com/guide/topics/ui/notifiers/notifications.html#Updating)，而不是创建第二个。如果你通过铃声或者震动的方式提醒用户，一定要设置一个计时器。不要让应用每分钟的提醒频率超过1次，不然的话用户很可能会不堪其扰而卸载你的应用，关机，甚至把手机扔到河里。

**用聪明的办法同步数据，别用笨办法**

当使用GCM告知设备有数据需要从服务器下载时，记住你有4kb大小的数据可以和消息一起发出，这可以帮助你的应用做出更智能的响应。例如，如果你有一个支持订阅的阅读应用，而你的用户订阅了100个源，那么这就可以帮助你的应用更智能地决定应该去服务器下载什么数据。下面的例子说明了在GCM载荷中可以发送什么样的数据，以及设备可以做出什么样的反应：

* `refresh` - 你的应用被告知向每一个源请求数据。此时你的应用可以向100个不同的服务器发起获取订阅内容的请求，或者如果你在服务器上有一个聚合服务，那么可以只发送一个请求，将100个源的数据进行打包并让设备获取，这样一次性就完成更新。
* `refresh, freshID` - 一种更好的解决方案，你的应用可以有针对性的完成更新。
* `refresh, freshID, timestamp` - 三种方案中最好的，如果正好用户在收到GCM消息之前手动做了更新，那么应用可以利用时间戳和当前的更新时间进行对比，并决定是否有必要执行下一步的行动。
