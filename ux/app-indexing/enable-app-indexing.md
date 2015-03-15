# 为索引指定App内容

> 编写:[Lin-H](https://github.com/Lin-H) - 原文: <http://developer.android.com/training/app-indexing/enabling-app-indexing.html>

Google的网页爬虫机器([Googlebot](https://support.google.com/webmasters/answer/182072?hl=en))会抓取页面，并为Google搜索引擎建立索引，也能为你的Android app内容建立索引。通过选择加入这一功能，你可以允许Googlebot通过抓取在Google Play Store中的APK内容，为你的app内容建立索引。要指出哪些app内容你想被Google索引，只需要添加链接元素到现有的[Sitemap](https://support.google.com/webmasters/answer/156184?hl=en)文件，或添加到你的网站中每个页面的`<head>`元素中，以相同的方式为你的页面添加。

你所共享给Google搜索的深度链接必须按照下面的URI格式:

```
android-app://<package_name>/<scheme>/<host_path>
```

构成URI的各部分是:

* **package_name** 代表在[Google Play Developer Console](https://play.google.com/apps/publish)中所列出来的你的APK的包名。

* **scheme** 匹配你的intent filter的URI方案。

* **host_path** 找出你的应用中所指定的内容。

下面的几节叙述如何添加一个深度链接URI到你的Sitemap或网页中。

##添加深度链接(Deep link)到你的Sitemap

要在你的[Sitemap](https://support.google.com/webmasters/answer/156184?hl=en)中为Google搜索app索引(Google Search app indexing)添加深度链接的注解，使用`<xhtml:link>`标签，并指定用作替代URI的深度链接。

例如，下面一段XML代码向你展示如何使用`<loc>`标签指定一个链接到你的页面的链接，以及如何使用`<xhtml:link>`标签指定链接到你的Android app的深度链接。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
        <loc>example://gizmos</loc>
            <xhtml:link
                rel="alternate"
                href="android-app://com.example.android/example/gizmos" />
    </url>
    ...
</urlset>
```

##添加深度链接到你的网页中

除了在你的Sitemap文件中，为Google搜索app索引指定深度链接外，你还可以在你的HTML标记网页中给深度链接添加注解。你可以在`<head>`标签内这么做，为每一个页面添加一个`<link>`标签，并指定用作替代URI的深度链接。

例如，下面的一段HTML代码向你展示如何在页面中指定一个URL为`example://gizmos`的相应的深度链接。

```html
<html>
<head>
    <link rel="alternate"
          href="android-app://com.example.android/example/gizmos" />
    ...
</head>
<body> ... </body>
```

##允许Google通过你的app抓取URL请求

一般来说，你可以通过使用[robots.txt](https://developers.google.com/webmasters/control-crawl-index/docs/robots_txt)文件，来控制Googlebot如何抓取你网站上的公开访问的URL。当Googlebot为你的app内容建立索引后，你的app可以把HTTP请求当做一般操作。但是，这些请求会被视为从Googlebot发出，发送到你的服务器上。因此，你必须正确配置你的服务器上的`robots.txt`文件来允许这些请求。

例如，下面的`robots.txt`指示向你展示，如何允许你网站上的特定目录(如 `/api/` )能被你的app访问，并限制Googlebot访问你的网站上的其他目录。

```
User-Agent: Googlebot
Allow: /api/
Disallow: /
```

学习更多关于如何修改`robots.txt`，来控制页面抓取，详见[Controlling Crawling and Indexing Getting Started](https://developers.google.com/webmasters/control-crawl-index/docs/getting_started)。
