<!--Building a Device Policy Controller-->
# 创建设备策略控制器

> 编写：[zenlynn](https://github.com/zenlynn) 原文：<http://developer.android.com/training/enterprise/work-policy-ctrl.html>

<!--In an Android for Work deployment, an enterprise needs to maintain control over certain aspects of the employees' devices. The enterprise needs to ensure that work-related information is encrypted and is kept separate from employees' personal data. The enterprise may also need to limit device capabilities, such as whether the device is allowed to use its camera. And the enterprise may require that approved apps provide app restrictions, so the enterprise can turn app capability on or off as needed. -->

在 Android for Work 的部署中，企业需要保持对员工设备的某些方面的控制。企业需要确保工作相关的信息被加密，并与员工的私人数据分离。企业也可能需要限制设备的功能，例如设备是否被允许使用相机。而且企业也可能需要那些被批准的应用提供应用限制，所以企业可以根据需要关闭或打开应用的功能。

<!--To handle these tasks, an enterprise develops and deploys a device policy controller app (previously known as a work policy controller). This app is installed on each employee's device. The controller app installed on each employee's device and creates a work user profile, which accesses enterprise apps and data separately from the user's personal account. The controller app also acts as the bridge between the enterprise's management software and the device; the enterprise tells the controller app when it needs to make configuration changes, and the controller app makes the appropriate settings changes for the device and for other apps. -->

为了处理这些任务，企业开发并部署设备策略控制器应用（以前称为工作策略控制器）。该应用被安装在每一个员工的设备中。安装在每一个员工设备中的控制应用创建了一个企业用户 profile，它可以区别用户的私人账户以访问企业应用和数据。该控制应用同时也是企业管理软件和设备之间的桥梁；当企业需要改变配置的时候就告诉控制应用，然后控制应用适当地为设备和其他应用改变设置。

<!--This lesson describes how to develop a device policy controller app for devices in an Android for Work deployment. The lesson describes how to create a work user profile, how to set device policies, and how to apply restrictions to other apps running on the managed profile. -->

该课程描述了如何在 Android for Work 的部署中为设备开发一个设备策略控制器。该课程描述了如何创建一个企业用户 profile，如何设置设备策略，以及如何在 managed profile 中为其他运行中的应用进行限制。

<!--Note: This lesson does not cover the situation where the only profile on the device is the managed profile, under the enterprise's control. -->

> 注意：该课程的内容并不包括在企业控制之下，设备中唯一的 profile 就是 managed profile 的情况。

<!--Device Administration Overview-->
## 设备管理概述

<!--In an Android for Work deployment, the enterprise administrator can set policies to control the behavior of employees' devices and apps. The enterprise administrator sets these policies with software provided by their Enterprise Mobility Management (EMM) provider. The EMM software communicates with a device policy controller on each device. The device policy controller, in turn, manages the settings and behavior of the work user profile on each individual’s device. -->

在 Android for Work 的部署中，企业管理员可以设置策略来控制员工设备和应用的行为。企业管理员用企业移动管理（EMM）供应商提供的软件设置这些策略。EMM 软件与每一个设备上的设备策略控制器进行通讯。设备策略控制器相应地对每一个私人设备上企业用户 profile 的设置和行为进行管理。

<!--Note: A device policy controller is built on the existing model used for device administration applications, as described in Device Administration. In particular, your app needs to create a subclass of DeviceAdminReceiver, as described in that document. -->

> 设备政策管理器内置于设备管理应用现有的模式中，如[设备管理](http://developer.android.com/guide/topics/admin/device-admin.html)中所说。特别是，你的应用需要创建 [DeviceAdminReceiver](http://developer.android.com/reference/android/app/admin/DeviceAdminReceiver.html) 的子类，如上述文件所说。

<!--Managed profiles-->
### Managed profiles

<!--Users often want to use their personal devices in an enterprise setting. This situation can present enterprises with a dilemma. If the user can use their own device, the enterprise has to worry that confidential information (like employee emails and contacts) are on a device the enterprise does not control. -->

用户经常想在企业环境中使用他们的私人设备。这种情况可能让企业陷入困境。如果用户使用他们的私人设备，企业不得不担心在这个不受控制的设备上的机密信息（例如员工的电子邮件和通讯录）。

<!--To address this situation, Android 5.0 (API level 21) allows enterprises to set up a special work user profile using the Managed Profile API. This user profile is called a managed profile, or a work profile in the Android for Work program. If a device has a managed profile for work, the profile's settings are under the control of the enterprise administrator. The administrator can choose which apps are allowed for that profile, and can control just what device features are available to the profile. -->

为了处理这种情况，Android 5.0（API 21）允许企业使用 managed profile 建立一个特别的企业用户 profile，或是在 Android for Work 计划中建立一个企业 profile。如果设备有企业 managed profile，该 profile 的设置是在企业管理员的控制之下的。管理员可以选择在这个 profile 之下，什么应用程序可以运行，什么设备功能可以允许。

<!--Create a Managed Profile-->
## 创建 Managed Profile

<!--To create a managed profile on a device that already has a personal profile, first check that the device can support a managed profile, by seeing if the device supports the FEATURE_MANAGED_USERS system feature:-->

要在一个已经有了私人 profile 的设备上创建一个 managed profile，首先得看看该设备是否支持 [FEATURE_MANAGED_USERS](http://developer.android.com/reference/android/content/pm/PackageManager.html#FEATURE_MANAGED_USERS) 系统特性，才能确定该设备是否支持 managed profile：


```java
PackageManager pm = getPackageManager();
if (!pm.hasSystemFeature(PackageManager.FEATURE_MANAGED_USERS)) {

    // This device does not support native managed profiles!

}
```

<!--If the device supports managed profiles, create one by sending an intent with an ACTION_PROVISION_MANAGED_PROFILE action. Include the device admin package name as an extra.-->

如果该设备支持 managed profile，通过发送一个带有 [ACTION_PROVISION_MANAGED_PROFILE](http://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#ACTION_PROVISION_MANAGED_PROFILE) 行动的 intent 来创建一个 managed profile。另外要包括该设备的管理包名。

```java
Activity provisioningActivity = getActivity();

// You'll need the package name for the WPC app.
String myWPCPackageName = "com.example.myWPCApp";

// Set up the provisioning intent
Intent provisioningIntent =
        new Intent("android.app.action.PROVISION_MANAGED_PROFILE");
intent.putExtra(myWPCPackageName,
        provisioningActivity.getApplicationContext().getPackageName());

if (provisioningIntent.resolveActivity(provisioningActivity.getPackageManager())
         == null) {

    // No handler for intent! Can't provision this device.
    // Show an error message and cancel.
} else {

    // REQUEST_PROVISION_MANAGED_PROFILE is defined
    // to be a suitable request code
    startActivityForResult(provisioningIntent,
            REQUEST_PROVISION_MANAGED_PROFILE);
    provisioningActivity.finish();
}
```

<!--The system responds to this intent by doing the following:-->

系统通过以下行为响应这个 intent：

<!--Verifies that the device is encrypted. If it is not, the system prompts the user to encrypt the device before proceeding. -->

* 验证设备是被加密的。如果没有加密，在继续操作之前系统会提示用户对设备进行加密。

<!--Creates a managed profile. -->

* 创建一个 managed profile。

<!--Removes non-required applications from the managed profile. -->

* 从 managed profile 中移除非必需的应用。

<!--Copies the device policy controller app into the managed profile and sets it as the profile owner. -->

* 复制设备策略控制器应用到 managed profile 中，并将设备策略控制器设置为该 profile 的所有者。

<!--Override onActivityResult() to see whether the provisioning was successful, as shown in the following example code:-->

如以下实例代码所示，重写 [onActivityResult()](http://developer.android.com/reference/android/app/Activity.html#onActivityResult%28int,%20int,%20android.content.Intent%29) 来查看部署是否完成。

```java
@Override
public void onActivityResult(int requestCode, int resultCode, Intent data) {

    // Check if this is the result of the provisioning activity
    if (requestCode == REQUEST_PROVISION_MANAGED_PROFILE) {

        // If provisioning was successful, the result code is 
        // Activity.RESULT_OK
        if (resultCode == Activity.RESULT_OK) {
            // Hurray! Managed profile created and provisioned!
        } else {
            // Boo! Provisioning failed!
        }
        return;

    } else {
        // This is the result of some other activity, call the superclass
        super.onActivityResult(requestCode, resultCode, data);
    }
}
```

<!--After Creating the Managed Profile-->
## 创建 Managed Profile 之后

<!--When the profile has been provisioned, the system calls the device policy controller app's DeviceAdminReceiver.onProfileProvisioningComplete() method. Override this callback method to finish enabling the managed profile.-->

当 profile 部署完成，系统调用设备策略控制器应用的 [DeviceAdminReceiver.onProfileProvisioningComplete()](http://developer.android.com/reference/android/app/admin/DeviceAdminReceiver.html#onProfileProvisioningComplete%28android.content.Context,%20android.content.Intent%29) 方法。重写该回调方法来完成启用 managed profile。

<!--Typically, your DeviceAdminReceiver.onProfileProvisioningComplete() callback implementation would perform these tasks:-->

通常，你的 [DeviceAdminReceiver.onProfileProvisioningComplete()](http://developer.android.com/reference/android/app/admin/DeviceAdminReceiver.html#onProfileProvisioningComplete%28android.content.Context,%20android.content.Intent%29) 会执行这些任务：

<!--Verify that the device is complying with the EMM's device policies, as described in Set Up Device Policies-->

* 如[建立设备政策](http://developer.android.com/training/enterprise/work-policy-ctrl.html#set_up_policies)所述，确认设备遵守 EMM 的设备策略

<!--Enable any system applications that the administrator chooses to make available within the managed profile, using DevicePolicyManager.enableSystemApp()-->

* 使用[DevicePolicyManager.enableSystemApp()](developer.android.com/reference/android/app/admin/DevicePolicyManager.html#enableSystemApp(android.content.ComponentName,%20android.content.Intent)) 来启动管理员在 managed profile 中允许使用的任何系统应用

<!--If the device uses Google Play for Work, add the Google account to the managed profile with AccountManager.addAccount(), so administrators can install applications to the device -->

* 如果设备使用 Google Play for Work，用 [AccountManager.addAccount()](http://developer.android.com/reference/android/accounts/AccountManager.html#addAccount%28java.lang.String,%20java.lang.String,%20java.lang.String[],%20android.os.Bundle,%20android.app.Activity,%20android.accounts.AccountManagerCallback%3Candroid.os.Bundle%3E,%20android.os.Handler%29) 在 managed profile 中添加 Google 账号，管理员就能往设备中安装应用了。

<!--Once you have completed these tasks, call the device policy manager's setProfileEnabled() method to activate the managed profile:-->

一旦你完成了这些任务，调用设备策略管理器的 [setProfileEnabled()](http://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setProfileEnabled%28android.content.ComponentName%29) 方法来激活 managed profile：

```java
// Get the device policy manager
DevicePolicyManager myDevicePolicyMgr =
        (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);

ComponentName componentName = myDeviceAdminReceiver.getComponentName(this);

// Set the name for the newly created managed profile.
myDevicePolicyMgr.setProfileName(componentName, "My New Managed Profile");

// ...and enable the profile
manager.setProfileEnabled(componentName);
```

<!--Set Up Device Policies-->
## 建立设备策略

<!-- The device policy controller app is responsible for applying the enterprise's device policies. For example, a particular enterprise might require that all devices become locked after a certain number of failed attempts to enter the device password. The controller app queries the EMM to find out what the current policies are, then uses the Device Administration API to apply those policies.-->

设备策略管理器应用负责实行企业的设备策略。例如，某个企业可能需要在输错一定次数的设备密码后锁定所有设备。该控制器应用需要 EMM 查出当前的策略是什么，然后使用设备管理 API 来实行这些策略。

<!--For information on how to apply device policies, see the Device Administration guide.-->

更多关于如何实行设备策略的信息，请查看[设备管理](http://developer.android.com/guide/topics/admin/device-admin.html#policies)指南。

<!--Apply App Restrictions-->
## 实行应用限制

<!--Enterprise environments may require that approved apps implement security or feature restrictions. App developers must implement these restrictions and declare them for use by enterprise administrators, as described in Implementing App Restrictions. The device policy controller receives restriction changes from the enterprise administrator, and forwards those restriction changes to the apps.-->

企业环境可能需要那些批准的应用实现安全性或功能限制。应用开发人员必须实现这些限制，并声明由企业管理员使用，如[实现应用的限制](http://developer.android.com/training/enterprise/app-restrictions.html)所说。设备政策管理器接收来自企业管理员改变的限制，并将这些限制的改变传送给相关应用。

<!--For example, a particular news app might have a restriction setting that controls whether the app is allowed to download videos over a cellular network. When the EMM wants to disable cellular downloads, it sends a notification to the controller app. The controller app, in turn, notifies the news app that the restriction setting has changed.-->

例如，某个新闻应用有一个控制应用是否允许在蜂窝网络下下载视频的限制设定。当 EMM 想要禁用蜂窝下载，它就给控制器应用发送通知。于是控制器应用转而通知新闻应用限制设定被改变了。

<!--Note: This document covers how the device policy controller app changes the restriction settings for the other apps on the managed profile. Details on how the device policy controller app communicates with the EMM are out of scope for this document.-->

> 注意：本文档涵盖了设备策略管理器应用如何改变 managed profile 中其他应用的限制设定。关于设备策略管理器应用如何与 EMM 进行通讯的细节并不在本文档的范围之内。

<!--To change an app's restrictions, call the DevicePolicyManager.setApplicationRestrictions() method. This method is passed three parameters: the controller app's DeviceAdminReceiver, the package name of the app whose restrictions are being changed, and a Bundle that contains the restrictions you want to set.-->

为了改变一个应用的限制，调用 [DevicePolicyManager.setApplicationRestrictions()](http://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setApplicationRestrictions%28android.content.ComponentName,%20java.lang.String,%20android.os.Bundle%29) 方法。该方法需要传入三个参数：该控制器应用的 [DeviceAdminReceiver](http://developer.android.com/reference/android/app/admin/DeviceAdminReceiver.html)，限制被改变的应用的包名，以及包含了你想要设置的限制的 [Bundle](http://developer.android.com/reference/android/os/Bundle.html)。

<!--For example, suppose there's an app on the managed profile with the package name "com.example.newsfetcher". This app has a single boolean restriction that can be configured, with the key "downloadByCellular". If this restriction is set to false, the newsfetcher app is not allowed to download data through a cellular network; it must use a Wi-Fi network instead.-->

例如，假设 managed profile 中有一个应用包名是 `"com.example.newsfetcher"`。该应用有一个布尔型限制可以被配置，key 是 `"downloadByCellular"`。如果这个限制被设置为 `false`，该应用在蜂窝网络下就不能下载数据，它必须使用 Wi-Fi 网络代替。

<!--If your device policy controller app needs to turn off cellular downloads, it would first fetch the device policy service object, as described above. It then assembles a restrictions bundle and passes this bundle to setApplicationRestrictions(): -->

如果你的设备策略管理器应用需要关掉蜂窝下载，它首先要取得设备策略服务对象，如上文所说。然后集合一个限制 bundle 并将该 bundle 传入 [setApplicationRestrictions()](http://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setApplicationRestrictions%28android.content.ComponentName,%20java.lang.String,%20android.os.Bundle%29)：

```java
// Fetch the DevicePolicyManager
DevicePolicyManager myDevicePolicyMgr =
        (DevicePolicyManager) thisActivity
                .getSystemService(Context.DEVICE_POLICY_SERVICE);

// Set up the restrictions bundle
bundle restrictionsBundle = new Bundle();
restrictionsBundle.putBoolean("downloadByCellular", false);

// Pass the restrictions to the policy manager. Assume the WPC app
// already has a DeviceAdminReceiver defined (myDeviceAdminReceiver).
myDevicePolicyMgr.setApplicationRestrictions(
        myDeviceAdminReceiver, "com.example.newsfetcher", restrictionsBundle);
```

<!--Note: The device policy service conveys the restrictions change to the app you name. However, it is up to that app to actually implement the restriction. For example, in this case, the app would be responsible for disabling its ability to use cellular networks for video downloads. Setting the restriction does not cause the system to enforce this restriction on the app. For more information, see Implementing App Restrictions.-->

> 注意：该设备策略服务将限制改变传递给了你所指定的应用。然而，实际是由应用来执行该限制。例如，在这个情况中，该应用要负责禁用它本身的使用蜂窝网络下载视频的功能。设置限制并不能让系统强制在应用上实现限制。更多信息，请查看[实现应用的限制](http://developer.android.com/training/enterprise/app-restrictions.html)。
