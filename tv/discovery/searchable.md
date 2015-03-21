<!--# Making TV Apps Searchable #-->
# 使得TV App能够被搜索

> 编写:[awong1900](https://github.com/awong1900) - 原文:http://developer.android.com/training/tv/discovery/searchable.html

<!--Android TV uses the Android search interface to retrieve content data from installed apps and deliver search results to the user. Your app's content data can be included with these results, to give the user instant access to the content in your app.-->

安卓TV使用安卓搜索接口去检索内容数据从安装的应用并且释放搜索结果给用户。你的应用内容数据能被包含在这些结果中，去给用户即时访问应用程序中的内容。

<!--Your app must provide Android TV with the data fields from which it generates suggested search results as the user enters characters in the search dialog. To do that, your app must implement a Content Provider that serves up the suggestions along with a searchable.xml configuration file that describes the content provider and other vital information for Android TV. You also need an activity that handles the intent that fires when the user selects a suggested search result. All of this is described in more detail in Adding Custom Suggestions. Here are described the main points for Android TV apps.-->

你的应用必须提供安卓TV数据字段从产生建议的搜索结果用户输入的字符在搜索框。去做这个，你的应用必须实现Content Provider提供的建议在searchable.xml配置文件描述content provider和其他重要的安卓TV信息。你也需要一个activity处理intent用户选择一个建议的搜索结果的触发。所有的这个被描述在Adding Custom Suggestions有更多细节。这儿是被描述那个主要的点为安卓TV应用。

<!--This lesson builds on your knowledge of using search in Android to show you how to make your app searchable in Android TV. Be sure you are familiar with the concepts explained in the Search API guide before following this lesson. See also the training Adding Search Functionality.-->

这节课创建在你的知识用搜索在安卓中去展示你如何去使你的应用可搜索在安卓TV。确信你是熟悉的在关心解释在搜索API指导在下面的这节课程之前。查看训练Adding Search Functionality。

<!--This discussion describes some code from the Android Leanback sample app, available on GitHub.-->
这讨论描述了一些代码从安卓Leanback示例代码，可以找到在Github。

<!--## Identify Columns ##-->
## 识别列

<!--The SearchManager describes the data fields it expects by representing them as columns of an SQLite database. Regardless of your data's format, you must map your data fields to these columns, usually in the class that accessess your content data. For information about building a class that maps your existing data to the required fields, see Building a suggestion table.-->

SearchManager描述了数据字段它解释SOLite数据库的列代表他们。尽管你的数据格式，你必须map你的数据字段到那些列，通常在map类你的存在的数据去需要的字段，看Building a suggestion table()。

<!--The SearchManager class includes several columns for Android TV. Some of the more important columns are described below.-->
SearchManager类为安卓TV包含了几个列。更重要的列的一些是描述在下面：

值								    |	描述
:-----------------------------------|:--------------------------------
`SUGGEST_COLUMN_TEXT_1`				|The name of your content **(required)**
`SUGGEST_COLUMN_TEXT_2`				|A text description of your content
`SUGGEST_COLUMN_RESULT_CARD_IMAGE`	|An image/poster/cover for your content
`SUGGEST_COLUMN_CONTENT_TYPE`		|The MIME type of your media **(required)**
`SUGGEST_COLUMN_VIDEO_WIDTH`		|The resolution width of your media
`SUGGEST_COLUMN_VIDEO_HEIGHT`		|The resolution height of your media
`SUGGEST_COLUMN_PRODUCTION_YEAR`	|The production year of your content **(required)**
`SUGGEST_COLUMN_DURATION`			|The duration in milliseconds of your media

<!--The search framework requires the following columns:-->
搜索framework需要以下的列：

- SUGGEST_COLUMN_TEXT_1
- SUGGEST_COLUMN_CONTENT_TYPE
- SUGGEST_COLUMN_PRODUCTION_YEAR

<!--When the values of these columns for your content match the values for the same content from other providers found by Google servers, the system provides a deep link to your app in the details view for the content, along with links to the apps of other providers. This is discussed more in Display Content in the Details Screen, below.-->

当这些列的值从文本匹配同样的内容从另一个provider找到被Google服务，系统提供一个深度链接到你的应用在细节从内容的查看，在其他provider的应用链接旁边。这是一个讨论在Display Content在细节屏幕，下面。

<!--Your application's database class might define the columns as follows:-->
你的应用的数据库类可能定义以下的列：

```
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
当你的创建map从SearchManager列到你的数据字段，你也必须定义ID去获得每一个行一个独一无二的ID。


```
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

在上面的例子中，注意mapping到SUGGEST_COLUMN_INTENT_DATA_ID字段。这是URI指向内容独一无二的数据在这一列-那是，URI描述的最后部分，是文本被存储的地方。URI的第一部分，当他是与所有的表格的列同样，是设置在searchable.xml文件作为android:searchSuggestIntentData属性，被描述在Handle Search Suggestions，下面。

<!--If the first part of the URI is different for each row in the table, you map that value with the SUGGEST_COLUMN_INTENT_DATA field. When the user selects this content, the intent that fires provides the intent data from the combination of the SUGGEST_COLUMN_INTENT_DATA_ID and either the android:searchSuggestIntentData attribute or the SUGGEST_COLUMN_INTENT_DATA field value.-->

如果URI的第一部分是不同于表格的每一列，你map那个值SUGGEST_COLUMN_INTENT_DATA字段。当用户选择这个内容时，这个intent被启动被intent数据从SUGGEST_COLUMN_INTENT_DATA_ID或者android:searchSuggestIntentData属性或者 SUGGEST_COLUMN_INTENT_DATA field值。

<!--### Provide Search Suggestion Data-->
### 提供搜索建议数据

<!--Implement a Content Provider to return search term suggestions to the Android TV search dialog. The system queries your content provider for suggestions by calling the query() method each time a letter is typed. In your implementation of query(), your content provider searches your suggestion data and returns a Cursor that points to the rows you have designated for suggestions.-->

实现一个Content Provider去获得搜索术语建议从安卓TV搜索框。系统需要你content provider建议调用query()方法每次一个字母是类型的。在你实现query()，你的文本提供器搜索你的建议数据去返回一个光标指出列你有描述建议的。

```
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

在你的manifest文件中，内容提供器收到特殊的处理。而不是被标记为一个activity，它是被描述为<provider>。那个provider包括android:searchSuggestAuthority属性去告诉系统文本提供器的名字空间。并且，你必须设置它的android:exported属性为true这样安卓全局搜索能用搜索结果从它返回的。

```
<provider android:name="com.example.android.tvleanback.VideoContentProvider"
    android:authorities="com.example.android.tvleanback"
    android:exported="true" />
```

<!--## Handle Search Suggestions ##-->
## 处理搜索建议

<!--Your app must include a res/xml/searchable.xml file to configure the search suggestions settings. It inlcudes the android:searchSuggestAuthority attribute to tell the system the namespace of your content provider. This must match the string value you specify in the android:authorities attribute of the <provider> element in your AndroidManifest.xml file.-->

你的应用包括res/xml/searchable.xml文件去设置搜索建议设置。它包括ndroid:searchSuggestAuthority属性去告诉系统你的内容提供器的名字空间。这必须匹配那字符串值你定义的在android:authorities attribute在<provider>元素中在你的AndroidManifest.xml文件中。

<!--The searchable.xml file must also include the android:searchSuggestIntentAction with the value "android.intent.action.VIEW" to define the intent action for providing a custom suggestion. This is different from the intent action for providing a search term, explained below. See also, Declaring the intent action for other ways to declare the intent action for suggestions.-->

searchable.xml文件必须也包含android:searchSuggestIntentAction在"android.intent.action.VIEW"值去定义那个intent action提供一个定制的建议。这是不同的从intent action从提供一个搜索术语，下面解释。也可查看，Declaring the intent action for other ways to declare the intent action for suggestions。

<!--Along with the intent action, your app must provide the intent data, which you specify with the android:searchSuggestIntentData attribute. This is the first part of the URI that points to the content. It describes the portion of the URI common to all rows in the mapping table for that content. The portion of the URI that is unique to each row is established with the SUGGEST_COLUMN_INTENT_DATA_ID field, as described above in Identify Columns. See also, Declaring the intent data for other ways to declare the intent data for suggestions.-->

同intent action一起，你的应用必须提供intent数据，你定义用android:searchSuggestIntentData属性。这是URI的第一部分指向内容。它描述那个URI列的部分到所有的列在mapping表格为内容。URI的部分是独一无二的每一列是被建立用SUGGEST_COLUMN_INTENT_DATA_ID字段，作为描述在Identify Columns之上。也可查看Declaring the intent data for other ways to declare the intent data for suggestions.

<!--Also, note the android:searchSuggestSelection=" ?" attribute which specifies the value passed as the selection parameter of the query() method where the question mark (?) value is replaced with the query text.-->

并且，注意android:searchSuggestSelection="?"属性定义了那个值作为选择的属性query()方法问题标记(?)值被需要在请求文本。

<!--Finally, you must also include the android:includeInGlobalSearch attribute with the value "true". Here is an example searchable.xml file:-->

最终，你也必须包含android:includeInGlobalSearch属性用值"true"。这是一个例子searchable.xml文件。
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

一旦搜索框有一个字匹配应用类的一个（被Identifying Columns描述，上面），系统启动ACTION_SEARCH intent。你的应用的activity处理intent搜索列的资源给定的字段在他们的值，并且返回一个文本项目的列表那些列。在你的AndroidManifest.xml文件中，你指定的activity处理ACTION_SEARCH intent像这样：

```
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

activity必须描述可搜索的设置参考searchable.xml文件。去用全局搜索框，manifest必须描述activity应该受到搜索请求。manifest必须描述<provider>元素，精确的作为被描述在searchable.xml文件。

<!--## Deep Link to Your App in the Details Screen ##-->
## 深链接对应用在细节屏幕

<!--If you have set up the search configuration as described in Handle Search Suggestions and mapped the SUGGEST_COLUMN_TEXT_1, SUGGEST_COLUMN_CONTENT_TYPE, and SUGGEST_COLUMN_PRODUCTION_YEAR fields as described in Identify Columns, a deep link to a watch action for your content appears in the details screen that launches when the user selects a search result, as shown in figure 1.-->

如果你有设置搜索配置描述处理搜索建议mapped SUGGEST_COLUMN_TEXT_1，SUGGEST_COLUMN_CONTENT_TYPE和SUGGEST_COLUMN_PRODUCTION_YEAR字段作为描述在Identify Columns，一个深度链接去查看action为你的内容出现在细节屏幕启动当用户选择一个搜索结果显示在图1。

![deep-link](deep-link.png)  
<!--**Figure 1.** The details screen displays a deep link for the Videos by Google (Leanback) sample app. Sintel: © copyright Blender Foundation, www.sintel.org.-->
**图1** 细节屏幕显示一个深度链接为视频被Google(Leanback)示例代码。Sintel: © copyright Blender Foundation, www.sintel.org.

<!--When the user selects the link for your app, identified by the "Available On" button in the details screen, the system launches the activity which handles the ACTION_VIEW (set as android:searchSuggestIntentAction with the value "android.intent.action.VIEW" in the searchable.xml file).-->

当用户选择你的应用链接，标识被“Available On”按钮在细节屏幕，系统启动activity处理ACTION_VIEW（设置为android:searchSuggestIntentAction为"android.intent.action.VIEW"值在searchable.xml文件）。

<!--You can also set up a custom intent to launch your activity, and this is demonstrated in the Android Leanback sample app. Note that the sample app launches its own LeanbackDetailsFragment to show the details for the selected media, but you should launch the activity that plays the media immediately to save the user another click or two.-->

你也能设置用户intent去启动你的activity，并且那是被指派在安卓Leanback示例代码应用。注意示例应用启动它自己的LeanbackDetailsFragment去显示细节为选择的媒体，但是你应该启动activity去播放媒体立即去保存用户的另一次选择或两个。

----------------
[下一节: 使TV应用是可被搜索的](../in-app-search.html)