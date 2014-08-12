# 使用Sync Adapter传输数据

> 编写:[jdneo](https://github.com/jdneo) - 原文:

在一台Android设备和网络服务器之间同步数据，可以让你的应用更加实用，更加吸引用户的注意。例如，将数据传输到服务器可以实现一个有用的备份，另一方面，将数据从服务器中获取可以让用户随时随地都能使用你的应用。在一些情况中，用户可能会发觉在线编辑他们的数据并将其发送到设备上，会是一件很方便的事情；或者他们有时会希望将收集的数据上传到一个统一的存储区域中。

尽管你可以设计你自己的系统来实现你应用中的数据传输，但你可以考虑一下使用Android的Sync Adapter框架（Android's sync adapter framework）。这个框架可以帮助管理并自动传输数据，并且协调不同应用间的同步问题。当你使用这个框架时，你可以利用它的一些特性，而这些特性可能是你自己设计的传输方案中所没有的：

**插件架构（Plug-in architecture）：**

允许你以可调用组件的形式，将传输代码添加到系统中。

**自动执行（Automated execution）：**

允许你可以给予不同的准则自动地执行数据传输，包括数据变更，经过的时间，传输时间等。另外，系统会把当前无法执行的传输添加到一个队列中，并且在合适的时候运行它们。

**自动网络监测（Automated network checking）：**

系统只在有网络连接的时候才会运行数据传输。

**提升电池使用效率：**

允许你将所有的数据传输任务统一地进行一次性批量传输，这样的话数据传输任务会在同一时间运行。你的应用的数据传输也会和其它应用的传输任务相结合，并一起传输。这样做可以减少系统连接网络的次数，进而减少电量的使用。

**账户管理和授权：**

如果你的应用需要用户登录，那么你可以将账户管理和授权的功能集成到你的数据传输中。

本系列课程将向你展示如何创建一个Sync Adapter，以及它所封装和绑定的服务（[Service](http://developer.android.com/reference/android/app/Service.html)），如何提供其它组件来帮助你将Sync Adapter添加到框架中，以及如何通过不同的方法来运行Sync Adapter。

> ** Note：**Sync Adapter是异步执行的，所以你应该在期望它可以定期地有效地但不是瞬间地传输数据时使用它。如果你想要实时地传输数据，那么你应该在中[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)或[IntentService](http://developer.android.com/reference/android/app/IntentService.html)完成这一任务。

## Sample Code

[BasicSyncAdapter.zip](http://developer.android.com/shareables/training/BasicSyncAdapter.zip)

## Lessons

* [创建Stub授权器](creating-authenticator.html)

  学习如何添加一个账户处理组件。Sync Adapter框架要求应用中需要具备这样的一个组件。这节课将向你展示如何简单的创建一个Stub授权器组件。

* [创建Stub Content Provider](creating-stub-provider.html)

  学习如何添加一个Content Provider组件Sync Adapter框架要求应用中需要具备这样的一个组件。这节课中我们假设你的应用实际上不需要使用Content Provider，所以它将教你如何添加一个Stub Provider。如果你在应用中已经有了一个Content Provider组件，那么可以跳过这节课。

* [创建Sync Adapter](creating-sync-adapter.html)

  学习如何将你的数据传输代码封装到组件当中，以此使得Sync Adapter框架可以自动执行。

* [执行Sync Adapter](running-sync-adapter.html)

  学习如何使用Sync Adapter框架激活并调度数据传输。
