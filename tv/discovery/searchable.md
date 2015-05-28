<!--# Making TV Apps Searchable #-->
# 使TV应用是可被搜索的

> 编写:[awong1900](https://github.com/awong1900) - 原文:http://developer.android.com/training/tv/discovery/searchable.html

<!--Android TV uses the Android search interface to retrieve content data from installed apps and deliver search results to the user. Your app's content data can be included with these results, to give the user instant access to the content in your app.-->

Android TV使用Android[搜索接口](http://developer.android.com/guide/topics/search/index.html)从安装的应用中检索内容数据并且释放搜索结果给用户。我们的应用内容数据能被包含在这些结果中，去给用户即时访问应用程序中的内容。

<!--Your app must provide Android TV with the data fields from which it generates suggested search results as the user enters characters in the search dialog. To do that, your app must implement a Content Provider that serves up the suggestions along with a searchable.xml configuration file that describes the content provider and other vital information for Android TV. You also need an activity that handles the intent that fires when the user selects a suggested search result. All of this is described in more detail in Adding Custom Suggestions. Here are described the main points for Android TV apps.-->

我们的应用必须提供Android TV数据字段，它是用户在搜索框中输入字符生成的建议搜索结果。去做这个，我们的应用必须实现[Content Provider](http://developer.android.com/guide/topics/providers/content-providers.html)，在[searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)配置文件描述content provider和其他必要的Android TV信息。我们也需要一个activity在用户选择一个建议的搜索结果时处理intent的触发。所有的这些被描述在[Adding Custom Suggestions](http://developer.android.com/guide/topics/search/adding-custom-suggestions.html)。本文描述Android TV应用搜索的关键点。

<!--This lesson builds on your knowledge of using search in Android to show you how to make your app searchable in Android TV. Be sure you are familiar with the concepts explained in the Search API guide before following this lesson. See also the training Adding Search Functionality.-->

这节课展示Android中搜索的知识，展示如何使我们的应用在Android TV里是可被搜索的。确信我们熟悉[Search API guide](http://developer.android.com/guide/topics/search/index.html)的解释。在下面的这节课程之前，查看[Adding Search Functionality](http://developer.android.com/training/search/index.html)训练课程。

<!--This discussion describes some code from the Android Leanback sample app, available on GitHub.-->
这个讨论描述的一些代码，从[Android Leanback示例代码](https://github.com/googlesamples/androidtv-Leanback)摘出。代码可以在Github上找到。

<!--## Identify Columns ##-->
## 识别列

<!--The SearchManager describes the data fields it expects by representing them as columns of an SQLite database. Regardless of your data's format, you must map your data fields to these columns, usually in the class that accessess your content data. For information about building a class that maps your existing data to the required fields, see Building a suggestion table.-->

[SearchManager](http://developer.android.com/reference/android/app/SearchManager.html)描述了数据字段，它被代表为SQLite数据库的列。不管我们的数据格式，我们必须把我们的数据字段填到那些列，通常用存取我们的内容数据的类。更多信息，查看[Building a suggestion table()](http://developer.android.com/guide/topics/search/adding-custom-suggestions.html#SuggestionTable)。

<!--The SearchManager class includes several columns for Android TV. Some of the more important columns are described below.-->
SearchManager类为AndroidTV包含了几个列。下面是重要的一些列：

值								    |	描述
:-----------------------------------|:--------------------------------
`SUGGEST_COLUMN_TEXT_1`				|内容名字 **(必须)**
`SUGGEST_COLUMN_TEXT_2`				|内容的文本描述
`SUGGEST_COLUMN_RESULT_CARD_IMAGE`|图片/封面
`SUGGEST_COLUMN_CONTENT_TYPE`		|媒体的MIME类型 **(必须)**
`SUGGEST_COLUMN_VIDEO_WIDTH`		|媒体的分辨率宽度     
`SUGGEST_COLUMN_VIDEO_HEIGHT`		|媒体的分辨率高度 
`SUGGEST_COLUMN_PRODUCTION_YEAR`	|内容的产品年份 **(必须)**
`SUGGEST_COLUMN_DURATION`			|媒体的时间长度

<!--The search framework requires the following columns:-->
搜索framework需要以下的列：

- [SUGGEST_COLUMN_TEXT_1](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_TEXT_1)
- [SUGGEST_COLUMN_CONTENT_TYPE](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_CONTENT_TYPE)
- [SUGGEST_COLUMN_PRODUCTION_YEAR](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_PRODUCTION_YEAR)

<!--When the values of these columns for your content match the values for the same content from other providers found by Google servers, the system provides a deep link to your app in the details view for the content, along with links to the apps of other providers. This is discussed more in Display Content in the Details Screen, below.-->

当这些内容的列的值匹配Google服务的providers提供的的值时，系统提供一个[深链接](http://developer.android.com/training/app-indexing/deep-linking.html)到我们的应用，用于详情查看，以及指向应用的其他Providers的链接。更多讨论在[在详情页显示内容](http://developer.android.com/training/tv/discovery/searchable.html#details)。

<!--Your application's database class might define the columns as follows:-->
我们的应用的数据库类可能定义以下的列：

```java
public class VideoDatabase {
  //The columns we'll include in the video database table
  public static final String KEY_NAME = SearchManager.SUGGEST_COLUMN_TEXT_1;
  public static final String KEY_DESCRIPTION = SearchManager.SUGGEST_COLUMN_TEXT_2;
  public static final String KEY_ICON = SearchManager.SUGGEST_COLUMN_RESULT_CARD_IMAGE;
  public static final String KEY_DATA_TYPE = SearchManager.SUGGEST_COLUMN_CONTENT_TYPE;
  public static final String KEY_IS_LIVE = SearchManager.SUGGEST_COLUMN_IS_LIVE;
  public static final String KEY_VIDEO_WIDTH = SearchManager.SUGGEST_COLUMN_VIDEO_WIDTH;
  public static final String KEY_VIDEO_HEIGHT = SearchManager.SUGGEST_COLUMN_VIDEO_HEIGHT;
  public static final String KEY_AUDIO_CHANNEL_CONFIG =
          SearchManager.SUGGEST_COLUMN_AUDIO_CHANNEL_CONFIG;
  public static final String KEY_PURCHASE_PRICE = SearchManager.SUGGEST_COLUMN_PURCHASE_PRICE;
  public static final String KEY_RENTAL_PRICE = SearchManager.SUGGEST_COLUMN_RENTAL_PRICE;
  public static final String KEY_RATING_STYLE = SearchManager.SUGGEST_COLUMN_RATING_STYLE;
  public static final String KEY_RATING_SCORE = SearchManager.SUGGEST_COLUMN_RATING_SCORE;
  public static final String KEY_PRODUCTION_YEAR = SearchManager.SUGGEST_COLUMN_PRODUCTION_YEAR;
  public static final String KEY_COLUMN_DURATION = SearchManager.SUGGEST_COLUMN_DURATION;
  public static final String KEY_ACTION = SearchManager.SUGGEST_COLUMN_INTENT_ACTION;
...
```

<!--When you build the map from the SearchManager columns to your data fields, you must also specify the _ID to give each row a unique ID.-->
当我们创建从[SearchManager](http://developer.android.com/reference/android/app/SearchManager.html)列填充到我们的数据字段时，我们也必须定义[_ID](http://developer.android.com/reference/android/provider/BaseColumns.html#_ID)去获得每行的独一无二的ID。


```java
...
  private static HashMap buildColumnMap() {
    HashMap map = new HashMap();
    map.put(KEY_NAME, KEY_NAME);
    map.put(KEY_DESCRIPTION, KEY_DESCRIPTION);
    map.put(KEY_ICON, KEY_ICON);
    map.put(KEY_DATA_TYPE, KEY_DATA_TYPE);
    map.put(KEY_IS_LIVE, KEY_IS_LIVE);
    map.put(KEY_VIDEO_WIDTH, KEY_VIDEO_WIDTH);
    map.put(KEY_VIDEO_HEIGHT, KEY_VIDEO_HEIGHT);
    map.put(KEY_AUDIO_CHANNEL_CONFIG, KEY_AUDIO_CHANNEL_CONFIG);
    map.put(KEY_PURCHASE_PRICE, KEY_PURCHASE_PRICE);
    map.put(KEY_RENTAL_PRICE, KEY_RENTAL_PRICE);
    map.put(KEY_RATING_STYLE, KEY_RATING_STYLE);
    map.put(KEY_RATING_SCORE, KEY_RATING_SCORE);
    map.put(KEY_PRODUCTION_YEAR, KEY_PRODUCTION_YEAR);
    map.put(KEY_COLUMN_DURATION, KEY_COLUMN_DURATION);
    map.put(KEY_ACTION, KEY_ACTION);
    map.put(BaseColumns._ID, "rowid AS " +
            BaseColumns._ID);
    map.put(SearchManager.SUGGEST_COLUMN_INTENT_DATA_ID, "rowid AS " +
            SearchManager.SUGGEST_COLUMN_INTENT_DATA_ID);
    map.put(SearchManager.SUGGEST_COLUMN_SHORTCUT_ID, "rowid AS " +
            SearchManager.SUGGEST_COLUMN_SHORTCUT_ID);
    return map;
  }
...
```

<!--In the example above, notice the mapping to the SUGGEST_COLUMN_INTENT_DATA_ID field. This is the portion of the URI that points to the content unique to the data in this row — that is, the last part of the URI describing where the content is stored. The first part of the URI, when it is common to all of the rows in the table, is set in the searchable.xml file as the android:searchSuggestIntentData attribute, as described in Handle Search Suggestions, below.-->

在上面的例子中，注意填充[SUGGEST_COLUMN_INTENT_DATA_ID](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_INTENT_DATA_ID)字段。这是URI的一部分，指向独一无二的内容到这一列的数据，那是URI描述的内容被存储的最后部分。在URI的第一部分，与所有表格的列同样，是设置[在searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)文件，用[android:searchSuggestIntentData](http://developer.android.com/guide/topics/search/searchable-config.html#searchSuggestIntentData)属性。属性被描述在[Handle Search Suggestions](http://developer.android.com/training/tv/discovery/searchable.html#suggestions)。

<!--If the first part of the URI is different for each row in the table, you map that value with the SUGGEST_COLUMN_INTENT_DATA field. When the user selects this content, the intent that fires provides the intent data from the combination of the SUGGEST_COLUMN_INTENT_DATA_ID and either the android:searchSuggestIntentData attribute or the SUGGEST_COLUMN_INTENT_DATA field value.-->

如果URI的第一部分是不同于表格的每一列，我们填充[SUGGEST_COLUMN_INTENT_DATA](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_INTENT_DATA)字段的值。当用户选择这个内容时，这个intent被启动依据[SUGGEST_COLUMN_INTENT_DATA_ID](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_INTENT_DATA_ID)的混合intent数据或者`android:searchSuggestIntentData`属性和[SUGGEST_COLUMN_INTENT_DATA](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_INTENT_DATA)字段值之一。

<!--### Provide Search Suggestion Data-->
### 提供搜索建议数据

<!--Implement a Content Provider to return search term suggestions to the Android TV search dialog. The system queries your content provider for suggestions by calling the query() method each time a letter is typed. In your implementation of query(), your content provider searches your suggestion data and returns a Cursor that points to the rows you have designated for suggestions.-->

实现一个[Content Provider](http://developer.android.com/guide/topics/providers/content-providers.html)去返回搜索术语建议到AndroidTV搜索框。系统需要我们的内容容器提供建议，通过调用每次一个字母类型[query()](http://developer.android.com/reference/android/content/ContentProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String))方法。在[query()](http://developer.android.com/reference/android/content/ContentProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String))的实现中，我们的内容容器搜索我们的建议数据并且返回一个光标指向我们已经指定的建议列。

```java
@Override
  public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs,
                      String sortOrder) {
    // Use the UriMatcher to see what kind of query we have and format the db query accordingly
    switch (URI_MATCHER.match(uri)) {
      case SEARCH_SUGGEST:
          Log.d(TAG, "search suggest: " + selectionArgs[0] + " URI: " + uri);
          if (selectionArgs == null) {
              throw new IllegalArgumentException(
                      "selectionArgs must be provided for the Uri: " + uri);
          }
          return getSuggestions(selectionArgs[0]);
      default:
          throw new IllegalArgumentException("Unknown Uri: " + uri);
    }
  }

  private Cursor getSuggestions(String query) {
    query = query.toLowerCase();
    String[] columns = new String[]{
      BaseColumns._ID,
      VideoDatabase.KEY_NAME,
      VideoDatabase.KEY_DESCRIPTION,
      VideoDatabase.KEY_ICON,
      VideoDatabase.KEY_DATA_TYPE,
      VideoDatabase.KEY_IS_LIVE,
      VideoDatabase.KEY_VIDEO_WIDTH,
      VideoDatabase.KEY_VIDEO_HEIGHT,
      VideoDatabase.KEY_AUDIO_CHANNEL_CONFIG,
      VideoDatabase.KEY_PURCHASE_PRICE,
      VideoDatabase.KEY_RENTAL_PRICE,
      VideoDatabase.KEY_RATING_STYLE,
      VideoDatabase.KEY_RATING_SCORE,
      VideoDatabase.KEY_PRODUCTION_YEAR,
      VideoDatabase.KEY_COLUMN_DURATION,
      VideoDatabase.KEY_ACTION,
      SearchManager.SUGGEST_COLUMN_INTENT_DATA_ID
    };
    return mVideoDatabase.getWordMatch(query, columns);
  }
...
```

<!--In your manifest file, the content provider receives special treatment. Rather than getting tagged as an activity, it is described as a <provider>. The provider includes the android:searchSuggestAuthority attribute to tell the system the namespace of your content provider. Also, you must set its android:exported attribute to "true" so that the Android global search can use the results returned from it.-->

在我们的manifest文件中，内容容器接受特殊处理。相比被标记为一个activity，它是被描述为<[provider](http://developer.android.com/guide/topics/manifest/provider-element.html)>。provider包括`android:searchSuggestAuthority`属性去告诉系统我们的内容容器的名字空间。并且，我们必须设置它的`android:exported`属性为`"true"`，这样Android全局搜索能用它返回的搜索结果。

```xml
<provider android:name="com.example.android.tvleanback.VideoContentProvider"
    android:authorities="com.example.android.tvleanback"
    android:exported="true" />
```

<!--## Handle Search Suggestions ##-->
## 处理搜索建议

<!--Your app must include a res/xml/searchable.xml file to configure the search suggestions settings. It inlcudes the android:searchSuggestAuthority attribute to tell the system the namespace of your content provider. This must match the string value you specify in the android:authorities attribute of the <provider> element in your AndroidManifest.xml file.-->

我们的应用必须包括[res/xml/searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)文件去配置搜索建议设置。它包括[android:searchSuggestAuthority](http://developer.android.com/guide/topics/search/searchable-config.html#searchSuggestAuthority)属性去告诉系统内容容器的名字空间。这必须匹配在`AndroidManifest.xml`文件的<[provider](http://developer.android.com/guide/topics/manifest/provider-element.html)>元素的[android:authorities](http://developer.android.com/guide/topics/manifest/provider-element.html#auth) 属性的字符串值。

<!--The searchable.xml file must also include the android:searchSuggestIntentAction with the value "android.intent.action.VIEW" to define the intent action for providing a custom suggestion. This is different from the intent action for providing a search term, explained below. See also, Declaring the intent action for other ways to declare the intent action for suggestions.-->

[searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)文件必须也包含在`"android.intent.action.VIEW"`的[android:searchSuggestIntentAction](http://developer.android.com/guide/topics/search/searchable-config.html#searchSuggestIntentAction)值去定义提供自定义建议的intent action。这与提供一个搜索术语的intent action不同，下面解释。查看[Declaring the intent action](http://developer.android.com/guide/topics/search/adding-custom-suggestions.html#IntentAction) 用另一种方式去定义建议的intent action。

<!--Along with the intent action, your app must provide the intent data, which you specify with the android:searchSuggestIntentData attribute. This is the first part of the URI that points to the content. It describes the portion of the URI common to all rows in the mapping table for that content. The portion of the URI that is unique to each row is established with the SUGGEST_COLUMN_INTENT_DATA_ID field, as described above in Identify Columns. See also, Declaring the intent data for other ways to declare the intent data for suggestions.-->

同intent action一起，我们的应用必须提供我们定义的[android:searchSuggestIntentData](http://developer.android.com/guide/topics/search/searchable-config.html#searchSuggestIntentData)属性的intent数据。这是指向内容的URI的第一部分。它描述在填充的内容表格中URI所有共同列的部分。URI的独一无二的部分用 [SUGGEST_COLUMN_INTENT_DATA_ID](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_INTENT_DATA_ID)字段建立每一列，以上被描述在[识别列](http://developer.android.com/training/tv/discovery/searchable.html#columns)。查看[Declaring the intent data](http://developer.android.com/guide/topics/search/adding-custom-suggestions.html#IntentData)用另一种方式去定义建议的intent数据。

<!--Also, note the android:searchSuggestSelection=" ?" attribute which specifies the value passed as the selection parameter of the query() method where the question mark (?) value is replaced with the query text.-->

并且，注意`android:searchSuggestSelection="?"`属性为特定的值。这个值作为[query()](http://developer.android.com/reference/android/content/ContentProvider.html#query(android.net.Uri, java.lang.String[], java.lang.String, java.lang.String[], java.lang.String))方法`selection`参数。方法的问题标记(?)值被代替为请求文本。

<!--Finally, you must also include the android:includeInGlobalSearch attribute with the value "true". Here is an example searchable.xml file:-->

最后，我们也必须包含[android:includeInGlobalSearch](http://developer.android.com/guide/topics/search/searchable-config.html#includeInGlobalSearch)属性值为`"true"`。这是一个[searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)文件的例子：
```
<searchable xmlns:android="http://schemas.android.com/apk/res/android"
    android:label="@string/search_label"
        android:hint="@string/search_hint"
        android:searchSettingsDescription="@string/settings_description"
        android:searchSuggestAuthority="com.example.android.tvleanback"
        android:searchSuggestIntentAction="android.intent.action.VIEW"
        android:searchSuggestIntentData="content://com.example.android.tvleanback/video_database_leanback"
        android:searchSuggestSelection=" ?"
        android:searchSuggestThreshold="1"
        android:includeInGlobalSearch="true"
    >
</searchable>
```

<!--## Handle Search Terms ##-->
## 处理搜索术语

<!--As soon as the search dialog has a word which matches the value in one of your app's columns (described in Identifying Columns, above), the system fires the ACTION_SEARCH intent. The activity in your app which handles that intent searches the repository for columns with the given word in their values, and returns a list of content items with those columns. In your AndroidManifest.xml file, you designate the activity which handles the ACTION_SEARCH intent like this:-->

一旦搜索框有一个字匹配到了应用列中的一个（被描述在上文的[识别列](http://developer.android.com/training/tv/discovery/searchable.html#identifying)），系统启动[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent。我们应用的activity处理intent搜索列的给定的字段资源，并且返回一个那些内容项的列表。在我们的`AndroidManifest.xml`文件中，我们指定的activity处理[ACTION_SEARCH](http://developer.android.com/reference/android/content/Intent.html#ACTION_SEARCH) intent，像这样：

```xml
...
  <activity
      android:name="com.example.android.tvleanback.DetailsActivity"
      android:exported="true">

      <!-- Receives the search request. -->
      <intent-filter>
          <action android:name="android.intent.action.SEARCH" />
          <!-- No category needed, because the Intent will specify this class component -->
      </intent-filter>

      <!-- Points to searchable meta data. -->
      <meta-data android:name="android.app.searchable"
          android:resource="@xml/searchable" />
  </activity>
...
  <!-- Provides search suggestions for keywords against video meta data. -->
  <provider android:name="com.example.android.tvleanback.VideoContentProvider"
      android:authorities="com.example.android.tvleanback"
      android:exported="true" />
...
```

<!--The activity must also describe the searchable configuration with a reference to the searchable.xml file. To use the global search dialog, the manifest must describe which activity should receive search queries. The manifest must also describe the <provider> element, exactly as it is described in the searchable.xml file.-->

activity必须参考[searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)文件描述可搜索的设置。用[全局搜索框](http://developer.android.com/guide/topics/search/search-dialog.html)，manifest必须描述activity应该收到的搜索请求。manifest必须描述<[provider](http://developer.android.com/guide/topics/manifest/provider-element.html)>元素，详细被描述在[searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html)文件。

<!--## Deep Link to Your App in the Details Screen ##-->
## 深链接到应用的详情页

<!--If you have set up the search configuration as described in Handle Search Suggestions and mapped the SUGGEST_COLUMN_TEXT_1, SUGGEST_COLUMN_CONTENT_TYPE, and SUGGEST_COLUMN_PRODUCTION_YEAR fields as described in Identify Columns, a deep link to a watch action for your content appears in the details screen that launches when the user selects a search result, as shown in figure 1.-->

如果我们有设置[处理搜索建议](http://developer.android.com/training/tv/discovery/searchable.html#suggestions)描述的搜索配置和填充 [SUGGEST_COLUMN_TEXT_1](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_TEXT_1)，[SUGGEST_COLUMN_CONTENT_TYPE](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_CONTENT_TYPE)和[SUGGEST_COLUMN_PRODUCTION_YEAR](http://developer.android.com/reference/android/app/SearchManager.html#SUGGEST_COLUMN_PRODUCTION_YEAR)字段到[识别列](http://developer.android.com/training/tv/discovery/searchable.html#columns)，一个[深链接](http://developer.android.com/training/app-indexing/deep-linking.html)去查看详情页的内容。当用户选择一个搜索结果时，详情页将打开。如图1。

![deep-link](deep-link.png)  
<!--**Figure 1.** The details screen displays a deep link for the Videos by Google (Leanback) sample app. Sintel: © copyright Blender Foundation, www.sintel.org.-->
**图1** 详情页显示一个深链接为Google(Leanback)的视频代码。Sintel: © copyright Blender Foundation, www.sintel.org.

<!--When the user selects the link for your app, identified by the "Available On" button in the details screen, the system launches the activity which handles the ACTION_VIEW (set as android:searchSuggestIntentAction with the value "android.intent.action.VIEW" in the searchable.xml file).-->

当用户选择我们的应用链接，`“Available On”`按钮被标识在详情页，系统启动activity处理[ACTION_VIEW](http://developer.android.com/reference/android/content/Intent.html#ACTION_VIEW)（在[searchable.xml](http://developer.android.com/guide/topics/search/searchable-config.html#searchSuggestIntentAction)文件设置[android:searchSuggestIntentAction](http://developer.android.com/guide/topics/search/searchable-config.html#searchSuggestIntentAction)值为`"android.intent.action.VIEW"`）。

<!--You can also set up a custom intent to launch your activity, and this is demonstrated in the Android Leanback sample app. Note that the sample app launches its own LeanbackDetailsFragment to show the details for the selected media, but you should launch the activity that plays the media immediately to save the user another click or two.-->

我们也能设置用户intent去启动我们的activity，这个在[在AndroidLeanback示例代码应用](https://github.com/googlesamples/androidtv-Leanback)中演示。注意示例应用启动它自己的`LeanbackDetailsFragment`去显示被选择媒体的详情，但是我们应该启动activity去播放媒体。立即去保存用户的另一次或两次点击。

----------------
[下一节: 使TV应用是可被搜索的 >](in-app-search.html)
