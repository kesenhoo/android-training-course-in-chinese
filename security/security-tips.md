# 安全要点

> 编写:[craftsmanBai](https://github.com/craftsmanBai) - <http://z1ng.net> - 原文:<http://developer.android.com/training/articles/security-tips.html>

Android内建的安全机制可以显著地减少了应用程序的安全问题。你可以在默认的系统设置和文件权限设置的环境下建立应用，避免针对一堆头疼的安全问题寻找解决方案。

一些帮助建立应用的核心安全特性如下：

* Android应用程序沙盒，将应用数据和代码的执行与其他程序隔离。
* 具有鲁棒性的常见安全功能的应用框架，例如加密，权限控制，安全IPC
* 使用ASLR，NX，ProPolice，safe_iop，OpenBSD dlmalloc，OpenBSD calloc，Linux mmap_min_addr等技术，减少了常见内存管理错误。
* 加密文件系统可以保护丢失或被盗走的设备数据。
* 用户权限控制限制访问系统关键信息和用户数据。
* 应用程序权限以单个应用为基础控制其数据。

尽管如此，熟悉Android安全特性仍然很重要。遵守这些习惯并将其作为优秀的代码风格，能够减少无意间给用户带来的安全问题。

## 数据存储

对于一个Android的应用程序来说，最为常见的安全问题是存放在设备上的数据能否被其他应用获取。在设备上存放数据基本方式有三种:

### 使用内部存储

默认情况下，你在[内部存储](http://developer.android.com/guide/topics/data/data-storage.html#filesInternal)中创建的文件只有你的应用可以访问。Android实现了这种机制，并且对于大多数应用程序都是有效的。
你应该避免在IPC文件中使用[MODE_WORLD_WRITEABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_WRITEABLE)或者[MODE_WORLD_READABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_READABLE)模式，因为它们不为特殊程序提供限制数据访问的功能，它们也不对数据格式进行任何控制。如果你想与其他应用的进程共享数据，可以使用[Content Provider](http://developer.android.com/guide/topics/providers/content-providers.html)，它可以给其他应用提供了可读写权限以及逐项动态获取权限。

如果想对敏感数据进行特别保护，你可以使用应用程序无法直接获取的密钥来加密本地文件。例如，密钥可以存放在[KeyStore](http://developer.android.com/reference/java/security/KeyStore.html)而非设备上，使用用户密码进行保护。尽管这种方式无法防止通过root权限查看用户输入的密码，但是它可以为未进行[文件系统加密](http://source.android.com/tech/encryption/index.html)的丢失设备提供保护。

### 使用外部存储

创建于[外部存储](http://developer.android.com/guide/topics/data/data-storage.html#filesExternal)的文件，比如SD卡，是全局可读写的。
由于外部存储器可被用户移除并且能够被任何应用修改，因此不应使用外部存储保存应用的敏感信息。
当处理来自外部存储的数据时，应用程序应该[执行输入验证](http://developer.android.com/training/articles/security-tips.html#InputValidation)（参看输入验证章节）
我们强烈建议应用在动态加载之前不要把可执行文件或class文件存储到外部存储中。
如果一个应用从外部存储检索可执行文件，那么在动态加载之前它们应该进行签名与加密验证。

### 使用Content Providers

[ContentProviders](http://developer.android.com/guide/topics/providers/content-providers.html)提供了一种结构存储机制，它可以限制你自己的应用，也可以允许其他应用程序进行访问。
如果你不打算向其他应用提供访问你的[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)功能，那么在manifest中标记他们为[android:exported=false](http://developer.android.com/guide/topics/manifest/provider-element.html#exported)即可。
要建立一个给其他应用使用的[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)，你可以为读写操作指定一个单一的[permission](http://developer.android.com/guide/topics/manifest/provider-element.html#prmsn)，或者在manifest中为读写操作指定确切的权限。我们强烈建议你对要分配的权限进行限制，仅满足目前有的功能即可。
记住，通常新的权限在新功能加入的时候同时增加，会比把现有权限撤销并打断已经存在的用户更合理。

如果Content Provider仅在自己的应用中共享数据，使用签名级别[android:protectionLevel](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)的权限是更可取的。
签名权限不需要用户确认，当应用使用同样的密钥获取数据时，这提供了更好的用户体验，也更好地控制了Content Provider数据的访问。
Content Providers也可以通过声明[android:grantUriPermissions](http://developer.android.com/guide/topics/manifest/provider-element.html#gprmsn)并在触发组件的Intent对象中使用[FLAG_GRANT_READ_URI_PERMISSION](http://developer.android.com/reference/android/content/Intent.html#FLAG_GRANT_READ_URI_PERMISSION)和[FLAG_GRANT_WRITE_URI_PERMISSION](http://developer.android.com/reference/android/content/Intent.html#FLAG_GRANT_WRITE_URI_PERMISSION)标志提供更细致的访问。
这些许可的作用域可以通过[grant-uri-permission](http://developer.android.com/guide/topics/manifest/grant-uri-permission-element.html)进一步限制。
当访问一个ContentProvider时，使用参数化的查询方法，比如<a href="http://developer.android.com/reference/android/content/ContentProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String">query()</a>，<a href="http://developer.android.com/reference/android/content/ContentProvider.html#update(android.net.Uri, android.content.ContentValues, java.lang.String, java.lang.String[]">update()</a>和<a href="http://developer.android.com/reference/android/content/ContentProvider.html#delete(android.net.Uri, java.lang.String, java.lang.String[]">delete()</a>来避免来自不信任源潜在的SQL注入。
注意，如果selection语句是在提交给方法之前先连接用户数据的，使用参数化的方法或许不够。
不要对“写”权限有一个错误的观念。
考虑“写”权限允许sql语句，它可以通过使用创造性的WHERE子句并且解析结果让部分数据的确认变为可能。
例如：入侵者可能在通话记录中通过修改一条记录来检测某个特定存在的电话号码，只要那个电话号码已经存在。
如果content provider数据有可预见的结构，提供“写”权限也许等同于同时提供了“读写”权限。

## 使用权限

因为安卓沙盒将应用程序隔离，程序必须显式地共享资源和数据。它们通过声明他们需要的权限来获取额外的功能，而基本的沙盒不提供这些功能，比如相机访问设备。

### 请求权限

我们建议最小化应用请求的权限数量，不具有访问敏感资料的权限可以减少无意中滥用这些权限的风险，可以增加用户接受度，并且减少应用被攻击者攻击利用的可能性。

如果你的应用可以设计成不需要任何权限，那最好不过。例如：与其请求访问设备信息来建立一个标识，不如建立一个[GUID](http://developer.android.com/reference/java/util/UUID.html)（这个例子在下文“处理用户数据”中有说明）。

除了请求权限之外，你的应用可以使用[permissions](http://developer.android.com/guide/topics/manifest/permission-element.html)来保护可能会暴露给其他应用的安全敏感的IPC：比如[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)。通常来说，我们建议使用访问控制而不是用户权限确认许可，因为权限会使用户感到困惑。例如，考虑在权限设置上为应用间的IPC通信使用单一开发者提供的[签名保护级别](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)。

不要泄漏受许可保护的数据。只有当应用通过IPC暴露数据才会发生这种情况，因为它具有特殊权限，却不要求任何客户端的IPC接口有那样的权限。更多关于这方面的潜在影响以及这种问题发生的频率在USENIX: [http://www.cs.be rkeley.edu/~afelt/felt_usenixsec2011.pdf](http://www.cs.berkeley.edu/~afelt/felt_usenixsec2011.pdf)研究论文中都有说明。

### 创建权限

通常，你应该力求建立拥有尽量少权限的应用，直至满足你的安全需要。建立一个新的权限对于大多数应用相对少见，因为[系统定义的许可](http://developer.android.com/reference/android/Manifest.permission.html)覆盖很多情况。在适当的地方使用已经存在的许可执行访问检查。

如果必须建立一个新的权限，考虑能否使用[signature protection level](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)来完成你的任务。签名许可对用户是透明的并且只允许相同开发者签名的应用访问，与应用执行权限检查一样。如果你建立一个[dagerous protction level](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)，那么用户需要决定是否安装这个应用。这会使其他开发者困惑，也使用户困惑。

如果你要建立一个危险的许可，则会有多种复杂情况需考虑：

*   对于用户将要做出的安全决定，许可需要用字符串对其进行简短的表述。
*   许可字符串必须保证语言的国际化。
*   用户可能对一个许可感到困惑或者知晓风险而选择不安装应用
*   当许可的创造者未安装的时候，应用可能要求许可。

上面每一个因素都为应用开发者带来了重要的非技术挑战，同时也使用户感到困惑，这也是我们不建议使用危险许可的原因。

## 使用网络

网络交易具有很高的安全风险，因为它涉及到传送私人的数据。人们对移动设备的隐私关注日益加深，特别是当设备进行网络交易时，因此应用采取最佳方式保护用户数据安全极为重要。

### 使用IP网络

Android下的网络与Linux环境下的差别并不大。主要考虑的是确保对敏感数据采用了适当的协议，比如使用[HTTPS进行网络传输](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)。我们在任何支持HTTPS的服务器上更愿意使用HTTPS而不是HTTP，因为移动设备可能会频繁连接不安全的网络，比如公共WiFi热点。

授权且加密的套接层级别的通信可通过使用[SSLSocket](http://developer.android.com/reference/javax/net/ssl/SSLSocket.html)类轻松实现。考虑到Android设备使用WiFi连接不安全网络的频率，对于所有应用来说，使用安全网络是极力鼓励支持的。

我们发现部分应用使用[localhost](http://en.wikipedia.org/wiki/Localhost)端口处理敏感的IPC。我们不鼓励这种方法，是因为这些接口可被设备上的其他应用访问。相反，你应该在可认证的地方使用Android IPC机制，例如[Service](http://developer.android.com/reference/android/app/Service.html)（比使用回环还糟的是绑定INADDR_ANY，因为你的应用可能收到来自任何地方来的请求，我们也已经见识过了）。

一个有必要重复的常见议题是，确保不信任从HTTP或者其他不安全协议下载的数据。这包括在[WebView](http://developer.android.com/reference/android/webkit/WebView.html)中的输入验证和对于http的任何响应。

### 使用电话网络

SMS协议是Android开发者使用最频繁的电话协议，主要为用户与用户之间的通信设计，但对于想要传送数据的应用来说并不合适。由于SMS的限制性，我们强烈建议使用[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)（GCM）和IP网络从web服务器发送数据消息给用户设备应用。

很多开发者没有意识到SMS在网络上或者设备上是不加密的，也没有牢固验证。特别是任何SMS接收者应该预料到恶意用户也许已经给你的应用发送了SMS：不要指望未验证的SMS数据执行敏感操作。你也应该注意到SMS在网络上也许会遭到冒名顶替并且/或者拦截，对于Android设备本身，SMS消息是通过广播intent传递的，所以他们也许会被其他拥有[READ_SMS](http://developer.android.com/reference/android/Manifest.permission.html#READ_SMS)许可的应用截获。

## 输入验证

无论应用运行在什么平台上，功能不完善的输入验证是最常见的影响应用安全问题之一。Android有平台级别的对策，用于减少应用的公开输入验证问题，你应该在可能的地方使用这些功能。同样需要注意的是，选择类型安全的语言能减少输入验证问题。

如果你使用native代码，那么任何从文件读取的，通过网络接收的，或者通过IPC接收的数据都有可能引发安全问题。最常见的问题是[buffer overflows](http://en.wikipedia.org/wiki/Buffer_overflow)，[use after free](http://en.wikipedia.org/wiki/Double_free#Use_after_free)，和[off-by-one](http://en.wikipedia.org/wiki/Off-by-one_error)。Android提供安全机制比如ASLR和DEP以减少这些漏洞的可利用性，但是没有解决基本的问题。小心处理指针和管理缓存可以预防这些问题。

动态、基于字符串的语言，比如JavaScript和SQL，都常受到由转义字符和[脚本注入](http://en.wikipedia.org/wiki/Code_injection)带来的输入验证问题。

如果你使用提交到SQL Database或者Content Provider的数据，SQL注入也许是个问题。最好的防御是使用参数化的查询，就像ContentProviders中讨论的那样。限制权限为只读或者只写可以减少SQL注入的潜在危害。

如果你不能使用上面提到的安全功能，我们强烈建议使用结构严谨的数据格式并且验证符合期望的格式。黑名单策略与替换危险字符是有效的，但这些技术在实践中是易错的并且当错误可能发生的时候应该尽量避免。

## 处理用户数据

通常来说，处理用户数据安全最好的方法是最小化获取敏感数据用户个人数据的API使用。如果你对数据进行访问并且可以避免存储或传输，那就不要存储和传输数据。最后，思考是否有一种应用逻辑可能被实现为使用hash或者不可逆形式的数据。例如，你的应用也许使用一个email地址的hash作为主键，避免传输或存储email地址，这减少无意间泄漏数据的机会，并且也能减少攻击者尝试利用你的应用的机会。

如果你的应用访问私人数据，比如密码或者用户名，记住司法也许要求你提供一个使用和存储这些数据的隐私策略的解释。所以遵守最小化访问用户数据最佳的安全实践也许只是简单的服从。

你也应该考虑到应用是否会疏忽暴露个人信息给其他方，比如广告第三方组件或者你应用使用的第三方服务。如果你不知道为什么一个组件或者服务请求个人信息，那么就不要提供给它。通常来说，通过减少应用访问个人信息，会减少这个区域潜在的问题。

如果必须访问敏感数据，评估这个信息是否必须要传到服务器，或者是否可以被客户端操作。考虑客户端上使用敏感数据运行的任何代码，避免传输用户数据
确保不会无意间通过过渡自由的IPC、world writable文件、或网络socket暴露用户数据给其他设备上的应用。这里有一个泄漏权限保护数据的特别例子，在[Requesting Permissions](http://developer.android.com/training/articles/security-tips.html#RequestingPermissions)章节中讨论。

如果需要GUID，建立一个大的、唯一的数字并保存它。不要使用电话标识，比如与个人信息相关的电话号码或者IMEI。这个话题在[Android Developer Blog](http://android-developers.blogspot.com/2011/03/identifying-app-installations.html)中有更详细的讨论。

应用开发者应谨慎的把log写到机器上。在Android中，log是共享资源，一个带有[READ_LOGS](http://developer.android.com/reference/android/Manifest.permission.html#READ_LOGS)许可的应用可以访问。即使电话log数据是临时的并且在重启之后会擦除，不恰当地记录用户信息会无意间泄漏用户数据给其他应用。

## 使用WebView

因为[WebView](http://developer.android.com/reference/android/webkit/WebView.html)能包含HTML和JavaScript浏览网络内容，不恰当的使用会引入常见的web安全问题，比如[跨站脚本攻击](http://en.wikipedia.org/wiki/Cross_site_scripting)（JavaScript注入）。Android采取一些机制通过限制WebView的能力到应用请求功能最小化来减少这些潜在的问题。

如果你的应用没有在WebView内直接使用JavaScript，不要调用<a href="http://developer.android.com/reference/android/webkit/WebSettings.html#setJavaScriptEnabled(boolean)">setJavaScriptEnabled()</a>。某些样本代码使用这种方法，可能会导致在产品应用中改变用途：所以如果不需要的话移除它。默认情况下WebView不执行JavaScript，所以跨站脚本攻击不会产生。

使用<a href="http://developer.android.com/reference/android/webkit/WebView.html#addJavascriptInterface(java.lang.Object, java.lang.String)">addJavaScriptInterface()</a>要特别的小心，因为它允许JavaScript执行通常保留给Android应用的操作。只把<a href="http://developer.android.com/reference/android/webkit/WebView.html#addJavascriptInterface(java.lang.Object, java.lang.String)">addJavaScriptInterface()</a>暴露给可靠的输入源。如果不受信任的输入是被允许的，不受信任的JavaScript也许会执行Android方法。总得来说，我们建议只把<a href="http://developer.android.com/reference/android/webkit/WebView.html#addJavascriptInterface(java.lang.Object, java.lang.String)">addJavaScriptInterface()</a>暴露给你应用内包含的JavaScript。

如果你的应用通过WebView访问敏感数据，你也许想要使用<a href="http://developer.android.com/reference/android/webkit/WebView.html#clearCache(boolean)">clearCache()</a>方法来删除任何存储到本地的文件。服务端的header，比如no-cache，能用于指示应用不应该缓存特定的内容。

### 处理证书

通常来说，我们建议请求用户证书频率最小化--使得钓鱼攻击更明显，并且降低其成功的可能。取而代之使用授权令牌然后刷新它。

可能的情况下，用户名和密码不应该存储到设备上，而使用用户提供的用户名和密码执行初始认证，然后使用一个短暂的、特定服务的授权令牌。可以被多个应用访问的service应该使用[AccountManager](http://developer.android.com/reference/android/accounts/AccountManager.htmls)访问。
如果可能的话，使用AccountManager类来执行基于云的服务并且不把密码存储到设备上。

使用AccountManager获取[Account](http://developer.android.com/reference/android/accounts/Account.html)之后，进入任何证书前检查[CREATOR](http://developer.android.com/reference/android/accounts/Account.html#CREATOR)，这样你就不会因为疏忽而把证书传递给错误的应用。

如果证书只是用于你创建的应用，那么你能使用<a href="http://developer.android.com/reference/android/content/pm/PackageManager.html#checkSignatures(int, int)">checkSignature()</a>验证访问AccountManager的应用。或者，如果一个应用要使用证书，你可以使用[KeyStore](http://developer.android.com/reference/java/security/KeyStore.html)来储存。

## 使用加密

除了采取数据隔离，支持完整的文件系统加密，提供安全信道之外。Android提供大量加密算法来保护数据。

通常来说，尝试使用最高级别的已存在framework的实现来支持，如果你需要安全的从一个已知的位置取回一个文件，一个简单的HTTPS URI也许就足够了，并且这部分不要求任何加密知识。如果你需要一个安全信道，考虑使用[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)或者[SSLSocket](http://developer.android.com/reference/javax/net/ssl/SSLSocket.html)要比使用你自己的协议好。

如果你发现的确需要实现一个自定义的协议，我们强烈建议你不要自己实现加密算法。使用已经存在的加密算法，比如[Cipher](http://developer.android.com/reference/javax/crypto/Cipher.html)类中提供的AES或者RSA。

使用一个安全的随机数生成器（[SecureRandom](http://developer.android.com/reference/java/security/SecureRandom.html)）来初始化加密密钥（[KeyGenerator](http://developer.android.com/reference/javax/crypto/KeyGenerator.html)）。使用一个不安全随机数生成器生成的密钥严重削弱算法的优点，而且可能遭到离线攻击。

如果你需要存储一个密钥来重复使用，使用类似于[KeyStore](http://developer.android.com/reference/java/security/KeyStore.html)的机制，来提供长期储存和检索加密密钥的功能。

## 使用进程间通信

一些Android应用试图使用传统的Linux技术实现IPC，比如网络socket和共享文件。我们强烈鼓励使用Android系统IPC功能，比如[Intent](http://developer.android.com/reference/android/content/Intent.html)，[Binder](http://developer.android.com/reference/android/os/Binder.html)，[Messenger](http://developer.android.com/reference/android/os/Messenger.html)和[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)。Android IPC机制允许你为每一个IPC机制验证连接到你的IPC和设置安全策略的应用的身份。

很多安全元素通过IPC机制共享。Broadcast Receiver, Activitie,和Service都在应用的manifest中声明。如果你的IPC机制不打算给其他应用使用，设置`android:exported`属性为false。这对于同一个UID内包含多个进程的应用，或者在开发后期决定不想通过IPC暴露功能并且不想重写代码的时候非常有用。

如果你的IPC打算让别的应用访问，你可以通过使用Permission标记设置一个安全策略。如果IPC是使用同一个密钥签名的独立的应用间的，使用[signature](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)更好一些。

### 使用Intent

Intent是Android中异步IPC机制的首选。根据你应用的需求，你也许使用<a href="http://developer.android.com/reference/android/content/Context.html#sendBroadcast(android.content.Intent)">sendBroadcast()</a>，<a href="http://developer.android.com/reference/android/content/Context.html#sendOrderedBroadcast(android.content.Intent, java.lang.String)">sendOrderedBroadcast()</a>或者直接的intent来指定一个应用组件。

注意，有序广播可以被Receiver接收，所以他们也许不会被发送到所有的应用中。
如果你要发送一个intent给指定的Receiver，这个intent必须被直接的发送给这个Receiver。

Intent的发送者能在发送的时候验证Receiver是否有一个许可指定了一个non-Null Permission。只有有那个许可的应用才会收到这个intent。如果广播intent内的数据是敏感的，你应该考虑使用许可来保证恶意应用没有恰当的许可无法注册接收那些消息。这种情况下，可以考虑直接执行这个Receiver而不是发起一个广播。

> **注意：**Intent过滤器不能作为安全特性--组件可被intent显式调用，可能会没有符合intent过滤器的数据。你应该在Intent Receiver内执行输入验证，确认对于调用Receiver，Service、或Activity来说格式正确合理。

### 使用服务

[Service](http://developer.android.com/reference/android/app/Service.html)经常被用于为其他应用提供服务。每个service类必须在它的manifest文件进行相应的声明。

默认情况下，Service不能被导出和被其他应用执行。如果你加入了任何Intent过滤器到服务的声明中，那么它默认为可以被导出。最好明确声明[android:exported](http://developer.android.com/guide/topics/manifest/service-element.html#exported)元素来确定它按照你设想的运行。可以使用[android:permission](http://developer.android.com/guide/topics/manifest/service-element.html#prmsn)保护Service。这样做，其他应用在他们自己的manifest文件中将需要声明相应的[<uses-permission>](http://developer.android.com/guide/topics/manifest/uses-permission-element.html)元素来启动、停止或者绑定到这个Service上。

一个Service可以使用许可保护单独的IPC调用，在执行调用前通过调用<a href="http://developer.android.com/reference/android/content/Context.html#checkCallingPermission(java.lang.String)">checkCallingPermission()</a>来实现。我们建议使用manifest中声明的许可，因为那些是不容易监管的。

### 使用binder和messenger接口

在Android中，[Binders](http://developer.android.com/reference/android/os/Binder.html)和[Messenger](http://developer.android.com/reference/android/os/Messenger.html)是RPC风格IPC的首选机制。必要的话，他们提供一个定义明确的接口，促进彼此的端点认证。

我们强烈鼓励在一定程度上，设计不要求指定许可检查的接口。Binder和[Messenger](http://developer.android.com/reference/android/os/Messenger.html)不在应用的manifest中声明，因此你不能直接在Binder上应用声明的许可。它们在应用的manifest中继承许可声明，[Service](http://developer.android.com/reference/android/app/Service.html)或者[Activity](http://developer.android.com/reference/android/app/Activity.html)内实现了许可。如果你打算创建一个接口，在一个指定binder接口上要求认证和/或者访问控制，这些控制必须在Binder和[Messenger](http://developer.android.com/reference/android/os/Messenger.html)的接口中明确添加代码。

如果提供一个需要访问控制的接口，使用<a href="http://developer.android.com/reference/android/content/Context.html#checkCallingPermission(java.lang.String)">checkCallingPermission()</a>来验证调用者是否拥有必要的许可。由于你的应用的id已经被传递到别的接口，因此代表调用者访问一个Service之前这尤其重要。如果调用一个Service提供的接口，如果你没有对给定的Service访问许可，<a href="http://developer.android.com/reference/android/content/Context.html#bindService(android.content.Intent, android.content.ServiceConnection, int)">bindService()</a>请求也许会失败。如果调用你自己的应用提供的本地接口，使用<a href="http://developer.android.com/reference/android/os/Binder.html#clearCallingIdentity()">clearCallingIdentity()</a>来进行内部安全检查是有用的。

更多关于用服务运行IPC的信息，参见[Bound Services](http://developer.android.com/guide/components/bound-services.html)

### 利用BroadcastReceiver

[Broadcast receivers](http://developer.android.com/reference/android/content/BroadcastReceiver.html)是用来处理通过[intent](http://developer.android.com/reference/android/content/Intent.html)发起的异步请求。

默认情况下，Receiver是导出的，并且可以被任何其他应用执行。如果你的[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)打算让其他应用使用，你也许想在应用的manifest文件中使用[<receiver>](http://developer.android.com/guide/topics/manifest/receiver-element.html)元素对receiver使用安全许可。这将阻止没有恰当许可的应用发送intent给这个[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)。

## 动态加载代码

我们不鼓励从应用文件外加载代码。考虑到代码注入或者代码篡改，这样做显著增加了应用暴露的可能，同时也增加了版本管理和应用测试的复杂性。最终可能造成无法验证应用的行为，因此在某些环境下应该被限制。

如果你的应用确实动态加载了代码，最重要的事情是记住运行动态加载的代码与应用具有相同的安全许可。用户决定安装你的应用是基于你的id，他们期望你提供任何运行在应用内部的代码，包括动态加载的代码。

动态加载代码主要的风险在于代码来源于可确认的源头。
如果这个模块是之间直接包含在你的应用中，那么它们不能被其他应用修改，不论代码是本地库或者是使用[DexClassLoader](http://developer.android.com/reference/dalvik/system/DexClassLoader.html)加载的类这都是事实。我们见过很多应用实例尝试从不安全的地方加载代码，比如从网络上通过非加密的协议或者从全局可写的位置（比如外部存储）下载数据。这些地方会允许网络上其他人在传输过程中修改其内容，或者允许用户设备上的其他应用修改其内容。

## 在虚拟机器安全性

Dalvik是安卓的运行时虚拟机(VM)。Dalvik是特别为安卓建立的，但许多其他虚拟机相关的安全代码的也适用于安卓。一般来说，你不应该关心与自己有关的虚拟机的安全问题。你的应用程序在一个安全的沙盒环境下运行，所以系统上的其他进程无法访问你的代码或私人数据。

如果你想更深入了解虚拟机的安全问题，我们建议您熟悉一些现有文献的主题。推荐两个比较流行的资源：

*   [http://www.securingjava.com/toc.html](http://www.securingjava.com/toc.html)
*   [https://www.owasp.org/index.php/Java_Security_Resources](https://www.owasp.org/index.php/Java_Security_Resources)

这个文档集中于安卓与其他VM环境不同地方。对于有在其他环境下有VM编程经验开发者来说，这里有两个普遍的问题可能对于编写Android应用来说有些不同：

*    一些虚拟机，比如JVM或者.Net，担任一个安全的边界作用，代码与底层操作系统隔离。在Android上，Dalvik VM不是一个安全边界：应用沙箱是在系统级别实现的，所以Dalvik可以在同一个应用与native代码相互操作，没有任何安全约束。
*    已知的手机上的存储限制，对来发者来说，想要建立模块化应用和使用动态类加载是很常见的。要这么做的时候需要考虑两个资源：一是在哪里恢复你的应用逻辑，二是在哪里存储它们。不要从未验证的资源使用动态类加载器，比如不安全的网络资源或者外部存储，因为那些代码可能被修改为包含恶意行为。

## 本地代码的安全

一般来说，对于大多数应用开发，我们鼓励开发者使用Android SDK而不是使用[Android NDK]（http://developer.android.com/tools/sdk/ndk/index.html) 的native代码。编译native代码的应用更为复杂，移植性差，更容易包含常见的内存崩溃错误，比如缓冲区溢出。

Android使用Linux内核编译并且与Linux开发相似，如果你打算使用native代码，安全策略尤其有用。与Linux有关的安全问题超出了本文的讨论范围，但读者可以参考[Secure Programming for Linux and Unix HOWTO](http://www.dwheeler.com/secure-programs)。

与大多数Linux环境的一个重要区别是应用沙箱。在Android中，所有的应用运行在应用沙箱中，包括用native代码编写的应用。在最基本的级别中，与Linux相似，对于开发者来说最好的方式是知道每个应用被分配一个权限非常有限的唯一UID。这里讨论的比[Android Security Overview](http://source.android.com/tech/security/index.html)中更细节化，你应该熟悉应用许可，即使你使用的是native代码。
