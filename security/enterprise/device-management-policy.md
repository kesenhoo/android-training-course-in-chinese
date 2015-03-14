# 使用设备管理策略增强安全性

> 编写:[craftsmanBai](https://github.com/craftsmanBai) - <http://z1ng.net> - 原文: <http://developer.android.com/training/enterprise/device-management-policy.html>

Android 2.2(API Level 8)之后，Android平台通过设备管理API提供系统级的设备管理能力。

在这一小节中，你将学到如何通过使用设备管理策略创建安全敏感的应用程序。比如某应用可被配置为：在给用户显示受保护的内容之前，确保已设置一个足够强度的锁屏密码。

## 定义并声明你的策略

首先，你需要定义多种在功能层面提供支持的策略。这些策略可以包括屏幕锁密码强度、密码过期时间以及加密等等方面。

你须在res/xml/device_admin.xml中声明选择的策略集，它将被应用强制实行。在Android manifest也需要引用声明的策略集。

每个声明的策略对应[DevicePolicyManager](http://developer.android.com/reference/android/app/admin/DevicePolicyManager.html)中一些相关设备的策略方法（例如定义最小密码长度或最少大写字母字符数）。如果一个应用尝试调用XML中没有对应策略的方法，程序在会运行时抛出一个[SecurityException](http://developer.android.com/reference/java/lang/SecurityException.html)异常。

如果应用程序试图管理其他策略，那么强制锁force-lock之类的其他权限就会发挥作用。正如你将看到的，作为设备管理权限激活过程的一部分，声明策略的列表会在系统屏幕上显示给用户。
如下代码片段在res/xml/device_admin.xml中声明了密码限制策略：

```xml
<device-admin xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-policies>
        <limit-password />
    </uses-policies>
</device-admin>
```
在Android manifest引用XML策略声明：

```xml
<receiver android:name=".Policy$PolicyAdmin"
    android:permission="android.permission.BIND_DEVICE_ADMIN">
    <meta-data android:name="android.app.device_admin"
        android:resource="@xml/device_admin" />
    <intent-filter>
        <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
    </intent-filter>
</receiver>
```

## 创建一个设备管理接受端

创建一个设备管理广播接收端（broadcast receiver），可以接收到与你声明的策略有关的事件通知。也可以对应用程序有选择地重写回调函数。

在同样的应用程序（Device Admin）中，当设备管理（device administrator）权限被用户设为禁用时，已配置好的策略就会从共享偏好设置（shared preference）中擦除。

你应该考虑实现与你的应用业务逻辑相关的策略。例如，你的应用可以采取一些措施来降低安全风险，如：删除设备上的敏感数据，禁用远程同步，对管理员的通知提醒等等。

为了让广播接收端能够正常工作，请务必在Android manifest中注册下面代码片段所示内容。

```xml
<receiver android:name=".Policy$PolicyAdmin"
    android:permission="android.permission.BIND_DEVICE_ADMIN">
    <meta-data android:name="android.app.device_admin"
        android:resource="@xml/device_admin" />
    <intent-filter>
        <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
    </intent-filter>
</receiver>
```

## 激活设备管理器

在执行任何策略之前，用户需要手动将程序激活为具有设备管理权限，下面的程序片段显示了如何触发设置框以便让用户为你的程序激活权限。

通过指定[EXTRA_ADD_EXPLANATION](http://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#EXTRA_ADD_EXPLANATION)给出明确的说明信息，以告知用户为应用程序激活设备管理权限的好处。

```java
if (!mPolicy.isAdminActive()) {

    Intent activateDeviceAdminIntent =
        new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);

    activateDeviceAdminIntent.putExtra(
        DevicePolicyManager.EXTRA_DEVICE_ADMIN,
        mPolicy.getPolicyAdmin());

    // It is good practice to include the optional explanation text to
    // explain to user why the application is requesting to be a device
    // administrator. The system will display this message on the activation
    // screen.
    activateDeviceAdminIntent.putExtra(
        DevicePolicyManager.EXTRA_ADD_EXPLANATION,
        getResources().getString(R.string.device_admin_activation_message));

    startActivityForResult(activateDeviceAdminIntent,
        REQ_ACTIVATE_DEVICE_ADMIN);
}
```

![](device-mgmt-activate-device-admin.png)

如果用户选择"Activate"，程序就会获取设备管理员权限并可以开始配置和执行策略。
当然，程序也需要做好处理用户选择放弃激活的准备，比如用户点击了“取消”按钮，返回键或者HOME键的情况。因此，如果有必要的话，策略设置中的*[onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume())*方法需要加入重新评估的逻辑判断代码，以便将设备管理激活选项展示给用户。

## 实施设备策略控制

在设备管理权限成功激活后，程序就会根据请求的策略来配置设备策略管理器。要牢记，新策略会被添加到每个版本的Android中。所以你需要在程序中做好平台版本的检测，以便新策略能被老版本平台很好的支持。例如，“密码中含有的最少大写字符数”这个安全策略只有在高于API Level 11（Honeycomb）的平台才被支持，以下代码则演示了如何在运行时检查版本：

```java
DevicePolicyManager mDPM = (DevicePolicyManager)
        context.getSystemService(Context.DEVICE_POLICY_SERVICE);
ComponentName mPolicyAdmin = new ComponentName(context, PolicyAdmin.class);
...
mDPM.setPasswordQuality(mPolicyAdmin, PASSWORD_QUALITY_VALUES[mPasswordQuality]);
mDPM.setPasswordMinimumLength(mPolicyAdmin, mPasswordLength);
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
    mDPM.setPasswordMinimumUpperCase(mPolicyAdmin, mPasswordMinUpperCase);
}
```

这样程序就可以执行策略了。当程序无法访问正确的锁屏密码的时候，通过设备策略管理器（Device Policy Manager）API可以判断当前密码是否适用于请求的策略。如果当前锁屏密码满足策略，设备管理API不会采取纠正措施。明确地启动设置程序中的系统密码更改界面是应用程序的责任。例如：

```java
if (!mDPM.isActivePasswordSufficient()) {
    ...
    // Triggers password change screen in Settings.
    Intent intent =
        new Intent(DevicePolicyManager.ACTION_SET_NEW_PASSWORD);
    startActivity(intent);
}
```

一般来说，用户可以从可用的锁屏机制中任选一个，例如“无”、“图案”、“PIN码”（数字）或密码（字母数字）。当一个密码策略配置好后，那些比已定义密码策略弱的密码会被禁用。比如，如果配置了密码级别为“Numeric”，那么用户只可以选择PIN码（数字）或者密码（字母数字）。

一旦设备通过设置适当的锁屏密码处于被保护的状态，应用程序便允许访问受保护的内容。

```java
if (!mDPM.isAdminActive(..)) {
    // Activates device administrator.
    ...
} else if (!mDPM.isActivePasswordSufficient()) {
    // Launches password set-up screen in Settings.
    ...
} else {
    // Grants access to secure content.
    ...
    startActivity(new Intent(context, SecureActivity.class));
}
```
