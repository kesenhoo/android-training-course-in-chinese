# 使得View可交互

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/custom-view/make-interactive.html>

绘制UI仅仅是创建自定义View的一部分。你还需要使得你的View能够以模拟现实世界的方式来进行反馈。对象应该总是与现实情景能够保持一致。例如，图片不应该突然消失又从另外一个地方出现，因为在现实世界里面不会发生那样的事情。正确的应该是，图片从一个地方移动到另外一个地方。

用户应该可以感受到UI上的微小变化，并对模仿现实世界的细微之处反应强烈。例如，当用户fling(迅速滑动)一个对象时，应该在开始时感到摩擦带来的阻力，在结束时感到fling带动的动力。应该在滑动开始与结束的时候给用户一定的反馈。

这节课会演示如何使用Android framework的功能来为自定义的View添加那些现实世界中的行为。

<!-- more -->

## 处理输入的手势
像许多其他UI框架一样，Android提供一个输入事件模型。用户的动作会转换成触发一些回调函数的事件，你可以重写这些回调方法来定制你的程序应该如何响应用户的输入事件。在Android中最常用的输入事件是touch，它会触发[onTouchEvent(android.view.MotionEvent)](http://developer.android.com/reference/android/view/View.html#onTouchEvent(android.view.MotionEvent))的回调。重写这个方法来处理touch事件：

```java
@Override
public boolean onTouchEvent(MotionEvent event) {
  return super.onTouchEvent(event);
}
```

Touch事件本身并不是特别有用。如今的touch UI定义了touch事件之间的相互作用，叫做gestures。例如tapping,pulling,flinging与zooming。为了把那些touch的源事件转换成gestures, Android提供了[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)。

通过传入[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)的一个实例构建一个GestureDetector。如果你只是想要处理几种gestures(手势操作)你可以继承[GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html)，而不用实现[GestureDetector.OnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.OnGestureListener.html)接口。例如，下面的代码创建一个继承[GestureDetector.SimpleOnGestureListener](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html)的类，并重写[onDown(MotionEvent)](http://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html#onDown(android.view.MotionEvent))。

```java
class mListener extends GestureDetector.SimpleOnGestureListener {
   @Override
   public boolean onDown(MotionEvent e) {
       return true;
   }
}
mDetector = new GestureDetector(PieChart.this.getContext(), new mListener());
```

不管你是否使用GestureDetector.SimpleOnGestureListener, 你必须总是实现onDown()方法，并返回true。这一步是必须的，因为所有的gestures都是从onDown()开始的。如果你在onDown()里面返回false，系统会认为你想要忽略后续的gesture,那么GestureDetector.OnGestureListener的其他回调方法就不会被执行到了。一旦你实现了GestureDetector.OnGestureListener并且创建了GestureDetector的实例, 你可以使用你的GestureDetector来中止你在onTouchEvent里面收到的touch事件。

```java
@Override
public boolean onTouchEvent(MotionEvent event) {
   boolean result = mDetector.onTouchEvent(event);
   if (!result) {
       if (event.getAction() == MotionEvent.ACTION_UP) {
           stopScrolling();
           result = true;
       }
   }
   return result;
}
```

当你传递一个touch事件到onTouchEvent()时，若这个事件没有被辨认出是何种gesture，它会返回false。你可以执行自定义的gesture-decection代码。

## 创建基本合理的物理运动
Gestures是控制触摸设备的一种强有力的方式，但是除非你能够产出一个合理的触摸反馈，否则将是违反用户直觉的。一个很好的例子是fling手势，用户迅速的在屏幕上移动手指然后抬手离开屏幕。这个手势应该使得UI迅速的按照fling的方向进行滑动，然后慢慢停下来，就像是用户旋转一个飞轮一样。

但是模拟这个飞轮的感觉并不简单，要想得到正确的飞轮模型，需要大量的物理，数学知识。幸运的是，Android有提供帮助类来模拟这些物理行为。[Scroller](http://developer.android.com/reference/android/widget/Scroller.html)是控制飞轮式的fling的基类。


要启动一个fling，需调用`fling()`，并传入启动速率、x、y的最小值和最大值，对于启动速度值，可以使用[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)计算得出。
```java
@Override
public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
   mScroller.fling(currentX, currentY, velocityX / SCALE, velocityY / SCALE, minX, minY, maxX, maxY);
   postInvalidate();
}
```

> **Note:** 尽管速率是通过GestureDetector来计算的，许多开发者感觉使用这个值使得fling动画太快。通常把x与y设置为4到8倍的关系。


调用[fling()](http://developer.android.com/reference/android/widget/Scroller.html#fling(int, int, int, int, int, int, int, int))时会为fling手势设置物理模型。然后，通过调用定期调用 [Scroller.computeScrollOffset()](http://developer.android.com/reference/android/widget/Scroller.html#computeScrollOffset())来更新Scroller。[computeScrollOffset()](http://developer.android.com/reference/android/widget/Scroller.html#computeScrollOffset())通过读取当前时间和使用物理模型来计算x和y的位置更新Scroller对象的内部状态。调用[getCurrX()](http://developer.android.com/reference/android/widget/Scroller.html#getCurrX())和[getCurrY()](http://developer.android.com/reference/android/widget/Scroller.html#getCurrY())来获取这些值。

大多数view通过Scroller对象的x,y的位置直接到[scrollTo()](http://developer.android.com/reference/android/view/View.html#scrollTo(int, int))，PieChart例子稍有不同，它使用当前滚动y的位置设置图表的旋转角度。
```java
if (!mScroller.isFinished()) {
    mScroller.computeScrollOffset();
    setPieRotation(mScroller.getCurrY());
}
```

[Scroller](http://developer.android.com/reference/android/widget/Scroller.html) 类会为你计算滚动位置，但是他不会自动把哪些位置运用到你的view上面。你有责任确保View获取并运用到新的坐标。你有两种方法来实现这件事情：

* 在调用fling()之后执行postInvalidate(), 这是为了确保能强制进行重画。这个技术需要每次在onDraw里面计算过scroll offsets(滚动偏移量)之后调用postInvalidate()。
* 使用[ValueAnimator](http://developer.android.com/reference/android/animation/ValueAnimator.html)在fling是展现动画，并且通过调用addUpdateListener()增加对fling过程的监听。

这个PieChart 的例子使用了第二种方法。这个方法使用起来会稍微复杂一点，但是它更有效率并且避免了不必要的重画的view进行重绘。缺点是ValueAnimator是从API Level 11才有的。因此他不能运用到3.0的系统之前的版本上。

> ** Note: ** ValueAnimator虽然是API 11才有的，但是你还是可以在最低版本低于3.0的系统上使用它，做法是在运行时判断当前的API Level，如果低于11则跳过。

```java
 mScroller = new Scroller(getContext(), null, true);
 mScrollAnimator = ValueAnimator.ofFloat(0,1);
 mScrollAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
     @Override
     public void onAnimationUpdate(ValueAnimator valueAnimator) {
         if (!mScroller.isFinished()) {
             mScroller.computeScrollOffset();
             setPieRotation(mScroller.getCurrY());
         } else {
             mScrollAnimator.cancel();
             onScrollFinished();
         }
     }
 });
```

## 使过渡平滑
用户期待一个UI之间的切换是能够平滑过渡的。UI元素需要做到渐入淡出来取代突然出现与消失。Android从3.0开始有提供[property animation framework](http://developer.android.com/guide/topics/graphics/prop-animation.html),用来使得平滑过渡变得更加容易。

使用这套动画系统时，任何时候属性的改变都会影响到你的视图，所以不要直接改变属性的值。而是使用ValueAnimator来实现改变。在下面的例子中，在PieChart 中更改选择的部分将导致整个图表的旋转，以至选择的进入选择区内。ValueAnimator在数百毫秒内改变旋转量，而不是突然地设置新的旋转值。

```java
mAutoCenterAnimator = ObjectAnimator.ofInt(PieChart.this, "PieRotation", 0);
mAutoCenterAnimator.setIntValues(targetAngle);
mAutoCenterAnimator.setDuration(AUTOCENTER_ANIM_DURATION);
mAutoCenterAnimator.start();
```

如果你想改变的是view的某些基础属性，你可以使用[ViewPropertyAnimator](http://developer.android.com/reference/android/view/ViewPropertyAnimator.html) ,它能够同时执行多个属性的动画。

```java
animate().rotation(targetAngle).setDuration(ANIM_DURATION).start();
```
