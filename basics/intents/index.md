# 与其他应用的交互

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/intents/index.html>

* 一个Android app通常都会有好几个activities。 每一个activity的界面都扮演者用户接口的角色，允许用户执行一些特殊任务（例如查看地图或者是开始拍照等）。为了让用户从一个activity跳到另外一个activity，你的app必须使用Intent来定义你的app的意图。当你使用startActivity()的方法，且参数是intent时，系统会使用这个 Intent 来定义并启动合适的app组件。使用intents深圳还可以让你的app启动另一个app里面的activity。
* 一个 Intent 可以显式的指明需要启动的模块（用一个指定的Activity实例），也可以隐式的指明自己可以处理哪种类型的动作（比如拍一张照等）。
* 这一章节会演示如何使用Intent 来做一些与其他app之间的简单交互。比如启动另外一个app，从其他app接受数据，以及使得你的app能够响应从其他发出的intent等。

## Lessons
* [**Intent的发送(Sending the User to Another App )**](sending.html)

  演示如何创建隐式的Intent来唤起能够接收这个动作的App。


* [**接收Activity返回的结果(Getting a Result from an Activity)**](result.html)

  演示如何启动另外一个Activity并接收返回值。


* [**Intent过滤(Allowing Other Apps to Start Your Activity)**](filters.html)

  演示如何通过定义隐式的Intent的过滤器来使得你的应用能够被其他应用唤起。
