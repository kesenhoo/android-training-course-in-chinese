# 使用Fragment建立动态UI

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/basics/fragments/index.html>

* 为了在Android上创建动态的、多窗口的用户交互体验，你需要将UI组件和Activity操作封装成模块进行使用，在activity中你可以对这些模块进行切入切出操作。你可以用[Fragment](http://developer.android.com/intl/zh-cn/reference/android/app/Fragment.html)来创建这些模块，Fragment就像一个嵌套的activity，拥有自己的布局（layout）以及管理自己的生命周期。

* 如果一个fragment定义了自己的布局，那么在activity中它可以与其他的fragments生成不同的组合，从而为不同的屏幕尺寸生成不同的布局（一个小的屏幕一次只放一个fragment，大的屏幕则可以两个或以上的fragment）。

* 这一章将向你展示如何用fragment来创建动态的用户体检，以及在不同屏幕尺寸的设备上优化你的APP的用户体验。像运行着android1.6这样老版本的设备，也都将继续得到支持。

* 完整的Demo示例：[FragmentBasics.zip](http://developer.android.com/shareables/training/FragmentBasics.zip "FragmentBasics.zip")

## Lessons

* [**创建一个fragment**](creating.html)

  学习如何创建一个fragment，以及实现它生命周期内的基本功能。


* [**构建灵活的UI**](fragment-ui.html)

  学习在APP内，对不同的屏幕尺寸用fragments构建不同的布局。


* [**与其他fragments交互**](communicating.html)

  学习fragment与activity以及其他fragments之间交互。

