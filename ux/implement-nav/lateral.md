# 使用Tabs创建Swipe视图

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/implementing-navigation/lateral.html>

Swipe View提供在同级屏幕中的横向导航，例如通过横向划屏手势切换的tab(一种称作横向分页的模式)。这节课会教你如何使用swipe view创建一个tab layout实现在tab之间切换，或显示一个标题条替代tab。

>**Swipe View 设计**

> 在实现这些功能之前，你要先明白在[Designing Effective Navigation](http://developer.android.com/training/design-navigation/descendant-lateral.html), [Swipe Views](http://developer.android.com/design/patterns/swipe-views.html) design guide中的概念和建议

## 实现Swipe View

你可以使用[Support Library](http://developer.android.com/tools/support-library/index.html)中的[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)控件在你的app中创建swipe view。[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)是一个子视图在layout上相互独立的布局控件(layout widget)。

使用[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)来设置你的layout，要添加一个`<ViewPager>`元素到你的XML layout中。例如，在你的swipe view中如果每一个页面都会占用整个layout，那么你的layout应该是这样:

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.v4.view.ViewPager
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/pager"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

要插入每一个页面的子视图，你需要把这个layout与[PagerAdapter](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html)挂钩。有两种adapter(适配器)你可以用:

[FragmentPagerAdapter](http://developer.android.com/reference/android/support/v4/app/FragmentPagerAdapter.html)

在同级屏幕(sibling screen)只有少量的几个固定页面时，使用这个最好。

[FragmentStatePagerAdapter](http://developer.android.com/reference/android/support/v4/app/FragmentStatePagerAdapter.html)

当根据对象集的数量来划分页面，即一开始页面的数量未确定时，使用这个最好。当用户切换到其他页面时，fragment会被销毁来降低内存消耗。

例如，这里的代码是当你使用[FragmentStatePagerAdapter](http://developer.android.com/reference/android/support/v4/app/FragmentStatePagerAdapter.html)来在[Fragment](http://developer.android.com/reference/android/app/Fragment.html)对象集合中进行横屏切换:

```java
public class CollectionDemoActivity extends FragmentActivity {
    // 当被请求时, 这个adapter会返回一个DemoObjectFragment,
    // 代表在对象集中的一个对象.
    DemoCollectionPagerAdapter mDemoCollectionPagerAdapter;
    ViewPager mViewPager;

    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_collection_demo);

        // ViewPager和他的adapter使用了support library
        // fragments,所以要用getSupportFragmentManager.
        mDemoCollectionPagerAdapter =
                new DemoCollectionPagerAdapter(
                        getSupportFragmentManager());
        mViewPager = (ViewPager) findViewById(R.id.pager);
        mViewPager.setAdapter(mDemoCollectionPagerAdapter);
    }
}

// 因为这是一个对象集所以使用FragmentStatePagerAdapter,
// 而不是FragmentPagerAdapter.
public class DemoCollectionPagerAdapter extends FragmentStatePagerAdapter {
    public DemoCollectionPagerAdapter(FragmentManager fm) {
        super(fm);
    }

    @Override
    public Fragment getItem(int i) {
        Fragment fragment = new DemoObjectFragment();
        Bundle args = new Bundle();
        // 我们的对象只是一个整数 :-P
        args.putInt(DemoObjectFragment.ARG_OBJECT, i + 1);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public int getCount() {
        return 100;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        return "OBJECT " + (position + 1);
    }
}

// 这个类的实例是一个代表了数据集中一个对象的fragment
public static class DemoObjectFragment extends Fragment {
    public static final String ARG_OBJECT = "object";

    @Override
    public View onCreateView(LayoutInflater inflater,
            ViewGroup container, Bundle savedInstanceState) {
        // 最后两个参数保证LayoutParam能被正确填充
        View rootView = inflater.inflate(
                R.layout.fragment_collection_object, container, false);
        Bundle args = getArguments();
        ((TextView) rootView.findViewById(android.R.id.text1)).setText(
                Integer.toString(args.getInt(ARG_OBJECT)));
        return rootView;
    }
}
```

这个例子只显示了创建swipe view的必要代码。下面一节向你说明如何通过添加tab使导航更方便在页面间切换。

## 添加Tab到Action Bar

Action bar [tab](http://developer.android.com/design/building-blocks/tabs.html)能给用户提供更熟悉的界面来在app的同级屏幕中切换和分辨。

使用[ActionBar](http://developer.android.com/reference/android/app/ActionBar.html)来创建tab，你需要启用[NAVIGATION_MODE_TABS](http://developer.android.com/reference/android/app/ActionBar.html#NAVIGATION_MODE_TABS)，然后创建几个[ActionBar.Tab](http://developer.android.com/reference/android/app/ActionBar.Tab.html)的实例，并对每个实例实现[ActionBar.TabListener](http://developer.android.com/reference/android/app/ActionBar.TabListener.html)接口。例如在你的activity的[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate%28android.os.Bundle%29)方法中，你可以使用与下面相似的代码:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    final ActionBar actionBar = getActionBar();
    ...

    // 指定在action bar中显示tab.
    actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);

    // 创建一个tab listener，在用户切换tab时调用.
    ActionBar.TabListener tabListener = new ActionBar.TabListener() {
        public void onTabSelected(ActionBar.Tab tab, FragmentTransaction ft) {
            // 显示指定的tab
        }

        public void onTabUnselected(ActionBar.Tab tab, FragmentTransaction ft) {
            // 隐藏指定的tab
        }

        public void onTabReselected(ActionBar.Tab tab, FragmentTransaction ft) {
            // 可以忽略这个事件
        }
    };

    // 添加3个tab, 并指定tab的文字和TabListener
    for (int i = 0; i < 3; i++) {
        actionBar.addTab(
                actionBar.newTab()
                        .setText("Tab " + (i + 1))
                        .setTabListener(tabListener));
    }
}
```

根据你如何创建你的内容来处理[ActionBar.TabListener](http://developer.android.com/reference/android/app/ActionBar.TabListener.html)回调改变tab。但是如果你是像上面那样，通过[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)对每个tab使用fragment，下面这节就会说明当用户选择一个tab时如何切换页面，当用户划屏切换页面时如何更新相应页面的tab。

## 使用Swipe View切换Tab

当用户选择tab时，在[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)中切换页面，需要实现[ActionBar.TabListener](http://developer.android.com/reference/android/app/ActionBar.TabListener.html)来调用在[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)中的[setCurrentItem()]()来选择相应的页面:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    ...

    // Create a tab listener that is called when the user changes tabs.
    ActionBar.TabListener tabListener = new ActionBar.TabListener() {
        public void onTabSelected(ActionBar.Tab tab, FragmentTransaction ft) {
            // 当tab被选中时, 切换到ViewPager中相应的页面.
            mViewPager.setCurrentItem(tab.getPosition());
        }
        ...
    };
}
```

同样的，当用户通过触屏手势(touch gesture)切换页面时，你也应该选择相应的tab。你可以通过实现[ViewPager.OnPageChangeListener](http://developer.android.com/reference/android/support/v4/view/ViewPager.OnPageChangeListener.html)接口来设置这个操作，当页面变化时当前的tab也相应变化。例如:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    ...

    mViewPager = (ViewPager) findViewById(R.id.pager);
    mViewPager.setOnPageChangeListener(
            new ViewPager.SimpleOnPageChangeListener() {
                @Override
                public void onPageSelected(int position) {
                    // 当划屏切换页面时，选择相应的tab.
                    getActionBar().setSelectedNavigationItem(position);
                }
            });
    ...
}
```

## 使用标题栏替代Tab

如果你不想使用action bar tab，而想使用[scrollable tabs](http://developer.android.com/design/building-blocks/tabs.html#scrollable)来提供一个更简短的可视化配置，你可以在swipe view中使用[PagerTitleStrip](http://developer.android.com/reference/android/support/v4/view/PagerTitleStrip.html)。

下面是一个内容为[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)，有一个[PagerTitleStrip](http://developer.android.com/reference/android/support/v4/view/PagerTitleStrip.html)顶端对齐的activity的layout XML文件示例。单个页面(adapter提供)占据[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)中的剩余空间。

```xml
<android.support.v4.view.ViewPager
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/pager"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <android.support.v4.view.PagerTitleStrip
        android:id="@+id/pager_title_strip"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="top"
        android:background="#33b5e5"
        android:textColor="#fff"
        android:paddingTop="4dp"
        android:paddingBottom="4dp" />

</android.support.v4.view.ViewPager>
```
