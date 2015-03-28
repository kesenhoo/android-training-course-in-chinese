<!-- # Recommending TV Content # -->
# TV上的推荐内容

> 编写:[awong1900](https://github.com/awong1900) - 原文:http://developer.android.com/training/tv/discovery/recommendations.html

<!--When interacting with TVs, users generally prefer to give minimal input before watching content. An ideal scenario for many TV users is: sit down, turn on, and watch. The fewest steps to get users to content they enjoy is generally the path they prefer.-->

当操作TV时，用户通常喜欢使用最少的输入操作来看内容。许多用户的理想场景是，坐下，打开TV然后观看。最少的步骤去获得用户去观看他们的喜欢的内容通常的路径。

<!--The Android framework assists with minimum-input interaction by providing a recommendations row on the home screen. Content recommendations appear as the first row of the TV home screen after the first use of the device. Contributing recommendations from your app's content catalog can help bring users back to your app.-->

安卓framework促进最小的交互去提供主屏幕推荐栏。内容推荐出现在TV主屏幕的第一栏在设备第一次使用时候。贡献建议从你的应用程序的内容目录可以帮助用户回到应用程序。

![home-recommendations](home-recommendations.png)
<!--Figure 1. An example of the recommendations row.-->
图1. 一个推荐栏的例子

<!--This lesson teaches you how to create recommendations and provide them to the Android framework so users can easily discover and enjoy your app content. This discussion describes some code from the Android Leanback sample app.-->

这节课教你怎样去创建推荐和提供他们到安卓framework这样用户能容易的发现和使用你的应用内容。这个讨论描述了一些代码从[安卓Leanback示例代码](https://github.com/googlesamples/androidtv-Leanback)。

<!--## Create a Recommendations Service ##-->
## 创建推荐服务

<!--Content recommendations are created with background processing. In order for your application to contribute to recommendations, create a service that periodically adds listings from your app's catalog to the system's list of recommendations.-->

内容推荐是被后台处理创建。为了你的应用去贡献推荐，创建一个周期性添加列表从应用目录到系统推荐列表的服务。

<!--The following code example illustrates how to extend IntentService to create a recommendation service for your application:-->

接下来的胆码描绘了如何扩展[IntentService](http://developer.android.com/reference/android/app/IntentService.html)到创建推荐服务为应用。

```java
public class UpdateRecommendationsService extends IntentService {
    private static final String TAG = "UpdateRecommendationsService";
    private static final int MAX_RECOMMENDATIONS = 3;

    public UpdateRecommendationsService() {
        super("RecommendationService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        Log.d(TAG, "Updating recommendation cards");
        HashMap<String, List<Movie>> recommendations = VideoProvider.getMovieList();
        if (recommendations == null) return;

        int count = 0;

        try {
            RecommendationBuilder builder = new RecommendationBuilder()
                    .setContext(getApplicationContext())
                    .setSmallIcon(R.drawable.videos_by_google_icon);

            for (Map.Entry<String, List<Movie>> entry : recommendations.entrySet()) {
                for (Movie movie : entry.getValue()) {
                    Log.d(TAG, "Recommendation - " + movie.getTitle());

                    builder.setBackground(movie.getCardImageUrl())
                            .setId(count + 1)
                            .setPriority(MAX_RECOMMENDATIONS - count)
                            .setTitle(movie.getTitle())
                            .setDescription(getString(R.string.popular_header))
                            .setImage(movie.getCardImageUrl())
                            .setIntent(buildPendingIntent(movie))
                            .build();

                    if (++count >= MAX_RECOMMENDATIONS) {
                        break;
                    }
                }
                if (++count >= MAX_RECOMMENDATIONS) {
                    break;
                }
            }
        } catch (IOException e) {
            Log.e(TAG, "Unable to update recommendation", e);
        }
    }

    private PendingIntent buildPendingIntent(Movie movie) {
        Intent detailsIntent = new Intent(this, DetailsActivity.class);
        detailsIntent.putExtra("Movie", movie);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
        stackBuilder.addParentStack(DetailsActivity.class);
        stackBuilder.addNextIntent(detailsIntent);
        // Ensure a unique PendingIntents, otherwise all recommendations end up with the same
        // PendingIntent
        detailsIntent.setAction(Long.toString(movie.getId()));

        PendingIntent intent = stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);
        return intent;
    }
}
```

<!--In order for this service to be recognized by the system and run, register it using your app manifest. The following code snippet illustrates how to declare this class as a service:-->

为了这个服务被系统意识到和运行，注册它在应用manifest中，接下来的代码片段展示了如何定义这个类作为服务：

```xml
<manifest ... >
  <application ... >
    ...

    <service
            android:name="com.example.android.tvleanback.UpdateRecommendationsService"
            android:enabled="true" />
  </application>
</manifest>
```

<!--### Refreshing Recommendations ###-->
### 更新推荐

<!--Base your recommendations on user behavior and data such as play lists, wish lists, and associated content. When refreshing recommendations, don't just remove and repost them, because doing so causes the recommendations to appear at the end of the recommendations row. Once a content item, such as a movie, has been played, remove it from the recommendations.-->

基于推荐给用户的行为和数据例如播放列表，喜爱列表和相关内容。当刷新推荐时，不仅删除和重新加载他们，因为这样导致推荐去出现在推荐栏的结尾。一旦一个内容项，如一个影片，被播放，[删除它](http://developer.android.com/guide/topics/ui/notifiers/notifications.html#Removing)从推荐。

<!--The order of an app's recommendations is preserved according to the order in which the app provides them. The framework interleaves app recommendations based on recommendation quality, as measured by user behavior. Better recommendations make an app's recommendations more likely to appear near the front of the list.-->

为了应用的推荐被保存依据哪个应用提供他们。framework interleave应用推荐基于推荐质量，用户习惯的测量。最好的推荐使应用的推荐更像出现在列表前面。

<!--## Build Recommendations ##-->
## 创建推荐

<!--Once your recommendation service starts running, it must create recommendations and pass them to the Android framework. The framework receives the recommendations as Notification objects that use a specific template and are marked with a specific category.-->

一旦你的推荐服务开始运行，它必须创建推荐和通过他们到安卓framework。Framework收到推荐作为[通知](http://developer.android.com/reference/android/app/Notification.html)到用户特定的模板并且显著的定义一个目录。

<!--### Setting the Values ###-->
### 设置值

<!--To set the UI element values for the recommendation card, you create a builder class that follows the builder pattern described as follows. First, you set the values of the recommendation card elements.-->

去设置UI元素值推荐卡，你创建一个builder类接下来的builder描述如下。首先，你设置推荐卡片元素的值。

```java
public class RecommendationBuilder {
    ...

    public RecommendationBuilder setTitle(String title) {
            mTitle = title;
            return this;
        }

        public RecommendationBuilder setDescription(String description) {
            mDescription = description;
            return this;
        }

        public RecommendationBuilder setImage(String uri) {
            mImageUri = uri;
            return this;
        }

        public RecommendationBuilder setBackground(String uri) {
            mBackgroundUri = uri;
            return this;
        }
...
```

<!--### Creating the Notification ###-->
### 创建通知

<!--Once you've set the values, you then build the notification, assigning the values from the builder class to the notification, and calling NotificationCompat.Builder.build().-->

一旦你设置了值，你然后去创建通知，促进[builder类到通知的值，并且调用NotificationCompat.Builder.build](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#build())。

<!--Also, be sure to call setLocalOnly() so the NotificationCompat.BigPictureStyle notification won't show up on other devices.-->

并且，确信调用[setLocalOnly()](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.Builder.html#setLocalOnly(boolean))这样[NotificationCompat.BigPictureStyle](http://developer.android.com/reference/android/support/v4/app/NotificationCompat.BigPictureStyle.html))通知不讲展现在另一个设备。

<!--The following code example demonstrates how to build a recommendation.-->
接下来的代码示例展示了如何创建推荐。

```java
public class RecommendationBuilder {
    ...

    public Notification build() throws IOException {
        ...

        Notification notification = new NotificationCompat.BigPictureStyle(
                new NotificationCompat.Builder(mContext)
                        .setContentTitle(mTitle)
                        .setContentText(mDescription)
                        .setPriority(mPriority)
                        .setLocalOnly(true)
                        .setOngoing(true)
                        .setColor(mContext.getResources().getColor(R.color.fastlane_background))
                        .setCategory(Notification.CATEGORY_RECOMMENDATION)
                        .setLargeIcon(image)
                        .setSmallIcon(mSmallIcon)
                        .setContentIntent(mIntent)
                        .setExtras(extras))
                .build();

        return notification;
    }
}
```

<!--## Run Recommendations Service ##-->
## 运行推荐服务

<!--Your app's recommendation service must run periodically in order to create current recommendations. To run your service, create a class that runs a timer and invokes it at regular intervals. The following code example extends the BroadcastReceiver class to start periodic execution of a recommendation service every half hour:-->
你的应用推荐服务必须周期性运行，为了创建当前推荐。去运行你的服务，创建类去运行计时器和关联它在每个一段时间。接下来的代码例子扩展了[BroadcastReceiver](http://developer.android.com/reference/android/content/BroadcastReceiver.html)类去开始周期的执行推荐服务没半小时：

```java
public class BootupActivity extends BroadcastReceiver {
    private static final String TAG = "BootupActivity";

    private static final long INITIAL_DELAY = 5000;

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "BootupActivity initiated");
        if (intent.getAction().endsWith(Intent.ACTION_BOOT_COMPLETED)) {
            scheduleRecommendationUpdate(context);
        }
    }

    private void scheduleRecommendationUpdate(Context context) {
        Log.d(TAG, "Scheduling recommendations update");

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent recommendationIntent = new Intent(context, UpdateRecommendationsService.class);
        PendingIntent alarmIntent = PendingIntent.getService(context, 0, recommendationIntent, 0);

        alarmManager.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                INITIAL_DELAY,
                AlarmManager.INTERVAL_HALF_HOUR,
                alarmIntent);
    }
}
```

<!--This implementation of the BroadcastReceiver class must run after start up of the TV device where it is installed. To accomplish this, register this class in your app manifest with an intent filter that listens for the completion of the device boot process. The following sample code demonstrates how to add this configuration to the manifest:-->

这个[广播接收器](http://developer.android.com/reference/android/content/BroadcastReceiver.html)类的实现必须运行在TV设备开始后他是被安装的。 去完成这个，注册这个类在应用manifest的intet filter的监听完成设备启动后。接下来的代码展示了如何添加这个配置到manifest。

```xml
<manifest ... >
  <application ... >
    <receiver android:name="com.example.android.tvleanback.BootupActivity"
              android:enabled="true"
              android:exported="false">
      <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED"/>
      </intent-filter>
    </receiver>
  </application>
</manifest>
```

<!-- >**Important**: Receiving a boot completed notification requires that your app requests the RECEIVE_BOOT_COMPLETED permission. For more information, see ACTION_BOOT_COMPLETED.-->
>**Important**： 接收一个启动完成通知需要你的应用有[RECEIVE_BOOT_COMPLETED](http://developer.android.com/reference/android/Manifest.permission.html#RECEIVE_BOOT_COMPLETED)权限。更多信息，[查看ACTION_BOOT_COMPLETED](http://developer.android.com/reference/android/content/Intent.html#ACTION_BOOT_COMPLETED)。

<!--In your recommendation service class' onHandleIntent() method, post the recommendation to the manager as follows:-->
在推荐服务类的[onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent))方法，3提交推荐到管理器如下：

```java
Notification notification = notificationBuilder.build();
mNotificationManager.notify(id, notification);
```

-------
[下一节: 使TV应用可搜索](searchable.html)
