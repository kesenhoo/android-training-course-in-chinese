# 管理音频播放

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/managing-audio/index.html>

如果你的App在播放音频，显然用户能够以预期的方式来控制音频是很重要的。为了保证好的用户体验，同样App能够获取音频焦点是很重要的，这样才能确保不会在同一时刻出现多个App的声音。

在学习这个课程后，你将能够创建对硬件音量按钮进行响应的App，当按下音量按钮的时候需要获取到当前音频的焦点，然后以适当的方式改变音量从而进行响应用户的行为。

## Lessons

* [**控制音量与音频播放(Controlling Your App’s Volume and Playback)**](volume-playback.html)

  学习如何确保你的用户能通过硬件或者能同时实现播放,停止,暂停,跳过,回放按钮的软件来控制音量.


* [**管理音频焦点(Managing Audio Focus)**](audio-focus.html)

  由于有多个应用可能播放音频,考虑他们应该如何交互非常重要.为了防止多个音乐app同时播放音频,Android使用音频焦点(audio focus)来控制音频的播放.学习如何请求audio focus,监听音频焦点的丢失以及在这种情况发生时如何做出回应.


* [**兼容音频输出设备(Dealing with Audio Output Hardware)**](audio-output.html)

  音频有多种输出设备,学习如何找出播放音频的设备以及处理播放时耳机被拔出的情况.
