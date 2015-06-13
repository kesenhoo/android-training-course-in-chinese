# 传输数据时避免消耗大量电量

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/index.html>

在这一章，我们将学习最小化下载，网络连接，尤其是无线电连接对电量的影响。

下面几节课会演示如何使用像缓存（caching）、轮询（polling）和预取（prefetching）这样的技术来调度与执行下载操作。我们还会学习无线电波的 power-use 属性配置是如何影响我们对于在何时，用什么，以何种方式来传输数据的选择。当然这些选择是为了最小化对电量的影响。

**我们同样需要阅读**
[优化电池使用时间](performance/monitoring-device-state/index.html)

## Lesson

[**优化下载以高效地访问网络**](efficient-network-access.html)

  这节课介绍了无线电波状态机（wireless radio state machine），解释了 app 的连接模型（connectivity model）如何与它交互，以及如何最小化数据连接和使用预取（prefetching）和捆绑（bundling）来最小化数据传输对电池消耗的影响。


[**最小化定期更新造成的影响**](regular-update.html)

  这节课我们将了解如何调整刷新频率以最大程度减轻底层无线电波状态机的后台更新所造成的影响。


[**重复的下载是冗余的**](redundant-redundant.html)

  减少下载的最根本途径是只下载我们需要的内容。这节课介绍了消除冗余下载的一些最佳实践。


* [**根据网络连接类型来调整下载模式**](connectivity-patterns.html)

  不同连接类型对电池电量的影响并不相同。不仅仅是 Wi-Fi 比无线电波更省电，不同的无线电波技术对电量也有不同的影响。
