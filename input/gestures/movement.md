# 追踪手势移动

> 编写:[Andrwyw](https://github.com/Andrwyw) - 原文：<http://developer.android.com/training/gestures/movement.html>

本节课程讲述如何追踪手势移动。

每当当前的触摸位置、压力、大小发生变化时，[ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE)事件都会触发<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>函数。正如[**检测常用的手势**](/detector.html)中描述的那样，触摸事件全部都记录在onTouchEvent()函数的[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)参数中。

因为基于手指的触摸的交互方式并不总是非常精确，所以检测触摸事件更多的是基于手势移动，而非简单地基于触摸。为了帮助app区分基于移动的手势（如滑动）和非移动手势（如简单地点击），Android引入了“touch slop”的概念。Touch slop是指，在被识别为基于移动的手势前，用户触摸可移动的那一段像素距离。关于这一主题的更多讨论，可以在[管理ViewGroup中的触摸事件](viewgroup.html)中查看。

根据应用的需求，有多种追踪手势移动的方式可以选择。比如：

* 追踪手指的起始和终止位置（比如，把屏幕上的对象从A点移动到B点）
* 根据x、y轴坐标，追踪手指移动的方向。
* 追踪历史状态。我们可以通过调用[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)的<a href="http://developer.android.com/reference/android/view/MotionEvent.html#getHistorySize()">getHistorySize()</a>方法，来获得一个手势的历史尺寸。我们可以通过移动事件的`getHistorical<Value>`系列函数，来获得事件之前的位置、尺寸、时间以及按压力(pressures)。当我们需要绘制用户手指痕迹时，历史状态非常有用，比如触摸绘图。查看[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)来了解更多细节。
* 追踪手指在触摸屏上滑过的速度。

## 追踪速度

我们可以简单地用基于距离，或(和)基于手指移动方向的移动手势。但是速度经常也是追踪手势特性的一个决定性因素，甚至是判断一个手势是否发生的依据。为了让计算速度更容易，Android提供了[VelocityTracker](http://developer.android.com/reference/android/view/VelocityTracker.html)类以及[**Support Library**](http://developer.android.com/tools/support-library/index.html)中的[VelocityTrackerCompat](http://developer.android.com/reference/android/support/v4/view/VelocityTrackerCompat.html)类。[VelocityTracker](http://developer.android.com/reference/android/view/VelocityTracker.html)类可以帮助我们追踪触摸事件中的速度因素。如果速度是手势的一个判断标准，比如快速滑动(fling)，那么这些类是很有用的。

下面是一个简单的例子，说明了[VelocityTracker](http://developer.android.com/reference/android/view/VelocityTracker.html)中API函数的用处。

```java
public class MainActivity extends Activity {
    private static final String DEBUG_TAG = "Velocity";
        ...
    private VelocityTracker mVelocityTracker = null;
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int index = event.getActionIndex();
        int action = event.getActionMasked();
        int pointerId = event.getPointerId(index);

        switch(action) {
            case MotionEvent.ACTION_DOWN:
                if(mVelocityTracker == null) {
                    // Retrieve a new VelocityTracker object to watch the velocity of a motion.
                    mVelocityTracker = VelocityTracker.obtain();
                }
                else {
                    // Reset the velocity tracker back to its initial state.
                    mVelocityTracker.clear();
                }
                // Add a user's movement to the tracker.
                mVelocityTracker.addMovement(event);
                break;
            case MotionEvent.ACTION_MOVE:
                mVelocityTracker.addMovement(event);
                // When you want to determine the velocity, call
                // computeCurrentVelocity(). Then call getXVelocity()
                // and getYVelocity() to retrieve the velocity for each pointer ID.
                mVelocityTracker.computeCurrentVelocity(1000);
                // Log velocity of pixels per second
                // Best practice to use VelocityTrackerCompat where possible.
                Log.d("", "X velocity: " +
                        VelocityTrackerCompat.getXVelocity(mVelocityTracker,
                        pointerId));
                Log.d("", "Y velocity: " +
                        VelocityTrackerCompat.getYVelocity(mVelocityTracker,
                        pointerId));
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                // Return a VelocityTracker object back to be re-used by others.
                mVelocityTracker.recycle();
                break;
        }
        return true;
    }
}
```

> **Note:** 需要注意的是，我们应该在[ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE)事件，而不是在[ACTION_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP)事件后计算速度。在[ACTION_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP)事件之后，计算x、y方向上的速度都会是0。
