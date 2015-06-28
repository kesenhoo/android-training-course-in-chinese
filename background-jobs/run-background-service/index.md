# 在IntentService中执行后台任务

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/run-background-service/index.html>

除非我们特别为某个操作指定特定的线程，否则大部分在前台UI界面上的操作任务都执行在一个叫做UI Thread的特殊线程中。这可能存在某些隐患，因为部分在UI界面上的耗时操作可能会影响界面的响应性能。UI界面的性能问题会容易惹恼用户，甚至可能导致系统ANR错误。为了避免这样的问题，Android Framework提供了几个类，用来帮助你把那些耗时操作移动到后台线程中执行。那些类中最常用的就是[IntentService](http://developer.android.com/reference/android/app/IntentService.html).

这一章节会讲到如何实现一个IntentService，向它发送任务并反馈任务的结果给其他模块。

## Demos
[**ThreadSample.zip**](http://developer.android.com/shareables/training/ThreadSample.zip)

## Lessons

* [创建IntentService](create-service.html)

  学习如何创建一个IntentService。


* [发送任务请求给IntentService](send-request.html)

  学习如何发送工作任务给IntentService。


* [报告后台任务的执行状态](report-status.html)

  学习如何使用Intent与LocalBroadcastManager在Activit与IntentService之间进行交互。
