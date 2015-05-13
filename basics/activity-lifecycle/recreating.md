# 重新创建Activity

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文: <http://developer.android.com/training/basics/activity-lifecycle/recreating.html>

有几个场景中，Activity是由于正常的程序行为而被Destory的。例如当用户点击返回按钮或者是Activity通过调用<a href="http://developer.android.com/reference/android/app/Activity.html#finish()">finish()</a>来发出停止信号。系统也有可能会在Activity处于stop状态且长时间不被使用，或者是在前台activity需要更多系统资源的时关闭后台进程，以图获取更多的内存。

当Activity是因为用户点击Back按钮或者是activity通过调用finish()结束自己时，系统就丢失了对Activity实例的引用，因为这一行为意味着不再需要这个activity了。然而，如果因为系统资源紧张而导致Activity的Destory， 系统会在用户回到这个Activity时有这个Activity存在过的记录，系统会使用那些保存的记录数据（描述了当Activity被Destory时的状态）来重新创建一个新的Activity实例。那些被系统用来恢复之前状态而保存的数据被叫做 "instance state" ，它是一些存放在[Bundle](http://developer.android.com/reference/android/os/Bundle.html)对象中的key-value pairs。(*请注意这里的描述，这对理解onSaveInstanceState执行的时刻很重要*)

> **Caution:** 你的Activity会在每次旋转屏幕时被destroyed与recreated。当屏幕改变方向时，系统会Destory与Recreate前台的activity，因为屏幕配置被改变，你的Activity可能需要加载另一些替代的资源(例如layout).

<!-- more -->

默认情况下, 系统使用 Bundle 实例来保存每一个View(视图)对象中的信息(例如输入EditText 中的文本内容)。因此，如果Activity被destroyed与recreated, 则layout的状态信息会自动恢复到之前的状态。然而，activity也许存在更多你想要恢复的状态信息，例如记录用户Progress的成员变量(member variables)。

> **Note:** 为了使Android系统能够恢复Activity中的View的状态，**每个View都必须有一个唯一ID**，由[android:id](http://developer.android.com/reference/android/view/View.html#attr_android:id)定义。

为了可以保存额外更多的数据到saved instance state。在Activity的生命周期里面存在一个额外的回调函数，你必须重写这个函数。该回调函数并没有在前面课程的图片示例中显示。这个方法是<a href="http://developer.android.com/reference/android/app/Activity.html#onSaveInstanceState(android.os.Bundle)">onSaveInstanceState()</a> ，当用户离开Activity时，系统会调用它。当系统调用这个函数时，系统会在Activity被异常Destory时传递 Bundle 对象，这样我们就可以增加额外的信息到Bundle中并保存到系统中。若系统在Activity被Destory之后想重新创建这个Activity实例时，之前的Bundle对象会(系统)被传递到你我们activity的<a href="http://developer.android.com/reference/android/app/Activity.html#onRestoreInstanceState(android.os.Bundle)">onRestoreInstanceState()</a>方法与 onCreate() 方法中。

![basic-lifecycle-savestate](basic-lifecycle-savestate.png)

**Figure 2.** 当系统开始停止Activity时，只有在Activity实例会需要重新创建的情况下才会调用到<a href="http://developer.android.com/reference/android/app/Activity.html#onSaveInstanceState(android.os.Bundle)">onSaveInstanceState()</a> (1) ，在这个方法里面可以指定额外的状态数据到Bunde中。如果这个Activity被destroyed然后这个实例又需要被重新创建时，系统会传递在 (1) 中的状态数据到 onCreate()  (2) 与 <a href="http://developer.android.com/reference/android/app/Activity.html#onRestoreInstanceState(android.os.Bundle)">onRestoreInstanceState()</a>(3).

*(通常来说，跳转到其他的activity或者是点击Home都会导致当前的activity执行onSaveInstanceState，因为这种情况下的activity都是有可能会被destory并且是需要保存状态以便后续恢复使用的，而从跳转的activity点击back回到前一个activity，那么跳转前的activity是执行退栈的操作，所以这种情况下是不会执行onSaveInstanceState的，因为这个activity不可能存在需要重建的操作)*



## 保存Activity状态

当我们的activity开始Stop，系统会调用 onSaveInstanceState() ，Activity可以用键值对的集合来保存状态信息。这个方法会默认保存Activity视图的状态信息，如在 EditText 组件中的文本或 ListView 的滑动位置。

为了给Activity保存额外的状态信息，你必须实现onSaveInstanceState() 并增加key-value pairs到 Bundle 对象中，例如：

```java
static final String STATE_SCORE = "playerScore";
static final String STATE_LEVEL = "playerLevel";
...

@Override
public void onSaveInstanceState(Bundle savedInstanceState) {
    // Save the user's current game state
    savedInstanceState.putInt(STATE_SCORE, mCurrentScore);
    savedInstanceState.putInt(STATE_LEVEL, mCurrentLevel);

    // Always call the superclass so it can save the view hierarchy state
    super.onSaveInstanceState(savedInstanceState);
}
```

> **Caution**: 必须要调用 onSaveInstanceState() 方法的父类实现，这样默认的父类实现才能保存视图状态的信息。

## 恢复Activity状态

当Activity从Destory中重建，我们可以从系统传递的Activity的Bundle中恢复保存的状态。 onCreate() 与 onRestoreInstanceState() 回调方法都接收到了同样的Bundle，里面包含了同样的实例状态信息。

由于 onCreate() 方法会在第一次创建新的Activity实例与重新创建之前被Destory的实例时都被调用，我们必须在尝试读取 Bundle 对象前检测它是否为null。如果它为null，系统则是创建一个新的Activity实例，而不是恢复之前被Destory的Activity。

下面是一个示例：演示在onCreate方法里面恢复一些数据：

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState); // Always call the superclass first

    // Check whether we're recreating a previously destroyed instance
    if (savedInstanceState != null) {
        // Restore value of members from saved state
        mCurrentScore = savedInstanceState.getInt(STATE_SCORE);
        mCurrentLevel = savedInstanceState.getInt(STATE_LEVEL);
    } else {
        // Probably initialize members with default values for a new instance
    }
    ...
}
```

我们也可以选择实现 onRestoreInstanceState()  ，而不是在onCreate方法里面恢复数据。 **onRestoreInstanceState()方法会在 onStart() 方法之后执行. 系统仅仅会在存在需要恢复的状态信息时才会调用 onRestoreInstanceState() ，因此不需要检查 Bundle 是否为null。**

```java
public void onRestoreInstanceState(Bundle savedInstanceState) {
    // Always call the superclass so it can restore the view hierarchy
    super.onRestoreInstanceState(savedInstanceState);

    // Restore state members from saved instance
    mCurrentScore = savedInstanceState.getInt(STATE_SCORE);
    mCurrentLevel = savedInstanceState.getInt(STATE_LEVEL);
}
```

> **Caution**: 与上面保存一样，总是需要调用onRestoreInstanceState()方法的父类实现，这样默认的父类实现才能保存视图状态的信息。更多关于运行时状态改变引起的recreate我们的activity。请参考[Handling Runtime Changes](http://developer.android.com/guide/topics/resources/runtime-changes.html).
