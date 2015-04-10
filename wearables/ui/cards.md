# 创建Cards

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/cards.html>

<!--Cards present information to users with a consistent look and feel across different apps. This lesson shows you how to create cards in your Android Wear apps.-->

卡片以一致的外观在不同的apps上为用户呈现当前信息。这个章节为你演示了如何在你的Android Wear apps中创建卡片。

<!--The Wearable UI Library provides implementations of cards specifically designed for wearable devices. This library contains the CardFrame class, which wraps views inside a card-styled frame with a white background, rounded corners, and a light-drop shadow. CardFrame can only contain one direct child, usually a layout manager, to which you can add other views to customize the content inside the card.-->

Wearable UI Library提供了为穿戴设备特别设计的卡片实现。这个库包含了 *CardFrame* 类，它在卡片风格的框架中包裹views，且提供一个白色的背景，圆角，和光投射阴影。*CardFrame* 只能包裹一个直接的子view，这通常是一个layout manager，你可以向它添加其他views以定制卡片内容。

<!--You can add cards to your app in two ways:
Use or extend the CardFragment class.
Add a card inside a CardScrollView in your layout.-->

你有两种方法向你的app添加cards：

* 直接使用或继承 *CardFragment* 类。
* 在你的layout内，在一个 *CardScrollView* 中添加一个card。

<!--Note: This lesson shows you how to add cards to Android Wear activities. Android notifications on wearable devices are also displayed as cards. For more information, see Adding Wearable Features to Notifications.-->

> *Note:* 这个课程为你展示了如何在Android Wear activities中添加cards。Android可穿戴设备上的notifications同样以卡片显示。更多信息请查看 [Adding Wearable Features to Notifications](https://developer.android.com/training/wearables/notifications/index.html)

## 创建Card Fragment
<!--The CardFragment class provides a default card layout with a title, a description, and an icon. Use this approach to add cards to your app if the default card layout shown in figure 1 meets your needs.-->


*CardFragment* 类提供一个默认card layout含有一个title一个description和一个icon，如果你需要的card  layout看起来和默认figure 1一样，使用这个方法向你的app添加cards。

![Figure 1](05_uilib.png)

**Figure 1.** 默认的 *CardFragment* layout.

<!--To add a CardFragment to your app:
In your layout, assign an ID to the element that contains the card
Create a CardFragment instance in your activity
Use the fragment manager to add the CardFragment instance to its container-->

为了添加一个 *CardFragment* 到你的app：

* 在你的layout为包含内容卡片的节点分配一个ID
* 在你的activity中创建一个 *CardFragment* 实例
* 使用fragment manager添加 *CardFragment* 实例到这个容器

<!--The following sample code shows the code for the screen display shown in Figure 1:-->

下面的示例代码显示了Figure 1中的屏幕显示代码：

	<android.support.wearable.view.BoxInsetLayout
	xmlns:android="http://schemas.android.com/apk/res/android"
	xmlns:app="http://schemas.android.com/apk/res-auto"
	android:background="@drawable/robot_background"
	android:layout_height="match_parent"
	android:layout_width="match_parent">

	    <FrameLayout
	        android:id="@+id/frame_layout"
	        android:layout_width="match_parent"
	        android:layout_height="match_parent"
	        app:layout_box="bottom">

	    </FrameLayout>
	</android.support.wearable.view.BoxInsetLayout>
	
<!--The following code adds the CardFragment instance to the activity in Figure 1:-->
下面的代码添加*CardFragment* 实例到Figure 1的activity中：

	protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_wear_activity2);

	    FragmentManager fragmentManager = getFragmentManager();
	    FragmentTransaction fragmentTransaction 
	    		= fragmentManager.beginTransaction();
	    CardFragment cardFragment 
	    		= CardFragment.create(getString(R.string.cftitle),getString(R.string.cfdesc),R.drawable.p);
	    fragmentTransaction.add(R.id.frame_layout, cardFragment);
	    fragmentTransaction.commit();
	}
	
<!--To create a card with a custom layout using CardFragment, extend this class and override its onCreateContentView method.-->
为了创建使用自定义layout的card，继承这个类然后override onCreateContentView方法。

## 添加一个CardFrame到你的Layout

<!--You can also add a card directly to your layout definition, as shown in figure 2. Use this approach when you want to define a custom layout for the card inside a layout definition file.-->
你也可以直接添加一个card到你的layout描述，类似于figure 2。当你希望为layout描述文件中的card自定义一个layout时使用这个方法。

![](04_uilib.png)

**Figure 2.** 添加一个 *CardFrame* 到你的layout.

<!--The following layout code sample demonstrates a vertical linear layout with two elements. You can create more complex layouts to fit the needs of your app.-->

下面的layout代码例子示范了一个含有两个节点的垂直linear layout。你可以创建更加复杂的layouts以适合你需要的app。

	<android.support.wearable.view.BoxInsetLayout
	xmlns:android="http://schemas.android.com/apk/res/android"
	xmlns:app="http://schemas.android.com/apk/res-auto"
	android:background="@drawable/robot_background"
	android:layout_height="match_parent"
	android:layout_width="match_parent">

	    <android.support.wearable.view.CardScrollView
	        android:id="@+id/card_scroll_view"
	        android:layout_height="match_parent"
	        android:layout_width="match_parent"
	        app:layout_box="bottom">

	        <android.support.wearable.view.CardFrame
	            android:layout_height="wrap_content"
	            android:layout_width="fill_parent">

	            <LinearLayout
	                android:layout_height="wrap_content"
	                android:layout_width="match_parent"
	                android:orientation="vertical"
	                android:paddingLeft="5dp">
	                <TextView
	                    android:fontFamily="sans-serif-light"
	                    android:layout_height="wrap_content"
	                    android:layout_width="match_parent"
	                    android:text="@string/custom_card"
	                    android:textColor="@color/black"
	                    android:textSize="20sp"/>
	                <TextView
	                    android:fontFamily="sans-serif-light"
	                    android:layout_height="wrap_content"
	                    android:layout_width="match_parent"
	                    android:text="@string/description"
	                    android:textColor="@color/black"
	                    android:textSize="14sp"/>
	            </LinearLayout>
	        </android.support.wearable.view.CardFrame>
	    </android.support.wearable.view.CardScrollView>
	</android.support.wearable.view.BoxInsetLayout>

<!--The CardScrollView element in the example layout above lets you assign gravity to the card when its content is smaller than the container. This example aligns the card to the bottom of the screen:-->

这个例子上的 *CardScrollView* 节点让你可以配置gravity，当包含的内容小于容器时。这个例子为card对齐屏幕底部：

	@Override
	protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_wear_activity2);

	    CardScrollView cardScrollView =
	        (CardScrollView) findViewById(R.id.card_scroll_view);
	    cardScrollView.setCardGravity(Gravity.BOTTOM);
	}
	
<!--CardScrollView detects the shape of the screen and displays the card differently on round and square devices, using wider side margins on round screens. However, placing the CardScrollView element inside a BoxInsetLayout and using the layout_box="bottom" attribute is useful to align the card to the bottom of round screens without cropping its content.-->

*CardScrollView* 检查屏幕形状后以不同的显示方式显示卡片在圆形或方形设备上，它使用更宽的侧边缘在圆形屏幕上。不管怎样，在 *BoxInsetLayout* 中放置 *CardScrollView* 节点然后使用layout_box="bottom"属性对圆形屏幕上的卡片对齐底部并且没有内容被剪裁是有有用的。