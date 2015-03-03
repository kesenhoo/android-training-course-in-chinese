# 兼容音频输出设备

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/audio-output.html>

用户在播放音乐的时候有多个选择，可以使用内置的扬声器，有线耳机或者是支持A2DP的蓝牙耳机。
【补充：A2DP全名是Advanced Audio Distribution Profile 蓝牙音频传输模型协定! A2DP是能够采用耳机内的芯片来堆栈数据，达到声音的高清晰度。有A2DP的耳机就是蓝牙立体声耳机。声音能达到44.1kHz，一般的耳机只能达到8kHz。如果手机支持蓝牙，只要装载A2DP协议，就能使用A2DP耳机了。还有消费者看到技术参数提到蓝牙V1.0 V1.1 V1.2 V2.0 - 这些是指蓝牙的技术版本，是指通过蓝牙传输的速度，他们是否支持A2DP具体要看蓝牙产品制造商是否使用这个技术。来自[百度百科](http://baike.baidu.com/view/551149.htm)】

<!-- more -->

## 检测目前正在使用的硬件设备(Check What Hardware is Being Used)

选择的播放设备会影响App的行为。可以使用AudioManager来查询某个音频输出到扬声器，有线耳机还是蓝牙上。

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

当有线耳机被拔出或者蓝牙设备断开连接的时候，音频流会自动输出到内置的扬声器上。假设之前播放声音很大，这个时候突然转到扬声器播放会显得非常嘈杂。

幸运的是，系统会在那种事件发生时会广播带有ACTION_AUDIO_BECOMING_NOISY的intent。无论何时播放音频去注册一个BroadcastReceiver来监听这个intent会是比较好的做法。

在音乐播放器下，用户通常希望发生那样事情的时候能够暂停当前歌曲的播放。在游戏里，通常会选择减低音量。

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
