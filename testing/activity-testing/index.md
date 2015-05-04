# 测试你的Activity

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/index.html>

我们应该把编写和运行测试作为Android应用开发周期的一部分。完备的测试可以帮助我们在开发过程中尽早发现漏洞，并让我们对自己的代码更有信心。

测试用例定义了一系列对象和方法从而独立进行多个测试。测试用例可以编写成测试组并按计划的运行，由测试框架组织成一个可以重复运行的测试Runner（运行器，译者注）。

这节内容将会讲解如何基于最流行的JUnit框架来自定义测试框架。我们可以编写测试用例来测试我们应用程序的特定行为，并在不同的Android设备上检测一致性。测试用例还可以用来描述应用组件的预期行为，并作为内部代码文档。

## 课程

* [**建立测试环境**](prepare-activity-testing.html)

学习如何创建测试项目

* [**创建与执行测试用例**](activity-basic-testing.html)

学习如何写测试用例来检验Activity中的特性，并使用Android框架提供的Instrumentation运行用例。

* [**测试UI组件**](activity-ui-testing.html)

学习如何编写UI测试用例

* [**创建单元测试**](activity-unit-testing.html)

学习如何隔离开Activity执行单元测试

* [**创建功能测试**](activity-function-testing.html)

学习如何执行功能测试来检验各Activity之间的交互
