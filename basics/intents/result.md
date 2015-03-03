# 接收Activity返回的结果

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/intents/result.html>

启动另外一个activity并不一定是单向的。你也可以启动另外一个activity然后接受一个result回来。为了接受这个result，你需要使用<a href="http://developer.android.com/reference/android/app/Activity.html#startActivityForResult(android.content.Intent, int)">startActivityForResult()</a> ，而不是<a href="http://developer.android.com/reference/android/app/Activity.html#startActivity(android.content.Intent)">startActivity()</a>。

例如，你的app可以启动一个camera程序并接受拍的照片作为result。或者你可以启动People程序并获取其中联系的人的详情作为result。

当然，被启动的activity需要指定返回的result。它需要把这个result作为另外一个intent对象返回，你的activity需要在<a href="http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent)">onActivityResult()</a>的回调方法里面去接收result。

> **Note:**在执行`startActivityForResult()`时，你可以使用explicit 或者 implicit 的intent。当你启动另外一个位于你的程序中的activity时，你应该使用explicit intent来确保你可以接收到期待的结果。

<!-- more -->

## 启动Activity

对于startActivityForResult() 方法中的intent与之前介绍的并没有什么差异，只不过是需要在这个方法里面多添加一个int类型的参数。

这个integer的参数叫做"request code"，它标识了你的请求。当你接收到result Intent时，可以从回调方法里面的参数去判断这个result是否是你想要的。

例如，下面是一个启动activity来选择联系人的例子：

```java
static final int PICK_CONTACT_REQUEST = 1;  // The request code
...
private void pickContact() {
    Intent pickContactIntent = new Intent(Intent.ACTION_PICK, new Uri("content://contacts"));
    pickContactIntent.setType(Phone.CONTENT_TYPE); // Show user only contacts w/ phone numbers
    startActivityForResult(pickContactIntent, PICK_CONTACT_REQUEST);
}
```

## 接收Result

当用户完成了启动之后activity操作之后，系统会调用你的activity的onActivityResult() 回调方法。这个方法有三个参数：

* 你通过startActivityForResult()传递的request code。
* 第二个activity指定的result code。如果操作成功则是`RESULT_OK` ，如果用户没有操作成功，而是直接点击回退或者其他什么原因，那么则是`RESULT_CANCELED`
* 第三个参数则是intent,它包含了返回的result数据部分。

例如，下面是如何处理pick a contact的result的例子：对应上面的例子

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    // Check which request we're responding to
    if (requestCode == PICK_CONTACT_REQUEST) {
        // Make sure the request was successful
        if (resultCode == RESULT_OK) {
            // The user picked a contact.
            // The Intent's data Uri identifies which contact was selected.

            // Do something with the contact here (bigger example below)
        }
    }
}
```

在这个例子中被返回的Intent中使用Uri的形式来表示返回的联系人。

为了正确的handle这些result，你必须了解那些result intent的格式。对于你自己程序里面的返回result是比较简单的。Apps都会有一些自己的api来指定特定的数据。例如，People app (Contacts app on some older versions) 总是返回一个URI来指定选择的contack，Camera app 则是在`data`数据区返回一个 Bitmap （see the class about [Capturing Photos](http://developer.android.com/training/camera/index.html)).

### 读取联系人数据

上面的代码展示了如何获取联系人的返回结果，但没有说清楚如何从结果中读取数据，因为这需要更多关于[content providers](http://developer.android.com/guide/topics/providers/content-providers.html)的知识。但如果你想知道的话，下面是一段代码，展示如何从被选的联系人中读出电话号码。

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    // Check which request it is that we're responding to
    if (requestCode == PICK_CONTACT_REQUEST) {
        // Make sure the request was successful
        if (resultCode == RESULT_OK) {
            // Get the URI that points to the selected contact
            Uri contactUri = data.getData();
            // We only need the NUMBER column, because there will be only one row in the result
            String[] projection = {Phone.NUMBER};

            // Perform the query on the contact to get the NUMBER column
            // We don't need a selection or sort order (there's only one result for the given URI)
            // CAUTION: The query() method should be called from a separate thread to avoid blocking
            // your app's UI thread. (For simplicity of the sample, this code doesn't do that.)
            // Consider using CursorLoader to perform the query.
            Cursor cursor = getContentResolver()
                    .query(contactUri, projection, null, null, null);
            cursor.moveToFirst();

            // Retrieve the phone number from the NUMBER column
            int column = cursor.getColumnIndex(Phone.NUMBER);
            String number = cursor.getString(column);

            // Do something with the phone number...
        }
    }
}
```

> **Note**:在Android 2.3 (API level 9)之前对`Contacts Provider`的请求(比如上面的代码)，需要你声明`READ_CONTACTS`权限(更多详见[Security and Permissions](http://developer.android.com/guide/topics/security/security.html))。但如果是Android 2.3以上的系统，你就不需要这么做。但这种临时权限也仅限于特定的请求，所以你仍无法获取除返回的Intent以外的联系人信息，除非声明了`READ_CONTACTS`权限。
