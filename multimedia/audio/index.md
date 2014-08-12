# 管理音频播放

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/index.html>

如果你的App在播放音频，显然用户能够以预期的方式来控制音频是很重要的。为了保证好的用户体验，同样App能够获取音频焦点是很重要的，这样才能确保不会在同一时刻出现多个App的声音。

在学习这个课程后，你将能够创建对硬件音量按钮进行响应的App，当按下音量按钮的时候需要获取到当前音频的焦点，然后以适当的方式改变音量从而进行响应用户的行为。

## Lessons

* [**控制音量与音频播放 - Controlling Your App’s Volume and Playback**](volume-playback.html)

  Learn how to ensure your users can control the volume of your app using the hardware or software volume controls and where available the play, stop, pause, skip, and previous media playback keys.


* [**管理音频焦点 - Managing Audio Focus**](audio-focus.html)

  With multiple apps potentially playing audio it's important to think about how they should interact. To avoid every music app playing at the same time, Android uses audio focus to moderate audio playback. Learn how to request the audio focus, listen for a loss of audio focus, and how to respond when that happens.


* [**兼容音频输出设备 - Dealing with Audio Output Hardware**](audio-output.html)

  Audio can be played from a number of sources. Learn how to find out where the audio is being played and how to handle a headset being disconnected during playback.
