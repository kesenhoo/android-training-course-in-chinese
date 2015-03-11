# 启动其他的Activity

> 编写:[yuanfentiank789](https://github.com/yuanfentiank789) - 原文:<http://developer.android.com/training/basics/firstapp/starting-activity.html>

在完成上一课(建立简单的用户界面)后，你已经拥有了显示一个activity（一个界面）的app（应用），并且这个activity包含了一个文本字段和一个按钮。
在这节课中，你将会添加一些新的代码到`MyActivity`中，当用户点击发送(Send)按钮时启动一个新的activity。

## 响应Send(发送)按钮

1 在Android Studio, 打开res/layout目录下的activity_my.xml 文件.

2 给 Button 标签添加[android:onclick](http://developer.android.com/reference/android/view/View.html#attr_android:onClick)属性.

res/layout/activity_my.xml


```
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/button_send"
    android:onClick="sendMessage" />
```

`android:onclick`属性的值`"sendMessage"`就是当用户点击你屏幕按钮时触发方法的名字。

3 打开java/com.mycompany.myfirstapp目录下MyActivity.java 文件.

4 为MyActivity.java 添加sendMessage() 函数，如下：

java/com.mycompany.myfirstapp/MyActivity.java

```
/** Called when the user clicks the Send button */
public void sendMessage(View view) {
    // Do something in response to button
}

```

为了让系统能够将这个方法（你刚在MyActivity.java中添加的sendMessage方法）与在`android:onClick`属性中提供的方法名字匹配，它们的名字必须一致，特别是，这个方法必须满足以下条件：

* 是Public函数
* 没有返回值
* 有唯一的参数(View类型,代表被点击的视图）

接下来，你可以在这个方法中编写读取文本内容的代码，并将该内容传到另一个Activity。

## 构建一个Intent

[Intent](http://developer.android.com/reference/android/content/Intent.html)是在不同组件中提供运行时连接的对象(比如两个Activity)。`Intent`代表一个应用"想去做什么事"，你可以用它做各种各样的任务，不过大部分的时候他们被用来启动另一个Activity。

1 在MyActivity.java的`sendMessage()`方法中创建一个`Intent`并启动名为`DisplayMessageActivity`的Activity：

java/com.mycompany.myfirstapp/MyActivity.java

```
Intent intent = new Intent(this, DisplayMessageActivity.class);
```
**Note**：如果你正在使用的是类似Android Studio的IDE，这里对`DisplayMessageActivity`的引用会报错，因为这个类还不存在；暂时先忽略这个错误，你很快就要去创建这个类了。

在这个Intent构造函数中有两个参数：

* 第一个参数是[Context](http://developer.android.com/reference/android/content/Context.html)(之所以用`this`是因为当前[Activity](http://developer.android.com/reference/android/app/Activity.html)是`Context`的子类)

* 接受系统发送的`Intent`的应用组件的[class](http://developer.android.com/reference/java/lang/Class.html)对象（在这个案例中，指将要被启动的activity）。

2 在文件开始处导入Intent类:

java/com.mycompany.myfirstapp/MyActivity.java

```
import android.content.Intent;
```

 **Tip:**在Android Studio中，按Alt + Ente 可以导入缺失的类(在Mac中使用option + return)

3 在`sendMessage()`方法里用<a href="http://developer.android.com/reference/android/app/Activity.html#findViewById(int)">findViewById()</a>方法得到[EditText](http://developer.android.com/reference/android/widget/EditText.html)元素.

java/com.mycompany.myfirstapp/MyActivity.java

```
public void sendMessage(View view) {
  Intent intent = new Intent(this, DisplayMessageActivity.class);
  EditText editText = (EditText) findViewById(R.id.edit_message);
}
```

4 在文件开始处导入EditText类.

在Android Studio中，按Alt + Ente 可以导入缺失的类(在Mac中使用option + return)

5 把EditText的文本内容关联到一个本地变量并使用putExtra()方法把值传给intent.

java/com.mycompany.myfirstapp/MyActivity.java

```
public void sendMessage(View view) {
  Intent intent = new Intent(this, DisplayMessageActivity.class);
  EditText editText = (EditText) findViewById(R.id.edit_message);
  String message = editText.getText().toString();
  intent.putExtra(EXTRA_MESSAGE, message);
}
```
`Intent`可以携带各种数据类型的集合的key-value附加对，称作extras。 <a href="http://developer.android.com/reference/android/content/Intent.html#putExtra(java.lang.String, android.os.Bundle)">putExtra()</a>方法把键名作为第一个参数，把值作为第二个参数。

6 在MyActivity class,定义EXTRA_MESSAGE :

java/com.mycompany.myfirstapp/MyActivity.java

```
public class MyActivity extends ActionBarActivity {
    public final static String EXTRA_MESSAGE = "com.mycompany.myfirstapp.MESSAGE";
    ...
}
```
为让新启动的activity能查询，定义key为一个public型的常量，通常使用应用程序包名作为前缀来定义意图键是很好的做法。在应用程序与其他应用程序进行交互时仍可以确保意图键唯一。

7 在sendMessage()函数里，调用startActivity()完成新activity的启动，现在完整的代码应该是下面这个样子：

java/com.mycompany.myfirstapp/MyActivity.java

```
/** Called when the user clicks the Send button */
public void sendMessage(View view) {
    Intent intent = new Intent(this, DisplayMessageActivity.class);
    EditText editText = (EditText) findViewById(R.id.edit_message);
    String message = editText.getText().toString();
    intent.putExtra(EXTRA_MESSAGE, message);
    startActivity(intent);
}
```

运行这个方法，系统接收到你的请求后会实例化在`Intent`中指定的`Activity`，在你需要去创建一个`DisplayMessageActivity`类使程序能够执行起来。


## 创建第二个Activity


Activity所有子类都必须实现onCreate()方法。创建activity的实例时系统会调用该方式，此时必须用 setContentView()来定义Activity布局，以对Activity进行初始化。



### 创建新的Activity使用Android Studio

使用Android Studio创建的activity会实现一个默认的onCreate()方法.


1. 在Android Studio的java 目录, 选择包名 **com.mycompany.myfirstapp**,右键选择 **New > Activity > Blank Activity**.

2. 在**Choose options**窗口，配置activity：
<ul>
<li>Activity Name: DisplayMessageActivity

<li>Layout Name: activity_display_message

<li>Title: My Message

<li>Hierarchical Parent: com.mycompany.myfirstapp.MyActivity

Package name: com.mycompany.myfirstapp
</ul>
点击 **Finish**.


![adt-new-activity](studio-new-activity.png)

3 打开DisplayMessageActivity.java文件，此类已经实现了onCreate()方法，稍后需要更新此实现方法。另外还有一个onOptionsItemSelected()方法，用来处理action bar的点击行为，保留这两个方法。

4 由于这个应用程序并不需要，直接删除 onCreateOptionsMenu()方法，。

如果使用 Android Studio开发，现在已经可以点击Send按钮启动这个activity了，但显示的仍然是模板提供的默认内容"Hello world"，稍后修改显示自定义的文本内容。



### 使用命令行创建activity

如果使用命令行工具创建activity，按如下步骤操作：

1 在工程的src/目录下，紧挨着MyActivity.java创建一个新文件DisplayMessageActivity.java.

2 写入如下代码：


```
public class DisplayMessageActivity extends ActionBarActivity {

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


> **Note**:如果你使用的IDE不是 Android Studio，你的工程中可能不会包含由`setContentView()`请求的`activity_display_message` layout，但这没关系，因为等下会修改这个方法。

3 把新Activity的标题添加到strings.xml文件:

```
<resources>
    ...
    <string name="title_activity_display_message">My Message</string>
</resources>
```

4 在 AndroidManifest.xml的Application 标签内为 DisplayMessageActivity添加 <activity>标签，如下:

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

 **Note**:你的Android SDK应该已经包含了最新的Android Support Library，它包含在ADT插件中。但如果你用的是别的IDE你就需要在[ Adding Platforms and Packages ](http://developer.android.com/sdk/installing/adding-packages.html)中安装。当在Eclipse中使用模板时，Support Library会自动加入你的工程中(在Android Dependencies中你可以看到相应的JAR文件)。如果不使用Eclipse，你就需要手动将Support Library添加到你的工程中，参考[setting up the Support Library](http://developer.android.com/tools/support-library/setup.html)。



## 接收Intent

不管用户导航到哪，每一个`Activity`是被`Intent`调用，你都可以在启动的`Activity`中通过<a href="http://developer.android.com/reference/android/app/Activity.html#getIntent()">getIntent()</a>方法得到`Intent`以及`Intent`包含的数据。

1 在java/com.mycompany.myfirstapp目录打开DisplayMessageActivity.java文件.

2 在onCreate() method, 删除该行:

```
  setContentView(R.layout.activity_display_message);
  ```

3 得到intent 并赋值给本地变量.

```
Intent intent = getIntent();
```
4 为Intent导包.

在Android Studio中，按Alt + Ente 可以导入缺失的类(在Mac中使用option + return).

5 提取从 MyActivity 传递过来的文本使用 getStringExtra().

```
String message = intent.getStringExtra(MyActivity.EXTRA_MESSAGE);
```


## 显示文本

1 在onCreate() method, 创建一个 TextView 对象.

```
TextView textView = new TextView(this);
```
2 设置文本字体大小和内容.

```
textView.setTextSize(40);
textView.setText(message);
```
3 通过调用activity的setContentView()把TextView作为activity布局的根视图.

```
setContentView(textView);
```

4 为TextView 导包.

在Android Studio中，按Alt + Ente 可以导入缺失的类(在Mac中使用option + return).

DisplayMessageActivity的完整onCreate()方法应该如下：



```
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Get the message from the intent
    Intent intent = getIntent();
    String message = intent.getStringExtra(MyActivity.EXTRA_MESSAGE);

    // Create the text view
    TextView textView = new TextView(this);
    textView.setTextSize(40);
    textView.setText(message);

    // Set the text view as the activity layout
    setContentView(textView);
}```

现在你可以运行app，在文本中输入信息，点击Send(发送)按钮，ok，现在就可以在第二Activity上看到发送过来信息了。如图：

![firstapp](firstapp.png)

到此为止，你已经创建好你的第一个Android应用了！
