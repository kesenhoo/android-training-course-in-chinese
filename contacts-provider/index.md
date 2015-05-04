# 联系人信息

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/contacts-provider/index.html>

**[Contacts Provider](http://developer.android.com/guide/topics/providers/contacts-provider.html)**是用户联系人信息的集中仓库， 它包含了来自联系人应用与社交应用的联系人数据。在我们的应用中，我们可以通过调用[**ContentResolver**](http://developer.android.com/reference/android/content/ContentResolver.html)方法或者通过发送Intent给联系人应用来访问Contacts Provider的信息。

这个章节会讲解获取联系人列表，显示指定联系人详情以及通过intent来修改联系人信息。这里介绍的基础技能能够扩展到执行更复杂的任务。另外，这个章节也会帮助我们了解Contacts Provider的整个架构与操作方法。

## Lessons

[**获取联系人列表**](retrieve-names.html)

学习如何获取联系人列表。你可以使用下面的技术来筛选需要的信息：

  * 通过联系人名字进行筛选
  * 通过联系人类型进行筛选
  * 通过类似电话号码等指定的一类信息进行筛选。


[**获取联系人详情**](retrieve-detail.html)

学习如何获取单个联系人的详情。一个联系人的详细信息包括电话号码与邮件地址等等。你可以获取所有的详细信息，也有可以只获取指定类型的详细数据，例如邮件地址。


[**使用Intents修改联系人信息**](modify-data.html)

学习如何通过发送intent给联系人应用来修改联系人信息。


[**显示联系人头像**](display-badge.html)

学习如何显示**QuickContactBadge**小组件。当用户点击联系人臂章(头像)组件时，会打开一个对话框，这个对话框会显示联系人详情，并提供操作按钮来处理详细信息。例如，如果联系人信息有邮件地址，这个对话框可以显示一个启动默认邮件应用的操作按钮。
