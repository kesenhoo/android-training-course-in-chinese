# 提供向上的导航

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/implementing-navigation/ancestral.html>

所有不是从主屏幕("home"屏幕)进入app的，都应该给用户提供一种方法，通过点击[action bar](http://developer.android.com/guide/topics/ui/actionbar.html)中的Up按钮。可以回到app的结构层次中逻辑父屏幕。本课程向你说明如何正确地实现这一操作。

>**Up Navigation 设计**

>[Designing Effective Navigation](http://developer.android.com/training/design-navigation/ancestral-temporal.html)和the [Navigation](http://developer.android.com/training/design-navigation/ancestral-temporal.html) design guide中描述了向上导航的概念和设计准则。

![Figure 1. action bar中的Up按钮.](implementing-navigation-up.png)

**Figure 1**. action bar中的Up按钮.

## 指定父Activity

要实现向上导航，第一步就是为每一个activity声明合适的父activity。这么做可以使系统简化导航模式，例如向上导航，因为系统可以从manifest文件中判断它的逻辑父(logical parent)activity。

从Android 4.1 (API level 16)开始，你可以通过指定[`<activity>`](http://developer.android.com/guide/topics/manifest/activity-element.html)元素中的[android:parentActivityName](http://developer.android.com/guide/topics/manifest/activity-element.html#parent)属性来声明每一个activity的逻辑父activity。

如果你的app需要支持Android 4.0以下版本，在你的app中包含[Support Library](http://developer.android.com/tools/support-library/index.html)并添加[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)元素到[`<activity>`](http://developer.android.com/guide/topics/manifest/activity-element.html)中。然后指定父activity的值为`android.support.PARENT_ACTIVITY`，并匹配[android:parentActivityName](http://developer.android.com/guide/topics/manifest/activity-element.html#parent)的值。

例如:

```xml
<application ... >
    ...
    <!-- main/home activity (没有父activity) -->
    <activity
        android:name="com.example.myfirstapp.MainActivity" ...>
        ...
    </activity>
    <!-- 主activity的一个子activity -->
    <activity
        android:name="com.example.myfirstapp.DisplayMessageActivity"
        android:label="@string/title_activity_display_message"
        android:parentActivityName="com.example.myfirstapp.MainActivity" >
        <!-- 父activity的meta-data，用来支持4.0以下版本 -->
        <meta-data
            android:name="android.support.PARENT_ACTIVITY"
            android:value="com.example.myfirstapp.MainActivity" />
    </activity>
</application>
```

在父activity这样声明后，你可以使用[NavUtils](http://developer.android.com/reference/android/support/v4/app/NavUtils.html) API进行向上导航操作，就像下一面这节。

## 添加向上操作(Up Action)

要使用action bar的app图标来完成向上导航，需要调用[setDisplayHomeAsUpEnabled()](http://developer.android.com/reference/android/app/ActionBar.html#setDisplayHomeAsUpEnabled%28boolean%29):

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    ...
    getActionBar().setDisplayHomeAsUpEnabled(true);
}
```

这样，在app旁添加了一个左向符号，并用作操作按钮。当用户点击它时，你的activity会接收一个对[onOptionsItemSelected()](http://developer.android.com/reference/android/app/Activity.html#onOptionsItemSelected%28android.view.MenuItem%29)的调用。操作的ID是`android.R.id.home`。

## 向上导航至父activity

要在用户点击app图标时向上导航，你可以使用[NavUtils](http://developer.android.com/reference/android/support/v4/app/NavUtils.html)类中的静态方法[navigateUpFromSameTask()](http://developer.android.com/reference/android/support/v4/app/NavUtils.html#navigateUpFromSameTask%28android.app.Activity%29)。当你调用这一方法时，系统会结束当前的activity并启动(或恢复)相应的父activity。如果目标activity在任务的后退栈中(back stack)，则目标activity会像[FLAG_ACTIVITY_CLEAR_TOP](http://developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_CLEAR_TOP)定义的那样，提到栈顶。提到栈顶的方式取决于父activity是否处理了对<a href="http://developer.android.com/reference/android/app/Activity.html#onNewIntent(android.content.Intent)">onNewIntent()</a>的调用。

例如:

```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    switch (item.getItemId()) {
    // 对action bar的Up/Home按钮做出反应
    case android.R.id.home:
        NavUtils.navigateUpFromSameTask(this);
        return true;
    }
    return super.onOptionsItemSelected(item);
}
```

但是，**只能是当你的app拥有当前任务(current task)**(用户从你的app中发起这一任务)时[navigateUpFromSameTask()](http://developer.android.com/reference/android/support/v4/app/NavUtils.html#navigateUpFromSameTask%28android.app.Activity%29)才有用。如果你的activity是从别的app的任务中启动的话，向上导航操作就应该创建一个属于你的app的新任务，并需要你创建一个新的后退栈。

### 用新的后退栈来向上导航

如果你的activity提供了任何允许被别的app启动的[intent filters](http://developer.android.com/guide/components/intents-filters.html#ifs)，那么你应该实现[onOptionsItemSelected()](http://developer.android.com/reference/android/app/Activity.html#onOptionsItemSelected%28android.view.MenuItem%29)回调，在用户从别的app任务进入你的activity后，点击Up按钮，在向上导航之前你的app用相应的后退栈开启一个新的任务。

在这么做之前，你可以先调用[shouldUpRecreateTask()](http://developer.android.com/reference/android/support/v4/app/NavUtils.html#shouldUpRecreateTask%28android.app.Activity,%20android.content.Intent%29)来检查当前的activity实例是否在另一个不同的app任务中。如果返回true，就使用[TaskStackBuilder](http://developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html)创建一个新任务。或者，你可以向上面那样使用[navigateUpFromSameTask()](http://developer.android.com/reference/android/support/v4/app/NavUtils.html#navigateUpFromSameTask%28android.app.Activity%29)方法。

例如:

```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    switch (item.getItemId()) {
    // 对action bar的Up/Home按钮做出反应
    case android.R.id.home:
        Intent upIntent = NavUtils.getParentActivityIntent(this);
        if (NavUtils.shouldUpRecreateTask(this, upIntent)) {
            // 这个activity不是这个app任务的一部分, 所以当向上导航时创建
            // 用合成后退栈(synthesized back stack)创建一个新任务。
            TaskStackBuilder.create(this)
                    // 添加这个activity的所有父activity到后退栈中
                    .addNextIntentWithParentStack(upIntent)
                    // 向上导航到最近的一个父activity
                    .startActivities();
        } else {
            // 这个activity是这个app任务的一部分, 所以
            // 向上导航至逻辑父activity.
            NavUtils.navigateUpTo(this, upIntent);
        }
        return true;
    }
    return super.onOptionsItemSelected(item);
}
```

>**Note**:为了能使[addNextIntentWithParentStack()](http://developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html#addNextIntentWithParentStack%28android.content.Intent%29)方法起作用，你必须像上面说的那样，在你的manifest文件中使用[android:parentActivityName](http://developer.android.com/guide/topics/manifest/activity-element.html#parent)(和相应的[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html)元素)属性声明所有的activity的逻辑父activity。
