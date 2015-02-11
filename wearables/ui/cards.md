# 创建Cards

> 编写: [roya](https://github.com/RoyaAoki) 原文:<https://developer.android.com/training/wearables/ui/cards.html>

<!--Cards present information to users with a consistent look and feel across different apps. This lesson shows you how to create cards in your Android Wear apps.-->

卡片以一致的外观在不同的apps上为用户呈现当前信息。这个章节为你演示了如何在你的Android Wear apps中创建卡片。

<!--The Wearable UI Library provides implementations of cards specifically designed for wearable devices. This library contains the CardFrame class, which wraps views inside a card-styled frame with a white background, rounded corners, and a light-drop shadow. CardFrame can only contain one direct child, usually a layout manager, to which you can add other views to customize the content inside the card.-->

Wearable UI Library提供了为穿戴设备特别设计的卡片实现。这个库包含了 *CardFrame* 类，它在卡片风格的框架中包裹views，且提供一个白色的背景，圆角，和光透射阴影。*CardFrame* 只能包裹一个直接的子view，这通常是一个layout manager，你可以向它添加其他views以定制卡片内容。

<!--You can add cards to your app in two ways:
Use or extend the CardFragment class.
Add a card inside a CardScrollView in your layout.-->

你有两种方法向你的app添加cards：

* 直接使用或继承 *CardFragment* 类。
* 在你的layout内，在一个 *CardScrollView* 中添加一个card。

<!--Note: This lesson shows you how to add cards to Android Wear activities. Android notifications on wearable devices are also displayed as cards. For more information, see Adding Wearable Features to Notifications.-->

> *Note:* 这个课程为你展示了如何在Android Wear activities中添加cards。Android可穿戴设备上的notifications同样以卡片显示。更多信息请查看 [Adding Wearable Features to Notifications](https://developer.android.com/training/wearables/notifications/index.html)

## 创建Card Fragment
<!--The CardFragment class provides a default card layout with a title, a description, and an icon. Use this approach to add cards to your app if the default card layout shown in figure 1 meets your needs.-->
