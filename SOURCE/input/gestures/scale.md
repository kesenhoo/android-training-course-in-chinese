> 编写:Andrwyw

> 校对:

# 拖拽与缩放

本节课程描述，如何使用触摸手势拖拽、缩放屏幕上的对象，使用onTouchEvent()来截获触摸事件。

## 拖拽一个对象 ##

> 如果你的目标版本为3.0或以上，你可以使用View.OnDragListener监听内置的drag-and-drop事件，Drag and Drop中有更多相关描述。

使用触摸手势在屏幕上拖拽一个对象是很常见的操作。接下来的代码段让用户可以拖拽屏幕上的图片。需要注意以下几点：

- 拖拽操作时，即使有额外的手指放置到屏幕上了，app也必须保持对最初的点（手指）的追踪。比如，想象你在拖拽图片时，用户放置了第二根手指在屏幕上，并且继续移动第一根手指。如果你的app只是追踪单独的手指，它会默认忽视第二根手指头，并且把图片移到相应位置。
- 为了防止这种情况发生，你的app需要区分初始点以及之后任意的触摸点。要做到这一点，它需要追踪处理多触摸手势中提到过的ACTION_POINTER_DOWN、 ACTION_POINTER_UP事件。每当第二根手指按下或拿起时，ACTION_POINTER_DOWN、 ACTION_POINTER_UP事件就会传递给onTouchEvent()回调函数。
- ACTION_POINTER_UP事件下，示例程序会获取到触摸点的索引值，并确保当前触摸点ID对应的触摸点并没有离开屏幕。如果离开了，app会选择另一个触摸点，并保存它当前的x、y值。由于在ACTION_MOVE事件下，保存过的位置会被用来计算屏幕上对象将移动的距离，所以app会始终根据正确的触摸点来计算移动的距离。

下面的代码段允许用户拖拽屏幕上的对象。它会记录当前触摸点（active pointer）的初始位置，并计算触摸点移动过的距离，再把对象移动到新的位置。如上所述，它也正确地处理了额外触摸点的可能。

注意代码段中使用了getActionMasked()函数。你应该始终使用这个函数（或者更好用MotionEventCompat.getActionMasked()这个兼容版本）来获得MotionEvent对应的动作(action)。不像以前的getAction()函数，getActionMasked()是被设计用来处理多点触摸的。它会返回掩码过（masked）的执行动作，但不包括点的索引位。

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

## 通过拖拽平移 ##

前一部分展示了在屏幕上拖拽对象的例子。另一个常见的场景是平移（panning），是指用户通过拖拽移动引起x、y轴方向发生滚动。上面的代码段通过直接截获MotionEvent动作来实现拖拽。这一部分的代码段采用的平台内置的对常用手势的支持。它重写了GestureDetector.SimpleOnGestureListener的onScroll()函数。 

提供更多的参考，当用户拖拽手指来平移内容时，onScroll()就会被调用。onScroll()只会在手指按下的情况下被调用，一旦手指离开屏幕了，要么手势终止，要么快速滑动手势开始（如果手指在离开屏幕前快速移动了一段距离）。关于scrolling vs. flinging的更多讨论，可以查看Scroll手势动画章节。

这里是onScroll()的相关代码段：

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

onScroll()滑动视窗来响应触摸手势：

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

## 使用触摸手势缩放 ##

如同检测常用手势章节中提到的，GestureDetector可以帮助你检测Android中的常见手势，例如滚动，快速滚动以及长按。对于缩放，Android也提供了ScaleGestureDetector.GestureDetector类、ScaleGestureDetector类，你可以使用它们来识别额外的手势。

为了报告检测到的手势事件，手势检测需要用listener对象作为构造器的参数。ScaleGestureDetector使用ScaleGestureDetector.OnScaleGestureListener。Android提供了ScaleGestureDetector.SimpleOnScaleGestureListener作为帮助类。如果你不关注所有的手势事件，你可以自行拓展。

### 基本的缩放示例 ###

下面的代码段展示了缩放功能的基本部分。

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

### 更加复杂的缩放示例 ###

这是InteractiveChart中关于这个类的一个更加复杂的示范。通过使用ScaleGestureDetector的“span”（(getCurrentSpanX/Y)）和“focus”（getFocusX/Y）功能，滚动（平移）和多指缩放InteractiveChart样例都能支持。

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