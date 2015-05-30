# 拖拽与缩放

> 编写:[Andrwyw](https://github.com/Andrwyw) - 原文:<http://developer.android.com/training/gestures/scale.html>

本节课程讲述，使用<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>截获触摸事件后，如何使用触摸手势拖拽、缩放屏幕上的对象。

## 拖拽一个对象

> 如果我们的目标版本为3.0或以上，我们可以使用[View.OnDragListener](http://developer.android.com/reference/android/view/View.OnDragListener.html)监听内置的拖放（drag-and-drop）事件，[拖拽与释放](http://developer.android.com/guide/topics/ui/drag-drop.html)中有更多相关描述。

对于触摸手势来说，一个很常见的操作是在屏幕上拖拽一个对象。接下来的代码段让用户可以拖拽屏幕上的图片。需要注意以下几点：

- 拖拽操作时，即使有额外的手指放置到屏幕上了，app也必须保持对最初的点（手指）的追踪。比如，想象在拖拽图片时，用户放置了第二根手指在屏幕上，并且抬起了第一根手指。如果我们的app只是单独地追踪每个点，它会把第二个点当做默认的点，并且把图片移到该点的位置。
- 为了防止这种情况发生，我们的app需要区分初始点以及随后任意的触摸点。要做到这一点，它需要追踪[**处理多触摸手势**](multi.html)章节中提到过的 [ACTION_POINTER_DOWN](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_POINTER_DOWN) 和 [ACTION_POINTER_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_POINTER_UP) 事件。每当第二根手指按下或拿起时，[ACTION_POINTER_DOWN](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_POINTER_DOWN) 和 [ACTION_POINTER_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_POINTER_UP) 事件就会传递给`onTouchEvent()`回调函数。
- 当[ACTION_POINTER_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_POINTER_UP)事件发生时，示例程序会移除对该点的索引值的引用，确保操作中的点的ID(the active pointer ID)不会引用已经不在触摸屏上的触摸点。这种情况下，app会选择另一个触摸点来作为操作中(active)的点，并保存它当前的x、y值。由于在[ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE)事件时，这个保存的位置会被用来计算屏幕上的对象将要移动的距离，所以app会始终根据正确的触摸点来计算移动的距离。

下面的代码段允许用户拖拽屏幕上的对象。它会记录操作中的点（active pointer）的初始位置，计算触摸点移动过的距离，再把对象移动到新的位置。如上所述，它也正确地处理了额外触摸点的可能。

需要注意的是，代码段中使用了<a href="http://developer.android.com/reference/android/view/MotionEvent.html#getActionMasked()">getActionMasked()</a>函数。我们应该始终使用这个函数（或者最好用<a href="http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#getActionMasked(android.view.MotionEvent)">MotionEventCompat.getActionMasked()</a>这个兼容版本）来获得[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)对应的动作(action)。不像旧的<a href="http://developer.android.com/reference/android/view/MotionEvent.html#getAction()">getAction()</a>函数，`getActionMasked()`就是设计用来处理多点触摸的。它会返回执行过的动作的掩码值，不包括该点的索引位。

```java
// The ‘active pointer’ is the one currently moving our object.
private int mActivePointerId = INVALID_POINTER_ID;

@Override
public boolean onTouchEvent(MotionEvent ev) {
    // Let the ScaleGestureDetector inspect all events.
    mScaleDetector.onTouchEvent(ev);

    final int action = MotionEventCompat.getActionMasked(ev);

    switch (action) {
    case MotionEvent.ACTION_DOWN: {
        final int pointerIndex = MotionEventCompat.getActionIndex(ev);
        final float x = MotionEventCompat.getX(ev, pointerIndex);
        final float y = MotionEventCompat.getY(ev, pointerIndex);

        // Remember where we started (for dragging)
        mLastTouchX = x;
        mLastTouchY = y;
        // Save the ID of this pointer (for dragging)
        mActivePointerId = MotionEventCompat.getPointerId(ev, 0);
        break;
    }

    case MotionEvent.ACTION_MOVE: {
        // Find the index of the active pointer and fetch its position
        final int pointerIndex =
                MotionEventCompat.findPointerIndex(ev, mActivePointerId);

        final float x = MotionEventCompat.getX(ev, pointerIndex);
        final float y = MotionEventCompat.getY(ev, pointerIndex);

        // Calculate the distance moved
        final float dx = x - mLastTouchX;
        final float dy = y - mLastTouchY;

        mPosX += dx;
        mPosY += dy;

        invalidate();

        // Remember this touch position for the next move event
        mLastTouchX = x;
        mLastTouchY = y;

        break;
    }

    case MotionEvent.ACTION_UP: {
        mActivePointerId = INVALID_POINTER_ID;
        break;
    }

    case MotionEvent.ACTION_CANCEL: {
        mActivePointerId = INVALID_POINTER_ID;
        break;
    }

    case MotionEvent.ACTION_POINTER_UP: {

        final int pointerIndex = MotionEventCompat.getActionIndex(ev);
        final int pointerId = MotionEventCompat.getPointerId(ev, pointerIndex);

        if (pointerId == mActivePointerId) {
            // This was our active pointer going up. Choose a new
            // active pointer and adjust accordingly.
            final int newPointerIndex = pointerIndex == 0 ? 1 : 0;
            mLastTouchX = MotionEventCompat.getX(ev, newPointerIndex);
            mLastTouchY = MotionEventCompat.getY(ev, newPointerIndex);
            mActivePointerId = MotionEventCompat.getPointerId(ev, newPointerIndex);
        }
        break;
    }
    }
    return true;
}
```

## 通过拖拽平移

前一节展示了一个，在屏幕上拖拽对象的例子。另一个常见的场景是*平移*（*panning*），平移是指用户通过拖拽移动引起x、y轴方向发生滚动(scrolling)。上面的代码段直接截获了[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)动作来实现拖拽。这一部分的代码段，利用了平台对常用手势的内置支持。它重写了[GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html)的<a href="http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onScroll(android.view.MotionEvent, android.view.MotionEvent, float, float)">onScroll()</a>函数。

更详细地说，当用户拖拽手指来平移内容时，`onScroll()`函数就会被调用。`onScroll()`函数只会在手指按下的情况下被调用，一旦手指离开屏幕了，要么手势终止，要么快速滑动(fling)手势开始（如果手指在离开屏幕前快速移动了一段距离）。关于滚动与快速滑动的更多讨论，可以查看[滚动手势动画](scroll.html)章节。

这里是`onScroll()`的相关代码段：

```java
// The current viewport. This rectangle represents the currently visible
// chart domain and range.
private RectF mCurrentViewport =
        new RectF(AXIS_X_MIN, AXIS_Y_MIN, AXIS_X_MAX, AXIS_Y_MAX);

// The current destination rectangle (in pixel coordinates) into which the
// chart data should be drawn.
private Rect mContentRect;

private final GestureDetector.SimpleOnGestureListener mGestureListener
            = new GestureDetector.SimpleOnGestureListener() {
...

@Override
public boolean onScroll(MotionEvent e1, MotionEvent e2,
            float distanceX, float distanceY) {
    // Scrolling uses math based on the viewport (as opposed to math using pixels).

    // Pixel offset is the offset in screen pixels, while viewport offset is the
    // offset within the current viewport.
    float viewportOffsetX = distanceX * mCurrentViewport.width()
            / mContentRect.width();
    float viewportOffsetY = -distanceY * mCurrentViewport.height()
            / mContentRect.height();
    ...
    // Updates the viewport, refreshes the display.
    setViewportBottomLeft(
            mCurrentViewport.left + viewportOffsetX,
            mCurrentViewport.bottom + viewportOffsetY);
    ...
    return true;
}
```

`onScroll()`函数中滑动视窗(viewport)来响应触摸手势的实现：

```java
/**
 * Sets the current viewport (defined by mCurrentViewport) to the given
 * X and Y positions. Note that the Y value represents the topmost pixel position,
 * and thus the bottom of the mCurrentViewport rectangle.
 */
private void setViewportBottomLeft(float x, float y) {
    /*
     * Constrains within the scroll range. The scroll range is simply the viewport
     * extremes (AXIS_X_MAX, etc.) minus the viewport size. For example, if the
     * extremes were 0 and 10, and the viewport size was 2, the scroll range would
     * be 0 to 8.
     */

    float curWidth = mCurrentViewport.width();
    float curHeight = mCurrentViewport.height();
    x = Math.max(AXIS_X_MIN, Math.min(x, AXIS_X_MAX - curWidth));
    y = Math.max(AXIS_Y_MIN + curHeight, Math.min(y, AXIS_Y_MAX));

    mCurrentViewport.set(x, y - curHeight, x + curWidth, y);

    // Invalidates the View to update the display.
    ViewCompat.postInvalidateOnAnimation(this);
}
```

## 使用触摸手势进行缩放

如同[检测常用手势](detector.html)章节中提到的，[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)可以帮助我们检测Android中的常见手势，例如滚动，快速滚动以及长按。对于缩放，Android也提供了[ScaleGestureDetector](http://developer.android.com/reference/android/view/ScaleGestureDetector.html)类。当我们想让view能识别额外的手势时，我们可以同时使用[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)和[ScaleGestureDetector](http://developer.android.com/reference/android/view/ScaleGestureDetector.html)类。

为了报告检测到的手势事件，手势检测需要一个作为构造函数参数的listener对象。[ScaleGestureDetector](1http://developer.android.com/reference/android/view/ScaleGestureDetector.html)使用[ScaleGestureDetector.OnScaleGestureListener](http://developer.android.com/reference/android/view/ScaleGestureDetector.OnScaleGestureListener.html)。Android提供了[ScaleGestureDetector.SimpleOnScaleGestureListener](http://developer.android.com/reference/android/view/ScaleGestureDetector.SimpleOnScaleGestureListener.html)类作为帮助类，如果我们不是关注所有的手势事件，我们可以继承(extend)它。

### 基本的缩放示例

下面的代码段展示了缩放功能中的基本部分。

```java
private ScaleGestureDetector mScaleDetector;
private float mScaleFactor = 1.f;

public MyCustomView(Context mContext){
    ...
    // View code goes here
    ...
    mScaleDetector = new ScaleGestureDetector(context, new ScaleListener());
}

@Override
public boolean onTouchEvent(MotionEvent ev) {
    // Let the ScaleGestureDetector inspect all events.
    mScaleDetector.onTouchEvent(ev);
    return true;
}

@Override
public void onDraw(Canvas canvas) {
    super.onDraw(canvas);

    canvas.save();
    canvas.scale(mScaleFactor, mScaleFactor);
    ...
    // onDraw() code goes here
    ...
    canvas.restore();
}

private class ScaleListener
        extends ScaleGestureDetector.SimpleOnScaleGestureListener {
    @Override
    public boolean onScale(ScaleGestureDetector detector) {
        mScaleFactor *= detector.getScaleFactor();

        // Don't let the object get too small or too large.
        mScaleFactor = Math.max(0.1f, Math.min(mScaleFactor, 5.0f));

        invalidate();
        return true;
    }
}
```

### 更加复杂的缩放示例

这是本章节提供的`InteractiveChart`示例中一个更复杂的示范。通过使用[ScaleGestureDetector](http://developer.android.com/reference/android/view/ScaleGestureDetector.html)中的"span"(<a href="http://developer.android.com/reference/android/view/ScaleGestureDetector.html#getCurrentSpanX()">getCurrentSpanX/Y</a>)和"focus"(<a href="http://developer.android.com/reference/android/view/ScaleGestureDetector.html#getFocusX()">getFocusX/Y</a>)功能，`InteractiveChart`示例同时支持滚动（平移）以及多指缩放。

```java
@Override
private RectF mCurrentViewport =
        new RectF(AXIS_X_MIN, AXIS_Y_MIN, AXIS_X_MAX, AXIS_Y_MAX);
private Rect mContentRect;
private ScaleGestureDetector mScaleGestureDetector;
...
public boolean onTouchEvent(MotionEvent event) {
    boolean retVal = mScaleGestureDetector.onTouchEvent(event);
    retVal = mGestureDetector.onTouchEvent(event) || retVal;
    return retVal || super.onTouchEvent(event);
}

/**
 * The scale listener, used for handling multi-finger scale gestures.
 */
private final ScaleGestureDetector.OnScaleGestureListener mScaleGestureListener
        = new ScaleGestureDetector.SimpleOnScaleGestureListener() {
    /**
     * This is the active focal point in terms of the viewport. Could be a local
     * variable but kept here to minimize per-frame allocations.
     */
    private PointF viewportFocus = new PointF();
    private float lastSpanX;
    private float lastSpanY;

    // Detects that new pointers are going down.
    @Override
    public boolean onScaleBegin(ScaleGestureDetector scaleGestureDetector) {
        lastSpanX = ScaleGestureDetectorCompat.
                getCurrentSpanX(scaleGestureDetector);
        lastSpanY = ScaleGestureDetectorCompat.
                getCurrentSpanY(scaleGestureDetector);
        return true;
    }

    @Override
    public boolean onScale(ScaleGestureDetector scaleGestureDetector) {

        float spanX = ScaleGestureDetectorCompat.
                getCurrentSpanX(scaleGestureDetector);
        float spanY = ScaleGestureDetectorCompat.
                getCurrentSpanY(scaleGestureDetector);

        float newWidth = lastSpanX / spanX * mCurrentViewport.width();
        float newHeight = lastSpanY / spanY * mCurrentViewport.height();

        float focusX = scaleGestureDetector.getFocusX();
        float focusY = scaleGestureDetector.getFocusY();
        // Makes sure that the chart point is within the chart region.
        // See the sample for the implementation of hitTest().
        hitTest(scaleGestureDetector.getFocusX(),
                scaleGestureDetector.getFocusY(),
                viewportFocus);

        mCurrentViewport.set(
                viewportFocus.x
                        - newWidth * (focusX - mContentRect.left)
                        / mContentRect.width(),
                viewportFocus.y
                        - newHeight * (mContentRect.bottom - focusY)
                        / mContentRect.height(),
                0,
                0);
        mCurrentViewport.right = mCurrentViewport.left + newWidth;
        mCurrentViewport.bottom = mCurrentViewport.top + newHeight;
        ...
        // Invalidates the View to update the display.
        ViewCompat.postInvalidateOnAnimation(InteractiveLineGraphView.this);

        lastSpanX = spanX;
        lastSpanY = spanY;
        return true;
    }
};
```
