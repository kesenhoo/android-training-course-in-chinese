# 使用系统权限

> 编写:[NothingOne](https://github.com/NothingOne) - 原文:<http://developer.android.com/training/permissions/index.html>

为了保护系统的完整性和用户的隐私，Android的每个应用程序都在一个有限制的沙盒(sandbox)中运行。如果应用程序要使用它的沙盒以外的资源或信息，则该应用程序需要明确的请求权限。取决于该应用请求的权限类型，系统会自动授予权限，或询问用户是否授予权限。

本课程将介绍如何为您的应用程序声明和请求权限。

### You should also read
[System Permissions](http://developer.android.com/guide/topics/security/permissions.html)

[Interacting with other apps](http://developer.android.com/training/basics/intents/index.html)

### DESIGN PATTERNS
[Permissions](https://www.google.com/design/spec/patterns/permissions.html)

## Lessons
* [**声明权限(Declaring Permissions)**](declaring.html)

  学习如何在应用程序的manifest中声明你需要的权限。


* [**在运行时请求权限(Requesting Permissions at Run Time)**](requesting.html)

  程序在运行时，如何向用户请求权限。此课只适用于运行在Android6.0（API级别23）或更高版本设备上的应用程序。


* [**权限的最佳实践(Permissions Best Practices)**](best-practices.html)

  此向导介绍如何以最佳用户体验来请求和使用权限。




