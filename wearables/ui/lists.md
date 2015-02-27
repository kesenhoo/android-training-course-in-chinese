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
 