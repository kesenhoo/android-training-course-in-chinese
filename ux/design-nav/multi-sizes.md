# 为多种大小的屏幕进行规划

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/design-navigation/multiple-sizes.html>

虽然上节中的界面完备图在手持设备和相似大小设备上可行，但并不是和某个设备因素绑死的。Android应用需要适配一大把不同类型的设备，从3"的手机到10"的平板到42"的电视。这节课中我们探讨把完备图中不同界面组合起来的策略和原因。

> **Note:** 为电视设计应用程序还需要注意其他的因素，包括互动方式（就是说，它没触屏），长距离情况下文本的可读性，还有其他的。虽然这个讨论在本课范畴之外，你仍然可以在 [Google TV](https://developers.google.com/tv) 文档的[设计模式](https://developers.google.com/tv/android/docs/gtv_android_patterns)中找到有关为电视设计的信息。

## 用多视窗布局（Multi-pane Layout）组合界面

> **多视窗布局（Multi-pane Layout）设计**

> 设计指南请阅读 Android 设计部分的[多视窗布局](http://developer.android.com/design/patterns/multi-pane-layouts.html)。

3 到 4英寸的屏幕通常只适合每次展示单个纵向内容视窗，一个列表，或某列表项的具体信息，等等。所以在这些设备上，界面通常对映于信息层次上的某一级（类别 → 列表 → 详情）。

更大的诸如平板和电视上的屏幕通常会有更多的可用界面空间，并且他们能够展示多个内容视窗。横屏中，视窗从左到右以细节程度递增的顺序排列。因常年使用桌面应用和网站，用户变得特别适应大屏上的多视窗。很多桌面应用和网站提供左侧导航视窗，或者使用总/分（master/detail）两个视窗布局。



为了符合这些用户期望，通常很有必要为平板提供多个信息视窗来避免留下过多空白或无意间引入尴尬的交互，比如 10 x 0.5" 按钮。

下面图例示范了当把 UI 设计迁移到更大的布局时出现的一些问题，并且展示了如何用多视窗布局来处理这些问题：

![app-navigation-multiple-sizes-multipane-bad](app-navigation-multiple-sizes-multipane-bad.png)


**图 1.** 大横屏使用单视窗导致尴尬的空白和过长行。

![app-navigation-multiple-sizes-multipane-good](app-navigation-multiple-sizes-multipane-good.png)

**图 2.** 横屏多视窗布局产生更好的视觉平衡，更大的效用和可读性。


> **实现提醒：** 当决定好了区分使用单视窗布局和多视窗布局的屏幕大小基准线后，你就可以为不同屏幕大小区间（例如 `large/xlarge`）或最低屏幕宽度（例如 `sw600dp`）提供不同的布局了。

> **实现提醒：** 单一界面被实现为 [Activity](http://developer.android.com/reference/android/app/Activity.html) 的子类, 单独的内容视窗则可实现为 [Fragment](http://developer.android.com/reference/android/app/Fragment.html) 的子类。这样最大化了跨越不同结构因素和不同屏幕内容的代码复用。

## 为不同平板方向设计

虽然现在我们还没有开始在我们的屏幕上排布 UI 元素，但现在很是时候来考虑下我们的多视窗界面如何适配不同的设备方向了。多视窗布局在横屏时表现的非常棒，因为有大量可用的横向空间。然而，在竖屏时，你的横向空间被限制了，所以你需要为这个方向设计一个单独的布局。

下面是一些创建竖屏布局的常见策略：

* **伸缩** ![app-navigation-multiple-sizes-strategy-stretch](app-navigation-multiple-sizes-strategy-stretch.png)

  最直接的策略就是简单地伸缩每个视窗的宽度来最好地在竖屏下的呈现内容。视窗可设置固定宽度或占可用界面宽度的一定比例。


* **展开/折叠** ![app-navigation-multiple-sizes-strategy-collapse](app-navigation-multiple-sizes-strategy-collapse.png)

  伸缩策略的一个变种就是在竖屏中折叠左侧视窗的内容。当遇到总/分（master/detail）视窗中左侧（master）视窗包含易折叠列表项时，这个策略很有效。以一个实时聊天应用为例。横屏中，左侧列表可能包含聊天联系人的照片，姓名和在线状态。在竖屏中，横向空间可以将通过隐藏联系人姓名而且只显示照片和在线状态的提示图标的方式来折叠。也可以选择性的提供展开控制，这种控制允许用户展开左侧视窗或反向操作。


* **显示/隐藏** ![app-navigation-multiple-sizes-strategy-show-hide](app-navigation-multiple-sizes-strategy-show-hide.png)

  这个方案中，左侧视窗在竖屏模式下完全隐藏。然而，为了保证你界面的功能等价性，左侧视窗必须功能可见（比如，添一个按钮）。通常适合在 Action Bar 使用 *Up* 按钮（详见Android设计的[模式](http://developer.android.com/design/patterns/actionbar.html)文档）来展示左侧视窗，这将在[之后](ancestral-temporal.html)讨论。


* **堆叠** ![app-navigation-multiple-sizes-strategy-stack](app-navigation-multiple-sizes-strategy-stack.png)

  最后的策略就是在竖屏时垂直地堆放你一般横向排布的视窗。当你的视窗不是简单的文本列表，或者当有多个内容模块与基本内容视窗同时运行时，这个策略很奏效。但是当心使用这个策略时出现上面提到的尴尬的空白问题。


## 组合界面图中的界面

既然现在我们能够通过提供大屏设备上的多视窗布局来组合单独的界面，那么就让我们把这个技术应用到我们[上节课](screen-planning.html)界面完备图上吧，这样我们应用的界面层次在这类设备上变得更具体了：

![app-navigation-multiple-sizes-multipane-screen-map](app-navigation-multiple-sizes-multipane-screen-map.png)

**Figure 3.** 更新后新闻应用例子的界面完备Map

下节课我们将讨论 *向下* 和 *横向* 导航，并且探讨更多方法来组合界面使能最大化应用 UI 的直观性和内容获取速度。

[下一节：提供向下和横向导航](descendant-lateral.md)
