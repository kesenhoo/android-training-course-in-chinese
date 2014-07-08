> 编写:Andrwyw

> 校对:

# Scroll手势动画

Android中，通常使用[ScrollView][ScrollView_url]类来实现滚动。任何可能超过父类边界的布局都应该嵌套在一个[ScrollView][ScrollView_url]中，以提供一个由系统管理的可滚动的view。仅仅在某些特殊的情形下，才需要实现一个自定义的scroller。本节课程描述了这样一个情形：使用scrollers显示滚动效果来响应触摸手势。

你可以使用scrollers ([Scroller][Scroller_url] or [OverScroller][OverScroller_url])收集数据，用这些数据来产生滚动动画来响应一个触摸事件。这两个类很相似，但是[OverScroller][OverScroller_url]包括一些函数，在平移或惯性滑动手势后，能向用户指出他们已经达到内容尽头了。InteractiveChart例子使用了[EdgeEffect][EdgeEffect_url]类（实际上是[EdgeEffectCompat][EdgeEffectCompat_url]类），用来当用户到达内容尽头时显示发光效果。

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

本节描述如何使用一个scroller。下面的代码段来自InteractiveChart样例的类中。它使用了GestureDetector，并且重写了GestureDetector.SimpleOnGestureListener的onFling()函数。它使用OverScroller来追踪快速滑动手势。在快速滑动手势完成后，如果用户到达内容尽头，，这个应用会显示出发给的效果。

>注意：InteractiveChart样例程序展示了一个可以缩放、平移、滑动的表格。在接下来的代码段中，mContentRect表示将被用来绘制表格的view的坐标区域。在某个给定的时间点，整个表格的某一部分会被绘制到这个区域内。mCurrentViewport表示表格当前在屏幕上可见的那一部分。因为像素偏移量通常当作整型处理，所以mContentRect是Rect类型的。因为图像的区域范围是数值型/浮点型值，所以mCurrentViewport是RectF类型的。

代码段的第一部分展示了onFling()函数的实现：

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

ScrollView_url
OverScroller_url
Scroller_url
EdgeEffect_url
EdgeEffectCompat_url
onScroll_url
onFling_url
OnGestureListener_url
onTouchEvent_url










