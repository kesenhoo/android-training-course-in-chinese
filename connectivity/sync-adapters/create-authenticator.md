# 创建 Stub 授权器

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/sync-adapters/creating-authenticator.html>

Sync Adapter 框架假定我们的 Sync Adapter 在同步数据时，设备存储端关联了一个账户，且服务器端需要进行登录验证。因此，我们需要提供一个叫做授权器（Authenticator）的组件作为 Sync Adapter 的一部分。该组件会集成在 Android 账户及认证框架中，并提供一个标准的接口来处理用户凭据，比如登录信息。

即使我们的应用不使用账户，我们仍然需要提供一个授权器组件。在这种情况下，授权器所处理的信息将被忽略，所以我们可以提供一个包含了方法存根（Stub Method）的授权器组件。同时我们需要提供一个绑定 [Service](http://developer.android.com/reference/android/app/Service.html)，来允许 Sync Adapter 框架调用授权器的方法。

这节课将展示如何定义一个能够满足 Sync Adapter 框架要求的 Stub 授权器。如果我们想要提供可以处理用户账户的实际的授权器，可以阅读：[AbstractAccountAuthenticator](http://developer.android.com/reference/android/accounts/AbstractAccountAuthenticator.html)。

## 添加一个 Stub 授权器组件

要在应用中添加一个 Stub 授权器，首先我们需要创建一个继承 [AbstractAccountAuthenticator](http://developer.android.com/reference/android/accounts/AbstractAccountAuthenticator.html) 的类，在所有需要重写的方法中，我们不进行任何处理，仅返回 null 或者抛出异常。

下面的代码片段是一个 Stub 授权器的例子：

```java
/*
 * Implement AbstractAccountAuthenticator and stub out all
 * of its methods
 */
public class Authenticator extends AbstractAccountAuthenticator {
    // Simple constructor
    public Authenticator(Context context) {
        super(context);
    }
    // Editing properties is not supported
    @Override
    public Bundle editProperties(
            AccountAuthenticatorResponse r, String s) {
        throw new UnsupportedOperationException();
    }
    // Don't add additional accounts
    @Override
    public Bundle addAccount(
            AccountAuthenticatorResponse r,
            String s,
            String s2,
            String[] strings,
            Bundle bundle) throws NetworkErrorException {
        return null;
    }
    // Ignore attempts to confirm credentials
    @Override
    public Bundle confirmCredentials(
            AccountAuthenticatorResponse r,
            Account account,
            Bundle bundle) throws NetworkErrorException {
        return null;
    }
    // Getting an authentication token is not supported
    @Override
    public Bundle getAuthToken(
            AccountAuthenticatorResponse r,
            Account account,
            String s,
            Bundle bundle) throws NetworkErrorException {
        throw new UnsupportedOperationException();
    }
    // Getting a label for the auth token is not supported
    @Override
    public String getAuthTokenLabel(String s) {
        throw new UnsupportedOperationException();
    }
    // Updating user credentials is not supported
    @Override
    public Bundle updateCredentials(
            AccountAuthenticatorResponse r,
            Account account,
            String s, Bundle bundle) throws NetworkErrorException {
        throw new UnsupportedOperationException();
    }
    // Checking features for the account is not supported
    @Override
    public Bundle hasFeatures(
        AccountAuthenticatorResponse r,
        Account account, String[] strings) throws NetworkErrorException {
        throw new UnsupportedOperationException();
    }
}
```

## 将授权器绑定到框架

为了让 Sync Adapter 框架可以访问我们的授权器，我们必须为它创建一个绑定服务。这一服务提供一个 Android Binder 对象，允许框架调用我们的授权器，并且在授权器和框架间传递数据。

因为框架会在它第一次需要访问授权器时启动该 [Service](http://developer.android.com/reference/android/app/Service.html)，所以我们也可以使用该服务来实例化授权器。具体而言，我们需要在服务的 <a href="http://developer.android.com/reference/android/app/Service.html#onCreate()">Service.onCreate()</a> 方法中调用授权器的构造函数。

下面的代码样例展示了如何定义绑定 [Service](http://developer.android.com/reference/android/app/Service.html)：

```java
/**
 * A bound Service that instantiates the authenticator
 * when started.
 */
public class AuthenticatorService extends Service {
    ...
    // Instance field that stores the authenticator object
    private Authenticator mAuthenticator;
    @Override
    public void onCreate() {
        // Create a new authenticator object
        mAuthenticator = new Authenticator(this);
    }
    /*
     * When the system binds to this Service to make the RPC call
     * return the authenticator's IBinder.
     */
    @Override
    public IBinder onBind(Intent intent) {
        return mAuthenticator.getIBinder();
    }
}
```

## 添加授权器的元数据（Metadata）文件

若要将我们的授权器组件集成到 Sync Adapter 框架和账户框架中，我们需要为这些框架提供带有描述组件信息的元数据。该元数据声明了我们为 Sync Adapter 创建的账户类型以及系统所显示的 UI 元素（如果希望用户可以看到我们创建的账户类型）。在我们的项目目录 `/res/xml/` 下，将元数据声明于一个 XML 文件中。我们可以自己为该文件按命名，通常我们将它命名为 `authenticator.xml`。

在这个 XML 文件中，包含了一个 `<account-authenticator>` 标签，它有下列一些属性：

**android:accountType**

Sync Adapter 框架要求每一个适配器都有一个域名形式的账户类型。框架会将它作为 Sync Adapter 内部标识的一部分。如果服务端需要登陆，账户类型会和账户一起发送到服务端作为登录凭据的一部分。

如果我们的服务端不需要登录，我们仍然需要提供一个账户类型（该属性的值用我们能控制的一个域名即可）。虽然框架会使用它来管理 Sync Adapter，但该属性的值不会发送到服务端。

**android:icon**

指向一个包含图标的 [Drawable](http://developer.android.com/guide/topics/resources/drawable-resource.html) 资源。如果我们在 `res/xml/syncadapter.xml` 中通过指定 `android:userVisible="true"` 让 Sync Adapter 可见，那么我们必须提供图标资源。它会在系统的设置中的账户（Accounts）这一栏内显示。

**android:smallIcon**

指向一个包含微小版本图标的 [Drawable](http://developer.android.com/guide/topics/resources/drawable-resource.html) 资源。当屏幕尺寸较小时，这一资源可能会替代 `android:icon` 中所指定的图标资源。

**android:label**

指明了用户账户类型的本地化字符串。如果我们在 `res/xml/syncadapter.xml` 中通过指定 `android:userVisible="true"` 让 Sync Adapter 可见，那么我们需要提供该字符串。它会在系统的设置中的账户这一栏内显示，就在我们为授权器定义的图标旁边。

下面的代码样例展示了我们之前为授权器创建的 XML 文件：

```xml
<?xml version="1.0" encoding="utf-8"?>
<account-authenticator
        xmlns:android="http://schemas.android.com/apk/res/android"
        android:accountType="example.com"
        android:icon="@drawable/ic_launcher"
        android:smallIcon="@drawable/ic_launcher"
        android:label="@string/app_name"/>
```

## 在 Manifest 文件中声明授权器

在之前的步骤中，我们已经创建了一个绑定服务，将授权器和 Sync Adapter 框架连接了起来。为了让系统可以识别该服务，我们需要在 Manifest 文件中添加 [`<service>`](http://developer.android.com/guide/topics/manifest/service-element.html) 标签，将它作为 [`<application>`](http://developer.android.com/guide/topics/manifest/application-element.html) 的子标签：

```xml
    <service
            android:name="com.example.android.syncadapter.AuthenticatorService">
        <intent-filter>
            <action android:name="android.accounts.AccountAuthenticator"/>
        </intent-filter>
        <meta-data
            android:name="android.accounts.AccountAuthenticator"
            android:resource="@xml/authenticator" />
    </service>
```

[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html) 标签配置了一个可以被 `android.accounts.AccountAuthenticator` 这一 Action 所激活的过滤器，这一 Intent 会在系统要运行授权器时由系统发出。当过滤器被激活后，系统会启动 `AuthenticatorService`，即之前用来封装授权器的 [Service](http://developer.android.com/reference/android/app/Service.html)。

[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html) 标签声明了授权器的元数据。[android:name](http://developer.android.com/guide/topics/manifest/meta-data-element.html#nm) 属性将元数据和授权器框架连接起来。[android:resource](http://developer.android.com/guide/topics/manifest/meta-data-element.html#rsrc) 指定了我们之前所创建的授权器元数据文件的名字。

除了授权器之外，Sync Adapter 框架也需要一个 Content Provider。如果我们的应用并没有使用 Content Provider，那么可以阅读下一节课程学习如何创建一个 Stub Content Provider；如果我们的应用已经使用了 ContentProvider，可以直接阅读：[创建 Sync Adapter](create-sync-adapter.html)。
