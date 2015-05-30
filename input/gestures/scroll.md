# 滚动手势动画

> 编写:[Andrwyw](https://github.com/Andrwyw) - 原文:<http://developer.android.com/training/gestures/scroll.html>

在Android中，通常使用[ScrollView](http://developer.android.com/reference/android/widget/ScrollView.html)类来实现滚动（scroll）。任何可能超过父类边界的布局，都应该嵌套在[ScrollView](http://developer.android.com/reference/android/widget/ScrollView.html)中，来提供一个由系统框架管理的可滚动的view。仅在某些特殊情形下，我们才要实现一个自定义scroller。本节课程就描述了这样一个情形：使用 *scrollers* 显示滚动效果，以响应触摸手势。

为了收集数据来产生滚动动画，以响应一个触摸事件，我们可以使用scrollers（[Scroller](http://developer.android.com/reference/android/widget/Scroller.html)或者[OverScroller](http://developer.android.com/reference/android/widget/OverScroller.html)）。这两个类很相似，但[OverScroller](http://developer.android.com/reference/android/widget/OverScroller.html)有一些函数，能在平移或快速滑动手势后，向用户指出已经达到内容的边缘。`InteractiveChart` 例子使用了[EdgeEffect](http://developer.android.com/reference/android/widget/EdgeEffect.html)类（实际上是[EdgeEffectCompat](http://developer.android.com/reference/android/support/v4/widget/EdgeEffectCompat.html)类），在用户到达内容的边缘时显示“发光”效果。

>**Note:** 比起Scroller类，我们更推荐使用[OverScroller](http://developer.android.com/reference/android/widget/OverScroller.html)类来产生滚动动画。[OverScroller](http://developer.android.com/reference/android/widget/OverScroller.html)类为老设备提供了很好的向后兼容性。
>另外需要注意的是，仅当我们要自己实现滚动时，才需要使用scrollers。如果我们把布局嵌套在[ScrollView](http://developer.android.com/reference/android/widget/ScrollView.html)和[HorizontalScrollView](http://developer.android.com/reference/android/widget/HorizontalScrollView.html)中，它们会帮我们把这些做好。

通过使用平台标准的滚动物理因素（摩擦、速度等），scroller被用来随着时间的推移产生滚动动画。实际上，scroller本身不会绘制任何东西。Scrollers只是随着时间的推移，追踪滚动的偏移量，但它们不会自动地把这些位置应用到view上。我们应该按一定频率，获取并应用这些新的坐标值，来让滚动动画更加顺滑。

## 理解滚动术语

在Android中，“Scrolling”这个词根据不同情景有着不同的含义。

**滚动**（Scrolling）是指移动视窗（viewport）（指你正在看的内容所在的‘窗口’）的一般过程。当在x轴和y轴方向同时滚动时，就叫做*平移*（*panning*）。示例程序提供的 `InteractiveChart` 类，展示了两种不同类型的滚动，拖拽与快速滑动。

- **拖拽**（dragging）是滚动的一种类型，当用户在触摸屏上拖动手指时发生。简单的拖拽一般可以通过重写 [GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html) 的 <a href="http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onScroll(android.view.MotionEvent,android.view.MotionEvent,float,float)">onScroll()</a> 来实现。关于拖拽的更多讨论，可以查看[**拖拽与缩放**](scale.html)章节。
- **快速滑动**（fling）这种类型的滚动，在用户快速拖拽后，抬起手指时发生。当用户抬起手指后，我们通常想继续保持滚动（移动视窗），但会一直减速直到视窗停止移动。通过重写[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)的<a href="http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onFling(android.view.MotionEvent,android.view.MotionEvent,float,float)">onFling()</a>函数，使用scroller对象，可实现快速滑动。这种用法也就是本节课程的主题。

scroller对象通常会与快速滑动手势结合起来使用。但在任何我们想让UI展示滚动动画，以响应触摸事件的场景，都可以用scroller对象来实现。比如，我们可以重写<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>函数，直接处理触摸事件，并且产生一个滚动效果或“页面对齐”动画(snapping to page)，来响应这些触摸事件。

## 实现基于触摸的滚动

本节讲述如何使用scroller。下面的代码段来自 `InteractiveChart` 示例。它使用[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)，并且重写了[GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html)的 `onFling()` 函数。它使用[OverScroller](http://developer.android.com/reference/android/widget/OverScroller.html)追踪快速滑动（fling）手势。快速滑动手势后，如果用户到达内容边缘，应用会显示一种发光效果。

> **Note:** `InteractiveChart`示例程序展示了一个可缩放、平移、滑动的表格。在接下来的代码段中，`mContentRect`表示view中的一块矩形坐标区域，该区域将被用来绘制表格。在任意给定的时间点，表格中某一部分会被绘制在这个区域内。`mCurrentViewport`表示当前在屏幕上可见的那一部分表格。因为像素偏移量通常当作整型处理，所以`mContentRect`是[Rect](http://developer.android.com/reference/android/graphics/Rect.html)类型的。因为图表的区域范围是数值型/浮点型值，所以`mCurrentViewport`是[RectF](http://developer.android.com/reference/android/graphics/RectF.html)类型。

代码段的第一部分展示了`onFling()`函数的实现：

```java
// The current viewport. This rectangle represents the currently visible 
// chart domain and range. The viewport is the part of the app that the
// user manipulates via touch gestures.
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

当`onFling()`函数调用<a href="http://developer.android.com/reference/android/support/v4/view/ViewCompat.html#postInvalidateOnAnimation(android.view.View)">postInvalidateOnAnimation()</a>时，它会触发<a href="http://developer.android.com/reference/android/view/View.html#computeScroll()">computeScroll()</a>来更新x、y的值。通常一个子view用scroller对象来产生滚动动画时会这样做，就像本例一样。

大多数views直接通过<a href="http://developer.android.com/reference/android/view/View.html#scrollTo(int,int)">scrollTo()</a>函数传递scroller对象的x、y坐标值。接下来的`computeScroll()`函数的实现中采用了一种不同的方式。它调用<a href="http://developer.android.com/reference/android/widget/OverScroller.html#computeScrollOffset()">computeScrollOffset()</a>函数来获得当前位置的x、y值。当满足边缘显示发光效果的条件时（图表已被放大显示，x或y值超过边界，并且app当前没有显示overscroll），这段代码会设置overscroll发光效果，并调用`postInvalidateOnAnimation()`函数来让view失效重绘：

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

这是上面代码段中调用过的`computeScrollSurfaceSize()`函数。它会以像素为单位计算当前可滚动的尺寸。举例来说，如果整个图表区域都是可见的，它的值就简单地等于`mContentRect`的大小。如果图表在两个方向上都放大到200%，此函数返回的尺寸在水平、垂直方向上都会大两倍。

```java
private Point computeScrollSurfaceSize() {
    return new Point(
            (int) (mContentRect.width() * (AXIS_X_MAX - AXIS_X_MIN)
                    / mCurrentViewport.width()),
            (int) (mContentRect.height() * (AXIS_Y_MAX - AXIS_Y_MIN)
                    / mCurrentViewport.height()));
}
```

关于scroller用法的另一个示例，可查看[ViewPager](http://developer.android.com/reference/android/support/v4/view/ViewPager.html)类的[源代码](http://github.com/android/platform_frameworks_support/blob/master/v4/java/android/support/v4/view/ViewPager.java)。它用滚动来响应快速滑动（fling），并且使用滚动来实现“页面对齐”(snapping to page)动画。
