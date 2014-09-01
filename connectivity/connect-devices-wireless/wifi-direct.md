# 使用WiFi建立P2P连接

> 编写:[naizhengtan](https://github.com/naizhengtan) - 原文:<http://developer.android.com/training/connect-devices-wirelessly/wifi-direct.html>

Android提供的Wi-Fi点对点（P2P）APIs允许应用程序无需连接到网络和热点的情况下连接到附近的设备。（Android Wi-Fi P2P框架遵循[Wi-Fi Direct™](http://www.wi-fi.org/discover-and-learn/wi-fi-direct) 验证程序）
Wi-Fi P2P技术使得应用程序可以快速发现附近的设备并与之交互。
相比于蓝牙技术，Wi-Fi P2P的优势是具有较大的连接范围。


本节主要内容是使用Wi-Fi P2P技术发现并连接到附近的设备。

## 配置应用权限


使用Wi-Fi P2P技术，需要添加[CHANGE_WIFI_STATE](http://developer.android.com/reference/android/Manifest.permission.html#CHANGE_WIFI_STATE),
[ACCESS_WIFI_STATE](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_WIFI_STATE)以及
[INTERNET](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET)三种权限到应用的manifest文件。
Wi-Fi P2P技术虽然不需要访问互联网，但是它会使用Java中的标准socket。
而使用socket需要具有INTERNET权限，这也是Wi-Fi P2P技术需要申请该权限的原因。

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


## BroadCast Receiver和Peer-to-peer Manager


使用Wi-Fi P2P的时候需要侦听相关的广播事件（broadcast intent）。
所以在应用中需要实例化一个[IntentFilter](http://developer.android.com/reference/android/content/IntentFilter.html)，
并将其设置为侦听下列事件：


- [WIFI_P2P_STATE_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_STATE_CHANGED_ACTION)
<br> 指示Wi-Fi P2P是否开启


- [WIFI_P2P_PEERS_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_PEERS_CHANGED_ACTION)
<br> 代表对等节点（peer）列表发生了变化


- [WIFI_P2P_CONNECTION_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_CONNECTION_CHANGED_ACTION)
<br>表明Wi-Fi P2P的连接状态发生了改变


- [WIFI_P2P_THIS_DEVICE_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_THIS_DEVICE_CHANGED_ACTION)
<br>指示设备的详细配置发生了变化

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

在[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)方法的最后，
需要获得[WifiPpManager](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html)的实例，并调用它的[initialize()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#initialize(android.content.Context, android.os.Looper, android.net.wifi.p2p.WifiP2pManager.ChannelListener))方法。
该方法将返回[WifiP2pManager.Channel](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.Channel.html)对象。
你的应用将使用该对象与Wi-Fi P2P框架进行交互。

```java
@Override

Channel mChannel;

public void onCreate(Bundle savedInstanceState) {
    ....
    mManager = (WifiP2pManager) getSystemService(Context.WIFI_P2P_SERVICE);
    mChannel = mManager.initialize(this, getMainLooper(), null);
}
```


接下来，创建一个新的[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)类侦听系统中Wi-Fi P2P的状态变化。在[onReceive()](http://developer.android.com/reference/android/content/BroadcastReceiver.html#onReceive(android.content.Context, android.content.Intent))方法中，加入对上述四种不同P2P状态变化的处理。

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


最后，在主界面开启时，加入注册intent filter和broadcast receiver的代码，并在暂停或关闭时，注销它们。
最好的位置是在onResume()和onPause()方法中。

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

## 初始化对等节点发现（Peer Discovery）过程


在Wi-Fi P2P中，应用通过调用[discoverPeers()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#discoverPeers(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.ActionListener)搜寻附近的设备。
该方法需要以下参数：

- 上节中调用WifiP2pManager的initialize()函数获得的[WifiP2pManager.Channel](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.Channel.html)对象
- 一个对[WifiP2pManager.ActionListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ActionListener.html)接口的实现，包括了当系统成功/失败发现所调用的方法

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


需要注意的是，在此的成功仅仅表示对同伴发现（Peer Discovery）的过程完成初始化。
方法discoverPeers()开启了发现过程并且立即返回。
系统会通过调用WifiP2pManager.ActionListener中的方法通知应用对等节点发现过程初始化是否正确。
同时，对等节点发现过程本身仍然继续运行，直到一条连接或者一个P2P小组建立。

## 获取对等节点列表

在完成对等节点发现过程的初始化后，我们需要进一步获取附近的对等节点列表。
第一步是实现[WifiP2pManager.PeerListListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.PeerListListener.html)接口。
该接口提供了Wi-Fi P2P框架发现的对等节点信息。
下列代码实现了相应功能：

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


接下来，完善上文广播接收者（Broadcast Receiver）的onReceiver()方法。
当收到[WIFI_P2P_PEERS_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_PEERS_CHANGED_ACTION)事件时，
调用[requestPeer()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#requestPeers(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.PeerListListener))方法获取对等节点列表。
在此，需要将WifiP2pManager.PeerListListener对象传递给该方法。
一种方法是在广播接收者构造时，就将对象作为参数传入。

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

现在，一个[WIFI_P2P_PEERS_CHANGED_ACTION](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_PEERS_CHANGED_ACTION)事件将触发应用对同伴列表的更新了。


## 连接一个对等节点


为了连接到一个对等节点，你需要创一个新的[WifiP2pConfig](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pConfig.html)对象，
并将设备信息从[WifiP2pDevice](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pDevice.html)拷贝到其中，
最后调用[connect()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#connect(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pConfig, android.net.wifi.p2p.WifiP2pManager.ActionListener))方法。

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


在本段代码中的[WifiP2pManager.ActionListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ActionListener.html)仅能通知你初始化的成功或失败。
想要侦听连接状态的变化，需要实现[WifiP2pManager.ConnectionInfoListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ConnectionInfoListener.html)接口。
接口中的[onConnectionInfoAvailable()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ConnectionInfoListener.html#onConnectionInfoAvailable(android.net.wifi.p2p.WifiP2pInfo))回调函数会在连接状态发生改变时通知应用程序。
当有多个设备同时试图连接到一台设备时（例如多人游戏或者聊天群），
这一台设备将被指定为“群主”（group owner）。

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


此时，回头继续完善广播接收者的onReceive()方法，
并将对[WIFI_P2P_CONNECTION_CHANGED_ACTION]()事件的处理补全。
当该事件发生后，调用[requestConnectionInfo()](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#WIFI_P2P_CONNECTION_CHANGED_ACTION)方法。
此方法为异步，所以结果将会被你提供的[WifiP2pManager.ConnectionInfoListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#requestConnectionInfo(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.ConnectionInfoListener))所获取。

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




