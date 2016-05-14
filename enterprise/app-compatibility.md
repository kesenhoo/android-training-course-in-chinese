<!--Ensuring Compatibility with Managed Profiles-->
# 利用 Managed Profile 确保兼容性 

> 编写：[zenlynn](https://github.com/zenlynn) 原文：<http://developer.android.com/training/enterprise/app-compatibility.html>

<!--The Android platform allows devices to have managed profiles. A managed profile is controlled by an administrator, and the functionality available to it is set separately from the functionality of the user's primary profile. This approach lets enterprises control the environment where company-specific apps and data are running on a user's device, while still letting users use their personal apps and profiles.-->

Android 平台允许设备有 [managed profile](http://developer.android.com/about/versions/android-5.0.html#Enterprise)。managed profile 由管理员控制，它的功能和用户原本的 profile 的功能是分别设置的。通过这种方法，在用户设备上运行的企业所定制应用程序和数据的环境就在企业的控制之下，同时用户还能使用私人的应用程序和 profile。

<!--This lesson shows you how to modify your application so it functions reliably on a device with managed profiles. You don't need to do anything besides the ordinary app-development best practices. However, some of these best practices become especially important on devices with managed profiles. This document highlights the issues you need to be aware of.-->

本节课展示了如何修改你的应用程序，使之能够在有 managed profile 的设备上可靠运行。除了一般应用开发的最佳实践外，你不用做任何事。然而，在有 managed profile 的设备上，最佳实践的其中一些规范变得尤为重要。本文件强调了你所需要了解的问题。

<!--Overview-->
## 概述

<!--Users often want to use their personal devices in an enterprise setting. This situation can present enterprises with a dilemma. If the user can use their own device, the enterprise has to worry that confidential information (like employee emails and contacts) are on a device the enterprise does not control. -->

用户经常想在企业环境中使用他们的私人设备。这种情况可能让企业陷入困境。如果用户使用他们的私人设备，企业不得不担心在这个不受控制的设备上的机密信息（例如员工的电子邮件和通讯录）。

<!--To address this situation, Android 5.0 (API level 21) allows enterprises to set up managed profiles. If a device has a managed profile, the profile's settings are under the control of the enterprise administrator. The administrator can choose which apps are allowed for that profile, and can control just what device features are available to the profile.-->

为了处理这种情况，Android 5.0（API 21）允许企业设置 managed profile。如果设备有 managed profile，这个 profile 的设置是在企业管理员的控制之下的。管理员可以选择在这个 profile 之下，什么应用程序可以运行，什么设备功能可以允许。

<!--If a device has a managed profile, there are implications for apps running on the device, no matter which profile the app is running under:-->

如果一个设备有 managed profile，那么，无论应用程序在哪个 profile 之下运行，都意味着：

<!--By default, most intents do not cross from one profile to the other. If an app running on profile fires an intent, there is no handler for the intent on that profile, and the intent is not allowed to cross to the other profile due to profile restrictions, the request fails and the app may shut down unexpectedly.-->

* 默认情况下，大部分的 intent 无法从一个 profile 跨越到另一个。如果在某个 profile 之下的一个应用程序创建了 intent，而这个 profile 无法响应，又因为 profile 的限制这个 intent 不允许跨越到其他 profile，那么，这个请求就失败了，应用程序可能意外关闭。

<!--The profile administrator can limit which system apps are available on the managed profile. This restriction can also result in there being no handler for some common intents on the managed profile.-->

* profile 管理员可以在 managed profile 中限制哪个系统应用程序可以运行。这个限制可能导致在 managed profile 中一些常见的 intent 无法处理。

<!--Since the managed and unmanaged profiles have separate storage areas, a file URI that is valid on one profile is not valid on the other. Any intent fired on one profile might be handled on the other (depending on profile settings), so it is not safe to attach file URIs to intents.-->

* 因为 managed profile 和非 managed profile 有各自的存储区域，导致文件 URI 在一个 profile 中有效，但在其他 profile 中无效。在一个 profile 中创建的 intent 可能在其他 profile（取决于 profile 设置）中被响应，所以在 intent 中放置文件 URI 是不安全的。

<!--Prevent Failed Intents-->
## 防止失败的 intent

<!--On a device with a managed profile, there are restrictions on whether intents can cross from one profile to another. In most cases, when an intent is fired off, it is handled on the same profile where it is fired. If there is no handler for the intent on that profile, the intent is not handled and the app that fired it may shut down unexpectedly—even if there's a handler for the intent on the other profile.-->

在一个有 managed profile 的设备上，intent 是否能从一个 profile 跨越到另一个，存在着限制。大多情况下，一个 intent 在哪个 profile 中创建，就在哪个 profile 中响应。如果那个 profile 中无法响应，就算在其他 profile 中可以响应，这个 intent 也不会被响应，而且创建这个 intent 的应用程序会意外关闭。

<!--The profile administrator can choose which intents are allowed to cross from one profile to another. Since the administrator makes this decision, there's no way for you to know in advance which intents are allowed to cross this boundary. The administrator sets this policy, and is free to change it at any time.-->

profile 管理员可以选择哪个 intent 可以从一个 profile 跨越到另一个。因为是由管理员做决定，所以你无法预先知道哪个 intent 可以跨越边界。管理员设置了这个策略，而且可以在任何时候自由更改。

<!--Before your app starts an activity, you should verify that there is a suitable resolution. You can verify that there is an acceptable resolution by calling Intent.resolveActivity(). If there is no way to resolve the intent, the method returns null. If the method returns non-null, there is at least one way to resolve the intent, and it is safe to fire off the intent. In this case, the intent could be resolvable either because there is a handler on the current profile, or because the intent is allowed to cross to a handler on the other profile. (For more information about resolving intents, see Common Intents.)-->

在你的应用程序启动一个 activity 之前，你应该验证这是可行的。你可以调用
[Intent.resolveActivity()](http://developer.android.com/reference/android/content/Intent.html#resolveActivity%28android.content.pm.PackageManager%29) 方法来验证。如果无法处理，方法会返回 null。如果方法返回值非空，那么至少有一个方法可以处理这个 intent，所以创建这个 intent 是安全的。这种情况下，或者是因为在当前 profile 中可以响应，或者是因为 intent 被允许跨越到可以处理的其他 profile 中，intent 可以被处理。（更多关于响应 intent 的信息，请查看 [Common Intents](http://developer.android.com/guide/components/intents-common.html)。）

<!--For example, if your app needs to set timers, it would need to check that there's a valid handler for the ACTION_SET_TIMER intent. If the app cannot resolve the intent, it should take an appropriate action (such as showing an error message).-->

例如，如果你的应用程序需要设置定时器，就需要检查是否能响应 [ACTION_SET_TIMER](http://developer.android.com/reference/android/provider/AlarmClock.html#ACTION_SET_TIMER) intent。如果应用程序无法响应这个 intent，就需要采取恰当的行动（例如显示一个错误信息）。

```java
public void startTimer(String message, int seconds) {

    // Build the "set timer" intent
    Intent timerIntent = new Intent(AlarmClock.ACTION_SET_TIMER)
            .putExtra(AlarmClock.EXTRA_MESSAGE, message)
            .putExtra(AlarmClock.EXTRA_LENGTH, seconds)
            .putExtra(AlarmClock.EXTRA_SKIP_UI, true);

    // Check if there's a handler for the intent
    if (timerIntent.resolveActivity(getPackageManager()) == null) {

        // Can't resolve the intent! Fail this operation cleanly
        // (perhaps by showing an error message)

    } else {
        // Intent resolves, it's safe to fire it off
        startActivity(timerIntent);

    }
}
```

<!--Share Files Across Profiles-->
## 跨越 profile 共享文件

<!--Sometimes an app needs to provide other apps with access to its own files. For example, an image gallery app might want to share its images with image editors. There are two ways you would ordinarily share a file: with a file URI or a content URI.-->

有时候应用程序需要授权其他运用程序访问自己的文件。例如，一个图片库应用可能想与图片编辑器共享它的图片。一般共享文件有两种方法：通过文件 URI 或者内容 URI。

<!--A file URI begins with the file: prefix, followed by the absolute path of the file on the device's storage. However, because the managed profile and the personal profile use separate storage areas, a file URI that is valid on one profile is not valid on the other. This situation means that if you attach a file URI to an intent, and the intent is handled on the other profile, the handler is not able to access the file.-->

一个文件 URI 是由前缀 `file:` 和文件在设备中存储的绝对路径组成的。然而，因为 managed profile 和私人 profile 有各自的存储区域，所以一个文件 URI 在一个 profile 中是有效的，在其他 profile 中是无效的。这种情况意味着，如果你要在 intent 中放置一个文件 URI，而这个 intent 要在其他 profile 中响应，那么响应方是不能访问这个文件的。

<!--Instead, you should share files with content URIs. Content URIs identify the file in a more secure, shareable fashion. The content URI contains the file path, but also the authority that provides the file, and an ID number identifying the file. You can generate a content ID for any file by using a FileProvider. You can then share that content ID with other apps (even on the other profile). The recipient can use the content ID to get access to the actual file.-->

你应该取而代之用内容 URI 共享文件。内容 URI 用一种更安全、更易于分享的方式来识别文件。内容 URI 包括了文件路径，文件提供者，以及文件 ID。你可以通过 
[FileProvider](http://developer.android.com/reference/android/support/v4/content/FileProvider.html) 为任何文件生成内容 ID。然后，你就可以和（甚至在其他 profile 中的）其他应用程序共享内容 ID。响应方可以使用内容 ID 来访问实际文件。

<!--For example, here's how you would get the content URI for a specific file URI:-->

例如，这里展示了你怎么获得一个指定文件 URI 的内容 URI：

```java
// Open File object from its file URI
File fileToShare = new File(fileUriToShare);

Uri contentUriToShare = FileProvider.getUriForFile(getContext(),
        "com.example.myapp.fileprovider", fileToShare);
```

<!--When you call the getUriForFile() method, you must include the file provider's authority (in this example, "com.example.myapp.fileprovider"), which is specified in the <provider> element of your app manifest. For more information about sharing files with content URIs, see Sharing Files.-->

当你调用 [getUriForFile()](http://developer.android.com/reference/android/support/v4/content/FileProvider.html#getUriForFile%28android.content.Context,%20java.lang.String,%20java.io.File%29) 方法时，必须包括文件提供者的权限（在这个例子里是
`"com.example.myapp.fileprovider"`），在应用程序的 manifest 中，用
[\<provider>](http://developer.android.com/guide/topics/manifest/provider-element.html) 元素设定这个权限。更多关于用内容 URI 共享文件的信息，请查看[共享文件](http://developer.android.com/training/secure-file-sharing/index.html)。

<!--Test your App for Compatibility with Managed Profiles-->
## 在 managed profile 环境测试你的应用程序的兼容性

<!--You should test your app in a managed-profile environment to catch problems that would cause your app to fail on a device with managed profiles. In particular, testing on a managed-profile device is a good way to make sure that your app handles intents properly: not firing intents that can't be handled, not attaching URIs that don't work cross-profile, and so on.-->

你要在有 managed profile 的环境中测试你的应用程序，以发现会引起运行失败的问题。在一个有 managed profile 的设备中测试是一个验证你的应用程序正确响应 intent 的好办法：无法响应的时候不创建 intent，不使用无法跨越 profile 的 URI 等等。

<!--We have provided a sample app, BasicManagedProfile, which you can use to set up a managed profile on an Android device that runs Android 5.0 (API level 21) and higher. This app offers you a simple way to test your app in a managed-profile environment. You can also use this app to configure the managed profile as follows:-->

我们提供了一个示例应用程序，[BasicManagedProfile](http://developer.android.com/samples/BasicManagedProfile/index.html)，你可以用它在一个运行 Android 5.0 或者更高系统的 Android 设备上设置一个 managed profile。这个应用程序为在有 managed profile 的环境中来测试你的应用程序提供了一个简单的方法。你也可以按照下面的方法用这个应用程序来设置你的 managed profile：

<!--Specify which default apps are available on the managed profile-->

* 在 managed profile 中设定哪些默认应用程序可以使用

<!--Configure which intents are allowed to cross from one profile to the other-->

* 设定哪些 intent 被允许从一个 profile 跨越到另一个

<!--If you manually install an app over a USB cable to a device which has a managed profile, the app is installed on both the managed and the unmanaged profile. Once you have installed the app, you can test the app under the following conditions:-->

如果你通过 USB 线手动安装一个有 managed profile 的应用程序，那么在 managed profile 和非 managed profile 之中都安装有这个应用程序。只要你安装了应用程序，你就能在以下条件下进行测试：

<!--If an intent would ordinarily be handled by a default app (for example, the camera app), try disabling that default app on the managed profile, and verify that the app handles this appropriately.-->

* 如果一个 intent 可以被一个默认的应用程序（例如相机应用程序）响应，试试 managed profile 中禁用这个默认应用程序，然后验证这个应用程序可以做出恰当的行为。

<!--If you fire an intent expecting it to be handled by some other app, try enabling and disabling that intent's permission to cross from one profile to another. Verify that the app behaves properly under both circumstances. If the intent is not allowed to cross between profiles, verify the app's behavior both when there is a suitable handler on the app's profile, and when there is not. For example, if your app fires a map-related intent, try each of the following scenarios: 
The device allows map intents to cross from one profile to the other, and there is a suitable handler on the other profile (the profile the app is not running on)
The device does not allow map intents to cross between profiles, but there is a suitable handler on the app's profile
The device does not allow map intents to cross between profiles, and there is no suitable handler for map intents on the device's profile-->

* 如果你创建了一个 intent 希望被其他应用程序响应，试试启用以及禁用这个 intent 从一个 profile 跨越到另一个的权限。验证在这两种情况下应用程序都能做出恰当的行为。如果 intent 不允许在 profile 之间跨越，无论当前 profile 是否能做出响应，都要验证应用程序能做出恰当的行为。例如，如果你的应用程序创建了一个地图相关的 intent，试试以下每一种情况：
  - 设备允许地图 intent 从一个 profile 跨越到另一个，并且在另一个（并非应用程序所运行的） profile 之中有恰当的响应
  - 设备不允许地图 intent 在 profile 之间跨越，但是在应该程序所运行的 profile 之中有恰当的响应
  - 设备不允许地图 intent 在 profile 之间跨越，并且在设备的 profile 之中没有恰当的响应

<!--If you attach content to an intent, verify that the intent behaves properly both when it is handled on the app's profile, and when it crosses between profiles.-->

* 如果你在 intent 里放置了内容，不管是在当前 profile 之中，还是在跨越 profile 之后，都要验证 intent 能有恰当的行为。

<!--Testing on managed profiles: Tips and tricks-->
### 在 managed profile 环境测试：提示与技巧

<!--There are a few tricks that you may find helpful in testing on a managed-profile device.-->

你会发现在有 managed profile 的设备里进行测试有一些技巧。

<!--As noted, when you side-load an app on a managed profile device, it is installed on both profiles. If you wish, you can delete the app from one profile and leave it on the other.-->

* 如前所述，当你侧载一个应用程序到一个有 managed profile 的设备里，是在 managed profile 和非 managed profile 之中都安装了。如果你愿意，你可以从一个 profile 之中删除，在另一个 profile 之中留下。

<!--Most of the activity manager commands available in the Android Debug Bridge (adb) shell support the --user flag, which lets you specify which user to run as. By specifying a user, you can choose whether to run as the unmanaged or managed profile. For more information, see ADB Shell Commands.-->

* 在[安卓调试桥](http://developer.android.com/tools/help/adb.html)（adb）shell 端可用的 activity manager 命令大部分都支持 `--user` 标识，你可以用之设定运行应用程序的用户。通过设定一个用户，你可以选择是在 managed profile 之中运行，还是在非 managed profile 之中运行。更多信息，请查看 [ADB Shell Commands](http://developer.android.com/tools/help/shell.html#am)。

<!--To find the active users on a device, use the adb package manager's list users command. The first number in the output string is the user ID, which you can use with the --user flag. For more information, see ADB Shell Commands.-->

* 为了找到设备上的活跃用户，使用 adb 包管理器的 `list users` 命令。输出的字符串中第一个数字是用户 ID，你可以用于 `--user`
标识。更多信息，请查看 [ADB Shell Commands](http://developer.android.com/tools/help/shell.html#am)。

<!--For example, to find the users on a device, you would run this command:-->

例如，为了找到一个设备上的用户，你会运行这个命令：

```
$ adb shell pm list users
UserInfo{0:Drew:13} running
UserInfo{10:Work profile:30} running
```

<!--In this case, the unmanaged profile ("Drew") has the user ID 0, and the managed profile has the user ID 10. To run an app in the work profile, you would use a command like this:-->

在这里，非 managed profile（"Drew"）有个 ID 为 0 的用户，而 managed profile 有个 ID 为 10 的用户。要在工作 profile 之中运行一个应用程序，你会用到这样的命令：

```
$ adb shell am start --user 10 \
-n "com.example.myapp/com.example.myapp.testactivity" \
-a android.intent.action.MAIN -c android.intent.category.LAUNCHER
```
