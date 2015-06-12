# 使用触摸手势

> 编写:[Andrwyw](https://github.com/Andrwyw) - 原文:<http://developer.android.com/training/gestures/index.html>

本章节讲述，如何编写一个允许用户通过触摸手势进行交互的app。Android提供了各种各样的API，来帮助我们创建和检测手势。

尽管对于一些基本的操作来说，我们的app不应该依赖于触摸手势（因为某些情况下手势是不用的）。但为我们的app添加基于触摸的交互，将会大大地提高app的可用性和吸引力。

为了给用户提供一致的、符合直觉的使用体验，我们的app应该遵守Android触摸手势的惯常做法。[手势设计指南](http://developer.android.com/design/patterns/gestures.html)介绍了在Android app中，如何使用常用的手势。同样，设计指南也提供了[触摸反馈](http://developer.android.com/design/style/touch-feedback.html)的相关内容。

## Lessons

[**检测常用的手势**](detector.html)

  学习如何通过使用[GestureDetector](http://developer.android.com/reference/android/view/GestureDetector.html)来检测基本的触摸手势，如滑动、惯性滑动以及双击。


[**追踪手势移动**](movement.html)

  学习如何追踪手势移动。


[**Scroll手势动画**](scroll.html)

  学习如何使用scrollers（[Scrollers](http://developer.android.com/reference/android/widget/Scroller.html)以及[OverScroll](http://developer.android.com/reference/android/widget/OverScroller.html)）来产生滚动动画，以响应触摸事件。


[**处理多触摸手势**](multi.html)

  学习如何检测多点(手指)触摸手势。


[**拖拽与缩放**](scale.html)

  学习如何实现基于触摸的拖拽与缩放。


[**管理ViewGroup中的触摸事件**](viewgroup.html)

  学习如何在[ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html)中管理触摸事件，以确保事件能被正确地分发到目标views上。
