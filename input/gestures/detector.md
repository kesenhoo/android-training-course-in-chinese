# 检测常用的手势

> 编写:[Andrwyw](https://github.com/Andrwyw) - 原文:<http://developer.android.com/training/gestures/detector.html>

当用户把用一根或多根手指放在触摸屏上，并且应用把这样的触摸方式解释为特定的手势时，“触摸手势”就发生了。相应地，检测手势也就有以下两个阶段：

1. 收集触摸事件的相关数据。
2. 分析这些数据，看它们是否符合app所支持的手势的标准。

### Support Library 中的类

本节课程的示例程序使用了[GestureDetectorCompat](http://developer.android.com/reference/android/support/v4/view/GestureDetectorCompat.html)和[MotionEventCompat](http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html)类。这些类都是在 [Support Library](http://developer.android.com/tools/support-library/index.html) 中定义的。如果有可能的情况话，我们应该使用 Support Library 中的类，来为运行着Android1.6及以上版本系统的设备提供兼容性功能。需要注意的一点是，[MotionEventCompat](http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html)并不是[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)的替代品，而是提供了一些静态工具类函数。我们可以把[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)对象作为参数传递给这些工具类函数，来获得与触摸事件相关的动作(action)。

## 收集数据

当用户把用一根或多根手指放在触摸屏上时，会触发 View 上用于接收触摸事件的 <a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a> 回调函数。对于一系列连续的、最终会被识别为一种手势的触摸事件（位置、压力、大小、添加另一根手指等等），<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>会被调用若干次。

当用户第一次触摸屏幕时，手势就开始了。其后系统会持续地追踪用户手指的位置，在用户手指全都离开屏幕时，手势结束。在整个交互期间，被分发给 <a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a> 函数的 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 对象，提供了每次交互的详细信息。我们的app可以使用 [MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html) 提供的这些数据，来判断某种特定的手势是否发生了。

### 为Activity或View捕获触摸事件

为了捕获Activity或View中的触摸事件，我们可以重写<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>回调函数。

接下来的代码段使用了<a href="http://developer.android.com/reference/android/support/v4/view/MotionEventCompat.html#getActionMasked(android.view.MotionEvent)">getActionMasked()</a>函数，来从 `event` 参数中抽取出用户执行的动作。它提供了一些原始的触摸数据，我们可以使用这些数据，来判断某个特定手势是否发生了。

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

然后，我们可以对这些事件做些自己的处理，以判断某个手势是否出现了。这种是针对自定义手势，我们所需要进行的处理。然而，如果我们的app仅仅需要一些常见的手势，如双击，长按，快速滑动（fling）等，那么我们可以使用[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)类来完成。 [GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)可以让我们简单地检测常见手势，并且无需自行处理单个触摸事件。相关内容将会在下面的[检测手势](#detect)中讨论。

### 捕获单个view的触摸事件

作为<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>的一种替换方式，我们也可以使用 <a href="http://developer.android.com/reference/android/view/View.html#setOnTouchListener(android.view.View.OnTouchListener)">setOnTouchListener()</a> 函数，来把 [View.OnTouchListener](http://developer.android.com/reference/android/view/View.OnTouchListener.html) 关联到任意的[View](http://developer.android.com/reference/android/view/View.html)上。这样可以在不继承已有的 [View](http://developer.android.com/reference/android/view/View.html) 的情况下，也能监听触摸事件。比如:

```java
View myView = findViewById(R.id.my_view);
myView.setOnTouchListener(new OnTouchListener() {
public boolean onTouch(View v, MotionEvent event) {
        // ... Respond to touch events
        return true;
    }
});
```

创建listener对象时，注意 [ACTION_DOWN](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_DOWN) 事件返回 `false` 的情况。如果返回 `false`，会让listener对象接收不到后续的[ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP)、[ACTION_UP](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_UP)等系列事件。这是因为[ACTION_DOWN](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_DOWN)事件是所有触摸事件的开端。

如果我们正在写一个自定义View，我们也可以像上面描述的那样重写<a href="http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent)">onTouchEvent()</a>函数。

<a name="detect"> </a>
## 检测手势

Android提供了[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)类来检测常用的手势。它所支持的手势包括<a href="http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onDown(android.view.MotionEvent)">onDown()</a>、<a href="http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onLongPress(android.view.MotionEvent)">onLongPress()</a>、<a href="http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html#onFling(android.view.MotionEvent,android.view.MotionEvent,float,float)">onFling()</a> 等。我们可以把[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)和上面描述的onTouchEvent()函数结合在一起使用。

### 检测所有支持的手势

当我们实例化一个[GestureDetectorCompat](http://developer.android.com/reference/android/support/v4/view/GestureDetectorCompat.html)对象时，需要一个实现了[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)接口的类作为参数。当某个特定的触摸事件发生时，[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)就会通知用户。为了让我们的[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)对象能到接收到触摸事件，我们需要重写 View 或 Activity 的 onTouchEvent() 函数，并且把所有捕获到的事件传递给 detector 实例。

接下来的代码段中，`on<TouchEvent>` 型的函数的返回值是 `true`，意味着我们已经处理完这个触摸事件了。如果返回 `false`，则会把事件沿view栈传递，直到触摸事件被成功地处理了。

运行下面的代码段，来了解当我们与触摸屏交互时，动作（action）是如何触发的，以及每个触摸事件[MotionEvent](http://developer.android.com/reference/android/view/MotionEvent.html)中的内容。我们也会意识到，一个简单的交互会产生多少的数据。

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

### 检测部分支持的手势

如果我们只想处理几种手势，那么可以选择继承 [GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html) 类，而不是实现 [GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html) 接口。

GestureDetector.SimpleOnGestureListener 类实现了所有的 `on<TouchEvent>` 型函数，其中，这些函数都返回 `false`。因此，我们可以仅仅重写我们需要的函数。比如，下面的代码段中，创建了一个继承自 [GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html) 的类，并重写了 onFling() 和 onDown() 函数。

无论我们是否使用[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)类，最好都实现 onDown() 函数并且返回 `true`。这是因为所有的手势都是由 onDown() 消息开始的。如果让 onDown() 函数返回 `false`，就像[GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html)类中默认实现的那样，系统会假定我们想忽略剩余的手势，[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)中的其他函数也就永远不会被调用。这可能会导致我们的app出现意想不到的问题。仅仅当我们真的想忽略全部手势时，我们才应该让 onDown() 函数返回 `false`。

```java
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
