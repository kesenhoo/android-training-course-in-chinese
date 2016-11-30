# 系统权限

编写:[Goerver](https://github.com/orangebook) - 原文: System Permissions https://developer.android.com/guide/topics/security/permissions.html#permissions

安卓是一个特权分离的操作系统，其中每个应用程序运行一个不同的系统标识（用户身份证和组标识符）。系统的部分也被分离成不同的身份。因此，从系统中分离应用程序和系统。

通过“permission”机制，执行具体的操作限制一个特定的进程可以提供额外的细粒度安全特性，和每个URI权限授予临时访问特定的数据块。

本文档介绍了应用程序开发人员如何使用由安卓提供的安全功能。更多概述请见[Android Security Overview](http://source.android.com/tech/security/index.html)。

## 安全体系结构
安卓安全体系结构的一个中心设计点是：默认情况下，没有应用程序，有权限执行任何会对其他应用程序、操作系统或用户产生不利影响的操作。这包括阅读或写用户的私人数据（如联系人或电子邮件），阅读或写另一个应用程序的文件，执行网络访问，保持设备的唤醒状态，等等。

由于每个安卓应用程序都在一个进程中运行，应用程序必须显式地共享资源和数据。他们这样做是通过声明他们所需要的额外功能所需的权限，而不是基本的。应用程序静态地声明他们需要的权限，而安卓系统会提示用户的同意。

应用程序沙盒技术并不依赖于用于构建应用程序的技术。特别是Dalvik虚拟机不是一个安全的边界，任何应用都可以运行本地代码（见[Android NDK](https://developer.android.com/tools/sdk/ndk/index.html)）。所有类型的应用程序的java，native，和hybrid以相同的方式在沙盒中运行和彼此之间都有相同的安全度。

## 应用程序签名
APKs（.apk文件）必须与证书的私钥是由开发者签署。该证书确定了应用程序的作者。该证书不需要由证书颁发机构签名；它是完全允许的，是典型的，对于使用自签名证书的安卓应用程序。在安卓的证书的目的是区分应用程序的作者。这允许系统授予或拒绝用[程序访问签名级权限](https://developer.android.com/guide/topics/manifest/permission-element.html#plevel)应，并授予或拒绝[应用程序的请求](https://developer.android.com/guide/topics/manifest/manifest-element.html#uid)，以给予相同的身份作为另一个应用程序。

## 文件访问
在安装时，安卓给每个包一个不同的的用户身份。的身份保持不变的包的生命的持续时间在该设备上。在不同的设备上，相同的包可能有不同的UID；重要的是，每个包有一个给定的设备不同的UID。
由于安全性强制执行在过程级别上，任何两个包的代码不能正常运行在同一个进程中，因为它们需要作为不同的用户运行。你可以使用AndroidManifest.xml sharedUserId属性。XML中的每个包的清单标签来给他们分配相同的用户ID。通过这样做，出于安全目的这两个包被视为相同的应用程序，使用相同的用户ID和文件权限。为了保持安全，具有相同签名的只有两个应用程序（和请求相同的sharedUserId）将获得相同的用户ID。
由应用程序存储的任何数据将被分配到应用程序的用户标识，而不是通常访问其他包。创建新文件时getsharedpreferences（String，int）、openFileOutput（String，int），或openorcreatedatabase（String，int，SQLite数据库，cursorfactory），你可以使用mode_world_readable和/或mode_world_writeable标志允许其他包的读/写文件。当设置这些标志时，该文件仍然拥有您的应用程序，但它的全局读和/或写权限已被设置适当，所以任何其他应用程序可以看到它。

## Using Permissions
一个基本的安卓应用程序没有与它相关的默认权限，这意味着它不能做任何会对用户体验或设备上的任何数据产生不利影响的事情。为了使用该设备的受保护的功能，您必须包括一个或多个“使用权限”标签在您的应用程序清单中。

例如，一个需要监视传入的短信的应用程序将指定:

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.android.app.myapp" >
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    ...
</manifest>
```

如果您的应用程序在其清单中列出了正常的权限（即不给用户的隐私或设备的操作带来太大风险的权限），系统会自动授予这些权限。如果您的应用程序在其清单中列出了危险的权限（即可能会影响用户的隐私或设备的正常操作的权限），系统要求用户明确地授予这些权限。安卓的方式使请求取决于系统版本，而系统版本是由你的应用程序：

* 如果设备运行的是Android 6（API Level 23）或更高，与APP的targetSdkVersion是23或更高，应用程序要求的权限由用户在运行时。用户可以在任何时候撤销权限，所以应用程序需要检查它是否在每次运行时都有权限。有关在您的应用程序中请求权限的更多信息，请参见使用系统权限培训指南的工作。

* 如果设备运行的是Android 5.1（API Level 22）或更低，或应用程序的targetSdkVersion是22或更低，系统会要求用户授予权限，当用户安装的应用程序。如果您添加了一个新的权限，以更新版本的应用程序，系统要求用户授予该权限时，用户更新的应用程序。一旦用户安装该应用程序，他们可以撤销许可的唯一途径是通过卸载应用程序。

通常权限的失败将导致抛出一个SecurityException异常中的应用。然而，这是不保证发生的地方。例如，sendBroadcast（意图）方法检查权限的数据被传送到接收者，在方法调用返回，所以你不会有权限失败接受例外。在几乎所有的情况下，但是，权限失败将被打印到系统日志中。

通过Android系统提供的权限可以在manifest.permission。任何应用程序也可以定义和执行它自己的权限，所以这不是一个全面的所有可能的权限列表。

在程序的操作过程中，可以在一些地方执行特定的权限：
在调用系统的时候，以防止应用程序执行某些功能。
在启动一个活动时，以防止应用程序启动其他应用程序的活动。
无论是发送和接收广播，控制谁可以接收你的广播或谁可以发送广播给你。
当访问和在内容提供商上操作时。
绑定到或启动服务。

## 自动许可的调整
随着时间的推移，新的限制可能会添加到该平台，这样，为了使用某些的原料药，您的应用程序必须要求一个许可，它以前不需要。由于现有的应用程序假设访问这些应用程序的免费可用，安卓系统可以应用新的权限请求到应用程序的清单，以避免打破了应用程序在新的平台版本。Android会决定是否一个应用程序可能需要基于提供targetSdkVersion属性值的权限。如果该值低于添加权限的版本，则在“权限”中添加了“权限”。

例如，在write_external_storage权限是在API Level 4添加限制访问共享存储空间。如果你的targetSdkVersion是3或更低，这一权限添加到您的应用程序的较新版本的Android。

> 警告：如果一个许可被自动添加到你的应用程序，你的应用程序在谷歌上市，列出这些额外的权限，即使你的应用程序可能不需要他们。

为了避免这一点，删除默认的权限，你不需要，随时更新你的targetSdkVersion尽可能高。你可以看到有哪些权限被添加在build.version_codes文件的每个版本。


## 正常和危险的权限
系统权限分为几个保护级别。知道有关的两个最重要的保护级别是正常的和危险的权限：

* 正常权限覆盖的领域，您的应用程序需要访问的数据或资源以外的应用程序的“的”的“，”，但很少有风险，用户的隐私或其他应用程序的操作。例如，设置时区的权限是一个正常的权限。如果一个应用程序声明它需要一个正常的权限，系统会自动授予应用程序的权限。对于当前正常权限的完整列表，请参见“正常权限”。

* 危险的权限覆盖的区域，该应用程序需要的数据或资源，涉及用户的私人信息，或可能会影响用户的存储数据或其他应用程序的操作。例如，读取用户联系人的能力是一个危险的权限。如果一个应用程序声明，它需要一个危险的权限，用户必须明确地授予该应用程序的权限。

## 权限组
所有危险的安卓系统权限都属于权限组。如果设备运行的是Android 6（API Level 23）和应用程序的targetSdkVersion是23或更高，下面的系统行为适用于当您的应用程序请求一个危险的许可：

* 如果一个应用程序请求在其清单中列出的危险的许可，和应用程序目前没有在权限组中有任何权限，系统显示了一个对话框，用户描述的权限组，该应用程序希望访问。该对话框不描述该组内的特定权限。例如，如果一个应用程序请求的read_contacts权限，系统对话框只是表示该应用程序需要访问设备的接触。如果用户批准批准，系统提供的应用程序只是它要求的权限。

* 如果一个应用程序请求在其清单中列出的危险的许可，并且应用程序已经在同一个权限组中有另一个危险的权限，系统立即授予权限，而没有任何与用户的交互。例如，如果一个应用程序曾要求和被授予read_contacts许可，并要求write_contacts，系统立即授予该权限。<br>
任何权限都可以属于一个权限组，包括您的应用程序定义的正常权限和权限。然而，一个权限的组只会影响用户体验，如果许可是危险的。您可以忽略正常权限的权限组。

如果设备运行的是Android 5.1（API Level 22）或更低，或应用程序的targetSdkVersion是22或更低，系统会要求用户授予权限在安装的时候。再次，系统只是告诉用户什么权限组的应用程序的需求，而不是个人的权限。

Table 1. Dangerous permissions and permission groups.

|Permission Group|	Permissions|
| --------  | :----:  |
|CALENDAR   | READ_CALENDAR <br> WRITE_CALENDAR|
|CAMERA |CAMERA|
|CONTACTS|READ_CONTACTS<br>WRITE_CONTACTS<br>GET_ACCOUNTS|
|LOCATION|ACCESS_FINE_LOCATION<br>ACCESS_COARSE_LOCATION|
|MICROPHONE|RECORD_AUDIO|
|PHONE|READ_PHONE_STATE<br>CALL_PHONE<br>READ_CALL_LOG<br>WRITE_CALL_LOG<br>ADD_VOICEMAIL<br>USE_SIP<br>PROCESS_OUTGOING_CALLS|
|SENSORS|BODY_SENSORS|
|SMS|SEND_SMS<br>RECEIVE_SMS<br>READ_SMS<br>RECEIVE_WAP_PUSH<br>RECEIVE_MMS|
|STORAGE|READ_EXTERNAL_STORAGE<br>WRITE_EXTERNAL_STORAGE<br>|

## 定义和执行权限
执行你自己的权限，你首先必须在AndroidManifest.xml使用一个或多个<权限>元素声明。

例如，一个要控制的应用程序可以启动一个活动，可以声明此操作的权限如下：

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp" >
    <permission android:name="com.example.myapp.permission.DEADLY_ACTIVITY"
        android:label="@string/permlab_deadlyActivity"
        android:description="@string/permdesc_deadlyActivity"
        android:permissionGroup="android.permission-group.COST_MONEY"
        android:protectionLevel="dangerous" />
    ...
</manifest>
```
> 注：该系统不允许多个包以相同的名称声明一个权限，除非所有的包都与相同的证书签署。如果一个包声明了一个许可，该系统不允许用户以相同的权限名称安装其他包，除非这些包以相同的证书作为第一个包签署。为了避免命名冲突，我们建议使用反向域风格命名自定义权限，例如com.example.myapp.engage_hyperspace。

ProtectionLevel属性是必需的，告诉系统用户如何被告知需要这个权限，或谁可以拥有这个权限，在链接的文档描述。

安卓：permissiongroup属性是可选的，并且只用于帮助系统显示权限的用户。在大多数情况下，你会想把这一标准系统集团（Android。清单。permission_group上市），虽然你可以定义一组自己。它最好使用一个现有的组，因为这简化了用户显示给用户的权限用户界面。

您需要提供权限的标签和描述。这些是字符串资源，用户可以看到，当他们正在查看一个列表的权限（安卓：标签）或在一个单一的权限（安卓：描述）。标签应该简短；几句话描述功能的关键部分的权限是保护。描述应该是一对夫妇的句子描述什么允许一个持有人做什么。我们的约定是一二句描述：第一句描述的是允许的，第二句警告用户的类型的东西，如果一个应用程序被授予许可，可能会出错。

这是一个为call_phone许可标签和描述的例子：

```
<string name="permlab_callPhone">directly call phone numbers</string>
<string name="permdesc_callPhone">Allows the application to call
    phone numbers without your intervention. Malicious applications may
    cause unexpected calls on your phone bill. Note that this does not
    allow the application to call emergency numbers.</string>
```

您可以使用当前在系统中定义的权限，使用设置应用程序和壳命令的“亚开行壳”列表权限列表权限。要使用“设置应用程序”，转到“设置”>应用程序。选择一个应用程序，并向下滚动查看应用程序使用的权限。对于开发人员来说，亚开行的选项以类似于用户将如何看到他们的形式显示权限：

```
$ adb shell pm list permissions -s
All Permissions:

Network communication: view Wi-Fi state, create Bluetooth connections, full
Internet access, view network state

Your location: access extra location provider commands, fine (GPS) location,
mock location sources for testing, coarse (network-based) location

Services that cost you money: send SMS messages, directly call phone numbers

...
```

## 自定义权限的建议
应用程序可以定义自己的自定义权限，并通过定义<uses-permission>元素来自定义其他应用程序的自定义权限。然而，你应该仔细评估是否有必要为您的应用程序这样做。

* 如果你正在设计一系列的应用程序，这些应用程序可以互相公开功能，尝试设计应用程序，以便每个权限只定义一次。你必须这样做，如果应用程序都不是都与相同的证书签署。即使应用程序都有相同的证书，这是一个最好的做法来定义每一次只允许一次。
* 如果功能只提供给应用程序与提供应用程序相同的签名的应用程序，您可能可以避免通过使用签名检查来定义自定义权限。当你的一个应用程序提出了另一个应用程序的请求时，第二个应用程序可以验证这两个应用程序在遵循请求之前都是有相同的证书的。
* 如果你正在开发一套应用程序只运行在你自己的设备上，你应该开发和安装一个包，管理在套件中的所有应用程序的权限。此包不需要提供任何服务本身。它只是声明了所有的权限，以及在套件中的其他应用程序请求这些权限与<uses-permission>元素。

## 在AndroidManifest.xml执行权限
你可以申请高级权限限制访问整个系统的组件或应用程序通过你的xml。要做到这一点，包括一个安卓：在所需的组件上的权限属性，命名控制访问它的权限。

**Activity** 权限（适用于<activity>标签）限制谁可以启动关联的活动。权限检查在 Context.startActivity()和Activity.startActivityForResult()；如果对方没有所需的权限，则会抛出一个SecurityException。

**Service** 权限（适用于“服务”标签）限制谁可以启动或绑定到关联的服务。权限检查在 Context.startService(),Context.stopService()和Context.bindService()；如果对方没有所需的权限，则会抛出一个SecurityException。

**BroadcastReceiver** 权限（适用于<receiver>标签）限制谁可以发送广播的接收机。权限检查后的Context.sendbroadcast()返回，作为系统试图将提交的广播给接收机。因此，权限失败不会导致向调用方返回一个异常；它只是不提供意图。以同样的方式，一个权限可以提供上Context.registerreceiver()控制谁可以广播到程序中注册的接收器。走另一条路，一个权限可以提供当调用Context.sendbroadcast()限制BroadcastReceiver对象允许接收广播（见下文）。

**ContentProvider** 权限（适用于 <provider>标签）限制谁可以访问类的数据。（内容提供商有一个重要的附加安全设施提供给他们所谓的 URI permissions，稍后介绍。）不像其他组件，有两个单独的权限属性可以设置：Android readPermission限制谁可以从供应商、阅读和Android：writePermission限制谁可以写它。请注意，如果一个提供程序的保护与读写权限，只持有写权限并不意味着你可以从供应商阅读。权限检查当你第一次检索提供者（如果你没有任何权限，将抛出SecurityException），当你对供应商进行操作。使用ContentResolver.query()需要持有读权限；使用ContentResolver.insert()，ContentResolver.update()，ContentResolver.delete()需要写权限。在所有这些情况下，没有所需的权限导致SecurityException被抛出。

## 发送广播时的执行权限
除了允许执行谁可以发送意图注册[BroadcastReceiver](https://developer.android.com/reference/android/content/BroadcastReceiver.html)（如上所述），你也可以指定所需的权限在发送一个广播。通过调用 Context.sendBroadcast()有了一个允许字符串，您需要一个接收器的应用程序必须保持该权限，以便接收您的广播。
请注意，一个接收器和一个广播机构都可以需要一个权限。当这种情况发生时，两个权限检查必须传递给要传递给相关目标的意图。

## 其他权限实施
任意的细粒度权限可以强制执行任何调用服务。这是完成的 Context.checkCallingPermission()方法。调用具有所需的权限字符串，它将返回一个整数，该整数指示是否已授予当前调用过程。注意，这只能用于当你执行一个来自另一个过程，通常是通过从一个服务或以其他方式提供给另一个进程发表的IDL接口。
有一些其他有用的方法来检查权限。如果你有另一个过程的，您可以使用上下文方法 [Context.checkPermission(String, int, int)](https://developer.android.com/reference/android/content/Context.html#checkPermission(java.lang.String, int, int))检查一个权限对该。如果您有另一个应用程序的包名称，，你可以直接用PackageManager的方法[PackageManager.checkPermission(String, String)]( PackageManager.checkPermission(String, String))了解是否特定的包已被授予特定的权限。
## URI权限
到目前为止所描述的标准权限系统与内容提供商使用时往往是不足够的。一个内容提供者可能想保护自己的读取和写入权限，而其直接客户还需要手工指定URI来对他们进行操作的其他应用。一个典型的例子是邮件应用程序中的附件。访问邮件应受权限保护，因为这是敏感的用户数据。然而，如果一个URI图片附件给图片浏览器、图像浏览器将没有权限打开附件，因为它没有理由持有所有的邮件的访问权限。

解决这个问题的办法是：每个URI权限时启动一个活动或返回结果的活动，对方可以设置 Intent.FLAG_GRANT_READ_URI_PERMISSION 或者 Intent.FLAG_GRANT_WRITE_URI_PERMISSION. 本授权接收活动权限访问在意向的具体数据的URI，而不论它是否有权限在相应的故意的内容提供商的数据访问。

这种机制允许一个共同的能力风格的模型，用户交互（打开一个附件，从列表中选择一个联系人，等）驱动器特设授予细粒度的权限。这可以是一个重要的设施，用于减少应用程序所需的权限，只有那些直接关系到他们的行为。

细粒度的URI权限授予，但需要与内容提供商持有那些URIs来合作。强烈建议内容提供程序实现此设备，并声明它们支持它通过细粒度的URI权限授予，但需要与内容提供商持有那些URIs来合作。强烈建议内容提供程序实现此设备，并声明它们支持它通过 android:grantUriPermissions 属性或者 <grant-uri-permissions>。
更多信息请参见:[Context.grantUriPermission()](https://developer.android.com/reference/android/content/Context.html#grantUriPermission(java.lang.String, android.net.Uri, int)), [Context.revokeUriPermission()](https://developer.android.com/reference/android/content/Context.html#revokeUriPermission(android.net.Uri, int))，和 [Context.checkUriPermission()](https://developer.android.com/reference/android/content/Context.html#checkUriPermission(android.net.Uri, int, int, int)) 方法。

继续阅读：
* [意味着功能要求的权限](https://developer.android.com/guide/topics/manifest/uses-feature-element.html#permissions)

* [ uses-permission ](https://developer.android.com/guide/topics/manifest/uses-permission-element.html)

* [Manifest.permission](https://developer.android.com/reference/android/Manifest.permission.html)

你可能也有兴趣：

* [设备的兼容性](https://developer.android.com/guide/practices/compatibility.html)

* [Android Security Overview](http://source.android.com/devices/tech/security/index.html)
