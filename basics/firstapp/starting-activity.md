# 启动另一个Activity

> 编写:[yuanfentiank789](https://github.com/yuanfentiank789) - 原文:<http://developer.android.com/training/basics/firstapp/starting-activity.html>

在完成上一课(建立简单的用户界面)后，我们已经拥有了显示一个 activity（一个界面）的app（应用），该 activity 包含了一个文本字段和一个按钮。在这节课中，你将添加一些新的代码到`MyActivity`中，当用户点击发送(Send)按钮时启动一个新的activity。

> 注意：本课程内容期待的运行环境为 Android Studio 2.3及以上

## 响应Send(发送)按钮

按以下步骤在`MainActivity.java`文件中新增一个方法，该方法会在我们点击 Send 按钮时触发：

1.打开文件 `app/java/com.example.myfirstapp/MainActivity.java`，在其中添加一个 `sendMessage()` 方法存根（Method Stub）：

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    /** 当用户点击 Send 按钮时调用该方法 */
    public void sendMessage(View view) {
        // 此处的代码会在点击 Send 按钮时执行
    }
}
```

这里可能会出现名为 "Cannot resolve symbol" 的报错，在方法参数 View 下面会出现一条红色的波浪线，这是因为 Android Studio 不能解析 `View` 类。将光标移动到 View 上，然后按下 Alt + Enter （Mac中为 Option + Return）组合键快速修复。（如果出现菜单，则选择 Import class）

2.现在回到 `activity_main.xml` 文件，完成对 sendMessage() 方法的调用：
    
    1.在布局编辑器中选中 Buton 对象
    
    2.在 **Property** 面板中找到 *onClick* 属性，在下拉列表中选中 **sendMessage [MainActivity]** 

完成这些操作后，当点击 Send 按钮时，系统会调用 sendMessage() 方法。

为保证系统能将 sendMessage() 方法与 [android:onclick] 成功匹配，这个方法需要满足以下要求：

* 方法的访问修饰符为 public
* 无返回值
* 只有一个 [View] 类型的参数（代表被点击的 View 对象）

接下来，你可以在这个方法中编写读取文本内容，并将该内容传到另一个Activity的代码。

## 构建一个Intent

[Intent] 是一个可以为不同组件在运行时提供链接的对象，例如为两个 Activity 提供链接。 [Intent] 代表一个 app “想要做某事的意向”，你可以使用它来完成各种各样的任务，不过在本节课程中，我们只使用 intent 来启动另一个 Activity。

在 `MainActivity.java` 文件中，添加一个 EXTRA_MESSAGE 常量并完善 sendMesage() 方法中的代码，如下所示：

```java
public class MainActivity extends AppCompatActivity {
    public static final String EXTRA_MESSAGE = "com.example.myfirstapp.MESSAGE";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    /** 当用户点击 Send 按钮时调用该方法 */
    public void sendMessage(View view) {
        Intent intent = new Intent(this, DisplayMessageActivity.class);
        EditText editText = (EditText) findViewById(R.id.editText);
        String message = editText.getText().toString();
        intent.putExtra(EXTRA_MESSAGE, message);
        startActivity(intent);
    }
}
```

Android Studio 可能会再次出现 "Cannot resolve symbol" 的错误，同样使用 Alt + Enter （Mac中为 Option + Return）组合键快速导入类，完成后这个类的导入项如下所示：

```java
import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
```

不过对 `DisplayMessageActivity` 的引用仍然会报错，因为这个类还不存在；暂时先忽略这个错误，我们很快就会解决这个问题。

以下是 sendMessage() 方法中要注意的几个地方：

1. Intent 构造方法中有两个参数：

  * 第一个参数是 [Context] (之所以用`this`是因为 [Activity] 类是`Context`的子类)

  * 接受系统发送 [Intent] 的应用组件对应的 [Class]（在这个案例中，指将要被启动的activity）

2. [putExtra()] 方法将从 EditText 中取到的值附加到 Intent 上。 Intent 可以以键-值对的方式携带数据，这些数据称为 *extras*。此处的键是一个 public 修饰的常量——EXTRA_MESSAGE，因为在另一个 Activity 中，我们需要以这个键来获取它对应的值。以应用包名为前缀来定义 intent extras 的键是一个很好的习惯，这使得 app 在与其他 app 交互的过程中能保证这个键的唯一性。

3. [startActivity()] 方法启动了 [Intent] 定义的 `DisplayMessageActivity` 的实例。现在我们需要新建一个 `DisplayMessageActivity` 类。

## 创建第二个Activity


Activity所有子类都必须实现onCreate()方法。创建activity的实例时系统会调用该方式，此时必须用 setContentView()来定义Activity布局，以对Activity进行初始化。



### 使用Android Studio创建新的Activity

使用Android Studio创建的activity会实现一个默认的onCreate()方法.


1. 在Android Studio的java 目录, 选择包名 **com.mycompany.myfirstapp**,右键选择 **New > Activity > Blank Activity**.

2. 在**Choose options**窗口，配置activity：
<ul>
<li><strong>Activity Name</strong>: DisplayMessageActivity

<li><strong>Layout Name</strong>: activity_display_message

<li><strong>Title</strong>: My Message

<li><strong>Hierarchical Parent</strong>: com.mycompany.myfirstapp.MyActivity

Package name: com.mycompany.myfirstapp
</ul>
点击 **Finish**.


![adt-new-activity](studio-new-activity.png)

3 打开DisplayMessageActivity.java文件，此类已经实现了onCreate()方法，稍后需要更新此方法。


如果使用 Android Studio开发，现在已经可以点击Send按钮启动这个activity了，但显示的仍然是模板提供的默认内容"Hello world"，稍后修改显示自定义的文本内容。



### 使用命令行创建activity

如果使用命令行工具创建activity，按如下步骤操作：

1 在工程的src/目录下，紧挨着MyActivity.java创建一个新文件DisplayMessageActivity.java.

2 写入如下代码：


```
public class DisplayMessageActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_display_message);

        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                .add(R.id.container, new PlaceholderFragment()).commit();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    /**
     * A placeholder fragment containing a simple view.
     */
    public static class PlaceholderFragment extends Fragment {

        public PlaceholderFragment() { }

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                  Bundle savedInstanceState) {
              View rootView = inflater.inflate(R.layout.fragment_display_message,
                      container, false);
              return rootView;
        }
    }
}
```


> **Note**:如果使用的IDE不是 Android Studio，工程中可能不会包含由`setContentView()`请求的`activity_display_message` layout，但这没关系，因为等下会修改这个方法。

3 把新Activity的标题添加到strings.xml文件:

```
<resources>
    ...
    <string name="title_activity_display_message">My Message</string>
</resources>
```

4 在 AndroidManifest.xml的Application 标签内为 DisplayMessageActivity添加 <activity\>标签，如下:

```
<application ... >
    ...
    <activity
        android:name="com.mycompany.myfirstapp.DisplayMessageActivity"
        android:label="@string/title_activity_display_message"
        android:parentActivityName="com.mycompany.myfirstapp.MyActivity" >
        <meta-data
            android:name="android.support.PARENT_ACTIVITY"
            android:value="com.mycompany.myfirstapp.MyActivity" />
    </activity>
</application>
```

`android:parentActivityName`属性声明了在应用程序中该Activity逻辑层面的父类Activity的名称。 系统使用此值来实现默认导航操作，比如在Android 4.1（API level 16）或者更高版本中的[Up navigation](http://developer.android.com/design/patterns/navigation.html)。 使用[Support Library](http://developer.android.com/tools/support-library/index.html)，如上所示的[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)元素可以为安卓旧版本提供相同功能。

 >**Note**:我们的Android SDK应该已经包含了最新的Android Support Library，它包含在ADT插件中。但如果用的是别的IDE，则需要在[ Adding Platforms and Packages ](http://developer.android.com/sdk/installing/adding-packages.html)中安装。当Android Studio中使用模板时，Support Library会自动加入我们的工程中(在Android Dependencies中你以看到相应的JAR文件)。如果不使用Android Studio，就需要手动将Support Library添加到我们的工程中，参考[setting up the Support Library](http://developer.android.com/tools/support-library/setup.html)。



## 接收Intent

不管用户导航到哪，每个[Activity](http://developer.android.com/reference/android/app/Activity.html)都是通过[Intent](http://developer.android.com/reference/android/content/Intent.html)被调用的。我们可以通过调用<a href="http://developer.android.com/reference/android/app/Activity.html#getIntent()">getIntent()</a>来获取启动activity的[Intent](http://developer.android.com/reference/android/content/Intent.html)及其包含的数据。

1 编辑java/com.mycompany.myfirstapp目录下的DisplayMessageActivity.java文件.

2 得到intent 并赋值给本地变量.

```
Intent intent = getIntent();
```
3 为Intent导入包.

在Android Studio中，按Alt + Enter 可以导入缺失的类(在Mac中使用option + return).

4 调用 getStringExtra()提取从 MyActivity 传递过来的消息.

```
String message = intent.getStringExtra(MyActivity.EXTRA_MESSAGE);
```


## 显示文本

1 在res/layout目录下，编辑文件`content_display_message.xml`.

2 为<RelativeLayout>标签添加id属性，你之后需要用这个id属性来调用这个对象.

```
< RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
...
android:id="@+id/content">
</RelativeLayout>
```

3 重新来编辑`DisplayMessageActivity.java`

4 在`onCreate()`方法中创建一个对象`TextView`

```
TextView textView = new TextView(this);
```

5 用`setText()`来设置文本字体大小和内容.

```
textView.setTextSize(40);
textView.setText(message);
```
6 将`TextView`加入之前被标记为`R.id.content`的`RelativeLayout`中

```
RelativeLayout layout = (RelativeLayout) findViewById(R.id.content);
layout.addView(textView);
```

7 为TextView 导入包.

在Android Studio中，按Alt + Enter 可以导入缺失的类(在Mac中使用option + return).

DisplayMessageActivity的完整onCreate()方法应该如下：



```
@Override
protected void onCreate(Bundle savedInstanceState) {
   super.onCreate(savedInstanceState);
   setContentView(R.layout.activity_display_message);
   Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
   setSupportActionBar(toolbar);

   FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
   fab.setOnClickListener(new View.OnClickListener() {
       @Override
       public void onClick(View view) {
           Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                   .setAction("Action", null)
                   .show();
       }
   });
   getSupportActionBar().setDisplayHomeAsUpEnabled(true);

   Intent intent = getIntent();
   String message = intent.getStringExtra(MyActivity.EXTRA_MESSAGE);
   TextView textView = new TextView(this);
   textView.setTextSize(40);
   textView.setText(message);

   RelativeLayout layout = (RelativeLayout) findViewById(R.id.content);
   layout.addView(textView);
}```

现在你可以运行app，在文本中输入信息，点击Send(发送)按钮，ok，现在就可以在第二Activity上看到发送过来信息了。如图：

![firstapp](firstapp.png)

到此为止，已经创建好我们的第一个Android应用了！


[android:onClick]: //developer.android.com/reference/android/view/View.html#attr_android:onClick
[View]: //developer.android.com/reference/android/view/View.html
[Intent]: //developer.android.com/reference/android/content/Intent.html
[Context]: //developer.android.com/reference/android/content/Context.html
[Activity]:  //developer.android.com/reference/android/app/Activity.html
[Class]:  //developer.android.com/reference/java/lang/Class.html
[putExtra()]:  //developer.android.com/reference/android/content/Intent.html#putExtra(java.lang.String, java.lang.String)
[startActivity()]:  //developer.android.com/reference/android/app/Activity.html#startActivity(android.content.Intent)
