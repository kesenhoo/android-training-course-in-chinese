# 使用 WiFi P2P 服务发现

> 编写:[naizhengtan](https://github.com/naizhengtan) - 原文:<http://developer.android.com/training/connect-devices-wirelessly/nsd-wifi-direct.html>

在本章第一节“[使用网络服务发现](nsd.html)”中介绍了如何在局域网中发现已连接到网络的服务。然而，即使在不接入网络的情况下，Wi-Fi P2P 服务发现也可以使我们的应用直接发现附近的设备。我们也可以向外公布自己设备上的服务。这些能力可以在没有局域网或者网络热点的情况下，在应用间进行通信。

虽然本节所述的 API 与第一节 NSD（Network Service Discovery）的 API 相似，但是具体的实现代码却截然不同。本节将讲述如何通 过Wi-Fi P2P 技术发现其它设备中可用的服务。本节假设读者已经对 Wi-Fi P2P 的 API 有一定了解。

## 配置 Manifest

使用 Wi-Fi P2P 技术，需要添加 [CHANGE_WIFI_STATE](http://developer.android.com/reference/android/Manifest.permission.html#CHANGE_WIFI_STATE)、[ACCESS_WIFI_STATE](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_WIFI_STATE) 以及 [INTERNET](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET) 三种权限到应用的 manifest 文件。虽然 Wi-Fi P2P 技术不需要访问互联网，但是它会使用 Java 中的标准 socket，而使用 socket 需要具有 INTERNET 权限，这也是 Wi-Fi P2P 技术需要申请该权限的原因。

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

## 添加本地服务

如果我们想提供一个本地服务，就需要在服务发现框架中注册该服务。当本地服务被成功注册，系统将自动回复所有来自附近的服务发现请求。

三步创建本地服务：

1. 新建 [WifiP2pServiceInfo](http://developer.android.com/reference/android/net/wifi/p2p/nsd/WifiP2pServiceInfo.html) 对象
2. 加入相应服务的详细信息
3. 调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#addLocalService(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.nsd.WifiP2pServiceInfo, android.net.wifi.p2p.WifiP2pManager.ActionListener)">addLocalService()</a> 为服务发现注册本地服务

```java
private void startRegistration() {
        //  Create a string map containing information about your service.
        Map record = new HashMap();
        record.put("listenport", String.valueOf(SERVER_PORT));
        record.put("buddyname", "John Doe" + (int) (Math.random() * 1000));
        record.put("available", "visible");

        // Service information.  Pass it an instance name, service type
        // _protocol._transportlayer , and the map containing
        // information other devices will want once they connect to this one.
        WifiP2pDnsSdServiceInfo serviceInfo =
                WifiP2pDnsSdServiceInfo.newInstance("_test", "_presence._tcp", record);

        // Add the local service, sending the service info, network channel,
        // and listener that will be used to indicate success or failure of
        // the request.
        mManager.addLocalService(channel, serviceInfo, new ActionListener() {
            @Override
            public void onSuccess() {
                // Command successful! Code isn't necessarily needed here,
                // Unless you want to update the UI or add logging statements.
            }

            @Override
            public void onFailure(int arg0) {
                // Command failed.  Check for P2P_UNSUPPORTED, ERROR, or BUSY
            }
        });
    }
```

## 发现附近的服务

Android 使用回调函数通知应用程序附近可用的服务，因此首先要做的是设置这些回调函数。新建一个 [WifiP2pManager.DnsSdTxtRecordListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.DnsSdTxtRecordListener.html) 实例监听实时收到的记录（record）。这些记录可以是来自其他设备的广播。当收到记录时，将其中的设备地址和其他相关信息拷贝到当前方法之外的外部数据结构中，供之后使用。下面的例子假设这条记录包含一个带有用户身份的“buddyname”域（field）。

```java
final HashMap<String, String> buddies = new HashMap<String, String>();
...
private void discoverService() {
    DnsSdTxtRecordListener txtListener = new DnsSdTxtRecordListener() {
        @Override
        /* Callback includes:
         * fullDomain: full domain name: e.g "printer._ipp._tcp.local."
         * record: TXT record dta as a map of key/value pairs.
         * device: The device running the advertised service.
         */

        public void onDnsSdTxtRecordAvailable(
                String fullDomain, Map record, WifiP2pDevice device) {
                Log.d(TAG, "DnsSdTxtRecord available -" + record.toString());
                buddies.put(device.deviceAddress, record.get("buddyname"));
            }
        };
    ...
}
```

接下来创建 [WifiP2pManager.DnsSdServiceResponseListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.DnsSdServiceResponseListener.html) 对象，用以获取服务的信息。这个对象将接收服务的实际描述以及连接信息。上一段代码构建了一个包含设备地址和“buddyname”键值对的 [Map](http://developer.android.com/reference/java/util/Map.html) 对象。[WifiP2pManager.DnsSdServiceResponseListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.DnsSdServiceResponseListener.html) 对象使用这些配对信息将 DNS 记录和对应的服务信息对应起来。当上述两个 listener 构建完成后，调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#setDnsSdResponseListeners(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.DnsSdServiceResponseListener, android.net.wifi.p2p.WifiP2pManager.DnsSdTxtRecordListener)">setDnsSdResponseListeners()</a> 将他们加入到 [WifiP2pManager](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html)。

```java
private void discoverService() {
...

    DnsSdServiceResponseListener servListener = new DnsSdServiceResponseListener() {
        @Override
        public void onDnsSdServiceAvailable(String instanceName, String registrationType,
                WifiP2pDevice resourceType) {

                // Update the device name with the human-friendly version from
                // the DnsTxtRecord, assuming one arrived.
                resourceType.deviceName = buddies
                        .containsKey(resourceType.deviceAddress) ? buddies
                        .get(resourceType.deviceAddress) : resourceType.deviceName;

                // Add to the custom adapter defined specifically for showing
                // wifi devices.
                WiFiDirectServicesList fragment = (WiFiDirectServicesList) getFragmentManager()
                        .findFragmentById(R.id.frag_peerlist);
                WiFiDevicesAdapter adapter = ((WiFiDevicesAdapter) fragment
                        .getListAdapter());

                adapter.add(resourceType);
                adapter.notifyDataSetChanged();
                Log.d(TAG, "onBonjourServiceAvailable " + instanceName);
        }
    };

    mManager.setDnsSdResponseListeners(channel, servListener, txtListener);
    ...
}
```

现在调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#addServiceRequest(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.nsd.WifiP2pServiceRequest, android.net.wifi.p2p.WifiP2pManager.ActionListener)">addServiceRequest()</a> 创建服务请求。这个方法也需要一个 Listener 报告请求成功与失败。

```java
        serviceRequest = WifiP2pDnsSdServiceRequest.newInstance();
        mManager.addServiceRequest(channel,
                serviceRequest,
                new ActionListener() {
                    @Override
                    public void onSuccess() {
                        // Success!
                    }

                    @Override
                    public void onFailure(int code) {
                        // Command failed.  Check for P2P_UNSUPPORTED, ERROR, or BUSY
                    }
                });
```

最后调用 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#discoverServices(android.net.wifi.p2p.WifiP2pManager.Channel, android.net.wifi.p2p.WifiP2pManager.ActionListener)">discoverServices()</a>。

```java
        mManager.discoverServices(channel, new ActionListener() {

            @Override
            public void onSuccess() {
                // Success!
            }

            @Override
            public void onFailure(int code) {
                // Command failed.  Check for P2P_UNSUPPORTED, ERROR, or BUSY
                if (code == WifiP2pManager.P2P_UNSUPPORTED) {
                    Log.d(TAG, "P2P isn't supported on this device.");
                else if(...)
                    ...
            }
        });
```

如果所有部分都配置正确，我们应该就能看到正确的结果了！如果遇到了问题，可以查看 [WifiP2pManager.ActionListener](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ActionListener.html) 中的回调函数。它们能够指示操作是否成功。我们可以将 debug 的代码放置在 <a href="http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.ActionListener.html#onFailure(int)">onFailure()</a> 中来诊断问题。其中的一些错误码（Error Code）也许能为我们带来不小启发。下面是一些常见的错误：

[P2P_UNSUPPORTED](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#P2P_UNSUPPORTED)

　　当前的设备不支持 Wi-Fi P2P

[BUSY](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#BUSY)

　　系统忙，无法处理当前请求

[ERROR](http://developer.android.com/reference/android/net/wifi/p2p/WifiP2pManager.html#ERROR)

　　内部错误导致操作失败
