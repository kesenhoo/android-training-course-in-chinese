# 使用ViewPager实现屏幕滑动

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/animation/screen-slide.html>

屏幕划动是在两个完整界面间的转换，它在一些UI中很常见，比如设置向导和幻灯放映。这节课将告诉你怎样通过[support library](http://developer.android.com/tools/support-library/index.html)提供的[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)实现屏幕滑动。[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)能自动实现屏幕滑动动画。下面展示了从一个内容界面到一下界面的屏幕滑动转换是什么样子的。

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_screenslide.mp4" type="video/mp4">
    <source src="anim_screenslide.webm" type="video/webm">
    <source src="anim_screenslide.ogv" type="video/ogg">
</video>

</div>

如果你想直接查看整个例子，[下载](http://developer.android.com/shareables/training/Animations.zip)并运行App样例然后选择屏幕滑动例子。查看下列文件中的代码实现：

* `src/ScreenSlidePageFragment.java`
* `src/ScreenSlideActivity.java`
* `layout/activity_screen_slide.xml`
* `layout/fragment_screen_slide_page.xml`

##创建View

创建Fragment所使用的布局文件。下面的例子包含一个显示文本的TextView：

```xml
<!-- fragment_screen_slide_page.xml -->
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/content"
    android:layout_width="match_parent"
    android:layout_height="match_parent" >

    <TextView style="?android:textAppearanceMedium"
        android:padding="16dp"
        android:lineSpacingMultiplier="1.2"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/lorem_ipsum" />
</ScrollView>
```

与此同时我们还定义了一个字符串作为该Fragment的内容。

## 创建Fragment

创建一个 [`Fragment`](http://developer.android.com/reference/android/support/v4/app/Fragment.html) 子类，它从<a href="http://developer.android.com/reference/android/app/Fragment.html#onCreateView(android.view.LayoutInflater, android.view.ViewGroup, android.os.Bundle)"> `onCreateView()` </a>方法中返回之前创建的布局。无论何时如果我们需要为用户展示一个新的页面，可以在它的父Activity中创建该Fragment的实例：

```java
import android.support.v4.app.Fragment;
...
public class ScreenSlidePageFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
            Bundle savedInstanceState) {
        ViewGroup rootView = (ViewGroup) inflater.inflate(
                R.layout.fragment_screen_slide_page, container, false);

        return rootView;
    }
}
```

## 添加ViewPager

[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) 有内建的滑动手势用来在页面间转换，并且它默认使用滑屏动画，所以我们不用自己为其创建。[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)使用[`PagerAdapter`](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html)来补充新页面，所以[`PagerAdapter`](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html)会用到你之前新建的Fragment类。

开始之前，创建一个包含[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)的布局：

```xml
<!-- activity_screen_slide.xml -->
<android.support.v4.view.ViewPager
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/pager"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

创建一个Activity来做下面这些事情：

* 把ContentView设置成这个包含[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)的布局。

* 创建一个继承自[`FragmentStatePagerAdapter `](http://developer.android.com/reference/android/support/v13/app/FragmentStatePagerAdapter.html)抽象类的类，然后实现<a href="http://developer.android.com/reference/android/support/v4/app/FragmentStatePagerAdapter.html#getItem(int)">`getItem()`</a>方法来把`ScreenSlidePageFragment`实例作为新页面补充进来。PagerAdapter还需要实现<a href="http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html#getCount()">`getCount()`</a>方法，它返回 Adapter将要创建页面的总数（例如5个）。

* 把[`PagerAdapter`](http://developer.android.com/reference/android/support/v4/view/PagerAdapter.html)和[`ViewPager`](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)关联起来。

* 处理Back按钮，按下变为在虚拟的Fragment栈中回退。如果用户已经在第一个页面了，则在Activity的回退栈（back stack）中回退。

```java
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
...
public class ScreenSlidePagerActivity extends FragmentActivity {
    /**
     * The number of pages (wizard steps) to show in this demo.
     */
    private static final int NUM_PAGES = 5;

    /**
     * The pager widget, which handles animation and allows swiping horizontally to access previous
     * and next wizard steps.
     */
    private ViewPager mPager;

    /**
     * The pager adapter, which provides the pages to the view pager widget.
     */
    private PagerAdapter mPagerAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_screen_slide);

        // Instantiate a ViewPager and a PagerAdapter.
        mPager = (ViewPager) findViewById(R.id.pager);
        mPagerAdapter = new ScreenSlidePagerAdapter(getSupportFragmentManager());
        mPager.setAdapter(mPagerAdapter);
    }

    @Override
    public void onBackPressed() {
        if (mPager.getCurrentItem() == 0) {
            // If the user is currently looking at the first step, allow the system to handle the
            // Back button. This calls finish() on this activity and pops the back stack.
            super.onBackPressed();
        } else {
            // Otherwise, select the previous step.
            mPager.setCurrentItem(mPager.getCurrentItem() - 1);
        }
    }

    /**
     * A simple pager adapter that represents 5 ScreenSlidePageFragment objects, in
     * sequence.
     */
    private class ScreenSlidePagerAdapter extends FragmentStatePagerAdapter {
        public ScreenSlidePagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int position) {
            return new ScreenSlidePageFragment();
        }

        @Override
        public int getCount() {
            return NUM_PAGES;
        }
    }
}
```

## 用PageTransformer自定义动画

要展示不同于默认滑屏效果的动画，我们需要实现[`ViewPager.PageTransformer`](http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html)接口，然后把它补充到ViewPager里就行了。这个接口只暴露了一个方法，<a href="http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html#transformPage(android.view.View, float)">`transformPage()`</a>。每次界面切换，这个方法都会为每个可见页面（通常只有一个页面可见）和刚消失的相邻页面调用一次。例如，第三页可见而且用户向第四页拖动，<a href="http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html#transformPage(android.view.View, float)">`transformPage()`</a>在操作的各个阶段为第二，三，四页分别调用。

在<a href="http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html#transformPage(android.view.View, float)">`transformPage()`</a>的实现中，基于当前屏幕显示的页面的`position`（`position` 由<a href="http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html#transformPage(android.view.View, float)">`transformPage()`</a>方法的参数给出）决定哪些页面需要被动画转换，这样我们就能创建自己的动画。

`position`参数表示特定页面相对于屏幕中的页面的位置。它的值在用户滑动页面过程中动态变化。当某一页面填充屏幕，它的值为0。当页面刚向屏幕右侧方向被拖走，它的值为1。如果用户在页面1和页面2间滑动到一半，那么页面1的position为-0.5并且页面2的position为 0.5。根据屏幕上页面的position，我们可以通过<a href="http://developer.android.com/reference/android/view/View.html#setAlpha(float)">`setAlpha()`</a>，<a href="http://developer.android.com/reference/android/view/View.html#setTranslationX(float)">`setTranslationX()`</a>或<a href="http://developer.android.com/reference/android/view/View.html#setScaleY(float)">`setScaleY()`</a>这些方法设定页面属性来自定义滑动动画。

当我们实现了[`PageTransformer`](http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html)后，用我们的实现调用<a href="http://developer.android.com/reference/android/support/v4/view/ViewPager.html#setPageTransformer(boolean, android.support.v4.view.ViewPager.PageTransformer)">`setPageTransformer()`</a>来应用这些自定义动画。例如，如果我们有一个叫做`ZoomOutPageTransformer`的[`PageTransformer`](http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html)，可以这样设置自定义动画：

```java
ViewPager mPager = (ViewPager) findViewById(R.id.pager);
...
mPager.setPageTransformer(true, new ZoomOutPageTransformer());
```

详情查看[Zoom-out Page Transformer](#Zoom-out Page Transformer)和[Depth Page Transformer](#Depth Page Transformer)部分的 [`PageTransformer`](http://developer.android.com/reference/android/support/v4/view/ViewPager.PageTransformer.html)视频和例子。

### Zoom-out Page Transformer

当在相邻界面滑动时，这个Page Transformer使页面收缩并褪色。当页面越靠近中心，它将渐渐还原到正常大小并且图像渐入。

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_page_transformer_zoomout.mp4" type="video/mp4">
    <source src="anim_page_transformer_zoomout.webm" type="video/webm">
    <source src="anim_page_transformer_zoomout.ogv" type="video/ogg">
</video>

</div>

```java
public class ZoomOutPageTransformer implements ViewPager.PageTransformer {
    private static final float MIN_SCALE = 0.85f;
    private static final float MIN_ALPHA = 0.5f;

    public void transformPage(View view, float position) {
        int pageWidth = view.getWidth();
        int pageHeight = view.getHeight();

        if (position < -1) { // [-Infinity,-1)
            // This page is way off-screen to the left.
            view.setAlpha(0);

        } else if (position <= 1) { // [-1,1]
            // Modify the default slide transition to shrink the page as well
            float scaleFactor = Math.max(MIN_SCALE, 1 - Math.abs(position));
            float vertMargin = pageHeight * (1 - scaleFactor) / 2;
            float horzMargin = pageWidth * (1 - scaleFactor) / 2;
            if (position < 0) {
                view.setTranslationX(horzMargin - vertMargin / 2);
            } else {
                view.setTranslationX(-horzMargin + vertMargin / 2);
            }

            // Scale the page down (between MIN_SCALE and 1)
            view.setScaleX(scaleFactor);
            view.setScaleY(scaleFactor);

            // Fade the page relative to its size.
            view.setAlpha(MIN_ALPHA +
                    (scaleFactor - MIN_SCALE) /
                    (1 - MIN_SCALE) * (1 - MIN_ALPHA));

        } else { // (1,+Infinity]
            // This page is way off-screen to the right.
            view.setAlpha(0);
        }
    }
}
```

### Depth Page Transformer

这个Page Transformer使用默认动画的屏幕左滑动画。但是为右滑使用一种“潜藏”效果的动画。潜藏动画将page淡出，并且线性缩小它。

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_page_transformer_depth.mp4" type="video/mp4">
    <source src="anim_page_transformer_depth.webm" type="video/webm">
    <source src="anim_page_transformer_depth.ogv" type="video/ogg">
</video>

</div>

> **注意：**在潜藏过程中，默认动画（屏幕滑动）是仍旧发生的，所以你必须用负的X平移来抵消它。例如：

```java
view.setTranslationX(-1 * view.getWidth() * position);
```

下面的例子展示了如何抵消默认滑屏动画：

```java
public class DepthPageTransformer implements ViewPager.PageTransformer {
    private static final float MIN_SCALE = 0.75f;

    public void transformPage(View view, float position) {
        int pageWidth = view.getWidth();

        if (position < -1) { // [-Infinity,-1)
            // This page is way off-screen to the left.
            view.setAlpha(0);

        } else if (position <= 0) { // [-1,0]
            // Use the default slide transition when moving to the left page
            view.setAlpha(1);
            view.setTranslationX(0);
            view.setScaleX(1);
            view.setScaleY(1);

        } else if (position <= 1) { // (0,1]
            // Fade the page out.
            view.setAlpha(1 - position);

            // Counteract the default slide transition
            view.setTranslationX(pageWidth * -position);

            // Scale the page down (between MIN_SCALE and 1)
            float scaleFactor = MIN_SCALE
                    + (1 - MIN_SCALE) * (1 - Math.abs(position));
            view.setScaleX(scaleFactor);
            view.setScaleY(scaleFactor);

        } else { // (1,+Infinity]
            // This page is way off-screen to the right.
            view.setAlpha(0);
        }
    }
}
```
