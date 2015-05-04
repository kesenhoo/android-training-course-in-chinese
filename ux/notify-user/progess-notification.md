# 显示Notification进度

> 编写:[fastcome1985](https://github.com/fastcome1985) - 原文:<http://developer.android.com/training/notify-user/display-progress.html>

Notifications可以包含一个展示用户正在进行的操作状态的动画进度指示器。如果你可以在任何时候估算这个操作得花多少时间以及当前已经完成多少，你可以用“determinate（确定的，下同）”形式的指示器（一个进度条）。如果你不能估算这个操作的长度，使用“indeterminate（不确定，下同）”形式的指示器（一个活动的指示器）。

进度指示器用[ProgressBar](developer.android.com/reference/android/widget/ProgressBar.html)平台实现类来显示。

使用进度指示器，可以调用 [setProgress()](http://developer.android.com/intl/zh-cn/reference/android/support/v4/app/NotificationCompat.Builder.html#setProgress%28int,%20int,%20boolean%29)方法。determinate 与 indeterminate形式将在下面的章节中介绍。

## 展示固定长度的进度指示器
为了展示一个确定长度的进度条，调用 [setProgress(max, progress, false)](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setProgress(int,%20int,%20boolean))方法将进度条添加进notification，然后发布这个notification，第三个参数是个boolean类型，决定进度条是 indeterminate (true) 还是 determinate (false)。在你操作进行时，增加progress，更新notification。在操作结束时，progress应该等于max。一个常用的调用 [setProgress()](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setProgress(int,%20int,%20boolean))的方法是设置max为100，然后增加progress就像操作的“完成百分比”。

当操作完成的时候，你可以选择或者让进度条继续展示，或者移除它。无论哪种情况下，记得更新notification的文字来显示操作完成。移除进度条，调用[setProgress(0, 0, false)](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setProgress(int,%20int,%20boolean))方法.比如：



```java

int id = 1;
...
mNotifyManager =
        (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
mBuilder = new NotificationCompat.Builder(this);
mBuilder.setContentTitle("Picture Download")
    .setContentText("Download in progress")
    .setSmallIcon(R.drawable.ic_notification);
// Start a lengthy operation in a background thread
new Thread(
    new Runnable() {
        @Override
        public void run() {
            int incr;
            // Do the "lengthy" operation 20 times
            for (incr = 0; incr <= 100; incr+=5) {
                    // Sets the progress indicator to a max value, the
                    // current completion percentage, and "determinate"
                    // state
                    mBuilder.setProgress(100, incr, false);
                    // Displays the progress bar for the first time.
                    mNotifyManager.notify(id, mBuilder.build());
                        // Sleeps the thread, simulating an operation
                        // that takes time
                        try {
                            // Sleep for 5 seconds
                            Thread.sleep(5*1000);
                        } catch (InterruptedException e) {
                            Log.d(TAG, "sleep failure");
                        }
            }
            // When the loop is finished, updates the notification
            mBuilder.setContentText("Download complete")
            // Removes the progress bar
                    .setProgress(0,0,false);
            mNotifyManager.notify(id, mBuilder.build());
        }
    }
// Starts the thread by calling the run() method in its Runnable
).start();

```

 结果notifications显示在图1中，左边是操作正在进行中的notification的快照，右边是操作已经完成的notification的快照。

![fragments-screen-mock](progress_bar_summary.png)
图1 操作正在进行中与完成时的进度条


## 展示持续的活动的指示器

为了展示一个持续的(indeterminate)活动的指示器,用[setProgress(0, 0, true)](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setProgress(int,%20int,%20boolean))方法把指示器添加进notification，然后发布这个notification 。前两个参数忽略，第三个参数决定indicator 还是 indeterminate。结果是指示器与进度条有同样的样式，除了它的动画正在进行。


在操作开始的时候发布notification，动画将会一直进行直到你更新notification。当操作完成时，调用 [setProgress(0, 0, false)](developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setProgress(int,%20int,%20boolean)) 方法，然后更新notification来移除这个动画指示器。一定要这么做，否责即使你操作完成了，动画还是会在那运行。同时也要记得更新notification的文字来显示操作完成。

为了观察持续的活动的指示器是如何工作的，看前面的代码。定位到下面的几行：


```java

// Sets the progress indicator to a max value, the current completion
// percentage, and "determinate" state
mBuilder.setProgress(100, incr, false);
// Issues the notification
mNotifyManager.notify(id, mBuilder.build());

```

将你找到的代码用下面的几行代码代替，注意 setProgress()方法的第三个参数设置成了true,表示进度条是 indeterminate类型的。

```java

// Sets an activity indicator for an operation of indeterminate length
mBuilder.setProgress(0, 0, true);
// Issues the notification
mNotifyManager.notify(id, mBuilder.build());

```

结果显示在图2中:

![fragments-screen-mock](activity_indicator.png)

图2 正在进行的活动的指示器
