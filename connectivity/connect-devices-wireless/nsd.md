# 使用网络服务发现

> 编写:[naizhengtan](https://github.com/naizhengtan) - 原文:<http://developer.android.com/training/connect-devices-wirelessly/nsd.html>

添加网络服务发现（Network Service Discovery）到我们的 app 中，可以使我们的用户辨识在局域网内支持我们的 app 所请求的服务的设备。这种技术在点对点应用中能够提供大量帮助，例如文件共享、联机游戏等。Android 的网络服务发现（NSD）API 大大降低实现上述功能的难度。

本讲将简要介绍如何创建 NSD 应用，使其能够在本地网络内广播自己的名称和连接信息，并且扫描其它正在做同样事情的应用信息。最后，将介绍如何连接运行着同样应用的另一台设备。

## 注册 NSD 服务

> **Note:** 这一步骤是选做的。如果我们并不关心在本地网络上广播 app 服务，那么我们可以跳过这一步，直接尝试[发现网络中的服务](#discover)。

在局域网内注册自己服务的第一步是创建 [NsdServiceInfo](http://developer.android.com/reference/android/net/nsd/NsdServiceInfo.html) 对象。此对象包含的信息能够帮助网络中的其他设备决定是否要连接到我们所提供的服务。

```java
public void registerService(int port) {
    // Create the NsdServiceInfo object, and populate it.
    NsdServiceInfo serviceInfo  = new NsdServiceInfo();

    // The name is subject to change based on conflicts
    // with other services advertised on the same network.
    serviceInfo.setServiceName("NsdChat");
    serviceInfo.setServiceType("_http._tcp.");
    serviceInfo.setPort(port);
    ....
}
```

这段代码将服务命名为“NsdChat”。该名称将对所有局域网络中使用 NSD 查找本地服务的设备可见。需要注意的是，在网络内该名称必须是独一无二的。Android 系统会自动处理冲突的服务名称。如果同时有两个名为“NsdChat”的应用，其中一个会被自动转换为类似“NsdChat(1)”这样的名称。

第二个参数设置了服务类型，即指定应用使用的协议和传输层。语法是“\_< protocol >.\_< transportlayer >”。在上面的代码中，服务使用了TCP协议上的HTTP协议。想要提供打印服务（例如，一台网络打印机）的应用应该将服务的类型设置为“_ipp._tcp”。

> **Note:** 互联网编号分配机构（International Assigned Numbers Authority，简称 IANA）提供用于服务发现协议（例如 NSD 和 Bonjour）的官方服务种类列表。我们可以下载该列表了解相应的服务名称和端口号码。如果我们想起用新的服务种类，应该向 IANA 官方提交申请。

当为我们的服务设置端口号时，应该尽量避免将其硬编码在代码中，以防止与其他应用产生冲突。例如，如果我们的应用仅仅使用端口1337，就可能与其他使用1337端口的应用发生冲突。解决方法是，不要硬编码，使用下一个可用的端口。不必担心其他应用无法知晓服务的端口号，因为该信息将包含在服务的广播包中。接收到广播后，其他应用将从广播包中得知服务端口号，并通过端口连接到我们的服务上。

如果使用的是 socket，那么我们可以将端口设置为 0，来初始化 socket 到任意可用的端口。

```java
public void initializeServerSocket() {
    // Initialize a server socket on the next available port.
    mServerSocket = new ServerSocket(0);

    // Store the chosen port.
    mLocalPort =  mServerSocket.getLocalPort();
    ...
}
```

现在，我们已经成功的创建了 [NsdServiceInfo](http://developer.android.com/reference/android/net/nsd/NsdServiceInfo.html) 对象，接下来要做的是实现 [RegistrationListener](http://developer.android.com/reference/android/net/nsd/NsdManager.RegistrationListener.html) 接口。该接口包含了注册在 Android 系统中的回调函数，作用是通知应用程序服务注册和注销的成功或者失败。

```java
public void initializeRegistrationListener() {
    mRegistrationListener = new NsdManager.RegistrationListener() {

        @Override
        public void onServiceRegistered(NsdServiceInfo NsdServiceInfo) {
            // Save the service name.  Android may have changed it in order to
            // resolve a conflict, so update the name you initially requested
            // with the name Android actually used.
            mServiceName = NsdServiceInfo.getServiceName();
        }

        @Override
        public void onRegistrationFailed(NsdServiceInfo serviceInfo, int errorCode) {
            // Registration failed!  Put debugging code here to determine why.
        }

        @Override
        public void onServiceUnregistered(NsdServiceInfo arg0) {
            // Service has been unregistered.  This only happens when you call
            // NsdManager.unregisterService() and pass in this listener.
        }

        @Override
        public void onUnregistrationFailed(NsdServiceInfo serviceInfo, int errorCode) {
            // Unregistration failed.  Put debugging code here to determine why.
        }
    };
}
```

万事俱备只欠东风，调用 <a href="http://developer.android.com/reference/android/net/nsd/NsdManager.html#registerService(android.net.nsd.NsdServiceInfo, int, android.net.nsd.NsdManager.RegistrationListener">registerService()</a> 方法，真正注册服务。

因为该方法是异步的，所以在服务注册之后的操作都需要在 <a href="http://developer.android.com/reference/android/net/nsd/NsdManager.RegistrationListener.html#onServiceRegistered(android.net.nsd.NsdServiceInfo)">onServiceRegistered()</a> 方法中进行。

```java
public void registerService(int port) {
    NsdServiceInfo serviceInfo  = new NsdServiceInfo();
    serviceInfo.setServiceName("NsdChat");
    serviceInfo.setServiceType("_http._tcp.");
    serviceInfo.setPort(port);

    mNsdManager = Context.getSystemService(Context.NSD_SERVICE);

    mNsdManager.registerService(
            serviceInfo, NsdManager.PROTOCOL_DNS_SD, mRegistrationListener);
}
```

<a name="discover"></a>
## 发现网络中的服务

网络充斥着我们的生活，从网络打印机到网络摄像头，再到联网井字棋。网络服务发现是能让我们的应用融入这一切功能的关键。我们的应用需要侦听网络内服务的广播，发现可用的服务，过滤无效的信息。

与注册网络服务类似，服务发现需要两步骤：用相应的回调函数设置发现监听器（Discover Listener），以及调用 <a href="http://developer.android.com/reference/android/net/nsd/NsdManager.html#discoverServices(java.lang.String, int, android.net.nsd.NsdManager.DiscoveryListener)">discoverServices()</a> 这个异步API。

首先，实例化一个实现 [NsdManager.DiscoveryListener](http://developer.android.com/reference/android/net/nsd/NsdManager.DiscoveryListener.html) 接口的匿名类。下列代码是一个简单的范例：

```java
public void initializeDiscoveryListener() {

    // Instantiate a new DiscoveryListener
    mDiscoveryListener = new NsdManager.DiscoveryListener() {

        //  Called as soon as service discovery begins.
        @Override
        public void onDiscoveryStarted(String regType) {
            Log.d(TAG, "Service discovery started");
        }

        @Override
        public void onServiceFound(NsdServiceInfo service) {
            // A service was found!  Do something with it.
            Log.d(TAG, "Service discovery success" + service);
            if (!service.getServiceType().equals(SERVICE_TYPE)) {
                // Service type is the string containing the protocol and
                // transport layer for this service.
                Log.d(TAG, "Unknown Service Type: " + service.getServiceType());
            } else if (service.getServiceName().equals(mServiceName)) {
                // The name of the service tells the user what they'd be
                // connecting to. It could be "Bob's Chat App".
                Log.d(TAG, "Same machine: " + mServiceName);
            } else if (service.getServiceName().contains("NsdChat")){
                mNsdManager.resolveService(service, mResolveListener);
            }
        }

        @Override
        public void onServiceLost(NsdServiceInfo service) {
            // When the network service is no longer available.
            // Internal bookkeeping code goes here.
            Log.e(TAG, "service lost" + service);
        }

        @Override
        public void onDiscoveryStopped(String serviceType) {
            Log.i(TAG, "Discovery stopped: " + serviceType);
        }

        @Override
        public void onStartDiscoveryFailed(String serviceType, int errorCode) {
            Log.e(TAG, "Discovery failed: Error code:" + errorCode);
            mNsdManager.stopServiceDiscovery(this);
        }

        @Override
        public void onStopDiscoveryFailed(String serviceType, int errorCode) {
            Log.e(TAG, "Discovery failed: Error code:" + errorCode);
            mNsdManager.stopServiceDiscovery(this);
        }
    };
}
```

NSD API 通过使用该接口中的方法通知用户程序发现何时开始、何时失败以及何时找到可用服务和何时服务丢失（丢失意味着“不再可用”）。在上述代码中，当发现了可用的服务时，程序做了几次检查。

1. 比较找到服务的名称与本地服务的名称，判断设备是否获得自己的（合法的）广播。
2. 检查服务的类型，确认这个类型我们的应用是否可以接入。
3. 检查服务的名称，确认是否接入了正确的应用。

我们并不需要每次都检查服务名称，仅当我们想要接入特定的应用时需要检查。例如，应用只想与运行在其他设备上的相同应用通信。然而，如果应用仅仅想接入到一台网络打印机，那么看到服务类型是“_ipp._tcp”的服务就足够了。

当配置好监听器后，调用 <a href="http://developer.android.com/reference/android/net/nsd/NsdManager.html#discoverServices(java.lang.String, int, android.net.nsd.NsdManager.DiscoveryListener)">discoverService()</a> 函数，其参数包括试图发现的服务种类、发现使用的协议、以及上一步创建的监听器。

```java
mNsdManager.discoverServices(
        SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, mDiscoveryListener);
```

## 连接到网络上的服务

当我们的应用发现了网上可接入的服务，首先需要调用 <a href="http://developer.android.com/reference/android/net/nsd/NsdManager.html#resolveService(android.net.nsd.NsdServiceInfo, android.net.nsd.NsdManager.ResolveListener)">resolveService()</a> 方法，以确定服务的连接信息。实现 [NsdManager.ResolveListener](http://developer.android.com/reference/android/net/nsd/NsdManager.ResolveListener.html) 对象并将其传入 `resolveService()` 方法，并使用这个 `NsdManager.ResolveListener` 对象获得包含连接信息的 [NsdSerServiceInfo](http://developer.android.com/reference/android/net/nsd/NsdServiceInfo.html)。

```java
public void initializeResolveListener() {
    mResolveListener = new NsdManager.ResolveListener() {

        @Override
        public void onResolveFailed(NsdServiceInfo serviceInfo, int errorCode) {
            // Called when the resolve fails.  Use the error code to debug.
            Log.e(TAG, "Resolve failed" + errorCode);
        }

        @Override
        public void onServiceResolved(NsdServiceInfo serviceInfo) {
            Log.e(TAG, "Resolve Succeeded. " + serviceInfo);

            if (serviceInfo.getServiceName().equals(mServiceName)) {
                Log.d(TAG, "Same IP.");
                return;
            }
            mService = serviceInfo;
            int port = mService.getPort();
            InetAddress host = mService.getHost();
        }
    };
}
```

当服务解析完成后，我们将获得服务的详细资料，包括其 IP 地址和端口号。此时，我们就可以创建自己网络连接与服务进行通讯。

## 当程序退出时注销服务

在应用的生命周期中正确的开启和关闭 NSD 服务是十分关键的。在程序退出时注销服务可以防止其他程序因为不知道服务退出而反复尝试连接的行为。另外，服务发现是一种开销很大的操作，应该随着父 Activity 的暂停而停止，当用户返回该界面时再开启。因此，开发者应该重写 Activity 的生命周期函数，并添加按照需要开启和停止服务广播和发现的代码。

```java
//In your application's Activity

    @Override
    protected void onPause() {
        if (mNsdHelper != null) {
            mNsdHelper.tearDown();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mNsdHelper != null) {
            mNsdHelper.registerService(mConnection.getLocalPort());
            mNsdHelper.discoverServices();
        }
    }

    @Override
    protected void onDestroy() {
        mNsdHelper.tearDown();
        mConnection.tearDown();
        super.onDestroy();
    }

    // NsdHelper's tearDown method
        public void tearDown() {
        mNsdManager.unregisterService(mRegistrationListener);
        mNsdManager.stopServiceDiscovery(mDiscoveryListener);
    }

```
