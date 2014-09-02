# 控制音量与音频播放

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/volume-playback.html>

一个好的用户体验是可预期可控的。如果App是在播放音频，那么显然我们需要做到能够通过硬件按钮，软件按钮，蓝牙耳麦等来控制音量。
同样的，我们需要能够进行play, stop, pause, skip, and previous等动作，并且进行对应的响应。

<!-- more -->

## 鉴别使用的是哪个音频流(Identify Which Audio Stream to Use)

首先需要知道的是我们的App会使用到哪些音频流。Android为播放音乐，闹铃，通知铃，来电声音，系统声音，打电话声音与DTMF频道分别维护了一个隔离的音频流。这是我们能够控制不同音频的前提。其中大多数都是被系统限制的，不能胡乱使用。除了你的App是需要做替换闹钟的铃声的操作，那么几乎其他的播放音频操作都是使用"STREAM_MUSIC"音频流。

## 使用硬件音量键来控制App的音量(Use Hardware Volume Keys to Control Your App’s Audio Volume)

默认情况下，按下音量控制键会调节当前被激活的音频流，如果你的App没有在播放任何声音，则会调节响铃的声音。如果是一个游戏或者音乐程序，需要在不管是否目前正在播放歌曲或者游戏目前是否发出声音的时候，按硬件的音量键都会有对应的音量调节。我们需要监听音量键是否被按下，Android提供了setVolumeControlStream()的方法来直接控制指定的音频流。在鉴别出App会使用哪个音频流之后，需要在Activity或者Fragment创建的时候就设置音量控制，这样能确保不管App是否可见，音频控制功能都正常工作。

```java
setVolumeControlStream(AudioManager.STREAM_MUSIC);
```

## 使用硬件的播放控制按键来控制App的音频播放(Use  Hardware Playback Control Keys to Control Your App’s Audio Playback)

媒体播放按钮，例如play, pause, stop, skip, and previous的功能同样可以在一些线控，耳麦或者其他无线控制设备上实现。无论用户按下上面任何设备上的控制按钮，系统都会广播一个带有`ACTION_MEDIA_BUTTON`的Intent。为了响应那些操作，需要像下面一样注册一个BroadcastReceiver在Manifest文件中。

```xml
<receiver android:name=".RemoteControlReceiver">
    <intent-filter>
        <action android:name="android.intent.action.MEDIA_BUTTON" />
    </intent-filter>
</receiver>
```

Receiver需要判断这个广播是来自哪个按钮的操作，Intent在`EXTRA_KEY_EVENT`中包含了KEY的信息，同样KeyEvent类包含了一列`KEYCODE_MEDIA_`的静态变量来表示不同的媒体按钮，例如`KEYCODE_MEDIA_PLAY_PAUSE` 与 `KEYCODE_MEDIA_NEXT`.

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

因为可能有多个程序都同样监听了哪些控制按钮，那么必须在代码中特意控制当前哪个Receiver会进行响应。下面的例子显示了如何使用AudioManager来注册监听与取消监听，当Receiver被注册上时，它将是唯一响应Broadcast的Receiver。

```java
AudioManager am = mContext.getSystemService(Context.AUDIO_SERVICE);
...

// Start listening for button presses
am.registerMediaButtonEventReceiver(RemoteControlReceiver);
...

// Stop listening for button presses
am.unregisterMediaButtonEventReceiver(RemoteControlReceiver);
```

通常，App需要在Receiver没有激活或者不可见的时候（比如在onStop的方法里面）取消注册监听。但是在媒体播放的时候并没有那么简单，实际上，我们需要在后台播放歌曲的时候同样需要进行响应。
一个比较好的注册与取消监听的方法是当程序获取与失去音频焦点的时候进行操作。这个内容会在后面的课程中详细讲解。
