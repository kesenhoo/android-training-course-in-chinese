# 连接到网络Connecting to the Network

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/network-ops/connecting.html>

这一课会演示如何实现一个简单的连接到网络的程序。它提供了一些你应该follow的最好示例，用来创建最简单的网络连接程序。请注意，想要执行网络操作首先需要在程序的manifest文件中添加下面的permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Choose an HTTP Client(选择一个HTTP Client)
大多数连接网络的Android app会使用HTTP来发送与接受数据。Android提供了两种HTTP clients: [HttpURLConnection](http://developer.android.com/reference/java/net/HttpURLConnection.html) 与Apache [HttpClient](http://developer.android.com/reference/org/apache/http/client/HttpClient.html)。他们二者均支持HTTPS ，都以流方式进行上传与下载，都有可配置timeout, IPv6 与连接池（connection pooling）. **推荐从Gingerbread版本开始使用 HttpURLConnection** 。关于这部分的更多详情，请参考 [Android's HTTP Clients](http://android-developers.blogspot.com/2011/09/androids-http-clients.html)。

## Check the Network Connection(检测网络连接)
在你的app尝试进行网络连接之前，需要检测当前是否有可用的网络。请注意，设备可能会不在网络覆盖范围内，或者用户可能关闭Wi-Fi与移动网络连接。

```java
public void myClickHandler(View view) {
    ...
    ConnectivityManager connMgr = (ConnectivityManager)
        getSystemService(Context.CONNECTIVITY_SERVICE);
    NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
    if (networkInfo != null && networkInfo.isConnected()) {
        // fetch data
    } else {
        // display error
    }
    ...
}
```

## Perform Network Operations on a Separate Thread(在另外一个Thread执行网络操作)
网络操作会遇到不可预期的延迟。显然为了避免一个不好的用户体验，总是在UI Thread之外去执行网络操作。AsyncTask 类提供了一种简单的方式来处理这个问题。关于更多的详情，请参考:[Multithreading For Performance](http://android-developers.blogspot.com/2010/07/multithreading-for-performance.html).

在下面的代码示例中，myClickHandler() 方法会触发一个新的DownloadWebpageTask().execute(stringUrl). 它继承自AsyncTask，实现了下面两个方法:

* [doInBackground()](http://developer.android.com/reference/android/os/AsyncTask.html#doInBackground(Params...)) 执行 downloadUrl()方法。Web URL作为参数，方法downloadUrl() 获取并处理网页返回的数据，执行完毕后，传递结果到onPostExecute()。参数类型为String.
* [onPostExecute()](http://developer.android.com/reference/android/os/AsyncTask.html#onPostExecute(Result)) 获取到返回数据并显示到UI上。

```java
public class HttpExampleActivity extends Activity {
    private static final String DEBUG_TAG = "HttpExample";
    private EditText urlText;
    private TextView textView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        urlText = (EditText) findViewById(R.id.myUrl);
        textView = (TextView) findViewById(R.id.myText);
    }

    // When user clicks button, calls AsyncTask.
    // Before attempting to fetch the URL, makes sure that there is a network connection.
    public void myClickHandler(View view) {
        // Gets the URL from the UI's text field.
        String stringUrl = urlText.getText().toString();
        ConnectivityManager connMgr = (ConnectivityManager)
            getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
        if (networkInfo != null && networkInfo.isConnected()) {
            new DownloadWebpageText().execute(stringUrl);
        } else {
            textView.setText("No network connection available.");
        }
    }

     // Uses AsyncTask to create a task away from the main UI thread. This task takes a
     // URL string and uses it to create an HttpUrlConnection. Once the connection
     // has been established, the AsyncTask downloads the contents of the webpage as
     // an InputStream. Finally, the InputStream is converted into a string, which is
     // displayed in the UI by the AsyncTask's onPostExecute method.
     private class DownloadWebpageText extends AsyncTask {
        @Override
        protected String doInBackground(String... urls) {

            // params comes from the execute() call: params[0] is the url.
            try {
                return downloadUrl(urls[0]);
            } catch (IOException e) {
                return "Unable to retrieve web page. URL may be invalid.";
            }
        }
        // onPostExecute displays the results of the AsyncTask.
        @Override
        protected void onPostExecute(String result) {
            textView.setText(result);
       }
    }
    ...
}
```

关于上面那段代码的示例详解，请参考下面:

* When users click the button that invokes myClickHandler(), the app passes the specified URL to the AsyncTask subclass DownloadWebpageTask.
* The AsyncTask method doInBackground() calls the downloadUrl() method.
* The downloadUrl() method takes a URL string as a parameter and uses it to create a URL object.
* The URL object is used to establish an HttpURLConnection.
* Once the connection has been established, the HttpURLConnection object fetches the web page content as an InputStream.
* The InputStream is passed to the readIt() method, which converts the stream to a string.
* Finally, the AsyncTask's onPostExecute() method displays the string in the main activity's UI.

## Connect and Download Data(连接并下载数据)
在执行网络交互的线程里面，你可以使用 HttpURLConnection 来执行一个 GET 类型的操作并下载数据。在你调用 connect()之后，你可以通过调用getInputStream()来得到一个包含数据的[InputStream](http://developer.android.com/reference/java/io/InputStream.html) 对象。

在下面的代码示例中， doInBackground() 方法会调用downloadUrl(). 这个 downloadUrl() 方法使用给予的URL，通过 HttpURLConnection 连接到网络。一旦建立连接，app使用 getInputStream() 来获取数据。

```java
// Given a URL, establishes an HttpUrlConnection and retrieves
// the web page content as a InputStream, which it returns as
// a string.
private String downloadUrl(String myurl) throws IOException {
    InputStream is = null;
    // Only display the first 500 characters of the retrieved
    // web page content.
    int len = 500;

    try {
        URL url = new URL(myurl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setReadTimeout(10000 /* milliseconds */);
        conn.setConnectTimeout(15000 /* milliseconds */);
        conn.setRequestMethod("GET");
        conn.setDoInput(true);
        // Starts the query
        conn.connect();
        int response = conn.getResponseCode();
        Log.d(DEBUG_TAG, "The response is: " + response);
        is = conn.getInputStream();

        // Convert the InputStream into a string
        String contentAsString = readIt(is, len);
        return contentAsString;

    // Makes sure that the InputStream is closed after the app is
    // finished using it.
    } finally {
        if (is != null) {
            is.close();
        }
    }
}
```

请注意，getResponseCode() 会返回连接状态码( status code). 这是一种获知额外网络连接信息的有效方式。status code 是 200 则意味着连接成功.

## Convert the InputStream to a String(把InputStream的数据转换为String)
InputStream 是一种可读的byte数据源。如果你获得了一个 InputStream, 通常会进行decode或者转换为制定的数据类型。例如，如果你是在下载一张image数据，你可能需要像下面一下进行decode：

```java
InputStream is = null;
...
Bitmap bitmap = BitmapFactory.decodeStream(is);
ImageView imageView = (ImageView) findViewById(R.id.image_view);
imageView.setImageBitmap(bitmap);
```

在上面演示的示例中， InputStream 包含的是web页面的文本内容。下面会演示如何把 InputStream 转换为string，以便显示在UI上。

```java
// Reads an InputStream and converts it to a String.
public String readIt(InputStream stream, int len) throws IOException, UnsupportedEncodingException {
    Reader reader = null;
    reader = new InputStreamReader(stream, "UTF-8");
    char[] buffer = new char[len];
    reader.read(buffer);
    return new String(buffer);
}
```

***
