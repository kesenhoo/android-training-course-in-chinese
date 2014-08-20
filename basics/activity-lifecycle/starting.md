# 启动与销毁Activity

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/activity-lifecycle/starting.html>

* 不像其他编程范式一样：程序从`main()`方法开始启动。Android系统根据生命周期的不同阶段唤起对应的回调函数来执行代码。系统存在启动与销毁一个activity的一套有序的回调函数。

* 这一个课会介绍那些生命周期中最重要的回调函数，并演示如何处理启动一个activity所涉及到的回调函数。

## 理解生命周期的回调

* 在一个activity的生命周期中，系统会像金字塔模型一样去调用一系列的生命周期回调方法。Activity生命周期的每一个阶段就像金字塔中的台阶。当系统创建了一个新的activity实例，每一个回调函数会向上一阶的移动activity状态。金字塔顶端意味着activity是跑在最前端的并且用户可以与它进行交互。

<!-- more -->

* 当用户开始离开这个activity，为了卸载这个activity，系统会调用其它方法来向下一阶移动activity状态。在某些情况下，activity会隐藏在金字塔下等待(例如当用户切换到其他app),这个时候activity可以重新回到顶端(如果用户回到这个activity)并且恢复用户离开时的状态。

Figure 1. 下面这张图讲解了activity的生命周期：*(这个金字塔模型要比之前Dev Guide里面的生命周期图更加容易理解，更加形象)*

![basic-lifecycle](basic-lifecycle.png)

* 根据你的activity的复杂度，你也许不需要实现所有的生命周期方法。然而，你需要知道每一个方法的功能并确保你的app能够像用户期望的那样执行。如何实现一个符合用户期待的app，你需要注意下面几点：
  * 当使用你的app的时候，不会因为有来电通话或者切换到其他app而导致程序crash。
  * 当用户没有激活某个组件的时候不要消耗宝贵的系统资源。
  * 当离开你的app并且一段时间后返回，不要丢失用户的使用进度。
  * 当设备发送屏幕旋转的时候，不会crash或者丢失用户的使用进度。
* 在下面的课程中会介绍上图所示的几个生命状态。然而，其中只有三个状态是静态的，这三个状态下activity可以存在一段比较长的时间。*(其它几个状态会很快就切换掉，停留的时间比较短暂)*
  * **Resumed**：在这个状态，activity是在最前端的，用户可以与它进行交互。(通常也被理解为"running" 状态)
  * **Paused**：在这个状态，activity被另外一个activity所遮盖：另外的activity来到最前面，但是半透明的，不会覆盖整个屏幕。被暂停的activity不会再接受用户的输入且不会执行任何代码。(*这里的不会执行任何代码并不代表了任何后台线程都不会工作*)
  * **Stopped**：在这个状态, activity完全被隐藏，不被用户可见。可以认为是在后台。当stopped, activity实例与它的所有状态信息都会被保留，但是activity不能执行任何代码。
* 其它状态 (**Created**与**Started**)都是短暂的，系统快速的执行那些回调函数并通过执行下一阶段的回调函数移动到下一个状态。也就是说，在系统调用<a href="http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)">onCreate()</a>, 之后会迅速调用<a href="http://developer.android.com/reference/android/app/Activity.html#onStart()">onStart()</a>, 之后再迅速执行<a href="http://developer.android.com/reference/android/app/Activity.html#onResume()">onResume()</a>。上面就是基本的activity生命周期。

## 指定你的程序首次启动的Activity

* 当用户从主界面点击你的程序图标时，系统会调用你的app里面的被声明为"launcher" (or "main") activity中的onCreate()方法。这个Activity被用来当作你的程序的主要进入点。
* 你可以在[AndroidManifest.xml](http://developer.android.com/guide/topics/manifest/manifest-intro.html)中定义哪个activity作为你的主activity。
* 这个main activity必须在manifest使用包括 `MAIN` action 与 `LAUNCHER` category 的[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签来声明。例如：

```xml
<activity android:name=".MainActivity" android:label="@string/app_name">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

> **Note**:当你使用Android SDK工具来创建Android工程时，工程中就包含了一个默认的声明有这个filter的activity类。

* 如果你的程序中没有一个activity声明了[MAIN](http://developer.android.com/reference/android/content/Intent.html#ACTION_MAIN) action 或者[LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LAUNCHER) category，那么在设备的主界面列表里面不会呈现你的app图标。

## 创建一个新的实例

* 大多数app都包括许多不同的activities，这样使得用户可以执行不同的动作。不论这个activity是创建的主activtiy还是为了响应用户行为而新创建的，系统都会调用新的activity实例中的onCreate()方法。
* 你必须实现onCreate()方法来执行程序启动所需要的基本逻辑。
* 例如：下面的onCreate()方法演示了为了建立一个activity所需要的一些基础操作。如，声明UI元素 ，定义成员变量，配置UI等。*(onCreate里面尽量少做事情，避免程序启动太久都看不到界面)*

```java
TextView mTextView; // Member variable for text view in the layout

@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Set the user interface layout for this Activity
    // The layout file is defined in the project res/layout/main_activity.xml
file
    setContentView(R.layout.main_activity);

    // Initialize member TextView so we can manipulate it later
    mTextView = (TextView) findViewById(R.id.text_message);

    // Make sure we're running on Honeycomb or higher to use ActionBar APIs
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
        // For the main activity, make sure the app icon in the action bar
        // does not behave as a button
        ActionBar actionBar = getActionBar();
        actionBar.setHomeButtonEnabled(false);
    }
}
```

> **Caution**: Using the [SDK_INT](http://developer.android.com/reference/android/os/Build.VERSION.html#SDK_INT) to prevent older systems from executing new APIs works in this way on Android 2.0 (API level 5) and higher only. Older versions will encounter a runtime exception.

* 一旦结束onCreate 操作，系统会迅速调用onStart() 与onResume()方法。你的activity不会在Created或者Started状态停留。技术上来说, activity在onStart()被调用后会开始被用户可见，但是 onResume()会迅速被执行使得activity停留在Resumed状态，直到一些因素发生变化才会改变这个状态。例如接受到一个来电，用户切换到另外一个activity，或者是设备屏幕关闭。
* 在后面的课程中，你将看到其他方法是如何使用的，onStart() 与 onResume()在用户从Paused or Stopped状态中恢复的时候非常有用。

> **Note:** onCreate() 方法包含了一个参数叫做savedInstanceState，这将会在后面的课程 - [重新创建activity](../../activity-lifecycle/recreating.html)的时候涉及到。

![basic_lifecycle-create](basic-lifecycle-create.png)

* Figure 2. 上图显示了onCreate(), onStart(), and onResume()是如何执行的。当这三个顺序执行的回调函数完成后，activity会到达Resumed状态。

## 销毁Activity

* activity的第一个生命周期回调函数是 onCreate(),它最后一个回调是<a href="http://developer.android.com/reference/android/app/Activity.html#onDestroy()">onDestroy()</a>.系统会执行这个方法作为你 的activity要从系统中完全移除的信号。
* 大多数 apps并不需要实现这个方法，因为局部类的references会随着activity的销毁而销毁，并且你的activity应该在onPause()与onStop()中执行清除activity资源的操作。然而，如果你的activity包含了你在onCreate时创建的后台线程，或者是其他有可能导致内存泄漏的资源，你应该在OnDestroy()时杀死他们。

```java
@Override
public void onDestroy() {
    super.onDestroy();  // Always call the superclass

    // Stop method tracing that the activity started during onCreate()
    android.os.Debug.stopMethodTracing();
}
```

> **Note:** 系统通常是在执行了onPause()与onStop() 之后再调用onDestroy() ，除非你的程序在onCreate()方法里面就调用了finish()方法，。在某些情况下，例如你的activity只是做了一个临时的逻辑跳转的功能，它只是用来决定跳转到哪一个activity，这样的话，你需要在onCreate里面去调用finish方法，这样系统会直接就调用onDestory方法，其它生命周期的方法则不会被执行。
