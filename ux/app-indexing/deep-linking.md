# 为App内容开启深度链接

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/app-indexing/deep-linking.html>

为使Google能够抓取你的app内容，并允许用户从搜索结果进入你的app，你必须给你的app manifest中相关的activity添加intent filter。这些intent filter能使深度链接与你的任何activity相连。例如，用户可以在购物app中，点击一条深度链接来浏览一个介绍了自己所搜索的产品的页面。

##为你的深度链接添加Intent filter

要创建一条与你的app内容相连的深度链接，添加一个包含了以下这些元素和属性值的intent filter到你的manifest中:

[`<action>`](http://developer.android.com/guide/topics/manifest/action-element.html)

指定[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)的操作，使得Google搜索可以触及intent filter。

[`<data>`](http://developer.android.com/guide/topics/manifest/data-element.html)

添加一个或多个[`<data>`](http://developer.android.com/guide/topics/manifest/data-element.html)标签，每一个标签代表一种activity对URI格式的解析，[`<data>`](http://developer.android.com/guide/topics/manifest/data-element.html)必须至少包含[android:scheme](http://developer.android.com/guide/topics/manifest/data-element.html#scheme)属性。

你可以添加额外的属性来改善activity所接受的URI类型。例如，你或许有几个activity可以接受相似的URI，它们仅仅是路径名不同。在这种情况下，使用[android:path](http://developer.android.com/guide/topics/manifest/data-element.html#path)属性或它的变形(`pathPattern`或`pathPrefix`)，使系统能辨别对不同的URI路径应该启动哪个activity。

[`<category>`](http://developer.android.com/guide/topics/manifest/category-element.html)

包括[BROWSABLE](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_BROWSABLE) category。[BROWSABLE](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_BROWSABLE) category对于使intent filter能被浏览器访问是必要的。没有这个category，在浏览器中点击链接无法解析到你的app。[DEFAULT](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_DEFAULT) category是可选的，但建议添加。没有这个category，activity只能够使用app组件名称以显示(explicit)intent启动。

下面的一段XML代码向你展示，你应该如何在manifest中为深度链接指定一个intent filter。URI “example://gizmos” 和 “http://www.example.com/gizmos” 都能够解析到这个activity。

```xml
<activity
    android:name="com.example.android.GizmosActivity"
    android:label="@string/title_gizmos" >
    <intent-filter android:label="@string/filter_title_viewgizmos">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <!-- 接受以"example://gizmos”开头的 URIs  -->
        <data android:scheme="example"
              android:host="gizmos" />
        <!-- 接受以"http://www.example.com/gizmos”开头的 URIs  -->
        <data android:scheme="http"
              android:host="www.example.com"
              android:pathPrefix="gizmos" />
    </intent-filter>
</activity>
```

当你把包含有指定activity内容的URI的intent filter添加到你的app manifest后，Android就可以在你的app运行时，为app与匹配URI的[Intent](http://developer.android.com/reference/android/content/Intent.html)建立路径。

> **Note:** 对一个URI pattern，intent filter可以只包含一个单一的`data`元素，创建不同的intent filter来匹配额外的URI pattern。

学习更多关于定义intent filter，见[Allow Other Apps to Start Your Activity](http://developer.android.com/training/basics/intents/filters.html)

##从传入的intent读取数据

一旦系统通过一个intent filter启动你的activity，你可以使用由[Intent](http://developer.android.com/reference/android/content/Intent.html)提供的数据来决定需要处理什么。调用[getData()](http://developer.android.com/reference/android/content/Intent.html#getData())和[getAction()](http://developer.android.com/reference/android/content/Intent.html#getAction())方法来取出传入[Intent](http://developer.android.com/reference/android/content/Intent.html)中的数据与操作。你可以在activity生命周期的任何时候调用这些方法，但一般情况下你应该在前期回调如[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))或[onStart()](http://developer.android.com/reference/android/app/Activity.html#onStart())中调用。

这个是一段代码，展示如何从[Intent](http://developer.android.com/reference/android/content/Intent.html)中取出数据:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);

    Intent intent = getIntent();
    String action = intent.getAction();
    Uri data = intent.getData();
}
```

遵守下面这些惯例来提高用户体验:

* 深度链接应直接为用户打开内容，不需要任何提示，插播式广告页和登录页面。要确保用户能看到app的内容，即使之前从没打开过这个应用。当用户从启动器打开app时，可以在操作结束后给出提示。这个准则也同样适用于网站的[first click free](https://support.google.com/webmasters/answer/74536?hl=en)体验。

* 遵循[Navigation with Back and Up](http://developer.android.com/design/patterns/navigation.html)中的设计指导，来使你的app能够满足用户通过深度链接进入app后，向后导航的需求。

##测试你的深度链接

你可以使用[Android Debug Bridge](http://developer.android.com/tools/help/adb.html)和activity管理(am)工具来测试你指定的intent filter URI，能否正确解析到正确的app activity。你可以在设备或者模拟器上运行adb命令。

测试intent filter URI的一般adb语法是:

```
$ adb shell am start
        -W -a android.intent.action.VIEW
        -d <URI> <PACKAGE>
```

例如，下面的命令试图浏览与指定URI相关的目标app activity。

```
$ adb shell am start
        -W -a android.intent.action.VIEW
        -d "example://gizmos" com.example.android
```
