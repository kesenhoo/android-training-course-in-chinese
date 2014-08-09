# 安全要点

> 编写:[craftsmanBai](https://github.com/craftsmanBai) - <http://z1ng.net> - 原文:<http://developer.android.com/training/articles/security-tips.html>

Android的安全特性体现在操作系统显著地减少了应用程序的安全问题带来的影响。你可以在默认的系统设置和文件权限设置中建立app，避免了安全带来的一些头疼问题。
帮助你建立app的一些核心安全特性如下：

* Android应用程序沙盒，将你的app数据和代码执行同其他程序隔开。
* 鲁棒性实现常见安全功能的应用框架，例如密码学应用，权限控制，安全IPC
* ASLR, NX,ProPolice，safe_iop，OpenBSD dlmalloc,OpenBSD calloc,Linux mmap_min_addr等技术减少了常见内存管理错误。
* 加密文件系统可以保护丢失的或被盗走的设备的数据。
* 用户权限控制限制了访问系统详细情况和用户数据。
* 应用程序权限以单个app为基础控制了应用程序的数据。

尽管如此，熟悉Android安全特性是很重要的。遵守这些习惯将其作为好的代码风格，将会减少不经意间给用户带来的安全问题。

## 数据存储

对于一个Android的应用程序来讲，最为常见的安全问题是存放在设备上的数据能否被其他app获取。在设备上存放保存数据有三种基本的方式:

### 使用内存储器

默认情况下，你在[内存储器](http://developer.android.com/guide/topics/data/data-storage.html#filesInternal)中创建的文件只有你的app可以访问。这种机制被Android加强了并且对于大多数应用程序都是有效的。
你应该避免在IPC文件中使用[MODE_WORLD_WRITEABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_WRITEABLE)或者[MODE_WORLD_READABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_READABLE)模式，因为它们不对特殊程序提供限制数据访问的功能，它们也不对数据格式提供任何控制。如果你想同其他app的进程共享数据，你可以使用一个[content provider](http://developer.android.com/guide/topics/providers/content-providers.html)，它给其他apps提供了可读可写的权限并且可以逐项动态的获取权限。

如果想对一些敏感数据提供特别的保护，你可以选择使用应用程序无法直接获取的密钥来加密本地文件。例如，密钥可以存放在[密钥库](http://developer.android.com/reference/java/security/KeyStore.html)，使用用户密码保护的密钥，而不存储在设备上。尽管这种方式不能在具有root权限时监视用户输入的密码的情况下保护数据，但是它可以提供对没有进行[文件系统加密](http://source.android.com/tech/encryption/index.html)的丢失的设备的保护。

### 使用外部存储器

建立在[外部存储](http://developer.android.com/guide/topics/data/data-storage.html#filesExternal)的文件，比如sd卡，是全局可读写的。
因为外部存储可以被用户移除并且可被任何应用修改，应用不应该使用外部存储存储敏感信息。
当处理从外部存储来的数据时应用应该[执行输入验证](http://developer.android.com/training/articles/security-tips.html#InputValidation)（参看输入验证章节）
我们强烈建议应用在动态加载之前不把可执行或者是class文件存储到外部存储中。
如果一个应用从外部存储检索可执行文件，在动态加载之前，他们应该被签名和加密验证。

### 使用content providers

[ContentProviders](http://developer.android.com/guide/topics/providers/content-providers.html)提供一个结构存储机制，可以限制你自己的应用，或者导出给其他应用程序允许访问。
如果你不打算为其他应用提供访问你的[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)功能，在manifest中标记他们为[android:exported=false](http://developer.android.com/guide/topics/manifest/provider-element.html#exported)即可。
当建立一个由其他应用为使用而导出的[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)，你可以为读写指定一个单一的[许可](http://developer.android.com/guide/topics/manifest/provider-element.html#prmsn)，或者在manifest中为读写指定确切的许可。我们强烈建议你把你的许可限制在那些必要的事情上来完成临近的任务。
记住，通常显示新功能稍后加入许可要比把许可拿开并且打断已经存在的用户要容易。

如果你正在使用ContentProvider在相同开发者的应用间来分享数据，使用签名级别[android:protectionLevel](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)的许可是更可取的。
签名许可不需要用户确认，所以这提供一个更好的用户体验并且更能控制ContentProvider访问。
ContentProviders也可以通过声明[android:grantUriPermissions](http://developer.android.com/guide/topics/manifest/provider-element.html#gprmsn)元素并且在触发组件的Intent对象中使用[FLAG_GRANT_READ_URI_PERMISSION](http://developer.android.com/reference/android/content/Intent.html#FLAG_GRANT_READ_URI_PERMISSION)和[FLAG_GRANT_WRITE_URI_PERMISSION](http://developer.android.com/reference/android/content/Intent.html#FLAG_GRANT_WRITE_URI_PERMISSION)标志提供更颗粒状的访问。
这些许可的作用域可以通过[grant-uri-permission](http://developer.android.com/guide/topics/manifest/grant-uri-permission-element.html)元素进一步的限制。
当访问一个ContentProvider时，使用参数化的查询方法，比如[query()](http://developer.android.com/reference/android/content/ContentProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String)), [update()](http://developer.android.com/reference/android/content/ContentProvider.html#update(android.net.Uri, android.content.ContentValues, java.lang.String, java.lang.String[])),和[delete()](http://developer.android.com/reference/android/content/ContentProvider.html#delete(android.net.Uri, java.lang.String, java.lang.String[]))来避免来自不被新人的数据潜在的SQL注入。
注意，如果提交到方法之前的选择是通过连接用户数据建立的，使用参数化的方法是不够的。
不要对“写”的许可安全有一个错误的观念
考虑“写”的许可允许sql语句使得一些数据被确认使用创造性的WHERE从句并且分析结果变为可能。
例如：一个入侵者可能在通话记录中通过修改一条记录来侦察一个存在的特定的电话号码，只要那个电话号码已经存在。
如果content provider数据有可预见的结构，“写”许可也许与提供了“读写”等效了。

## 使用权限

因为安卓沙盒使应用程序隔开，程序必须显式地共享资源和数据。为了拥有附加的功能，他们通过声明他们需要的权限，而基本的沙盒不提供这些功能，包括访问设备比如相机的特性。

### 请求许可

我们建议一个应用请求的许可数量最小化，不具有访问敏感的许可可以减少无意中滥用那些许可的风险，可以让用户更能接受，并且使得攻击者对应用减少兴趣。

如果你的应用有一种可以设计出不需要任何许可的方法，那最好不过。例如：与其请求访问设备信息来建立一个标识，不如建立一个[GUID](http://developer.android.com/reference/java/util/UUID.html)（这个例子也在[Handling User Data](http://developer.android.com/training/articles/security-tips.html#UserData)中有讨论)。

除了请求许可之外，你的应用可以使用[许可](http://developer.android.com/guide/topics/manifest/permission-element.html)来保护安全敏感的IPC并且会暴露给其他应用:比如[ContentProvider](http://developer.android.com/reference/android/content/ContentProvider.html)。总的来说，我们建议使用访问控制而不是在可能的地方让用户确认许可，因为许可会是用户困惑。例如，考虑在许可上为应用间的IPC通信使用单一开发者提供的[签名保护级别](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)

不要产生许可再次授权，这只有当一个应用通过IPC暴露数据才会发生，因为它有一个指定的许可，但是并不要求它的IPC接口的任何客户端许可。潜在影响的更多细节，和这种问题发生的频率在USENIX: [http://www.cs.be rkeley.edu/~afelt/felt_usenixsec2011.pdf](http://www.cs.berkeley.edu/~afelt/felt_usenixsec2011.pdf)研究论文中都有提供。

### 创建许可

一般来说，你应该力求建立拥有尽量少许可的应用，直至满足你的安全需要。建立一个新的许可对于大多数应用是相对不常见，因为[系统定义的许可](http://developer.android.com/reference/android/Manifest.permission.html)覆盖很多情况。在适当的地方使用已经存在的许可执行访问检查。

如果你必须建立一个新的许可，考虑是否你能使用[签名许可](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)完成你的任务。签名许可对用户是透明的并且只允许相同开发者签名的应用访问同应用执行许可检查一样。如果你建立一个[危险的许可](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)，那么用户需要决定是否安装这个应用。这会使其他开发着困惑，也使用户困惑。

如果你建立一个危险的许可，那么会有非常多的复杂情况需要你考虑：

*   许可必须有一个字符串简短的表述给用户他们将要要求做出的安全策略
*   许可字符必须做很多语言的国际化
*   用户也许由于对一个许可风险的困惑或者知晓而选择不安装应用

上面每一个因素都都应用开发者提出一个重要的非技术的挑战，这也是我们劝阻使用危险许可的原因。

## 使用网络

网络交易具有很高的安全风险，因为它涉及到传送私人的数据。人们对移动设备的隐私关注日益加深，特别是当设备进行网络交易时，因此app采用最好的方式保护用户诗句是非常重要的。

### 使用IP网络

android上面的网络与Linux环境上的差别不是很大。主要考虑的是保证对敏感数据使用适当的协议，比如使用[HTTPS进行网络传输](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)。我们在任何服务器支持HTTPS的地方更愿意使用HTTPS而不是HTTP，因为移动设备频繁连接不安全的网络，比如公共的WiFi热点。

认证的、加密的socket级别的通信可以使用[SSLSocket](http://developer.android.com/reference/javax/net/ssl/SSLSocket.html)类轻松的实现。根据Android设备使用WiFi连接不安全网络的频率，对于所有应用来说，使用安全网络是强烈被支持的。

我们见过一些应用使用[本地网络](http://en.wikipedia.org/wiki/Localhost)端口处理敏感的IPC。我们不鼓励这种方法因为这些接口是可以被设备上的其他应用访问的。取而代之，在可以认证的地方使用一个android IPC机制，例如[Service](http://developer.android.com/reference/android/app/Service.html)（比使用回环还糟的是绑定INADDR_ANY，因为你的应用也许收到任何地方来的请求。我们也已经见识过了）。

一个有必要重复的常见的议题是，保证你不信任从HTTP或者其他不安全协议下载的数据。这包括在[WebView](http://developer.android.com/reference/android/webkit/WebView.html)中的输入验证和相对于http的任何响应。

### 使用电话网络

SMS是Android开发者使用最频繁的电话协议。开发者应该记住这个协议主要是设计为用户与用户之间的交流，它并不适用一些应用的目的。由于SMS的限制，我们强烈建议使用[Google Cloud Messaging](http://developer.android.com/google/gcm/index.html)（GCM）和IP网络发送数据消息给设备。

很多开发者没有意识到SMS在网络上或者设备上不是加密的或者牢固验证的。尤其是，任何SMS接收者应该预料到恶意用户也许已经给你的应用发送了SMS：不要指望未验证的SMS数据执行敏感操作。你也应该注意到SMS在网络上也许会遭到冒名顶替并且/或者拦截，在Android设备本身上面，SMS消息是通过广播intent传递的，所以他们也许会被其他拥有[READ_SMS](http://developer.android.com/reference/android/Manifest.permission.html#READ_SMS)许可的应用截获。

## 输入验证

不管应用运行在什么平台上，功能不完善的输入验证是最常见的影响应用安全问题之一。Android有平台级别的对策，用于减少应用的公开输入验证问题，你应该在可能的地方使用这些功能。同样需要注意的是，安全类型语言的选择倾向去减少输入验证问题的可能。我们强烈建议使用Android SDK建立你的应用。

如果你使用native代码，那么任何从文件读取的数据，通过网络接收的，或者通过IPC接收的都有可能引入安全问题。最常见的问题是[缓存溢出](http://en.wikipedia.org/wiki/Buffer_overflow)，[释放后使用](http://en.wikipedia.org/wiki/Double_free#Use_after_free)，和[off-by-one](http://en.wikipedia.org/wiki/Off-by-one_error)错误。Android提供一些技术比如ASLR和DEP减少这些错误的可利用性，但是他们没有解决基本的问题。小心处理指针和管理缓存可以预防这些问题。

动态，基于语言的字符串，比如JavaScript和SQL，都常遭受由转义字符和[脚本注入](http://en.wikipedia.org/wiki/Code_injection)带来的输入验证问题。

如果你使用提交到SQL Database或者Content Provider查询中数据，SQL也许会是个问题。最好的防御是使用参数化的查询，同ContentProviders中讨论的那样。限制权限为只读或者只写可以减少SQL注入潜在危害。

如果你不能使用上面提到的安全功能，我们强烈建议使用结构严谨的数据格式并且验证符合期望的格式。黑名单策略与替换危险字符是一种有效的策略，这些技术在实践中是易错并且当错误可能发生的时候应该尽量避免。

## 处理用户数据

一般来说，最好的处理方法是最小化反问敏感或个人数据的API使用。如果你有对数据的访问并且可以避免存储或者传输信息，那就不要存储或者传输数据。最后，考虑如果有一种你的应用逻辑可能被实现为使用hash或者不可逆形式的数据的方法。例如，你的应用也许使用一个email地址的hash作为主键，避免传输或存储email地址，这减少无意暴露数据的机会，并且它也能减少攻击者尝试利用你的应用的机会。

如果你的应用访问私人数据，比如密码或者用户名，记住司法权也许要求你提供一个你使用和存储这些数据的隐私策略的解释。所以采用最小化访问用户数据的安全最佳实践也许也是单纯的顺从。

你也应该考虑你应用是否会疏忽的暴露个人信息给其他方，比如广告第三方组件或者你应用使用的第三方服务。如果你不知道为什么一个组件或者服务请求个人信息，那么就不要提供给它。一般来说说，通过减少你应用中访问个人信息，将会减少这个区域潜在的问题。

如果必须访问敏感数据，评估这个信息是否必须要传到服务器，或者是否可以被客户端操作。考虑客户端上使用敏感数据运行的任何代码避免传输用户数据
保证你不会无意中通过过渡自由的IPC，world writable文件，或者网络socket暴露用户数据给其他设备上的应用。这是一个再次授权的特别的例子，在[请求权限](http://developer.android.com/training/articles/security-tips.html#RequestingPermissions)章节中讨论。

如果请求全球唯一标识符，建立一个大的，唯一的数字并保存它。不要使用电话标识，比如与个人信息相关的电话号码或者IMEI。这个话题在[Android Developer Blog](http://android-developers.blogspot.com/2011/03/identifying-app-installations.html)中有更详细的讨论，应用开发这应该谨慎的把log写到机器上。

在Android中，log是共享资源，一个带有[READ_LOGS](http://developer.android.com/reference/android/Manifest.permission.html#READ_LOGS)许可的应用可以访问。即使电话log数据是临时的并且在重启之后会擦除，不恰当的记录用户信息也会无意的泄漏用户数据给其他应用。

## 使用WebView

因为[WebView](http://developer.android.com/reference/android/webkit/WebView.html)能包含HTML和JavaScript浏览网络内容，不恰当的使用会引入常见的web安全问题，比如[跨站脚本攻击](http://en.wikipedia.org/wiki/Cross_site_scripting)（JavaScript注入）。Android包含一些机制通过限制WebView的能力到你应用请求的功能最小化来减少这些潜在问题的范围。

如果你的应用没有在WebView内直接使用JavaScript，不要调用[setJavaScriptEnabled()](http://developer.android.com/reference/android/webkit/WebSettings.html#setJavaScriptEnabled(boolean))。我们见过这个方法在简单的代码中执行，也许会导致在产品应用中改变用途：所以如果必要的化移除它。默认的，WebView不执行JavaScript，所以跨站脚本攻击不可能产生。

使用[addJavaScriptInterface()](http://developer.android.com/reference/android/webkit/WebView.html#addJavascriptInterface(java.lang.Object, java.lang.String))要特别的小心，因为它允许JavaScript执行通常保留给Android应用的操作。只把addJavaScriptInterface()暴露给可靠的输入源。如果不受信任的输入是被允许的，不受信任的JavaScript也许会执行Android方法。总的来说，我们建议只把addJavaScriptInterface()暴露给你应用apk内包含的JavaScript。

如果你的应用通过WebView访问敏感数据，你也许想要使用[clearCache()](http://developer.android.com/reference/android/webkit/WebView.html#clearCache(boolean))方法来删除任何存储到本地的文件。服务端的header，比如no-cache，能用于指示应用不应该缓存特定的内容。

### 处理证书

一般来说，我们建议请求用户证书频率最小化：使得钓鱼攻击更明显，并且降低其成功的可能。取而代之使用授权令牌然后刷新它。

可能的情况下，用户名和密码不应该存储到设备上，取而代之，使用用户提供的用户名和密码执行初始认证，然后使用一个短暂的，特定服务的授权令牌。可以被多个应用访问的service应该使用[AccountManager](http://developer.android.com/reference/android/accounts/AccountManager.htmls)访问。
如果可能的话，使用AccountManager类来执行基于云的服务并且不把密码存储到设备上。

使用AccountManager获取[Account](http://developer.android.com/reference/android/accounts/Account.html)之后，进入任何证书前检查[CREATOR](http://developer.android.com/reference/android/accounts/Account.html#CREATOR)，这样你就不会因为疏忽而把证书传递给错误的应用。

如果证书只是用于你建立的应用，那么你能使用[checkSignature()](http://developer.android.com/reference/android/content/pm/PackageManager.html#checkSignatures(int, int))验证访问AccountManager的应用。另一种选择，如果一个应用要使用证书，你可以使用一个[KeyStore](http://developer.android.com/reference/java/security/KeyStore.html)来储存。

## 使用密码学

除了提供数据隔离之外，支持完整的文件系统加密，并且提供安全交流通道。Android提供大量加密算法来保护数据。

一般来说，尝试使用最高级别的以存在framework的实现能支持你的用例，如果你需要安全的从一个已知的位置取回一个文件，一个简单的HTTPS URI也许就足够了，并且这部分不要求任何加密知识。如果你需要一个安全隧道，考虑使用[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)或者[SSLSocket](http://developer.android.com/reference/javax/net/ssl/SSLSocket.html)，要比使用你自己的协议好。

如果你发现你的确需要实现你自己的协议，我们强烈建议你不要实现你自己的加密算法。使用已经存在的加密算法，比如[Cipher](http://developer.android.com/reference/javax/crypto/Cipher.html)类中提供的AES或者RSA的实现。

使用一个安全的随机数生成器（[SecureRandom](http://developer.android.com/reference/java/security/SecureRandom.html)）来初始化加密的key（[KeyGenerator](http://developer.android.com/reference/javax/crypto/KeyGenerator.html)）。使用一个不受由安全随机数生成器生成的key严重削弱算法的优点，而且有能允许离线攻击。

如果你需要存储一个key来重复使用，使用类似于[KeyStore](http://developer.android.com/reference/java/security/KeyStore.html)的机制，提供一种机制长期储存和检索加密的key。

## 使用进程间通信

一些Android应用试图使用传统的Linux技术实现IPC，比如网络socket和共享文件。我们强烈鼓励使用Android系统IPC功能，比如[Intent](http://developer.android.com/reference/android/content/Intent.html)，[Binder](http://developer.android.com/reference/android/os/Binder.html)，[Messenger](http://developer.android.com/reference/android/os/Messenger.html)和[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)。Android IPC机制允许你为每一个IPC机制验证连接到你的IPC和设置安全策略的应用的身份。

很多安全元素通过IPC机制共享。Broadcast Receiver, Activitie,和Service都在应用的manifest中声明。如果你的IPC机制不打算给其他应用使用，设置`android:exported`属性为false。这对由同一个UID内多个进程应用，或者你在开发后期决定不想通过IPC暴露功能但是你又不想重写代码是很有用的。

如果你的IPC打算让别的应用访问，你可以通过使用Permission标记设置一个安全策略。如果IPC是相同开发者应用间的，使用[签名级的许可](http://developer.android.com/guide/topics/manifest/permission-element.html#plevel)更好一些。

### 使用意图

Intent是Android中异步IPC机制的首选。根据你应用的需求，你也许使用[sendBroadcast()](http://developer.android.com/reference/android/content/Context.html#sendBroadcast(android.content.Intent)),[sendOrderedBroadcast()](http://developer.android.com/reference/android/content/Context.html#sendOrderedBroadcast(android.content.Intent, java.lang.String))或者直接的intent来指定一个应用组件。

注意，有序广播可以被接收者“消费”，所以他们也许不会被发送到所有的应用中。
如果你打算在必须发送给一个指定的receiver的地方发送一个intent，这个intent必须被直接的发送给这个receiver。

intent的发送者能在发送的时候验证接受者是否有一个许可指定了一个non-Null Permission。只有有那个许可的应用才会收到这个intent。如果在广播intent内的数据是敏感的，你应该考虑使用一个许可来保证恶意应用没有恰当的许可无法注册接收那些消息。那种环境下，你也许也考虑直接执行这个receiver而不是发起一个广播。

### 使用服务

[Service](http://developer.android.com/reference/android/app/Service.html)经常被用于为其他应用提供功能供其使用。每一个service类必须在它的包的AndroidManifest.xml中有相应的声明。

默认的，Service被导出并且可以被其他应用执行。可以在manifest文件中的<service>标记使用[android:permission](http://developer.android.com/guide/topics/manifest/service-element.html#prmsn)保护Service。这样做，其他应用在他们自己的manifest文件中将需要声明一个相应的<uses-permission>元素来启动，停止或者绑定到这个service上。

一个Service可以保护单独的具有许可的IPC调用它，在执行那个调用的实现之前，通过调用[checkCallingPermission()](http://developer.android.com/reference/android/content/Context.html#checkCallingPermission(java.lang.String))实现保护。我们一般建议使用manifest中声明的许可，因为那些是不容易监管的

### 使用binder和AIDL接口

在Android中，[Binders](http://developer.android.com/reference/android/os/Binder.html)是RPC-style IPC的首选机制。必要的话，他们提供一个定义明确的接口，促进彼此的端点认证。
我们强烈鼓励在一定程度上设计不要求接口指定许可检查的接口。Binder不在应用的manifest中声明，并且因此你不能直接在Binder上应用声明的许可。Binder继承在应用在manifest中[Service](http://developer.android.com/reference/android/app/Service.html)或者[Activity](http://developer.android.com/reference/android/app/Activity.html)声明的，Service或者Activity内实现了的许可。如果你打算建立一个接口，在一个指定binder接口上要求验证并且（或者）要求访问控制，这些控制必须在接口中清楚的在代码中添加。

如果提供一个需要访问控制的接口，使用[checkCallingPermission()](http://developer.android.com/reference/android/content/Context.html#checkCallingPermission(java.lang.String))来验证Binder的主叫者是否拥有必要的许可。因为你的应用的id已经被传递到别的interface，所以代表访问一个Service之前这尤其重要。如果执行一个service提供的接口，如果你没有对给定的service的访问许可，[bindService()](http://developer.android.com/reference/android/content/Context.html#bindService(android.content.Intent, android.content.ServiceConnection, int))请求也许会失败。如果调用一个你自己应用提供的本地的接口，使用[clearCallingIdentity()](http://developer.android.com/reference/android/os/Binder.html#clearCallingIdentity())来消除内部的安全检查也行是有用的。

### 利用广播接收机

[Broadcast receivers](http://developer.android.com/reference/android/content/BroadcastReceiver.html)是用来处理通过[intent](http://developer.android.com/reference/android/content/Intent.html)发起的异步请求。

默认的，receiver是导出的并且可以被其他任何应用执行。如果你的BroadcastReceiver打算让其他应用使用，你也许想要在应用的manifest文件中使用<receiver>元素对receiver应用安全许可。这将阻止没有恰当许可的应用发送intent给这个BroadcastReceiver。

## 动态加载代码

我们强烈不鼓励从应用apk文件外加载代码。这样做显著增加了应用泄漏的可能，取决于代码注入或者代码篡改，也增加了版本管理和应用测试的复杂性。最终，它会使得不可验证一个应用的行为，所以它也许在一些环境下被进制。

如果你的应用确实动态加载了代码，最重要的事情是记住运行动态加载的代码与应用apk具有相同的安全许可。用户决定安装你的应用是基于你的id，他们期望你提供任何在应用内运行的代码，包括动态加载的代码与动态加载代码结合的重要的安全风险是代码需要代码需要来自可信资源。

如果这个模块是之间在你的apk中包含，那么他们不能被其他应用修改，不论代码是本地库或者是使用DexClassLoader加载的类这都是事实。我们见过很多应用实例尝试从不安全的位置加载代码，比如从网络上通过非加密的协议下载或者从world writable位置（比如外部存储）。这些位置会允许网络上的人在传输过程中修改其内容，或者允许用户设备上的另一个应用修改其内容。

## 在虚拟机器安全性

编写运行在虚拟机的安全代码是一个精心研究的话题，很多问题并不特指在Android上。
相比尝试重新讲解这些话题，我们推荐你熟悉已有的文献。

*   [http://www.securingjava.com/toc.html](http://www.securingjava.com/toc.html)

*   [https://www.owasp.org/index.php/Java_Security_Resources](https://www.owasp.org/index.php/Java_Security_Resources)

这个文档集中于Android专有的并/或者与其他环境不同地方。对于有在其他环境上的VM编程经验开发者，这有这有两个普遍的问题也许对于编写Android应用来说有些不同：

*    一些虚拟机，比如JVM或者.net，担任一个安全的边界作用，代码与底层操作系统能力相隔离。在Android上，Dalvik VM不是一个安全边界：应用沙箱是在系统级别实现的，所以Dalvik可以在同一个应用与native代码相互操作没有任何约束。

*    已知的手机上的存储限制，对来发者来说，想要建立模块化应用和使用动态类加载是很常见的。当这么做的时候，要考虑两个资源：一个是你在哪里恢复你的应用逻辑，另一个是你在哪里存储它们。不要从未验证的资源使用动态类加载器，比如不安全的网络资源或者外部存储，因为那些代码可能被修改为包含恶意的行为。

## 在本地代码的安全

一般来说，对于大多数应用开发，我们鼓励开发者使用Android SDK而不是使用[Android NDK]（http://developer.android.com/tools/sdk/ndk/index.html) 的native代码。编译native代码的应用更为复杂，移植性差，更容易包含常见的内存崩溃错误，比如缓冲区溢出。

Android使用Linux内核编译并且与Linux开发相似，如果你打算使用native代码，安全最佳实践尤其有用。这篇文档讨论这些所有的最佳实践实在太短了，但是最受欢迎的资源之一是“Secure Programming for Linux and Unix HOWTO”，在这里可以找到[http://www.dwheeler.com/secure-programs
Android](http://www.dwheeler.com/secure-programs)。

和大多数Linux环境之前的一个重要区别是应用沙箱。在Android中，所有的应用运行在应用沙箱中，包括那些用native代码编写的应用。在最基本的级别中，对于开发者来说，一种考虑它的好的办法与Linux相似，知道每一个应用被分配一个具有非常有限权限的唯一UID。这里讨论的比[Android Security Overview](http://source.android.com/tech/security/index.html)中更细节化，你应该熟悉应用许可，即使你使用的是native代码。

下一篇：[使用HTTPS与SSL](security-ssl.html)
