# 暂停与恢复Activity

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/activity-lifecycle/pausing.html>

在正常使用app时，前端的activity有时会被其他可见的组件阻塞(obstructed)，从而导致当前的activity进入Pause状态。例如，当打开一个半透明的activity时(例如以对话框的形式)，之前的activity会被暂停。 只要之前的activity仍然被部分可见，这个activity就会一直处于Paused状态。

然而，一旦之前的activity被完全阻塞并不可见时，则其会进入Stop状态(将在下一小节讨论)。

activity一旦进入paused状态，系统就会调用activity中的<a href="http://developer.android.com/reference/android/app/Activity.html#onPause()">onPause()</a>方法, 该方法中可以停止不应该在暂停过程中执行的操作，如暂停视频播放；或者保存那些有可能需要长期保存的信息。如果用户从暂停状态回到当前activity，系统应该恢复那些数据并执行<a href="http://developer.android.com/reference/android/app/Activity.html#onResume()">onResume()</a>方法。

> **Note:** 当我们的activity收到调用onPause()的信号时，那可能意味者activity将被暂停一段时间，并且用户很可能回到我们的activity。然而，那也是用户要离开我们的activtiy的第一个信号。

![basic-lifecycle-paused](basic-lifecycle-paused.png)

**Figure 1.** 当一个半透明的activity阻塞activity时，系统会调用onPause()方法并且这个activity会停留在Paused 状态(1). 如果用户在这个activity还是在Paused 状态时回到这个activity，系统则会调用它的onResume() (2).

## 暂停Activity

当系统调用activity中的onPause()，从技术上讲，意味着activity仍然处于部分可见的状态.但更多时候意味着用户正在离开这个activity，并马上会进入Stopped state. 通常应该在onPause()回调方法里面做以下事情:
	
* 停止动画或者是其他正在运行的操作，那些都会导致CPU的浪费.
* 提交在用户离开时期待保存的内容(例如邮件草稿).
* 释放系统资源，例如broadcast receivers, sensors (比如GPS), 或者是其他任何会影响到电量的资源。

例如, 如果程序使用[Camera](http://developer.android.com/reference/android/hardware/Camera.html),onPause()会是一个比较好的地方去做那些释放资源的操作。

```java
@Override
public void onPause() {
    super.onPause();  // Always call the superclass method first

    // Release the Camera because we don't need it when paused
    // and other activities might need to use it.
    if (mCamera != null) {
        mCamera.release()
        mCamera = null;
    }
}
```

通常，**不应该**使用onPause()来保存用户改变的数据 (例如填入表格中的个人信息) 到永久存储(File或者DB)上。仅仅当确认用户期待那些改变能够被自动保存的时候(例如正在撰写邮件草稿)，才把那些数据存到永久存储 。但是，我们应该避免在onPause()时执行CPU-intensive 的工作，例如写数据到DB，因为它会导致切换到下一个activity变得缓慢(应该把那些heavy-load的工作放到<a href="http://developer.android.com/reference/android/app/Activity.html#onStop()">onStop()</a>去做)。

如果activity实际上是要被Stop，那么我们应该为了切换的顺畅而减少在OnPause()方法里面的工作量。

> **Note:**当activity处于暂停状态，[Activity](http://developer.android.com/reference/android/app/Activity.html)实例是驻留在内存中的，并且在activity 恢复的时候重新调用。我们不需要在恢复到Resumed状态的一系列回调方法中重新初始化组件。

## 恢复activity

当用户从Paused状态恢复activity时，系统会调用onResume()方法。

请注意，系统每次调用这个方法时，activity都处于前台，包括第一次创建的时候。所以，应该实现onResume()来初始化那些在onPause方法里面释放掉的组件，并执行那些activity每次进入Resumed state都需要的初始化动作 (例如开始动画与初始化那些只有在获取用户焦点时才需要的组件)

下面的onResume()的例子是与上面的onPause()例子相对应的。

```java
@Override
public void onResume() {
    super.onResume();  // Always call the superclass method first

    // Get the Camera instance as the activity achieves full user focus
    if (mCamera == null) {
        initializeCamera(); // Local method to handle camera init
    }
}
```
