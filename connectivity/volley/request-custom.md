# 实现自定义的网络请求

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/volley/request-custom.html>

这节课会介绍如何实现自定义的请求类型，这些自定义的类型不属于 Volley 内置支持包里面。

## 编写一个自定义请求

大多数的请求类型都已经包含在 Volley 的工具箱里面。如果我们的请求返回数值是一个 string，image 或者 JSON，那么是不需要自己去实现请求类的。

对于那些需要自定义的请求类型，我们需要执行以下操作：

* 继承 `Request<T>` 类，`<T>` 表示解析过的响应请求预期的数据类型。因此如果我们需要解析的响应类型是一个 String，可以通过继承 `Request<String>` 来创建自定义的请求。请参考 Volley 工具类中的 `StringRequest` 与 `ImageRequest` 来学习如何继承 `Request<T>`。
* 实现抽象方法 `parseNetworkResponse()` 与 ` deliverResponse()`，下面会详细介绍。

### parseNetworkResponse

一个 `Response` 封装了用于发送的给定类型（例如，string、image、JSON等）解析过的响应。下面会演示如何实现 `parseNetworkResponse()`：

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

* `parseNetworkResponse()` 的参数是类型是 `NetworkResponse`，这种参数以 byte[]、HTTP status code 以及 response headers 的形式包含响应负载。
* 我们实现的方法必须返回一个 `Response<T>`，它包含了我们指定类型的响应对象与缓存 metadata 或者是一个错误。

如果我们的协议没有标准的缓存机制，那么我们可以自己建立一个 `Cache.Entry`, 但是大多数请求都可以用下面的方式来处理:

```java
return Response.success(myDecodedObject,
        HttpHeaderParser.parseCacheHeaders(response));
```

Volley 在工作线程中执行 `parseNetworkResponse()` 方法。这确保了耗时的解析操作，例如 decode 一张 JPEG 图片成 bitmap，不会阻塞 UI 线程。

### deliverResponse

Volley 会把 `parseNetworkResponse()` 方法返回的数据带到主线程的回调中。如下所示：

```java
protected void deliverResponse(T response) {
        listener.onResponse(response);
```

### Example: GsonRequest

[Gson](http://code.google.com/p/google-gson/) 是一个使用映射支持 JSON 与 Java 对象之间相互转换的库文件。我们可以定义与 JSON keys 相对应名称的 Java 对象。把对象传递给 Gson，然后 Gson 会帮我们为对象填充字段值。下面是一个完整的示例：演示了使用 Gson 解析 Volley 数据：

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

如果你愿意使用的话，Volley 提供了现成的 `JsonArrayRequest` 与 ` JsonArrayObject`类。参考上一课[创建标准的网络请求](request.html)。
