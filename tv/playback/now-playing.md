# 显示正在播放卡片

> 编写:[huanglizhuo](https://github.com/huanglizhuo) - 原文:<http://developer.android.com/training/tv/playback/now-playing.html>

TV应用允许用户在使用其他应用时后台播放音乐或其他媒体。如果我们的应用程序允许后台，它必须要为用户提供返回该应用暂停音乐或切换到一个新的歌曲的方法。 Android框架允许TV应用通过在主屏幕上显示正在播放卡做到这一点。

正在播放卡片是系统的组建,它可以在推荐的行上显示正在播放的媒体会话它包括了媒体元数据，如专辑封面，标题和应用程序图标。当用户选择它，系统将打开拥有该会话的应用程序。

这节课将演示如何使用[ MediaSession ](http://developer.android.com/reference/android/media/session/MediaSession.html) 类实现正在播放卡片。

##开启媒体会话

一个播放应用可以作为[ activity ](http://developer.android.com/guide/components/activities) 或者[ service ](http://developer.android.com/guide/components/services/index.html)运行。[ service ](http://developer.android.com/guide/components/services/index.html)是当[ activity ](http://developer.android.com/guide/components/activities) 结束时依然可以后台播放的。在这节讨论中,媒体播放应用是假设在[ MediaBrowserService ](http://developer.android.com/reference/android/service/media/MediaBrowserService.html)下运行的。

在service的[onCreate()](http://developer.android.com/reference/android/service/media/MediaBrowserService.html#onCreate())方法中创建一个新的[ MediaSession ](http://developer.android.com/reference/android/media/session/MediaSession.html#MediaSession(android.content.Context, java.lang.String)),设置适当的回调函数和标志,并设置 [MediaBrowserService](http://developer.android.com/reference/android/service/media/MediaBrowserService.html) 令牌。

```xml
mSession = new MediaSession(this, "MusicService");
mSession.setCallback(new MediaSessionCallback());
mSession.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS |
        MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);

// for the MediaBrowserService
setSessionToken(mSession.getSessionToken());
```

> **注意:**正在播放卡片只有在媒体会话设置了[FLAG_HANDLES_TRANSPORT_CONTROLS](http://developer.android.com/reference/android/media/session/MediaSession.html#FLAG_HANDLES_TRANSPORT_CONTROLS)标志时在可以显示。

##显示正在播放卡片

如果会话是系统最高优先级的会话那么正在播放卡片将在[setActivity(true)](http://developer.android.com/reference/android/media/session/MediaSession.html#setActive(boolean))调用后显示。同时我们的应用必须像在[Managing Audio Focus](http://developer.android.com/training/managing-audio/audio-focus/index.html)一节中那样请求音频焦点。

```xml
private void handlePlayRequest() {

    tryToGetAudioFocus();

    if (!mSession.isActive()) {
        mSession.setActive(true);
    }
...
```

如果另一个应用发起媒体播放请求并调用[setActivity(false)](http://developer.android.com/reference/android/media/session/MediaSession.html#setActive(boolean))后这个卡片将从主屏上移除。

##更新播放状态

正如任何媒体的应用程序，在[ MediaSession ](http://developer.android.com/reference/android/media/session/MediaSession.html)中更新播放状态，使卡片可以显示当前的元数据，如在下面的例子：

```xml
private void updatePlaybackState() {
    long position = PlaybackState.PLAYBACK_POSITION_UNKNOWN;
    if (mMediaPlayer != null && mMediaPlayer.isPlaying()) {
        position = mMediaPlayer.getCurrentPosition();
    }
    PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
            .setActions(getAvailableActions());
    stateBuilder.setState(mState, position, 1.0f);
    mSession.setPlaybackState(stateBuilder.build());
}
private long getAvailableActions() {
    long actions = PlaybackState.ACTION_PLAY |
            PlaybackState.ACTION_PLAY_FROM_MEDIA_ID |
            PlaybackState.ACTION_PLAY_FROM_SEARCH;
    if (mPlayingQueue == null || mPlayingQueue.isEmpty()) {
        return actions;
    }
    if (mState == PlaybackState.STATE_PLAYING) {
        actions |= PlaybackState.ACTION_PAUSE;
    }
    if (mCurrentIndexOnQueue > 0) {
        actions |= PlaybackState.ACTION_SKIP_TO_PREVIOUS;
    }
    if (mCurrentIndexOnQueue < mPlayingQueue.size() - 1) {
        actions |= PlaybackState.ACTION_SKIP_TO_NEXT;
    }
    return actions;
}
```

##显示媒体元数据

为当前正在播放通过[setMetadata()](http://developer.android.com/reference/android/media/session/MediaSession.html#setMetadata(android.media.MediaMetadata))方法设置[  MediaMetadata ](http://developer.android.com/reference/android/media/MediaMetadata.html)。.这个方法可以让我们为正在播放卡提供有关轨道，如标题，副标题，和各种图标等信息。下面的例子假设我们的播放数据存储在自定义的MediaData类中。

```xml
private void updateMetadata(MediaData myData) {
    MediaMetadata.Builder metadataBuilder = new MediaMetadata.Builder();
    // To provide most control over how an item is displayed set the
    // display fields in the metadata
    metadataBuilder.putString(MediaMetadata.METADATA_KEY_DISPLAY_TITLE,
            myData.displayTitle);
    metadataBuilder.putString(MediaMetadata.METADATA_KEY_DISPLAY_SUBTITLE,
            myData.displaySubtitle);
    metadataBuilder.putString(MediaMetadata.METADATA_KEY_DISPLAY_ICON_URI,
            myData.artUri);
    // And at minimum the title and artist for legacy support
    metadataBuilder.putString(MediaMetadata.METADATA_KEY_TITLE,
            myData.title);
    metadataBuilder.putString(MediaMetadata.METADATA_KEY_ARTIST,
            myData.artist);
    // A small bitmap for the artwork is also recommended
    metadataBuilder.putString(MediaMetadata.METADATA_KEY_ART,
            myData.artBitmap);
    // Add any other fields you have for your data as well
    mSession.setMetadata(metadataBuilder.build());
}
```

##响应用户的动作

当用户选择正在播放卡片时,系统打开应用并拥有会话。如果我们的应用在[setSessionActivity()](http://developer.android.com/reference/android/media/session/MediaSession.html#setSessionActivity(android.app.PendingIntent))有[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)要传递,系统将会像下面演示的那样开启activity。如果不是，则系统默认的Intent打开。您指定的活动必须提供播放控制，允许用户暂停或停止播放。

```xml
Intent intent = new Intent(mContext, MyActivity.class);
    PendingIntent pi = PendingIntent.getActivity(context, 99 /*request code*/,
            intent, PendingIntent.FLAG_UPDATE_CURRENT);
    mSession.setSessionActivity(pi);
```