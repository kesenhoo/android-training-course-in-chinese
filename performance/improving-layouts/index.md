# 提升Layout的性能

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <http://developer.android.com/training/improving-layouts/index.html>

Layout 是 Android 应用中直接影响用户体验的关键部分。如果实现的不好，你的 Layout 会导致稍微费内存一点的程序变得非常卡顿。Android SDK 带有帮助你找到 Layout 性能问题的工具。使用它，你会用最小的内存空间实现流畅的 UI。

# 课程

#### [优化 Layout 的层级](optimizing-layout.html)

就像一个复杂的网页会减慢载入速度，你的 Layout 结构如果太复杂，也会造成性能问题。本节教你如何使用 SDK 自带工具来检查 Layout 并找到瓶颈。


#### [使用 <include/> 标签重用 Layout](reuse-layouts.html)

如果你的程序 UI 在不同地方重复使用某个 Layout，那本节教你如何创建高效的，可重用的 Layout 部件，并把它们“包含”到 UI Layout 中。

#### [按需载入视图](loading-ondemand.html)

除了简单的把一个 Layout 包含到另一个中，你可能还想在程序开始后，仅当你的 Layout 对用户可见时才开始载入。本节告诉你如何分步载入 Layout 来提高初始性能。

#### [Making ListView Scrolling Smooth](smooth-scrolling.html)

如果你有一个包含复杂或者每个项 (item) 包含很多数据的 ListView ，那么上下滚动的性能可能会降低。本节给你一些关于如何把滚动变得更流畅的提示。
