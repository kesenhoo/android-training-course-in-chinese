# 在IntentService中执行后台任务

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/index.html>


除非你特别指定，否则大部分在前台UI界面上的操作都执行在一个叫做UI Thread的特殊线程中。这可能会导致某些问题，因为耗时操作可能会干扰界面的响应性能。为了避免这样的问题，Android Framework提供了几个类，用来帮助你把那些耗时操作移动到后台线程中执行。那些类中最常用的就是[IntentService](http://developer.android.com/reference/android/app/IntentService.html).

这一章节会讲到如何实现一个IntentService，向它发送任务并反馈它的结果给其他模块。

## Lessons

* [Creating a Background Service:创建IntentService](create-service.html)

  学习如何创建一个IntentService。


* [Sending Work Requests to the Background Service:发送任务请求到IntentService](send-request.html)

  学习如何发送工作任务到IntentService。


* [Reporting Work Status:报告后台任务的执行状态](report-status.html)

  学习如何使用Intent与LocalBroadcastManager在Activit与IntentService之间进行交互。
