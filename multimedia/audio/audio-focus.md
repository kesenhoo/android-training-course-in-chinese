# 管理音频焦点

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/audio-focus.html>

由于有多个应用可能播放音频，考虑他们应该如何交互非常重要。为了防止多个音乐app同时播放音频，Android使用音频焦点[audio focus]来控制音频的播放 — 只有获取到audio focus的App才能够播放音频。

在你的App开始播放音频之前，它需要经过发出请求[request]->接受请求[receive]->音频焦点锁定[Audio Focus]的过程。同样，它需要知道如何监听失去音频焦点[lose of audio focus]的事件并进行合适的响应。

<!-- more -->

## 请求获取音频焦点(Request the Audio Focus)

在你的App开始播放音频之前，它需要获取它将要使用的音频流的音频焦点。通过使用 [requestAudioFocus()](http://developer.android.com/reference/android/media/AudioManager.html#requestAudioFocus(android.media.AudioManager.OnAudioFocusChangeListener, int, int)) 方法来获取你想要获取到的音频流焦点。如果请求成功这个方法会返回 AUDIOFOCUS_REQUEST_GRANTED 。

你必须指定正在使用哪个音频流，而且需要确定请求的是短暂的还是永久的audio focus。

* 短暂的焦点锁定：当期待播放一个短暂的音频的时候（比如播放导航指示）
* 永久的焦点锁定：当计划播放可预期到的较长的音频的时候（比如播放音乐）

下面是一个在播放音乐的时候请求永久的音频焦点的例子，我们必须在开始播放之前立即请求音频焦点，比如在用户点击播放或者游戏程序中下一关开始的片头音乐。

```java
AudioManager am = mContext.getSystemService(Context.AUDIO_SERVICE);
...

// Request audio focus for playback
int result = am.requestAudioFocus(afChangeListener,
                                 // Use the music stream.
                                 AudioManager.STREAM_MUSIC,
                                 // Request permanent focus.
                                 AudioManager.AUDIOFOCUS_GAIN);

if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
    am.registerMediaButtonEventReceiver(RemoteControlReceiver);
    // Start playback.
}
```

一旦结束了播放，需要确保调用 [abandonAudioFocus()](http://developer.android.com/reference/android/media/AudioManager.html#abandonAudioFocus(android.media.AudioManager.OnAudioFocusChangeListener))方法。这样会通知系统说你不再需要获取焦点并且取消注册[AudioManager.OnAudioFocusChangeListener](http://developer.android.com/reference/android/media/AudioManager.OnAudioFocusChangeListener.html)的监听。在释放短暂音频焦点的情况下，这会允许任何被你打断的App继续播放。

```java
// Abandon audio focus when playback complete
am.abandonAudioFocus(afChangeListener);
```

当请求短暂音频焦点的时候，我们可以选择是否开启“ducking”。Ducking是一个特殊的机制使得允许音频间歇性的短暂播放。
通常情况下，一个好的App在失去音频焦点的时候它会立即保持安静。如果我们选择在请求短暂音频焦点的时候开启了ducking，那意味着其它App可以继续播放，仅仅是在这一刻降低自己的音量，在短暂重新获取到音频焦点后恢复正常音量(也就是说：不用理会这个请求短暂焦点的请求，这并不会导致目前在播放的音频受到牵制，比如在播放音乐的时候突然出现一个短暂的短信提示声音，这个时候仅仅是把播放歌曲的音量暂时调低，好让短信声能够让用户听到，之后立马恢复正常播放)。

```java
// Request audio focus for playback
int result = am.requestAudioFocus(afChangeListener,
                             // Use the music stream.
                             AudioManager.STREAM_MUSIC,
                             // Request permanent focus.
                             AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);

if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
    // Start playback.
}
```

## 处理失去音频焦点(Handle the Loss of Audio Focus)

如果A程序可以请求获取音频焦点，那么在B程序请求获取的时候，A获取到的焦点就会失去。显然我们需要处理失去焦点的事件。

在音频焦点的监听器里面，当接受到描述焦点改变的事件时会触发[onAudioFocusChange()](http://developer.android.com/reference/android/media/AudioManager.OnAudioFocusChangeListener.html#onAudioFocusChange(int))回调方法。对应于获取焦点的三种类型，我们同样会有三种失去焦点的类型 - 永久失去，短暂失去，允许Ducking的短暂失去。

* 失去短暂焦点：通常在失去这种焦点的情况下，我们会暂停当前音频的播放或者降低音量，同时需要准备在重新获取到焦点之后恢复播放。

* 失去永久焦点：假设另外一个程序开始播放音乐等，那么我们的程序就应该有效的结束自己。实用的做法是停止播放，移除button监听，允许新的音频播放器独占监听那些按钮事件，并且放弃自己的音频焦点。这种情况下，重新播放你的音频之前，你需要确保用户重新点击了你的App的播放按钮等。

```java
OnAudioFocusChangeListener afChangeListener = new OnAudioFocusChangeListener() {
    public void onAudioFocusChange(int focusChange) {
        if (focusChange == AUDIOFOCUS_LOSS_TRANSIENT
            // Pause playback
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            // Resume playback
        } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
            am.unregisterMediaButtonEventReceiver(RemoteControlReceiver);
            am.abandonAudioFocus(afChangeListener);
            // Stop playback
        }
    }
};
```

在上面失去短暂焦点的例子中，如果允许ducking，那么我们可以选择“duck”的行为而不是暂停当前的播放。

## Duck! [闪避]

Ducking是一个特殊的机制使得允许音频间歇性的短暂播放。在Ducking的情况下，正常播放的歌曲会降低音量来凸显这个短暂的音频声音，这样既让这个短暂的声音比较突出，又不至于打断正常的声音。

下面的代码片段让我们的播放器在暂时失去音频焦点时降低音量，并在重新获得音频焦点之后恢复原来音量。

```java
OnAudioFocusChangeListener afChangeListener = new OnAudioFocusChangeListener() {
    public void onAudioFocusChange(int focusChange) {
        if (focusChange == AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK
            // Lower the volume
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            // Raise it back to normal
        }
    }
};
```

监听失去音频焦点是最重要的广播之一，但不是唯一的方法。系统广播了一系列的intent来警示你去改变用户的音频使用体验。下节课会演示如何监视那些广播来提升用户的整体体验。
