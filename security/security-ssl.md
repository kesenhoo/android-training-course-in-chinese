# 使用HTTPS与SSL

> 编写:[craftsmanBai](https://github.com/craftsmanBai) - <http://z1ng.net> - 原文: <http://developer.android.com/training/articles/security-ssl.html>

SSL，安全套接层([TSL](http://en.wikipedia.org/wiki/Transport_Layer_Security))，是一个常见的用来加密客户端和服务器通信的模块。
但是应用程序错误地使用SSL可能会导致应用程序的数据在网络中被恶意攻击者拦截。为了确保这种情况不在我们的应用中发生，这篇文章主要说明使用网络安全协议常见的陷阱和使用[Public-Key Infrastructure(PKI)](http://en.wikipedia.org/wiki/Public-key_infrastructure)时一些值得关注的问题。

## 概念

一个典型的SSL使用场景是，服务器配置中包含了一个证书，有匹配的公钥和私钥。作为SSL客户端和服务端握手的一部分，服务端通过使用[public-key cryptography(公钥加密算法)](http://en.wikipedia.org/wiki/Public-key_cryptography)进行证书签名来证明它有私钥。

然而，任何人都可以生成他们自己的证书和私钥，因此一次简单的握手不能证明服务端具有匹配证书公钥的私钥。一种解决这个问题的方法是让客户端拥有一套或者更多可信赖的证书。如果服务端提供的证书不在其中，那么它将不能得到客户端的信任。

这种简单的方法有一些缺陷。服务端应该根据时间升级到强壮的密钥(key rotation)，更新证书中的公钥。不幸的是，现在客户端应用需要根据服务端配置的变化来进行更新。如果服务端不在应用程序开发者的控制下，问题将变得更加麻烦，比如它是一个第三方网络服务。如果程序需要和任意的服务器进行对话，例如web浏览器或者email应用，这种方法也会带来问题。

为了解决这个问题，服务端通常配置了知名的的发行者证书(称为[Certificate Authorities(CAs)](http://en.wikipedia.org/wiki/Certificate_authority)。提供的平台通常包含了一系列知名可信赖的CAs。Android4.2(Jelly Bean)包含了超过100CAs并在每个发行版中更新。和服务端相似的是，一个CA拥有一个证书和一个私钥。当为一个服务端发布颁发证书的时候，CA用它的私钥为服务端签名。客户端可以通过服务端拥有被已知平台CA签名的证书来确认服务端。

然而，使用CAs又带来了其他的问题。因为CA为许多服务端证书签名，你仍然需要其他的方法来确保你对话的是你想要的服务器。为了解决这个问题，使用CA签名的的证书通过特殊的名字如 gmail.com 或者带有通配符的域名如 *.google.com 来确认服务端。
下面这个例子会使这些概念具体化一些。[openssl](http://www.openssl.org/docs/apps/openssl.html)工具的客户端命令关注Wikipedia服务端证书信息。端口为443（默认为HTTPS）。这条命令将open s_client的输出发送给openssl x509，根据[X.509 standard](http://en.wikipedia.org/wiki/X.509)格式化证书中的内容。特别的是，这条命令需要对象（subject），包含服务端名字和签发者（issuer）来确认CA。

```
$ openssl s_client -connect wikipedia.org:443 | openssl x509 -noout -subject -issuer
subject= /serialNumber=sOrr2rKpMVP70Z6E9BT5reY008SJEdYv/C=US/O=*.wikipedia.org/OU=GT03314600/OU=See www.rapidssl.com/resources/cps (c)11/OU=Domain Control Validated - RapidSSL(R)/CN=*.wikipedia.org
issuer= /C=US/O=GeoTrust, Inc./CN=RapidSSL CA
```

可以看到由RapidSSL CA颁发给匹配*.wikipedia.org的服务端证书。

## 一个HTTP的例子

假设我们有一个知名CA颁发证书的web服务器，那么可以使用下面的代码发送一个安全请求:

```java
URL url = new URL("https://wikipedia.org");
URLConnection urlConnection = url.openConnection();
InputStream in = urlConnection.getInputStream();
copyInputStreamToOutputStream(in, System.out);
```

是的，它就是这么简单。如果我们想要修改HTTP的请求，可以把它交付给 [HttpURLConnection](http://developer.android.com/reference/java/net/HttpURLConnection.html)。Android关于[HttpURLConnetcion](http://developer.android.com/reference/java/net/HttpURLConnection.html)文档中还有更贴切的关于怎样去处理请求、响应头、posting的内容、cookies管理、使用代理、获取responses等例子。但是就这些确认证书和域名的细节而言，Android框架已经通过API为我们考虑到了这些细节。下面是其他需要关注的问题。

## 服务器普通问题的验证

假设没有从[getInputStream()](http://developer.android.com/reference/java/net/URLConnection.html#getInputStream()收到内容，而是抛出了一个异常：

```java
javax.net.ssl.SSLHandshakeException: java.security.cert.CertPathValidatorException: Trust anchor for certification path not found.
        at org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl.startHandshake(OpenSSLSocketImpl.java:374)
        at libcore.net.http.HttpConnection.setupSecureSocket(HttpConnection.java:209)
        at libcore.net.http.HttpsURLConnectionImpl$HttpsEngine.makeSslConnection(HttpsURLConnectionImpl.java:478)
        at libcore.net.http.HttpsURLConnectionImpl$HttpsEngine.connect(HttpsURLConnectionImpl.java:433)
        at libcore.net.http.HttpEngine.sendSocketRequest(HttpEngine.java:290)
        at libcore.net.http.HttpEngine.sendRequest(HttpEngine.java:240)
        at libcore.net.http.HttpURLConnectionImpl.getResponse(HttpURLConnectionImpl.java:282)
        at libcore.net.http.HttpURLConnectionImpl.getInputStream(HttpURLConnectionImpl.java:177)
        at libcore.net.http.HttpsURLConnectionImpl.getInputStream(HttpsURLConnectionImpl.java:271)
```

这种情况发生的原因包括：

1.[颁布证书给服务器的CA不是知名的。](http://developer.android.com/training/articles/security-ssl.html#UnknownCa)

2.[服务器证书不是CA签名的而是自己签名的。](http://developer.android.com/training/articles/security-ssl.html#SelfSigned)

3.[服务器配置缺失了中间CA](http://developer.android.com/training/articles/security-ssl.html#MissingCa)

下面将会分别讨论当我们和服务器安全连接时如何去解决这些问题。


## 无法识别证书机构

在这种情况中，[SSLHandshakeException](http://developer.android.com/reference/javax/net/ssl/SSLHandshakeException.html)异常产生的原因是我们有一个不被系统信任的CA。可能是我们的证书来源于新CA而不被安卓信任，也可能是应用运行版本较老没有CA。更多的时候，一个CA不知名是因为它不是公开的CA，而是政府，公司，教育机构等组织私有的。

幸运的是，我们可以让[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)学会信任特殊的CA。过程可能会让人感到有一些费解，下面这个例子是从[InputStream](http://developer.android.com/reference/java/io/InputStream.html)中获得特殊的CA，使用它去创建一个密钥库，用来创建和初始化[TrustManager](http://developer.android.com/reference/javax/net/ssl/TrustManager.html)。[TrustManager](http://developer.android.com/reference/javax/net/ssl/TrustManager.html)是系统用来验证服务器证书的，这些证书通过使用[TrustManager](http://developer.android.com/reference/javax/net/ssl/TrustManager.html)信任的CA和密钥库中的密钥创建。
给定一个新的TrustManager，下面这个例子初始化了一个新的[SSLContext](http://developer.android.com/reference/javax/net/ssl/SSLContext.html)，提供了一个[SSLSocketFactory](http://developer.android.com/reference/javax/net/ssl/SSLSocketFactory.html)，我们可以覆盖来自[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)的默认[SSLSocketFactory](http://developer.android.com/reference/javax/net/ssl/SSLSocketFactory.html)。这样连接时会使用我们的CA来进行证书验证。

下面是一个华盛顿的大学的组织性的CA的使用例子

```java
// Load CAs from an InputStream
// (could be from a resource or ByteArrayInputStream or ...)
CertificateFactory cf = CertificateFactory.getInstance("X.509");
// From https://www.washington.edu/itconnect/security/ca/load-der.crt
InputStream caInput = new BufferedInputStream(new FileInputStream("load-der.crt"));
Certificate ca;
try {
    ca = cf.generateCertificate(caInput);
    System.out.println("ca=" + ((X509Certificate) ca).getSubjectDN());
} finally {
    caInput.close();
}

// Create a KeyStore containing our trusted CAs
String keyStoreType = KeyStore.getDefaultType();
KeyStore keyStore = KeyStore.getInstance(keyStoreType);
keyStore.load(null, null);
keyStore.setCertificateEntry("ca", ca);

// Create a TrustManager that trusts the CAs in our KeyStore
String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
tmf.init(keyStore);

// Create an SSLContext that uses our TrustManager
SSLContext context = SSLContext.getInstance("TLS");
context.init(null, tmf.getTrustManagers(), null);

// Tell the URLConnection to use a SocketFactory from our SSLContext
URL url = new URL("https://certs.cac.washington.edu/CAtest/");
HttpsURLConnection urlConnection =
    (HttpsURLConnection)url.openConnection();
urlConnection.setSSLSocketFactory(context.getSocketFactory());
InputStream in = urlConnection.getInputStream();
copyInputStreamToOutputStream(in, System.out);
```

使用一个常用的了解你CA的TrustManager，系统可以确认你的服务器证书来自于一个可信任的发行者。

> **注意：**许多网站会提供一个可选解决方案：即让用户安装一个无用的TrustManager。如果你这样做还不如不加密通讯过程，因为任何人都可以在公共wifi热点下，使用伪装成你的服务器的代理发送你的用户流量，进行DNS欺骗，来攻击你的用户。然后攻击者便可记录用户密码和其他个人资料。这种方式可以奏效的原因是因为攻击者可以生成一个证书，并且缺少可以验证该证书是否来自受信任的来源的TrustManager。你的应用可以同任何人会话。所以不要这样做，即使是暂时性的也不行。除非你能始终让你的应用信任服务器证书的签发者。

## 自签名服务器证书

第二种[SSLHandshakeException](http://developer.android.com/reference/javax/net/ssl/SSLHandshakeException.html)取决于自签名证书，意味着服务器就是它自己的CA。这同未知证书权威机构类似，因此你同样可以用前面部分中提到的方法。

你可以创建自己的TrustManager，这一次直接信任服务器证书。将应用于证书直接捆绑会有一些缺点，不过我们依然可以确保其安全性。我们应该小心确保我们的自签名证书拥有合适的强密钥。到2012年，一个65537指数位且一年到期的2048位RSA签名是合理的。当轮换密钥时，我们应该查看权威机构（比如[NIST](http://www.nist.gov/)）的建议（[recommendation](http://csrc.nist.gov/groups/ST/key_mgmt/index.html)）来了解哪种密钥是合适的。


## 缺少中间证书颁发机构

第三种SSLHandshakeException情况的产生于缺少中间CA。大多数公开的CA不直接给服务器签名。相反，他们使用它们主要的机构（简称根认证机构）证书来给中间认证机构签名，根认证机构这样做，可以离线存储减少危险。然而，像安卓等操作系统通常只直接信任根认证机构，在服务器证书（由中间证书颁发机构签名）和证书验证者（只知道根认证机构）之间留下了一个缺口。为了解决这个问题，服务器并不在SSL握手的过程中只向客户端发送它的证书，而是一系列的从服务器到必经的任何中间机构到达根认证机构的证书。

下面是一个 mail.google.com证书链，以openssls_client命令显示：

```
$ openssl s_client -connect mail.google.com:443
---
Certificate chain
 0 s:/C=US/ST=California/L=Mountain View/O=Google Inc/CN=mail.google.com
   i:/C=ZA/O=Thawte Consulting (Pty) Ltd./CN=Thawte SGC CA
 1 s:/C=ZA/O=Thawte Consulting (Pty) Ltd./CN=Thawte SGC CA
   i:/C=US/O=VeriSign, Inc./OU=Class 3 Public Primary Certification Authority
---
```
这里显示了一台服务器发送了一个由Thawte SGC CA为mail.google.com颁发的证书，Thawte SGC CA是一个中间证书颁发机构，Thawte SGC CA的证书由被安卓信任的Verisign CA颁发。
然而，配置一台服务器不包括中间证书机构是不常见的。例如，一台服务器导致安卓浏览器的错误和应用的异常:


```
$ openssl s_client -connect egov.uscis.gov:443
---
Certificate chain
 0 s:/C=US/ST=District Of Columbia/L=Washington/O=U.S. Department of Homeland Security/OU=United States Citizenship and Immigration Services/OU=Terms of use at www.verisign.com/rpa (c)05/CN=egov.uscis.gov
   i:/C=US/O=VeriSign, Inc./OU=VeriSign Trust Network/OU=Terms of use at https://www.verisign.com/rpa (c)10/CN=VeriSign Class 3 International Server CA - G3
---
```
更有趣的是，用大多数桌面浏览器访问这台服务器不会导致类似于完全未知CA的或者自签名的服务器证书导致的错误。这是因为大多数桌面浏览器缓存随着时间的推移信任中间证书机构。一旦浏览器访问并且从一个网站了解到的一个中间证书机构，下一次它将不需要中间证书机构包含证书链。

一些站点会有意让用来提供资源服务的二级服务器像上述所述的那样。比如，他们可能会让他们的主HTML页面用一台拥有全部证书链的服务器来提供，但是像图片，CSS，或者JavaScript等这样的资源用不包含CA的服务器来提供，以此节省带宽。不幸的是，有时这些服务器可能会提供一个在应用中调用的web服务。
这里有两种解决这些问题的方法：

*	配置服务器使它包含服务器链中的中间证书颁发机构

*	或者，像对待不知名的CA一样对待中间CA，并且创建一个TrustManager来直接信任它，就像在前两节中做的那样。


## 验证主机名常见问题

就像在文章开头提到的那样，有两个关键的部分来确认SSL的连接。第一个是确认证书来源于信任的源，这也是前一个部分关注的焦点。这一部分关注第二部分：确保你当前对话的服务器有正确的证书。当情况不是这样时，你可能会看到这样的典型错误：

```java
java.io.IOException: Hostname 'example.com' was not verified
        at libcore.net.http.HttpConnection.verifySecureSocketHostname(HttpConnection.java:223)
        at libcore.net.http.HttpsURLConnectionImpl$HttpsEngine.connect(HttpsURLConnectionImpl.java:446)
        at libcore.net.http.HttpEngine.sendSocketRequest(HttpEngine.java:290)
        at libcore.net.http.HttpEngine.sendRequest(HttpEngine.java:240)
        at libcore.net.http.HttpURLConnectionImpl.getResponse(HttpURLConnectionImpl.java:282)
        at libcore.net.http.HttpURLConnectionImpl.getInputStream(HttpURLConnectionImpl.java:177)
        at libcore.net.http.HttpsURLConnectionImpl.getInputStream(HttpsURLConnectionImpl.java:271)

```
服务器配置错误可能会导致这种情况发生。服务器配置了一个证书，这个证书没有匹配的你想连接的服务器的subject或者subject可选的命名域。一个证书被许多不同的服务器使用是可能的。比如，使用 [openssl](http://www.openssl.org/docs/apps/openssl.html) s_client -connect google.com:443 |openssl x509 -text 查看google证书，你可以看到一个subject支持 *google.con *.youtube.com, *.android.com或者其他的。这种错误只会发生在你所连接的服务器名称没有被证书列为可接受。

不幸的是另外一种原因也会导致这种情况发生：[虚拟化服务](http://en.wikipedia.org/wiki/Virtual_hosting)。当用HTTP同时拥有一个以上主机名的服务器共享时，web服务器可以从 HTTP/1.1请求中找到客户端需要的目标主机名。不行的是，使用HTTPS会使情况变得复杂，因为服务器必须知道在发现HTTP请求前返回哪一个证书。为了解决这个问题，新版本的SSL，特别是TLSV.1.0和之后的版本，支持[服务器名指示(SNI)](http://en.wikipedia.org/wiki/Server_Name_Indication)，允许SSL客户端为服务端指定目标主机名，从而返回正确的证书。
幸运的是，从安卓2.3开始，[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)支持SNI。不幸的是，Apache HTTP客户端不这样，这也是我们不鼓励用它的原因之一。如果你需要支持安卓2.2或者更老的版本或者Apache HTTP客户端，一个解决方法是建立一个可选的虚拟化服务并且使用特别的端口，这样服务端就能够清楚该返回哪一个证书。


采用不使用你的虚拟服务的主机名[HostnameVerifier](http://developer.android.com/reference/javax/net/ssl/HostnameVerifier.html)而不是服务器默认的来替换，是很重要的选择。

注意：替换[HostnameVerifier](http://developer.android.com/reference/javax/net/ssl/HostnameVerifier.html)可能会非常危险，如果另外一个虚拟服务不在你的控制下，中间人攻击可能会直接使流量到达另外一台服务器而超出你的预想。
如果你仍然确定你想覆盖主机名验证，这里有一个为单[URLConnection](http://developer.android.com/reference/java/net/URLConnection.html)替换验证过程的例子：



```java
// Create an HostnameVerifier that hardwires the expected hostname.
// Note that is different than the URL's hostname:
// example.com versus example.org
HostnameVerifier hostnameVerifier = new HostnameVerifier() {
    @Override
    public boolean verify(String hostname, SSLSession session) {
        HostnameVerifier hv =
            HttpsURLConnection.getDefaultHostnameVerifier();
        return hv.verify("example.com", session);
    }
};

// Tell the URLConnection to use our HostnameVerifier
URL url = new URL("https://example.org/");
HttpsURLConnection urlConnection =
    (HttpsURLConnection)url.openConnection();
urlConnection.setHostnameVerifier(hostnameVerifier);
InputStream in = urlConnection.getInputStream();
copyInputStreamToOutputStream(in, System.out);
```
但是请记住，如果你发现你在替换主机名验证，特别是虚拟服务，另外一个虚拟主机不在你的控制的情况是非常危险的，你应该找到一个避免这种问题产生的托管管理。

## 关于直接使用SSL Socket的警告

到目前为止，这些例子聚焦于使用HttpsURLConnection上。有时一些应用需要让SSL和HTTP分开。举个例子，一个email应用可能会使用SSL的变种，SMTP,POP3,IMAP等。在那些例子中，应用程序会想使用[SSLSocket](http://developer.android.com/reference/javax/net/ssl/SSLSocket.html)直接连接，与HttpsURLConnection做的方法相似。
这种技术到目前为止处理了证书验证问题，也应用于SSLSocket中。事实上，当使用常规的TrustManager时，传递给HttpsURLConnection的是SSLSocketFactory。如果你需要一个带常规的SSLSocket的TrustManager，采取下面的步骤使用SSLSocketFactory来创建你的SSLSocket。

> **注意：** SSLSocket不具有主机名验证功能。它取决于它自己的主机名验证，通过传入预期的主机名调用[getDefaultHostNameVerifier()](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html#getDefaultHostnameVerifier())。进一步需要注意的是，当发生错误时，<a href="http://developer.android.com/reference/javax/net/ssl/HostnameVerifier.html#verify(java.lang.String, javax.net.ssl.SSLSession">HostnameVerifier.verify()</a>不知道抛出异常，而是返回一个布尔值，你需要进一步明确的检查。
下面是一个演示的方法。这个例子演示了当它连接gmail.com 443端口并且没有SNI支持的时候，你将会收到一个mail.google.com的证书。你需要确保证书的确是mail.google.com的。


```java
// Open SSLSocket directly to gmail.com
SocketFactory sf = SSLSocketFactory.getDefault();
SSLSocket socket = (SSLSocket) sf.createSocket("gmail.com", 443);
HostnameVerifier hv = HttpsURLConnection.getDefaultHostnameVerifier();
SSLSession s = socket.getSession();

// Verify that the certicate hostname is for mail.google.com
// This is due to lack of SNI support in the current SSLSocket.
if (!hv.verify("mail.google.com", s)) {
    throw new SSLHandshakeException("Expected mail.google.com, "
                                    "found " + s.getPeerPrincipal());
}

// At this point SSLSocket performed certificate verificaiton and
// we have performed hostname verification, so it is safe to proceed.

// ... use socket ...
socket.close();
```
## 黑名单

SSL 主要依靠CA来确认证书来自正确无误服务器和域名的所有者。少数情况下，CA被欺骗，或者在[Comodo](http://en.wikipedia.org/wiki/Comodo_Group#Breach_of_security)和[DigiNotar](http://en.wikipedia.org/wiki/DigiNotar)的例子中，一个主机名的证书被颁发给了除了服务器和域名的拥有者之外的人，导致被破坏。

为了减少这种危险，安卓可以将一些黑名单或者整个CA列入黑名单。尽管名单是以前是嵌入操作系统的，从安卓4.2开始，这个名单在以后的方案中可以远程更新。

## 阻塞

一个应用可以通过阻塞技术保护它自己免于受虚假证书的欺骗。这是简单运用使用未知CA的例子，限制应用信任的CA仅来自被应用使用的服务器。阻止了来自系统中另外一百多个CA的欺骗而导致的应用安全通道的破坏。

## 客户端验证

这篇文章聚焦在SSL的使用者同服务器的安全对话上。SSL也支持服务端通过验证客户端的证书来确认客户端的身份。这种技术也与TrustManager的特性相似。可以参考在[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)文档中关于创建一个常规的[KeyManager](http://developer.android.com/reference/javax/net/ssl/KeyManager.html)的讨论。


## nogotofail：网络流量安全测试工具

对于已知的TLS／SSL漏洞和错误，nogotofail提供了一个简单的方法来确认你的应用程序是安全的。它是一个自动化的、强大的、用于测试网络的安全问题可扩展性的工具，任何设备的网络流量都可以通过它。
nogotofail主要应用于三种场景：

*	发现错误和漏洞。

*	验证修补程序和等待回归。

*	了解应用程序和设备产生的交通。

nogotofail 可以工作在Android，iOS，Linux，Windows，Chrome OS，OSX环境下，事实上任何需要连接到Internet的设备都可以。Android和Linux环境下有简单易用获取通知的客户端配置设置，以及本身可以作为靶机，部署为一个路由器，VPN服务器，或代理。
你可以在nogotofail开源项目访问该工具。

