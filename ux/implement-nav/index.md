# 实现高效的导航

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/implementing-navigation/index.html>

这节课将会演示如何实现在[Designing Effective Navigation](http://developer.android.com/training/design-navigation/index.html)中所详述的关键导航设计模式。

在阅读这节课程内容之后，你会对如何使用tabs, swipe views, 和navigation drawer实现导航模式有一个深刻的理解。也会明白如何提供合适的向前向后导航(Up and Back navigation)。

> **Note**:本节课中的几个元素需要使用[Support Library](http://developer.android.com/tools/support-library/index.html) API。如果你之前没有使用过Support Library，可以按照[Support Library Setup](http://developer.android.com/tools/support-library/setup.html)文档说明来使用。

## Sample Code

[EffectiveNavigation.zip](http://developer.android.com/shareables/training/EffectiveNavigation.zip)

## Lessons

* [使用Tabs创建Swipe View](lateral.md)

  学习如何在action bar中实现tab，并提供横向分页(swipe views)在tab之间导航切换。


* [创建抽屉导航(Navigation Drawer)](nav-drawer.md)

  学习如何建立隐藏于屏幕边上的界面，通过划屏(swipe)或点击action bar中的app图标来显示这个界面。


* [提供向上导航](ancestral.md)

  学习如何使用action bar中的app图标实现向上导航


* [提供适当的向后导航](temporal.md)

  学习如何正确处理特殊情况下的向后按钮(Back button)，包括在通知或app widget中的深度链接，如何将activity插入后退栈(back stack)中。


* [实现Descendant Navigation](descendant.md)

  学习更精细地导航进入你的应用信息层。

