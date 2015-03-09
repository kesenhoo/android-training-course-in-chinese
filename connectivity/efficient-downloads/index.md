# 高效下载

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/efficient-downloads/index.html>

在这一章，我们将学习最小化下载，网络连接，尤其是无线电连接对电量的影响。

下面几节课会演示了如何使用缓存(caching)，轮询(polling)，预取(prefetching)等技术来计划与执行下载操作。
我们还会学习无线电波的power-use属性配置是如何影响我们对于在何时，用什么，以何种方式来传输数据的选择。
当然这些选择是为了最小化对电池寿命的影响。

**你同样需要阅读**
[Optimizing Battery Life](performance/monitoring-device-state/index.html)

## 课程列表

* [**Optimizing Downloads for Efficient Network Access - 使用有效的网络连接方式来最优化下载**](efficient-network-access.html)

  这节课介绍了无线广播状态机(wireless radio state machine), 解释了app的连接模型(connectivity model)如何与它交互, 以及如何最小化数据连接, 使用预取(prefetching)和捆绑(bundling)最小化数据传输对电池消耗的影响.

<!-- more -->


* [**Minimizing the Effect of Regular Updates - 优化常规更新操作的效果**](regular-update.html)

  这节课将我们将了解如何调整你的刷新频率以最大程度减轻对底层的无线广播状态机的后台刷新的影响.


* [**Redundant Downloads are Redundant - 重复的下载是冗余的**](redundant-redundant.html)

  减少下载的最根本途径是只下载你需要的内容. 这节课介绍了消除冗余下载的一些最佳实践.


* [**Modifying your Download Patterns Based on the Connectivity Type - 根据网络连接类型来更改下载模式**](connectivity-patterns.html)

  不同连接类型都对电池电量的影响并不相同. 不仅仅是Wi-Fi比无线电波更省电, 不同的无线广播技术对电池也有不同的影响.
