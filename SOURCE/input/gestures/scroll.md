> 编写: [Andrwyw](https://github.com/Andrwyw) - 校对:

> 原文：

# Scroll手势动画

Android中，通常使用[ScrollView][ScrollView_url]类来实现滚动。任何可能超过父类边界的布局都应该嵌套在一个[ScrollView][ScrollView_url]中，以提供一个由系统管理的可滚动的view。仅仅在某些特殊的情形下，才需要实现一个自定义的scroller。本节课程描述了这样一个情形：使用scrollers显示滚动效果来响应触摸手势。

你可以使用scrollers ([Scroller][Scroller_url]或者 [OverScroller][OverScroller_url])收集数据，再用这些数据来产生滚动动画来响应一个触摸事件。这两个类很相似，但是[OverScroller][OverScroller_url]包括一些函数，在平移或惯性滑动手势后，能向用户指出他们已经达到内容尽头了。**InteractiveChart**例子使用了[EdgeEffect][EdgeEffect_url]类（实际上是[EdgeEffectCompat][EdgeEffectCompat_url]类），用来当用户到达内容尽头时显示发光效果。

>注意：比起Scroller类，我们更推荐使用[OverScroller][OverScroller_url]类来产生滚动动画。[OverScroller][OverScroller_url]类为老设备提供了很好的向后兼容性。

>另外需要注意的是，当你自己实现滚动时，通常只需要使用scrollers。如果你把布局嵌套在[ScrollView][ScrollView_url]和[HorizontalScrollView][HorizontalScrollView_url]中，它们会帮你把这些做好。

通过使用平台标准的滚动物理定律（摩擦、速度等），scroller可用来产生滚动动画。scroller本身实际上不会绘制任何东西。Scrollers只是随着时间的推移帮你追踪滚动的偏移量，但它们不会自动地把这些位置应用到你的view上。你需要以某种让你的滚动动画更流畅的速度，来获取并应用新的坐标。

## 理解术语Scrolling ##

在Android中，“Scrolling”这个词根据不同情景有着不同的含义。

Scrolling是指视窗（指你正在看的内容所在的窗口）移动的一般过程。当scrolling是朝x、y轴两个方向时，这被叫做平移。示例程序提供的InteractiveChart类，展示了两种不同类型的scrolling，即拖拽与快速滑动。

- 拖拽是scrolling的一种类型，当用户在触摸屏上拖拽他们的手指时发生。通常可以重写[GestureDetector.OnGestureListener][OnGestureListener_url]的[onScroll()][onScroll_url]函数来简单地处理拖拽。关于拖拽的更多讨论，可以查看[拖拽与缩放](scale.html)章节。
- 快速滑动这种类型的scrolling，是在用户拖拽并快速移动手指时发生的。当用户移动手指后，你通常想继续保持scrolling(移动视窗)，但是会一直减速直到视窗停止移动。可以重写[GestureDetector.OnGestureListener][OnGestureListener_url]的[onFling()][onFling_url]函数来实现快速滑动的处理。这也是本节课程的做法。

虽然经常会把使用scroller对象与快速滑动手势结合起来，但在任何你想让UI展示scrolling动画来响应触摸事件的地方，他们都可以被拿来使用。比如，你可以重写[onTouchEvent()][onTouchEvent_url]函数来直接处理触摸事件，并且产生一个scrolling效果或快速翻页动画来响应这些触摸事件。

## 实现基于触摸的Scrolling ##

本节描述如何使用一个scroller。下面的代码段来自InteractiveChart样例的类中。它使用了[GestureDetector][GestureDetector_url]，并且重写了[GestureDetector.SimpleOnGestureListener][SimpleOnGestureListener_url]的[onFling()][onFling_url]函数。它使用[OverScroller][OverScroller_url]来追踪快速滑动手势。在快速滑动手势完成后，如果用户到达内容尽头，这个应用会显示出发光的效果。

>注意：**InteractiveChart**样例程序展示了一个可以缩放、平移、滑动的表格。在接下来的代码段中，**mContentRect**表示将被用来绘制表格的view的坐标区域。在某个给定的时间点，整个表格的某一部分会被绘制到这个区域内。**mCurrentViewport**表示表格当前在屏幕上可见的那一部分。因为像素偏移量通常当作整型处理，所以**mContentRect**是[Rect][Rect_url]类型的。因为图像的区域范围是数值型/浮点型值，所以**mCurrentViewport**是[RectF][RectF_url]类型的。

代码段的第一部分展示了[onFling()][onFling_url]函数的实现：

```java
//当前视窗（viewport）。这个矩形表示图表当前的可视区域范围。
//视窗是app中用户可通过触摸手势操作的那部分。
private RectF mCurrentViewport =
        new RectF(AXIS_X_MIN, AXIS_Y_MIN, AXIS_X_MAX, AXIS_Y_MAX);

// The current destination rectangle (in pixel coordinates) into which the
// chart data should be drawn.
private Rect mContentRect;

private OverScroller mScroller;
private RectF mScrollerStartViewport;
...
private final GestureDetector.SimpleOnGestureListener mGestureListener
        = new GestureDetector.SimpleOnGestureListener() {
    @Override
    public boolean onDown(MotionEvent e) {
        // Initiates the decay phase of any active edge effects.
        releaseEdgeEffects();
        mScrollerStartViewport.set(mCurrentViewport);
        // Aborts any active scroll animations and invalidates.
        mScroller.forceFinished(true);
        ViewCompat.postInvalidateOnAnimation(InteractiveLineGraphView.this);
        return true;
    }
    ...
    @Override
    public boolean onFling(MotionEvent e1, MotionEvent e2,
            float velocityX, float velocityY) {
        fling((int) -velocityX, (int) -velocityY);
        return true;
    }
};

private void fling(int velocityX, int velocityY) {
    // Initiates the decay phase of any active edge effects.
    releaseEdgeEffects();
    // Flings use math in pixels (as opposed to math based on the viewport).
    Point surfaceSize = computeScrollSurfaceSize();
    mScrollerStartViewport.set(mCurrentViewport);
    int startX = (int) (surfaceSize.x * (mScrollerStartViewport.left -
            AXIS_X_MIN) / (
            AXIS_X_MAX - AXIS_X_MIN));
    int startY = (int) (surfaceSize.y * (AXIS_Y_MAX -
            mScrollerStartViewport.bottom) / (
            AXIS_Y_MAX - AXIS_Y_MIN));
    // Before flinging, aborts the current animation.
    mScroller.forceFinished(true);
    // Begins the animation
    mScroller.fling(
            // Current scroll position
            startX,
            startY,
            velocityX,
            velocityY,
            /*
             * Minimum and maximum scroll positions. The minimum scroll
             * position is generally zero and the maximum scroll position
             * is generally the content size less the screen size. So if the
             * content width is 1000 pixels and the screen width is 200
             * pixels, the maximum scroll offset should be 800 pixels.
             */
            0, surfaceSize.x - mContentRect.width(),
            0, surfaceSize.y - mContentRect.height(),
            // The edges of the content. This comes into play when using
            // the EdgeEffect class to draw "glow" overlays.
            mContentRect.width() / 2,
            mContentRect.height() / 2);
    // Invalidates to trigger computeScroll()
    ViewCompat.postInvalidateOnAnimation(this);
}
```

当[onFling()][onFling_url]函数调用[postInvalidateOnAnimation()][postInvalidateOnAnimation_url]时，它会触发[computeScroll()][computeScroll_url]来更新x、y的值。通常在一个子view用scroller对象来产生滚动动画时会这样做，就如上面的例子一样。

大多数views直接通过[scrollTo()][scrollTo_url]函数给scroller对象传递x、y坐标值。接下来的[computeScroll()][computeScroll_url]函数的实现采用了一种不同的方式。它调用[computeScrollOffset()][computeScrollOffset_url]函数来获得当前位置的x、y值。

当满足显示边缘发光效果的条件时（显示被放大，x或y值超过边界，并且app当前并没有显示overscroll），这段代码会设置overscroll发光效果，并调用[postInvalidateOnAnimation()][postInvalidateOnAnimation_url]函数来让view失效重绘：

```java
// Edge effect / overscroll tracking objects.
private EdgeEffectCompat mEdgeEffectTop;
private EdgeEffectCompat mEdgeEffectBottom;
private EdgeEffectCompat mEdgeEffectLeft;
private EdgeEffectCompat mEdgeEffectRight;

private boolean mEdgeEffectTopActive;
private boolean mEdgeEffectBottomActive;
private boolean mEdgeEffectLeftActive;
private boolean mEdgeEffectRightActive;

@Override
public void computeScroll() {
    super.computeScroll();

    boolean needsInvalidate = false;

    // The scroller isn't finished, meaning a fling or programmatic pan
    // operation is currently active.
    if (mScroller.computeScrollOffset()) {
        Point surfaceSize = computeScrollSurfaceSize();
        int currX = mScroller.getCurrX();
        int currY = mScroller.getCurrY();

        boolean canScrollX = (mCurrentViewport.left > AXIS_X_MIN
                || mCurrentViewport.right < AXIS_X_MAX);
        boolean canScrollY = (mCurrentViewport.top > AXIS_Y_MIN
                || mCurrentViewport.bottom < AXIS_Y_MAX);

        /*
         * If you are zoomed in and currX or currY is
         * outside of bounds and you're not already
         * showing overscroll, then render the overscroll
         * glow edge effect.
         */
        if (canScrollX
                && currX < 0
                && mEdgeEffectLeft.isFinished()
                && !mEdgeEffectLeftActive) {
            mEdgeEffectLeft.onAbsorb((int)
                    OverScrollerCompat.getCurrVelocity(mScroller));
            mEdgeEffectLeftActive = true;
            needsInvalidate = true;
        } else if (canScrollX
                && currX > (surfaceSize.x - mContentRect.width())
                && mEdgeEffectRight.isFinished()
                && !mEdgeEffectRightActive) {
            mEdgeEffectRight.onAbsorb((int)
                    OverScrollerCompat.getCurrVelocity(mScroller));
            mEdgeEffectRightActive = true;
            needsInvalidate = true;
        }

        if (canScrollY
                && currY < 0
                && mEdgeEffectTop.isFinished()
                && !mEdgeEffectTopActive) {
            mEdgeEffectTop.onAbsorb((int)
                    OverScrollerCompat.getCurrVelocity(mScroller));
            mEdgeEffectTopActive = true;
            needsInvalidate = true;
        } else if (canScrollY
                && currY > (surfaceSize.y - mContentRect.height())
                && mEdgeEffectBottom.isFinished()
                && !mEdgeEffectBottomActive) {
            mEdgeEffectBottom.onAbsorb((int)
                    OverScrollerCompat.getCurrVelocity(mScroller));
            mEdgeEffectBottomActive = true;
            needsInvalidate = true;
        }
        ...
    }
```

这是缩放部分的代码：

```java
// Custom object that is functionally similar to Scroller
Zoomer mZoomer;
private PointF mZoomFocalPoint = new PointF();
...

// If a zoom is in progress (either programmatically or via double
// touch), performs the zoom.
if (mZoomer.computeZoom()) {
    float newWidth = (1f - mZoomer.getCurrZoom()) *
            mScrollerStartViewport.width();
    float newHeight = (1f - mZoomer.getCurrZoom()) *
            mScrollerStartViewport.height();
    float pointWithinViewportX = (mZoomFocalPoint.x -
            mScrollerStartViewport.left)
            / mScrollerStartViewport.width();
    float pointWithinViewportY = (mZoomFocalPoint.y -
            mScrollerStartViewport.top)
            / mScrollerStartViewport.height();
    mCurrentViewport.set(
            mZoomFocalPoint.x - newWidth * pointWithinViewportX,
            mZoomFocalPoint.y - newHeight * pointWithinViewportY,
            mZoomFocalPoint.x + newWidth * (1 - pointWithinViewportX),
            mZoomFocalPoint.y + newHeight * (1 - pointWithinViewportY));
    constrainViewport();
    needsInvalidate = true;
}
if (needsInvalidate) {
    ViewCompat.postInvalidateOnAnimation(this);
}

```

这是上面代码段中调用过的**computeScrollSurfaceSize()**函数。他会计算当前可滚动部分的尺寸，以像素为单位。举例来说，如果是个图标都是可见的，它的值就简单地等于**mContentRect**的大小。如果图表整体被放大到200%，此函数返回的尺寸为水平、垂直方向最大值的两倍。

```java
private Point computeScrollSurfaceSize() {
    return new Point(
            (int) (mContentRect.width() * (AXIS_X_MAX - AXIS_X_MIN)
                    / mCurrentViewport.width()),
            (int) (mContentRect.height() * (AXIS_Y_MAX - AXIS_Y_MIN)
                    / mCurrentViewport.height()));
}
```

查看[ViewPager][ViewPager_url]类的[源代码](http://github.com/android/platform_frameworks_support/blob/master/v4/java/android/support/v4/view/ViewPager.java)，可以发现另一个关于scroller用法示例。它用滚动来响应flings，使用scrolling来实现“对齐页(snapping to page)”动画。


[ScrollView_url]: http://developer.android.com/reference/android/widget/ScrollView.html "ScrollView"
[OverScroller_url]: http://developer.android.com/reference/android/widget/OverScroller.html "OverScroller"
[Scroller_url]: http://developer.android.com/reference/android/widget/Scroller.html "Scroller"
[EdgeEffect_url]: http://developer.android.com/reference/android/widget/EdgeEffect.html "EdgeEffect"
[EdgeEffectCompat_url]: http://developer.android.com/reference/android/support/v4/widget/EdgeEffectCompat.html "EdgeEffectCompat"
[HorizontalScrollView_url]: http://developer.android.com/reference/android/widget/HorizontalScrollView.html  "HorizontalScrollView"
[onScroll_url]: http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onScroll(android.view.MotionEvent,android.view.MotionEvent,float,float) "onScroll"
[SimpleOnGestureListener_url]:http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html "SimpleOnGestureListener"
[onFling_url]: http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onFling(android.view.MotionEvent,android.view.MotionEvent,float,float) "onFling"
[Rect_url]: http://developer.android.com/reference/android/graphics/Rect.html "Rect"
[RectF_url]: http://developer.android.com/reference/android/graphics/RectF.html "RectF"
[postInvalidateOnAnimation_url]: http://developer.android.com/reference/android/support/v4/view/ViewCompat.html#postInvalidateOnAnimation(android.view.View) "postInvalidateOnAnimation"
[computeScroll_url]: http://developer.android.com/reference/android/view/View.html#computeScroll() "computeScroll"
[computeScrollOffset_url]: http://developer.android.com/reference/android/widget/OverScroller.html#computeScrollOffset() "computeScrollOffset"
[scrollTo_url]: http://developer.android.com/reference/android/view/View.html#scrollTo(int,int) "scrollTo"
[ViewPager_url]: http://developer.android.com/reference/android/support/v4/view/ViewPager.html "ViewPager"
[OnGestureListener_url]: http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html "OnGestureListener"
[onTouchEvent_url]: http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent) "onTouchEvent"


