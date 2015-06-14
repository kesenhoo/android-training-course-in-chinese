# 自定义动画

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <https://developer.android.com/training/material/animations.html>

Material Design中的动画对用户的动作进行反馈，并提供在整个交互过程中的视觉连续性。Material 主题为按钮和Activity切换提供一些默认的动画，Android 5.0 (API level 21) 及以上版本支持自定义这些动画并创建新动画：

* 触摸反馈
* 圆形填充
* Activity 切换动画
* 曲线形动作
* 视图状态变换

## 自定义触摸反馈

Material Design中的触摸反馈，是在用户与UI元素交互时，提供视觉上的即时确认。按钮的默认触摸反馈动画使用了新的`RippleDrawable`类，它在按钮状态变换时产生波纹效果。

大多数情况下，你需要在你的 XML 文件中设定视图的背景来实现这个功能：

* `?android:attr/selectableItemBackground` 用于有界Ripple动画
* `?android:attr/selectableItemBackgroundBorderless` 用于越出视图边界的动画。它会被绘制在最近的且不是全屏的父视图上。

> **Note：**`selectableItemBackgroundBorderless` 是 API level 21 新加入的属性

另外，你可以使用`ripple`元素在XML资源文件中定义一个 `RippleDrawable`。

你可以给`RippleDrawable`赋予一个颜色。要改变默认的触摸反馈颜色，使用主题的`android:colorControlHighlight` 属性。

更多信息，参见`RippleDrawable`类的API文档。

## 使用填充效果（Reveal Effect）

填充效果在UI元素出现或隐藏时，为用户提供视觉连续性。`ViewAnimationUtils.createCircularReveal()`方法可以使用一个附着在视图上的圆形，显示或隐藏这个视图。

要用此效果显示一个原本不可见的视图：

```java
// previously invisible view
View myView = findViewById(R.id.my_view);

// get the center for the clipping circle
int cx = (myView.getLeft() + myView.getRight()) / 2;
int cy = (myView.getTop() + myView.getBottom()) / 2;

// get the final radius for the clipping circle
int finalRadius = myView.getWidth();

// create and start the animator for this view
// (the start radius is zero)
Animator anim =
    ViewAnimationUtils.createCircularReveal(myView, cx, cy, 0, finalRadius);
anim.start();
```

要用此效果隐藏一个原本可见的视图：

```java
// previously visible view
final View myView = findViewById(R.id.my_view);

// get the center for the clipping circle
int cx = (myView.getLeft() + myView.getRight()) / 2;
int cy = (myView.getTop() + myView.getBottom()) / 2;

// get the initial radius for the clipping circle
int initialRadius = myView.getWidth();

// create the animation (the final radius is zero)
Animator anim =
    ViewAnimationUtils.createCircularReveal(myView, cx, cy, initialRadius, 0);

// make the view invisible when the animation is done
anim.addListener(new AnimatorListenerAdapter() {
    @Override
    public void onAnimationEnd(Animator animation) {
        super.onAnimationEnd(animation);
        myView.setVisibility(View.INVISIBLE);
    }
});

// start the animation
anim.start();
```

## 自定义Activity切换效果

![Figure 1 - A transition with shared elements.](ContactsAnim.gif)

Material Design中的Activity切换，当不同Activity之间拥有共有元素，则可以通过不同状态之间的动画和形变提供视觉上的连续性。你可以为共有元素设定进入和退出Activity时的自定义动画。

* **入场变换**决定视图如何入场。比如，在*爆炸式入场*变换中，视图从场外飞到屏幕中央。
* **出场变换**决定视图如何退出。比如，在*爆炸式出场*变换中，视图从屏幕中央飞出场外。
* **共有元素的变换**决定一个共有视图在两个Activity之间如何变换。比如，如果两个activity有同一张图片，但是放在不同位置，以及拥有不同大小，*变更图片* 变换会流畅的把图片移到相应位置，同时缩放图片大小。

Android 5.0 (API level 21) 支持这些入场和退出变换：

* 爆炸 - 把视图移入或移出场景的中间
* 滑动 - 把视图从场景边缘移入或移出
* 淡入淡出 - 通过改变透明度添加或移除元素

任何继承于 [`Visibility`](http://developer.android.com/reference/android/transition/Visibility.html) 类的变换，都支持被用于入场或退出变换。更多信息，请参见 [`Transition`](http://developer.android.com/reference/android/transition/Transition.html) 类的API文档。

Android 5.0 (API level 21) 还支持这些共有元素变换效果：

* **changeBounds** - 对目标视图的外边界进行动画
* **chagneClipBounds** - 对目标视图的附着物的外边界进行动画
* **changeTransform** - 对目标视图进行缩放和旋转
* **changeImageTransform** - 对目标图片进行缩放

当你在应用中进行activity 变换时，默认的淡入淡出效果会被用在进入和退出activity的过程中。

![](SceneTransition.png)

### 自定义切换

首先，当你继承Material主题的style时，要通过`android:windowContentTransitions`属性来开启窗口内容变换功能。你也可以在style定义中声明进入、退出和共有元素切换：

```xml
<style name="BaseAppTheme" parent="android:Theme.Material">
  <!-- enable window content transitions -->
  <item name="android:windowContentTransitions">true</item>

  <!-- specify enter and exit transitions -->
  <item name="android:windowEnterTransition">@transition/explode</item>
  <item name="android:windowExitTransition">@transition/explode</item>

  <!-- specify shared element transitions -->
  <item name="android:windowSharedElementEnterTransition">
    @transition/change_image_transform</item>
  <item name="android:windowSharedElementExitTransition">
    @transition/change_image_transform</item>
</style>
```

例子中的`change_image_transform` 切换定义如下：

```xml
<!-- res/transition/change_image_transform.xml -->
<!-- (see also Shared Transitions below) -->
<transitionSet xmlns:android="http://schemas.android.com/apk/res/android">
  <changeImageTransform/>
</transitionSet>
```

`changeImageTransform` 元素对应 `ChangeImageTransform` 类。更多信息，请参见 `Transition`类的API文档。

要在代码中启用窗口内容切换，调用`Window.requestFeature()`函数：

```java
// inside your activity (if you did not enable transitions in your theme)
getWindow().requestFeature(Window.FEATURE_CONTENT_TRANSITIONS);

// set an exit transition
getWindow().setExitTransition(new Explode());
```

要声明变换类型，就要在`Transition`对象上调用以下函数：

* `Window.setEnterTransition()`
* `Window.setExitTransition()`
* `Window.setSharedElementEnterTransition()`
* `Window.setSharedElementExitTransition()`

`setExitTransition()` 和 `setSharedElementExitTransition()` 函数为activity定义了退出变换效果。`setEnterTransition()` 和 `setSharedElementEnterTransition()` 函数定义了进入activity的变换效果。

要获得切换的全部效果，你必须在出入的两个activity中都开启窗口内容切换。否则，调用的activity会使用退出效果，但是接着你会看到一个传统的窗口切换（比如缩放或淡入淡出）。

要尽早开始入场切换，可以在被调用的Activity上使用`Window.setAllowEnterTransitionOverlap()` 。它可以使你拥有更戏剧性的入场切换。

### 使用切换启动一个Activity

如果你开启Activity入场和退出效果，那么当你在用如下方法开始Activity时，切换效果会被应用：

```java
startActivity(intent,
              ActivityOptions.makeSceneTransitionAnimation(this).toBundle());
```

如果你为第二个Activity设定了入场变换，变换也会在activity开始时被启用。要在开始另一个acitivity时禁用变换，可以给bundle的选项提供一个`null`对象：

### 启动一个拥有共用元素的Activity

要在两个拥有共用元素的activity间进行切换动画：

1. 在主题中开启窗口内容切换
2. 在style中定义共有元素切换
3. 将切换定义为一个XML 资源文件
4. 使用`android:transitionName`属性在两个layout文件中给共有元素赋予同一个名字
5. 使用`ActivityOptions.makeSceneTransitionAnimation()`方法

```java
// get the element that receives the click event
final View imgContainerView = findViewById(R.id.img_container);

// get the common element for the transition in this activity
final View androidRobotView = findViewById(R.id.image_small);

// define a click listener
imgContainerView.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        Intent intent = new Intent(this, Activity2.class);
        // create the transition animation - the images in the layouts
        // of both activities are defined with android:transitionName="robot"
        ActivityOptions options = ActivityOptions
            .makeSceneTransitionAnimation(this, androidRobotView, "robot");
        // start the new activity
        startActivity(intent, options.toBundle());
    }
});
```

对于用代码编写的共有动态视图，使用`View.setTransitionName()`方法来在两个activity中定义共有元素。

要在第二个activity结束时进行逆向的场景切换动画，调用`Activity.finishAfterTransition()`方法，而不是`Activity.finish()`。

### 开始一个拥有多个共有元素的Activity

要在拥有多个共有元素的activity之间使用变换动画，就要用`android:transitionName`属性在两个layout中定义这个共有元素（或在两个Activity中使用`View.setTransitionName()`方法），再创建`ActivityOptions`对象：

```java
ActivityOptions options = ActivityOptions.makeSceneTransitionAnimation(this,
        Pair.create(view1, "agreedName1"),
        Pair.create(view2, "agreedName2"));
```

## 使用曲线动画

Material Design中的动画可以表示为基于时间插值和空间移动模式的曲线。在Android 5.0 (API level 21)以上版本中，你可以为动画定义时间曲线和曲线动画模式。

`PathInterpolator`类是一个基于贝泽尔曲线或`Path`对象的新的插值方法。**插值方法** 是一个定义在 1x1 正方形中的曲线函数图像，其始末两点分别在(0,0)和（1,1)，一个用构造函数定义的控制点。你也可以使用XML资源文件定义一个插值方法：

```xml
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
    android:controlX1="0.4"
    android:controlY1="0"
    android:controlX2="1"
    android:controlY2="1"/>
```

Material Design标准中，系统提供了三种基本的曲线：

* `@interpolator/fast_out_linear_in.xml`
* `@interpolator/fast_out_slow_in.xml`
* `@interpolator/linear_out_slow_in.xml`

你可以将一个`PathInterpolator`对象传给`Animator.setInterpolator()`方法。

`ObjectAnimator`类有一个新的构造函数，使你可以沿一条路径使用多个属性来在坐标系中进行变换。比如，以下animator（动画器，译者注）使用一个`Path`对象来改变一个试图的X和Y属性：

```java
ObjectAnimator mAnimator;
mAnimator = ObjectAnimator.ofFloat(view, View.X, View.Y, path);
...
mAnimator.start();
```

## 基于视图状态改变的动画

`StateListAnimator` 类是你可以定义在视图状态改变启动的Animator（动画器，译者注）。以下例子展示如何在XML文件中定义`StateListAnimator`：

```xml
<!-- animate the translationZ property of a view when pressed -->
<selector xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:state_pressed="true">
    <set>
      <objectAnimator android:propertyName="translationZ"
        android:duration="@android:integer/config_shortAnimTime"
        android:valueTo="2dp"
        android:valueType="floatType"/>
        <!-- you could have other objectAnimator elements
             here for "x" and "y", or other properties -->
    </set>
  </item>
  <item android:state_enabled="true"
    android:state_pressed="false"
    android:state_focused="true">
    <set>
      <objectAnimator android:propertyName="translationZ"
        android:duration="100"
        android:valueTo="0"
        android:valueType="floatType"/>
    </set>
  </item>
</selector>
```

要把视图改变Animator关联到一个视图，就要在XML资源文件的selector元素上定义一个Animator，并把此Animator赋值给视图的 `android:stateListAnimator` 属性。要想在Java代码中将状态列表Animator赋值给视图，使用`AnimationInflater.loadStateListAnimator()` 函数，并用`View.setStateListAnimator()`函数把Animator赋值给你的视图。

当你的主题继承于Material Theme的时候，Button默认会有一个Z值动画。为了避免Button的Z值动画，设定它的`android:stateListAnimator`属性为`@null`。

`AnimatedStateListDrawable`类使你可以创建一个在视图状态变化之间显示动画的drawable。有一些Android 5.0系统组件默认已经使用了这些动画。下面的例展示如何在XML资源文件中定义AnimatedStateListDrawable：

```xml
<!-- res/drawable/myanimstatedrawable.xml -->
<animated-selector
    xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- provide a different drawable for each state-->
    <item android:id="@+id/pressed" android:drawable="@drawable/drawableP"
        android:state_pressed="true"/>
    <item android:id="@+id/focused" android:drawable="@drawable/drawableF"
        android:state_focused="true"/>
    <item android:id="@id/default"
        android:drawable="@drawable/drawableD"/>

    <!-- specify a transition -->
    <transition android:fromId="@+id/default" android:toId="@+id/pressed">
        <animation-list>
            <item android:duration="15" android:drawable="@drawable/dt1"/>
            <item android:duration="15" android:drawable="@drawable/dt2"/>
            ...
        </animation-list>
    </transition>
    ...
</animated-selector>
```

## 动画矢量 Drawables

矢量Drawable是可以无损缩放的。`AnimatedVectorDrawable`类是你可以操作矢量Drawable。

你通常在3个XML文件中定义动画矢量Drawable：

* 在`res/drawable/`中用`<vector>`定义一个矢量drawable
* 在`res/drawable/`中用`<animated-vector>`定义一个动画矢量drawable
* 在`res/anim/'中定义一个或多个Animator

动画矢量drawable可以用在`<group>`和`<path>`元素的属性上。`<group>`元素定义了一些path或者subgroup，`<path>`定义了一条被绘画的路径。

当你想要定义一个动画的矢量drawable时，使用`android:name` 属性来为group和path赋值一个唯一的名字(name)，这样你可以通过animator的定义找到他们。比如：

```xml
<!-- res/drawable/vectordrawable.xml -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:height="64dp"
    android:width="64dp"
    android:viewportHeight="600"
    android:viewportWidth="600">
    <group
        android:name="rotationGroup"
        android:pivotX="300.0"
        android:pivotY="300.0"
        android:rotation="45.0" >
        <path
            android:name="v"
            android:fillColor="#000000"
            android:pathData="M300,70 l 0,-70 70,70 0,0 -70,70z" />
    </group>
</vector>
```

动画矢量drawable的定义是通过name属性来找到视图组(group)和路径(path)的：

```xml
<!-- res/drawable/animvectordrawable.xml -->
<animated-vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:drawable="@drawable/vectordrawable" >
    <target
        android:name="rotationGroup"
        android:animation="@anim/rotation" />
    <target
        android:name="v"
        android:animation="@anim/path_morph" />
</animated-vector>
```

动画的定义代表`ObjectAnimator`或者`AnimatorSet`对象。例子中第一个animator将目标组旋转了360度。

```xml
<!-- res/anim/rotation.xml -->
<objectAnimator
    android:duration="6000"
    android:propertyName="rotation"
    android:valueFrom="0"
    android:valueTo="360" />
```

第二个animator将矢量drawable的路径从一个形状(morph)变形到另一个。两个路径都必须是可以形变的：他们必须有相同数量的命令，每个命令必须有相同数量的参数

```xml
<!-- res/anim/path_morph.xml -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <objectAnimator
        android:duration="3000"
        android:propertyName="pathData"
        android:valueFrom="M300,70 l 0,-70 70,70 0,0   -70,70z"
        android:valueTo="M300,70 l 0,-70 70,0  0,140 -70,0 z"
        android:valueType="pathType" />
</set>
```

更多信息，请参考[`AnimatedVectorDrawable`](http://developer.android.com/reference/android/view/View.html#setSystemUiVisibility(int))的API指南。
