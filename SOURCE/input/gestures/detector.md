> 编写: [Andrwyw](https://github.com/Andrwyw) - 校对:

> 原文：

# 检测常用的手势 #

“触摸手势”出现在用户用一根或多根手指触碰屏幕时，并且你的应用会把这样的触摸方式解释成一种特定的手势。手势检测有以下相应的两个阶段：

1. 采集触摸事件的相关数据。
2. 分析这些数据，看它们是否是任何一种你的app所支持的手势。

### 支持库中的类 ###

本节课程的示例程序使用的是[GestureDetectorCompat][GestureDetectorCompat_url]类和 [MotionEventCompat][MotionEventCompat_url]类。这些类都在 [Support Library][Support_Library_url]中。你可以通过使用支持库中的类，来为运行着Android1.6及以上系统的设备提供兼容性功能。需要注意的一点是，[MotionEventCompat][MotionEventCompat_url]类不是[MotionEvent][MotionEvent_url]类的替代品。它只是提供了一些静态工具类函数，你可以把[MotionEvent][MotionEvent_url]对象作为参数来使用这些函数，从而得到与事件相关的动作。

## 采集数据 ##

当用户用一根或多根手指触碰屏幕时，接受触摸事件的那个View的 [onTouchEvent()][onTouchEvent_url]回调函数就会被触发。对于触摸事件的每个阶段（放置，按压，添加另一个手指等等），[onTouchEvent()][onTouchEvent_url]都会被调用数次，并且最终被识别为一种手势。

手势开始于用户刚触摸屏幕时，其后系统会持续地追踪用户手指的位置，当用户手指都离开屏幕时手势结束。在整个交互期间，[MotionEvent][MotionEvent_url]都会被分发给[onTouchEvent()][onTouchEvent_url]函数，来提供所有交互的详细信息。你的app可以使用[MotionEvent][MotionEvent_url]提供的数据来判断是否发生了某种特定的手势。

### 为Activity或View捕获触摸事件 ###

为了捕获Activity或View中的触摸事件，你可以重写[onTouchEvent()][onTouchEvent_url]回调函数。

接下来的代码段使用了[getActionMasked()][getActionMasked_url]函数，该函数可以从参数event中抽取出用户完成的操作。它会提供一些关于原始的触摸数据，你可以使用这些数据来判断是否发生了某个的特定手势。

```java
public class MainActivity extends Activity {
...
// This example shows an Activity, but you would use the same approach if
// you were subclassing a View.
@Override
public boolean onTouchEvent(MotionEvent event){

        int action = MotionEventCompat.getActionMasked(event);

        switch(action) {
                case (MotionEvent.ACTION_DOWN) :
                Log.d(DEBUG_TAG,"Action was DOWN");
                return true;
        case (MotionEvent.ACTION_MOVE) :
                Log.d(DEBUG_TAG,"Action was MOVE");
                return true;
        case (MotionEvent.ACTION_UP) :
                Log.d(DEBUG_TAG,"Action was UP");
                return true;
        case (MotionEvent.ACTION_CANCEL) :
                Log.d(DEBUG_TAG,"Action was CANCEL");
                return true;
        case (MotionEvent.ACTION_OUTSIDE) :
                Log.d(DEBUG_TAG,"Movement occurred outside bounds " +
                        "of current screen element");
                return true;
        default :
                return super.onTouchEvent(event);
        }
}
```

你可以自行处理这些events来判断是否出现了某个手势。当你需要检测自定义手势时，你可以使用这种方式。然而，如果你的app仅仅需要使用一些常见的手势，如双击，长按，惯性滑动等，你可以利用[GestureDetector][GestureDetector_url]类来完成。 [GestureDetector][GestureDetector_url]可以让你更简单地检测常见手势，并且无需自行处理单个的触摸事件。相关内容将会在下面的[Detect Gestures](#detect)中讨论。

### 捕获单个view对象的触摸事件 ###

除了使用[onTouchEvent()][onTouchEvent_url]来捕获触摸事件，你也可以使用setOnTouchListener()函数给[View][View_url]对象关联一个 View.OnTouchListener对象来捕获触摸事件。这样做可以让你不继承一个已有的[View][View_url]就能监听它的触摸事件。比如:

```java
View myView = findViewById(R.id.my_view);
myView.setOnTouchListener(new OnTouchListener() {
public boolean onTouch(View v, MotionEvent event) {
        // ... Respond to touch events
        return true;
    }
});
```

创建listener对象时，谨防对[ACTION_DOWN][ACTION_DOWN_url]事件返回false。如果你这样做了，会导致listener对象监听不到后续的[ACTION_MOVE][ACTION_MOVE_url]、[ACTION_UP][ACTION_UP_url]等系列事件。因为[ACTION_DOWN][ACTION_DOWN_url]事件是所有触摸事件的开端。

如果你正在写一个自定义View,你也可以像上面描述的那样重写[onTouchEvent()][onTouchEvent_url]函数。

[detect]:## 检测手势 ##

Android提供了[GestureDetector][GestureDetector_url]类来检测一般手势。它支持的手势包括[onDown()][onDown_url], [onLongPress()][onLongPress_url],[onFling()][onFling_url]等。你可以把[GestureDetector][GestureDetector_url]和上面描述的[onTouchEvent()][onTouchEvent_url]函数结合在一起使用。

### 检测所有支持的手势 ###

当你实例化一个[GestureDetectorCompat][GestureDetectorCompat_url]对象时，需要一个实现了[GestureDetector.OnGestureListener][OnGestureListener_url]接口的类的对象作为参数。当某个特定的触摸事件发生时，[GestureDetector.OnGestureListener][OnGestureListener_url]会通知用户。为了让你的[GestureDetector][GestureDetector_url]对象能到接收到触摸事件，你需要重写View或Activity的[onTouchEvent()][onTouchEvent_url]函数，并且把所有捕获到的事件传递给detector对象。

接下来的代码段中，on<TouchEvent>型的函数返回值是true意味着你已经处理完这个触摸事件了。如果返回false，则会把事件沿view栈传递，直到触摸事件被成功地处理了。

运行下面的代码段，来了解你与触摸屏交互时一个动作是如何被触发的，以及每个触摸事件的[MotionEvent][MotionEvent_url]对象中的内容。你也会了解到一个简单的交互会产生多少的数据。

```java
public class MainActivity extends Activity implements
        GestureDetector.OnGestureListener,
        GestureDetector.OnDoubleTapListener{

    private static final String DEBUG_TAG = "Gestures";
    private GestureDetectorCompat mDetector;

    // Called when the activity is first created.
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Instantiate the gesture detector with the
        // application context and an implementation of
        // GestureDetector.OnGestureListener
        mDetector = new GestureDetectorCompat(this,this);
        // Set the gesture detector as the double tap
        // listener.
        mDetector.setOnDoubleTapListener(this);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event){
        this.mDetector.onTouchEvent(event);
        // Be sure to call the superclass implementation
        return super.onTouchEvent(event);
    }

    @Override
    public boolean onDown(MotionEvent event) {
        Log.d(DEBUG_TAG,"onDown: " + event.toString());
        return true;
    }

    @Override
    public boolean onFling(MotionEvent event1, MotionEvent event2,
            float velocityX, float velocityY) {
        Log.d(DEBUG_TAG, "onFling: " + event1.toString()+event2.toString());
        return true;
    }

    @Override
    public void onLongPress(MotionEvent event) {
        Log.d(DEBUG_TAG, "onLongPress: " + event.toString());
    }

    @Override
    public boolean onScroll(MotionEvent e1, MotionEvent e2, float distanceX,
            float distanceY) {
        Log.d(DEBUG_TAG, "onScroll: " + e1.toString()+e2.toString());
        return true;
    }

    @Override
    public void onShowPress(MotionEvent event) {
        Log.d(DEBUG_TAG, "onShowPress: " + event.toString());
    }

    @Override
    public boolean onSingleTapUp(MotionEvent event) {
        Log.d(DEBUG_TAG, "onSingleTapUp: " + event.toString());
        return true;
    }

    @Override
    public boolean onDoubleTap(MotionEvent event) {
        Log.d(DEBUG_TAG, "onDoubleTap: " + event.toString());
        return true;
    }

    @Override
    public boolean onDoubleTapEvent(MotionEvent event) {
        Log.d(DEBUG_TAG, "onDoubleTapEvent: " + event.toString());
        return true;
    }

    @Override
    public boolean onSingleTapConfirmed(MotionEvent event) {
        Log.d(DEBUG_TAG, "onSingleTapConfirmed: " + event.toString());
        return true;
    }
}
```

### 检测部分支持的手势 ###

如果你仅仅只想处理几种手势，你可以选择继承[GestureDetector.SimpleOnGestureListener][SimpleOnGestureListener_url]类，而不不是实现[GestureDetector.OnGestureListener][OnGestureListener_url]接口。

GestureDetector.SimpleOnGestureListener类实现了所有的on<TouchEvent>型函数，并且都返回false。因此你可以仅仅重写你所需要的函数。比如，下面的代码段中创建了一个继承自[GestureDetector.SimpleOnGestureListener][SimpleOnGestureListener_url]的类，并且只重写了[onFling()][onFling_url]和[onDown()][onDown_url]函数。

无论你是否使用[GestureDetector.OnGestureListener][OnGestureListener_url]类，最好都实现[onDown()][onDown_url]函数并且返回true。这是因为所有的手势都是由[onDown()][onDown_url]消息开始的。如果你让[onDown()][onDown_url]函数返回false，就像[GestureDetector.SimpleOnGestureListener][SimpleOnGestureListener_url]类默认的那样，系统会假定你想忽略手势的剩余部分，[GestureDetector.OnGestureListener][OnGestureListener_url]中的其他函数也就永远不会被调用。这可能让你的app出现意想不到的问题。仅仅当你真的想忽略整个手势时，你才应该让[onDown()][onDown_url]函数返回false。

```
public class MainActivity extends Activity {

    private GestureDetectorCompat mDetector;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mDetector = new GestureDetectorCompat(this, new MyGestureListener());
    }

    @Override
    public boolean onTouchEvent(MotionEvent event){
        this.mDetector.onTouchEvent(event);
        return super.onTouchEvent(event);
    }

    class MyGestureListener extends GestureDetector.SimpleOnGestureListener {
        private static final String DEBUG_TAG = "Gestures";

        @Override
        public boolean onDown(MotionEvent event) {
            Log.d(DEBUG_TAG,"onDown: " + event.toString());
            return true;
        }

        @Override
        public boolean onFling(MotionEvent event1, MotionEvent event2,
                float velocityX, float velocityY) {
            Log.d(DEBUG_TAG, "onFling: " + event1.toString()+event2.toString());
            return true;
        }
    }
}
```

[MotionEvent_url]:  http://developer.android.com/reference/android/view/MotionEvent.html "MotionEvent"
[MotionEventCompat_url]:  http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html "MotionEventCompat"
[GestureDetectorCompat_url]:  http://developer.android.com/reference/android/support/v4/view/GestureDetectorCompat.html "GestureDetectorCompat"
[getActionMasked_url]:  http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#getActionMasked(android.view.MotionEvent) "getActionMasked()"
[Support_Library_url]:  http://developer.android.com/tools/support-library/index.html "Support Library"
[GestureDetector_url]:  http://developer.android.com/reference/android/view/GestureDetector.html "GestureDetector"
[ACTION_DOWN_url]: http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_DOWN "ACTION_DOWN"
[ACTION_UP_url]: http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP "ACTION_UP"
[ACTION_MOVE_url]: http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE "ACTION_MOVE"
[View_url]: http://developer.android.com/reference/android/view/View.html "View"
[onTouchEvent_url]:  http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent) "onTouchEvent"
[onFling_url]: http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onFling(android.view.MotionEvent,android.view.MotionEvent,float,float)  "onFling()"
[onDown_url]: http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onDown(android.view.MotionEvent) "onDown()"
[onLongPress_url]:  http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onLongPress(android.view.MotionEvent) "onLongPress()"
[SimpleOnGestureListener_url]: http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html "SimpleOnGestureListener"
[OnGestureListener_url]: file:///D:/android-sdk-windows/android-sdk-windows/docs/reference/android/view/GestureDetector.OnGestureListener.html "OnGestureListener"
