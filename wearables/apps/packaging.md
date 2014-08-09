# 打包可穿戴应用

> 编写: [kesenhoo](https://github.com/kesenhoo) - 原文: <http://developer.android.com/training/wearables/apps/packaging.html>

当发布应用给用户之前，你必须把可穿戴应用打包到手持应用内。因为不能直接在可穿戴设备上浏览并安装应用。如果打包正确，当用户下载手持应用时，系统会自动下发可穿戴应用到匹对的可穿戴设备上。

> **Note:** 如果开发时签名用的是debug key，这个特性是无法正常工作的。在开发时，需要使用`adb install`的命令或者Android Studio来安装可穿戴应用。

## 使用Android Studio打包

在Android Studio中打包可穿戴应用有下面几个步骤：

1. 在手持应用的buidl.gradle文件中把可穿戴应用声明为依赖：
```xml
dependencies {
   compile 'com.google.android.gms:play-services:5.0.+@aar'
   compile 'com.android.support:support-v4:20.0.+''
   wearApp project(':wearable')
}
```
2. 点击**Build** > **Generate Signed APK**... 安装屏幕上的指示来制定你的release key并为你的app进行签名。Android Studio导出签名好的手持应用，他内置了可穿戴应用。
或者，你可以在可穿戴应用与手持应用的build.gradle文件里面建立一个签名规则。为了能够正常自动推送可穿戴应用，这两个应用都必须签名。
```xml
android {
  ...
  signingConfigs {
    release {
      keyAlias 'myAlias'
      keyPassword 'myPw'
      storeFile file('path/to/release.keystore')
      storePassword 'myPw'
    }
  }
  buildTypes {
    release {
      ...
      signingConfig signingConfigs.release
    }d
  }
  ...
}
```
通过点击Android Studio右边的Gradle按钮来建立手持应用，并执行**assembleRelease**任务。这个任务放在**Project name** > **Handheld module name** > **assembleRelease.**

> **Note:**这个例子中把密码写在了Gradle文件中，这应该不是期待的写法。请参考[Configure signing settings](http://developer.android.com/sdk/installing/studio-build.html#configureSigning)学习如何为密码创建环境变量。

### 分别为可穿戴应用与手持应用进行签名

如果你的Build任务需要为可穿戴应用与手持应用签不同的Key，你可以像下面一样在手持应用的build.gradle文件中声明规则。
```xml
dependencies {
  ...
  wearApp files('/path/to/wearable_app.apk')
}
```
你可以为手持应用手动进行签任何形式的Key (可以是Android Studio Build > Generate Signed APK...的方式，也可以是Gradle signingConfig规则的方式)

## 手动打包

如果你使用的是其他IDE，你仍然可以把可穿戴应用打包到手持应用中。

1. 把签好名的可穿戴应用放到手持应用的`res/raw`目录下。 我们把这个应用作为`wearable_app.apk`。
2. 创建`res/xml/wearable_app_desc.xml`文件，里面包含可穿戴设备的版本信息与路径。例如:
```xml
<wearableApp package="wearable.app.package.name">
  <versionCode>1</versionCode>
  <versionName>1.0</versionName>
  <rawPathResId>wearable_app</rawPathResId>
</wearableApp>
```
package, versionCode, 与 versionName需要和可穿戴应用的AndroidManifest.xml里面的信息一致。`rawPathResId`是一个static的变量表示APK的名称。。
3. 添加`meta-data`标签到你的手持应用的`<application>`标签下，指明引用wearable_app_desc.xml文件
```xml
<meta-data android:name="com.google.android.wearable.beta.app"
                 android:resource="@xml/wearable_app_desc"/>
```
4. 构建并签名手持应用。

## 关闭资源压缩

许多构建工具会自动压缩放在res/raw目录下的文件。因为可穿戴APK已经被压缩过了，那些压缩工作再次压缩会导致应用无法正常安装。

这样的话，安装失败。在手持应用上，`PackageUpdateService`会输出如下的错误日志："this file cannot be opened as a file descriptor; it is probably compressed."

Android Studio 默认不会压缩你的APK，如果你使用另外一个构建流程，需要确保不会发生重复压缩可穿戴应用的事情。
