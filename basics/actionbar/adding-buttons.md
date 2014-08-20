# 添加Action按钮

> 编写:[Vincent 4J](http://github.com/vincent4j) - 原文:<http://developer.android.com/training/basics/actionbar/adding-buttons.html>

Action bar 允许你为当前上下文中最重要的操作添加按钮。那些直接出现在 action bar 中的 icon 和/或 文本被称作**action buttons(操作按钮)**。安排不下的或不足够重要的操作被隐藏在 **action overflow** 中。

![actionbar-actions](actionbar-actions.png)
图 1. 一个有search操作按钮和 action overflow 的 action bar，在 action overflow 里能展现额外的操作。

## 在 XML 中指定操作

所有的操作按钮和 action overflow 中其他可用的条目都被定义在 [菜单资源](https://developer.android.com/guide/topics/resources/menu-resource.html) 的 XML 文件中。通过在项目的 `res/menu` 目录中新增一个 XML 文件来为 action bar 添加操作。

为你想添加到 action bar 中的每个条目添加一个 `<item>` 元素。例如：

res/menu/main_activity_actions.xml
```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android" >
    <!-- Search, should appear as action button -->
    <item android:id="@+id/action_search"
          android:icon="@drawable/ic_action_search"
          android:title="@string/action_search"
          android:showAsAction="ifRoom" />
    <!-- Settings, should always be in the overflow -->
    <item android:id="@+id/action_settings"
          android:title="@string/action_settings"
          android:showAsAction="never" />
</menu>
```

上述声明是这样的，当 action bar 有可用空间时，检索操作将作为一个操作按钮来显示，但设置操作将一直只在 action overflow 中显示。（默认情况下，所有的操作都显示在 action overflow 中，但为每一个操作指明设计意图是很好的做法。）

icon 属性要求每张图片提供一个 `resource ID`。在 `@drawable/` 之后的名字必须是存储在项目目录 `res/drawable/` 下图片的名字。例如：`ic_action_search.png` 对应 "@drawable/ic_action_search"。同样地，title 属性使用通过 XML 文件定义在项目目录 `res/values/` 中的一个 `string resource`，详情请参见 [创建一个简单的 UI](../firstapp/building-ui.html) 。

> **Note**：当在创建 icon 和其他 bitmap 图片时，你得为优化不同屏幕密度下的显示效果提供多个版本，这一点很重要。在 [支持不同屏幕](../supporting-devices/screens.html) 课程中将会更详细地讨论。

如果你为了兼容 Android 2.1 的版本使用了 Support 库，在 `android` 命名空间下 `showAsAction` 属性是不可用的。Support 库会提供替代它的属性，你必须声明自己的 XML 命名空间，并且使用该命名空间作为属性前缀。（一个自定义 XML 命名空间需要以你的 app 名称为基础，但是可以取任何你想要的名称，它的作用域仅仅在你声明的文件之内。）例如：

res/menu/main_activity_actions.xml
```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:yourapp="http://schemas.android.com/apk/res-auto" >
    <!-- Search, should appear as action button -->
    <item android:id="@+id/action_search"
          android:icon="@drawable/ic_action_search"
          android:title="@string/action_search"
          yourapp:showAsAction="ifRoom"  />
    ...
</menu>
```

## 为 Action Bar 添加操作

为 action bar 布局菜单条目，是通过在 activity 中实现 <a href="https://developer.android.com/reference/android/app/Activity.html#onCreateOptionsMenu(android.view.Menu)">onCreateOptionsMenu()</a> 回调方法来 `inflate` 菜单资源从而获取 [Menu](https://developer.android.com/reference/android/view/Menu.html) 对象。例如：

```java
@Override
public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu items for use in the action bar
    MenuInflater inflater = getMenuInflater();
    inflater.inflate(R.menu.main_activity_actions, menu);
    return super.onCreateOptionsMenu(menu);
}
```

## 为操作按钮添加响应事件

当用户按下某一个操作按钮或者 action overflow 中的其他条目，系统将调用 activity 中<a href="https://developer.android.com/reference/android/app/Activity.html#onOptionsItemSelected(android.view.MenuItem)">onOptionsItemSelected()</a>回调方法。在该方法的实现里面调用[MenuItem](https://developer.android.com/reference/android/view/MenuItem.html)的<a href="https://developer.android.com/reference/android/view/MenuItem.html#getItemId()">getItemId()</a>来判断哪个条目被按下  - 返回的 ID 会匹配你声明对应的 `<item>` 元素中 `<android:id>` 属性的值。

```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    // Handle presses on the action bar items
    switch (item.getItemId()) {
        case R.id.action_search:
            openSearch();
            return true;
        case R.id.action_settings:
            openSettings();
            return true;
        default:
            return super.onOptionsItemSelected(item);
    }
}
```

## 为下级 Activity 添加向上按钮

在不是主要入口的其他所有屏中（activity 不位于主屏时），需要在 action bar 中为用户提供一个导航到逻辑父屏的**up button(向上按钮)**。

![actionbar-up.png](actionbar-up.png)
图 2. Gmail 中的 up button。

当运行在 Android 4.1(API level 16) 或更高版本，或者使用 Support 库中的 [ActionBarActivity](https://developer.android.com/reference/android/support/v7/app/ActionBarActivity.html) 时，实现向上导航需要你在 manifest 文件中声明父 activity ，同时在 action bar 中设置向上按钮可用。

如何在 mainfest 中声明一个 activity 的父辈，例如：

```xml
<application ... >
    ...
    <!-- The main/home activity (it has no parent activity) -->
    <activity
        android:name="com.example.myfirstapp.MainActivity" ...>
        ...
    </activity>
    <!-- A child of the main activity -->
    <activity
        android:name="com.example.myfirstapp.DisplayMessageActivity"
        android:label="@string/title_activity_display_message"
        android:parentActivityName="com.example.myfirstapp.MainActivity" >
        <!-- Parent activity meta-data to support 4.0 and lower -->
        <meta-data
            android:name="android.support.PARENT_ACTIVITY"
            android:value="com.example.myfirstapp.MainActivity" />
    </activity>
</application>
```

然后，通过调用<a href="https://developer.android.com/reference/android/app/ActionBar.html#setDisplayHomeAsUpEnabled(boolean)">setDisplayHomeAsUpEnabled()</a> 来把 app icon 设置成可用的向上按钮：

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_displaymessage);

    getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    // If your minSdkVersion is 11 or higher, instead use:
    // getActionBar().setDisplayHomeAsUpEnabled(true);
}
```

由于系统已经知道 `MainActivity` 是 `DisplayMessageActivity` 的父 activity，当用户按下向上按钮时，系统会导航到恰当的父 activity - 你不需要去处理向上按钮的事件。

更多关于向上导航的信息，请见 [提供向上导航](../../ux/implement-nav/ancestral.html)。

