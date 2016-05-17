<!--Configuring Corporate-Owned, Single-Use Devices-->
# 配置 COSU 设备

> 编写：[zenlynn](https://github.com/zenlynn) 原文：<https://developer.android.com/training/enterprise/cosu.html>

<!--As an IT administrator, you can configure Android 6.0 Marshmallow and later devices as corporate-owned, single-use (COSU) devices. These are Android devices used for a single purpose, such as digital signage, ticket printing, point of sale, or inventory management. To use Android devices as COSU devices, you need to develop Android apps that your customers can manage.-->

作为一个 IT 管理员，你可以将 Android 6.0 Marshmallow 以及更高版本的设备配置为企业拥有、功能单一（COSU）的设备。这些 Android 设备用于单一目的，比如数字标牌、票据打印、销售点或者库存管理。要将 Android 设备作为 COSU 设备使用，你需要开发客户可以管理的 Android 应用。

<!--Your customers can configure COSU devices:-->
你的客户可以配置 COSU 设备：

<!--To lock a single application to the screen, and hide the Home and Recents buttons to prevent users from escaping the app.-->

* 锁定一个应用在屏幕上，隐藏主页和最近使用的按钮来防止用户离开该应用。

<!--To allow multiple applications to appear on the screen, such as a library kiosk with a catalog app and web browser.-->

* 允许多个应用出现在屏幕上，比如有目录的图书馆和网络浏览器。

<!--App pinning vs. lock task mode-->
## 固定应用 vs 锁定任务模式

<!--Android 5.0 Lollipop introduced two new ways to configure Android devices for a single purpose:-->

Android 5.0 Lollipop 系统引进了两种方式来配置单一目的的 Android 设备：

<!--With app pinning, the device user can temporarily pin specific apps to the screen.-->

* 通过固定应用，设备用户可以将特定的应用临时固定在屏幕上。

<!--With lock task mode, a user can’t escape the app and the Home and Recents buttons are hidden. Additionally, lock task mode gives the IT administrator a more robust way to manage COSU devices, as discussed below.-->

* 通过锁定任务模式，用户无法离开该应用，且主页和最近使用的按钮都被隐藏了。此外，锁定任务模式使得 IT 管理员可以用更可靠的方式来管理 COSU 设备，如下面所讨论的。

<!--This graphic compares the features of app pinning and lock task mode:-->

这是固定应用和锁定任务模式之间功能比较的图表：

![](https://github.com/zenlynn/android-training-course-in-chinese/blob/master/enterprise/pinning_vs_locktaskmode.png?raw=true)

**Figure 1.** Lollipop 系统的固定应用和 Marshmallow 以及更高版本系统的锁定任务模式之间的比较

<!--In Lollipop, you can pin a single application to cover the full screen, but only apps whitelisted by the device policy controller (DPC) can be locked.-->

在 Lollipop 系统中，你可以固定一个应用来覆盖整个屏幕，但是只有被设备策略控制器（DPC）加入白名单的应用才可以被锁定。

<!--How to use LockTask mode-->
## 如何使用锁定任务模式

<!--To use LockTask mode, and the APIs that manage COSU devices, there must be a device owner application installed on the device. Device owners are a type of device policy controller (DPC) that manages the whole device. For more information about DPCs, see the EMM Developer’s Overview.-->

为了使用锁定任务模式以及管理 COSU 设备的接口，设备必须安装设备所有者应用。设备所有者是一种设备策略控制器（DPC），用来管理整个设备。更多关于 DPC 的信息，请查看 [EMM 开发人员概述](https://developers.google.com/android/work/overview)。

<!--If you’re creating a new COSU app, we recommend you develop it for Marshmallow or later, which includes the following COSU features:-->

如果你创建了一个新的 COSU 应用，我们建议你为 Marshmallow 以及更高版本的系统开发该应用。因为这些系统包括以下 COSU 特性：

<!--Controls system updates-->

* 控制系统更新

<!--Sets status and menu bar visibility-->

* 设置状态和菜单栏可见

<!--Disables screen lock and sleep functions-->

* 禁用屏幕锁定以及睡眠功能

<!--Permits switching between apps while staying in lock task mode-->

* 在锁定任务模式中允许切换应用

<!--Prevents restarting in safe mode-->

* 在安全模式中防止重启

<!--Note: If you develop COSU features targeted for Marshmallow devices, your app can still be compatible with prior versions of Android.-->

> 注意：如果你为 Marshmallow 系统的设备开发 COSU 特性，你的应用仍然可以与 Android 早期版本兼容。

<!--Additional COSU management features launched with Marshmallow make it easier to develop and deploy Android devices as a single-use device. If you want to enforce server-side app restrictions or server-side profile policy controls, you need to use an EMM or make your application a DPC. Follow the instructions below as you create your application.-->

Marshmallow 系统附加的 COSU 管理特性使得开发、部署 Android 设备为功能单一的设备更加容易。如果你想要增强服务端应用限制或服务端 profile 策略控制，你需要使用 EMM 或为你应用添加 DPC。当你创建应用的时候请按照以下说明做。

<!--Build COSU solutions-->
## 创建 COSU 解决方案

<!--There are two different ways to manage COSU devices:-->

管理 COSU 设备有两个不同的方法：

<!--Use a third-party enterprise mobility management (EMM) solution: Using an EMM, all you need to do is set up lock task mode. For instructions, skip to the next section, Solutions managed by a third-party EMM.-->

* 使用第三方企业移动管理（EMM）解决方案：使用 EMM，你需要做的所有就是设置锁定任务模式。更多信息，请跳到下一个部分，[第三方 EMM 管理的解决方案](https://developer.android.com/training/enterprise/cosu.html#emm-solutions)。

<!--Advanced setup—Create your own DPC app: This requires more work and is intended for an advanced developer audience. With this option, you’ll need to set up the device so that you can manage it, set up APIs, and set up a DPC app and test it. For instructions, skip to Create your own DPC app.-->

* 高级设置——创建你自己的 DPC 应用：这部分内容需要更多的工作，是为了高级开发人员而设。选择这个方法，你需要设置好设备才可以对它进行管理、建立接口、建立 DPC 并测试。更多说明，请跳到[创建你自己的 DPC 应用](https://developer.android.com/training/enterprise/cosu.html#create-dpc)。

<!--Solutions managed by a third-party EMM-->
## 第三方 EMM 管理的解决方案

<!--In this section, you’ll need to do a small amount of development to have your device work with a third-party EMM.-->

在这个部分，你只需要做少量的开发就可以让你的设备在第三方 EMM 下工作。

<!--Using startLockTask()-->
### 使用 startLockTask()

<!--If you need to add COSU functionality to an existing app, make sure that the customer’s EMM supports lockTaskMode.-->

如果你需要添加 COSU 功能到已存在的应用中，要确保客户的 EMM 支持 [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode)。

<!--The device owner must include your app’s package(s) in setLockTaskPackages
Sets the packages that can enter into lock task mode
Needs to be set by the EMM
You can call isLockTaskPermitted to verify that your package has been whitelisted by setLockTaskPackages.-->

* 在 [setLockTaskPackages](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setLockTaskPackages%28android.content.ComponentName,%20java.lang.String[]%29) 中，设备所有者必须包括你的应用的包。
  - 设置可以进入锁定任务模式的包
  - 要用 EMM 设置
  - 你可以调用 [isLockTaskPermitted](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#isLockTaskPermitted%28java.lang.String%29) 来确认你的包已经通过 [setLockTaskPackages](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setLockTaskPackages%28android.content.ComponentName,%20java.lang.String[]%29) 添加到白名单里了

<!--Your activity calls startLockTask()
Requests to lock the user into the current task
Prevents launching other apps, settings, and the Home button-->

* 你的活动调用 [startLockTask()](https://developer.android.com/reference/android/app/Activity.html#startLockTask%28%29)
  - 请求将用户锁定在当前任务
  - 防止启动其他应用、设置以及主页按钮

<!--To exit, your activity must call stopLockTask()
Can only be called on an activity that’s previously called startLockTask()
Should be called when the app is user-facing between onResume() and onPause()-->

* 为了退出，你的活动必须调用 [stopLockTask()](https://developer.android.com/reference/android/app/Activity.html#stopLockTask%28%29)
  - 只能在之前调用过 [ startLockTask()](https://developer.android.com/reference/android/app/Activity.html#startLockTask()) 的活动里调用
  - 应用必须在 [onResume()](https://developer.android.com/reference/android/app/Activity.html#onResume%28%29) 和 [onPause()](https://developer.android.com/reference/android/app/Activity.html#onPause%28%29) 之间面向用户时调用

<!--Starting from Marshmallow, if your app is whitelisted by an EMM using setLockTaskPackages, your activities can automatically start lock task mode when the app is launched.-->

从 Marshmallow 系统开始，如果你的应用被 EMM 用 [setLockTaskPackages](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setLockTaskPackages%28android.content.ComponentName,%20java.lang.String[]%29) 添加到白名单中，那么在应用被启动后，你的活动可以自动开始锁定任务模式。

<!--Set the lockTaskMode attribute-->
### 设置锁定任务模式属性

<!--The lockTaskMode attribute allows you to define your app’s lock task mode behavior in the AndroidManifest.xml file:-->

[lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode) 允许你在 AndroidManifest.xml 文件里定义你的应用的锁定任务模式行为：

<!--If you set lockTaskMode to if_whitelisted, you don’t need to call startLockTask(), and the app automatically enters into lock task mode.-->

* 如果你将 [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode) 设置为 `if_whitelisted`，你不需要调用 [startLockTask()](https://developer.android.com/reference/android/app/Activity.html#startLockTask%28%29)，应用会自动进入锁定任务模式。

<!--System apps and privileged apps can also set lockTaskMode to always. This setting causes tasks (rooted at your activity) to always launch into lock task mode. Non-privileged apps are treated as normal.-->

* 系统应用和特许应用也可以将 [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode) 设置为 always。该设定会让你活动里的任务总是启动到锁定任务模式。对待非特许应用与平常一样。

<!--The default value of the lockTaskMode attribute is normal. When this attribute is set to normal, tasks don’t launch into lockTaskMode, unless startLockTask() is called. To call startLockTask(), applications still need to be whitelisted using setLockTaskPackages, otherwise, the user sees a dialog to approve entering pinned mode.-->

* [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode) 属性的默认值是 normal。当这个属性设置为 normal 时，任务不会启动到 [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode)，除非调用 [startLockTask()](https://developer.android.com/reference/android/app/Activity.html#startLockTask%28%29)。想要调用 [startLockTask()](https://developer.android.com/reference/android/app/Activity.html#startLockTask%28%29)，仍然需要使用 [ setLockTaskPackages](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setLockTaskPackages%28android.content.ComponentName,%20java.lang.String[]%29) 将应用加入白名单，否则，用户会看到同意进入固定模式的对话框。

<!--To have your activity automatically enter lockTaskMode, change the value of this attribute to if_whitelisted. Doing so causes your app to behave in this manner:-->

为了让你的活动自动进入 [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode)，要把这个属性值改为 `if_whitelisted`。这么做可以让你的应用以这种方式表现：

<!--If your app isn’t whitelisted for lockTaskMode, it behaves as normal.-->

* 如果你的应用不是 [lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode) 的白名单，它会表现得像平常一样。

<!--If your app is a system or privileged app, and it’s whitelisted, lockTaskMode automatically starts when the app is launched.-->

* 如果你的应用是系统应用或特许应用，且属于白名单，当应用启动的时候，[lockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode) 会自动开始。

<!--Example XML as follows:-->

示例 XML 如下：

```xml
<activity android:name=".MainActivity" android:lockTaskMode="if_whitelisted">
```

<!--Given either of these options, you still need to create a mechanism for calling stopLockTask() so that users can exit lockTaskMode.-->

有了这些选项，你仍然需要创建一个调用 [stopLockTask()](https://developer.android.com/reference/android/app/Activity.html#stopLockTask%28%29) 的机制，用户才能退出 [ockTaskMode](https://developer.android.com/reference/android/R.attr.html#lockTaskMode)。

<!--Advanced setup—Create your own DPC app-->
## 高级设置——创建你自己的 DPC 应用

<!--To manage applications in COSU, you need a DPC running as device owner to set several policies on the device.-->

为了在 COSU 中管理应用，你需要一个 DPC 作为设备所有者运行，来设置设备的一些策略。

<!--Note: This setup is advanced, and requires a thorough understanding of the EMM concepts described in the EMM developer overview. For more information about building a DPC, see Provision Customer Devices.-->

> 注意：这个设置是高级的，且需对 [EMM 开发人员概述](https://developers.google.com/android/work/prov-devices#implementation_considerations_for_device_owner_mode)所说的 EMM 概念有透彻的认识。更多关于创建 DPC 的信息，请查看[提供用户设备](https://developers.google.com/android/work/prov-devices)。

<!--To create a DPC app that can manage COSU device configuration, the DPC needs to:-->

为了创建可以管理 COSU 设备配置的 DPC 应用，该 DPC 需要：

<!--Provision the device into device owner mode. We recommend that you support provisioning with near field communication (NFC) bump. For more information, see Device Owner Provisioning via NFC.
Use the following APIs:
Keep devices from locking with the keyguard using setKeyguardDisabled()
Disable the status bar using setStatusBarDisabled()
Keep a device’s screen on while plugged in via STAY_ON_WHILE_PLUGGED_IN
Set default user restrictions via addUserRestriction()
Set system update policies using setSystemUpdatePolicy()
Ensure your app is launched on reboot by setting it as the default launcher-->

1. 提供进入设备所有者模式的设备。我们建议你支持提供近场通讯。更多信息，请查看[通过 NFC 提供的设备所有者](https://developers.google.com/android/work/prov-devices#nfc_method)。

2. 使用以下接口：
  - 使用 [setKeyguardDisabled()](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setKeyguardDisabled%28android.content.ComponentName,%20boolean%29) 防止设备键盘锁锁定
  - 使用 [setStatusBarDisabled()](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setStatusBarDisabled%28android.content.ComponentName,%20boolean%29) 禁用状态栏
  - 通过 [STAY_ON_WHILE_PLUGGED_IN](https://developer.android.com/reference/android/provider/Settings.Global.html#STAY_ON_WHILE_PLUGGED_IN) 让设备通电的时候保持屏幕点亮
  - 通过 [addUserRestriction()](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#addUserRestriction%28android.content.ComponentName,%20java.lang.String%29) 设置默认用户限制
  - 使用 [setSystemUpdatePolicy()](https://developer.android.com/reference/android/app/admin/DevicePolicyManager.html#setSystemUpdatePolicy%28android.content.ComponentName,%20android.app.admin.SystemUpdatePolicy%29) 设置系统更新策略
  - 通过设定你的应用为默认启动应用，来确保重启时它会启动

<!--Here’s an example of how to implement an activity that starts lock task mode and implements the relevant COSU device management APIs:-->

这个示例展示了如何实现开始锁定任务模式、执行相关的 COSU 设备管理接口的活动：

```java
public class CosuActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mAdminComponentName = DeviceAdminReceiver.getComponentName(this);
        mDevicePolicyManager = (DevicePolicyManager) getSystemService(
                Context.DEVICE_POLICY_SERVICE);
        mPackageManager = getPackageManager();
        setDefaultCosuPolicies(true);
    }

    @Override
    protected void onStart() {
        super.onStart();

        // start lock task mode if it's not already active
        ActivityManager am = (ActivityManager) getSystemService(
            Context.ACTIVITY_SERVICE);
        // ActivityManager.getLockTaskModeState api is not available in pre-M.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            if (!am.isInLockTaskMode()) {
                startLockTask();
            }
        } else {
            if (am.getLockTaskModeState() == 
                ActivityManager.LOCK_TASK_MODE_NONE) {
                startLockTask();
            }
        }
    }

    private void setDefaultCosuPolicies(boolean active) {
        // set user restrictions
        setUserRestriction(DISALLOW_SAFE_BOOT, active);
        setUserRestriction(DISALLOW_FACTORY_RESET, active);
        setUserRestriction(DISALLOW_ADD_USER, active);
        setUserRestriction(DISALLOW_MOUNT_PHYSICAL_MEDIA, active);
        setUserRestriction(DISALLOW_ADJUST_VOLUME, active);

        // disable keyguard and status bar
        mDevicePolicyManager.setKeyguardDisabled(mAdminComponentName, active);
        mDevicePolicyManager.setStatusBarDisabled(mAdminComponentName, active);

        // enable STAY_ON_WHILE_PLUGGED_IN
        enableStayOnWhilePluggedIn(active);

        // set System Update policy

        if (active){
                mDevicePolicyManager.setSystemUpdatePolicy(mAdminComponentName, 
                SystemUpdatePolicy.createWindowedInstallPolicy(60,120));
        }
        else
        

        // set this Activity as a lock task package

        mDevicePolicyManager.setLockTaskPackages(mAdminComponentName,
            active ? new String[]{getPackageName()} : new String[]{});

        IntentFilter intentFilter = new IntentFilter(Intent.ACTION_MAIN);
        intentFilter.addCategory(Intent.CATEGORY_HOME);
        intentFilter.addCategory(Intent.CATEGORY_DEFAULT);

        if (active) {
            // set Cosu activity as home intent receiver so that it is started
            // on reboot
            mDevicePolicyManager.addPersistentPreferredActivity(
                mAdminComponentName, intentFilter, new ComponentName(
                getPackageName(), CosuModeActivity.class.getName()))
        } else {
            mDevicePolicyManager.clearPackagePersistentPreferredActivities(
                mAdminComponentName, getPackageName());
        }
    }

    private void setUserRestriction(String restriction, boolean disallow) {
        if (disallow) {
            mDevicePolicyManager.addUserRestriction(mAdminComponentName, 
                restriction);
        } else {
            mDevicePolicyManager.clearUserRestriction(mAdminComponentName,
                restriction);
        }
    }

    private void enableStayOnWhilePluggedIn(boolean enabled) {
        if (enabled) {
                mDevicePolicyManager.setGlobalSetting(
                        mAdminComponentName, 
                        Settings.Global.STAY_ON_WHILE_PLUGGED_IN,
                        BatteryManager.BATTERY_PLUGGED_AC 
                        | BatteryManager.BATTERY_PLUGGED_USB 
                        | BatteryManager.BATTERY_PLUGGED_WIRELESS);
        } else {
                mDevicePolicyManager.setGlobalSetting(
                        mAdminComponentName, 
                        Settings.Global.STAY_ON_WHILE_PLUGGED_IN, 0);
        }

    }

    // TODO: Implement the rest of the Activity
}
```

<!--Develop a test plan for COSU-->
## 为 COSU 开发测试计划

<!--If you’re planning to support a third-party EMM, develop an end-to-end testing plan utilizing the EMM’s app. We also provide testing resources, which you can use to create your own Test Device Policy Client (Test DPC):-->

如果你计划支持第三方 EMM，那么利用 EMM 应用开发一个终端到终端的测试计划。我们同样提供测试资源，让你可以用来创建你自己的测试设备策略客户端（测试 DPC）：

<!--TestDPC on Google Play-->

* [在Google Play 上的测试 DPC](https://play.google.com/store/search?q=testdpc)

<!--TestDPC for COSU source code on GitHub-->

* [GitHub 上创建测试 DPC 的 COSU 源代码](https://github.com/googlesamples/android-testdpc/tree/master/app/src/main/java/com/afwsamples/testdpc/cosu)

<!--Test Device Policy Control app source code on GitHub
-->

* [GitHub 上测试设备策略应用的源代码](https://github.com/googlesamples/android-testdpc)
