# 启动与销毁Activity

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/activity-lifecycle/starting.html>

不同于使用 `main()` 方法启动应用的其他编程范例，Android 系统会通过调用对应于其生命周期中特定阶段的特定回调方法在 Activity 实例中启动代码。 有一系列可启动Activity的回调方法，以及一系列可分解Activity的回调方法。

本课程概述了最重要的生命周期方法，并向您展示如何处理创建Activity新实例的第一个生命周期回调。

## 了解生命周期回调

在Activity的生命周期中，系统会按类似于阶梯金字塔的顺序调用一组核心的生命周期方法。也就是说，Activity生命周期的每个阶段就是金字塔上的一阶。 当系统创建新Activity实例时，每个回调方法会将Activity状态向顶端移动一阶。金字塔的顶端是Activity在前台运行并且用户可以与其交互的时间点。

<!-- more -->

当用户开始离开Activity时，系统会调用其他方法在金字塔中将Activity状态下移，从而销毁Activity。在有些情况下，Activity将只在金字塔中部分下移并等待（比如，当用户切换到其他应用时），Activity可从该点开始移回顶端（如果用户返回到该Activity），并在用户停止的位置继续。

![basic-lifecycle](basic-lifecycle.png)

**图 1.**简化的Activity生命周期图示，以阶梯金字塔表示。此图示显示，对于用于将Activity朝顶端的“继续”状态移动一阶的每个回调，有一种将Activity下移一阶的回调方法。Activity还可以从“暂停”和“停止”状态回到继续状态。*

根据Activity的复杂程度，您可能不需要实现所有生命周期方法。但是，了解每个方法并实现确保您的应用按照用户期望的方式运行的方法非常重要。正确实现您的Activity生命周期方法可确保您的应用按照以下几种方式良好运行，包括：

* 如果用户在使用您的应用时接听来电或切换到另一个应用，它不会崩溃。
* 在用户未主动使用它时不会消耗宝贵的系统资源。
* 如果用户离开您的应用并稍后返回，不会丢失用户的进度。
* 当屏幕在横向和纵向之间旋转时，不会崩溃或丢失用户的进度。

正如您将要在以下课程中要学习的，有Activity会在图 1 所示不同状态之间过渡的几种情况。但是，这些状态中只有三种可以是静态。 也就是说，Activity只能在三种状态之一下存在很长时间。

  * **Resumed**：在这种状态下，Activity处于前台，且用户可以与其交互。（有时也称为“运行”状态。）
  * **Paused**：在这种状态下，Activity被在前台中处于半透明状态或者未覆盖整个屏幕的另一个Activity—部分阻挡。暂停的Activity不会接收用户输入并且无法执行任何代码。
  * **Stopped**：在这种状态下，Activity被完全隐藏并且对用户不可见；它被视为处于后台。停止时，Activity实例及其诸如成员变量等所有状态信息将保留，但它无法执行任何代码。

其他状态（“创建”和“开始”）是瞬态，

其它状态 (**Created**与**Started**)都是短暂的瞬态，系统会通过调用下一个生命周期回调方法从这些状态快速移到下一个状态。 也就是说，在系统调用 [onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)) 之后，它会快速调用 [onStart()](http://developer.android.com/reference/android/app/Activity.html#onStart())，紧接着快速调用 [onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume())。

基本生命周期部分到此为止。现在，您将开始学习特定生命周期行为的一些知识。

## 指定程序首次启动的Activity

当用户从主界面点击程序图标时，系统会调用app中被声明为"launcher" (or "main") activity中的onCreate()方法。这个Activity被用来当作程序的主要进入点。

我们可以在[AndroidManifest.xml](http://developer.android.com/guide/topics/manifest/manifest-intro.html)中定义作为主activity的activity。

这个main activity必须在manifest使用包括 `MAIN` action 与 `LAUNCHER` category 的[`<intent-filter>`](http://developer.android.com/guide/topics/manifest/intent-filter-element.html)标签来声明。例如：

```xml
<activity android:name=".MainActivity" android:label="@string/app_name">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

> **Note**:当你使用Android SDK工具来创建Android工程时，工程中就包含了一个默认的声明有这个filter的activity类。

如果程序中没有声明了[MAIN](http://developer.android.com/reference/android/content/Intent.html#ACTION_MAIN) action 或者[LAUNCHER](http://developer.android.com/reference/android/content/Intent.html#CATEGORY_LAUNCHER) category的activity，那么在设备的主界面列表里面不会呈现app图标。

## 创建一个新的实例

大多数app包括多个activity，使用户可以执行不同的动作。不论这个activity是当用户点击应用图标创建的main activtiy还是为了响应用户行为而创建的其他activity，系统都会调用新activity实例中的onCreate()方法。

我们必须实现onCreate()方法来执行程序启动所需要的基本逻辑。例如可以在onCreate()方法中定义UI以及实例化类成员变量。

例如：下面的onCreate()方法演示了为了建立一个activity所需要的一些基础操作。如声明UI元素，定义成员变量，配置UI等。*(onCreate里面尽量少做事情，避免程序启动太久都看不到界面)*

```java
TextView mTextView; // Member variable for text view in the layout

@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Set the user interface layout for this Activity
    // The layout file is defined in the project res/layout/main_activity.xml file
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

> **Caution**：用[SDK_INT](http://developer.android.com/reference/android/os/Build.VERSION.html#SDK_INT)来避免旧的系统调用了只在Android 2.0（API level 5）或者更新的系统可用的方法（上述if条件中的代码）。旧的系统调用了这些方法会抛出一个运行时异常。

一旦onCreate 操作完成，系统会迅速调用onStart() 与onResume()方法。我们的activity不会在Created或者Started状态停留。技术上来说, activity在onStart()被调用后开始被用户可见，但是 onResume()会迅速被执行使得activity停留在Resumed状态，直到一些因素发生变化才会改变这个状态。例如接收到一个来电，用户切换到另外一个activity，或者是设备屏幕关闭。

在后面的课程中，我们将看到其他方法是如何使用的，onStart() 与 onResume()在用户从Paused或Stopped状态中恢复的时候非常有用。

> **Note:** onCreate() 方法包含了一个参数叫做savedInstanceState，这将会在后面的课程 - [重新创建activity](../../activity-lifecycle/recreating.html)涉及到。

![basic_lifecycle-create](basic-lifecycle-create.png)

**Figure 2.** 上图显示了onCreate(), onStart() 和 onResume()是如何执行的。当这三个顺序执行的回调函数完成后，activity会到达Resumed状态。

## 销毁Activity

activity的第一个生命周期回调函数是 onCreate(),它最后一个回调是<a href="http://developer.android.com/reference/android/app/Activity.html#onDestroy()">onDestroy()</a>.当收到需要将该activity彻底移除的信号时，系统会调用这个方法。

大多数 app并不需要实现这个方法，因为局部类的references会随着activity的销毁而销毁，并且我们的activity应该在onPause()与onStop()中执行清除activity资源的操作。然而，如果activity含有在onCreate调用时创建的后台线程，或者是其他有可能导致内存泄漏的资源，则应该在OnDestroy()时进行资源清理，杀死后台线程。

```java
@Override
public void onDestroy() {
    super.onDestroy();  // Always call the superclass

    // Stop method tracing that the activity started during onCreate()
    android.os.Debug.stopMethodTracing();
}
```

> **Note:** 除非程序在onCreate()方法里面就调用了finish()方法，系统通常是在执行了onPause()与onStop() 之后再调用onDestroy() 。在某些情况下，例如我们的activity只是做了一个临时的逻辑跳转的功能，它只是用来决定跳转到哪一个activity，这样的话，需要在onCreate里面调用finish方法，这样系统会直接调用onDestory，跳过生命周期中的其他方法。
