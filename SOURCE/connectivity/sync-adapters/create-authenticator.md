> 编写:[jdneo](https://github.com/jdneo)

> 校对:

# 创建Stub授权器

Sync Adapter框架假定你的Sync Adapter在同步数据时，设备存储会有一个账户，服务器存储端会有登录验证。因此，框架期望你提供一个叫做授权器的组件作为你的Sync Adapter的一部分。该组件会植入Android账户及认证框架，并提供一个标准的接口来处理用户凭据，比如登录信息。

甚至，如果你的应用不使用账户，你仍然需要提供一个授权器组件。如果你不使用账户或者服务器登录，授权器所处理的信息将被忽略，所以你可以提供一个授权器组件，它包括了一个“空”的实现（译者注：也即标题中的Stub）。同时你需要提供一个捆绑的[Service](http://developer.android.com/reference/android/app/Service.html)，来允许Sync Adapter框架来调用授权器的方法。

这节课将向你展示如何定义一个Stub授权器的所有满足其实现要求的部件。如果你想要提供一个真实的处理用户账户的授权器，可以阅读：[AbstractAccountAuthenticator](http://developer.android.com/reference/android/accounts/AbstractAccountAuthenticator.html)。

## 添加一个Stub授权器组件

要在你的应用中添加一个Stub授权器，创建一个继承[AbstractAccountAuthenticator](http://developer.android.com/reference/android/accounts/AbstractAccountAuthenticator.html)的类，并将要覆写的方法置空（这样就不会做任何处理了），返回null或者抛出异常。

下面的代码片段是一个Stub授权器的例子：

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

为了让Sync Adapter框架可以访问你的授权器，你必须为它创建一个捆绑服务。这一服务提供一个Android binder对象，允许框架调用你的授权器，并且在授权器和框架间传输数据。

因为框架会在它第一次访问授权器时启动[Service](http://developer.android.com/reference/android/app/Service.html)，你也可以使用服务来实例化授权器，方法是通过在服务的[Service.onCreate()](http://developer.android.com/reference/android/app/Service.html#onCreate\(\))方法中调用授权器的构造函数。

下面的代码样例展示了如何定义绑定[Service](http://developer.android.com/reference/android/app/Service.html)：

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

## 添加授权器的元数据文件

要将你的授权器组件插入到Sync Adapter和账户框架中，你需要为框架提供带有描述组件的元数据。该元数据声明了你创建的Sync Adapter的账户类型以及系统所显示的用户接口元素（如果你希望将你的账户类型对用户可见）。在你的项目目录：“/res/xml/”下，将元数据声明于一个XML文件中。你可以随便为它起一个名字，一般来说，可以叫“authenticator.xml”

在这个XML文件中，包含单个元素`<account-authenticator>`，它有下列一些属性：

**android:accountType**

Sync Adapter框架需要每一个适配器以域名的形式拥有一个账户类型。框架会将它作为其内部的标识。对于需要登录的服务器，账户类型会和账户一起发送到服务端作为登录凭据的一部分。

如果你的服务不需要登录，你仍然需要提供一个账户类型。值的话就用你能控制的一个域名即可。由于框架会使用它来管理Sync Adapter，所以值不会发送到服务器上。

**android:icon**

指向一个包含一个图标的[Drawable](http://developer.android.com/guide/topics/resources/drawable-resource.html)资源的指针。如果你在“res/xml/syncadapter.xml”中通过指定android:userVisible="true"让Sync Adapter可见，那么你必须提供图标资源。它会在系统的设置中的账户这一栏内显示。

**android:smallIcon**

指向一个包含一个微小版本图标的[Drawable](http://developer.android.com/guide/topics/resources/drawable-resource.html)资源的指针。结合具体的屏幕大小，这一资源可能会替代“android:icon”中所指定的图标资源。

**android:label**

将指明了用户账户类型的string本地化。如果你在“res/xml/syncadapter.xml”中通过指定android:userVisible="true"让Sync Adapter可见，那么你需要提供这个string。它会在系统的设置中的账户这一栏内显示，就在你定义的图标旁边。

下面的代码样例展示了你之前为授权器创建的XML文件：

```xml
<?xml version="1.0" encoding="utf-8"?>
<account-authenticator
        xmlns:android="http://schemas.android.com/apk/res/android"
        android:accountType="example.com"
        android:icon="@drawable/ic_launcher"
        android:smallIcon="@drawable/ic_launcher"
        android:label="@string/app_name"/>
```

## 在清单文件中声明授权器

在之前的步骤中，你创建了一个捆绑服务，将授权器和Sync Adapter框架连接起来。要标识这个服务，你需要再清单文件中添加[`<service>`](http://developer.android.com/guide/topics/manifest/service-element.html)标签，将它作为[`<application>`](http://developer.android.com/guide/topics/manifest/application-element.html)的子标签：

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

标签[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)配置了一个由android.accounts.AccountAuthenticator的intent所激活的过滤器，这一intent会在系统要运行授权器时由系统发出。当过滤器被激活，系统会启动AuthenticatorService，它是你之前用来封装授权器的捆绑[Service](http://developer.android.com/reference/android/app/Service.html)。

[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)标签声明了授权器的元数据。[android:name](http://developer.android.com/guide/topics/manifest/meta-data-element.html#nm)属性将元数据和授权器框架连接起来。[android:resource](http://developer.android.com/guide/topics/manifest/meta-data-element.html#rsrc)指定了你之前所创建的授权器元数据文件的名字。

除了一个授权器，一个Sync Adapter框架需要一个内容提供器（content provider）。如果你的应用不适用内容提供器，可以阅读下一节课程，在下节课中将会创建一个空的内容提供器；如果你的应用适用的话，可以直接阅读：[Creating a Sync Adapter](除了一个授权器，一个Sync Adapter框架需要一个内容提供器（content provider）。如果你的应用不适用内容提供器，可以阅读下一节课程，在下节课中将会创建一个空的内容提供器；如果你的应用适用的话，可以直接阅读：[创建Sync Adapter](creating-sync-adapter.html)。
