<!--Implementing App Restrictions-->
# 实现 app 的限制

> 编写：[zenlynn](https://github.com/zenlynn) 原文：<http://developer.android.com/training/enterprise/app-restrictions.html>

<!--If you are developing apps for the enterprise market, you may need to satisfy particular requirements set by a company's policies. Application restrictions allow the enterprise administrator to remotely specify settings for apps. This capability is particularly useful for enterprise-approved apps deployed to a managed profile.-->

如果你为企业市场开发 app ，你可能需要满足企业政策的特殊要求。应用程序的限制允许企业管理员远程设定 app 。这种能力对于部署了 managed profile 的企业 app 来说，尤其有用。

<!--For example, an enterprise might require that approved apps allow the enterprise administrator to:-->

例如，一个企业可能需要核准的 app 允许企业管理员：

<!--Whitelist or blacklist URLs for a web browser-->

* 为一个网页浏览器添加白名单或黑名单网址

<!--Configure whether an app is allowed to sync content via cellular, or just by Wi-Fi-->

* 配置是否允许一个 app 通过蜂窝网络同步内容，或只能通过 Wi-Fi

<!--Configure the app's email settings-->

* 配置 app 的电子邮件设定

<!--This guide shows how to implement these configuration settings in your app. -->

这个指南展示了如何在你的 app 实现这个配置设定。

<!--Note: For historical reasons, these configuration settings are known as restrictions, and are implemented with files and classes that use this term (such as RestrictionsManager). However, these restrictions can actually implement a wide range of configuration options, not just restrictions on app functionality. -->

> 注意：由于历史原因，这些配置设定被称为限制，并在文件与类中使用这个术语（例如 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html)）。然而，这些限制实际上可以实现各种各样的配置选项，并不只是限制 app 的功能。

<!--Remote Configuration Overview-->
## 远程配置概述

<!--Apps define the restrictions and configuration options that can be remotely set by an administrator. These restrictions are arbitrary configuration settings that can be changed by a restrictions provider. If your app is running on an enterprise device's managed profile, the enterprise administrator can change your app's restrictions. -->

 app 定义了管理员可以远程设定的限制和配置选项。限制提供者可以随意改变配置设定。如果你的 app 运行在企业设备上的 managed profile 中 ，企业管理员可以改变该 app 的限制。

<!--The restrictions provider is another app running on the same device. This app is typically controlled by the enterprise administrator. The enterprise administrator communicates restriction changes to the restrictions provider app. That app, in turn, changes the restrictions on your app. -->

限制提供者是运行在同一个设备上的另一个 app 。这个 app 通常是由企业管理员控制。企业管理员向限制提供者 app 传达限制的改变。这个 app 就相应地改变你的 app 的限制。

<!--To provide externally configurable restrictions: -->

提供外部可配置的限制：

<!--Declare the restrictions in your app manifest. Doing so allows the enterprise administrator to read the app's restrictions through Google Play APIs. -->

* 在你 app 的 manifest 中声明限制。这么做允许企业管理员通过 Goodle Play 的接口读取 app 的限制。

<!--Whenever the app resumes, use the RestrictionsManager object to check the current restrictions, and change your app's UI and behavior to conform with those restrictions. -->

* 每当 app 恢复，使用 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html) 对象检查当前限制，并改变你的 app 的 UI 和行为以符合这些限制。

<!--Listen for the ACTION_APPLICATION_RESTRICTIONS_CHANGED intent. When you receive this broadcast, check the RestrictionsManager to see what the current restrictions are, and make any necessary changes to your app's behavior. -->

* 监听 [ACTION_APPLICATION_RESTRICTIONS_CHANGED](http://developer.android.com/reference/android/content/Intent.html#ACTION_APPLICATION_RESTRICTIONS_CHANGED) intent。当你收到这个广播时，检查 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html) 看看当前限制是什么，并对你的 app 的行为做出任何必要的改变。

<!--Define App Restrictions-->
## 定义 app 的限制

<!--Your app can support any restrictions you want to define. You declare the app's restrictions in a restrictions file, and declare the restrictions file in the manifest. Creating a restrictions file allows other apps to examine the restrictions your app provides. Enterprise Mobility Management (EMM) partners can read your app's restrictions by using Google Play APIs. -->

你的 app 支持任何你想要定义的限制。你在限制文件中声明 app 的限制，在 manifest 中声明限制文件。创建一个限制文件允许其他 app 检查你的 app 提供的限制。企业移动管理（EMM）合作者可以通过 Google Play 接口来读取你的 app 的限制。

<!--To define your app's remote configuration options, put the following element in your manifest's <application> element: -->

为了定义你的 app 的远程配置选项，把以下元素放在你的 manifest 中的 [\<application>](http://developer.android.com/guide/topics/manifest/application-element.html) 元素里。

```xml
<meta-data android:name="android.content.APP_RESTRICTIONS"
    android:resource="@xml/app_restrictions" />
```

<!--Create a file named app_restrictions.xml in your app's res/xml directory. The structure of that file is described in the reference for RestrictionsManager. The file has a single top-level <restrictions> element, which contains one <restriction> child element for every configuration option the app has. -->

在 `res/xml` 文件夹中创建一个名为 `app_restrictions.xml` 的文件。该文件的结构在 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html)的参考文献中有所 描述。该文件有一个单独的顶级的 `<restrictions>` 元素，这个元素包括一个 `<restriction>` 子元素对应 app 的每一个配置选项。

<!--Note: Do not create localized versions of the restrictions file. Your app is only allowed to have a single restrictions file, so restrictions will be consistent for your app in all locales. -->

> 注意：不要创建限制文件的地区化版本。你的 app 只允许有一个限制文件，这样你的 app 在所有地区的限制才会保持一致。

<!--In an enterprise environment, an EMM will typically use the restrictions schema to generate a remote console for IT administrators, so the administrators can remotely configure your application. -->

在一个企业环境中，EMM 一般会使用该限制的框架为 IT 管理员生成远程控制台，所以管理员可以远程配置你的 app 。

<!--For example, suppose your app can be remotely configured to allow or forbid it to download data over a cellular connection. Your app could have a <restriction> element like this: -->

例如，假设你的 app 可以被远程配置允许或禁止它在蜂窝连接下下载数据。你的 app 就会有一个像这样的 `<restriction>` 元素：

```xml
<?xml version="1.0" encoding="utf-8"?>
<restrictions xmlns:android="http://schemas.android.com/apk/res/android" >

  <restriction
    android:key="download_on_cell"
    android:title="@string/download_on_cell_title"
    android:restrictionType="bool"
    android:description="@string/download_on_cell_description"
    android:defaultValue="true" />

</restrictions>
```

<!--The supported types for the android:restrictionType element are documented in the reference for RestrictionsManager. -->

[RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html) 的参考文献中记载了 `android:restrictionType` 元素所支持的类型。

<!--Note: bundle and bundle_array restriction types are not supported by Google Play for Work. -->

> 注意：Goole Play for Work 不支持 `bundle` 和 `bundle_array` 限制类型。

<!--You use each restriction's android:key attribute to read its value from a restrictions bundle. For this reason, each restriction must have a unique key string, and the string cannot be localized. It must be specified with a string literal. -->

使用每个限制的 `android:key` 属性从限制 bundle 中读取它的值。为此，每个限制必须有一个独特的 key 字符串，并且不能被地区化。它必须用一个 string 直接量指明。

<!--Note: In a production app, android:title and android:description should be drawn from a localized resource file, as described in Localizing with Resources. -->

> 注意：如在[资源地区化](http://developer.android.com/guide/topics/resources/localization.html)所说，在一个产品 app 中，`android:title` 和 `android:description` 应该从地区化资源文件中提取出来。

<!--The restrictions provider can query the app to find details on the app's available restrictions, including their description text. Restrictions providers and enterprise administrators can change your app's restrictions at any time, even when the app is not running. -->

限制提供者可以询问 app 来找到该 app 可用限制的细节，包括它们的描述文本。限制提供者和企业管理员可以在任何时候，甚至 app 没有在运行的时候，改变它的限制。

<!--Check App Restrictions-->
## 检查 app 的限制

<!--Your app is not automatically notified when other apps change its restriction settings. Instead, you need to check what the restrictions are when your app starts or resumes, and listen for a system intent to find out if the restrictions change while your app is running. -->

当其他 app 改变你的 app 的限制设定时，你的 app 不会被自动通知。反而需要你在 app 启动或恢复的时候检查有哪些限制，并且监听系统 intent 来发现当你的 app 运行的时候限制是否发生改变。

<!--To find out the current restriction settings, your app uses a RestrictionsManager object. Your app should check for the current restrictions at the following times: -->

为了知道当前限制设定，你的 app 使用一个 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html) 对象。你的 app 应该在以下时候检查当前限制：

<!--When the app starts or resumes, in its onResume() method -->

* 当 app 启动或者恢复的时候，在它的 [onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume%28%29) 方法里检查

<!--When the app is notified of a restriction change, as described in Listen for App Configuration Changes -->

* 如[监听 app 配置的改变](http://developer.android.com/training/enterprise/app-restrictions.html#listen)中所说，当 app 被提示限制改变的时候

<!--To get a RestrictionsManager object, get the current activity with getActivity(), then call that activity's Activity.getSystemService() method: -->

为了获得一个 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html) 对象，使用 [getActivity()](http://developer.android.com/reference/android/app/Fragment.html#getActivity%28%29) 取得当前 activity，然后调用 activity 的 [Activity.getSystemService()](http://developer.android.com/reference/android/content/Context.html#getSystemService%28java.lang.Class%3CT%3E%29) 方法：

```java
RestrictionsManager myRestrictionsMgr =
    (RestrictionsManager) getActivity()
        .getSystemService(Context.RESTRICTIONS_SERVICE);
```

<!--Once you have a RestrictionsManager, you can get the current restrictions settings by calling its getApplicationRestrictions() method: -->

一旦你有了 [RestrictionsManager](http://developer.android.com/reference/android/content/RestrictionsManager.html)，你可以通过调用它的 [getApplicationRestrictions()](http://developer.android.com/reference/android/content/RestrictionsManager.html#getApplicationRestrictions%28%29) 方法取得当前的限制设定：

```java
Bundle appRestrictions = myRestrictionsMgr.getApplicationRestrictions();
```

<!--Note: For convenience, you can also fetch the current restrictions with a UserManager, by calling UserManager.getApplicationRestrictions(). This method behaves exactly the same as RestrictionsManager.getApplicationRestrictions(). -->

> 注意：方便起见，你也可以用 [UserManager](http://developer.android.com/reference/android/os/UserManager.html) 取得当前限制，调用 [UserManager.getApplicationRestrictions()](http://developer.android.com/reference/android/os/UserManager.html#getApplicationRestrictions%28java.lang.String%29) 即可。这个方法与 [RestrictionsManager.getApplicationRestrictions()](http://developer.android.com/reference/android/content/RestrictionsManager.html#getApplicationRestrictions%28%29) 起到完全相同的作用。

<!--The getApplicationRestrictions() method requires reading from data storage, so it should be done sparingly. Do not call this method every time you need to know the current restrictions. Instead, you should call it once when your app starts or resumes, and cache the fetched restrictions bundle. Then listen for the ACTION_APPLICATION_RESTRICTIONS_CHANGED intent to find out if restrictions change while your app is active, as described in Listen for App Restriction Changes. -->

[getApplicationRestrictions()](http://developer.android.com/reference/android/content/RestrictionsManager.html#getApplicationRestrictions%28%29) 方法需要从数据存储区获得数据，所以要尽量少用。不要每次你需要知道当前限制的时候就调用这个方法。你应该只在你的 app 启动或恢复的时候调用，并且缓存所取得的限制 bundle。然后，如[监听 app 配置的改变](http://developer.android.com/training/enterprise/app-restrictions.html#listen)中所说，在你的 app 活动的时候，监听 [ACTION_APPLICATION_RESTRICTIONS_CHANGED](http://developer.android.com/reference/android/content/Intent.html#ACTION_APPLICATION_RESTRICTIONS_CHANGED) intent 来发现限制是否改变。

<!--When your app checks for restrictions using RestrictionsManager.getApplicationRestrictions(), we recommend that you check to see if the enterprise administrator has set the key-value pair KEY_RESTRICTIONS_PENDING to true. If so, you should block the user from using the app, and prompt them to contact their enterprise administrator. The app should then proceed as normal, registering for the ACTION_APPLICATION_RESTRICTIONS_CHANGED broadcast. -->

当你的 app 使用 [RestrictionsManager.getApplicationRestrictions()](http://developer.android.com/reference/android/content/RestrictionsManager.html#getApplicationRestrictions%28%29) 检查限制时，我们建议你检查企业管理员是否把键值对 [KEY_RESTRICTIONS_PENDING](http://developer.android.com/reference/android/os/UserManager.html#KEY_RESTRICTIONS_PENDING) 设置为 true。如果设置了，你应该阻止用户使用这个 app，并提示他们联系他们的企业管理员。然后，这个 app 应该继续正常运行，注册 [ACTION_APPLICATION_RESTRICTIONS_CHANGED](http://developer.android.com/reference/android/content/Intent.html#ACTION_APPLICATION_RESTRICTIONS_CHANGED) 广播。

![](https://github.com/zenlynn/android-training-course-in-chinese/blob/zenlynn-patch-2/enterprise/app_restrictions_diagram.png?raw=true)

**Figure 1.** 在注册广播之前检查限制是否暂挂

<!--Reading and applying restrictions-->
## 读取并应用限制

<!--The getApplicationRestrictions() method returns a Bundle containing a key-value pair for each restriction that has been set. The values are all of type Boolean, int, String, String[], Bundle, and Bundle[]. Once you have the restrictions Bundle, you can check the current restrictions settings with the standard Bundle methods for those data types, such as getBoolean() or getString(). -->

[getApplicationRestrictions()](http://developer.android.com/reference/android/content/RestrictionsManager.html#getApplicationRestrictions%28%29) 方法返回一个 [Bundle](http://developer.android.com/reference/android/os/Bundle.html)，其中包含了被设置的每个限制的键值对。这些值的类型是 `Boolean`, `int`, `String`, `String[]`, `Bundle`, `Bundle[]`。只要你有了限制 [Bundle](http://developer.android.com/reference/android/os/Bundle.html) ，你就可以用标准的 [Bundle](http://developer.android.com/reference/android/os/Bundle.html) 方法针对数据类型来检查当前的限制设置，比如 [getBoolean()](http://developer.android.com/reference/android/os/BaseBundle.html#getBoolean%28java.lang.String%29) 或者 [getString()](http://developer.android.com/reference/android/os/BaseBundle.html#getString%28java.lang.String%29)。

<!--Note: The restrictions Bundle contains one item for every restriction that has been explicitly set by a restrictions provider. However, you cannot assume that a restriction will be present in the bundle just because you defined a default value in the restrictions XML file. -->

> 注意：限制 [Bundle](http://developer.android.com/reference/android/os/Bundle.html) 为每个被限制提供者显式设置的限制都包括了一个条目。但是，你不能只因为你在限制 XML 文件中定义了一个默认值，就假定这个限制就会在 bundle 里出现。

<!--It is up to your app to take appropriate action based on the current restrictions settings. For example, if your app has a restriction schema to specify whether it can download over a cellular connection (like the example in Define App Restrictions), and you find that the restriction is set to false, you would have to disable data download except when the device has a Wi-Fi connection, as shown in the following example code: -->

你基于当前的限制设定，为你的 app 采取合适的行动。比如，如果你的 app 有一个限制架构来指明是否它能在蜂窝连接（就像在[定义 app的 限制](http://developer.android.com/training/enterprise/app-restrictions.html#define_restrictions)的例子里一样）中下载，而你发现限制设置为 false，那么你不得不禁止数据下载，除非设备在 Wi-Fi 连接下，正如下面的实例代码所展示的：

```java
boolean appCanUseCellular;

if appRestrictions.containsKey("downloadOnCellular") {
    appCanUseCellular = appRestrictions.getBoolean("downloadOnCellular");
} else {
    // here, cellularDefault is a boolean set with the restriction's
    // default value
    appCanUseCellular = cellularDefault;
}

if (!appCanUseCellular) {
    // ...turn off app's cellular-download functionality
    // ...show appropriate notices to user
}
```

<!--Note: The restrictions schema should be backward and forward compatible, since Google Play for Work gives the EMM only one version of the App Restrictions Schema per app.-->

> 注意：该限制架构必须向前向后兼容，因为 Google Play for Work 对于每个 app 只给予 EMM 一个版本的限制架构。

<!--Listen for App Restriction Changes-->
## 监听 app 限制的改变

<!--Whenever an app's restrictions are changed, the system fires the ACTION_APPLICATION_RESTRICTIONS_CHANGED intent. Your app has to listen for this intent so you can change the app's behavior when the restriction settings change.-->

每当 app 的限制被改变，系统就创建 [ACTION_APPLICATION_RESTRICTIONS_CHANGED](http://developer.android.com/reference/android/content/Intent.html#ACTION_APPLICATION_RESTRICTIONS_CHANGED) intent。你的 app 必须监听这个 intent，这样你就能在限制设定改变的时候改变 app 的行为。

<!--Note: The ACTION_APPLICATION_RESTRICTIONS_CHANGED intent is sent only to listeners that are dynamically registered, not to listeners that are declared in the app manifest. -->

> 注意：[ACTION_APPLICATION_RESTRICTIONS_CHANGED](http://developer.android.com/reference/android/content/Intent.html#ACTION_APPLICATION_RESTRICTIONS_CHANGED) intent 只发送给动态注册的监听者，而不发送给在 app manifest 里声明的监听者。

<!--The following code shows how to dynamically register a broadcast receiver for this intent: -->

以下代码展示了如何为这个 intent 动态注册一个广播接收者：

```java
IntentFilter restrictionsFilter =
    new IntentFilter(Intent.ACTION_APPLICATION_RESTRICTIONS_CHANGED);

BroadcastReceiver restrictionsReceiver = new BroadcastReceiver() {
  @Override public void onReceive(Context context, Intent intent) {

    // Get the current restrictions bundle
    Bundle appRestrictions =

    myRestrictionsMgr.getApplicationRestrictions();

    // Check current restrictions settings, change your app's UI and
    // functionality as necessary.

  }

};

registerReceiver(restrictionsReceiver, restrictionsFilter);
```

<!--Note: Ordinarily, your app does not need to be notified about restriction changes when it is paused. Instead, you should unregister your broadcast receiver when the app is paused. When the app resumes, you first check for the current restrictions (as discussed in Check App Restrictions), then register your broadcast receiver to make sure you're notified about restriction changes that happen while the app is active. -->

> 注意：一般来说，当你的 app 中止时不需要被通知限制的改变。相反，这个时候你需要注销你的广播接收者。当 app 恢复时，你首先要检查当前的限制（正如在[检查 app 的限制](http://developer.android.com/training/enterprise/app-restrictions.html#check_restrictions)中所讨论的），然后注册你的广播接收者，以保证在 app 活动期间如果有限制改变你会被通知。
