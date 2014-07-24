> 编写:[kesenhoo](https://github.com/kesenhoo) - 校对:

> 原文:<http://developer.android.com/training/basics/intents/index.html>

# 与其他应用的交互

* 一个Android app通常都会有好几个activities. 每一个activity的界面都可能允许用户执行一些特殊任务（例如查看地图或者是开始拍照等）。为了让用户从一个activity跳到另外一个activity，你的app必须使用Intent来定义你的app想做的事情。当你使用startActivity()的方法，而且参数是intent时，系统会使用这个 Intent 来定义并启动合适的app组件。使用intents还可以让你的app来启动另外一个app里面的activity。
* 一个 Intent 可以显式的指明需要启动的模块，也可以隐式的指明自己可以处理哪种类型的动作。
* 这一章节会演示如何使用Intent 来做一些与其他app之间的简单交互。类似，启动另外一个app,从其他app接受数据，并且使得你的app能够响应从其他发出的intent。

## Lessons
* [**Sending the User to Another App:Intent的发送**](sending.html)

  演示如何创建隐式的Intent来唤起能够接收这个动作的App。


* [**Getting a Result from an Activity:接收Activity返回的结果**](result.html)

  演示如何启动另外一个Activity并接收返回值。


* [**Allowing Other Apps to Start Your Activity:Intent过滤**](filters.html)

  演示如何通过定义隐式的Intent的过滤器来使得能够被其他应用唤起。
