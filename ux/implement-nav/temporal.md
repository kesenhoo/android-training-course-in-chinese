# 提供向后的导航

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/implementing-navigation/temporal.html>

向后导航(Back navigation)是用户根据屏幕历史记录返回之前所查看的界面。所有Android设备都可以为这种导航提供后退按钮，所以**你的app不需要在UI中添加后退按钮**。

在几乎所有情况下，当用户在应用中进行导航时，系统会保存activity的后退栈。这样当用户点击后退按钮时，系统可以正确地向后导航。但是，有少数几种情况需要手动指定app的后退操作，来提供更好的用户体验。

>**Back Navigation 设计**

>在继续阅读篇文章之前，你应该先在[Navigation](http://developer.android.com/design/patterns/navigation.html) design guide中对后退导航的概念和设计准则有个了解。

手动指定后退操作需要的导航模式:

* 当用户从[notification](http://developer.android.com/guide/topics/ui/notifiers/notifications.html)(通知)，[app widget](http://developer.android.com/guide/topics/appwidgets/index.html)，[navigation drawer](http://developer.android.com/training/implementing-navigation/nav-drawer.html)直接进入深层次activity。

* 用户在[fragment](http://developer.android.com/guide/components/fragments.html)之间切换的某些情况。

* 当用户在[WebView](http://developer.android.com/reference/android/webkit/WebView.html)中对网页进行导航。

下面说明如何在这几种情况下实现恰当的向后导航。

## 为深度链接合并新的后退栈

一般而言，当用户从一个activity导航到下一个时，系统会递增地创建后退栈。但是当用户从一个在自己的任务中启动activity的深度链接进入app，你就有必要去同步新的后退栈，因为新的activity是运行在一个没有任何后退栈的任务中。

例如，当用户从通知进入你的app中的深层activity时，你应该添加别的activity到你的任务的后退栈中，这样当点击后退(Back)时向上导航，而不是退出app。这个模式在[Navigation](http://developer.android.com/design/patterns/navigation.html#into-your-app) design guide中有更详细的介绍。

### 在manifest中指定父activity

从Android 4.1 (API level 16)开始，你可以通过指定[`<activity>`](http://developer.android.com/guide/topics/manifest/activity-element.html)元素中的[android:parentActivityName](http://developer.android.com/guide/topics/manifest/activity-element.html#parent)属性来声明每一个activity的逻辑父activity。这样系统可以使导航模式变得更容易，因为系统可以根据这些信息判断逻辑Back Up navigation的路径。

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
        <!-- 4.1 以下的版本需要使用meta-data元素 -->
        <meta-data
            android:name="android.support.PARENT_ACTIVITY"
            android:value="com.example.myfirstapp.MainActivity" />
    </activity>
</application>
```

当父activity用这种方式声明，你就可以使用[NavUtils](http://developer.android.com/reference/android/support/v4/app/NavUtils.html) API，通过确定每个activity相应的父activity来同步新的后退栈。

### 在启动activity时创建后退栈

在发生用户进入app的事件时，开始添加activity到后退栈中。就是说，使用[TaskStackBuilder](http://developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html) API定义每个被放到新后退栈的activity，不使用[startActivity()](http://developer.android.com/reference/android/content/Context.html#startActivity%28android.content.Intent%29)。然后调用[startActivities()](http://developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html#startActivities%28%29)来启动目标activity，或调用[getPendingIntent()](http://developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html#getPendingIntent%28int,%20int%29)来创建相应的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)。

例如，当用户从通知进入你的app中的深层activity时，你可以使用这段代码来创建一个启动activity并把新后退栈插入目标任务的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)。

```java
// 当用户选择通知时，启动activity的intent
Intent detailsIntent = new Intent(this, DetailsActivity.class);

// 使用TaskStackBuilder创建后退栈，并获取PendingIntent
PendingIntent pendingIntent =
        TaskStackBuilder.create(this)
                        // 添加所有DetailsActivity的父activity到栈中,
                        // 然后再添加DetailsActivity自己
                        .addNextIntentWithParentStack(upIntent)
                        .getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);

NotificationCompat.Builder builder = new NotificationCompat.Builder(this);
builder.setContentIntent(pendingIntent);
...
```

产生的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)不仅指定了启动哪个activity(被`detailsIntent`所定义)还指定了要插入任务(所有被`detailsIntent`定义的`DetailsActivity`)的后退栈。所以当`DetailsActivity`启动时，点击Back向后导航至每一个`DetailsActivity`类的父activity。

>**Note**:为了使[addNextIntentWithParentStack()](http://developer.android.com/reference/android/support/v4/app/TaskStackBuilder.html#addNextIntentWithParentStack%28android.content.Intent%29)方法起作用，像上面所说那样，你必须在你的manifest文件中使用[android:parentActivityName](http://developer.android.com/guide/topics/manifest/activity-element.html#parent)(和相应的元素[`<meta-data>`](http://developer.android.com/guide/topics/manifest/meta-data-element.html))属性声明每个activity的逻辑父activity。

## 为Fragment实现向后导航

当在app中使用fragment时，个别的[FragmentTransaction](http://developer.android.com/reference/android/app/FragmentTransaction.html)对象可以代表要加入后退栈中变化的内容。例如，如果你要在手机上通过交换fragment实现一个[master/detail flow](http://developer.android.com/training/implementing-navigation/descendant.html#master-detail)(主/详细流程)，你就要保证点击Back按钮可以从detail screen返回到master screen。要这么做，你可以在提交事务(transaction)之前调用[addToBackStack()](http://developer.android.com/reference/android/app/FragmentTransaction.html#addToBackStack%28java.lang.String%29):

```java
// 使用framework FragmentManager
// 或support package FragmentManager (getSupportFragmentManager).
getSupportFragmentManager().beginTransaction()
                           .add(detailFragment, "detail")
                           // 提交这一事务到后退栈中
                           .addToBackStack()
                           .commit();
```

当后退栈中有[FragmentTransaction](http://developer.android.com/reference/android/app/FragmentTransaction.html)对象并且用户点击Back按钮时,[FragmentManager](http://developer.android.com/reference/android/app/FragmentManager.html)会从后退栈中弹出最近的事务，然后执行反向操作(例如如果事务添加了一个fragment，那么就删除一个fragment)。

>**Note**:当事务用作水平导航(例如切换tab)或者修改内容外观(例如在调整filter时)时，**不要将这个事务添加到后退栈中**。更多关于向后导航的恰当时间的信息，详见[Navigation](http://developer.android.com/design/patterns/navigation.html) design guide。

如果你的应用更新了别的UI元素来反应当前的fragment状态，例如action bar，记得当你提交事务时更新UI。除了在提交事务的时候，在后退栈发生变化时也要更新你的UI。你可以设置一个[FragmentManager.OnBackStackChangedListener](http://developer.android.com/reference/android/app/FragmentManager.OnBackStackChangedListener.html)来监听[FragmentTransaction](http://developer.android.com/reference/android/app/FragmentTransaction.html)什么时候复原:

```java
getSupportFragmentManager().addOnBackStackChangedListener(
        new FragmentManager.OnBackStackChangedListener() {
            public void onBackStackChanged() {
                // 在这里更新你的UI
            }
        });
```

## 为WebView实现向后导航

如果你的应用的一部分包含在[WebView](http://developer.android.com/reference/android/webkit/WebView.html)中，可以通过浏览器历史使用Back。要这么做，如果[WebView](http://developer.android.com/reference/android/webkit/WebView.html)有历史记录，你可以重写onBackPressed()并代理给[WebView](http://developer.android.com/reference/android/webkit/WebView.html):

```java
@Override
public void onBackPressed() {
    if (mWebView.canGoBack()) {
        mWebView.goBack();
        return;
    }

    // 否则遵从系统的默认操作.
    super.onBackPressed();
}
```

要注意当使用这一机制时，高动态化的页面会产生大量历史。会生成大量历史的页面，例如经常改变文件散列(document hash)的页面,当要退出你的activity时，这会使你的用户感到繁琐。

更多关于使用[WebView](http://developer.android.com/reference/android/webkit/WebView.html)的信息，详见[Building Web Apps in WebView](http://developer.android.com/guide/webapps/webview.html)。
