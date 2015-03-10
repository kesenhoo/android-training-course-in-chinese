# 解析XML数据

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/network-ops/xml.html>

Extensible Markup Language (XML) 是一组将文档编码成机器可读形式的规则，也是一种在网络上共享数据的普遍格式。经常更新内容的网站比如新闻网站和博客上都提供XML feed来记录更新的信息，以便用户进行订阅读取。

上传[?]与解析XML数据是app的一个常见的功能。 这一课会介绍如何解析XML文档并使用他们的数据。

*([?]这里很奇怪，为什么是Upload，看文章最后一段代码示例的注释，应该是Download才对)*

**示例**：[NetworkUsage.zip](http://developer.android.com/shareables/training/NetworkUsage.zip)

## 1)选择一个Parser
我们推荐[XmlPullParser](http://developer.android.com/reference/org/xmlpull/v1/XmlPullParser.html), 它是在Android上一个高效且可维护的解析XML方法。 Android 上有这个接口的两种实现方式：

* [KXmlParser](http://kxml.sourceforge.net/)，通过 [XmlPullParserFactory.newPullParser()](http://developer.android.com/reference/org/xmlpull/v1/XmlPullParserFactory.html#newPullParser())得到.
* ExpatPullParser，通过[Xml.newPullParser()](http://developer.android.com/reference/android/util/Xml.html#newPullParser())得到.

两个选择都是比较好的。下面的示例中是使用ExpatPullParser，通过Xml.newPullParser()得到.

<!-- more -->

## 2)分析Feed
解析一个feed的第一步是决定你需要获取的字段。这样解析器便去抽取出那些需要的字段而忽视其他的字段。

下面的XML片段是章节概览Sample app中解析的Feed的片段。[StackOverflow](http://stackoverflow.com/)上每一个帖子都在feed中以时包含几个嵌套的子标签(tag)的entry标签的形式出现。

```xml
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:creativeCommons="http://backend.userland.com/creativeCommonsRssModule" ...">
<title type="text">newest questions tagged android - Stack Overflow</title>
...
    <entry>
    ...
    </entry>
    <entry>
        <id>http://stackoverflow.com/q/9439999</id>
        <re:rank scheme="http://stackoverflow.com">0</re:rank>
        <title type="text">Where is my data file?</title>
        <category scheme="http://stackoverflow.com/feeds/tag?tagnames=android&sort=newest/tags" term="android"/>
        <category scheme="http://stackoverflow.com/feeds/tag?tagnames=android&sort=newest/tags" term="file"/>
        <author>
            <name>cliff2310</name>
            <uri>http://stackoverflow.com/users/1128925</uri>
        </author>
        <link rel="alternate" href="http://stackoverflow.com/questions/9439999/where-is-my-data-file" />
        <published>2012-02-25T00:30:54Z</published>
        <updated>2012-02-25T00:30:54Z</updated>
        <summary type="html">
            <p>I have an Application that requires a data file...</p>

        </summary>
    </entry>
    <entry>
    ...
    </entry>
...
</feed>
```

Sample app从entry标签与它的子标签title,link和summary中提取数据.

## 3)实例化Parser
下一步就是实例化一个parser并开始解析的操作。在下面的片段中，一个parser被初始化来处理名称空间，并且将[InputStream](http://developer.android.com/reference/java/io/InputStream.html)作为输入。它通过调用[nextTag()](http://developer.android.com/reference/org/xmlpull/v1/XmlPullParser.html#nextTag())开始解析，并调用 readFeed() 方法，readFeed()方法会提取并处理app需要的数据：

```java
public class StackOverflowXmlParser {
    // We don't use namespaces
    private static final String ns = null;

    public List parse(InputStream in) throws XmlPullParserException, IOException {
        try {
            XmlPullParser parser = Xml.newPullParser();
            parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false);
            parser.setInput(in, null);
            parser.nextTag();
            return readFeed(parser);
        } finally {
            in.close();
        }
    }
 ...
}
```

## 4)读取Feed

readFeed() 方法实际上并没有处理feed的内容。它只是在寻找一个 "entry" 的标签作为递归（recursively）处理整个feed的起点。 readFeed()方法会跳过不是"entry"的标签。当整个feed都被递归处理后，readFeed() 会返回一个从feed中提取的包含了entry标签（包括里面的数据成员）的 [List](http://developer.android.com/reference/java/util/List.html)。然后这个[List](http://developer.android.com/reference/java/util/List.html)成为parser的返回值。

```java
private List readFeed(XmlPullParser parser) throws XmlPullParserException, IOException {
    List entries = new ArrayList();

    parser.require(XmlPullParser.START_TAG, ns, "feed");
    while (parser.next() != XmlPullParser.END_TAG) {
        if (parser.getEventType() != XmlPullParser.START_TAG) {
            continue;
        }
        String name = parser.getName();
        // Starts by looking for the entry tag
        if (name.equals("entry")) {
            entries.add(readEntry(parser));
        } else {
            skip(parser);
        }
    }
    return entries;
}
```

## 5)解析XML
解析步骤如下：

* 正如在上面“ 分析Feed”所说的, 判断出你想要的tag。这个example抽取了 entry 标签与它的内部标签 title,link,summary中的数据.
* 创建下面的方法:
	* 为每一个你想要获取的标签创建一个 "read" 方法。例如 readEntry(), readTitle() 等等. 解析器从input stream中读取tag . 当读取到 entry, title, link 或者 summary 标签时，它会为那些标签调用相应的方法，否则，跳过这个标签。
	* 为每一个不同的标签创建提取数据的方法，和使parser继续解析下一个tag的方法。例如：
		* 对于 title 和 summary 标签, 解析器调用 readText(). 这个方法通过调用parser.getText()来获取数据。
		* 对于 link 标签,解析器先判断这个link是否是我们想要的类型，然后再读取数据。使用 parser.getAttributeValue() 来获取link的数据。
		* 对于 entry 标签, 解析起调用 readEntry(). 这个方法解析entry的内部标签并返回一个带有title, link 和 summary数据成员的Entry对象。
	* 一个递归的辅助方法：skip() . 关于这部分的讨论，请看下面一部分内容：跳过你不需要的tag

下面的代码演示了如何解析 entries, titles, links 与 summaries.

```java
public static class Entry {
    public final String title;
    public final String link;
    public final String summary;

    private Entry(String title, String summary, String link) {
        this.title = title;
        this.summary = summary;
        this.link = link;
    }
}

// Parses the contents of an entry. If it encounters a title, summary, or link tag, hands them off
// to their respective "read" methods for processing. Otherwise, skips the tag.
private Entry readEntry(XmlPullParser parser) throws XmlPullParserException, IOException {
    parser.require(XmlPullParser.START_TAG, ns, "entry");
    String title = null;
    String summary = null;
    String link = null;
    while (parser.next() != XmlPullParser.END_TAG) {
        if (parser.getEventType() != XmlPullParser.START_TAG) {
            continue;
        }
        String name = parser.getName();
        if (name.equals("title")) {
            title = readTitle(parser);
        } else if (name.equals("summary")) {
            summary = readSummary(parser);
        } else if (name.equals("link")) {
            link = readLink(parser);
        } else {
            skip(parser);
        }
    }
    return new Entry(title, summary, link);
}

// Processes title tags in the feed.
private String readTitle(XmlPullParser parser) throws IOException, XmlPullParserException {
    parser.require(XmlPullParser.START_TAG, ns, "title");
    String title = readText(parser);
    parser.require(XmlPullParser.END_TAG, ns, "title");
    return title;
}

// Processes link tags in the feed.
private String readLink(XmlPullParser parser) throws IOException, XmlPullParserException {
    String link = "";
    parser.require(XmlPullParser.START_TAG, ns, "link");
    String tag = parser.getName();
    String relType = parser.getAttributeValue(null, "rel");
    if (tag.equals("link")) {
        if (relType.equals("alternate")){
            link = parser.getAttributeValue(null, "href");
            parser.nextTag();
        }
    }
    parser.require(XmlPullParser.END_TAG, ns, "link");
    return link;
}

// Processes summary tags in the feed.
private String readSummary(XmlPullParser parser) throws IOException, XmlPullParserException {
    parser.require(XmlPullParser.START_TAG, ns, "summary");
    String summary = readText(parser);
    parser.require(XmlPullParser.END_TAG, ns, "summary");
    return summary;
}

// For the tags title and summary, extracts their text values.
private String readText(XmlPullParser parser) throws IOException, XmlPullParserException {
    String result = "";
    if (parser.next() == XmlPullParser.TEXT) {
        result = parser.getText();
        parser.nextTag();
    }
    return result;
}
  ...
}
```

## 6)跳过你不需要的tag
上面描述的XML解析步骤中有一步就是跳过不需要的tag，下面演示解析器的 skip() 方法:

```java
private void skip(XmlPullParser parser) throws XmlPullParserException, IOException {
    if (parser.getEventType() != XmlPullParser.START_TAG) {
        throw new IllegalStateException();
    }
    int depth = 1;
    while (depth != 0) {
        switch (parser.next()) {
        case XmlPullParser.END_TAG:
            depth--;
            break;
        case XmlPullParser.START_TAG:
            depth++;
            break;
        }
    }
}
```

下面解释这个方法如何工作:

* 如果下一个标签不是一个 START_TAG (开始标签)，抛出异常。
* 它消耗掉 START_TAG 以及接下来的所有内容，包括与开始标签配对的 END_TAG (结束标签).
* 为了保证方法在遇到正确的 END_TAG 时停止，方法随时记录嵌套深度。

因此如果目前的标签有子标签, 直到解析器已经处理了所有位于START_TAG与对应的END_TAG之间的事件之前，depth 的值不会为 0。例如，看解析器如何跳过 `<author>` 标签，它有2个子标签，`<name>` 与 `<uri>`：

* 第一次循环, 在‘<author>’之后parser遇到的第一个标签是 START_TAG `<name>`. depth值变为2.
* 第二次循环, parser遇到的下一个标签是 END_TAG `</name>`. depth值变为1.
* 第三次循环, parser遇到的下一个标签是 START_TAG `<uri>`. depth值变为2.
* 第四次循环, parser遇到的下一个标签是 END_TAG `</uri>`. depth值变为1.
* 第五次同时也是最后一次循环, parser遇到的下一个标签是 END_TAG `</author>`. depth值变为0, 表明成功跳过了`<author>`标签.

## 6)使用XML数据
示例程序是在 [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 中获取与解析XML数据的。这样处理工程不会在UI线程中执行。当处理完毕后，app会更新main activity(NetworkActivity)的UI。

在下面示例代码中，loadPage() 方法做了下面的事情：

* 初始化一个带有URL地址的String变量，用来订阅XML feed。
* 如果用户设置与网络连接都允许，会触发 new DownloadXmlTask().execute(url). 这会初始化一个新的 DownloadXmlTask ( [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 的子类) 对象并且开始执行它的 [execute()](http://developer.android.com/reference/android/os/AsyncTask.html#execute(Params...)) 方法，这个方法会下载并解析feed，并返回结果字符串展示在UI上。

```java
public class NetworkActivity extends Activity {
    public static final String WIFI = "Wi-Fi";
    public static final String ANY = "Any";
    private static final String URL = "http://stackoverflow.com/feeds/tag?tagnames=android&sort=newest";

    // Whether there is a Wi-Fi connection.
    private static boolean wifiConnected = false;
    // Whether there is a mobile connection.
    private static boolean mobileConnected = false;
    // Whether the display should be refreshed.
    public static boolean refreshDisplay = true;
    public static String sPref = null;

    ...

    // Uses AsyncTask to download the XML feed from stackoverflow.com.
    public void loadPage() {

        if((sPref.equals(ANY)) && (wifiConnected || mobileConnected)) {
            new DownloadXmlTask().execute(URL);
        }
        else if ((sPref.equals(WIFI)) && (wifiConnected)) {
            new DownloadXmlTask().execute(URL);
        } else {
            // show error
        }
    }
```

下面展示的是 [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 的子类，DownloadXmlTask实现了 [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 的如下方法：
* [doInBackground()](http://developer.android.com/reference/android/os/AsyncTask.html#doInBackground(Params...)) 执行 loadXmlFromNetwork() 方法。它以feed的URL作为参数。loadXmlFromNetwork()获取并处理feed。当它完成时，返回一个结果字符串。
* [onPostExecute()](http://developer.android.com/reference/android/os/AsyncTask.html#onPostExecute(Result)) 接受返回的字符串并将其展示在UI上.

```java
// Implementation of AsyncTask used to download XML feed from stackoverflow.com.
private class DownloadXmlTask extends AsyncTask<String, Void, String> {
    @Override
    protected String doInBackground(String... urls) {
        try {
            return loadXmlFromNetwork(urls[0]);
        } catch (IOException e) {
            return getResources().getString(R.string.connection_error);
        } catch (XmlPullParserException e) {
            return getResources().getString(R.string.xml_error);
        }
    }

    @Override
    protected void onPostExecute(String result) {
        setContentView(R.layout.main);
        // Displays the HTML string in the UI via a WebView
        WebView myWebView = (WebView) findViewById(R.id.webview);
        myWebView.loadData(result, "text/html", null);
    }
}
```

下面是loadXmlFromNetwork()方法做的事情：
1. 实例化一个StackOverflowXmlParser. 它同样创建一个`List<Entry>`，Entry对象包括title, url, summary字段来保存从XML feed中提取的数据.
2. 调用 downloadUrl() , 它会获取feed, 并将其作为 [InputStream](http://developer.android.com/reference/java/io/InputStream.html) 返回.
3. 使用 StackOverflowXmlParser 解析 [InputStream](http://developer.android.com/reference/java/io/InputStream.html) . StackOverflowXmlParser 用从feed中获取的数据填充`List<Entry>`.
4. 处理 `List<Entry>` , 将feed数据与HTML标记结合起来.
5. 返回一个HTML字符串, [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 的方法 [onPostExecute()](http://developer.android.com/reference/android/os/AsyncTask.html#onPostExecute(Result)) 会将其展示在main activity的UI上.

```java
// Uploads XML from stackoverflow.com, parses it, and combines it with
// HTML markup. Returns HTML string.【这里可以看出应该是Download】
private String loadXmlFromNetwork(String urlString) throws XmlPullParserException, IOException {
    InputStream stream = null;
    // Instantiate the parser
    StackOverflowXmlParser stackOverflowXmlParser = new StackOverflowXmlParser();
    List<Entry> entries = null;
    String title = null;
    String url = null;
    String summary = null;
    Calendar rightNow = Calendar.getInstance();
    DateFormat formatter = new SimpleDateFormat("MMM dd h:mmaa");

    // Checks whether the user set the preference to include summary text
    SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
    boolean pref = sharedPrefs.getBoolean("summaryPref", false);

    StringBuilder htmlString = new StringBuilder();
    htmlString.append("<h3>" + getResources().getString(R.string.page_title) + "</h3>");
    htmlString.append("<em>" + getResources().getString(R.string.updated) + " " +
            formatter.format(rightNow.getTime()) + "</em>");

    try {
        stream = downloadUrl(urlString);
        entries = stackOverflowXmlParser.parse(stream);
    // Makes sure that the InputStream is closed after the app is
    // finished using it.
    } finally {
        if (stream != null) {
            stream.close();
        }
     }

    // StackOverflowXmlParser returns a List (called "entries") of Entry objects.
    // Each Entry object represents a single post in the XML feed.
    // This section processes the entries list to combine each entry with HTML markup.
    // Each entry is displayed in the UI as a link that optionally includes
    // a text summary.
    for (Entry entry : entries) {
        htmlString.append("<p><a href='");
        htmlString.append(entry.link);
        htmlString.append("'>" + entry.title + "</a></p>");
        // If the user set the preference to include summary text,
        // adds it to the display.
        if (pref) {
            htmlString.append(entry.summary);
        }
    }
    return htmlString.toString();
}

// Given a string representation of a URL, sets up a connection and gets
// an input stream.
【关于Timeout具体应该设置多少，可以借鉴这里的数据，当然前提是一般情况下】
// Given a string representation of a URL, sets up a connection and gets
// an input stream.
private InputStream downloadUrl(String urlString) throws IOException {
    URL url = new URL(urlString);
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setReadTimeout(10000 /* milliseconds */);
    conn.setConnectTimeout(15000 /* milliseconds */);
    conn.setRequestMethod("GET");
    conn.setDoInput(true);
    // Starts the query
    conn.connect();
    return conn.getInputStream();
}
```

***
