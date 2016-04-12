# 实现自定义View的绘制

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/custom-view/custom-draw.html>

自定义view的最重要的一个部分是自定义它的外观。根据你的程序的需求，自定义绘制可能简单也可能很复杂。这节课会演示一些最常见的操作。

## Override onDraw()
重绘一个自定义的view的最重要的步骤是重写onDraw()方法。onDraw()的参数是一个Canvas对象。Canvas类定义了绘制文本，线条，图像与许多其他图形的方法。你可以在onDraw方法里面使用那些方法来创建你的UI。

在你调用任何绘制方法之前，你需要创建一个Paint对象。

<!-- more -->

## 创建绘图对象
android.graphics framework把绘制定义为下面两类:

* 绘制什么，由Canvas处理
* 如何绘制，由Paint处理

例如Canvas提供绘制一条直线的方法，Paint提供直线颜色。Canvas提供绘制矩形的方法，Paint定义是否使用颜色填充。简单来说：Canvas定义你在屏幕上画的图形，而Paint定义颜色，样式，字体，

所以在绘制之前，你需要创建一个或者多个Paint对象。在这个PieChart 的例子，是在`init()`方法实现的，由constructor调用。

```java
private void init() {
   mTextPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
   mTextPaint.setColor(mTextColor);
   if (mTextHeight == 0) {
       mTextHeight = mTextPaint.getTextSize();
   } else {
       mTextPaint.setTextSize(mTextHeight);
   }

   mPiePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
   mPiePaint.setStyle(Paint.Style.FILL);
   mPiePaint.setTextSize(mTextHeight);

   mShadowPaint = new Paint(0);
   mShadowPaint.setColor(0xff101010);
   mShadowPaint.setMaskFilter(new BlurMaskFilter(8, BlurMaskFilter.Blur.NORMAL));

   ...
```

刚开始就创建对象是一个重要的优化技巧。Views会被频繁的重新绘制，初始化许多绘制对象需要花费昂贵的代价。在onDraw方法里面创建绘制对象会严重影响到性能并使得你的UI显得卡顿。

## 处理布局事件
为了正确的绘制你的view，你需要知道view的大小。复杂的自定义view通常需要根据在屏幕上的大小与形状执行多次layout计算。而不是假设这个view在屏幕上的显示大小。即使只有一个程序会使用你的view，仍然是需要处理屏幕大小不同，密度不同，方向不同所带来的影响。

尽管view有许多方法是用来计算大小的，但是大多数是不需要重写的。如果你的view不需要特别的控制它的大小，唯一需要重写的方法是[onSizeChanged()](http://developer.android.com/reference/android/view/View.html#onSizeChanged(int, int, int, int)).

onSizeChanged()，当你的view第一次被赋予一个大小时，或者你的view大小被更改时会被执行。在onSizeChanged方法里面计算位置，间距等其他与你的view大小值。

当你的view被设置大小时，layout manager(布局管理器)假定这个大小包括所有的view的内边距(padding)。当你计算你的view大小时，你必须处理内边距的值。这段`PieChart.onSizeChanged()`中的代码演示该怎么做:

```java
       // Account for padding
       float xpad = (float)(getPaddingLeft() + getPaddingRight());
       float ypad = (float)(getPaddingTop() + getPaddingBottom());

       // Account for the label
       if (mShowText) xpad += mTextWidth;

       float ww = (float)w - xpad;
       float hh = (float)h - ypad;

       // Figure out how big we can make the pie.
       float diameter = Math.min(ww, hh);
```

如果你想更加精确的控制你的view的大小，需要重写[onMeasure()](http://developer.android.com/reference/android/view/View.html#onMeasure(int, int))方法。这个方法的参数是View.MeasureSpec，它会告诉你的view的父控件的大小。那些值被包装成int类型，你可以使用静态方法来获取其中的信息。

这里是一个实现[onMeasure()](http://developer.android.com/reference/android/view/View.html#onMeasure)的例子。在这个例子中`PieChart`试着使它的区域足够大，使pie可以像它的label一样大:

```java
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
   // Try for a width based on our minimum
   int minw = getPaddingLeft() + getPaddingRight() + getSuggestedMinimumWidth();
   int w = resolveSizeAndState(minw, widthMeasureSpec, 1);

   // Whatever the width ends up being, ask for a height that would let the pie
   // get as big as it can
   int minh = MeasureSpec.getSize(w) - (int)mTextWidth + getPaddingBottom() + getPaddingTop();
   int h = resolveSizeAndState(MeasureSpec.getSize(w) - (int)mTextWidth, heightMeasureSpec, 0);

   setMeasuredDimension(w, h);
}
```

上面的代码有三个重要的事情需要注意:

* 计算的过程有把view的padding考虑进去。这个在后面会提到，这部分是view所控制的。
* 帮助方法resolveSizeAndState()是用来创建最终的宽高值的。这个方法比较 view 的期望值与传递给 onMeasure 方法的 spec 值，然后返回一个合适的View.MeasureSpec值。
* onMeasure()没有返回值。它通过调用setMeasuredDimension()来获取结果。调用这个方法是强制执行的，如果你遗漏了这个方法，会出现运行时异常。

## 绘图!
每个view的onDraw都是不同的，但是有下面一些常见的操作：

* 绘制文字使用drawText()。指定字体通过调用setTypeface(), 通过setColor()来设置文字颜色.
* 绘制基本图形使用drawRect(), drawOval(), drawArc(). 通过setStyle()来指定形状是否需要filled, outlined.
* 绘制一些复杂的图形，使用Path类. 通过给Path对象添加直线与曲线, 然后使用drawPath()来绘制图形. 和基本图形一样，paths也可以通过setStyle来设置是outlined, filled, both.
* 通过创建LinearGradient对象来定义渐变。调用setShader()来使用LinearGradient。
* 通过使用drawBitmap来绘制图片.

```java
protected void onDraw(Canvas canvas) {
   super.onDraw(canvas);

   // Draw the shadow
   canvas.drawOval(
           mShadowBounds,
           mShadowPaint
   );

   // Draw the label text
   canvas.drawText(mData.get(mCurrentItem).mLabel, mTextX, mTextY, mTextPaint);

   // Draw the pie slices
   for (int i = 0; i < mData.size(); ++i) {
       Item it = mData.get(i);
       mPiePaint.setShader(it.mShader);
       canvas.drawArc(mBounds,
               360 - it.mEndAngle,
               it.mEndAngle - it.mStartAngle,
               true, mPiePaint);
   }

   // Draw the pointer
   canvas.drawLine(mTextX, mPointerY, mPointerX, mPointerY, mTextPaint);
   canvas.drawCircle(mPointerX, mPointerY, mPointerSize, mTextPaint);
}
```
