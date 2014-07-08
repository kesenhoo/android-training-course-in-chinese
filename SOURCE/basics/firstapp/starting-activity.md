> 编写:[yuanfentiank789](https://github.com/yuanfentiank789 "mygithub")

> 校对:

# 启动另外的Activity
在完成上一课(构建简单用户界面)后，你已经拥有了显示一个activity（唯一屏幕）的app（应用），并且这个activity包含了一个文本字段和一个按钮。
在这节课中，你将会添加一些新的代码到MainActivity中，当用户点击发送(Send )按钮时启动一个新的activity。

## 响应Send(发送)按钮 ##

响应按钮的on-click(点击)事件，打开fragment_main.xml布局文件然后在[Button](http://developer.android.com/reference/android/widget/Button.html)(按钮)元素中添加android:onclick属性:

```java
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/button_send"
    android:onClick="sendMessage" />
```
android:onclick属性的值：sendMessage就是当用户点击你屏幕按钮时触发方法的名字。

添加相应的方法在MainActivity 类中：

```java
/** Called when the user clicks the Send button */
public void sendMessage(View view) {
    // Do something in response to button
}
```

请注意，为了让系统能够将这个方法（你刚在MyFirstActivity中添加的sendMessage方法）与在android:onClick属性中提供的方法名字匹配，它们的名字必须一致，特别是，这个方法必须满足以下条件：
公共的
没有返回值
有一个唯一的视图（View）参数（这个视图就是将被点击的视图）
接下来，你可以在这个方法中编写读取文本内容的代码，并将该内容传到另一个Activity
## 构建一个Intent ##
[Intent](http://developer.android.com/reference/android/content/Intent.html)(意图)是在不同组件中提供运行时连接的对象(比如两个Activity)。Intent(意图)代表一个应用"想去做什么事"，你可以用它做各种各样的任务，不过大部分的时候他们被用来启动另一个Activity。在sendMessage()方法中创建一个Intent(意图)并启动名为DisplayMessageActivity的Activity：

```java
Intent intent = new Intent(this, DisplayMessageActivity.class);
```

**小提示：**在Eclipse中，按Ctrl + Shift + O 可以导入缺失的类(在Mac中使用Cmd + Shift + O )

在这个Intent构造函数中有两个参数： 第一个参数是Context(上下文)(之所有可以用this是因为当前Activity(MyFirstActivity)是Context的子类) 系统需要传递Intent的应用组件的class对象（在这个案例中，这个activity应该被启动）

**注意**：如果你正在使用的是类似Eclipse的IDE，这里对DisplayMessageActivity的引用会报错，因为这个类还不存在；注意这个错误，你很快就要去创建这个类了。

一个Intent(意图)不仅允许你启动另一个Activity，同时也可以传递一个数据包到另一个Activity，在sendMessage()方法里用[findViewById()](http://developer.android.com/reference/android/app/Activity.html#findViewById(int))方法得到EditText元素，然后将它的文本信息添加到Intent(意图):

```java
ntent intent = new Intent(this, DisplayMessageActivity.class);
EditText editText = (EditText) findViewById(R.id.edit_message);
String message = editText.getText().toString();
intent.putExtra(EXTRA_MESSAGE, message);
```

Intent 可以携带各种数据类型的集合来作为key-value附加对。 putExtra() 方法把键名作为第一个参数，把值作为第二个参数。 为了接下来的活动能够查询额外数据，应该用公共常量为意图额外定义键。所以把EXTRA_MESSAGE定义添加到MainActivity类：

```java
public class MainActivity extends ActionBarActivity {
    public final static String EXTRA_MESSAGE = "com.example.myfirstapp.MESSAGE";
    ...
}
```

通常使用应用程序包名作为前缀来定义意图键是很好的做法。如果应用程序与其他应用程序进行交互就可以确保意图键唯一。

## 启动第二个Activity ##
启动一个Activity，你只需要调用startActivity()方法然后传入你的Intent(意图)系统接收到你的请求后会实例化在Intent中指定的Activity,包含这个方法拥有的，被Send(发送)按钮调用的完整sendMessage()方法现在就像这样：

```java
/** Called when the user clicks the Send button */
public void sendMessage(View view) {
    Intent intent = new Intent(this, DisplayMessageActivity.class);
    EditText editText = (EditText) findViewById(R.id.edit_message);
    String message = editText.getText().toString();
    intent.putExtra(EXTRA_MESSAGE, message);
    startActivity(intent);
}
```

现在你需要去创建一个DisplayMessageActivity支持程序能够执行起来

## 创建第二个Activity ##
使用Eclipse创建新的Activity：

1.在工具栏点击**新建**。

2.在弹出窗口打开安卓文件夹，选择安卓活动然后点击**下一步**。

3.选择**BlankActivity**然后点击**下一步**

4.填写Activity详细信息：

**Project**：MyFirstApp

**Activity Name**：DisplayMessageActivity

**Layout Name**：activity_display_message

**Fragment Layout Name**：fragment_display_message

**Title**：My Message

**Hierarchial Parent**：com.example.myfirstapp.MainActivity

**Navigation Type**：无

单击**Finish**。

如果使用的是不同的IDE或者命令行工具，需要在项目的 src/目录创建一个名为DisplayMessageActivity.java，与MainActivity.java同目录的文件。

打开DisplayMessageActivity.java 文件，如果该文件用Eclipse创建，那么:

此类已经包含了所需[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)) 的默认实现，稍后需要更新此实现方法。

另外还有一个[onCreateOptionsMenu(](http://developer.android.com/reference/android/app/Activity.html#onCreateOptionsMenu(android.view.Menu)))实现方式，由于应用程序并不需要所以可以直接删除。

还有 [onOptionsItemSelected(](http://developer.android.com/reference/android/app/Activity.html#onOptionsItemSelected(android.view.MenuItem)))实现方式，它可以处理操作栏上拉操作。

还有一个 PlaceholderFragment ，在本activity中不需要此类。

Fragments把应用程序的功能和用户界面分解成可以复用的模块。想了解更Fragments信息，请参阅 [Fragments API Guide](http://developer.android.com/guide/components/fragments.html)，此处暂不使用Fragment。

DisplayMessageActivity 类现在应该是这样的：

```java
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
如果使用IDE而不是Eclipse,参照用上述代码来更新你的 DisplayMessageActivity。

Activity所有子类都必须实现 onCreate()方法。创建活动新实例时系统会调用该方式，此时必须用 setContentView()来定义Activity布局，以对Activity进行初始化。

## 添加标题字符串 ##

如果你使用Eclipse开发，则可以跳过本部分，因为模板提供了新活动的标题字符串。如果你使用的IDE不是Eclipse，需要把新Activity的标题添加到strings.xml文件：

```java
<resources>
    ...
    <string name="title_activity_display_message">My Message</string>
</resources>
```
## 将Activity加入manifest(清单)文件 ##

所有Activity必须使用 <activity>元素在AndroidManifest.xml清单文件声明，如果使用Eclipse创建Activity，则会自动在AndroidManifest.xml配置好对应<activity>元素，其它IDE需要手动配置，最终结果应该看起来这样：

```java
<application ... >
    ...
    <activity
        android:name="com.example.myfirstapp.DisplayMessageActivity"
        android:label="@string/title_activity_display_message"
        android:parentActivityName="com.example.myfirstapp.MainActivity" >
        <meta-data
            android:name="android.support.PARENT_ACTIVITY"
            android:value="com.example.myfirstapp.MainActivity" />
    </activity>
</application>
```

android:parentActivityName属性在应用程序中该Activity的逻辑父类Activity的名称。 系统使用此值来实现默认导航操作，比如在安卓4.1（API级别16）或者更高版本。 使用支持库并且如下所示的<meta-data>元素可以为安卓旧版本提供相同功能。

如果正在使用Eclipse开发,现在可以运行应用程序了。 点击发送按钮启动第二个Activity，但它采用的是模板提供的"Hello world"布局，稍后你可以自己更新该布局。因此使用其它IDE也不用担心，因为应用程序尚未编译。

## 获取Intent ##

每一个被Intent调用的Activity，不管用户将它导航到哪，你都可以在启动的Activity中通过getIntent()方法得到Intent以及Intent包含的数据。在DisplayMessageActivity类的onCreate()方法中，得到intent以及MyFirstActivity提供的附加信息：

```java
Intent intent = getIntent();
String message = intent.getStringExtra(MainActivity.EXTRA_MESSAGE);
```
## 显示信息 ##

在屏幕上显示信息，创建一个TextView部件，并且使用setText()设置它的值，然后通过setContentView()方法将TextView作为root(根)视图添加到Activity的布局。

DisplayMessageActivity完整的onCreate()方法现在看起来如下：


```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Get the message from the intent
    Intent intent = getIntent();
    String message = intent.getStringExtra(MainActivity.EXTRA_MESSAGE);

    // Create the text view
    TextView textView = new TextView(this);
    textView.setTextSize(40);
    textView.setText(message);

    // Set the text view as the activity layout
    setContentView(textView);
}
```

现在你可以运行app，在文本中输入信息，点击Send(发送)按钮，ok，现在就可以在第二Activity上看到发送过来信息了。如图：

![firstapp](firstapp.png)

到此为止，你已经创建好你的第一个Android应用了！


