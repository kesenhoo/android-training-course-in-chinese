# 实现自适应UI流（Flows）

> 编写:[riverfeng](https://github.com/riverfeng) - 原文:<http://developer.android.com/training/multiscreen/adaptui.html>

根据当前你的应用显示的布局，它的UI流可能会不一样。比如，当你的应用是双窗格模式，点击左边窗格的条目（item）时，内容（content）显示在右边窗格中。如果是单窗格模式中，当你点击某个item的时候，内容则显示在一个新的activity中。

## 确定当前布局
由于每种布局的实现会略有差别，首先你可能要确定用户当前可见的布局是哪一个。比如，你可能想知道当前用户到底是处于“单窗格”的模式还是“双窗格”的模式。你可以通过检查指定的视图（view）是否存在和可见来实现：

```java
public class NewsReaderActivity extends FragmentActivity {
    boolean mIsDualPane;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_layout);

        View articleView = findViewById(R.id.article);
        mIsDualPane = articleView != null &&
                        articleView.getVisibility() == View.VISIBLE;
    }
}
```

> 注意：使用代码查询id为“article”的view是否可见比直接硬编码查询指定的布局更加的灵活。

另一个关于如何适配不同组件是否存在的例子，是在组件执行操作之前先检查它是否是可用的。比如，在News Reader示例中，有一个按钮点击后打开一个菜单，但是这个按钮仅仅只在Android3.0之后的版本中才能显示（因为这个功能被ActionBar代替，在API 11+中定义）。所以，在给这个按钮添加事件之间，你可以这样做：
```java
Button catButton = (Button) findViewById(R.id.categorybutton);
OnClickListener listener = /* create your listener here */;
if (catButton != null) {
    catButton.setOnClickListener(listener);
}
```

## 根据当前布局响应

一些操作会根据当前的布局产生不同的效果。比如，在News Reader示例中，当你点击标题（headlines）列表中的某一条headline时，如果你的UI是双窗格模式，内容会显示在右边的窗格中，如果你的UI是单窗格模式，会启动一个分开的Activity并显示：
```java
@Override
public void onHeadlineSelected(int index) {
    mArtIndex = index;
    if (mIsDualPane) {
        /* display article on the right pane */
        mArticleFragment.displayArticle(mCurrentCat.getArticle(index));
    } else {
        /* start a separate activity */
        Intent intent = new Intent(this, ArticleActivity.class);
        intent.putExtra("catIndex", mCatIndex);
        intent.putExtra("artIndex", index);
        startActivity(intent);
    }
}
```
同样，如果你的应用处于多窗格模式，那么它应该在导航栏中设置带有选项卡的action bar。而如果是单窗格模式，那么导航栏应该设置为spinner widget。所以，你的代码应该检查哪个方案是最合适的：
```java
final String CATEGORIES[] = { "Top Stories", "Politics", "Economy", "Technology" };

public void onCreate(Bundle savedInstanceState) {
    ....
    if (mIsDualPane) {
        /* use tabs for navigation */
        actionBar.setNavigationMode(android.app.ActionBar.NAVIGATION_MODE_TABS);
        int i;
        for (i = 0; i < CATEGORIES.length; i++) {
            actionBar.addTab(actionBar.newTab().setText(
                CATEGORIES[i]).setTabListener(handler));
        }
        actionBar.setSelectedNavigationItem(selTab);
    }
    else {
        /* use list navigation (spinner) */
        actionBar.setNavigationMode(android.app.ActionBar.NAVIGATION_MODE_LIST);
        SpinnerAdapter adap = new ArrayAdapter(this,
                R.layout.headline_item, CATEGORIES);
        actionBar.setListNavigationCallbacks(adap, handler);
    }
}
```

## 在其他Activity中复用Fragment

在多屏幕设计时经常出现的情况是：在一些屏幕配置上设计一个窗格，而在其他屏幕配置上启动一个独立的Activity。例如，在News Reader中，新闻内容文字在大屏幕上市显示在屏幕右边的方框中，而在小屏幕中，则是由单独的activity显示的。

像这样的情况，你就应该在不同的activity中使用同一个Fragment，以此来避免代码的重复，而达到代码复用的效果。比如，ArticleFragment在双窗格模式下是这样用的：
```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="fill_parent"
    android:layout_height="fill_parent"
    android:orientation="horizontal">
    <fragment android:id="@+id/headlines"
              android:layout_height="fill_parent"
              android:name="com.example.android.newsreader.HeadlinesFragment"
              android:layout_width="400dp"
              android:layout_marginRight="10dp"/>
    <fragment android:id="@+id/article"
              android:layout_height="fill_parent"
              android:name="com.example.android.newsreader.ArticleFragment"
              android:layout_width="fill_parent" />
</LinearLayout>
```
在小屏幕中，它又是如下方式被复用的（没有布局文件）：
```java
ArticleFragment frag = new ArticleFragment();
getSupportFragmentManager().beginTransaction().add(android.R.id.content, frag).commit();
```
当然，如果将这个fragment定义在XML布局文件中，也有同样的效果，但是在这个例子中，则没有必要，因为这个article fragment是这个activity的唯一组件。

当你在设计fragment的时候，非常重要的一点：不要为某个特定的activity设计耦合度高的fragment。通常的做法是，通过定义抽象接口，并在接口中定义需要与该fragment进行交互的activity的抽象方法，然后与该fragment进行交互的activity实现这些抽象接口方法。

例如，在News Reader中，HeadlinesFragment就很好的诠释了这一点：
```java
public class HeadlinesFragment extends ListFragment {
    ...
    OnHeadlineSelectedListener mHeadlineSelectedListener = null;

    /* Must be implemented by host activity */
    public interface OnHeadlineSelectedListener {
        public void onHeadlineSelected(int index);
    }
    ...

    public void setOnHeadlineSelectedListener(OnHeadlineSelectedListener listener) {
        mHeadlineSelectedListener = listener;
    }
}
```
然后，当用户选择了一个headline item之后，fragment将通知对应的activity指定监听事件（而不是通过硬编码的方式去通知）：
```java
public class HeadlinesFragment extends ListFragment {
    ...
    @Override
    public void onItemClick(AdapterView<?> parent,
                            View view, int position, long id) {
        if (null != mHeadlineSelectedListener) {
            mHeadlineSelectedListener.onHeadlineSelected(position);
        }
    }
    ...
}
```
这种技术在[支持平板与手持设备(Supporting Tablets and Handsets)](http://developer.android.com/guide/practices/tablets-and-handsets.html)有更加详细的介绍。

## 处理屏幕配置变化

如果使用的是单独的activity来实现你界面的不同部分，你需要注意的是，屏幕变化（如旋转变化）的时候，你也应该根据屏幕配置的变化来保持你的UI布局的一致性。

例如，在传统的Android3.0或以上版本的7寸平板上，News Reader示例在竖屏的时候使用独立的activity显示文章内容，而在横屏的时候，则使用两个窗格模式（即内容显示在右边的方框中）。
这也就意味着，当用户在竖屏模式下观看文章的时候，你需要检测屏幕是否变成了横屏，如果改变了，则结束当前activity并返回到主activity中，这样，content就能显示在双窗格模式布局中。
```java
public class ArticleActivity extends FragmentActivity {
    int mCatIndex, mArtIndex;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mCatIndex = getIntent().getExtras().getInt("catIndex", 0);
        mArtIndex = getIntent().getExtras().getInt("artIndex", 0);

        // If should be in two-pane mode, finish to return to main activity
        if (getResources().getBoolean(R.bool.has_two_panes)) {
            finish();
            return;
        }
        ...
}
```
