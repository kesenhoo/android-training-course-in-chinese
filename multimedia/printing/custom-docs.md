# 打印自定义文档

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/printing/custom-docs.html>

对一些应用，比如绘图应用，页面布局应用和其它一些聚焦于图像输出的应用，创建美丽的打印页面是它的核心功能。在这种情况下，仅仅打印一副图片或一个HTML文档就不够了。这种类型应用的打印输出需要精确地控制每个进入页面的东西，包括字体，文本流，分页符，页眉，页脚和一些图像元素。

创建完全由你自定义的打印输出需要投入比之前讨论的方法更多的编程精力。你必须构建可以和打印架构相互通信的组件，调整打印选项，绘制页面元素并管理多个页面的打印。

这节课将向你展示如何连接打印管理器，创建一个打印适配器并构建要打印的内容。

## 连接打印管理器

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

> **Note：**[print()](http://developer.android.com/reference/android/print/PrintManager.html#print\(java.lang.String, android.print.PrintDocumentAdapter, android.print.PrintAttributes\))方法的最后一个参数接收一个[PrintAttributes](http://developer.android.com/reference/android/print/PrintAttributes.html)对象。你可以使用这个参数向打印框架进行一些打印设置，以及基于前一个打印周期的预设，从而改善用户体验。你也可以使用这个参数对被打印对象进行设置一些更符合实际情况的设定，比如当打印一副照片时，设置打印的方向与照片方向一致。

## 创建一个打印适配器

打印适配器和Android打印框架交互并处理打印过程的每一步。这个过程需要用户在创建打印文档前选择打印器和打印选项。这些选项可以影响最终的输出，因为用户选择的打印机可能会有不同的打印的能力，不同的页面尺寸或不同的页面方向。当这些选项配置好之后，这个打印框架会询问你的适配器进行布局和生成一个打印文档，作为最终打印的前期准备。一旦用户点击了打印按钮，框架会接收最终的打印文档，并将它传递给一个打印提供程序（Print Provider）来打印输出。在打印过程中，用户可以选择取消打印，所以你的打印适配器必须监听并响应一个取消请求。

[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)抽象类被设计用来处理打印的生命周期，它有四个主要的回调函数。你必须在你的打印适配器中实现这些方法，以此来恰当地和打印框架交互：
* [onStart()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onStart\(\))：一旦打印的进程开始了就被调用。如果你的应用有任何一次性的准备任务要执行，比如获取一个要打印数据的快照，那么将它们在此处执行。在你的适配器中，这个回调函数不是必须实现的。
* [onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))：每次一个用户改变了一个打印设置并影响了打印的输出时调用，比如改变了页面的尺寸，或者页面的方向，给你的应用一个机会去重新计算要打印页面的布局。这个方法必须返回打印文档包含多少页面。
* [onWrite()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite\(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback\))：调用它以此将打印页面交付给一个要打印的文件。这个方法可以在被[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))调用后调用一次或多次。
* [onFinish()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onFinish\(\))：一旦打印进程结束后被调用。如果你的应用有任何一次性销毁任务要执行，在这里执行。这个回调函数不是必须实现的。

下面的部分将介绍如何实现布局和写方法，这两个方法是一个打印适配器的核心功能。

> **Note：**这些适配器的回调函数会在你的主线程上被调用。如果你的这些方法的实现需要花费大量的时间，那么应该在一个另外的线程里执行。例如：你可以将布局或者写入打印文档的操作封装在一个[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)对象中。

### 计算打印文档信息

在一个[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)类的实现中，你的应用必须指定所创建文档的类型并计算所有打印任务所需要的页数，提供被打印页面的尺寸信息。在适配器中[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))方法的实现中会执行这些计算，并提供打印任务输出的信息，这些信息在一个[PrintDocumentInfo](http://developer.android.com/reference/android/print/PrintDocumentInfo.html)类中，包括页数和内容类型。下面的例子展示了[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)中[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))方法的基本实现：

```java
@Override
public void onLayout(PrintAttributes oldAttributes,
                     PrintAttributes newAttributes,
                     CancellationSignal cancellationSignal,
                     LayoutResultCallback callback,
                     Bundle metadata) {
    // Create a new PdfDocument with the requested page attributes
    mPdfDocument = new PrintedPdfDocument(getActivity(), newAttributes);

    // Respond to cancellation request
    if (cancellationSignal.isCancelled() ) {
        callback.onLayoutCancelled();
        return;
    }

    // Compute the expected number of printed pages
    int pages = computePageCount(newAttributes);

    if (pages > 0) {
        // Return print information to print framework
        PrintDocumentInfo info = new PrintDocumentInfo
                .Builder("print_output.pdf")
                .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT)
                .setPageCount(pages);
                .build();
        // Content layout reflow is complete
        callback.onLayoutFinished(info, true);
    } else {
        // Otherwise report an error to the print framework
        callback.onLayoutFailed("Page count calculation failed.");
    }
}
```

[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))方法的执行结果有三种：完成，取消或失败（计算布局无法顺利完成时会失败）。你必须通过调用[PrintDocumentAdapter.LayoutResultCallback](http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html)对象中的适当方法来指明这些结果中的一个。

> **Note：**[onLayoutFinished()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html#onLayoutFinished\(android.print.PrintDocumentInfo, boolean\))方法的布尔参数明确了这个布局内容是否和上一次请求相比改变了。恰当地设定了这个参数将避免打印框架不必要的调用[onWrite()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite\(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback\))方法，缓存之前的打印文档，并提升性能。

[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))的主要工作是计算打印文档的页数，作为交给打印机的参数。如何计算页数则高度依赖于你的应用时如何布局打印页面的。下面的代码展示了页数是如何根据打印方向确定的：

```java
private int computePageCount(PrintAttributes printAttributes) {
    int itemsPerPage = 4; // default item count for portrait mode

    MediaSize pageSize = printAttributes.getMediaSize();
    if (!pageSize.isPortrait()) {
        // Six items per page in landscape orientation
        itemsPerPage = 6;
    }

    // Determine number of print items
    int printItemCount = getPrintItemCount();

    return (int) Math.ceil(printItemCount / itemsPerPage);
}
```

### 将打印文档写入文件

当需要将打印输出写入一个文件时，Android打印框架会调用你应用的[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)类的[onWrite()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite\(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback\))方法。这个方法的参数指定了哪一页要被打印以及要使用的输出文件。该方法的实现必须将每一个请求页的内容交付给一个多页PDF文档文件。当这个过程结束以后，你需要调用对象的[onWriteFinished()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.WriteResultCallback.html#onWriteFinished\(android.print.PageRange[]\))回调方法。

> **Note：**Android打印框架可能会在每次调用[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))后，调用[onWrite()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite\(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback\))方法一次甚至更多次。在这节课当中，有一件非常重要的事情是当打印内容的布局没有变化时，需要将[onLayoutFinished()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html#onLayoutFinished\(android.print.PrintDocumentInfo, boolean\))方法的布尔参数设置为“false”，以此避免不必要的重写打印文档的操作。

> **Note：**[onLayoutFinished()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html#onLayoutFinished\(android.print.PrintDocumentInfo, boolean\))方法的布尔参数明确了这个布局内容是否和上一次请求相比改变了。恰当地设定了这个参数将避免打印框架不必要的调用[onLayout()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout\(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle\))方法，缓存之前的打印文档，并提升性能。

下面的代码展示了使用[PrintedPdfDocument](http://developer.android.com/reference/android/print/pdf/PrintedPdfDocument.html)类的打印过程基本原理，并创建了一个PDF文件：

```java
@Override
public void onWrite(final PageRange[] pageRanges,
                    final ParcelFileDescriptor destination,
                    final CancellationSignal cancellationSignal,
                    final WriteResultCallback callback) {
    // Iterate over each page of the document,
    // check if it's in the output range.
    for (int i = 0; i < totalPages; i++) {
        // Check to see if this page is in the output range.
        if (containsPage(pageRanges, i)) {
            // If so, add it to writtenPagesArray. writtenPagesArray.size()
            // is used to compute the next output page index.
            writtenPagesArray.append(writtenPagesArray.size(), i);
            PdfDocument.Page page = mPdfDocument.startPage(i);

            // check for cancellation
            if (cancellationSignal.isCancelled()) {
                callback.onWriteCancelled();
                mPdfDocument.close();
                mPdfDocument = null;
                return;
            }

            // Draw page content for printing
            drawPage(page);

            // Rendering is complete, so page can be finalized.
            mPdfDocument.finishPage(page);
        }
    }

    // Write PDF document to file
    try {
        mPdfDocument.writeTo(new FileOutputStream(
                destination.getFileDescriptor()));
    } catch (IOException e) {
        callback.onWriteFailed(e.toString());
        return;
    } finally {
        mPdfDocument.close();
        mPdfDocument = null;
    }
    PageRange[] writtenPages = computeWrittenPages();
    // Signal the print framework the document is complete
    callback.onWriteFinished(writtenPages);

    ...
}
```
这个代码中将PDF页面递交给了drawPage()方法，这个方法会在下一部分介绍。

就布局而言，[onWrite()](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite\(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback\))方法的执行可以有三种结果：完成，取消或者失败（内容无法被写入）。你必须通过调用[PrintDocumentAdapter.WriteResultCallback](http://developer.android.com/reference/android/print/PrintDocumentAdapter.WriteResultCallback.html)对象中的适当方法来指明这些结果中的一个。

> **Note：**递交一个打印的文档可以是一个和大量资源相关的操作。为了避免阻塞应用的主UI线程，你应该考虑将页面的递交和写操作在另一个线程中执行，比如在[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)中执行。关于更多异步任务线程的知识，可以阅读：[Processes and Threads](http://developer.android.com/guide/components/processes-and-threads.html)。

## 绘制PDF页面内容

当你的应用打印时，你的应用必须生成一个PDF文档并将它传递给Android打印框架来打印。你可以使用任何PDF生成库来协助完成这个操作。本节将展示如何使用[PrintedPdfDocument](http://developer.android.com/reference/android/print/pdf/PrintedPdfDocument.html)类从你的内容生成PDF页面。

[PrintedPdfDocument](http://developer.android.com/reference/android/print/pdf/PrintedPdfDocument.html)类使用一个[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)对象来在PDF页面上绘制元素，和在activity布局上进行绘制很类似。你可以在打印页面上使用[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)的绘图方法绘制元素。下面的代码展示了如何使用相关的函数在PDF文档页面上绘制简单元素：

```java
private void drawPage(PdfDocument.Page page) {
    Canvas canvas = page.getCanvas();

    // units are in points (1/72 of an inch)
    int titleBaseLine = 72;
    int leftMargin = 54;

    Paint paint = new Paint();
    paint.setColor(Color.BLACK);
    paint.setTextSize(36);
    canvas.drawText("Test Title", leftMargin, titleBaseLine, paint);

    paint.setTextSize(11);
    canvas.drawText("Test paragraph", leftMargin, titleBaseLine + 25, paint);

    paint.setColor(Color.BLUE);
    canvas.drawRect(100, 100, 172, 172, paint);
}
```

当使用[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)在一个PDF页面上绘图时，元素通过单位“点（point）”来指定大小，它是七十二分之一英寸大小。确保你使用这个测量单位来指定页面上的元素大小。在定位绘制的元素时，坐标系的原点（即（0,0））在页面的最左上角。

> **Tip：**虽然[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)对象允许你将打印元素放置在一个PDF文档的边缘，但许多打印机并不能在纸张边缘打印。所以当你使用这个类构建一个打印文档时，确保你考虑了那些无法打印的边缘区域。
