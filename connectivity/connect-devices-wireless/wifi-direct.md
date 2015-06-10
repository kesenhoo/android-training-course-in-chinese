# 使用 WiFi 建立 P2P 连接

> 编写:[naizhengtan](https://github.com/naizhengtan) - 原文:<http://developer.android.com/training/connect-devices-wirelessly/wifi-direct.html>

Wi-Fi 点对点（P2P）API 允许应用程序在无需连接到网络和热点的情况下连接到附近的设备。（Android Wi-Fi P2P 使用 [Wi-Fi Direct™](http://www.wi-fi.org/discover-and-learn/wi-fi-direct) 验证程序进行编译）。Wi-Fi P2P 技术使得应用程序可以快速发现附近的设备并与之交互。相比于蓝牙技术，Wi-Fi P2P 的优势是具有较大的连接范围。

本节主要内容是使用 Wi-Fi P2P 技术发现并连接到附近的设备。

## 配置应用权限

使用 Wi-Fi P2P 技术，需要添加 [CHANGE_WIFI_STATE](http://developer.android.com/reference/android/Manifest.permission.html#CHANGE_WIFI_STATE)，[ACCESS_WIFI_STATE](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_WIFI_STATE) 以及 [INTERNET](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET) 三种权限到应用的 manifest 文件。Wi-Fi P2P 技术虽然不需要访问互联网，但是它会使用标准的 Java socket（需要 [INTERNET](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET) 权限）。下面是使用 Wi-Fi P2P 技术需要申请的权限。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.android.nsdchat"
    ...

    <uses-permission
        android:required="true"
        android:name="android.permission.ACCESS_WIFI_STATE"/>
    <uses-permission
        android:required="true"
        android:name="android.permission.CHANGE_WIFI_STATE"/>
    <uses-permission
        android:required="true"
        android:name="android.permission.INTERNET"/>
    ...
```

## 设置广播接收器（BroadCast Receiver）和 P2P 管理器

使用 Wi-Fi P2P 的时候，需要侦听当某个事件出现时发出的broadcast intent。在应用中，实例化一个 [IntentFilter](http://developer.android.com/reference/android/content/IntentFilter.html)，并将其设置为侦听下列事件：

[WIFI_P2P_STATE_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_STATE_CHANGED_ACTION)

　　指示　Wi-Fi P2P　是否开启

[WIFI_P2P_PEERS_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_PEERS_CHANGED_ACTION)

　　代表对等节点（peer）列表发生了变化

[WIFI_P2P_CONNECTION_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_CONNECTION_CHANGED_ACTION)

　　表明Wi-Fi P2P的连接状态发生了改变

[WIFI_P2P_THIS_DEVICE_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_THIS_DEVICE_CHANGED_ACTION)

　　指示设备的详细配置发生了变化

```java
private final IntentFilter intentFilter = new IntentFilter();
...
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);

    //  Indicates a change in the Wi-Fi P2P status.
    intentFilter.addAction(WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION);

    // Indicates a change in the list of available peers.
    intentFilter.addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION);

    // Indicates the state of Wi-Fi P2P connectivity has changed.
    intentFilter.addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION);

    // Indicates this device's details have changed.
    intentFilter.addAction(WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION);

    ...
}
```

在　<a href="http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)">onCreate()</a>　方法的最后，需要获得　[WifiPpManager](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html)　的实例，并调用它的　<a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#initialize(android.content.Context, android.os.Looper, android.net.wifi.p2p.WifiP2pManager.ChannelListener)">initialize()</a> 方法。该方法将返回 [WifiP2pManager.Channel](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.Channel.html) 对象。
我们的应用将在后面使用该对象连接 Wi-Fi P2P 框架。

```java
@Override

Channel mChannel;

public void onCreate(Bundle savedInstanceState) {
    ....
    mManager = (WifiP2pManager) getSystemService(Context.WIFI_P2P_SERVICE);
    mChannel = mManager.initialize(this, getMainLooper(), null);
}
```

接下来，创建一个新的 [BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html) 类侦听系统中 Wi-Fi P2P 状态的变化。在 <a href="http://developer.android.com/reference/android/content/BroadcastReceiver.html#onReceive(android.content.Context, android.content.Intent)">onReceive()</a> 方法中，加入对上述四种不同 P2P 状态变化的处理。

```java
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION.equals(action)) {
            // Determine if Wifi P2P mode is enabled or not, alert
            // the Activity.
            int state = intent.getIntExtra(WifiP2pManager.EXTRA_WIFI_STATE, -1);
            if (state == WifiP2pManager.WIFI_P2P_STATE_ENABLED) {
                activity.setIsWifiP2pEnabled(true);
            } else {
                activity.setIsWifiP2pEnabled(false);
            }
        } else if (WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION.equals(action)) {

            // The peer list has changed!  We should probably do something about
            // that.

        } else if (WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION.equals(action)) {

            // Connection state changed!  We should probably do something about
            // that.

        } else if (WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION.equals(action)) {
            DeviceListFragment fragment = (DeviceListFragment) activity.getFragmentManager()
                    .findFragmentById(R.id.frag_list);
            fragment.updateThisDevice((WifiP2pDevice) intent.getParcelableExtra(
                    WifiP2pManager.EXTRA_WIFI_P2P_DEVICE));

        }
    }
```

最后，在主 activity 开启时，加入注册 intent filter 和 broadcast receiver 的代码，并在 activity 暂停或关闭时，注销它们。上述做法最好放在 onResume() 和 onPause() 方法中。

```java
    /** register the BroadcastReceiver with the intent values to be matched */
    @Override
    public void onResume() {
        super.onResume();
        receiver = new WiFiDirectBroadcastReceiver(mManager, mChannel, this);
        registerReceiver(receiver, intentFilter);
    }

    @Override
    public void onPause() {
        super.onPause();
        unregisterReceiver(receiver);
    }
```

## 初始化对等节点发现（Peer Discovery）

调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#discoverPeers(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.ActionListener)">discoverPeers()</a> 开始搜寻附近带有 Wi-Fi P2P 的设备。该方法需要以下参数：

- 上节中调用 WifiP2pManager 的 initialize() 函数获得的 [WifiP2pManager.Channel](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.Channel.html) 对象
- 一个对 [WifiP2pManager.ActionListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ActionListener.html) 接口的实现，包括了当系统成功和失败发现所调用的方法。

```java
mManager.discoverPeers(mChannel, new WifiP2pManager.ActionListener() {

        @Override
        public void onSuccess() {
            // Code for when the discovery initiation is successful goes here.
            // No services have actually been discovered yet, so this method
            // can often be left blank.  Code for peer discovery goes in the
            // onReceive method, detailed below.
        }

        @Override
        public void onFailure(int reasonCode) {
            // Code for when the discovery initiation fails goes here.
            // Alert the user that something went wrong.
        }
});
```

需要注意的是，这仅仅表示对Peer发现（Peer Discovery）完成初始化。<a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#discoverPeers(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.ActionListener)">discoverPeers()</a> 方法开启了发现过程并且立即返回。系统会通过调用 WifiP2pManager.ActionListener 中的方法通知应用对等节点发现过程初始化是否正确。同时，对等节点发现过程本身仍然继续运行，直到一条连接或者一个 P2P 小组建立。

## 获取对等节点列表

在完成对等节点发现过程的初始化后，我们需要进一步获取附近的对等节点列表。第一步是实现 [WifiP2pManager.PeerListListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.PeerListListener.html) 接口。该接口提供了 Wi-Fi P2P 框架发现的对等节点信息。下列代码实现了相应功能：

```java
 private List peers = new ArrayList();
    ...

    private PeerListListener peerListListener = new PeerListListener() {
        @Override
        public void onPeersAvailable(WifiP2pDeviceList peerList) {

            // Out with the old, in with the new.
            peers.clear();
            peers.addAll(peerList.getDeviceList());

            // If an AdapterView is backed by this data, notify it
            // of the change.  For instance, if you have a ListView of available
            // peers, trigger an update.
            ((WiFiPeerListAdapter) getListAdapter()).notifyDataSetChanged();
            if (peers.size() == 0) {
                Log.d(WiFiDirectActivity.TAG, "No devices found");
                return;
            }
        }
    }
```

接下来，完善 Broadcast Receiver 的 onReceiver() 方法。
当收到 [WIFI_P2P_PEERS_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_PEERS_CHANGED_ACTION) 事件时，
调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#requestPeers(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.PeerListListener)">requestPeer()</a> 方法获取对等节点列表。我们需要将 WifiP2pManager.PeerListListener 传递给 receiver。一种方法是在 broadcast receiver 的构造函数中，将对象作为参数传入。

```java
public void onReceive(Context context, Intent intent) {
    ...
    else if (WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION.equals(action)) {

        // Request available peers from the wifi p2p manager. This is an
        // asynchronous call and the calling activity is notified with a
        // callback on PeerListListener.onPeersAvailable()
        if (mManager != null) {
            mManager.requestPeers(mChannel, peerListListener);
        }
        Log.d(WiFiDirectActivity.TAG, "P2P peers changed");
    }...
}
```

现在，一个带有 [WIFI_P2P_PEERS_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_PEERS_CHANGED_ACTION) action 的 intent 将触发应用对 Peer 列表的更新。

## 连接一个对等节点

为了连接到一个对等节点，我们需要创建一个新的 [WifiP2pConfig](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pConfig.html) 对象，并将要连接的设备信息从表示我们想要连接设备的 [WifiP2pDevice](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pDevice.html) 拷贝到其中。然后调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#connect(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pConfig, android.net.wifi.p2p.WifiP2pManager.ActionListener)">connect()</a> 方法。

```java
    @Override
    public void connect() {
        // Picking the first device found on the network.
        WifiP2pDevice device = peers.get(0);

        WifiP2pConfig config = new WifiP2pConfig();
        config.deviceAddress = device.deviceAddress;
        config.wps.setup = WpsInfo.PBC;

        mManager.connect(mChannel, config, new ActionListener() {

            @Override
            public void onSuccess() {
                // WiFiDirectBroadcastReceiver will notify us. Ignore for now.
            }

            @Override
            public void onFailure(int reason) {
                Toast.makeText(WiFiDirectActivity.this, "Connect failed. Retry.",
                        Toast.LENGTH_SHORT).show();
            }
        });
    }
```


在本段代码中的 [WifiP2pManager.ActionListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ActionListener.html) 实现仅能通知我们初始化的成功或失败。想要监听连接状态的变化，需要实现 [WifiP2pManager.ConnectionInfoListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ConnectionInfoListener.html) 接口。接口中的 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ConnectionInfoListener.html#onConnectionInfoAvailable(android.net.wifi.p2p.WifiP2pInfo)">onConnectionInfoAvailable()</a> 回调函数会在连接状态发生改变时通知应用程序。当有多个设备同时试图连接到一台设备时（例如多人游戏或者聊天群），这一台设备将被指定为“群主”（group owner）。

```java
    @Override
    public void onConnectionInfoAvailable(final WifiP2pInfo info) {

        // InetAddress from WifiP2pInfo struct.
        InetAddress groupOwnerAddress = info.groupOwnerAddress.getHostAddress());

        // After the group negotiation, we can determine the group owner.
        if (info.groupFormed && info.isGroupOwner) {
            // Do whatever tasks are specific to the group owner.
            // One common case is creating a server thread and accepting
            // incoming connections.
        } else if (info.groupFormed) {
            // The other device acts as the client. In this case,
            // you'll want to create a client thread that connects to the group
            // owner.
        }
    }
```

此时，回头继续完善 broadcast receiver 的 `onReceive()` 方法，并修改对 [WIFI_P2P_CONNECTION_CHANGED_ACTION]() intent 的监听部分的代码。当接收到该 intent 时，调用 [requestConnectionInfo()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_CONNECTION_CHANGED_ACTION) 方法。此方法为异步，所以结果将会被我们提供的 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#requestConnectionInfo(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.ConnectionInfoListener)">WifiP2pManager.ConnectionInfoListener</a> 所获取。

```java
        ...
        } else if (WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION.equals(action)) {

            if (mManager == null) {
                return;
            }

            NetworkInfo networkInfo = (NetworkInfo) intent
                    .getParcelableExtra(WifiP2pManager.EXTRA_NETWORK_INFO);

            if (networkInfo.isConnected()) {

                // We are connected with the other device, request connection
                // info to find group owner IP

                mManager.requestConnectionInfo(mChannel, connectionListener);
            }
            ...
```
