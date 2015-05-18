# 创建2D Picker

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/2d-picker.html>

Android Wear中的[2D Picker](https://developer.android.com/design/wear/structure.html#2DPicker)模式允许用户像换页一样从一组选项中导航和选择。Wearable UI库让我们可以容易地用一个page grid来实现这个模式。其中，page grid是一个layout管理器，它允许用户垂直和水平滚动页面。

要实现这个模式，我们需要添加一个`GridViewPager`元素到activity的layout中，然后实现一个继承`FragmentGridPagerAdapter`类的adapter以提供一组页面。

> **Note:** Android SDK中的*GridViewPager*例子示范了如何在应用中使用 `GridViewPager` layout。这个例子的位于`android-sdk/samples/android-20/wearable/GridViewPager`目录中。

## 添加Page Grid

像下面一样添加一个`GridViewPager`元素到layout描述文件：

```xml
<android.support.wearable.view.GridViewPager
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/pager"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```
	    
我们可以使用任何[定义Layouts](https://developer.android.com/training/wearables/ui/layouts.html)技术以保证2D picker可以工作在圆形和方形两种设备上。

## 实现Page Adapter

Page Adapter提供一组页面以填充`GridViewPager`部件。要实现这个adapter，需要继承Wearable UI库中的`FragmentGridPageAdapter`类。

举个例子，Android SDK内的*GridViewPager*例子中包含了下面的adapter实现，该实现提供一组静态的具有自定义背景图片的card：

```java
public class SampleGridPagerAdapter extends FragmentGridPagerAdapter {

    private final Context mContext;

    public SampleGridPagerAdapter(Context ctx, FragmentManager fm) {
        super(fm);
        mContext = ctx;
    }

    static final int[] BG_IMAGES = new int[] {
            R.drawable.debug_background_1, ...
            R.drawable.debug_background_5
    };

    // A simple container for static data in each page
    private static class Page {
        // static resources
        int titleRes;
        int textRes;
        int iconRes;
        ...
    }

    // Create a static set of pages in a 2D array
    private final Page[][] PAGES = { ... };

    // Override methods in FragmentGridPagerAdapter
    ...
}
```
	
picker调用`getFragment`和`getBackground`来取得内容以显示到grid的每个位置中。

```java
// Obtain the UI fragment at the specified position
@Override
public Fragment getFragment(int row, int col) {
    Page page = PAGES[row][col];
    String title =
        page.titleRes != 0 ? mContext.getString(page.titleRes) : null;
    String text =
        page.textRes != 0 ? mContext.getString(page.textRes) : null;
    CardFragment fragment = CardFragment.create(title, text, page.iconRes);

    // Advanced settings (card gravity, card expansion/scrolling)
    fragment.setCardGravity(page.cardGravity);
    fragment.setExpansionEnabled(page.expansionEnabled);
    fragment.setExpansionDirection(page.expansionDirection);
    fragment.setExpansionFactor(page.expansionFactor);
    return fragment;
}

// Obtain the background image for the page at the specified position
@Override
public ImageReference getBackground(int row, int column) {
    return ImageReference.forDrawable(BG_IMAGES[row % BG_IMAGES.length]);
}
```
	
`getRowCount`方法告诉picker有多少行内容是可获得的，`getColumnCount`方法告诉picker每行中有多少列内容是可获得的。

```java
// Obtain the number of pages (vertical)
@Override
public int getRowCount() {
    return PAGES.length;
}

// Obtain the number of pages (horizontal)
@Override
public int getColumnCount(int rowNum) {
    return PAGES[rowNum].length;
}
```
	
adapter是实现细节取决于我们指定的某组页面。由adapter提供的每个页面是`Fragement`类型。在这个例子中，每个页面是一个使用默认card layouts的`CardFragment`实例。然而，我们可以在同一个2D picker混合不同类型的页面，比如cards，action icons，和自定义layouts，由具体情况决定。

不是所有行都需要有同样数量的页面。注意这个例子中的每行有不同的列数。我们也可以用一个 `GridViewPager` 组件实现只有一行或一列的1D picker。

![](07_uilib.png)

**Figure 1:** GridViewPager例子

对于那些超出设备屏幕大小的card，`GridViewPager`为它们提供了滚动支持。这个例子配置了每张card可以按照需要进行展开，所以用户可以滚动卡片的内容。当用户滚动到card的尽头，向同一方向滑动将显示grid中的下一页（如果下一页存在的话）。

我们可以使用`getBackground()`方法自定义每页的背景。当用户在页面间滑动时，`GridViewPager`自动在不同的背景之间使用视差滚动和淡出效果。

### 分配adapter实例给page grid

在activity中，分配一个adapter实现实例给`GridViewPager`组件：

```java
public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ...
        final GridViewPager pager = (GridViewPager) findViewById(R.id.pager);
        pager.setAdapter(new SampleGridPagerAdapter(this, getFragmentManager()));
    }
}
```