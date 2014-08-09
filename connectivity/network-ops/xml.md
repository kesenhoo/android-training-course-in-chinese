# 解析XML数据Parsing XML Data

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/network-ops/xml.html>

Extensible Markup Language (XML) .很多网站或博客上都提供XML feed来记录更新的信息，以便用户进行订阅读取。

那么上传[?]与解析XML数据就成了app的一个常见的功能。 这一课会介绍如何解析XML文档并使用他们的数据。

*([?]这里很奇怪，为什么是Upload，看文章最后一段代码示例的注释，应该是Download才对)*

## Choose a Parser(选择一个解析器)
我们推荐[XmlPullParser](http://developer.android.com/reference/org/xmlpull/v1/XmlPullParser.html), 它是在Android上一个高效且可维护的解析XML方法。 Android 上有这个接口的两种实现方式：

* [KXmlParser](http://kxml.sourceforge.net/) via [XmlPullParserFactory.newPullParser()](http://developer.android.com/reference/org/xmlpull/v1/XmlPullParserFactory.html#newPullParser()).
* ExpatPullParser, via [Xml.newPullParser()](http://developer.android.com/reference/android/util/Xml.html#newPullParser()).

两个选择都是比较好的。下面的示例中是使用ExpatPullParser, via Xml.newPullParser().

<!-- more -->

## Analyze the Feed(分析Feed)
解析一个feed的第一步是决定需要获取哪些字段。这样解析器才去抽取出那些需要的字段而忽视剩下的。
下面一段章节概览Sample app中截取的一段代码示例.
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
在sample app中抽取了entry 标签与它的子标签 title, link,summary.

## Instantiate the Parser(实例化解析器)
下一步就是实例化一个parser并开始解析的操作。请看下面的示例：

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

## Read the Feed(读取Feed)
The readFeed() 实际上并没有处理feed的内容。它只是在寻找一个 "entry" 的标签作为递归（recursively）处理整个feed的起点。如果一个标签它不是"entry", readFeed()方法会跳过它. 当整个feed都被递归处理后，readFeed() 会返回一个包含了entry标签（包括里面的数据成员）的 List 。

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

## Parse XML(解析XML)
解析步骤如下：

* 正如在上面“ 分析Feed”所说的, 判断出你想要的tag。这个example抽取了 entry 标签与它的内部标签 title, link,summary.
* 创建下面的方法:
	* 为每一个你想要获取的标签创建一个 "read" 方法。例如 readEntry(), readTitle() 等等. 解析器从input stream中读取tag . 当读取到 entry, title, link 或者 summary 标签时，它会为那些标签调用相应的方法，否则，跳过这个标签。
	* 为每一个不同的标签的提取数据方法进行优化，例如：
		* 对于 title and summary tags, 解析器调用 readText(). 通过调用parser.getText().来获取返回数据。
		* 对于 link tag,解析器先判断这个link是否是我们想要的类型，然后再读取数据。可以使用 parser.getAttributeValue() 来获取返回数据。
		* 对于 entry tag, 解析起调用 readEntry(). 这个方法解析entry的内部标签并返回一个带有title, link, and summary数据成员的Entry对象。
	* 一个帮助方法： skip() . 关于这部分的讨论，请看下面一部分内容：Skip Tags You Don't Care About

下面的代码演示了如何解析 entries, titles, links, 与 summaries.

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

## Skip Tags You Don't Care About(跳过你不在意标签)
下面演示解析器的 skip() 方法:

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

上面这个方法是如何工作的呢？

* It throws an exception if the current event isn't a START_TAG.
* It consumes the START_TAG, and all events up to and including the matching END_TAG.
* To make sure that it stops at the correct END_TAG and not at the first tag it encounters after the original START_TAG, it keeps track of the nesting depth.

因此如果目前的标签有子标签, depth 的值就不会为 0，直到解析器已经处理了所有位于START_TAG与END_TAG之间的事件。例如，看解析器如何跳过 <author> 标签，它有2个子标签，<name> 与 <uri>：

* The first time through the while loop, the next tag the parser encounters after <author> is the START_TAG for <name>. The value for depth is incremented to 2.
* The second time through the while loop, the next tag the parser encounters is the END_TAG </name>. The value for depth is decremented to 1.
* The third time through the while loop, the next tag the parser encounters is the START_TAG <uri>. The value for depth is incremented to 2.
* The fourth time through the while loop, the next tag the parser encounters is the END_TAG </uri>. The value for depth is decremented to 1.
* The fifth time and final time through the while loop, the next tag the parser encounters is the END_TAG </author>. The value for depth is decremented to 0, indicating that the <author>element has been successfully skipped.

## Consume XML Data(使用XML数据)
示例程序是在 AsyncTask 中获取与解析XML数据的。当获取到数据后，程序会在main activity(NetworkActivity)里面进行更新操作。

在下面示例代码中，loadPage() 方法做了下面的事情：

* 初始化一个带有URL地址的String变量，用来订阅XML feed。
* 如果用户设置与网络连接都允许，会触发 new DownloadXmlTask().execute(url). 这会初始化一个新的 DownloadXmlTask(AsyncTask subclass)  对象并且开始执行它的 execute() 方法。

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

下面是DownloadXmlTask是怎么工作的：

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

下面是loadXmlFromNetwork是怎么工作的：

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
