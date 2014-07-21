> 编写:

> 校对:

# 使得网络服务可发现


网络服务发现（Network Service Discovery）是一种在局域网内可以辨识并使用其他设备上提供的服务的技术。这种技术对大量的端对端应用大有裨益，例如文件共享、联机游戏等。Android提供了网络服务发现（NSD）相应的API，大大降低了实现难度。


本讲将简要介绍如何创建NSD应用，使其能够在本地网络内广播自己的名称和链接信息，并且扫描发现其他NSD设备。最后，本讲将介绍如何连接到运行着同样应用的另一台设备上。

## 注册NSD服务

> **Note：** 这一步骤是选做的。如果你并不关心自己的服务是否被广播，你可以跳过这一步，直接尝试[发现网络中的服务](#discover)。


在局域网内注册自己服务的第一步是创建[NsdServiceInfo](http://developer.android.com/reference/android/net/nsd/NsdServiceInfo.html)对象。
此对象包含的信息能够帮助其他设备决定是否要连接到你所提供的服务。

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


这段代码将所提供的服务命名为“NsdChat”。该名称将对所有局域网络中的设备可见。
需要注意的是，在网络内该名称必须是独一无二的。Android系统会自动处理冲突的
服务名称。如果同时有两个名为“NsdChat”的应用，
其中一个会被自动转换为“NsdChat(1)”。


第二个参数设置了服务类型，即，使用的通信协议和传输层协议，
语法是“\_< protocol >.\_< transportlayer >”。
在上面的代码中，服务使用了TCP协议上的HTTP协议。
如果应用想要提供打印服务（例如，一台网络打印机）应该将服务的类型设置为
“_ipp._tcp”。




> **Note:** 互联网编号分配机构（International Assigned Numbers Authority，简称IANA）提供用于服务发现协议（例如NSD和Bonjour）的官方的服务种类列表。你可以下载该列表了解相应的服务名称和端口号码。如果你想起用新的服务种类，应该向IANA官方提交申请。



当为你的服务设置端口号时，应该尽量避免将其硬编码在代码中，
防止与其他应用产生冲突。例如，如果你的应用仅仅使用端口1337，
就可能与其他使用1337端口的应用发生冲突。解决方法是，不要硬编码，
使用下一个可用的端口。不必担心其他应用无法知晓服务的端口号，
因为该信息将包含在广播中。接收到广播后，应用将从中得知服务端口号，
并通过端口连接到你的服务上。


如果你使用的是socket，你可以将端口号初始值设置为0来使用下一个可用端口。

```java
public void initializeServerSocket() {
    // Initialize a server socket on the next available port.
    mServerSocket = new ServerSocket(0);

    // Store the chosen port.
    mLocalPort =  mServerSocket.getLocalPort();
    ...
}
```


你已经成功的创建了[NsdServiceInfo](http://developer.android.com/reference/android/net/nsd/NsdServiceInfo.html)对象，
接下来要做的是实现[RegistrationListener](http://developer.android.com/reference/android/net/nsd/NsdManager.RegistrationListener.html)接口。
该接口包含了注册在Android系统中的一系列回调函数，
用来通知应用程序服务注册/注销的成功和失败。

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



万事俱备只欠东风，调用[registerService()](http://developer.android.com/reference/android/net/nsd/NsdManager.html#registerService(android.net.nsd.NsdServiceInfo, int, android.net.nsd.NsdManager.RegistrationListener)方法真正注册服务。


因为该方法是异步的，所以进一步的操作需要在[onServiceRegistered()](http://developer.android.com/reference/android/net/nsd/NsdManager.RegistrationListener.html#onServiceRegistered(android.net.nsd.NsdServiceInfo)方法中进行。

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











