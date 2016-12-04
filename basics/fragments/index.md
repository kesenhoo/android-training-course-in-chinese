# 使用Fragment建立动态UI

> 编写：[fastcome1985] - 原文：<https://developer.android.com/training/basics/fragments/index.html>

为了在 Android 上为用户提供动态的、多窗口的交互体验，需要将 UI 组件和 Activity 操作封装成模块进行使用，这样我们就可以在 Activity 中对这些模块进行切入切出操作。可以用 [Fragment] 创建这些模块，Fragment 就像一个嵌套的 Activity，拥有自己的布局（Layout）并管理自己的生命周期。

Fragment 定义了自己的布局后，它可以在 Activity 中与其他 Fragment 生成不同的组合，从而为不同的屏幕尺寸生成不同的布局（小屏幕一次也许只能显示一个 Fragment，大屏幕则可以显示更多）。

本章将展示如何用 Fragment 创建动态界面，并在不同屏幕尺寸的设备上优化 APP 的用户体验。本章内容支持 Android 1.6 以上的设备。

（完整的 Demo 示例：[FragmentBasics.zip]）

## Lessons

* [**创建 Fragment**]

  学习如何创建 Fragment，以及实现其生命周期内的基本功能。

* [**构建有弹性的 UI**]

  学习如何针对不同的屏幕尺寸用 Fragment 构建不同的布局。

* [**与其他 Fragment 交互**]

  学习如何在 Fragment 与 Activity 或多个 Fragment 间进行交互。


[fastcome1985]: https://github.com/fastcome1985

[Fragment]: //developer.android.com/intl/zh-cn/reference/android/app/Fragment.html
[FragmentBasics.zip]: //developer.android.com/shareables/training/FragmentBasics.zip "FragmentBasics.zip"
[**创建 Fragment**]: ./creating.html
[**构建有弹性的 UI**]: ./fragment-ui.html
[**与其他 Fragment 交互**]: ./communicating.html
