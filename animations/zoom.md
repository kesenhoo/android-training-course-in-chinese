# 缩放View

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/animation/zoom.html>

这节课示范怎样实现点击缩放动画，这对相册很有用，他能允许相片从缩略图转换成原图并填充屏幕提供动画。

下面展示了触摸缩放动画效果是什么样子，它将缩略图扩大并填充屏幕。

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_zoom.mp4" type="video/mp4">
    <source src="anim_zoom.webm" type="video/webm">
    <source src="anim_zoom.ogv" type="video/ogg">
</video>

</div>

如果你想跳过看整个例子，[下载](http://developer.android.com/shareables/training/Animations.zip) App 样例然后运行缩放的例子。查看下列文件中的代码实现：

* src/TouchHighlightImageButton.java（简单的helper类，当image button被按下它显示蓝色高亮）
* src/ZoomActivity.java
* layout/activity_zoom.xml

## 创建View

为你想缩放的内容创建一大一小两个版本布局文件。下面的例子为可点击的缩略图新建了一个 [ImageButton](http://developer.android.com/reference/android/widget/ImageButton.html) 和一个 [ImageView](http://developer.android.com/reference/android/widget/ImageView.html) 来展示原图：

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/container"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <LinearLayout android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <ImageButton
            android:id="@+id/thumb_button_1"
            android:layout_width="100dp"
            android:layout_height="75dp"
            android:layout_marginRight="1dp"
            android:src="@drawable/thumb1"
            android:scaleType="centerCrop"
            android:contentDescription="@string/description_image_1" />

    </LinearLayout>

    <!-- 这个初始化状态为隐藏的ImageView将会持有一个扩大/缩放版本的图片，并且浮于布局上层，
         没有动画施加在上面，并且占据整个屏幕。要实现“缩放”的动画，这个View是从上面的缩
         略图按钮的边界开始，扩大至最终的放大后的边界。
         -->

    <ImageView
        android:id="@+id/expanded_image"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:visibility="invisible"
        android:contentDescription="@string/description_zoom_touch_close" />

</FrameLayout>
```

## 设置缩放动画

一旦实现了布局，你需要设置触发缩放事件handler。下面的例子为[ImageButton](http://developer.android.com/reference/android/widget/ImageButton.html)添加了一个[View.OnClickListener](http://developer.android.com/reference/android/view/View.OnClickListener.html)，当用户点击按钮时它执行放大动画。

```java
public class ZoomActivity extends FragmentActivity {
    // 持有一个当前animator的引用,
    // 以后以便于中途取消动画.
    private Animator mCurrentAnimator;

    //这个系统内的“短”动画时长是以毫秒为单位的。
    //这个时长对于精确控制的动画或频繁激发的动画是非常理想的。
    private int mShortAnimationDuration;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_zoom);

        // 为缩略图连结点击事件
        final View thumb1View = findViewById(R.id.thumb_button_1);
        thumb1View.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                zoomImageFromThumb(thumb1View, R.drawable.image1);
            }
        });

        //获取并缓存系统默认定义的“短”动画时长
        mShortAnimationDuration = getResources().getInteger(
                android.R.integer.config_shortAnimTime);
    }
    ...
}
```

## 缩放View

你现在需要适时应用放大动画了。通常来说，你需要按边界来从小号View放大到大号View。下面的方法告诉你如何实现缩放动画：

1. 把高清图像设置到“放大版”隐藏的[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)中。为表简单，下面的例子在 UI 线程中加载了一张大图。但是你需要在一个单独的线程中来加载以免阻塞 UI 线程，然后再回到 UI 线程中设置。理想状况下，图片不要大过屏幕。

2. 计算[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)开始和结束时的边界。

3. 同步地动态改变四个位置和大小属性[X](http://developer.android.com/reference/android/view/View.html#X)，[Y](http://developer.android.com/reference/android/view/View.html#Y)（[SCALE_X](http://developer.android.com/reference/android/view/View.html#SCALE_X) 和 [SCALE_Y](http://developer.android.com/reference/android/view/View.html#SCALE_Y)），从起始点到结束点。这四个动画被加入到了[AnimatorSet](http://developer.android.com/reference/android/animation/AnimatorSet.html)，所以你可以一起开始。

4. 缩回则运行相同的动画，但是是用户点击屏幕放大时的逆向效果。你可以在[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)中添加一个[View.OnClickListener](http://developer.android.com/reference/android/view/View.OnClickListener.html)来实现它。当点击时，[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)缩回到原来缩略图的大小，然后设置它的visibility为[GONE](http://developer.android.com/reference/android/view/View.html#GONE)来隐藏。

```java
private void zoomImageFromThumb(final View thumbView, int imageResId) {
    //如果一个动画正在进行过程中，那么就要立即取消之前的动画并进行这一个。
    if (mCurrentAnimator != null) {
        mCurrentAnimator.cancel();
    }

    // 载入一个高分辨率的所谓 "已放大" 的图片.
    final ImageView expandedImageView = (ImageView) findViewById(
            R.id.expanded_image);
    expandedImageView.setImageResource(imageResId);

    // 为放大的图片计算开始动画和结束动画的矩形边界
    // 这个步骤牵扯到了大量的数学计算，YEAH!!坑爹的数学!!
    final Rect startBounds = new Rect();
    final Rect finalBounds = new Rect();
    final Point globalOffset = new Point();

    // 动画开始的边界是缩略图对全局可见的矩形，最终的边界是外部包裹的布局可见矩形。
    // 这里还设置了包裹视图的偏移量为原点的边界,因为这是原点为定位的动画属性(X, Y)。
    thumbView.getGlobalVisibleRect(startBounds);
    findViewById(R.id.container).getGlobalVisibleRect(finalBounds, globalOffset);
    startBounds.offset(-globalOffset.x, -globalOffset.y);
    finalBounds.offset(-globalOffset.x, -globalOffset.y);

    // 调整开始边界要和使用了“centerCrop”技术的最终边界保持相同的纵横比。
    // 这可以在动画过程中防止不希望出现的拉伸现象。还计算了开始大小的缩放系数
    // (结束大小的系数则一直为1.0)
    float startScale;
    if ((float) finalBounds.width() / finalBounds.height()
            > (float) startBounds.width() / startBounds.height()) {
        // 水平扩展开始边界
        startScale = (float) startBounds.height() / finalBounds.height();
        float startWidth = startScale * finalBounds.width();
        float deltaWidth = (startWidth - startBounds.width()) / 2;
        startBounds.left -= deltaWidth;
        startBounds.right += deltaWidth;
    } else {
        // 竖直扩展开始边界
        startScale = (float) startBounds.width() / finalBounds.width();
        float startHeight = startScale * finalBounds.height();
        float deltaHeight = (startHeight - startBounds.height()) / 2;
        startBounds.top -= deltaHeight;
        startBounds.bottom += deltaHeight;
    }

    // 隐藏缩略图并显示放大后的View。当动画开始，将在缩略图的位置定位放大的视图
    thumbView.setAlpha(0f);
    expandedImageView.setVisibility(View.VISIBLE);

    // 设置锚点，以放大后的View左上角坐标为准来准备 SCALE_X 和 SCALE_Y 变换
    // (默认为View的中心)
    expandedImageView.setPivotX(0f);
    expandedImageView.setPivotY(0f);

    // 构建并并行化运行4个平移动画和缩放属性(X, Y, SCALE_X, and SCALE_Y)
    AnimatorSet set = new AnimatorSet();
    set
            .play(ObjectAnimator.ofFloat(expandedImageView, View.X,
                    startBounds.left, finalBounds.left))
            .with(ObjectAnimator.ofFloat(expandedImageView, View.Y,
                    startBounds.top, finalBounds.top))
            .with(ObjectAnimator.ofFloat(expandedImageView, View.SCALE_X,
            startScale, 1f)).with(ObjectAnimator.ofFloat(expandedImageView,
                    View.SCALE_Y, startScale, 1f));
    set.setDuration(mShortAnimationDuration);
    set.setInterpolator(new DecelerateInterpolator());
    set.addListener(new AnimatorListenerAdapter() {
        @Override
        public void onAnimationEnd(Animator animation) {
            mCurrentAnimator = null;
        }

        @Override
        public void onAnimationCancel(Animator animation) {
            mCurrentAnimator = null;
        }
    });
    set.start();
    mCurrentAnimator = set;

    // 点击放大后的图片，应该是缩放回原来的边界并显示缩略图
    // 而不是显示扩大的图
    final float startScaleFinal = startScale;
    expandedImageView.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            if (mCurrentAnimator != null) {
                mCurrentAnimator.cancel();
            }

            // 开始并行动画这四个位置/大小属性，直到归至原始值。
            AnimatorSet set = new AnimatorSet();
            set.play(ObjectAnimator
                        .ofFloat(expandedImageView, View.X, startBounds.left))
                        .with(ObjectAnimator
                                .ofFloat(expandedImageView,
                                        View.Y,startBounds.top))
                        .with(ObjectAnimator
                                .ofFloat(expandedImageView,
                                        View.SCALE_X, startScaleFinal))
                        .with(ObjectAnimator
                                .ofFloat(expandedImageView,
                                        View.SCALE_Y, startScaleFinal));
            set.setDuration(mShortAnimationDuration);
            set.setInterpolator(new DecelerateInterpolator());
            set.addListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    thumbView.setAlpha(1f);
                    expandedImageView.setVisibility(View.GONE);
                    mCurrentAnimator = null;
                }

                @Override
                public void onAnimationCancel(Animator animation) {
                    thumbView.setAlpha(1f);
                    expandedImageView.setVisibility(View.GONE);
                    mCurrentAnimator = null;
                }
            });
            set.start();
            mCurrentAnimator = set;
        }
    });
}
```
