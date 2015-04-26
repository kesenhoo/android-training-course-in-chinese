# 管理音频焦点

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/audio-focus.html>

由于可能会有多个应用可以播放音频，所以我们应当考虑一下他们应该如何交互。为了防止多个音乐播放应用同时播放音频，Android使用音频焦点（Audio Focus）来控制音频的播放——即只有获取到音频焦点的应用才能够播放音频。

在我们的应用开始播放音频之前，它需要先请求音频焦点，然后再获取到音频焦点。另外，它还需要知道如何监听失去音频焦点的事件并对此做出合适的响应。

<!-- more -->

## 请求获取音频焦点(Request the Audio Focus)

在我们的应用开始播放音频之前，它需要获取将要使用的音频流的音频焦点。通过使用<a href="http://developer.android.com/reference/android/media/AudioManager.html#requestAudioFocus(android.media.AudioManager.OnAudioFocusChangeListener, int, int)">requestAudioFocus()</a> 方法可以获取我们希望得到的音频流焦点。如果请求成功，该方法会返回[AUDIOFOCUS_REQUEST_GRANTED](http://developer.android.com/reference/android/media/AudioManager.html#AUDIOFOCUS_REQUEST_GRANTED)。

另外我们必须指定正在使用的音频流，而且需要确定所请求的音频焦点是短暂的（Transient）还是永久的（Permanent）。

* 短暂的焦点锁定：当计划播放一个短暂的音频时使用（比如播放导航指示）。
* 永久的焦点锁定：当计划播放一个较长但时长可预期的音频时使用（比如播放音乐）。

下面的代码片段是一个在播放音乐时请求永久音频焦点的例子，我们必须在开始播放之前立即请求音频焦点，比如在用户点击播放或者游戏中下一关的背景音乐开始前。

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

一旦结束了播放，需要确保调用了<a href="http://developer.android.com/reference/android/media/AudioManager.html#abandonAudioFocus(android.media.AudioManager.OnAudioFocusChangeListener)">abandonAudioFocus()</a>方法。这样相当于告知系统我们不再需要获取焦点并且注销所关联的[AudioManager.OnAudioFocusChangeListener](http://developer.android.com/reference/android/media/AudioManager.OnAudioFocusChangeListener.html)监听器。对于另一种释放短暂音频焦点的情况，这会允许任何被我们打断的应用可以继续播放。

```java
// Abandon audio focus when playback complete    
am.abandonAudioFocus(afChangeListener);
```

当请求短暂音频焦点的时候，我们可以选择是否开启“Ducking”。通常情况下，一个应用在失去音频焦点时会立即关闭它的播放声音。如果我们选择在请求短暂音频焦点的时候开启了Ducking，那意味着其它应用可以继续播放，仅仅是在这一刻降低自己的音量，直到重新获取到音频焦点后恢复正常音量（译注：也就是说，不用理会这个短暂焦点的请求，这并不会打断目前正在播放的音频。比如在播放音乐的时候突然出现一个短暂的短信提示声音，此时仅仅是把歌曲的音量暂时调低，使得用户能够听到短信提示声，在此之后便立马恢复正常播放）。

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

Ducking对于那些间歇性使用音频焦点的应用来说特别合适，比如语音导航。

如果有另一个应用像上述那样请求音频焦点，它所请求的永久音频焦点或者短暂音频焦点（支持Ducking或不支持Ducking），都会被你在请求获取音频焦点时所注册的监听器接收到。

## 处理失去音频焦点(Handle the Loss of Audio Focus)

如果应用A请求获取了音频焦点，那么在应用B请求获取音频焦点的时候，A获取到的焦点就会失去。如何响应失去焦点事件，取决于失去焦点的方式。

在音频焦点的监听器里面，当接受到描述焦点改变的事件时会触发<a href="http://developer.android.com/reference/android/media/AudioManager.OnAudioFocusChangeListener.html#onAudioFocusChange(int)">onAudioFocusChange()</a>回调方法。如之前提到的，获取焦点有三种类型，我们同样会有三种失去焦点的类型：永久失去，短暂失去，允许Ducking的短暂失去。

* 失去短暂焦点：通常在失去短暂焦点的情况下，我们会暂停当前音频的播放或者降低音量，同时需要准备在重新获取到焦点之后恢复播放。

* 失去永久焦点：假设另外一个应用开始播放音乐，那么我们的应用就应该有效地将自己停止。在实际场景当中，这意味着停止播放，移除媒体按钮监听，允许新的音频播放器可以唯一地监听那些按钮事件，并且放弃自己的音频焦点。此时，如果想要恢复自己的音频播放，我们需要等待某种特定用户行为发生（例如按下了我们应用当中的播放按钮）。

在下面的代码片段当中，如果焦点的失去是短暂型的，我们将音频播放对象暂停，并在重新获取到焦点后进行恢复。如果是永久型的焦点失去事件，那么我们的媒体按钮监听器会被注销，并且不再监听音频焦点的改变。

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

在上面失去短暂焦点的例子中，如果允许Ducking，那么除了暂停当前的播放之外，我们还可以选择使用“Ducking”。

## Duck! 

在使用Ducking时，正常播放的歌曲会降低音量来凸显这个短暂的音频声音，这样既让这个短暂的声音比较突出，又不至于打断正常的声音。

下面的代码片段让我们的播放器在暂时失去音频焦点时降低音量，并在重新获得音频焦点之后恢复原来音量。

```java
OnAudioFocusChangeListener afChangeListener = new OnAudioFocusChangeListener() {
    public void onAudioFocusChange(int focusChange) {
        if (focusChange == AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
            // Lower the volume
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            // Raise it back to normal
        }
    }
};
```

音频焦点的失去是我们需要响应的最重要的事件广播之一，但除此之外还有很多其他重要的广播需要我们正确地做出响应。系统会广播一系列的Intent来向你告知用户在使用音频过程当中的各种变化。下节课会演示如何监听这些广播并提升用户的整体体验。
