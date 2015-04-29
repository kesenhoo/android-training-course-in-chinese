# 打印自定义文档

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/printing/custom-docs.html>

对于有些应用，比如绘图应用，页面布局应用和其它一些关注于图像输出的应用，创造出精美的打印页面将是它的核心功能。在这种情况下，仅仅打印一幅图片或一个HTML文档就不够了。这类应用的打印输出需要精确地控制每一个会在页面中显示的对象，包括字体，文本流，分页符，页眉，页脚和一些图像元素等等。

想要创建一个完全自定义的打印文档，需要投入比之前讨论的方法更多的编程精力。我们必须构建可以和打印框架相互通信的组件，调整打印参数，绘制页面元素并管理多个页面的打印。

这节课将展示如何连接打印管理器，创建一个打印适配器以及如何构建出需要打印的内容。

## 连接打印管理器

当我们的应用直接管理打印进程时，在收到来自用户的打印请求后，第一步要做的是连接Android打印框架并获取一个[PrintManager](http://developer.android.com/reference/android/print/PrintManager.html)类的实例。该类允许我们初始化一个打印任务并开始打印任务的生命周期。下面的代码展示了如何获得打印管理器并开始打印进程。

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

上面的代码展示了如何命名一个打印任务以及如何设置一个[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)类的实例，它负责处理打印生命周期的每一步。打印适配器的实现会在下一节中进行讨论。

> **Note：**<a href="http://developer.android.com/reference/android/print/PrintManager.html#print(java.lang.String, android.print.PrintDocumentAdapter, android.print.PrintAttributes)">print()</a>方法的最后一个参数接收一个[PrintAttributes](http://developer.android.com/reference/android/print/PrintAttributes.html)对象。我们可以使用这个参数向打印框架进行一些打印设置，以及基于前一个打印周期的预设，从而改善用户体验。我们也可以使用这个参数对打印内容进行一些更符合实际情况的设置，比如当打印一幅照片时，设置打印的方向与照片方向一致。

## 创建打印适配器

打印适配器负责与Android打印框架交互并处理打印过程的每一步。这个过程需要用户在创建打印文档前选择打印机和打印选项。由于用户可以选择不同性能的打印机，不同的页面尺寸或不同的页面方向，因此这些选项可能会影响最终的打印效果。当这些选项配置好之后，打印框架会寻求适配器进行布局并生成一个打印文档，以此作为打印的前期准备。一旦用户点击了打印按钮，框架会将最终的打印文档传递给Print Provider进行打印输出。在打印过程中，用户可以选择取消打印，所以打印适配器必须监听并响应取消打印的请求。

[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)抽象类负责处理打印的生命周期，它有四个主要的回调方法。我们必须在打印适配器中实现这些方法，以此来正确地和Android打印框架进行交互：
* <a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onStart()">onStart()</a>：一旦打印进程开始，该方法就将被调用。如果我们的应用有任何一次性的准备任务要执行，比如获取一个要打印数据的快照，那么让它们在此处执行。在你的适配器中，这个回调方法不是必须实现的。
* <a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>：每当用户改变了影响打印输出的设置时（比如改变了页面的尺寸，或者页面的方向）该函数将会被调用，以此给我们的应用一个机会去重新计算打印页面的布局。另外，该方法必须返回打印文档包含多少页面。
* <a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback)">onWrite()</a>：该方法调用后，会将打印页面渲染成一个待打印的文件。该方法可以在<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>方法被调用后调用一次或多次。
* <a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onFinish()">onFinish()</a>：一旦打印进程结束后，该方法将会被调用。如果我们的应用有任何一次性销毁任务要执行，让这些任务在该方法内执行。这个回调方法不是必须实现的。

下面将介绍如何实现`onLayout()`以及`onWrite()`方法，他们是打印适配器的核心功能。

> **Note：**这些适配器的回调方法会在应用的主线程上被调用。如果这些方法的实现在执行时可能需要花费大量的时间，那么应该将他们放在另一个线程里执行。例如：我们可以将布局或者写入打印文档的操作封装在一个[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)对象中。

### 计算打印文档信息

在实现[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)类时，我们的应用必须能够指定出所创建文档的类型，计算出打印任务所需要打印的总页数，并提供打印页面的尺寸信息。在实现适配器的<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>方法时，我们执行这些计算，并提供与理想的输出相关的一些信息，这些信息可以在[PrintDocumentInfo](http://developer.android.com/reference/android/print/PrintDocumentInfo.html)类中获取，包括页数和内容类型。下面的例子展示了[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)中<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>方法的基本实现：

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

<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>方法的执行结果有三种：完成，取消或失败（计算布局无法顺利完成时会失败）。我们必须通过调用[PrintDocumentAdapter.LayoutResultCallback](http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html)对象中的适当方法来指出这些结果中的一个。

> **Note：**<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html#onLayoutFinished(android.print.PrintDocumentInfo, boolean)">onLayoutFinished()</a>方法的布尔类型参数明确了这个布局内容是否和上一次打印请求相比发生了改变。恰当地设定了这个参数将避免打印框架不必要地调用<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback)">onWrite()</a>方法，缓存之前的打印文档，提升执行性能。

<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>的主要任务是计算打印文档的页数，并将它作为打印参数交给打印机。如何计算页数则高度依赖于应用是如何对打印页面进行布局的。下面的代码展示了页数是如何根据打印方向确定的：

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

当需要将打印内容输出到一个文件时，Android打印框架会调用[PrintDocumentAdapter](http://developer.android.com/reference/android/print/PrintDocumentAdapter.html)类的<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback)">onWrite()</a>方法。这个方法的参数指定了哪些页面要被写入以及要使用的输出文件。该方法的实现必须将每一个请求页的内容渲染成一个含有多个页面的PDF文件。当这个过程结束以后，你需要调用callback对象的<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.WriteResultCallback.html#onWriteFinished(android.print.PageRange[])">onWriteFinished()</a>方法。

> **Note：** Android打印框架可能会在每次调用<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>后，调用<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback)">onWrite()</a>方法一次甚至更多次。请务必牢记：当打印内容的布局没有变化时，可以将<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html#onLayoutFinished(android.print.PrintDocumentInfo, boolean)">onLayoutFinished()</a>方法的布尔参数设置为“false”，以此避免对打印文档进行不必要的重写操作。

> **Note：**<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.LayoutResultCallback.html#onLayoutFinished(android.print.PrintDocumentInfo, boolean)">onLayoutFinished()</a>方法的布尔类型参数明确了这个布局内容是否和上一次打印请求相比发生了改变。恰当地设定了这个参数将避免打印框架不必要的调用<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onLayout(android.print.PrintAttributes, android.print.PrintAttributes, android.os.CancellationSignal, android.print.PrintDocumentAdapter.LayoutResultCallback, android.os.Bundle)">onLayout()</a>方法，缓存之前的打印文档，提升执行性能。

下面的代码展示了使用[PrintedPdfDocument](http://developer.android.com/reference/android/print/pdf/PrintedPdfDocument.html)类创建了PDF文件的基本原理：

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
代码中将PDF页面递交给了drawPage()方法，这个方法会在下一部分介绍。

就布局而言，<a href="http://developer.android.com/reference/android/print/PrintDocumentAdapter.html#onWrite(android.print.PageRange[], android.os.ParcelFileDescriptor, android.os.CancellationSignal, android.print.PrintDocumentAdapter.WriteResultCallback)">onWrite()</a>方法的执行可以有三种结果：完成，取消或者失败（内容无法被写入）。我们必须通过调用[PrintDocumentAdapter.WriteResultCallback](http://developer.android.com/reference/android/print/PrintDocumentAdapter.WriteResultCallback.html)对象中的适当方法来指明这些结果中的一个。

> **Note：**渲染打印文档是一个可能耗费大量资源的操作。为了避免阻塞应用的主UI线程，我们应该考虑将页面的渲染和写操作放在另一个线程中执行，比如在[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)中执行。关于更多异步任务线程的知识，可以阅读：[Processes and Threads](http://developer.android.com/guide/components/processes-and-threads.html)。

## 绘制PDF页面内容

当我们的应用进行打印时，应用必须生成一个PDF文档并将它传递给Android打印框架以进行打印。我们可以使用任何PDF生成库来协助完成这个操作。本节将展示如何使用[PrintedPdfDocument](http://developer.android.com/reference/android/print/pdf/PrintedPdfDocument.html)类将打印内容生成为PDF页面。

[PrintedPdfDocument](http://developer.android.com/reference/android/print/pdf/PrintedPdfDocument.html)类使用一个[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)对象来在PDF页面上绘制元素，这一点和在activity布局上进行绘制很类似。我们可以在打印页面上使用[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)类提供的相关绘图方法绘制页面元素。下面的代码展示了如何使用这些方法在PDF页面上绘制一些简单的元素：

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

当使用[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)在一个PDF页面上绘图时，元素通过单位“点（point）”来指定大小，一个点相当于七十二分之一英寸。在编写程序时，请确保使用该测量单位来指定页面上的元素大小。在定位绘制的元素时，坐标系的原点（即(0,0)点）在页面的最左上角。

> **Tip：**虽然[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)对象允许我们将打印元素放置在一个PDF文档的边缘，但许多打印机无法在纸张的边缘打印。所以当我们使用这个类构建一个打印文档时，需要考虑到那些无法打印的边缘区域。
