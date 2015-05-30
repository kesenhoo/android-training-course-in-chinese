# 处理多点触控手势

> 编写:[Andrwyw](https://github.com/Andrwyw) - 原文:<http://developer.android.com/training/gestures/multi.html>

多点触控手势是指在同一时间有多点（手指）触碰屏幕。本节课程讲述，如何检测涉及多点的触摸手势。

## 追踪多点

当多个手指同时触摸屏幕时，系统会产生如下的触摸事件：

- [ACTION_DOWN](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_DOWN) - 针对触摸屏幕的第一个点。此事件是手势的开端。第一触摸点的数据在[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)中的索引总是0。
- <a href="http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#ACTION_POINTER_DOWN">ACTION\_POINTER\_DOWN</a> - 针对第一点后，出现在屏幕上额外的点。这个点的数据在MotionEvent中的索引，可以通过<a href="(http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#getActionIndex(android.view.MotionEvent)">getActionIndex()</a>获得。
- [ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE) - 在按下手势期间发生变化。
- <a href="http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#ACTION_POINTER_UP">ACTION\_POINTER\_UP</a> - 当非主要点（non-primary pointer）离开屏幕时，发送此事件。
- [ACTION_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP) - 当最后一点离开屏幕时发送此事件。

我们可以通过各个点的索引以及id，单独地追踪[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)中的每个点。

- **Index**：[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)把各个点的信息都存储在一个数组中。点的索引值就是它在数组中的位置。大多数用来与点交互的[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)函数都是以索引值而不是点的ID作为参数的。
- **ID**：每个点也都有一个ID映射，该ID映射在整个手势期间一直存在，以便我们单独地追踪每个点。

每个独立的点在移动事件中出现的次序是不固定的。因此，从一个事件到另一个事件，点的索引值是可以改变的，但点的ID在它的生命周期内是保证不会改变的。使用<a href="http://developer.android.com/reference/android/view/MotionEvent.html#getPointerId(int)">getPointerId()</a>可以获得一个点的ID，在手势随后的移动事件中，就可以用该ID来追踪这个点。对于随后一系列的事件，可以使用<a href="http://developer.android.com/reference/android/view/MotionEvent.html#findPointerIndex(int)">findPointerIndex()</a>函数，来获得对应给定ID的点在移动事件中的索引值。如下：

```java
private int mActivePointerId;

public boolean onTouchEvent(MotionEvent event) {
    ....
    // Get the pointer ID
    mActivePointerId = event.getPointerId(0);

    // ... Many touch events later...

    // Use the pointer ID to find the index of the active pointer
    // and fetch its position
    int pointerIndex = event.findPointerIndex(mActivePointerId);
    // Get the pointer's current position
    float x = event.getX(pointerIndex);
    float y = event.getY(pointerIndex);
}
```

## 获取MotionEvent的动作

我们应该总是使用<a href="http://developer.android.com/reference/android/view/MotionEvent.html#getActionMasked()">getActionMasked()</a>函数（或者用<a href="http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#getActionMasked(android.view.MotionEvent)">MotionEventCompat.getActionMasked()</a>这个兼容版本更好）来获取[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)的动作(action)。与旧的<a href="http://developer.android.com/reference/android/view/MotionEvent.html#getAction()">getAction()</a>函数不同的是，`getActionMasked()`是设计用来处理多点触摸的。它会返回执行过的动作的掩码值，不包括点的索引位。然后，我们可以使用`getActionIndex()`来获得与该动作关联的点的索引值。这在接下来的代码段中可以看到。

> **Note:** 这个样例使用的是[MotionEventCompat](http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html)类。该类在[**Support Library**](http://developer.android.com/tools/support-library/index.html)中。我们应该使用[MotionEventCompat](http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html)类，来提供对更多平台的支持。需要注意的一点是，[MotionEventCompat](http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html)并不是[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)类的替代品。准确来说，它提供了一些静态工具类函数，我们可以把[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)对象作为参数传递给这些函数，来得到与事件相关的动作。

```java
int action = MotionEventCompat.getActionMasked(event);
// Get the index of the pointer associated with the action.
int index = MotionEventCompat.getActionIndex(event);
int xPos = -1;
int yPos = -1;

Log.d(DEBUG_TAG,"The action is " + actionToString(action));

if (event.getPointerCount() > 1) {
    Log.d(DEBUG_TAG,"Multitouch event");
    // The coordinates of the current screen contact, relative to
    // the responding View or Activity.
    xPos = (int)MotionEventCompat.getX(event, index);
    yPos = (int)MotionEventCompat.getY(event, index);

} else {
    // Single touch event
    Log.d(DEBUG_TAG,"Single touch event");
    xPos = (int)MotionEventCompat.getX(event, index);
    yPos = (int)MotionEventCompat.getY(event, index);
}
...

// Given an action int, returns a string description
public static String actionToString(int action) {
    switch (action) {

        case MotionEvent.ACTION_DOWN: return "Down";
        case MotionEvent.ACTION_MOVE: return "Move";
        case MotionEvent.ACTION_POINTER_DOWN: return "Pointer Down";
        case MotionEvent.ACTION_UP: return "Up";
        case MotionEvent.ACTION_POINTER_UP: return "Pointer Up";
        case MotionEvent.ACTION_OUTSIDE: return "Outside";
        case MotionEvent.ACTION_CANCEL: return "Cancel";
    }
    return "";
}
```

关于多点触摸的更多内容以及示例，可以查看[拖拽与缩放](scale.html)章节。
