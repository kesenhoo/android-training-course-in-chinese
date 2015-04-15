# 管理音频播放

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/index.html>

如果我们的应用能够播放音频，那么让用户能够以自己预期的方式控制音频是很重要的。为了保证良好的用户体验，我们应该让应用能够管理当前的音频焦点，因为这样才能确保多个应用不会在同一时刻一起播放音频。

在学习本系列课程中，我们将会创建可以对音量按钮进行响应的应用，该应用会在播放音频的时候请求获取音频焦点，并且在当前音频焦点被系统或其他应用所改变的时候，做出正确的响应。

## Lessons

* [**控制音量与音频播放(Controlling Your App’s Volume and Playback)**](volume-playback.html)

  学习如何确保用户能通过硬件或软件音量控制器调节应用的音量（通常这些控制器上还具有播放、停止、暂停、跳过以及回放等功能按键）。


* [**管理音频焦点(Managing Audio Focus)**](audio-focus.html)

  由于可能会有多个应用具有播放音频的功能，考虑他们如何交互非常重要。为了防止多个音乐应用同时播放音频，Android使用音频焦点（Audio Focus）来控制音频的播放。在这节课中可以学习如何请求音频焦点，监听音频焦点的丢失，以及在这种情况发生时应该如何做出响应。


* [**兼容音频输出设备(Dealing with Audio Output Hardware)**](audio-output.html)

  音频有多种输出设备，在这节课中可以学习如何找出播放音频的设备，以及处理播放时耳机被拔出的情况。
