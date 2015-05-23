# 优化性能和电池使用时间

> 编写:[heray1990](https://github.com/heray1990) - 原文: <http://developer.android.com/training/wearables/watch-faces/performance.html>

除了有好的 notification cards 和系统指示图标之外，我们还需要确保表盘的动画运行流畅，服务不会执行没必要的计算。Android Wear 的表盘会在设备上一直运行，所以表盘高效地使用电池显得十分重要。

这节课提供了一些提示来加快动画的速度，测量和节省设备上的电量。

## 减小位图资源的尺寸

很多表盘由一张背景图片及其它被转换和覆盖在背景图片上面的图形资源组成，例如时钟指针和其它随着时间移动的设计组件。没词系统重新绘制表盘的时候，在 `Engine.onDraw()` 方法里面，这些图像组件往往会旋转（有时会缩放），详见[绘制表盘](http://hukai.me/android-training-course-in-chinese/wearables/watch-faces/drawing.html#Drawing)。

这些图形资源越大，转换它们所需的运算量就越大。在 `Engine.onDraw()` 方法中转换大的图形资源会大大地减低系统运行动画的帧率。

为了提升表盘的性能，我们需要：

* 不要使用比我们需要的更大的图像组件。
* 删除边缘周围多出来的透明像素。

在 Figure 1 中的时钟指针例子可以将大小减小97%。

![](ClockHandFull.png)![](ClockHandCropped.png)

**Figure 1.** 可以剪裁多余像素的时钟指针

这节内容介绍的减小位图资源的大小不仅提升了动画的性能，也节省了电量。

## 合并位图资源

如果我们有经常需要一起绘制的位图，那么可以考虑将它们合并到同一个图形资源中。在交互模式下，通常我们可以将背景图片和计数标记组合起来，从而避免没词系统重新绘制表盘时，都去绘制两个全屏的位图。

## 当绘制可缩放的位图时禁用反锯齿功能

当使用 <a href="http://developer.android.com/reference/android/graphics/Canvas.html#drawBitmap(android.graphics.Bitmap, float, float, android.graphics.Paint)">Canvas.drawBitmap()</a> 方法绘制可缩放的位图，我们可以使用 [Paint](http://developer.android.com/reference/android/graphics/Paint.html) 实例去设置一些选项。为了提升性能，使用 [setAntiAlias()](http://developer.android.com/reference/android/graphics/Paint.html#setAntiAlias(boolean)) 方法禁用反锯齿，这是由于这个设置对于位图没有任何影响。

<a name="BitmapFiltering"></a>
### 使用位图滤镜

对于绘制在其它组件上的位图资源，可以在同一个 [Paint](http://developer.android.com/reference/android/graphics/Paint.html) 实例上使用 [setFilterBitmap()](http://developer.android.com/reference/android/graphics/Paint.html#setFilterBitmap(boolean)) 方法来打开位图滤镜。Figure 2显示了使用和没使用位图滤镜的放大的时钟指针。

![](BitmapFilterDisabled.png) ![](BitmapFilterEnabled.png)

**Figure 2.** 没使用位图滤镜（左）和使用位图滤镜（右）

> **Note:** 在低比特率的环境模式下，系统不能可靠地渲染图片的颜色，从而不能保证成功地执行位图滤镜。因此，在环境模式下，禁用位图滤镜。

## 将复杂的操作移到 onDraw() 方法外面

每次重新绘制表盘时，系统会调用 `Engine.onDraw()` 方法，所以为了提升性能，我们应该只将用于更新表盘的重要的操作放到这个方法中。

可以的话，避免在 `onDraw()` 方法里处理下面这些操作：

* 加载图片和其它资源。
* 调整图片的大小。
* 分配对象。
* 运行在帧与帧之间不会改变的计算。

通常可以在 `Engine.onCreate()` 方法中运行上述这些操作。我们可以在 执行<a href="http://developer.android.com/reference/android/service/wallpaper/WallpaperService.Engine.html#onSurfaceChanged(android.view.SurfaceHolder, int, int, int)">Engine.onSurfaceChanged()</a> 方法之前调整图片大小。其中，该方法提供了画布的大小。

为了分析表盘的性能，我们可以使用 Android Device Monitor。特别地，确保 `Engine.onDraw()` 实现的运行时间是短的和调用是一致的。详细内容见[使用 DDMS](http://developer.android.com/tools/debugging/ddms.html)。

## 节能的最佳做法

除了前面部分介绍的技术之外，我们还需要按照下面的最佳做法来降低表盘的电量消耗。

### 降低动画的帧频

动画通常需要消耗大量计算资源和电量。大部分动画在每秒30帧的情况下看上去是流畅的，所以我们应该避免动画的帧频比每秒30帧高。

### 让 CPU 睡眠

表盘的动画和内容的小变化会唤醒 CPU。表盘应该在动画之间让 CPU 睡眠。例如，在交互模式下，我们可以每隔一秒使用动画的短脉冲，然后在下一秒让 CPU 睡眠。频繁地让 CPU 睡眠，甚至短暂地，都可以有效地降低电量消耗。

为了最大化电池使用时间，谨慎地使用动画。即使闪烁动画在闪烁的时候也会唤醒 CPU 并且消耗电量。

### 监控电量消耗

在 [Android Wear companion app](https://play.google.com/store/apps/details?id=com.google.android.wearable.app&hl=en) 的 **Settings > Watch battery** 下，开发者和用户可以看到可穿戴设备中不同进程还有多少电量。

在 Android 5.0 中，更多关于提升电池使用时间的信息，请见 [Project Volta](http://developer.android.com/about/versions/android-5.0.html#Power)。