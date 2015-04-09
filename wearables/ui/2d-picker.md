# 创建2D-Picker

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/2d-picker.html>

<!--The 2D Picker pattern in Android Wear allows users to navigate and choose from a set of items shown as pages. The Wearable UI Library lets you easily implement this pattern using a page grid, which is a layout manager that allows users to scroll vertically and horizontally through pages of data.-->

Android Wear中的[2D Picker](https://developer.android.com/design/wear/structure.html#2DPicker)模式允许用户像换页一样从一组项目中导航和选择。

<!--To implement this pattern, you add a GridViewPager element to the layout of your activity and implement an adapter that provides a set of pages by extending the FragmentGridPagerAdapter class.-->
要实现这个模式，你需要添加一个 *GridViewPager* 元素到你的activity的layout中然后实现一个继承 *FragmentGridPagerAdapter*类的adapter以提供一组页面。

<!--Note: The GridViewPager sample in the Android SDK demonstrates how to use the GridViewPager layout in your apps. This sample is located in the android-sdk/samples/android-20/wearable/GridViewPager directory.-->
> **Note:** Android SDK中的*GridViewPager*例子示范了如何在你的apps中使用 *GridViewPager* layout。这个例子的位置在 *android-sdk/samples/android-20/wearable/GridViewPager*目录中。

## 添加Page Grid
<!--Add a GridViewPager element to your layout definition as follows:-->
像下面一样添加一个 *GridViewPager* 元素到你的layout描述文件：

	<android.support.wearable.view.GridViewPager
	    xmlns:android="http://schemas.android.com/apk/res/android"
	    android:id="@+id/pager"
	    android:layout_width="match_parent"
	    android:layout_height="match_parent" />
	    
<!--You can use any of the techniques described in Defining Layouts to ensure that your 2D picker works on both round and square devices.-->
你可以使用任何[定义Layouts](https://developer.android.com/training/wearables/ui/layouts.html)技术以保证你的2D picker可以工作在圆形和方形两种设备上。

## 实现Page Adapter
<!--A page adapter provides a set of pages to populate a GridViewPager component. To implement this adapter, you extend the FragmentGridPageAdapter class from the Wearable UI Library-->
Page Adapter提供一组页面以填充 *GridViewPager* 部件。要实现这个adapter，你需要继承Wearable UI Library中的 *FragmentGridPageAdapter* 类。

<!--For example, the GridViewPager sample in the Android SDK contains the following adapter implementation that provides a set of static cards with custom background images:-->
举个例子🌰，Android SDK内的*GridViewPager*例子中包含了下面的adapter实现将提供一组静态cards和自定义背景图片：

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
	
<!--The picker calls getFragment and getBackground to retrieve the content to display at each position of the grid:-->
picker调用 *getFragment* 和 *getBackground*来取得内容以显示到每个grid的位置中。

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
	
<!--The getRowCount method tells the picker how many rows of content are available, and the getColumnCount method tells the picker how many columns of content are available for each of the rows.-->
*getRowCount*方法告诉picker有多少行内容是可获得的，然后 *getColumnCount*方法告诉picker每行中有多少列内容是可获得的。

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
	
<!--The adapter implementation details depend on your particular set of pages. Each page provided by the adapter is of type Fragment. In this example, each page is a CardFragment instance that uses one of the default card layouts. However, you can combine different types of pages in the same 2D picker, such as cards, action icons, and custom layouts depending on your use cases.-->
adapter是实现细节依赖于你的特定的某组pages。由adapter提供每个页面类型的 *Fragment*。在这个例子中，每个page是一个使用默认card layouts的 *CardFragment* 实例。然而，你可以混合不同类型的pages在同一个2D picker，比如cards，action icons，和自定义layouts，由你的情况决定。

<!--Not all rows need to have the same number of pages. Notice that in this example the number of colums is different for each row. You can also use a GridViewPager component to implement a 1D picker with only one row or only one column.-->
不是所有行都需要有同样数量的pages，注意这个例子中的每行有不同的列数。你也可以用一个 *GridViewPager* 组件实现只有一行或一列的1D picker。

![](07_uilib.png)

**Figure 1:**GridViewPager例子

<!--GridViewPager provides support for scrolling in cards whose content does not fit the device screen. This example configures each card to expand as required, so users can scroll through the card's content. When users reach the end of a scrollable card, a swipe in the same direction shows the next page on the grid, if one is available.-->
*GridViewPager* 提供了滚动支持当cards内容超出设备屏幕。这种例子配置了每张card需要被扩展，所以用户可以滚动卡片的内容。当用户到达到滚动卡片的底部，向同样方向滑动将显示grid中的下个page（当下一page可用时）。

<!--You can specify a custom background for each page with the getBackground() method. When users swipe to navigate across pages, GridViewPager applies parallax and crossfade effects between different backgrounds automatically.-->
你可以使用 *getBackground()* 方法自定义每页page的背景。当用户划过page，*GridViewPager* 自动使用视差滚动和淡出效果在不同的背景之间。

## 分配adapter实例给page grid
<!--In your activity, assign an instance of your adapter implementation to the GridViewPager component:-->
在你的activity中，分配一个你的adapter实现实例给 *GridViewPager* 组件：

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