# 使得你的App内容可被Google搜索

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/app-indexing/index.html>

随着移动app变得越来越普遍，用户不仅仅从网站上查找相关信息，也在他们安装的app上查找。你可以使Google能够抓取你的app内容，当内容与你自己的网页一致时，Google搜索的结果会将你的app作为结果展示给用户。

通过为你的activity提供intent filter，可以使Google搜索展示你的app中特定的内容。Google搜索应用索引(Google Search app indexing)通过在用户搜索结果的网页链接旁附上相关的app内容链接，补充了这一功能。使用移动设备的用户可以在他们的搜索结果中点击链接来打开你的app，使他们能够直接浏览你的app中的内容，而不需要打开网页。

要启用Google搜索应用索引，你需要把有关app与网页之间联系的信息提供给Google。这个过程包括下面几个步骤:

1. 通过在你的app manifest中添加intent filter来开启链接到你的app中指定内容的深度链接。

2. 在你的网站中的相关页面或Sitemap文件中为这些链接添加注解。

3. 选择允许谷歌爬虫(Googlebot)在Google Play store中通过APK抓取，建立app内容索引。在早期采用者计划(early adopter program)中作为参与者加入时，会自动选择允许。

这节课程，会向你展示如何启用深度链接和建立应用内容索引，使用户可以从移动设备搜索结果直接打开此内容。

##Lessons

* [为App内容开启深度链接](deep-linking.md)

  演示如何添加intent filter来启用链接app内容的深度链接


* [为索引指定App内容](enable-app-indexing.md)

  演示如何给网站的metadata添加注解，使Google的算法能为app内容建立索引
