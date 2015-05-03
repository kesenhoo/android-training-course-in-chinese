# 打印HTML文档

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/printing/html-docs.html>

如果要在Android上打印比一副照片更丰富的内容，我们需要将文本和图片组合在一个待打印的文档中。Android框架提供了一种使用HTML语言来构建文档并进行打印的方法，它使用的代码数量是很小的。

[WebView](http://developer.android.com/reference/android/webkit/WebView.html)类在Android 4.4（API Level 19）中得到了更新，使得它可以打印HTML内容。该类允许我们加载一个本地HTML资源或者从网页下载一个页面，创建一个打印任务，并把它交给Android打印服务。

这节课将展示如何快速地构建一个包含有文本和图片的HTML文档，以及如何使用[WebView](http://developer.android.com/reference/android/webkit/WebView.html)打印该文档。

## 加载一个HTML文档

用[WebView](http://developer.android.com/reference/android/webkit/WebView.html)打印一个HTML文档，会涉及到加载一个HTML资源，或者用一个字符串构建HTML文档。这一节将描述如何构建一个HTML的字符串并将它加载到[WebView](http://developer.android.com/reference/android/webkit/WebView.html)中，以备打印。

该View对象一般被用来作为一个Activity布局的一部分。然而，如果应用当前并没有使用[WebView](http://developer.android.com/reference/android/webkit/WebView.html)，我们可以创建一个该类的实例，以进行打印。创建该自定义View的主要步骤是：
1. 在HTML资源加载完毕后，创建一个[WebViewClient](http://developer.android.com/reference/android/webkit/WebViewClient.html)用来启动一个打印任务。
2. 加载HTML资源至[WebView](http://developer.android.com/reference/android/webkit/WebView.html)对象中。

下面的代码展示了如何创建一个简单的[WebViewClient](http://developer.android.com/reference/android/webkit/WebViewClient.html)并且加载一个动态创建的HTML文档：

```java
private WebView mWebView;

private void doWebViewPrint() {
    // Create a WebView object specifically for printing
    WebView webView = new WebView(getActivity());
    webView.setWebViewClient(new WebViewClient() {

            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                Log.i(TAG, "page finished loading " + url);
                createWebPrintJob(view);
                mWebView = null;
            }
    });

    // Generate an HTML document on the fly:
    String htmlDocument = "<html><body><h1>Test Content</h1><p>Testing, " +
            "testing, testing...</p></body></html>";
    webView.loadDataWithBaseURL(null, htmlDocument, "text/HTML", "UTF-8", null);

    // Keep a reference to WebView object until you pass the PrintDocumentAdapter
    // to the PrintManager
    mWebView = webView;
}
```

> **Note：**
请确保在[WebViewClient](http://developer.android.com/reference/android/webkit/WebViewClient.html#onPageFinished(android.webkit.WebView, java.lang.String))中的<a href="http://developer.android.com/reference/android/webkit/WebViewClient.html#onPageFinished(android.webkit.WebView, java.lang.String)">onPageFinished()</a>方法内调用创建打印任务的方法。如果没有等到页面加载完毕就进行打印，打印的输出可能会不完整或空白，甚至可能会失败。

> **Note：**在上面的样例代码中，保留了一个[WebView](http://developer.android.com/reference/android/webkit/WebView.html)对象实例的引用，这样能够确保它不会在打印任务创建之前就被垃圾回收器所回收。在编写代码时请务必这样做，否则打印的进程可能会无法继续执行。

如果我们希望页面中包含图像，将这个图像文件放置在你的工程的“assets/”目录中，并指定一个基URL（Base URL），并将它作为<a href="http://developer.android.com/reference/android/webkit/WebView.html#loadDataWithBaseURL(java.lang.String, java.lang.String, java.lang.String, java.lang.String, java.lang.String)">loadDataWithBaseURL()</a>方法的第一个参数，就像下面所显示的一样：

```java
webView.loadDataWithBaseURL("file:///android_asset/images/", htmlBody,
        "text/HTML", "UTF-8", null);
```

我们也可以加载一个需要打印的网页，具体做法是将<a href="http://developer.android.com/reference/android/webkit/WebView.html#loadDataWithBaseURL(java.lang.String, java.lang.String, java.lang.String, java.lang.String, java.lang.String)">loadDataWithBaseURL()</a>方法替换为<a href="http://developer.android.com/reference/android/webkit/WebView.html#loadUrl(java.lang.String)">loadUrl()</a>，如下所示：

```java
// Print an existing web page (remember to request INTERNET permission!):
webView.loadUrl("http://developer.android.com/about/index.html");
```

当使用[WebView](http://developer.android.com/reference/android/webkit/WebView.html)创建打印文档时，你要注意下面的一些限制：
* 不能为文档添加页眉和页脚，包括页号。
* HTML文档的打印选项不包含选择打印的页数范围，例如：对于一个10页的HTMl文档，只打印2到4页是不可以的。
* 一个[WebView](http://developer.android.com/reference/android/webkit/WebView.html)的实例只能在同一时间处理一个打印任务。
* 若一个HTML文档包含CSS打印属性，比如一个landscape属性，这是不被支持的。
* 不能通过一个HTML文档中的JavaScript脚本来激活打印。

> **Note：**一旦在布局中包含的[WebView](http://developer.android.com/reference/android/webkit/WebView.html)对象将文档加载完毕后，就可以打印[WebView](http://developer.android.com/reference/android/webkit/WebView.html)对象的内容了。

如果希望创建一个更加自定义化的打印输出并希望可以完全控制打印页面上绘制的内容，可以学习下一节课程：[打印自定义文档](custom-docs.html)

## 创建一个打印任务

在创建了[WebView](http://developer.android.com/reference/android/webkit/WebView.html)并加载了我们的HTML内容之后，应用就已经几乎完成了属于它的任务。接下来，我们需要访问[PrintManager](http://developer.android.com/reference/android/print/PrintManager.html)，创建一个打印适配器，并在最后创建一个打印任务。下面的代码展示了如何执行这些步骤：

```java
private void createWebPrintJob(WebView webView) {

    // Get a PrintManager instance
    PrintManager printManager = (PrintManager) getActivity()
            .getSystemService(Context.PRINT_SERVICE);

    // Get a print adapter instance
    PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter();

    // Create a print job with name and adapter instance
    String jobName = getString(R.string.app_name) + " Document";
    PrintJob printJob = printManager.print(jobName, printAdapter,
            new PrintAttributes.Builder().build());

    // Save the job object for later status checking
    mPrintJobs.add(printJob);
}
```

这个例子保存了一个[PrintJob](http://developer.android.com/reference/android/print/PrintJob.html)对象的实例，以供我们的应用将来使用，当然这是不必须的。我们的应用可以使用这个对象来跟踪打印任务执行时的进度。如果希望监控应用中的打印任务是否完成，是否失败或者是否被用户取消，这个方法非常有用。另外，我们不需要创建一个应用内置的通知，因为打印框架会自动的创建一个该打印任务的系统通知。
