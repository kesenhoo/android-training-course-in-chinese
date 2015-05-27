<!-- # Building Layouts for TV # -->
# 创建TV布局

> 编写:[awong1900](https://github.com/awong1900) - 原文:<http://developer.android.com/training/tv/start/layouts.html>

<!-- A TV screen is typically viewed from about 10 feet away, and while it is much larger than most other Android device displays, this type of screen does not provide the same level of precise detail and color as a smaller device. These factors require you to create app layouts with TV devices in mind in order to create a useful and enjoyable user experience. -->

TV通常在3米外观看，并且它比大部分Android设备大的多。这类屏不能达到类似小设备的精细细节和颜色的水平。这些因素需要我们在头脑中考虑，并设计出对于TV设备更为有用且好用的应用布局。

<!-- This lesson describes the minimum requirements and implementation details for building effective layouts in TV apps. -->

这节课程描述了创建有效的TV应用布局的基本要求和实现细节。

<!-- ## Use Layout Themes for TV ## -->
## 用TV布局主题

<!-- Android Themes can provide a basis for layouts in your TV apps. You should use a theme to modify the display of your app activities that are meant to run on a TV device. This section explains which themes you should use. -->

Android主题能给我们的TV应用布局提供基础框架。对于打算在TV设备上运行的应用activity，我们应该用一款主题改变它的显示。这节课程教我们应该用哪个主题。

<!-- ### Leanback theme ### -->
### Leanback主题

<!-- A support library for TV user interfaces called the v17 leanback library provides a standard theme for TV activities, called Theme.Leanback. This theme establishes a consistent visual style for TV apps. Use of this theme is recommended for most TV apps. This theme is strongly recommended for any TV app that uses v17 leanback classes. The following code sample shows how to apply this theme to a given activity within an app: -->

支持TV用户界面的库叫做[v17 leanback libarary](http://developer.android.com/tools/support-library/features.html#v17-leanback)，它提供了一个标准的TV activity主题，叫做`Theme.Leanback`。这一主题为TV应用程序建立了一致的视觉风格。强烈推荐在任何用了v17 leanback类的TV应用中使用这个主题。接下来的代码展示如何在应用中对给定的activity使用这个主题：

```xml
<activity
  android:name="com.example.android.TvActivity"
  android:label="@string/app_name"
  android:theme="@style/Theme.Leanback">
```

<!-- ### NoTitleBar theme ### -->
### NoTitleBar主题

<!-- The title bar is a standard user interface element for Android apps on phones and tablets, but it is not appropriate for TV apps. If you are not using v17 leanback classes, you should apply this theme to your TV activities to suppress the display of a title bar. The following code example from a TV app manifest demonstrates how to apply this theme to remove the display of a title bar: -->

在手机和平板的Android应用中，标题栏是标准的用户界面元素。但是在TV应用中是不适合的。如果没有用v17 leanback类，我们应该在TV activity使用这个主题来隐去标题栏的显示。接下来的TV应用manifest代码示范了如何应用这个主题来删除标题栏。

```xml
<application>
  ...

  <activity
    android:name="com.example.android.TvActivity"
    android:label="@string/app_name"
    android:theme="@android:style/Theme.NoTitleBar">
    ...

  </activity>
</application>
```

<!-- ## Build Basic TV Layouts ## -->
## 创建基本的TV布局

<!-- Layouts for TV devices should follow some basic guidelines to ensure they are usable and effective on large screens. Follow these tips to build landscape layouts optimized for TV screens: -->

TV设备的布局应该遵循一些基本的指引确保它们在大屏幕下是可用的和有效率的。遵循这些技巧去创建最优化的TV横屏布局。

<!--
- Build layouts with a landscape orientation. TV screens always display in landscape mode.
- Put on-screen navigation controls on the left or right side of the screen and save the vertical space for content.
- Create UIs that are divided into sections, using Fragments, and use view groups like GridView instead of ListView to make better use of the horizontal screen space.
- Use view groups such as RelativeLayout or LinearLayout to arrange views. This approach allows the system to adjust the position of the views to the size, alignment, aspect ratio, and pixel density of a TV screen.
- Add sufficient margins between layout controls to avoid a cluttered UI.
-->

- 创建横屏布局。TV屏幕总是显示在横屏模式。
- 把导航控件放置在屏幕的左边或者右边，并且保持内容在垂直区间。
- 创建分离的UI，用[Fragment](http://developer.android.com/guide/components/fragments.html)，并且用框架如[GridView](http://developer.android.com/reference/android/widget/GridView.html)代替[ListView](http://developer.android.com/reference/android/widget/ListView.html)获得屏幕水平方向上更好的使用。
- 用框架如[RelativeLayout](http://developer.android.com/reference/android/widget/RelativeLayout.html)或者[LinearLayout](http://developer.android.com/reference/android/widget/LinearLayout.html)来排列视图。基于对齐方式，纵横比，和电视屏幕的像素密度，这个方法允许系统调整视图大小的位置。
- 在布局控件之间添加足够的边际，以避免成为一个杂乱的UI。

<!-- ### Overscan ### -->
### Overscan

<!-- Layouts for TV have some unique requirements due to the evolution of TV standards and the desire to always present a full screen picture to viewers. For this reason, TV devices may clip the outside edge of an app layout in order to ensure that the entire display is filled. This behavior is generally referred to as overscan. -->

由于TV标准的演进，TV的布局有一个独特的需求是总是希望给观众显示全屏图像。因为这个原因，TV设备可能剪掉应用布局的外边缘去确保整个显示器被填满。这种行为通常简称为overscan。

<!--  Avoid screen elements being clipped due to overscan and by incorporating a 10% margin on all sides of your layout. This translates into a 48dp margin on the left and right edges and a 27dp margin on the top and bottom of your base layouts for activities. The following example layout demonstrates how to set these margins in the root layout for a TV app: -->

避免屏幕元素由于overscan被剪掉，可以在布局所有的边缘增加总共10%的边际。这换算为在activity的基础布局上左右边缘留48dp的边际和在上下留27dp的边际。接下来的布局例子展示了如何在TV应用根布局上设置这些边际。

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:id="@+id/base_layout"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:orientation="vertical"
  android:layout_marginTop="27dp"
  android:layout_marginLeft="48dp"
  android:layout_marginRight="48dp"
  android:layout_marginBottom="27dp" >
</LinearLayout>
```

<!-- >**Caution**: Do not apply overscan margins to your layout if you are using the v17 leanback classes, such as BrowseFragment or related widgets, as those layouts already incorporate overscan-safe margins. -->

>**Caution**：如果我们正在使用v17 leanback类，不要在布局中留overscan边际，诸如[BrowseFragment](http://developer.android.com/reference/android/support/v17/leanback/app/BrowseFragment.html)或者相关控件，因为那些布局已经包含了overscan安全边际。

<!-- ## Build Useable Text and Controls ## -->
## 创建方便使用的文本和控件

<!-- The text and controls in a TV app layout should be easily visible and navigable from a distance. Follow these tips to make your user interface elements easier to see from a distance: -->

在TV应用布局中的文本和控件应该在一定距离外是容易查看和导航的。接下来的技巧是确保我们的用户界面元素在一定距离外更容易查看。

<!--
- Break text into small chunks that users can quickly scan.
- Use light text on a dark background. This style is easier to read on a TV.
- Avoid lightweight fonts or fonts that have both very narrow and very broad strokes. Use simple sans-serif fonts and anti-aliasing to increase readability.
- Use Android's standard font sizes:
-->

- 分解文本为小块，用户可以快速浏览。
- 在暗背景下用亮色文字。这种风格在TV中更容易阅读。
- 避免轻字体或者字体既窄且有非常宽阔的笔触效果。用简单的sans-serif字体并且去掉锯齿效果以增加可读性。
- 用Android标准的字体大小。

    ```xml
    <TextView
          android:id="@+id/atext"
          android:layout_width="wrap_content"
          android:layout_height="wrap_content"
          android:gravity="center_vertical"
          android:singleLine="true"
          android:textAppearance="?android:attr/textAppearanceMedium"/>
    ```

<!--
- Ensure that all your view widgets are large enough to be clearly visible to someone sitting 10 feet away from the screen (this distance is greater for very large screens). The best way to do this is to use layout-relative sizing rather than absolute sizing, and density-independent pixel (dip) units instead of absolute pixel units. For example, to set the width of a widget, use wrap_content instead of a pixel measurement, and to set the margin for a widget, use dip values instead of px values.
For more information about density-independent pixels and building layouts to handle larger screen sizes, see Supporting Multiple Screens.
-->

- 确保所有的控件是足够大，使人们站在屏幕3米外（更大的屏幕这个距离会更大）可以看清楚。做这个最好的方式是用布局相对大小而不是绝对大小，并且用密度无关像素（dip）单位代替像素单位。例如，设置控件的宽度，用`wrap_content`代替特定像素值，并且设置控件的边际，用dip代替px值。
更多关于密度无关像素和创建大尺寸屏幕的布局，查看[Support Mutiple Screens](http://developer.android.com/guide/practices/screens_support.html)。

<!-- ## Manage Layout Resources for TV ## -->
## 管理TV布局资源

<!-- The common high-definition TV display resolutions are 720p, 1080i, and 1080p. Your TV layout should target a screen size of 1920 x 1080 pixels, and then allow the Android system to downscale your layout elements to 720p if necessary. In general, downscaling (removing pixels) does not degrade your layout presentation quality. However, upscaling can cause display artifacts that degrade the quality of your layout and have a negative impact on the user experience of your app. -->

通常的高清晰度TV分辨率是720p，1080i和1080p。假定我们的TV布局对象是一个1920 x 1080像素的屏幕，然后要允许Android系统必要情况下缩减布局元素到720p。通常，降低分辨率（删除像素）不会降低布局的外观质量。但是增加分辨率会降低布局显示的质量，并且会对用户体验造成负面影响。

<!-- To get the best scaling results for images, provide them as 9-patch image elements if possible. If you provide low quality or small images in your layouts, they will appear pixelated, fuzzy, or grainy, which is not a good experience for the user. Use high-quality images instead. -->

为了获得最好的图像缩放效果，尽可能提供[9-patch](http://developer.android.com/tools/help/draw9patch.html)图片元素。如果在我们的布局中使用低质量或者小的图片，它们将出现马赛克，模糊或者颗粒，这不是一个好的用户体验。用高质量图片代替它。

<!-- For more information on optimizing layouts and resources for large screens see Designing for multiple screens. -->
更多关于优化布局和大屏幕的资源文件问题，参考[Designing for multiple screens](http://developer.android.com/training/multiscreen/index.html)。

<!-- ## Avoid Layout Anti-Patterns ## -->
## 避免反模式布局

<!--  There are a few approaches to building layouts that you should avoid because they do not work well on TV devices and lead to bad user experiences. Here are some user interface approaches you should specifically not use when developing a layout for TV. -->

有几种创建布局的方法我们应该避免使用，因为它们不能在TV设备上很好的工作并且导致不好的用户体验。当开发TV布局时，以下一些用户界面是我们应该明确不能使用的。

<!--
- **Re-using phone or tablet layouts** - Do not reuse layouts from a phone or tablet app without modification. Layouts built for other Android device form factors are not well suited for TV devices and should be simplified for operation on a TV.
- **ActionBar** - While this user interface convention is recommended for use on phones and tablets, it is not appropriate for a TV interface. In particular, using an action bar options menu (or any pull-down menu for that matter) is strongly discouraged, due to the difficulty in navigating such a menu with a remote control.
- **ViewPager** - Sliding between screens can work great on a phone or tablet, but don't try this on a TV!
For more information on designing layouts that are appropriate to TV, see the TV Design guide.
-->

- **重用手机和平板布局** - 不要重用没有修改的手机或者平板应用的布局。为其他Android设备开发的布局不适合TV设备，并且TV上布局应该被简化。
- **状态栏** - 尽管这种用户界面习惯是推荐使用在手机和平板上，但是他不适合TV界面。通常，状态栏选项菜单（或者任何下拉菜单）坚决不要使用，因为用遥控器操作这样的菜单是困难的。
- **ViewPager** - 在屏幕之间滑动能很好在手机或平板上工作，但是不要在TV上尝试！
更多信息关于设计适合TV的布局，参考[TV Design](http://developer.android.com/design/tv/index.html)指导。


<!-- ## Handle Large Bitmaps ## -->
## 处理大图片

<!-- TV devices, like any other Android device, have a limited amount of memory. If you build your app layout with very high-resolution images or use many high-resolution images in the operation of your app, it can quickly run into memory limits and cause out of memory errors. To avoid these types of problems, follow these tips: -->

TV设备，像任何其他Android设备，内存有一定限制。如果我们创建的应用中用了很高分辨率的图片或者用了很多高分辨率图片，它可能很快达到内存限制，并且导致内存溢出错误。避免这些类型的问题，遵循以下方法：

<!--
- Load images only when they are displayed on the screen. For example, when displaying multiple images in a GridView or Gallery, only load an image when getView() is called on the view's Adapter.
- Call recycle() on Bitmap views that are no longer needed.
- Use WeakReference for storing references to Bitmap objects in an in-memory Collection.
- If you fetch images from the network, use AsyncTask to fetch and store them on the device for faster access. Never do network transactions on the application's main user interface thread.
- Scale down large images to a more appropriate size as you download them; otherwise, downloading the image itself may cause an out of memory exception.
For more information on getting the best performance when working with images, see Displaying Bitmaps Efficiently.
-->

- 仅当图片显示在屏幕时才加载。例如，当在[GridView](http://developer.android.com/reference/android/widget/GridView.html)或者[Gallery](http://developer.android.com/reference/android/widget/Gallery.html)中显示多个图片时，仅当[getView()](http://developer.android.com/reference/android/widget/Adapter.html#getView(int, android.view.View, android.view.ViewGroup))在视图的[Adapter](http://developer.android.com/reference/android/widget/Adapter.html)中被调用时才加载图片。
- 在[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)视图中调用[recycle()](http://developer.android.com/reference/android/graphics/Bitmap.html#recycle())不再需要。
- 对存储在内存中[集合](http://developer.android.com/reference/java/util/Collection.html)中的位图对象使用[弱引用](http://developer.android.com/reference/java/lang/ref/WeakReference.html)。
- 如果我们从网络上获取图片，用[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)去操作并且存储它们在设备上以方便更快的存取。绝对不要在应用的主线程操作网络传输。
- 当下载大图片时，降低图片到合适的尺寸，否则，下载图片本身可能导致内存溢出问题。
更多信息关于获得最好的图片操作性能，参考 [Displaying Bitmaps Efficiently](http://developer.android.com/training/displaying-bitmaps/index.html)。

<!-- ## Provide Effective Advertising ## -->
## 提供有效的广告

<!-- Advertising on Android TV must always be full-screen. Ads must not appear alongside or over content. The user must be able to dismiss an advertisement with the D-pad controller. Video ads must be dismissible within 30 seconds of their start time. -->

Android TV的广告必须总是全屏。广告不可以出现在内容的旁边或者覆盖内容。用户应当能用D-pad控制器关闭广告。视频广告在开始时间后的30秒内应当能被关闭。

<!-- Android TV does not provide a web browser. Your ads must not attempt to launch a web browser or redirect to the Google Play Store. -->

Android TV不提供网页浏览器。我们的广告不应该尝试去启动网页浏览器或者重定向到Google Play商店。

<!-- >Note: You can use the WebView class for logins to services like Google+ and Facebook. -->

>**Note**：[WebView](http://developer.android.com/reference/android/webkit/WebView.html)类用于登入服务器，如Google+和Facebook。

---------------------------------------
[下一节: 创建TV导航 >](navigation.html)
