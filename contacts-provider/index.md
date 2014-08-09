# 联系人信息

> 编写：[spencer198711](https://github.com/spencer198711) - 原文：

**[Contacts Provider](http://developer.android.com/guide/topics/providers/contacts-provider.html)**是用户联系人信息的集中仓库， 它包含了来自联系人应用与社交应用的联系人数据。在你的应用中，你可以通过调用[**ContentResolver**](http://developer.android.com/reference/android/content/ContentResolver.html)的方法或者通过发送Intent给联系人应用来访问Contacts Provider的信息。

这个章节会讲解获取联系人列表，显示指定联系人详细以及通过intent来修改联系人信息。这些基础技能能够进行扩展执行更复杂的任务。同时，这个章节也会帮助你了解Contacts Provider的整个架构与操作方法。

## Lessons

* [**获取联系人列表 - Retrieving a List of Contacts**](retrieve-names.html)

  学习如何获取联系人列表。你可以使用下面的技术来筛选需要的信息：

  * 通过联系人名字进行筛选
  * 通过联系人类型进行筛选
  * 通过类似电话号码等指定的一类信息进行筛选。


* [**获取联系人详情 - Retrieving Details for a Contact**](retrieve-detail.html)

  学习如何获取单个联系人的详情。一个联系人的详细信息包括电话号码与邮件地址等等。你可以获取所有的详细信息，也有可以只获取指定的详细数据，例如邮件地址。


* [**修改联系人信息 - Modifying Contacts Using Intents**](modify-data.html)

  学习如何通过发送intent给联系人应用来修改联系人信息。


* [**显示联系人头像 - Displaying the Quick Contact Badge**](display-badge.html)

  学习如何显示**QuickContactBadge**小组件。当用户点击联系人臂章(头像)组件时，会显示一个联系人详情的对话框，并提供给应用可以进行的操作。例如，如果联系人信息有邮件地址，这个对话框可以显示一个启动默认邮件应用的操作按钮。
