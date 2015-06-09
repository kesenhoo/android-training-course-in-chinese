# 创建目录浏览器

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/tv/playback/browse.html>

在TV上运行的 多媒体应用得允许用户浏览,选择和播放它所提供的内容。目录浏览器的用户体验要简单和直观，以及赏心悦目，引人入胜。

这节课讨论如何使用的[V17 Leanback](http://developer.android.com/tools/support-library/features.html#v17-leanback)库提供的类来实现用户界面，用于从您的应用程序的媒体目录浏览音乐或视频。

##创建一个目录布局

leanback 类库中的[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)允许您用最少的代码创建一个用于按行浏览的主布局 ,下面的例子将演示如何创建包含[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)的布局

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:orientation="vertical"
  >

  <fragment
      android:name="android.support.v17.leanback.app.BrowseFragment"
      android:id="@+id/browse_fragment"
      android:layout_width="match_parent"
      android:layout_height="match_parent"
      />
</LinearLayout>
```

为了使 activity 工作,需要在布局中取回[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)的元素。使用这个类中的方法设置显示参数,如图标,标题,以及该类别是否可用。下面的代码简单的演示了怎样设置[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)布局参数:

```xml
public class BrowseMediaActivity extends Activity {

    public static final String TAG ="BrowseActivity";

    protected BrowseFragment mBrowseFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.browse_fragment);

        final FragmentManager fragmentManager = getFragmentManager();
        mBrowseFragment = (BrowseFragment) fragmentManager.findFragmentById(
                R.id.browse_fragment);

        // Set display parameters for the BrowseFragment
        mBrowseFragment.setHeadersState(BrowseFragment.HEADERS_ENABLED);
        mBrowseFragment.setTitle(getString(R.string.app_name));
        mBrowseFragment.setBadgeDrawable(getResources().getDrawable(
                R.drawable.ic_launcher));
        mBrowseFragment.setBrowseParams(params);

    }
}
```

##显示媒体列表

[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)允许您定义和使用 adapter 和presenter 定义显示可浏览媒体内容类别和媒体项目。Adapters 允许我们连接本地或网络数据资源。Presenters操控的媒体项目的数据，并提供布局信息在屏幕上显示的项目。

下面的示例代码演示了一个为显示字符串数据的Presenters的实现

```xml
public class StringPresenter extends Presenter {
    private static final String TAG = "StringPresenter";

    public ViewHolder onCreateViewHolder(ViewGroup parent) {
        TextView textView = new TextView(parent.getContext());
        textView.setFocusable(true);
        textView.setFocusableInTouchMode(true);
        textView.setBackground(
                parent.getContext().getResources().getDrawable(R.drawable.text_bg));
        return new ViewHolder(textView);
    }

    public void onBindViewHolder(ViewHolder viewHolder, Object item) {
        ((TextView) viewHolder.view).setText(item.toString());
    }

    public void onUnbindViewHolder(ViewHolder viewHolder) {
        // no op
    }
}
```

当我们已经为我们的媒体项目构建了一个Presenter类，我们可以为[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)建立并添加一个适配器并在屏幕上显示这些媒体项目。下面的示例代码演示了如何用StringPresenter类构造一个类别和项目适配器：

```xml
private ArrayObjectAdapter mRowsAdapter;
private static final int NUM_ROWS = 4;

@Override
protected void onCreate(Bundle savedInstanceState) {
    ...

    buildRowsAdapter();
}

private void buildRowsAdapter() {
    mRowsAdapter = new ArrayObjectAdapter(new ListRowPresenter());

    for (int i = 0; i < NUM_ROWS; ++i) {
        ArrayObjectAdapter listRowAdapter = new ArrayObjectAdapter(
                new StringPresenter());
        listRowAdapter.add("Media Item 1");
        listRowAdapter.add("Media Item 2");
        listRowAdapter.add("Media Item 3");
        HeaderItem header = new HeaderItem(i, "Category " + i, null);
        mRowsAdapter.add(new ListRow(header, listRowAdapter));
    }

    mBrowseFragment.setAdapter(mRowsAdapter);
}
```

这个例子显示了静态实现适配器。典型的媒体浏览器使用网络数据库或网络服务。使用从网络取回的数据做的媒体浏览器,参看例子[Android TV](https://github.com/googlesamples/androidtv-leanback)

##更新背景

为了给媒体浏览应用增加视觉趣味，我们可以在用户浏览的内容时更新背景图片。这种技术可以让我们的应用程序的互动感倍增。

Leanback库提供了[BackgroundManager](http://developer.android.com/reference/android/support/v17/leanback/app/BackgroundManager.html)类为我们的TV应用的activity更换背景。下面的例子演示了如何创建一个简单的方法更换背景:

```xml
protected void updateBackground(Drawable drawable) {
    BackgroundManager.getInstance(this).setDrawable(drawable);
}
```

许多现有的媒体浏览应用在用户浏览媒体列表自动更新的背景。为了做到这一点，我们可以设置一个选择监听器，根据用户的当前选择自动更新背景。下面的例子演示了如何建立一个[OnItemViewSelectedListener](http://developer.android.com/reference/android/support/v17/leanback/widget/OnItemViewSelectedListener.html)监听选择事件并更新背景：

```xml
protected void clearBackground() {
    BackgroundManager.getInstance(this).setDrawable(mDefaultBackground);
}

protected OnItemViewSelectedListener getDefaultItemViewSelectedListener() {
    return new OnItemViewSelectedListener() {
        @Override
        public void onItemSelected(Object item, Row row) {
            if (item instanceof Movie ) {
                URI uri = ((Movie)item).getBackdropURI();
                updateBackground(uri);
            } else {
                clearBackground();
            }
        }
    };
}
```

> **注意**:以上的示例是为了简单。当我们在自己的应用程序创建这个功能，我们应该考虑运行在一个单独的线程在后台更新操作获得更好的性能。此外，如果我们正计划在用户触发项目滚动时更新背景，考虑增加一个时延，直到用户停止操作时再更新背景图像。这样可以避免过多的背景图片的更新。

------------
[下一节：提供一个卡片View >](card.html)