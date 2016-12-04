# 运行时权限
编写:[Goerver](https://github.com/orangebook) - 原文: Declaring Permissions https://developer.android.com/training/permissions/declaring.html

本课程将教您：

1.检查permissions

2.请求权限

依赖关系和先决条件
> Android 6.0 (API level 23)

你也应该阅读
> [Normal and Dangerous Permissions](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous)

开始在安卓6（23级），用户授予权限的应用程序，而应用程序运行时，而不是当他们安装的应用程序。这种方法简化了应用程序的安装过程中，由于用户不需要的权限在安装或更新应用程序。它也给用户更多的控制应用程序的功能，例如，一个用户可以选择给一个摄像头的应用程序访问相机，但不到设备的位置。用户可以在任何时候撤销权限，通过去应用程序的设置屏幕。

系统权限分为两类，正常和危险：
* 正常权限不直接风险用户的隐私。如果您的应用程序在它的清单中列出了一个正常的权限，系统将自动授予权限。

* 危险的权限可以给应用程序访问用户的机密数据。如果您的应用程序在它的清单中列出了一个正常的权限，系统将自动授予权限。如果你列出一个危险的许可，用户必须明确地给予你的应用程序的批准。

> 更多信息，请参见[正常和危险的权限](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous)。

在所有版本的安卓系统上，您的应用程序需要在它的应用程序清单中声明所需的正常和危险的权限，如 [Declaring Permissions](https://developer.android.com/training/permissions/declaring.html)。然而，这个声明是根据系统版本和应用程序的目标SDK版本有不同的影响：
* 如果设备运行的是Android 5.1或更低，或者你的应用程序的目标SDK 22或更低：如果你在你的清单列表中的一个危险的权限，用户授予权限时，安装程序；如果他们不授予权限，将无法安装应用程序。
* 如果设备运行的是Android 6或更高，和您的应用程序的SDK是23或更高的目标：应用程序已列出清单的权限，必须要求每一个危险的权限需要在程序运行。用户可以授予或拒绝每个权限，即使用户拒绝了权限请求，应用程序也可以继续使用有限的功能进行运行。

> 注：开始与安卓6（23级），用户可以撤销任何应用程序的权限在任何时间，即使应用程序的目标是一个较低的应用程序的接口。你应该测试你的应用程序，以验证它的行为正确，当它错过了一个需要的许可，无论什么样的应用程序目标的应用程序的目标。

本课介绍如何使用安卓系统[支持库](https://developer.android.com/tools/support-library/index.html)来检查和请求，权限。的安卓框架提供了类似的方法，如安卓6（23级）。然而，使用支持库是更简单的，因为你的应用程序不需要检查它的版本的安卓系统运行之前调用的方法。

## 权限检查Check For Permissions
如果你的应用程序需要一个危险的许可，你必须检查是否你有这样的权限，每次你执行一个操作，需要该权限。用户总是可以自由地撤销许可，所以即使应用程序昨天使用的相机，它不能承担它仍然有今天的许可。

检查如果你有权限，调用contextcompat.checkselfpermission()方法。例如，这段代码显示如何检查活动具有写权限的日历：

```
// Assume thisActivity is the current activity
int permissionCheck = ContextCompat.checkSelfPermission(thisActivity,
        Manifest.permission.WRITE_CALENDAR);
```

如果应用程序的许可，该方法返回packagemanager.permission_granted，应用程序可以继续运行。如果应用程序没有权限，该方法返回[permission_denied](https://developer.android.com/reference/android/content/pm/PackageManager.html#PERMISSION_DENIED)，，那么应用程序必须显式地向用户请求权限。

## 权限请求-Request Permissions

如果您的应用程序需要一个危险的许可，在应用程序清单中列出，它必须要求用户授予权限。安卓提供了一些可以使用的方法来请求权限。调用这些方法带来了一个标准的安卓对话框，你不能自定义。

### 解释为什么应用程序需要权限
![permission-request-png](http://7xprps.com1.z0.glb.clouddn.com/16-9-10/42141550.jpg)
在某些情况下，你可能希望帮助用户理解为什么你的应用程序需要一个权限。例如，如果一个用户推出了一个摄影应用程序，用户可能不会感到惊讶的是，该应用程序要求允许使用相机，但用户可能不明白为什么该应用程序要访问用户的位置或联系人。在请求许可之前，你应该考虑向用户提供一个解释。请记住，你不想压倒用户的解释；如果你提供了太多的解释，用户可能会发现应用程序的令人沮丧，并删除它。

您可能使用的一种方法是提供一个解释，只有当用户已经拒绝了该权限请求。如果一个用户试图使用需要一个权限的功能，但拒绝了权限请求，这可能表明用户不理解为什么应用程序需要提供该功能的权限。在这样的情况下，这可能是一个好主意，以显示一个解释。

帮助找到的情况下，用户可能需要一个解释，Android提供了一个公共的方法，shouldshowrequestpermissionrationale()。如果应用程序请求此权限，并且用户拒绝了请求，则此方法返回真值。

> 注意：如果用户在过去拒绝了权限请求，并在“权限请求系统”对话框中选择了“不要再问”选项，该方法返回“错误”。如果设备策略禁止应用程序具有该权限，该方法还将返回错误的方法。

作者 [@Goerver][1]
2016 年 09月 10日

[1]: http://www.flyfishonline.com/
