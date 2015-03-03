# 展示卡片翻转动画

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/animation/cardflip.html>

这节课展示如何使用自定义 fragment 动画实现卡片翻转动画。通过展示一个模拟卡片翻转的动画实现 view 内容的卡片翻转效果。

下面是卡片翻转动画的样子：

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_card_flip.mp4" type="video/mp4">
    <source src="anim_card_flip.webm" type="video/webm">
    <source src="anim_card_flip.ogv" type="video/ogg">
</video>

</div>

如果你想跳过看整个例子，[下载](http://developer.android.com/shareables/training/Animations.zip) App 样例然后运行卡片翻转例子。查看下列文件中的代码实现：

* src/CardFlipActivity.java
* animator/card_flip_right_in.xml
* animator/card_flip_right_out.xml
* animator/card_flip_left_in.xml
* animator/card_flip_left_out.xml
* layout/fragment_card_back.xml
* layout/fragment_card_front.xml

## 创建Animator

创建卡片翻转动画，你需要两个 animator 让前面的卡片向右翻转消失，向左翻转出现。你还需要两个 animator 让背面的卡片向左翻转出现，向右翻转消失。

**card_flip_left_in.xml**

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android">

    <!--旋转之前，立刻设置透明度alpha为0-->
    <objectAnimator
        android:valueFrom="1.0"
        android:valueTo="0.0"
        android:propertyName="alpha"
        android:duration="0" />

    <!--旋转-->
    <objectAnimator
        android:valueFrom="-180"
        android:valueTo="0"
        android:propertyName="rotationY"
        android:interpolator="@android:interpolator/accelerate_decelerate"
        android:duration="@integer/card_flip_time_full" />

    <!--旋转中途(时间偏移量取决于startOffset属性)设置透明度为1-->
    <objectAnimator
        android:valueFrom="0.0"
        android:valueTo="1.0"
        android:propertyName="alpha"
        android:startOffset="@integer/card_flip_time_half"
        android:duration="1" />
</set>
```

**card_flip_left_out.xml**

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 旋转. -->
    <objectAnimator
        android:valueFrom="0"
        android:valueTo="180"
        android:propertyName="rotationY"
        android:interpolator="@android:interpolator/accelerate_decelerate"
        android:duration="@integer/card_flip_time_full" />

    <!--旋转中途(时间偏移量取决于startOffset属性)设置透明度为0-->
    <objectAnimator
        android:valueFrom="1.0"
        android:valueTo="0.0"
        android:propertyName="alpha"
        android:startOffset="@integer/card_flip_time_half"
        android:duration="1" />
</set>
```

**card_flip_right_in.xml**

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <!--旋转之前，立刻设置透明度alpha为0-->
    <objectAnimator
        android:valueFrom="1.0"
        android:valueTo="0.0"
        android:propertyName="alpha"
        android:duration="0" />

    <!-- 旋转. -->
    <objectAnimator
        android:valueFrom="180"
        android:valueTo="0"
        android:propertyName="rotationY"
        android:interpolator="@android:interpolator/accelerate_decelerate"
        android:duration="@integer/card_flip_time_full" />

    <!--旋转中途(时间偏移量取决于startOffset属性)设置透明度为1-->
    <objectAnimator
        android:valueFrom="0.0"
        android:valueTo="1.0"
        android:propertyName="alpha"
        android:startOffset="@integer/card_flip_time_half"
        android:duration="1" />

```

**card_flip_right_out.xml**

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 旋转. -->
    <objectAnimator
        android:valueFrom="0"
        android:valueTo="-180"
        android:propertyName="rotationY"
        android:interpolator="@android:interpolator/accelerate_decelerate"
        android:duration="@integer/card_flip_time_full" />

    <!--旋转中途(时间偏移量取决于startOffset属性)设置透明度为0-->
    <objectAnimator
        android:valueFrom="1.0"
        android:valueTo="0.0"
        android:propertyName="alpha"
        android:startOffset="@integer/card_flip_time_half"
        android:duration="1" />
</set>
```

## 创建View

卡片的每一面是一个独立包含你想要内容的布局，比如两屏文字，两张图片，或者任何view的组合。然后你将在应用动画的fragment里面用到这俩布局。下面的布局创建了卡片展示文本一面的布局：

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#a6c"
    android:padding="16dp"
    android:gravity="bottom">

    <TextView android:id="@android:id/text1"
        style="?android:textAppearanceLarge"
        android:textStyle="bold"
        android:textColor="#fff"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/card_back_title" />

    <TextView style="?android:textAppearanceSmall"
        android:textAllCaps="true"
        android:textColor="#80ffffff"
        android:textStyle="bold"
        android:lineSpacingMultiplier="1.2"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/card_back_description" />

</LinearLayout>
```

卡片另一面显示一个 [ImageView](http://developer.android.com/reference/android/widget/ImageView.html)：

```xml
<ImageView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:src="@drawable/image1"
    android:scaleType="centerCrop"
    android:contentDescription="@string/description_image_1" />
```

## 创建Fragment

为卡片正反面创建fragment，这些类从<a href="http://developer.android.com/reference/android/app/Fragment.html#onCreateView(android.view.LayoutInflater, android.view.ViewGroup, android.os.Bundle)"> onCreateView() </a>方法中分别为每个framgent返回你之前创建的布局。在父activity中，你可以在你想要显示卡片时创建对应的 fragment 实例。下面的例子展示父activity内嵌套的fragment：

```java
public class CardFlipActivity extends Activity {
    ...
    /**
     * 一个呈现在卡片前方的fragment
     */
    public class CardFrontFragment extends Fragment {
        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                Bundle savedInstanceState) {
            return inflater.inflate(R.layout.fragment_card_front, container, false);
        }
    }

    /**
     * 一个呈现在卡片后方的fragment
     */
    public class CardBackFragment extends Fragment {
        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                Bundle savedInstanceState) {
            return inflater.inflate(R.layout.fragment_card_back, container, false);
        }
    }
}
```

## 应用卡片翻转动画

现在，你需要在父activity中展示fragment。为做这件事，首先创建你activity的布局。下面例子创建了一个你可以在运行时添加fragment的 [FrameLayout](http://developer.android.com/reference/android/widget/FrameLayout.html)。

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/container"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```
在activity代码中，把刚创建的布局设置成content view。当activity创建时展示一个默认的fragment是个不错的注意。所以下面的activity样例告诉你如何默认显示卡片正面：

```java
public class CardFlipActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_activity_card_flip);

        if (savedInstanceState == null) {
            getFragmentManager()
                    .beginTransaction()
                    .add(R.id.container, new CardFrontFragment())
                    .commit();
        }
    }
    ...
}
```

既然现在显示了卡片的正面，你可以在合适时机用翻转动画显示卡片背面了。创建一个方法来显示背面需要做下面这些事情：

* 为fragment转换设置你刚做的自定义动画

* 用新fragment替换当前显示的fragment，并且应用你刚创建的动画到这个事件中。

* 添加之前显示的fragment到fragment的back stack中，所以当用户摁 *Back* 键时，卡片会翻转回来。

```java
private void flipCard() {
    if (mShowingBack) {
        getFragmentManager().popBackStack();
        return;
    }

    // 向后翻转.

    mShowingBack = true;

    // 创建并提交一个新的Fragment事务用于在卡片后面添加Fragment，使用自定义动画，并且加入
    // Fragment管理器回退栈
    getFragmentManager()
            .beginTransaction()

            // 用动画器资源呈现卡片自前向后的旋转效果替换默认的Fragment动画，
            // 当翻转到前面的时候动画器资源也可以呈现自后向前的旋转效果（例如按下系统返回键时）
            .setCustomAnimations(
                    R.animator.card_flip_right_in, R.animator.card_flip_right_out,
                    R.animator.card_flip_left_in, R.animator.card_flip_left_out)

            // 用一个Fragment替换任何当前在容器布局内的Fragment来呈现下一页
            //（通过仅自增的变量currentPage来表示）
            .replace(R.id.container, new CardBackFragment())

            // 添加这个事务到回退栈，允许用户来按下返回按钮来回退到卡片正面.
            .addToBackStack(null)

            // 提交完成事务.
            .commit();
}
```
