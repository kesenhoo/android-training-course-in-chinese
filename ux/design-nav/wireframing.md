# 综合：设计我们的样例 App

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/design-navigation/wireframing.html>

现在我们对导航模式和界面组合技术有了深入的理解，是时候应用到我们的界面上了。让我再看看我们第一节课上提到的新闻应用的界面完备图：

![app-navigation-screen-planning-exhaustive-map](app-navigation-screen-planning-exhaustive-map.png)

**Figure 1.** 新闻应用例子的界面完备集

我们下一步得去我们前几节讨论的导航模式选择，然后应用到这个界面图中。这样就能最大化导航速度并且最少化获取内容的点击次数，但又能参考 Android 做法来保证界面的直观性和一致性。此外，我们也需要根据我们不同目标设备的参数做出不同的决定。为方便，我们集中讨论平板和手持设备。

## 选择模式

首先，我们二级界面（*新闻类别列表* ，*图片列表* 和 *保存列表*）可用 Tab 组合在一起。注意到我们不必使用水平排列的 Tab；某些情况下下拉菜单可作为合适的替代品，特别在手机这种窄屏设备上。在手机上，我们能用 Tab 把 *图片保存列表* 和 *新闻保存列表* 组合到一起，或在平板上用多个纵向排列的内容视窗。

最后，让我们看看如何展示新闻。第一个简化不同新闻类别间导航的选项：使用水平分页，然后再在滑动区域上添加一组标签来提示当前可见和临近的新闻类别。对于平板横屏，我们可以进一步地展示能水平分页的 *新闻列表* 界面作为左边的视窗，并且把 *新闻详情 View* 界面作为基础内容视窗放在右边。

下图分别表示在手持设备和平板上应用了这些导航模式后的新界面图。

![app-navigation-wireframing-map-example-phone](app-navigation-wireframing-map-example-phone.png)

**Figure 2.** 手持设备上新闻应用例子的最终界面集

![app-navigation-wireframing-map-example-tablet](app-navigation-wireframing-map-example-tablet.png)

**Figure 3.** 平板上新闻应用例子的最终界面集，横屏

至此，得好好考虑下界面图的衍化了，以免我们选择的模式实际上用不了（比如当你画应用界面布局的草图时）。下面有个为平板衍化的界面图样例，它并排展示不同类别的 *新闻列表*，但是 *新闻详情View* 保持独立。

![app-navigation-wireframing-map-example-tablet-alt](app-navigation-wireframing-map-example-tablet-alt.png)

**Figure 4.** 平板上新闻应用例子的最终界面集，竖屏

## 画草稿

[Wireframing](http://en.wikipedia.org/wiki/Website_wireframe)就是设计过程中你开始排布界面的那步。发挥你的创造性，想想怎么排列这些 UI 元件来帮助你的用户在你的 App 中导航。这时你要记住细枝末节是不重要的（别去想着做个实物）。

最简单快速的起步方法就是用纸笔手画你界面。一旦你开始画，你会发现在你原本的界面图或在你决定使用的模式中有很多实际的问题。某些情况下，模式理论上能很好的解决特定设计问题，但实际上他们可能失效并且给视觉交互添乱（例如，界面上出现了两行 Tab）。如果那样，探索下其他的导航模式，或在选择的模式上做点变化，来让你的草稿更优。

当你对初稿满意后，继续用一些软件画你的数字wireframe吧，例如：Adobe® Illustrator，Adobe® Fireworks，OmniGraffle 或者 向量图工具。选择画图工具时，考虑以下特性：

* 能画体现交互的 wireframe 么？像Adobe® Fireworks就能提供这个功能。

* 有界面“大师”功能（允许不同界面的视觉元素重用）？例如，Action Bar必须在你应用的每个界面都出现。

* 学习曲线怎样？专业向量图工具可能有个陡峭的学习曲线（越学越难），但有些功能小巧的 wireframing 设计工具可能更适合这个任务。

最后，XML 布局编辑器，[Android 开发工具包（ADT）](http://developer.android.com/tools/help/adt.html)里面的一个 Eclipse 插件，经常被用来画草图原型。但是，你应当贯注于高质量的布局而非细节视觉设计。

## 创建数字草图

在纸上画完草图并且选择好一款心仪的数字wireframing工具后，你可以创建一个数字wireframe作为你应用视觉设计的起点。下面就是一些我们新闻客户端wireframe例子，他们和我们之前的界面图一一对应。

![app-navigation-wireframing-wires-phone](app-navigation-wireframing-wires-phone.png)

**Figure 5.** 新闻客户端手机竖屏Wireframe样例（下载 [SVG](http://developer.android.com/training/design-navigation/example-wireframe-phone.svg) 图）

![app-navigation-wireframing-wires-tablet](app-navigation-wireframing-wires-tablet.png)

**Figure 6.** 新闻客户端平板横屏Wireframe样例（下载 [SVG](http://developer.android.com/training/design-navigation/example-wireframe-tablet.svg) 图）

（[下载表示设备的 Wireframe 的 SVG 图](http://developer.android.com/training/design-navigation/example-wireframe-device-template.svg)）

## 下一步

现在你已经为你的应用设计出了高效直观的 App 内部导航，你可用开始花时间来为单个界面改善 UI了。例如，展示交互内容时，你可以选择使用更花哨的控件来代替简单的文本标签，图像和按钮。你也可以开始定义你应用的视觉风格。在这过程中把你品牌的元素作为视觉语言融入其中吧。

最后，也适时实现你的设计吧，使用 Android SDK 为你的应用写写代码。想开始？看看下面的这些资源吧：

* [开发者指导：UI](http://developer.android.com/guide/topics/ui/index.html) :学习如何用 Android SDK 实现你的 UI 设计。

* [Action Bar](http://developer.android.com/guide/topics/ui/actionbar.html) :实现tab，向上导航，屏幕上动作，等等。

* [Fragment](http://developer.android.com/guide/components/fragments.html) :实现可重用，多视窗布局

* [支持库](http://developer.android.com/tools/support-library/index.html) :用`ViewPager`实现水平分页（Swipe View）
