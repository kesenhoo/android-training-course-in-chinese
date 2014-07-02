> 编写:[jdneo](https://github.com/jdneo)

> 校对:

# 打印自定义文档

对一些应用，比如绘图应用，页面布局应用和其它一些聚焦于图像输出的应用，创建美丽的打印页面是它的核心功能。在这种情况下，仅仅打印一副图片或一个HTML文档就不够了。这种类型应用的打印输出需要精确地控制每个进入页面的东西，包括字体，文本流，分页符，页眉，页脚和一些图像元素。

创建完全由你自定义的打印输出需要投入比之前讨论的方法更多的编程精力。你必须构建可以和打印架构相互通信的组件，调整打印选项，绘制页面元素并管理多个页面的打印。

这节课将向你展示如何连接打印管理器，创建一个打印适配器并构建要打印的内容。

##连接打印管理器

当你的应用直接管理打印进程，在收到来自用户的打印请求后，第一步要做的是连接Android打印框架并获取一个[PrintManager](http://developer.android.com/reference/android/print/PrintManager.html)类的实例。这个类允许你初始化一个打印任务并开始打印生命周期。下面的代码展示了如何获得打印管理器并开始打印进程。

```java
private void doPrint() {
    // Get a PrintManager instance
    PrintManager printManager = (PrintManager) getActivity()
            .getSystemService(Context.PRINT_SERVICE);

    // Set job name, which will be displayed in the print queue
    String jobName = getActivity().getString(R.string.app_name) + " Document";

    // Start a print job, passing in a PrintDocumentAdapter implementation
    // to handle the generation of a print document
    printManager.print(jobName, new MyPrintDocumentAdapter(getActivity()),
            null); //
}
```

上面的代码展示了如何命名一个打印任务并且设置一个[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)类的实例，它处理打印生命周期的每一步。打印适配器的实现会在下一节中进行讨论。

> **Note：**[print()](http://developer.android.com/reference/android/print/PrintManager.html#print\(java.lang.String, android.print.PrintDocumentAdapter, android.print.PrintAttributes\))方法的最后一个参数接收一个[PrintAttributes](http://developer.android.com/reference/android/print/PrintAttributes.html)对象。你可以使用这个参数来提供对于打印框架的提示，以及基于前一个打印周期的预设，从而改善用户体验。你也可以使用这个参数对被打印对象进行设置一些更符合实际情况的设定，比如当打印一副照片时，设置打印的方向与照片方向一致。

##创建一个打印适配器

