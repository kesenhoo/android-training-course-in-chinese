# 使用Sync Adapter传输数据

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/sync-adapters/index.html>

如果我们的应用允许 Android 设备和网络服务器之间进行数据同步，那么它无疑将变得更加实用，更加吸引用户的注意。例如，将数据传输到服务器可以实现数据的备份，另一方面，从服务器获取数据可以让用户随时随地都能使用我们的应用。有时候，用户可能会觉得在线编辑他们的数据并将其发送到设备上，会是一件很方便的事情；或者他们有时会希望将收集到的数据上传到一个统一的存储区域中。

尽管我们可以设计一套自己的系统来实现应用中的数据传输，但我们也可以考虑一下使用 Android 的同步适配器框架（Android's Sync Adapter Framework）。该框架可以用来帮助管理数据，自动传输数据，以及协调不同应用间的同步问题。当使用这个框架时，我们可以利用它的一些特性，而这些特性可能是我们自己设计的传输方案中所没有的：

**插件架构（Plug-in Architecture）：**

允许我们以可调用组件的形式，将传输代码添加到系统中。

**自动执行（Automated Execution）：**

允许我们基于不同的准则自动地执行数据传输，比如：当数据变更时，或者每隔固定一段时间，亦或者每天，来自动执行一次数据传输。另外，系统会自动把当前无法执行的传输添加到一个队列中，并且在合适的时候运行它们。

**自动网络监测（Automated Network Checking）：**

系统只在有网络连接的时候才会运行数据传输。

**提升电池使用效率：**

允许我们将所有的数据传输任务统一地进行一次性批量传输，这样的话多个数据传输任务会在同一段时间内运行。我们应用的数据传输任务也会和其它应用的传输任务相结合，并一起传输。这样做可以减少系统连接网络的次数，进而减少电量的使用。

**账户管理和授权：**

如果我们的应用需要用户登录授权，那么我们可以将账户管理和授权的功能集成到数据传输组件中。

本系列课程将展示如何创建一个 Sync Adapter，如何创建一个绑定了 Sync Adapter 的服务（[Service](http://developer.android.com/reference/android/app/Service.html)），如何提供其它组件来帮助我们将 Sync Adapter 集成到框架中，以及如何通过不同的方法来运行 Sync Adapter。

> **Note：**Sync Adapter 是异步执行的，它可以定期且有效地传输数据，但在实时性上一般难以满足要求。如果我们想要实时地传输数据，那么应该在 [AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 或 [IntentService](http://developer.android.com/reference/android/app/IntentService.html) 中完成这一任务。

## Sample Code

[BasicSyncAdapter.zip](http://developer.android.com/shareables/training/BasicSyncAdapter.zip)

## Lessons

[创建 Stub 授权器](create-authenticator.html)

  学习如何在我们的应用中添加一个 Sync Adapter 框架需要的账户处理组件。这节课将展示如何简单地创建一个 Stub Authenticator 组件。

[创建 Stub Content Provider](create-stub-provider.html)

  学习如何在我们的应用中添加一个 Sync Adapter 框架需要的 Content Provider 组件。在这节课中，假设我们的应用实际上不需要使用 Content Provider，所以它将教我们如何添加一个 Stub 组件。如果我们的应用已经有了一个 Content Provider 组件，那么可以跳过这节课。

[创建 Sync Adapter](create-sync-adapter.html)

  学习如何将我们的数据传输代码封装到组件当中，并让其可以被 Sync Adapter 框架自动执行。

[执行 Sync Adapter](running-sync-adapter.html)

  学习如何使用 Sync Adapter 框架激活并调度数据传输。
