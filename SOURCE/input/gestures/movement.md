> 编写: [Andrwyw](https://github.com/Andrwyw) - 校对:

> 原文：

# 跟踪手势移动

本节课程描述如何跟踪手势移动。

每当触摸位置、压力、大小发生变化时，[onTouchEvent()][onTouchEvent_url]函数都会随着新的[ACTION_MOVE][ACTION_MOVE_url]事件参数被重新调用一次。正如[检测常用的手势](/detector.html)中描述的，所有触摸事件都被记录在[onTouchEvent()][onTouchEvent_url]的[MotionEvent][MotionEvent_url]参数中。

因为基于手指的触摸不一定是一种非常精确的交互形式，所以检测触摸事件更多的是基于手势移动而非简单地触摸。为了帮助app区分基于移动的手势（如滑动）和非移动手势（如简单的点击），Android引入了“touch slop”的概念。Touch slop是指用户触摸事件可被识别为移动手势前的移动的那一段像素距离。关于这一主题的更多讨论，可以在[管理ViewGroup中的触摸事件](viewgroup.html)中查看。

根据你的app需求，有多种追踪手势移动的方式可以选择。比如：
* 追踪手指的起始和终止位置（比如，把屏幕上的对象从A点移动到B点）
* 根据x、y轴坐标，追踪手指移动的方向。
* 追踪历史状态。你可以通过调用[MotionEvent][MotionEvent_url]的[getHistorySize()][getHistorySize_url]函数获得一个手势的历史尺寸大小。你可以通过获得移动事件的getHistorical<Value>系列函数获得事件历史的位置、尺寸、时间以及按压力。当你需要绘制用户手指痕迹时，历史状态非常有用，比如触摸绘图时。查看[MotionEvent][MotionEvent_url]来了解更多细节。
* 追踪手指在触摸屏上滑过的速度。

## 追踪速度 ##
你可以让移动手势简单地基于手指滑动过的距离或/和方向。但是速度经常也是追踪手势特征中的一个决定因素，甚至是判断一个手势是否发生的依据。为了让速度计算更容易，Android提供了[VelocityTracker][VelocityTracker_url]类以及[支持库][Support_Library_url]中的[VelocityTrackerCompat][VelocityTrackerCompat_url]类。[VelocityTracker][VelocityTracker_url]类可以帮助你追踪触摸事件中速度因素。如果速度是你的手势的一个判断标准，比如惯性滑动，那么这些类是很有用的。

下面是一个简单的例子，说明了[VelocityTracker][VelocityTracker_url]中API函数的用处。

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

>注意：需要注意的是，你应该在[ACTION_MOVE][ACTION_MOVE_url]事件后计算速度，而不是[ACTION_UP][ACTION_UP_url]后。在[ACTION_UP][ACTION_UP_url]后计算，x、y方向的速度都会是0。

[ACTION_UP_url]: http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP "ACTION_UP"
[ACTION_MOVE_url]: http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE "ACTION_MOVE"
[MotionEvent_url]:  http://developer.android.com/reference/android/view/MotionEvent.html "MotionEvent"
[onTouchEvent_url]:  http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent) "onTouchEvent"
[getHistorySize_url]: http://developer.android.com/reference/android/view/MotionEvent.html#getHistorySize() "getHistorySize"
[VelocityTrackerCompat_url]:  http://developer.android.com/reference/android/support/v4/view/VelocityTrackerCompat.html "VelocityTrackerCompat"
[VelocityTracker_url]:  http://developer.android.com/reference/android/view/VelocityTracker.html "VelocityTracker"
[Support_Library_url]:  http://developer.android.com/tools/support-library/index.html "Support Library"
