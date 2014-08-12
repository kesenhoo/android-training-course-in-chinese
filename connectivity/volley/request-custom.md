# 实现自定义的网络请求Implementing a Custom Request

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/request-custom.html>

这节课会介绍如何实现你自定义的请求类型，这些自定义的类型不属于Volley内置支持包里面。

## 编写一个自定义的请求Write a Custom Request

大多数的请求类型都已经包含在Volley的工具箱里面。如果你的请求返回数值是一个string，image或者JSON，那么你是不需要自己去实现请求类的。

对于那些你需要自定义的请求类型，下面是你需要做得步骤：

* 继承`Request<T>`类，`<T>`表示了请求返回的数据类型。因此如果你需要解析的响应类型是一个String，可以通过继承`Request<String>`来创建你自定义的请求。请参考Volley工具类中的StringRequest与 ImageRequest来学习如何继承Request<T>。
* 实现抽象方法`parseNetworkResponse()`与` deliverResponse()`，下面会详细介绍。

### parseNetworkResponse

为了能够提交一种指定类型的数据(例如，string，image，JSON等)，需要对解析后的结果进行封装。下面会演示如何实现`parseNetworkResponse()`。

```java
@Override
protected Response<T> parseNetworkResponse(
        NetworkResponse response) {
    try {
        String json = new String(response.data,
        HttpHeaderParser.parseCharset(response.headers));
    return Response.success(gson.fromJson(json, clazz),
    HttpHeaderParser.parseCacheHeaders(response));
    }
    // handle errors
...
}
```

请注意：

* `parseNetworkResponse()`的参数是类型是`NetworkResponse`，这种参数包含了的响应数据内容有一个byte[]，HTTP status code以及response headers.
* 你实现的方法必须返回一个Response<T>，它包含了你响应对象与缓存metadata或者是一个错误。

如果你的协议没有标准的cache机制，你可以自己建立一个`Cache.Entry`, 但是大多数请求都可以用下面的方式来处理:

```java
return Response.success(myDecodedObject,
        HttpHeaderParser.parseCacheHeaders(response));
```

Volley在工作线程中执行parseNetworkResponse()方法。这确保了耗时的解析操作，例如decode一张JPEG图片成bitmap，不会阻塞UI线程。

### deliverResponse

Volley会把parseNetworkResponse()方法返回的数据带到主线程的回调中。如下所示：

```java
protected void deliverResponse(T response) {
        listener.onResponse(response);
```

### Example: GsonRequest

[Gson](http://code.google.com/p/google-gson/)是一个使用映射支持JSON与Java对象之间相互转换的库文件。你可以定义和JSON keys想对应名称的Java对象。把对象传递给传递Gson，然后Gson会帮你为对象填充字段值。 下面是一个完整的示例：演示了使用Gson解析Volley数据：

```java
public class GsonRequest<T> extends Request<T> {
    private final Gson gson = new Gson();
    private final Class<T> clazz;
    private final Map<String, String> headers;
    private final Listener<T> listener;

    /**
     * Make a GET request and return a parsed object from JSON.
     *
     * @param url URL of the request to make
     * @param clazz Relevant class object, for Gson's reflection
     * @param headers Map of request headers
     */
    public GsonRequest(String url, Class<T> clazz, Map<String, String> headers,
            Listener<T> listener, ErrorListener errorListener) {
        super(Method.GET, url, errorListener);
        this.clazz = clazz;
        this.headers = headers;
        this.listener = listener;
    }

    @Override
    public Map<String, String> getHeaders() throws AuthFailureError {
        return headers != null ? headers : super.getHeaders();
    }

    @Override
    protected void deliverResponse(T response) {
        listener.onResponse(response);
    }

    @Override
    protected Response<T> parseNetworkResponse(NetworkResponse response) {
        try {
            String json = new String(
                    response.data,
                    HttpHeaderParser.parseCharset(response.headers));
            return Response.success(
                    gson.fromJson(json, clazz),
                    HttpHeaderParser.parseCacheHeaders(response));
        } catch (UnsupportedEncodingException e) {
            return Response.error(new ParseError(e));
        } catch (JsonSyntaxException e) {
            return Response.error(new ParseError(e));
        }
    }
}
```

如果你愿意使用的话，Volley提供了现成的`JsonArrayRequest`与` JsonArrayObject`类。参考上一课[创建标准的网络请求](request.html)
