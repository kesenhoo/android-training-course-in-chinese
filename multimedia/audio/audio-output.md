# 兼容音频输出设备

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/audio-output.html>

当用户想要通过Android设备欣赏音乐的时候，他可以有多种选择，大多数设备拥有内置的扬声器，有线耳机，也有其它很多设备支持蓝牙连接，有些甚至还支持A2DP蓝牙音频传输模型协定。（译注：A2DP全名是Advanced Audio Distribution Profile 蓝牙音频传输模型协定! A2DP是能够采用耳机内的芯片来堆栈数据，达到声音的高清晰度。有A2DP的耳机就是蓝牙立体声耳机。声音能达到44.1kHz，一般的耳机只能达到8kHz。如果手机支持蓝牙，只要装载A2DP协议，就能使用A2DP耳机了。还有消费者看到技术参数提到蓝牙V1.0 V1.1 V1.2 V2.0 - 这些是指蓝牙的技术版本，是指通过蓝牙传输的速度，他们是否支持A2DP具体要看蓝牙产品制造商是否使用这个技术。来自[百度百科](http://baike.baidu.com/view/551149.htm)）

<!-- more -->

## 检测目前正在使用的硬件设备(Check What Hardware is Being Used)

使用不同的硬件播放声音会影响到应用的行为。可以使用[AudioManager](http://developer.android.com/reference/android/media/AudioManager.html)来查询当前音频是输出到扬声器，有线耳机还是蓝牙上，如下所示：

```java
if (isBluetoothA2dpOn()) {
    // Adjust output for Bluetooth.
} else if (isSpeakerphoneOn()) {
    // Adjust output for Speakerphone.
} else if (isWiredHeadsetOn()) {
    // Adjust output for headsets
} else { 
    // If audio plays and noone can hear it, is it still playing?
}
```

## 处理音频输出设备的改变(Handle Changes in the Audio Output Hardware)

当有线耳机被拔出或者蓝牙设备断开连接的时候，音频流会自动输出到内置的扬声器上。假设播放声音很大，这个时候突然转到扬声器播放会显得非常嘈杂。

幸运的是，系统会在这种情况下广播带有[ACTION_AUDIO_BECOMING_NOISY](http://developer.android.com/reference/android/media/AudioManager.html#ACTION_AUDIO_BECOMING_NOISY)的Intent。无论何时播放音频，我们都应该注册一个[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)来监听这个Intent。在使用音乐播放器时，用户通常会希望此时能够暂停当前歌曲的播放。而在游戏当中，用户通常会希望可以减低音量。

```java
private class NoisyAudioStreamReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
            // Pause the playback
        }
    }
}

private IntentFilter intentFilter = new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY);

private void startPlayback() {
    registerReceiver(myNoisyAudioStreamReceiver(), intentFilter);
}

private void stopPlayback() {
    unregisterReceiver(myNoisyAudioStreamReceiver);
}
```
