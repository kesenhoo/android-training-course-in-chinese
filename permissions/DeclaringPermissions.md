# 权限定义
编写:[Goerver](https://github.com/orangebook) - 原文: Declaring Permissions https://developer.android.com/training/permissions/declaring.html

本课程将教您：

1.确认您的APP需要的权限


2.向Mainifert'添加权限

同时应该阅读:
1.[Using Permissions](https://developer.android.com/guide/topics/security/permissions.html#permissions)
2.[Normal and Dangerous Permissions](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous)

每个Android应用程序运行在一个限制访问的沙盒。如果一个APP需要使用沙盒外的资源或信息，APP必须请求适合的权限。你需要在App中定义一个APP需要的权限清单在 [App Mainifest](https://developer.android.com/guide/topics/manifest/manifest-intro.html)。

根据权限的敏感度，系统可能会自动授给权限,或者设备用户必须授给请求。例如，如果你的APP请求权限打开设备的闪光灯，该系统授将自动授给权限。但是如果APP需要用户的联系人，该系统询问用户名授给权限。用户授予的权限也会根据系统的版本(Android 5.0以下)或运(Android 6.0以下)

## 确定您的应用程序需要的权限
当你开发你的APP,你应该注意你的APP使用权限的能力。通常，一个APP都需要权限无论是使用APP没有创建的信息、资源(resource);执行一个影响设备或其他的操作。例如，如果APP需要访问Internet,使用设备的摄像头或开关WIFI，该APP均需要适当的权限。对于系统权限的列表，请参见[Normal and Dangerous Permissions](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous)。

您的应用程序只需要它直接执行的操作的权限。如果APP是要求另一个应用程序执行任务或提供信息,不需要许可。例如，如果你的应用程序需要读取用户的通讯录，应用程序需要 [READ_CONTACTS](https://developer.android.com/reference/android/Manifest.permission.html#READ_CONTACTS)。但如果你的应用程序使用了一个Intent来请求来自用户的联系人应用程序的信息，你的应用程序不需要任何权限，但该联系人的应用程序确实需要有该权限。对于更多的信息，请参见 [Consider Using an Intent](https://developer.android.com/training/permissions/best-practices.html#perms-vs-intents)。

## 添加权限到 Manifest
要声明您的应用程序需要一个权限，请在应用程序 **manifest** 中放置一个 **<uses-permission>** 元素，作为顶层的 **<manifest>** 元素的子元素。例如，一个应用程序，需要发送短信将需要下面行代码在 **manifest**：

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
        package="com.example.snazzyapp">

    <uses-permission android:name="android.permission.SEND_SMS"/>


    <application ...>
        ...
    </application>

</manifest>
```

当你声明一个权限后，系统的行为取决于权限是多么的敏感。如果权限不影响用户的隐私，系统将自动授予权限。如果权限可能授予对敏感用户信息的访问权限，则系统要求用户批准请求。有关不同类型的权限的更多信息，请参见“[Normal and Dangerous Permissions](Normal and Dangerous Permissions)”。

作者 [@Goerver][1]
2016 年 09月 4日

[1]:http://www.flyfishonline.com
