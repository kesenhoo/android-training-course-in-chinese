# 实现可适应的UI流程

> 编写:[riverfeng](https://github.com/riverfeng) - 原文:

在你应用已经可以显示UI的基础上，UI的流程可能会不一样。比如，当你的应用在有两个方框的模式中，点击左边方框的item时，内容显示在右边方框中。如果是在只有一个方框的模式中，当你点击某个item的时候，内容则显示在一个新的activity中。

## 确定当前布局
当你在实现不同布局的时候，首先，你应该确定用户在当前的情况下看到的view应该是个什么样子。比如，你可能想知道当前用户到底是处于“单个方框”的模式还是“多个方框”的模式。这个时候，你就可以通过查询指定的view是不是存在并是否显示来判断当前的模式：

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

注意：使用代码查询id为“article”的view是否可见比直接硬编码查询指定的布局更加的灵活。

另一个关于如何适配已经存在的不同组件的例子是在组件执行操作之前先检查它是否是可用的。比如，在News Reader示例中，有一个按钮点击后打开一个菜单，但是这个按钮仅仅只在Android3.0之后的版本中才能显示（因为这个函数是在API 11中ActionBar中才能有的）。所以，在给这个按钮添加事件之间，你可以这样做：
```java
Button catButton = (Button) findViewById(R.id.categorybutton);
OnClickListener listener = /* create your listener here */;
if (catButton != null) {
    catButton.setOnClickListener(listener);
}
```

## 根据当前布局响应

根据当前不同的布局有一些操作肯定会带来不一样的结果。比如，在News Reader示例中，当你点击headlines列表中的某一条headline时，如果你的UI是在多个方框模式中，内容会显示在右边的方框中，如果你的UI是在单个方框模式中，内容则会显示在一个新的独立的Activity中：
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
同样，如果你的应用程序时多个方框的模式，那么它应该在导航栏中设置带有选项卡的action bar。而如果是单框模式，那么导航栏应该设置为spinner widget。所以，你的代码应该检查哪个方案是最合适的：
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

在设计为多屏幕适配的UI时有一个复用的原则：将你的界面变为单独部分，这样它能在某些屏幕配置上被实现为一个方框，而在其他屏幕配置中，则被实现为一个单独的activity。例如，在News Reader中，新闻内容文字在大屏幕上市显示在屏幕右边的方框中，而在小屏幕中，则是由单独的activity显示的。

像这样的情况，你就应该在不同的activity中使用同一个Fragment，以此来避免代码的重复，而达到代码复用的效果。比如，ArticleFragment在多个方框模式下是这样用的：
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

当你在设计fragment的时候，有一个非常重要的知识点：不要为某个特定的activity设计耦合度高的fragment。通常的做法是，通过定义抽象接口，并在接口中定义需要与该fragment进行交互的activity的抽象方法，然后与该fragment进行交互的activity实现这些抽象接口方法的具体方法。

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
这种技术在[支持平板与手持设备(Supporting Tablets and Handsets)](file:///F:/Android_training/android-docs/guide/practices/tablets-and-handsets.html)有更加详细的介绍。

## 处理屏幕配置变化

如果使用的是单独的activity来实现你界面的不同部分，你需要注意的是，屏幕变化（如旋转变化）的时候，你也应该根据屏幕配置的变化来改变你UI的变化。

例如，在传统的Android3.0或以上版本的7寸平板上，News Reader示例在竖屏的时候使用独立的activity显示文章内容，而在横屏的时候，则使用两个方框的模式（即内容显示在右边的方框中）。
这也就意味着，当用户在竖屏模式下观看文章的时候，你需要检测屏幕是否被改变为了横屏，如果改变了，则结束当前activity并返回到主activity中，这样，UI就能显示为两个方框的模式了。
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
