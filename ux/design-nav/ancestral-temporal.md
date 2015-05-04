# 提供向上导航与历史导航

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/design-navigation/ancestral-temporal.html>

既然现在我们能进入应用界面某个层级，我需要提供一个方法来在层级里向上导航到父亲或祖先界面中。此外，我们应该保证通过 *Back* 按钮来回退历史导航记录。

> **回退/向上导航设计**

> 设计指南请阅读 Android 设计文档的[Navigation](http://developer.android.com/design/patterns/navigation.html)模式指导

## 支持历史导航：***Back***

历史导航，或者说在历史的界面间导航，在 Android 系统中由来已久。不论其他状态如何，所有 Android 用户都期望 *Back* 按钮能带他们回到之前的界面。历史界面集全都以用户的 Launcher 应用为基础（电话的 “Home” 键）。也就是说，按下 *Back* 键足够多次数后你应该回到 Launcher，之后 *Back* 键不做任何事情。

![app-navigation-ancestral-navigate-back](app-navigation-ancestral-navigate-back.png)

**Figure 1.** 从 Contacts（联系人）app中进入电子邮件 app 然后按 *Back* 键的行为

应用自身通常不必考虑去管理 *Back* 按钮。系统自己自动处理 [*task* 和 *back
H1H2H3H4
stack*（回退栈）](http://developer.android.com/guide/components/tasks-and-back-stack.html)，或者叫历史界面列表。 *Back* 按钮默认反向访问界面列表，然后当按钮被按下时从列表中移除当前界面。

但是总是有一些你可能需要重写 *Back* 行为的例子。比如，你屏幕包含一个嵌入的网页浏览器，在这个浏览器中你的用户可和页面元件进行交互来在网页间导航。你可能希望当用户按下设备的 *Back* 键时触发嵌入浏览器的默认 *back* 操作。当到达了浏览器内部历史的起始点，你就应该遵从系统 *Back* 按钮的默认行为了。

## 提供向上导航：***Up*** 和 ***Home***

Android 3.0 之前，最常见的向上导航的形式以 *Home* 表示。大体上是以在设备 *Menu* 按钮里提供一个 *Home* 的可选项这样的方法来实现，或者 *Home* 按钮出现在屏幕的左上角作为 Action Barbar（详见Android 设计的[模式](http://developer.android.com/design/patterns/actionbar.html)章节）的一个组件。当选中 *Home* 后，用户被带到界面层级的顶层，通常被叫做应用的主界面。

提供对程序主界面的直接访问能带给用户一种舒适感和安全感。无论位于应用程序何处，如果你在 App 中迷路了，你可以点选 *Home* 然后回到那熟悉的主界面。

Android 3.0 引入了 *Up* 记号，它被展示在了 Action Bar 上代替了上述的 *Home* 按钮。点击 *Up*，用户将被带入到结构中的父界面。这个导航操作通常就是进入前一个界面（就像之前 *Back* 按钮讨论中描述的一样），但是并不是永远都这样。因此，开发者必须保证 *Up* 对于每个界面都会导航到某个既定的父亲界面。

![app-navigation-ancestral-navigate-up](app-navigation-ancestral-navigate-up.png)

**Figure 2.** 从联系人 App 中进入电子邮件 App 然后按 *Up* 导航的行为

某些情况下，*Up* 适合执行某个行为而非导航到一个父亲节点。以 Android 3.0 平板上的 Gmail 应用为例。当查看一封邮件的对话时把设备平放，对话列表和对话详情将并排显示。这是一种[之前课程](multiple-sizes.html)中的父、子界面组合。然而，当竖屏查看邮件对话时，只有对话详情被显示。*Up* 按钮被用来使父视窗滑入屏幕显示。当左侧视窗可见时再按一次 *Up* 按钮，单个对话便回到全屏的对话列表中。

> **实现提醒：** 实现 *Home* 或 *Up* 导航的最佳做法就是保证清除back stack中的子界面。对于 *Home*，Home 界面是唯一留在back stack中的界面。对于 *Up* 导航，当前界面也应该从back stack中移除，除非 *Back* 在不同界面层级间导航。你可以将[ FLAG_ACTIVITY_CLEAR_TOP](http://developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_CLEAR_TOP)和[FLAG_ACTIVITY_NEW_TASK](http://developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_NEW_TASK)这两个 Intent 标记一起使用来实现它。

最后一节课中，我们应用现在为止所有课程中讨论的概念来为我们新闻应用例子创建交互设计 Wireframe（线框图）。

[下节课：综合：设计我们的样例 App](wireframing.md)
