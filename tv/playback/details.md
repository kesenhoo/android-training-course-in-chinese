# 创建详情页

编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/tv/playback/details.html>

待认领进行编写，有意向的小伙伴，可以直接修改对应的markdown文件，进行提交！

[ v17 leanback support library ](http://developer.android.com/tools/support-library/features.html#v17-leanback)库提供的媒体浏览接口包含显示附加媒体信息的类,比如描述和预览,以及对项目的操作,比如购买或播放。


这节课讨论如何为媒体项目的详细信息创建 presenter 类，以及用户选择一个媒体项目时如何扩展[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html)类来实现显示媒体详细信息视图。

> **小贴士:** 这里的实现例子用的是包含[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html)的附加activity。但也可以在同一个 activity 中用 fragment 转换将[ BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)替换为[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html).更多关于fragment的信息请参考[Building a Dynamic UI with Fragments](http://developer.android.com/training/basics/fragments/fragment-ui.html#Replace)

##创建详细Presenter

在leanback库提供的媒体浏览框架中,可以用presenter对象控制屏幕显示数据,包括媒体详细信息。[AbstractDetailsDescriptionPresenter ](http://developer.android.com/reference/android/support/v17/leanback/widget/AbstractDetailsDescriptionPresenter.html)类提供的框架几乎是媒体项目详细信息的完全继承。我们只需要实现[onBindDescription()]()方法,像下面这样把数据信息和视图绑定起来。

```xml
public class DetailsDescriptionPresenter
        extends AbstractDetailsDescriptionPresenter {

    @Override
    protected void onBindDescription(ViewHolder viewHolder, Object itemData) {
        MyMediaItemDetails details = (MyMediaItemDetails) itemData;
        // In a production app, the itemData object contains the information
        // needed to display details for the media item:
        // viewHolder.getTitle().setText(details.getShortTitle());

        // Here we provide static data for testing purposes:
        viewHolder.getTitle().setText(itemData.toString());
        viewHolder.getSubtitle().setText("2014   Drama   TV-14");
        viewHolder.getBody().setText("Lorem ipsum dolor sit amet, consectetur "
                + "adipisicing elit, sed do eiusmod tempor incididunt ut labore "
                + " et dolore magna aliqua. Ut enim ad minim veniam, quis "
                + "nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                + "commodo consequat.");
    }
}
```

##扩展详细fragment

当使用[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html)类显示我们的媒体项目详细信息时,扩展该类并提供像预览图片,操作等附加内容。我们也可以提供一系列的相关媒体信息。

下面的例子演示了怎样用presenter类为媒体项目添加预览图片和操作。这个例子也演示了添加相关媒体行。

```xml
public class MediaItemDetailsFragment extends DetailsFragment {
    private static final String TAG = "MediaItemDetailsFragment";
    private ArrayObjectAdapter mRowsAdapter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.i(TAG, "onCreate");
        super.onCreate(savedInstanceState);

        buildDetails();
    }

    private void buildDetails() {
        ClassPresenterSelector selector = new ClassPresenterSelector();
        // Attach your media item details presenter to the row presenter:
        DetailsOverviewRowPresenter rowPresenter =
            new DetailsOverviewRowPresenter(new DetailsDescriptionPresenter());

        selector.addClassPresenter(DetailsOverviewRow.class, rowPresenter);
        selector.addClassPresenter(ListRow.class,
                new ListRowPresenter());
        mRowsAdapter = new ArrayObjectAdapter(selector);

        Resources res = getActivity().getResources();
        DetailsOverviewRow detailsOverview = new DetailsOverviewRow(
                "Media Item Details");

        // Add images and action buttons to the details view
        detailsOverview.setImageDrawable(res.getDrawable(R.drawable.jelly_beans));
        detailsOverview.addAction(new Action(1, "Buy $9.99"));
        detailsOverview.addAction(new Action(2, "Rent $2.99"));
        mRowsAdapter.add(detailsOverview);

        // Add a Related items row
        ArrayObjectAdapter listRowAdapter = new ArrayObjectAdapter(
                new StringPresenter());
        listRowAdapter.add("Media Item 1");
        listRowAdapter.add("Media Item 2");
        listRowAdapter.add("Media Item 3");
        HeaderItem header = new HeaderItem(0, "Related Items", null);
        mRowsAdapter.add(new ListRow(header, listRowAdapter));

        setAdapter(mRowsAdapter);
    }
}
```

##创建详细信息activity

像[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html)这样的 fragment 为了使用或显示必须包含activity。为我们的详细信息与浏览分开创建activity并通过传递Intent打开。这节演示了如何创建一个包含媒体详细信息的activity。

创建详细信息前先为[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html)创建一个布局文件:

```xml
<!-- file: res/layout/details.xml -->

<fragment xmlns:android="http://schemas.android.com/apk/res/android"
    android:name="com.example.android.mediabrowser.MediaItemDetailsFragment"
    android:id="@+id/details_fragment"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
/>
```

接下来用上面的布局文件创建一个activity:

```xml
public class DetailsActivity extends Activity
{
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.details);
    }
}
```

最后在manifest文件中申明activity。记得添加Leanback主题以确保用户界面中有媒体浏览activity。

```xml
<application>
  ...

  <activity android:name=".DetailsActivity"
    android:exported="true"
    android:theme="@style/Theme.Leanback"/>

</application>
```

##为点击项目添加Listener

实现[ DetailsFragment](http://developer.android.com/reference/android/support/v17/leanback/app/DetailsFragment.html)后,在用户点击媒体条目时将我们的媒体浏览view切换详细信息view。为了确保动作的实现,在[BrowserFragment]()中添加[OnItemViewClickedListener]通过Intent开启详细信息activity。


下面的例子演示了实现怎样在媒体浏览view中实现一个 listener开启详细信息view。

```xml
public class BrowseMediaActivity extends Activity {
    ...

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...

        // create the media item rows
        buildRowsAdapter();

        // add a listener for selected items
        mBrowseFragment.OnItemViewClickedListener(
            new OnItemViewClickedListener() {
                @Override
                public void onItemClicked(Object item, Row row) {
                    System.out.println("Media Item clicked: " + item.toString());
                    Intent intent = new Intent(BrowseMediaActivity.this,
                            DetailsActivity.class);
                    // pass the item information
                    intent.getExtras().putLong("id", item.getId());
                    startActivity(intent);
                }
            });
    }
}
```

-----------
[下一节：显示正在播放卡片 >](now-playing.html)