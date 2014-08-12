# 识别用户的当下活动

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

活动识别会去探测用户当前的身体活动，比如步行，驾驶以及站立。通过一个不同于请求位置更新或者地理围栏的活动识别client来请求用户活动更新，但是请求方式是类似的。根据你设置的更新频率，Location Services会返回包含一个或者多个活动以及它们出现对应的概率的反馈信息。这一课将会向你展示如何从Location Services请求活动识别更新。

## 请求活动识别更新

从Location Services请求活动识别更新的过程与请求周期性的位置更新类似。你通过一个client发送请求，接着Location Services 以 [PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)的形式将更新数据返回。然而，你在开始之前必须设置好对应的权限。下面的课程将会教你如何设置权限，连接client以及请求更新。

### 设置接收更新数据的权限

一个应用想要获得活动识别数据就必须拥有```com.google.android.gms.permission.ACTIVITY_RECOGNITION```权限。为了让你的应用有这个权限，在你的manifest文件里面将如下代码放到```<manifest>```标签的里面。
```java
<uses-permission
    android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION"/>
```
活动识别不需要[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION)权限和 [ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)权限。

### 检查Google Play Services是否可用
位置服务是Google Play services 中的一部分。由于很难预料用户设备的状态，所以你在尝试连接位置服务之前应该要检测你的设备是否安装了Google Play services安装包。为了检测这个安装包是否被安装，你可以调用[GooglePlayServicesUtil.isGooglePlayServicesAvailable()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesUtil.html#isGooglePlayServicesAvailable(android.content.Context)，这个方法将会返回一个结果代码。你可以通过查询[ConnectionResult](http://developer.android.com/reference/com/google/android/gms/common/ConnectionResult.html)的参考文档中结果代码列表来理解对应的结果代码。如果你碰到了错误，你可以调用[GooglePlayServicesUtil.getErrorDialog()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesUtil.html#getErrorDialog(int, android.app.Activity, int))获取本地化的对话框来提示用户采取适当地行为，接着你需要将这个对话框置于一个[DialogFragment](http://developer.android.com/reference/android/support/v4/app/DialogFragment.html)中显示。这个对话框可以让用户去纠正这个问题，这个时候Google Services可以将结果返回给你的activity。为了处理这个结果，重写[onActivityResult()](http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent))即可。

> **注意:** 为了让你的应用能够兼容 Android 1.6 之后的版本，用来显示DialogFragment的必须是FragmentActivity而不是之前的Activity。使用FragmentActivity同样可以调用 getSupportFragmentManager() 方法来显示 DialogFragment。

因为你的代码里通常会不止一次地检测Google Play services是否安装, 为了方便，可以定义一个方法来封装这种检测行为。下面的代码片段包含了所有检测Google Play services是否安装需要用到的代码：
```java
public class MainActivity extends FragmentActivity {
    ...
    //全局变量
    /*
     * 定义一个发送给Google Play services的请求代码
     * 这个代码将会在Activity.onActivityResult的方法中返回
     */
    private final static int
            CONNECTION_FAILURE_RESOLUTION_REQUEST = 9000;
    ...
    // 定义一个显示错误对话框的DialogFragment
    public static class ErrorDialogFragment extends DialogFragment {
        // 表示错误对话框的全局属性
        private Dialog mDialog;
        // 默认的构造函数，将 dialog 属性设为空
        public ErrorDialogFragment() {
            super();
            mDialog = null;
        }
        // 设置要显示的dialog
        public void setDialog(Dialog dialog) {
            mDialog = dialog;
        }
        // 返回一个 Dialog 给 DialogFragment.
        @Override
        public Dialog onCreateDialog(Bundle savedInstanceState) {
            return mDialog;
        }
    }
    ...
    /*
     * 处理来自Google Play services 发给FragmentActivity的结果
     *
     */
    @Override
    protected void onActivityResult(
            int requestCode, int resultCode, Intent data) {
        // 根据请求代码来决定做什么
        switch (requestCode) {
            ...
            case CONNECTION_FAILURE_RESOLUTION_REQUEST :
            /*
             * 如果结果代码是 Activity.RESULT_OK, 尝试重新连接
             *
             */
                switch (resultCode) {
                    case Activity.RESULT_OK :
                    /*
                     * 尝试重新请求
                     */
                    ...
                    break;
                }
            ...
        }
     }
    ...
    private boolean servicesConnected() {
        // 检测Google Play services 是否可用
        int resultCode =
                GooglePlayServicesUtil.
                        isGooglePlayServicesAvailable(this);
        // 如果 Google Play services 可用
        if (ConnectionResult.SUCCESS == resultCode) {
            // 在 debug 模式下, 记录程序日志
            Log.d("Location Updates",
                    "Google Play services is available.");
            // Continue
            return true;
        // 因为某些原因Google Play services 不可用
        } else {
            // 获取error code
            int errorCode = connectionResult.getErrorCode();
            // 从Google Play services 获取 error dialog
            Dialog errorDialog = GooglePlayServicesUtil.getErrorDialog(
                    errorCode,
                    this,
                    CONNECTION_FAILURE_RESOLUTION_REQUEST);

            // 如果 Google Play services可以提供一个error dialog
            if (errorDialog != null) {
                // 为这个error dialog 创建一个新的DialogFragment
                ErrorDialogFragment errorFragment =
                        new ErrorDialogFragment();
                // 在DialogFragment中设置dialog
                errorFragment.setDialog(errorDialog);
                // 在DialogFragment中显示error dialog
                errorFragment.show(getSupportFragmentManager(),
                        "Geofence Detection");
            }
        }
    }
    ...
}
```

下面的代码片段使用了这个方法来检查Google Play services是否可用。

### 发送活动更新数据请求

一般的更新数据请求都是从一个实现了Location Services回调函数的[Activity](http://developer.android.com/reference/android/app/Activity.html) 或者[Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)发出来的。生成这个请求的过程是一个异步过程，它是在你请求到活动识别client的连接的时候开始的。当这个client连接上的时候，Location Services对调用你对[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)方法的实现。在这个方法里面，你可以发送更新数据的请求到Location Services；这个请求是异步的。一旦你生成这个请求，你就可以断开client的连接了。

这个过程会在下面的代码里面描述。

### 定义 Activity 和 Fragment

定义一个实现如下接口的[FragmentActivity](http://developer .android.com/reference/android/support/v4/app/FragmentActivity.html) 或者[Fragment](http://developer.android.com/reference/android/support/v4/app/Fragment.html)：

[ConnectionCallbacks](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html)

* 实现当client连接上或者断开连接时Location Services 调用的方法。

[OnConnectionFailedListener](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.OnConnectionFailedListener.html)

* 实现当client连接出现错误时Location Services 调用的方法。

例如：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
}
```

接下来，定义全局变量。为更新频率定义一个常量，为活动识别client 定义一个变量，为Location Services用来发送更新的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)添加一个变量：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    // Constants that define the activity detection interval
    public static final int MILLISECONDS_PER_SECOND = 1000;
    public static final int DETECTION_INTERVAL_SECONDS = 20;
    public static final int DETECTION_INTERVAL_MILLISECONDS =
            MILLISECONDS_PER_SECOND * DETECTION_INTERVAL_SECONDS;
    ...
    /*
     * Store the PendingIntent used to send activity recognition events
     * back to the app
     */
    private PendingIntent mActivityRecognitionPendingIntent;
    // Store the current activity recognition client
    private ActivityRecognitionClient mActivityRecognitionClient;
    ...
}
```

在 [onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))方法里面，为活动识别client和[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)赋值：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    @Override
    onCreate(Bundle savedInstanceState) {
        ...
        /*
         * Instantiate a new activity recognition client. Since the
         * parent Activity implements the connection listener and
         * connection failure listener, the constructor uses "this"
         * to specify the values of those parameters.
         */
        mActivityRecognitionClient =
                new ActivityRecognitionClient(mContext, this, this);
        /*
         * Create the PendingIntent that Location Services uses
         * to send activity recognition updates back to this app.
         */
        Intent intent = new Intent(
                mContext, ActivityRecognitionIntentService.class);
        /*
         * Return a PendingIntent that starts the IntentService.
         */
        mActivityRecognitionPendingIntent =
                PendingIntent.getService(mContext, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT);
        ...
    }
    ...
}
```

### 开启请求进程

定义一个请求活动识别更新的方法。在这个方法里面，请求到Location Services的连接。你可以在activity的任何地方调用这个方法；这个方法是用来开启请求更新数据的方法链。


为了避免在你的第一个请求结束之前开启第二个请求时出现竞争的情况，你可以定义一个boolean标志位来记录当前请求的状态。在开始请求的时候设置标志位值为```true``` ，在请求结束的时候设置标志位为```false``` 。

下面的代码展示了如何开始一个更新请求：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    // Global constants
    ...
    // Flag that indicates if a request is underway.
    private boolean mInProgress;
    ...
    @Override
    onCreate(Bundle savedInstanceState) {
        ...
        // Start with the request flag set to false
        mInProgress = false;
        ...
    }
    ...
    /**
     * Request activity recognition updates based on the current
     * detection interval.
     *
     */
     public void startUpdates() {
        // Check for Google Play services

        if (!servicesConnected()) {
            return;
        }
        // If a request is not already underway
        if (!mInProgress) {
            // Indicate that a request is in progress
            mInProgress = true;
            // Request a connection to Location Services
            mActivityRecognitionClient.connect();
        //
        } else {
            /*
             * A request is already underway. You can handle
             * this situation by disconnecting the client,
             * re-setting the flag, and then re-trying the
             * request.
             */
        }
    }
    ...
}
```

下面就实现了[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)方法。在这个方法里面，从Location Services请求活动识别更新。当Location Services 结束对client的连接过程然后调用[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)方法时，这个更新请求就会直接被调用：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    /*
     * Called by Location Services once the location client is connected.
     *
     * Continue by requesting activity updates.
     */
    @Override
    public void onConnected(Bundle dataBundle) {
        /*
         * Request activity recognition updates using the preset
         * detection interval and PendingIntent. This call is
         * synchronous.
         */
        mActivityRecognitionClient.requestActivityUpdates(
                DETECTION_INTERVAL_MILLISECONDS,
                mActivityRecognitionPendingIntent);
        /*
         * Since the preceding call is synchronous, turn off the
         * in progress flag and disconnect the client
         */
        mInProgress = false;
        mActivityRecognitionClient.disconnect();
    }
    ...
}
```

### 处理断开连接

在某些情况下，Location Services可能会在你调用[disconnect()](http://developer.android.com/reference/com/google/android/gms/location/ActivityRecognitionClient.html#disconnect())方法之前断开与活动识别client的连接。为了处理这种情况，实现[onDisconnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onDisconnected())方法即可。在这个方法里面，设置请求标志位来表示这个请求是否有效，并根据这个标志位来删除client：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    /*
     * Called by Location Services once the activity recognition
     * client is disconnected.
     */
    @Override
    public void onDisconnected() {
        // Turn off the request flag
        mInProgress = false;
        // Delete the client
        mActivityRecognitionClient = null;
    }
    ...
}
```

### 处理连接错误

在处理正常的回调函数之外，你还得提供一个回调函数来处理连接出现错误的情况。这个回调函数重用了前面在检查Google Play service的时候用到的DialogFragment类。它还可以重用之前在onActivityResult()方法里用来接收当用户和错误对话框交互时产生的结果用到的代码。下面的代码展示了如何实现回调函数：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    // Implementation of OnConnectionFailedListener.onConnectionFailed
    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        // Turn off the request flag
        mInProgress = false;
        /*
         * If the error has a resolution, start a Google Play services
         * activity to resolve it.
         */
        if (connectionResult.hasResolution()) {
            try {
                connectionResult.startResolutionForResult(
                        this,
                        CONNECTION_FAILURE_RESOLUTION_REQUEST);
            } catch (SendIntentException e) {
                // Log the error
                e.printStackTrace();
            }
        // If no resolution is available, display an error dialog
        } else {
            // Get the error code
            int errorCode = connectionResult.getErrorCode();
            // Get the error dialog from Google Play services
            Dialog errorDialog = GooglePlayServicesUtil.getErrorDialog(
                    errorCode,
                    this,
                    CONNECTION_FAILURE_RESOLUTION_REQUEST);
            // If Google Play services can provide an error dialog
            if (errorDialog != null) {
                // Create a new DialogFragment for the error dialog
                ErrorDialogFragment errorFragment =
                        new ErrorDialogFragment();
                // Set the dialog in the DialogFragment
                errorFragment.setDialog(errorDialog);
                // Show the error dialog in the DialogFragment
                errorFragment.show(
                        getSupportFragmentManager(),
                        "Activity Recognition");
            }
        }
    }
    ...
}
```

## 处理活动更新数据

为了处理Location Services每一个周期发送的[Intent](http://developer.android.com/reference/android/content/Intent.html)，你可以定义一个[IntentService](http://developer.android.com/reference/android/app/IntentService.html)以及它的[onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent)方法。 Location Services以[Intent](http://developer.android.com/reference/android/content/Intent.html)对象的形式返回活动识别更新数据，并使用了你在调用[requestActivityUpdates()](http://developer.android.com/reference/com/google/android/gms/location/ActivityRecognitionClient.html#requestActivityUpdates(long, android.app.PendingIntent))方法时产生的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html) 。因为你为这个[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)提供了一个单独的intent，那么接收这个intent的唯一组件就是[IntentService](http://developer.android.com/reference/android/app/IntentService.html)了。

下面的代码展示了如何来检查活动识别更新数据。

### 定义一个IntentService

首先定义这个类以及它的[onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent)方法：

```java
/**
 * Service that receives ActivityRecognition updates. It receives
 * updates in the background, even if the main Activity is not visible.
 */
public class ActivityRecognitionIntentService extends IntentService {
    ...
    /**
     * Called when a new activity detection update is available.
     */
    @Override
    protected void onHandleIntent(Intent intent) {
        ...
    }
    ...
}
```


接下啦，在intent里面检查数据。你可以从这个数据里面获取到所有可能的活动列表以及它们对应的概率。下面的代码展示了如何获取可能性最大的活动，活动对应的概率以及它的类型：

```java
public class ActivityRecognitionIntentService extends IntentService {
    ...
    @Override
    protected void onHandleIntent(Intent intent) {
        ...
        // If the incoming intent contains an update
        if (ActivityRecognitionResult.hasResult(intent)) {
            // Get the update
            ActivityRecognitionResult result =
                    ActivityRecognitionResult.extractResult(intent);
            // Get the most probable activity
            DetectedActivity mostProbableActivity =
                    result.getMostProbableActivity();
            /*
             * Get the probability that this activity is the
             * the user's actual activity
             */
            int confidence = mostProbableActivity.getConfidence();
            /*
             * Get an integer describing the type of activity
             */
            int activityType = mostProbableActivity.getType();
            String activityName = getNameFromType(activityType);
            /*
             * At this point, you have retrieved all the information
             * for the current update. You can display this
             * information to the user in a notification, or
             * send it to an Activity or Service in a broadcast
             * Intent.
             */
            ...
        } else {
            /*
             * This implementation ignores intents that don't contain
             * an activity update. If you wish, you can report them as
             * errors.
             */
        }
        ...
    }
    ...
}
```

`getNameFromType()` 方法将活动类型转化成了对应的描述性字符串。在一个正式的应用中，你应该从资源文件中去获取字符串而不是使用拥有固定值的变量：

```java
public class ActivityRecognitionIntentService extends IntentService {
    ...
    /**
     * Map detected activity types to strings
     *@param activityType The detected activity type
     *@return A user-readable name for the type
     */
    private String getNameFromType(int activityType) {
        switch(activityType) {
            case DetectedActivity.IN_VEHICLE:
                return "in_vehicle";
            case DetectedActivity.ON_BICYCLE:
                return "on_bicycle";
            case DetectedActivity.ON_FOOT:
                return "on_foot";
            case DetectedActivity.STILL:
                return "still";
            case DetectedActivity.UNKNOWN:
                return "unknown";
            case DetectedActivity.TILTING:
                return "tilting";
        }
        return "unknown";
    }
    ...
}
```


### 在manifest文件里面添加IntentService

为了让系统识别这个IntentService，你需要在应用的manifest文件里面添加```<service>```标签：

```java
<service
    android:name="com.example.android.location.ActivityRecognitionIntentService"
    android:label="@string/app_name"
    android:exported="false">
</service>
```

注意你不必为这个服务去设置特定的intent filters，因为它只接受特定的intent。定义Activity和Fragment这一段已经描述了活动更新intent是如何被创建的。

## 停止活动识别更新

停止活动识别更新的过程与开启活动识别更新的过程类似，只要将调用的方法[removeActivityUpdates()](http://developer.android.com/reference/com/google/android/gms/location/ActivityRecognitionClient.html#removeActivityUpdates(android.app.PendingIntent)换成[requestActivityUpdates()](http://developer.android.com/reference/com/google/android/gms/location/ActivityRecognitionClient.html#requestActivityUpdates(long, android.app.PendingIntent)即可。

停止更新的过程使用了你在添加请求更新时使用过的几个方法，开始的时候要为两种操作定义请求类型：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    public enum REQUEST_TYPE {START, STOP}
    private REQUEST_TYPE mRequestType;
    ...
}
```

更改开始请求活动识别更新的代码，在里面使用 ```START``` 请求参数：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    public void startUpdates() {
        // Set the request type to START
        mRequestType = REQUEST_TYPE.START;
        /*
         * Test for Google Play services after setting the request type.
         * If Google Play services isn't present, the proper request type
         * can be restarted.
         */
        if (!servicesConnected()) {
            return;
        }
        ...
    }
    ...
    public void onConnected(Bundle dataBundle) {
        switch (mRequestType) {
            case START :
                /*
                 * Request activity recognition updates using the
                 * preset detection interval and PendingIntent.
                 * This call is synchronous.
                 */
                mActivityRecognitionClient.requestActivityUpdates(
                        DETECTION_INTERVAL_MILLISECONDS,
                        mActivityRecognitionPendingIntent);
                break;
                ...
                /*
                 * An enum was added to the definition of REQUEST_TYPE,
                 * but it doesn't match a known case. Throw an exception.
                 */
                default :
                throw new Exception("Unknown request type in onConnected().");
                break;
        }
        ...
    }
    ...
}
```

### 开始请求停止更新

定义一个方法来请求停止活动识别更新。在这个方法里面，设置号请求类型，然后向Location Services发起连接。接着你就可以在activity里面的任何地方调用这个方法了。这样做的目的就是开启停止活动更新的方法链：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    /**
     * Turn off activity recognition updates
     *
     */
    public void stopUpdates() {
        // Set the request type to STOP
        mRequestType = REQUEST_TYPE.STOP;
        /*
         * Test for Google Play services after setting the request type.
         * If Google Play services isn't present, the request can be
         * restarted.
         */
        if (!servicesConnected()) {
            return;
        }
        // If a request is not already underway
        if (!mInProgress) {
            // Indicate that a request is in progress
            mInProgress = true;
            // Request a connection to Location Services
            mActivityRecognitionClient.connect();
        //
        } else {
            /*
             * A request is already underway. You can handle
             * this situation by disconnecting the client,
             * re-setting the flag, and then re-trying the
             * request.
             */
        }
        ...
    }
    ...
}
```

在[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)方法里面，如果请求参数类型是 ```STOP```,则调用 [removeActivityUpdates()](http://developer.android.com/reference/com/google/android/gms/location/ActivityRecognitionClient.html#removeActivityUpdates(android.app.PendingIntent)方法。将你之前用来开启更新进程的[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)作为一个参数传给[removeActivityUpdates()](http://developer.android.com/reference/com/google/android/gms/location/ActivityRecognitionClient.html#removeActivityUpdates(android.app.PendingIntent)方法：

```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    public void onConnected(Bundle dataBundle) {
        switch (mRequestType) {
            ...
            case STOP :
            mActivityRecognitionClient.removeActivityUpdates(
                    mActivityRecognitionPendingIntent);
            break;
            ...
        }
        ...
    }
    ...
}
```

你不需要改变你对onDisconnected()方法和onConnectionFailed()方法的实现，因为这些方法不依赖这些请求类型。

现在你已经拥有了一个实现了活动识别的应用的基本架构了。你还可以与其他几个基于地理位置的特征进行结合。
