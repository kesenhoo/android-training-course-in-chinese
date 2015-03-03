# 创建Lists

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/lists.html>

<!--Lists let users select an item from a set of choices easily on wearable devices. This lesson shows you how to create lists in your Android Wear apps.-->
Lists在可穿戴设备上简单的从一组选项中选择一个项目，这个课程为你演示了如何在Android Wear apps中创建lists。

<!--The Wearable UI Library includes the WearableListView class, which is a list implementation optimized for wearable devices..-->
Wearable UI库包含了 *WearableListView* 类，用于实现为可穿戴设备优化的list。

<!--Note: The Notifications sample in the Android SDK demonstrates how to use WearableListView in your apps. This sample is located in the android-sdk/samples/android-20/wearable/Notifications directory.-->

> **Note:** Android SDK 中的 *Notifications* 例子示范了如何在你的apps中使用 *WearableListView*。这个例子的位置在 *android-sdk/samples/android-20/wearable/Notifications* 目录。

<!--To create a list in your Android Wear apps:
Add a WearableListView element to your activity's layout definition.
Create a custom layout implementation for your list items.
Use this implementation to create a layout definition file for your list items.
Create an adapter to populate the list.
Assign the adapter to the WearableListView element.
These steps are described in detail in the following sections.-->

为了在你的Android Wear apps中创建list:

1.  添加 *WearableListView* 元素到你的activity的layout描述中。
2.  为你的list items创建一个自定义layout实现。
3.  为你的list items使用这个实现创建一个layout描述。
4.  创建一个adapter以填充list。
5.  为 *WearableListView* 元素指定这个adapter。

这些步骤的详细描述在下面的章节中。

![](https://developer.android.com/wear/images/06_uilib.png)

**Figure 3:** A list view on Android Wear.

## 添加List View
<!--The following layout adds a list view to an activity using a BoxInsetLayout, so the list is displayed properly on both round and square devices:-->
下面的layout使用 *BoxInsetLayout* 添加了一个list view到activity中，所以这个列表可以正确的现实在圆形和方形两种设备上：

	<android.support.wearable.view.BoxInsetLayout
	    xmlns:android="http://schemas.android.com/apk/res/android"
	    xmlns:app="http://schemas.android.com/apk/res-auto"
	    android:background="@drawable/robot_background"
	    android:layout_height="match_parent"
	    android:layout_width="match_parent">

	    <FrameLayout
	        android:id="@+id/frame_layout"
	        android:layout_height="match_parent"
	        android:layout_width="match_parent"
	        app:layout_box="left|bottom|right">

	        <android.support.wearable.view.WearableListView
	            android:id="@+id/wearable_list"
	            android:layout_height="match_parent"
	            android:layout_width="match_parent">
	        </android.support.wearable.view.WearableListView>
	    </FrameLayout>
	</android.support.wearable.view.BoxInsetLayout>
	
## 为List Items创建一个Layou实现
<!--In many cases, each list item consists of an icon and a description. The Notifications sample from the Android SDK implements a custom layout that extends LinearLayout to incorporate these two elements inside each list item. This layout also implements the methods in the WearableListView.OnCenterProximityListener interface to change the color of the item's icon and fade the text in response to events from WearableListView as the user scrolls through the list.-->
在许多例子中，每个 list item 都由一个icon和一个描述组成。Android SDK中的*Notifications* 例子实现了一个自定义layout：继承[LinearLayout](https://developer.android.com/reference/android/widget/LinearLayout.html)以合并两元素在每个list item。这个layout也实现了 *WearableListView.OnCenterProximityListener* interface以实现在用户滚动 *WearableListView* 时改变item的icon颜色和渐隐文字。

	public class WearableListItemLayout extends LinearLayout
	             implements WearableListView.OnCenterProximityListener {

	    private ImageView mCircle;
	    private TextView mName;

	    private final float mFadedTextAlpha;
	    private final int mFadedCircleColor;
	    private final int mChosenCircleColor;

	    public WearableListItemLayout(Context context) {
	        this(context, null);
	    }

	    public WearableListItemLayout(Context context, AttributeSet attrs) {
	        this(context, attrs, 0);
	    }

	    public WearableListItemLayout(Context context, AttributeSet attrs,
	                                  int defStyle) {
	        super(context, attrs, defStyle);

	        mFadedTextAlpha = getResources()
	                         .getInteger(R.integer.action_text_faded_alpha) / 100f;
	        mFadedCircleColor = getResources().getColor(R.color.grey);
	        mChosenCircleColor = getResources().getColor(R.color.blue);
	    }

	    // Get references to the icon and text in the item layout definition
	    @Override
	    protected void onFinishInflate() {
	        super.onFinishInflate();
	        // These are defined in the layout file for list items
	        // (see next section)
	        mCircle = (ImageView) findViewById(R.id.circle);
	        mName = (TextView) findViewById(R.id.name);
	    }

	    @Override
	    public void onCenterPosition(boolean animate) {
	        mName.setAlpha(1f);
	        ((GradientDrawable) mCircle.getDrawable()).setColor(mChosenCircleColor);
	    }

	    @Override
	    public void onNonCenterPosition(boolean animate) {
	        ((GradientDrawable) mCircle.getDrawable()).setColor(mFadedCircleColor);
	        mName.setAlpha(mFadedTextAlpha);
	    }
	}

<!--You can also create animator objects to enlarge the icon of the center item in the list. You can use the onCenterPosition() and onNonCenterPosition() callback methods in the WearableListView.OnCenterProximityListener interface to manage your animators. For more information about animators, see Animating with ObjectAnimator.-->

你也可以创建animator对象以放大中间的item的icon。你可以使用*WearableListView.OnCenterProximityListener* interface的 *onCenterPosition()* 和  *onNonCenterPosition()*回调方法来管理你的animators。更多关于animators的信息请查看[Animating with ObjectAnimator](https://developer.android.com/guide/topics/graphics/prop-animation.html#object-animator)

##为Items创建Layout解释

<!--After you implement a custom layout for list items, you provide a layout definition file that specifies the layout parameters of each of the components inside a list item. The following layout definition uses the custom layout implementation from the previous section and defines an icon and a text view whose IDs match those in the layout implementation class:-->
在你为list items 实现自定义layout之后，你需要提供一个layout解释文件以具体说明list item中的组件参数。下面的layout解释使用先前的自定义layout实现然后定义icon和text view的ID以匹配layout实现类。

>res/layout/list_item.xml

	<com.example.android.support.wearable.notifications.WearableListItemLayout
	    xmlns:android="http://schemas.android.com/apk/res/android"
	    android:gravity="center_vertical"
	    android:layout_width="match_parent"
	    android:layout_height="80dp">
	    <ImageView
	        android:id="@+id/circle"
	        android:layout_height="20dp"
	        android:layout_margin="16dp"
	        android:layout_width="20dp"
	        android:src="@drawable/wl_circle"/>
	    <TextView
	        android:id="@+id/name"
	        android:gravity="center_vertical|left"
	        android:layout_width="wrap_content"
	        android:layout_marginRight="16dp"
	        android:layout_height="match_parent"
	        android:fontFamily="sans-serif-condensed-light"
	        android:lineSpacingExtra="-4sp"
	        android:textColor="@color/text_color"
	        android:textSize="16sp"/>
	</com.example.android.support.wearable.notifications.WearableListItemLayout>
	
## 创建Adapter以填充List

<!--The adapter populates the WearableListView with content. The following simple adapter populates the list with elements based on an array of strings:-->
Adapter用内容填充 *WearableListView*。下面的adapter基于strings数组简单的填充了List：

	private static final class Adapter extends WearableListView.Adapter {
	    private String[] mDataset;
	    private final Context mContext;
	    private final LayoutInflater mInflater;

	    // Provide a suitable constructor (depends on the kind of dataset)
	    public Adapter(Context context, String[] dataset) {
	        mContext = context;
	        mInflater = LayoutInflater.from(context);
	        mDataset = dataset;
	    }

	    // Provide a reference to the type of views you're using
	    public static class ItemViewHolder extends WearableListView.ViewHolder {
	        private TextView textView;
	        public ItemViewHolder(View itemView) {
	            super(itemView);
	            // find the text view within the custom item's layout
	            textView = (TextView) itemView.findViewById(R.id.name);
	        }
	    }

	    // Create new views for list items
	    // (invoked by the WearableListView's layout manager)
	    @Override
	    public WearableListView.ViewHolder onCreateViewHolder(ViewGroup parent,
	                                                          int viewType) {
	        // Inflate our custom layout for list items
	        return new ItemViewHolder(mInflater.inflate(R.layout.list_item, null));
	    }

	    // Replace the contents of a list item
	    // Instead of creating new views, the list tries to recycle existing ones
	    // (invoked by the WearableListView's layout manager)
	    @Override
	    public void onBindViewHolder(WearableListView.ViewHolder holder,
	                                 int position) {
	        // retrieve the text view
	        ItemViewHolder itemHolder = (ItemViewHolder) holder;
	        TextView view = itemHolder.textView;
	        // replace text contents
	        view.setText(mDataset[position]);
	        // replace list item's metadata
	        holder.itemView.setTag(position);
	    }

	    // Return the size of your dataset
	    // (invoked by the WearableListView's layout manager)
	    @Override
	    public int getItemCount() {
	        return mDataset.length;
	    }
	}

## 连接Adapter和设置Click Listener
<!--In your activity, obtain a reference to the WearableListView element from your layout, assign an instance of the adapter to populate the list, and set a click listener to complete an action when the user selects a particular list item.-->
在你的activity中，从你的layout中取得 *WearableListView* 元素的引用，分配一个adapter实例以填充list，然后设置一个click listener以完成动作当用户选择了一个特定的list item。

	public class WearActivity extends Activity
	                          implements WearableListView.ClickListener {

	    // Sample dataset for the list
	    String[] elements = { "List Item 1", "List Item 2", ... };

	    @Override
	    protected void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	        setContentView(R.layout.my_list_activity);

	        // Get the list component from the layout of the activity
	        WearableListView listView =
	            (WearableListView) findViewById(R.id.wearable_list);

	        // Assign an adapter to the list
	        listView.setAdapter(new Adapter(this, elements));

	        // Set a click listener
	        listView.setClickListener(this);
	    }

	    // WearableListView click listener
	    @Override
	    public void onClick(WearableListView.ViewHolder v) {
	        Integer tag = (Integer) v.itemView.getTag();
	        // use this data to complete some action ...
	    }

	    @Override
	    public void onTopEmptyRegionClick() {
	    }
	}