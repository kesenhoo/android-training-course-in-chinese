> 编写:

> 校对:

# 检测常用的手势

“触摸手势”出现在用户用一根或多根手指触碰屏幕时,而你的应用会把这样的触摸方式解释成一种特定的手势。手势检测也就有以下相应的两个阶段：

1. 采集触摸事件的数据。
2. 分析这些数据，看它们是否符合你的app所支持的手势的标准。

### 支持库中的类 ###
本节课程的示例程序使用的是[GestureDetectorCompat]()类和 [MotionEventCompat]()类。这些类都在 [Support Library]()中。你可以通过使用支持库中的类，来为运行Android1.6及以上系统的设备提供兼容。需要注意的一点是，[MotionEventCompat]()类不是[MotionEvent]()类的替代品。它只是提供了一些静态工具类函数，你可以把[MotionEvent]()对象作为参数传递给这些函数，从而得到与
事件相关的动作。

## 采集数据 ##
当用户用一根或多根手指触碰屏幕时，会回调接受到触摸事件的View的 [onTouchEvent()]()函数。对于触摸事件的每个阶段（放置，按压，添加另一个手指等等），[onTouchEvent()]()都会被调用数次，最终被识别为一个手势。

手势开始于用户刚触摸屏幕时，其后系统会持续地追踪用户手指的位置，当用户手指都离开屏幕后手势结束。

在交互的整个期间，MotionEvent都会被分发到onTouchEvent()函数,并且提供了每次交互的详细信息。你的app可以使用MotionEvent提供的数据来判断是否发生了某个特定的手势。

### 为Activity或View捕获触摸事件 ###

为了截获Activity或View中的触摸事件，可以重写onTouchEvent()回调函数。

接下来的代码段使用了getActionMasked()函数，该函数可从event参数中抽取出用户执行的操作。它会提供一些关于触摸的原始数据给你，你可以使用这些数据判断某个特定手势是否发生了。


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

然后,你就可以自行处理这些events来判断某个手势是否发生了.当你需要检测自定义手势时,你可以使用这种处理方式.然而,如果你的app仅仅需要使用一些常用手势,如双击,长按,惯性滑动等,你可以利用GestureDetector类来完成. GestureDetector可以让你更简单地检测常见手势,并且无需自行处理单个的触摸事件.相关内容在下面的Detect Gestures将会讨论.