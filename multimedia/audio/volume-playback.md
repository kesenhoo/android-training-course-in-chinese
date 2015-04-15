# 控制音量与音频播放

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/volume-playback.html>

良好的用户体验应该是可预期且可控的。如果我们的应用可以播放音频，那么显然我们需要做到能够通过硬件按钮，软件按钮，蓝牙耳麦等来控制音量。
同样地，我们需要能够对应用的音频流进行播放（Play），停止（Stop），暂停（Pause），跳过（Skip），以及回放（Previous）等动作，并且并确保其正确性。

<!-- more -->

## 鉴别使用的是哪个音频流(Identify Which Audio Stream to Use)

为了创建一个良好的音频体验，我们首先需要知道应用会使用到哪些音频流。Android为播放音乐，闹铃，通知铃，来电声音，系统声音，打电话声音与拨号声音分别维护了一个独立的音频流。这样做的主要目的是让用户能够单独地控制不同的种类的音频。上述音频种类中，大多数都是被系统限制。例如，除非你的应用需要做替换闹钟的铃声的操作，不然的话你只能通过[STREAM_MUSIC](http://developer.android.com/reference/android/media/AudioManager.html#STREAM_MUSIC)来播放你的音频。

## 使用硬件音量键来控制应用的音量(Use Hardware Volume Keys to Control Your App’s Audio Volume)

默认情况下，按下音量控制键会调节当前被激活的音频流，如果我们的应用当前没有播放任何声音，那么按下音量键会调节响铃的音量。对于游戏或者音乐播放器而言，即使是在歌曲之间无声音的状态，或是当前游戏处于无声的状态，用户按下音量键的操作通常都意味着他们希望调节游戏或者音乐的音量。你可能希望通过监听音量键被按下的事件，来调节音频流的音量。其实我们不必这样做。Android提供了<a href="http://developer.android.com/reference/android/app/Activity.html#setVolumeControlStream(int)">setVolumeControlStream()</a>方法来直接控制指定的音频流。在鉴别出应用会使用哪个音频流之后，我们需要在应用生命周期的早期阶段调用该方法，因为该方法只需要在Activity整个生命周期中调用一次，通常，我们可以在负责控制多媒体的[Activity](http://developer.android.com/reference/android/app/Activity.html)或者[Fragment](http://developer.android.com/reference/android/app/Fragment.html)的`onCreate()`方法中调用它。这样能确保不管应用当前是否可见，音频控制的功能都能符合用户的预期。

```java
setVolumeControlStream(AudioManager.STREAM_MUSIC);
```

自此之后，不管目标Activity或Fragment是否可见，按下设备的音量键都能够影响我们指定的音频流（在这个例子中，音频流是"music"）。

## 使用硬件的播放控制按键来控制应用的音频播放(Use  Hardware Playback Control Keys to Control Your App’s Audio Playback)

许多线控或者无线耳机都会有许多媒体播放控制按钮，例如：播放，停止，暂停，跳过，以及回放等。无论用户按下设备上任意一个控制按钮，系统都会广播一个带有[ACTION_MEDIA_BUTTON](http://developer.android.com/reference/android/content/Intent.html#ACTION_MEDIA_BUTTON)的Intent。为了正确地响应这些操作，需要在Manifest文件中注册一个针对于该Action的[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)，如下所示：

```xml
<receiver android:name=".RemoteControlReceiver">
    <intent-filter>
        <action android:name="android.intent.action.MEDIA_BUTTON" />
    </intent-filter>
</receiver>
```

在Receiver的实现中，需要判断这个广播来自于哪一个按钮，Intent通过[EXTRA_KEY_EVENT](http://developer.android.com/reference/android/content/Intent.html#EXTRA_KEY_EVENT)这一Key包含了该信息，另外，[KeyEvent](http://developer.android.com/reference/android/view/KeyEvent.html)类包含了一系列诸如`KEYCODE_MEDIA_*`的静态变量来表示不同的媒体按钮，例如[KEYCODE_MEDIA_PLAY_PAUSE](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_MEDIA_PLAY_PAUSE) 与 [KEYCODE_MEDIA_NEXT](http://developer.android.com/reference/android/view/KeyEvent.html#KEYCODE_MEDIA_NEXT)。

```java
public class RemoteControlReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_MEDIA_BUTTON.equals(intent.getAction())) {
            KeyEvent event = (KeyEvent)intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT);
            if (KeyEvent.KEYCODE_MEDIA_PLAY == event.getKeyCode()) {
                // Handle key press.
            }
        }
    }
}
```

因为可能会有多个程序在监听与媒体按钮相关的事件，所以我们必须在代码中控制应用接收相关事件的时机。下面的例子显示了如何使用[AudioManager](http://developer.android.com/reference/android/media/AudioManager.html)来为我们的应用注册监听与取消监听媒体按钮事件，当Receiver被注册上时，它将是唯一一个能够响应媒体按钮广播的Receiver。

```java
AudioManager am = mContext.getSystemService(Context.AUDIO_SERVICE);
...

// Start listening for button presses
am.registerMediaButtonEventReceiver(RemoteControlReceiver);
...

// Stop listening for button presses
am.unregisterMediaButtonEventReceiver(RemoteControlReceiver);
```

通常，应用需要在他们失去焦点或者不可见的时候（比如在<a href="http://developer.android.com/reference/android/app/Activity.html#onStop()">onStop()</a>方法里面）取消注册监听。但是对于媒体播放应用来说并没有那么简单，实际上，在应用不可见（不能通过可见的UI控件进行控制）的时候，仍然能够响应媒体播放按钮事件是极其重要的。为了实现这一点，有一个更好的方法，我们可以在程序获取与失去音频焦点的时候注册与取消对音频按钮事件的监听。这个内容会在后面的课程中详细讲解。
