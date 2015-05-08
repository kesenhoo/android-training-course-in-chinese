# 优化自定义View

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/custom-views/optimizing-view.html>

前面的课程学习到了如何创建设计良好的View，并且能够使之在手势与状态切换时得到正确的反馈。下面要介绍的是如何使得view能够执行更快。为了避免UI显得卡顿，你必须确保动画能够保持在60fps。

<!-- more -->

## Do Less, Less Frequently

为了加速你的view，对于频繁调用的方法，需要尽量减少不必要的代码。先从onDraw开始，需要特别注意不应该在这里做内存分配的事情，因为它会导致GC，从而导致卡顿。在初始化或者动画间隙期间做分配内存的动作。不要在动画正在执行的时候做内存分配的事情。

你还需要尽可能的减少onDraw被调用的次数，大多数时候导致onDraw都是因为调用了invalidate().因此请尽量减少调用invaildate()的次数。如果可能的话，尽量调用含有4个参数的invalidate()方法而不是没有参数的invalidate()。没有参数的invalidate会强制重绘整个view。

另外一个非常耗时的操作是请求layout。任何时候执行requestLayout()，会使得Android UI系统去遍历整个View的层级来计算出每一个view的大小。如果找到有冲突的值，它会需要重新计算好几次。另外需要尽量保持View的层级是扁平化的，这样对提高效率很有帮助。

如果你有一个复杂的UI，你应该考虑写一个自定义的ViewGroup来执行他的layout操作。与内置的view不同，自定义的view可以使得程序仅仅测量这一部分，这避免了遍历整个view的层级结构来计算大小。这个PieChart 例子展示了如何继承ViewGroup作为自定义view的一部分。PieChart 有子views，但是它从来不测量它们。而是根据他自身的layout法则，直接设置它们的大小。

## 使用硬件加速

从Android 3.0开始，Android的2D图像系统可以通过GPU (Graphics Processing Unit))来加速。GPU硬件加速可以提高许多程序的性能。但是这并不是说它适合所有的程序。Android framework让你能过随意控制你的程序的各个部分是否启用硬件加速。

参考 Android Developers Guide 中的[Hardware Acceleration](http://developer.android.com/guide/topics/graphics/hardware-accel.html) 来学习如何在application, activity, 或 window 层启用加速。注意除了 Android Guide 的指导之外，你必须要设置你的应用的target API为11，或更高，通过在你的AndroidManifest.xml 文件中增加 < uses-sdk android:targetSdkVersion="11"/> 。

一旦你开启了硬件加速，性能的提示并不一定可以明显察觉到。移动设备的GPU在某些例如scaling,rotating与translating的操作中表现良好。但是对其他一些任务，比如画直线或曲线，则表现不佳。为了充分发挥GPU加速，你应该最大化GPU擅长的操作的数量，最小化GPU不擅长操作的数量。

在下面的例子中，绘制pie是相对来说比较费时的。解决方案是把pie放到一个子view中，并设置View使用LAYER_TYPE_HARDWARE来进行加速。

```java
private class PieView extends View {

       public PieView(Context context) {
           super(context);
           if (!isInEditMode()) {
               setLayerType(View.LAYER_TYPE_HARDWARE, null);
           }
       }
       
       @Override
       protected void onDraw(Canvas canvas) {
           super.onDraw(canvas);

           for (Item it : mData) {
               mPiePaint.setShader(it.mShader);
               canvas.drawArc(mBounds,
                       360 - it.mEndAngle,
                       it.mEndAngle - it.mStartAngle,
                       true, mPiePaint);
           }
       }

       @Override
       protected void onSizeChanged(int w, int h, int oldw, int oldh) {
           mBounds = new RectF(0, 0, w, h);
       }

       RectF mBounds;
   }
```

通过这样的修改以后，PieChart.PieView.onDraw()只会在第一次现实的时候被调用。之后，pie chart会被缓存为一张图片，并通过GPU来进行重画不同的角度。GPU特别擅长这类的事情，并且表现效果突出。

缓存图片到hardware layer会消耗video memory，而video memory又是有限的。基于这样的考虑，仅仅在用户触发scrolling的时候使用`LAYER_TYPE_HARDWARE`，在其他时候，使用`LAYER_TYPE_NONE`。
