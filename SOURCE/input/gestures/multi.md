> 编写:Andrwyw

> 校对:

# 处理多触摸手势

多点触摸触手势是指在同一时间有多点（手指）触碰屏幕。本节课程描述如何检测多点触摸手势。

## 追踪多点 ##

当多个手指同时触摸屏幕时，系统会产生如下的触摸事件：

- ACTION_DOWN-当第一个手指触摸屏幕。此事件是手势的开端。第一触摸点的数据在MotionEvent中的索引总是0。
- ACTION_POINTER_DOWN-当除第一点外的点出现在屏幕时。这个点的数据在MotionEvent中的索引可以通过getActionIndex()函数获得。
- ACTION_MOVE-按压手势发生变化时。
- ACTION_POINTER_UP-当非第一点离开屏幕时发送此消息。
- ACTION_UP-当最后一点离开屏幕时发送此消息。

你可以通过每个点的索引以及id，单独地追踪MotionEvent中的每个点。

- Index：MotionEvent把每个点的信息存储在一个数组中。点在数组中的位置就是该点的索引值。用来与点交互的大多数函数都是以索引值作为参数的，而不是点的ID。
- ID：每个点也都对应提供了一个ID，该ID在整个手势期间一直存在，以便你单独追踪每个点。

每个独立的点在移动事件中出现的次序是不固定的。因此，从一个事件到另一个事件，点的索引值是可以改变的，但点的ID在点的生命周期内是保证不会改变的。使用getPointerId()可以获得一个点的ID，在手势随后的移动事件中就可以用该ID来追踪这个点。随后一系列的事件，可以使用findPointerIndex()函数来获得对应给定ID的点的索引值。如下：

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

## 获取MotionEvent的动作 ##

你应该始终使用getActionMasked()函数（或者更好用MotionEventCompat.getActionMasked()这个兼容版本）来获取MotionEvent的动作。不像以前的getAction()函数，getActionMasked()就被设计用来处理多点触摸的。它会返回掩码过的执行动作，不包括点的索引位。你可以使用getActionIndex()来获得与该动作关联的点的索引值。这在接下来的代码段中可以看到。

>注意：这个样例使用的是MotionEventCompat类。这个类位于Support Library中。你应该使用MotionEventCompat，以便能够支持更多的平台。需要注意的一点是，MotionEventCompat并不是MotionEvent类的替代品。准确来说，它提供了一些静态函数，你可把MotionEvent作为参数传递给这些函数，来得到与事件相关联的动作。

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

关于多点触摸的更多内容以及示例，可以查看拖拽与缩放章节。