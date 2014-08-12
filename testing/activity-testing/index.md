# 测试你的Activity

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/activity-testing/index.html>

你应该把编写和运行测试作为你Android应用开发周期的一部分.编写好的测试可以帮助你在开发过程中尽早发现漏洞,并让你对自己的代码更有信心.

测试用例定义了一系列对象和方法从而独立进行多个测试.测试用例可以编写成测试组并按计划的运行,由测试框架组织成一个可以重复运行的测试者

这节内容将会教你如何使用Android基于最流行的JUnit框架来自定义测试框架.你可以编写测试用例来测试你应用程序的特定行为,并在不用的Android设备上检测一致性.你的测试用例也可以通过描述应用组件的预期行为来作为内部代码注释文档.

## Lessons

* [**建立测试环境**](prepare-activity-testing.html)

  Learn how to create your test project.


* [**创建与执行测试用例**](activity-basic-testing.html)

  Learn how to write test cases to verify the expected properties of your Activity, and run the test cases with the Instrumentation test runner provided by the Android framework.


* [**测试UI组件**](activity-ui-testing.html)

  Learn how to test the behavior of specific UI components in your Activity.


* [**创建单元测试**](activity-unit-testing.html)

  Learn how to how to perform unit testing to verify the behavior of an Activity in isolation.


* [**创建功能测试**](activity-function-testing.html)

  Learn how to perform functional testing to verify the interaction of multiple Activities.
