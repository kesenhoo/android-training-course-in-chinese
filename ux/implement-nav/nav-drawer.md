# 创建抽屉式导航(navigation drawer)

> 编写:[Lin-H](https://github.com/Lin-H) - 原文: <http://developer.android.com/training/implementing-navigation/nav-drawer.html>

Navigation drawer是一个在屏幕左侧边缘显示导航选项的面板。大部分时候是隐藏的，当用户从屏幕左侧划屏，或在top level模式的app中点击action bar中的app图标时，才会显示。

这节课叙述如何使用[Support Library](http://developer.android.com/tools/support-library/index.html)中的[DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html) API，来实现navigation drawer。

> **Navigation Drawer 设计**：在你决定在你的app中使用Navigation Drawer之前，你应该先理解在[Navigation Drawer](http://developer.android.com/design/patterns/navigation-drawer.html) design guide中定义的使用情况和设计准则。

## 创建一个Drawer Layout

要添加一个navigation drawer，在你的用户界面layout中声明一个用作root view(根视图)的[DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html)对象。在[DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html)中为屏幕添加一个包含主要内容的view(当drawer隐藏时的主layout)，和其他一些包含navigation drawer内容的view。

例如，下面的layout使用了有两个子视图(child view)的[DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html):一个[FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html)用来包含主要内容(在运行时被[Fragment](http://developer.android.com/reference/android/app/Fragment.html)填入)，和一个navigation drawer使用的[ListView](http://developer.android.com/reference/android/widget/ListView.html)。

```xml
<android.support.v4.widget.DrawerLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/drawer_layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <!-- 包含主要内容的 view -->
    <FrameLayout
        android:id="@+id/content_frame"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
    <!-- navigation drawer(抽屉式导航) -->
    <ListView android:id="@+id/left_drawer"
        android:layout_width="240dp"
        android:layout_height="match_parent"
        android:layout_gravity="start"
        android:choiceMode="singleChoice"
        android:divider="@android:color/transparent"
        android:dividerHeight="0dp"
        android:background="#111"/>
</android.support.v4.widget.DrawerLayout>
```

这个layout展示了一些layout的重要特点:

* 主内容view(上面的[FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html))，在[DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html)中**必须是第一个子视图**，因为XML的顺序代表着Z轴(垂直于手机屏幕)的顺序，并且drawer必须在内容的前端。

* 主内容view被设置为匹配父视图的宽和高，因为当navigation drawer隐藏时，主内容表示整个UI部分。

* drawer视图([ListView](http://developer.android.com/reference/android/widget/ListView.html))必须使用`android:layout_gravity`属性**指定它的horizontal gravity**。为了支持从右边阅读的语言(right-to-left(RTL) language)，指定它的值为`"start"`而不是`"left"`(当layout是RTL时drawer在右边显示)。

* drawer视图以`dp`为单位指定它的宽和高来匹配父视图。drawer的宽度不能大于320dp，这样用户总能看到部分主内容。

## 初始化Drawer List

在你的activity中，首先要做的事就是要初始化drawer的item列表。这要根据你的app内容来处理，但是一个navigation drawer通常由一个[ListView](http://developer.android.com/reference/android/widget/ListView.html)组成，所以列表应该通过一个[Adapter](http://developer.android.com/reference/android/widget/Adapter.html)(例如[ArrayAdapter](http://developer.android.com/reference/android/widget/ArrayAdapter.html)或[SimpleCursorAdapter](http://developer.android.com/reference/android/widget/SimpleCursorAdapter.html))填入。

例如，如何使用一个字符串数组([string array](http://developer.android.com/guide/topics/resources/string-resource.html#StringArray))来初始化导航列表(navigation list):

```java
public class MainActivity extends Activity {
    private String[] mPlanetTitles;
    private DrawerLayout mDrawerLayout;
    private ListView mDrawerList;
    ...

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mPlanetTitles = getResources().getStringArray(R.array.planets_array);
        mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        mDrawerList = (ListView) findViewById(R.id.left_drawer);

        // 为list view设置adapter
        mDrawerList.setAdapter(new ArrayAdapter<String>(this,
                R.layout.drawer_list_item, mPlanetTitles));
        // 为list设置click listener
        mDrawerList.setOnItemClickListener(new DrawerItemClickListener());

        ...
    }
}
```

这段代码也调用了[setOnItemClickListener()](http://developer.android.com/reference/android/widget/AdapterView.html#setOnItemClickListener%28android.widget.AdapterView.OnItemClickListener%29)来接收navigation drawer列表的点击事件。下一节会说明如何实现这个接口，并且当用户选择一个item时如何改变内容视图(content view)。

## 处理导航的点击事件

当用户选择drawer列表中的item，系统会调用在[setOnItemClickListener()](http://developer.android.com/reference/android/widget/AdapterView.html#setOnItemClickListener%28android.widget.AdapterView.OnItemClickListener%29)中所设置的[OnItemClickListener](http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html)的[onItemClick()](http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html#onItemClick%28android.widget.AdapterView%3C?%3E,%20android.view.View,%20int,%20long%29)。

在[onItemClick()](http://developer.android.com/reference/android/widget/AdapterView.OnItemClickListener.html#onItemClick%28android.widget.AdapterView%3C?%3E,%20android.view.View,%20int,%20long%29)方法中做什么，取决于你如何实现你的app结构([app structure](http://developer.android.com/design/patterns/app-structure.html))。在下面的例子中，每选择一个列表中的item，就插入一个不同的[Fragment](http://developer.android.com/reference/android/app/Fragment.html)到主内容视图中([FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html)元素通过`R.id.content_frame` ID辨识):

```java
private class DrawerItemClickListener implements ListView.OnItemClickListener {
    @Override
    public void onItemClick(AdapterView parent, View view, int position, long id) {
        selectItem(position);
    }
}

/** 在主内容视图中交换fragment */
private void selectItem(int position) {
    // 创建一个新的fragment并且根据行星的位置来显示
    Fragment fragment = new PlanetFragment();
    Bundle args = new Bundle();
    args.putInt(PlanetFragment.ARG_PLANET_NUMBER, position);
    fragment.setArguments(args);

    // 通过替换已存在的fragment来插入新的fragment
    FragmentManager fragmentManager = getFragmentManager();
    fragmentManager.beginTransaction()
                   .replace(R.id.content_frame, fragment)
                   .commit();

    // 高亮被选择的item, 更新标题, 并关闭drawer
    mDrawerList.setItemChecked(position, true);
    setTitle(mPlanetTitles[position]);
    mDrawerLayout.closeDrawer(mDrawerList);
}

@Override
public void setTitle(CharSequence title) {
    mTitle = title;
    getActionBar().setTitle(mTitle);
}

```

## 监听打开和关闭事件

要监听drawer的打开和关闭事件，在你的[DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html)中调用[setDrawerListener()](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html#setDrawerListener%28android.support.v4.widget.DrawerLayout.DrawerListener%29)，并传入一个[DrawerLayout.DrawerListener](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.DrawerListener.html)的实现。这个接口提供drawer事件的回调例如[onDrawerOpened()](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.DrawerListener.html#onDrawerOpened%28android.view.View%29)和[onDrawerClosed()](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.DrawerListener.html#onDrawerClosed%28android.view.View%29)。

但是，如果你的activity包含有[action bar](http://developer.android.com/guide/topics/ui/actionbar.html)可以不用实现[DrawerLayout.DrawerListener](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.DrawerListener.html)，你可以继承[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)来替代。[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)实现了[DrawerLayout.DrawerListener](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.DrawerListener.html)，所以你仍然可以重写这些回调。这么做也能使action bar图标和 navigation drawer的交互操作变得更容易(在下节详述)。

如[Navigation Drawer](http://developer.android.com/design/patterns/navigation-drawer.html) design guide中所述,当drawer可见时，你应该修改action bar的内容，比如改变标题和移除与主文字内容相关的action item。下面的代码向你说明如何通过[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)类的实例，重写[DrawerLayout.DrawerListener](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.DrawerListener.html)的回调方法来实现这个目的:

```java
public class MainActivity extends Activity {
    private DrawerLayout mDrawerLayout;
    private ActionBarDrawerToggle mDrawerToggle;
    private CharSequence mDrawerTitle;
    private CharSequence mTitle;
    ...

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ...

        mTitle = mDrawerTitle = getTitle();
        mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        mDrawerToggle = new ActionBarDrawerToggle(this, mDrawerLayout,
                R.drawable.ic_drawer, R.string.drawer_open, R.string.drawer_close) {

            /** 当drawer处于完全关闭的状态时调用 */
            public void onDrawerClosed(View view) {
                super.onDrawerClosed(view);
                getActionBar().setTitle(mTitle);
                invalidateOptionsMenu(); // 创建对onPrepareOptionsMenu()的调用
            }

            /** 当drawer处于完全打开的状态时调用 */
            public void onDrawerOpened(View drawerView) {
                super.onDrawerOpened(drawerView);
                getActionBar().setTitle(mDrawerTitle);
                invalidateOptionsMenu(); // 创建对onPrepareOptionsMenu()的调用
            }
        };

        // 设置drawer触发器为DrawerListener
        mDrawerLayout.setDrawerListener(mDrawerToggle);
    }

    /* 当invalidateOptionsMenu()调用时调用 */
    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        // 如果nav drawer是打开的, 隐藏与内容视图相关联的action items
        boolean drawerOpen = mDrawerLayout.isDrawerOpen(mDrawerList);
        menu.findItem(R.id.action_websearch).setVisible(!drawerOpen);
        return super.onPrepareOptionsMenu(menu);
    }
}
```

下一节会描述[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)的构造参数，和处理与action bar图标交互所需的其他步骤。

## 使用App图标来打开和关闭

用户可以在屏幕左侧使用划屏手势来打开和关闭navigation drawer，但是如果你使用[action bar](http://developer.android.com/guide/topics/ui/actionbar.html),你也应该允许用户通过点击app图标来打开或关闭。并且app图标也应该使用一个特殊的图标来指明navigation drawer的存在。你可以通过使用上一节所说的[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)来实现所有的这些操作。

要使[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)起作用，通过它的构造函数创建一个实例，需要用到以下参数:

* [Activity](http://developer.android.com/reference/android/app/Activity.html)用来容纳drawer。

* [DrawerLayout](http://developer.android.com/reference/android/support/v4/widget/DrawerLayout.html)。

* 一个drawable资源用作drawer指示器。
  标准的navigation drawer可以在[Download the Action Bar Icon Pack](http://developer.android.com/downloads/design/Android_Design_Icons_20130926.zip)获的

* 一个字符串资源描述"打开抽屉"操作(便于访问)

* 一个字符串资源描述"关闭抽屉"操作(便于访问)

那么，不论你是否创建了用作drawer监听器的[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)的子类，你都需要在activity生命周期中的某些地方根据你的[ActionBarDrawerToggle](http://developer.android.com/reference/android/support/v4/app/ActionBarDrawerToggle.html)来调用。

```java
public class MainActivity extends Activity {
    private DrawerLayout mDrawerLayout;
    private ActionBarDrawerToggle mDrawerToggle;
    ...

    public void onCreate(Bundle savedInstanceState) {
        ...

        mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        mDrawerToggle = new ActionBarDrawerToggle(
                this,                  /* 承载 Activity */
                mDrawerLayout,         /* DrawerLayout 对象 */
                R.drawable.ic_drawer,  /* nav drawer 图标用来替换'Up'符号 */
                R.string.drawer_open,  /* "打开 drawer" 描述 */
                R.string.drawer_close  /* "关闭 drawer" 描述 */
                ) {

            /** 当drawer处于完全关闭的状态时调用 */
            public void onDrawerClosed(View view) {
                super.onDrawerClosed(view);
                getActionBar().setTitle(mTitle);
            }

            /** 当drawer处于完全打开的状态时调用 */
            public void onDrawerOpened(View drawerView) {
                super.onDrawerOpened(drawerView);
                getActionBar().setTitle(mDrawerTitle);
            }
        };

        // 设置drawer触发器为DrawerListener
        mDrawerLayout.setDrawerListener(mDrawerToggle);

        getActionBar().setDisplayHomeAsUpEnabled(true);
        getActionBar().setHomeButtonEnabled(true);
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        // 在onRestoreInstanceState发生后，同步触发器状态.
        mDrawerToggle.syncState();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        mDrawerToggle.onConfigurationChanged(newConfig);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // 将事件传递给ActionBarDrawerToggle, 如果返回true，表示app 图标点击事件已经被处理
        if (mDrawerToggle.onOptionsItemSelected(item)) {
          return true;
        }
        // 处理你的其他action bar items...

        return super.onOptionsItemSelected(item);
    }

    ...
}
```

一个完整的navigation drawer例子,可以在原文页面顶端的sample下载
