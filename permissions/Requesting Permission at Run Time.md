# 运行时权限
编写:[Goerver](https://github.com/orangebook) - 原文: Declaring Permissions https://developer.android.com/training/permissions/declaring.html

本课程将教您：

1.检查permissions

2.请求权限

依赖关系和先决条件
> Android 6.0 (API level 23)

你也应该阅读
> [Normal and Dangerous Permissions](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous)

从安卓6.0（API Level 23）开始，用户在运行时授予应用程序请求的权限而不是在安装时。这种方法简化了应用程序的安装过程，因为用户不需要在安装或更新应用程序时授予权限。它也让用户可以更多的控制应用程序的功能，例如，一个用户可以选择给一个拍照应用程序访问相机的权限，不授予访问设备位置的权限。用户可以在任何时候通过系统设置撤销权限。

系统权限分为两类，正常和危险：
* 正常权限不直接威胁用户的隐私。如果您的应用程序在它的清单中列出了一个正常的权限，系统将自动授予权限。

* 危险的权限可以给应用程序访问用户的私密数据。如果您的应用程序在它的清单中列出了一个正常的权限，系统将自动授予权限。如果你列出一个危险的权限，用户必须明确地向你的应用程序授予该权限。

> 更多信息，请参见[正常和危险的权限](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous)。

在所有版本的安卓系统上，您的应用程序需要在它的应用程序清单中声明所需的正常和危险的权限，如 [Declaring Permissions](https://developer.android.com/training/permissions/declaring.html)。然而，这个声明是根据系统版本和应用程序的目标SDK版本有不同的影响：
* 如果设备运行的是Android 5.1或更低版本，或者你的应用程序的目标SDK版本是22或更低：如果你在你的清单列表中的一个危险的权限，用户需要在安装应用程序时授予权限；如果他们不授予权限，将无法安装应用程序。
* 如果设备运行的是Android 6.0或更高版本，和您的应用程序的目标SDK版本是23或更高：应用程序仍需要在清单中列出权限，并且在运行时要请求需要的危险权限。用户可以授予或拒绝每个权限，即使用户拒绝了权限请求，应用程序也可以继续使用有限的功能运行。

> 注：从安卓6.0（API Level 23）开始，用户可以在任何时间撤销任意应用程序的权限，即使应用程序的目标SDK是一个较低的版本。因此无论你的应用面向哪个版本，你都应该测试你的应用程序，以确保它在缺少权限时，行为依然正常。

本课介绍如何使用安卓系统[支持库](https://developer.android.com/tools/support-library/index.html)来检查和请求权限。安卓框架在6.0版本(API Level 23)也提供了类似的方法。然而，使用支持库更加简单，因为你的应用程序在调用方法之前不需要检查安卓系统的版本。

## 权限检查Check For Permissions
当你执行的操作需要危险权限时，每次执行该操作，你都需要检查该危险权限是否被许可。用户可以随时撤销对权限的许可，所以即使应用程序昨天可以使用相机，它不能保证今天它仍然有相机权限的许可。

检查如果你有权限，调用ContextCompat.checkSelfPermission()方法。例如，这段代码显示如何检查活动具有写权限的日历：

```
// Assume thisActivity is the current activity
int permissionCheck = ContextCompat.checkSelfPermission(thisActivity,
        Manifest.permission.WRITE_CALENDAR);
```

如果应用程序的许可，该方法返回PackageManager.PERMISSION_GRANTED，应用程序可以继续运行。如果应用程序没有权限，该方法返回[PERMISSION_DENIED](https://developer.android.com/reference/android/content/pm/PackageManager.html#PERMISSION_DENIED)，那么应用程序必须显式地向用户请求权限。

## 权限请求-Request Permissions

如果您的应用程序在应用程序清单中列出了一个危险权限，它必须要求用户授予权限。安卓提供了一些可以使用的方法来请求权限。调用这些方法带来了一个标准的无法自定义的安卓对话框。

### 解释为什么应用程序需要权限
![permission-request-png](http://7xprps.com1.z0.glb.clouddn.com/16-9-10/42141550.jpg)
在某些情况下，你可能希望帮助用户理解为什么你的应用程序需要一个权限。例如，如果用户打开了一个摄影应用程序，他可能不会感到奇怪的是，该应用程序要求允许使用相机，但用户可能不明白为什么该应用程序要访问用户的位置或联系人。在请求许可之前，你应该考虑向用户提供一个解释。请记住，你不应该通过解释压倒用户；如果你提供了太多的解释，用户可能会发现应用程序的令人失望，并删除它。

您可能使用的一种方法是只有当用户已经拒绝了该权限请求时提供一个解释。如果一个用户试图使用一个需要权限的功能，但拒绝了权限请求，这可能表明用户不理解为什么应用程序需要提供该功能的权限。在这样的情况下，显示一个解释可能是一个好主意。

为了知道什么情况下，用户可能需要一个解释，Android提供了一个公共的方法，shouldshowrequestpermissionrationale()。如果应用程序请求此权限，并且用户拒绝了请求，则此方法返回true。

> 注意：如果用户在过去拒绝了权限请求，并在“权限请求系统”对话框中选择了“不要再次询问”选项，该方法返回false。如果设备策略禁止应用程序具有该权限，该方法也将返回false。

作者 [@Goerver][1]
2016 年 09月 10日

[1]: http://www.flyfishonline.com/
