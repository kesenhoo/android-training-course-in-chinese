# 创建并监视异常区域

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

地理围栏将用户当前位置感知和附件地点特征感知相结合，定义了用户对位置的接近程度。为了让一个位置有感知，你必须确定这个位置的经纬度。为了度量用户对位置的接近程度，你需要添加一个半径。综合经纬度和半径即可确定一个地理围栏。当然你可以一次性定义多个地理围栏。

Location Services将一个地理围栏看成是一片区域而不是一个点和一个接近程度。这样可以让它去探测用户是否进入或者正在某个地理围栏中。对于每个地理围栏，你可以让Location Services给你发送进入或者退出地理围栏事件。你还可以通过设置一一个毫秒级别的有效时间来限制地理围栏的生命周期。当地理围栏失效后，Location Services会自动移除这个地理围栏。

##请求地理围栏监视
请求地理围栏监视的第一步就是设置必要的权限。在使用地理围栏时，你必须设置[ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)权限。添加如下代码即可：
```java
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

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

要使用地理围栏，你得先定义你要监控的地理围栏。通常你可以在本地保存地理围栏数据或者从互联网上获取地理围栏数据，然后你需要发送一个由[Geofence.Builder](http://developer.android.com/reference/com/google/android/gms/location/Geofence.Builder.html)创建的[Geofence](http://developer.android.com/reference/com/google/android/gms/location/Geofence.html)对象给Location Services。每一个[Geofence](http://developer.android.com/reference/com/google/android/gms/location/Geofence.html)对象都包括了以下数据：

精度, 纬度和半径
* 为地理围栏定义一个圆形区域。使用经纬度标记一个兴趣地点，然后使用半径定义地理围栏有效区域。半径越大，用户越有可能触发地理围栏的警报。例如，为一个家庭灯具地理围栏应用设置一个大的半径，这样当用户回家就可能触发地理围栏，然后灯就亮了。

有效时间
* 地理围栏保持激活状态的时间。一旦达到了有效时间，Location Services会删除这个地理围栏。大部分时候，你都应该为你的应用设置一个有效时间，但对于家居或者工作空间等类型的应用，可能设置需要永久的地理围栏。nces for the user's home or place of work.

触发事件类型
* Location Services 能探测到用户进入地理围栏的有效范围内或者走出有效范围的事件。

地理围栏 ID
* 一个与地理围栏一同保存的字符串。你必须保证这个字符串唯一，这样你就可以使用它从Location Services的记录里来移除特定地理围栏。

### 定义地理围栏存储
一个地理围栏应用需要将地理围栏数据做持久化的读写。但是你不能使用[Geofence](http://developer.android.com/reference/com/google/android/gms/location/Geofence.html) 进行这样的操作；你可以使用数据库等方式来保存地理围栏的相关数据。

作为一个保存地理围栏数据的实例，下面的代码片段定义了两个使用[SharedPreferences](http://developer.android.com/reference/android/content/SharedPreferences.html) 的类来进行地理围栏的数据持久化。 ```SimpleGeofence```类， 类似于一条数据库记录，为一个[Geofence](http://developer.android.com/reference/com/google/android/gms/location/Geofence.html) 对象存储数据。```SimpleGeofenceStore```类，类似于一个数据库，对```SimpleGeofence``` 的读写应用到 [SharedPreferences](http://developer.android.com/reference/android/content/SharedPreferences.html) 实例。

```java
public class MainActivity extends FragmentActivity {
    ...
    /**
     * A single Geofence object, defined by its center and radius.
     */
    public class SimpleGeofence {
            // Instance variables
            private final String mId;
            private final double mLatitude;
            private final double mLongitude;
            private final float mRadius;
            private long mExpirationDuration;
            private int mTransitionType;

        /**
         * @param geofenceId The Geofence's request ID
         * @param latitude Latitude of the Geofence's center.
         * @param longitude Longitude of the Geofence's center.
         * @param radius Radius of the geofence circle.
         * @param expiration Geofence expiration duration
         * @param transition Type of Geofence transition.
         */
        public SimpleGeofence(
                String geofenceId,
                double latitude,
                double longitude,
                float radius,
                long expiration,
                int transition) {
            // Set the instance fields from the constructor
            this.mId = geofenceId;
            this.mLatitude = latitude;
            this.mLongitude = longitude;
            this.mRadius = radius;
            this.mExpirationDuration = expiration;
            this.mTransitionType = transition;
        }
        // Instance field getters
        public String getId() {
            return mId;
        }
        public double getLatitude() {
            return mLatitude;
        }
        public double getLongitude() {
            return mLongitude;
        }
        public float getRadius() {
            return mRadius;
        }
        public long getExpirationDuration() {
            return mExpirationDuration;
        }
        public int getTransitionType() {
            return mTransitionType;
        }
        /**
         * Creates a Location Services Geofence object from a
         * SimpleGeofence.
         *
         * @return A Geofence object
         */
        public Geofence toGeofence() {
            // Build a new Geofence object
            return new Geofence.Builder()
                    .setRequestId(getId())
                    .setTransitionTypes(mTransitionType)
                    .setCircularRegion(
                            getLatitude(), getLongitude(), getRadius())
                    .setExpirationDuration(mExpirationDuration)
                    .build();
        }
    }
    ...
    /**
     * Storage for geofence values, implemented in SharedPreferences.
     */
    public class SimpleGeofenceStore {
        // Keys for flattened geofences stored in SharedPreferences
        public static final String KEY_LATITUDE =
                "com.example.android.geofence.KEY_LATITUDE";
        public static final String KEY_LONGITUDE =
                "com.example.android.geofence.KEY_LONGITUDE";
        public static final String KEY_RADIUS =
                "com.example.android.geofence.KEY_RADIUS";
        public static final String KEY_EXPIRATION_DURATION =
                "com.example.android.geofence.KEY_EXPIRATION_DURATION";
        public static final String KEY_TRANSITION_TYPE =
                "com.example.android.geofence.KEY_TRANSITION_TYPE";
        // The prefix for flattened geofence keys
        public static final String KEY_PREFIX =
                "com.example.android.geofence.KEY";
        /*
         * Invalid values, used to test geofence storage when
         * retrieving geofences
         */
        public static final long INVALID_LONG_VALUE = -999l;
        public static final float INVALID_FLOAT_VALUE = -999.0f;
        public static final int INVALID_INT_VALUE = -999;
        // The SharedPreferences object in which geofences are stored
        private final SharedPreferences mPrefs;
        // The name of the SharedPreferences
        private static final String SHARED_PREFERENCES =
                "SharedPreferences";
        // Create the SharedPreferences storage with private access only
        public SimpleGeofenceStore(Context context) {
            mPrefs =
                    context.getSharedPreferences(
                            SHARED_PREFERENCES,
                            Context.MODE_PRIVATE);
        }
        /**
         * Returns a stored geofence by its id, or returns null
         * if it's not found.
         *
         * @param id The ID of a stored geofence
         * @return A geofence defined by its center and radius. See
         */
        public SimpleGeofence getGeofence(String id) {
            /*
             * Get the latitude for the geofence identified by id, or
             * INVALID_FLOAT_VALUE if it doesn't exist
             */
            double lat = mPrefs.getFloat(
                    getGeofenceFieldKey(id, KEY_LATITUDE),
                    INVALID_FLOAT_VALUE);
            /*
             * Get the longitude for the geofence identified by id, or
             * INVALID_FLOAT_VALUE if it doesn't exist
             */
            double lng = mPrefs.getFloat(
                    getGeofenceFieldKey(id, KEY_LONGITUDE),
                    INVALID_FLOAT_VALUE);
            /*
             * Get the radius for the geofence identified by id, or
             * INVALID_FLOAT_VALUE if it doesn't exist
             */
            float radius = mPrefs.getFloat(
                    getGeofenceFieldKey(id, KEY_RADIUS),
                    INVALID_FLOAT_VALUE);
            /*
             * Get the expiration duration for the geofence identified
             * by id, or INVALID_LONG_VALUE if it doesn't exist
             */
            long expirationDuration = mPrefs.getLong(
                    getGeofenceFieldKey(id, KEY_EXPIRATION_DURATION),
                    INVALID_LONG_VALUE);
            /*
             * Get the transition type for the geofence identified by
             * id, or INVALID_INT_VALUE if it doesn't exist
             */
            int transitionType = mPrefs.getInt(
                    getGeofenceFieldKey(id, KEY_TRANSITION_TYPE),
                    INVALID_INT_VALUE);
            // If none of the values is incorrect, return the object
            if (
                lat != GeofenceUtils.INVALID_FLOAT_VALUE &&
                lng != GeofenceUtils.INVALID_FLOAT_VALUE &&
                radius != GeofenceUtils.INVALID_FLOAT_VALUE &&
                expirationDuration !=
                        GeofenceUtils.INVALID_LONG_VALUE &&
                transitionType != GeofenceUtils.INVALID_INT_VALUE) {

                // Return a true Geofence object
                return new SimpleGeofence(
                        id, lat, lng, radius, expirationDuration,
                        transitionType);
            // Otherwise, return null.
            } else {
                return null;
            }
        }
        /**
         * Save a geofence.
         * @param geofence The SimpleGeofence containing the
         * values you want to save in SharedPreferences
         */
        public void setGeofence(String id, SimpleGeofence geofence) {
            /*
             * Get a SharedPreferences editor instance. Among other
             * things, SharedPreferences ensures that updates are atomic
             * and non-concurrent
             */
            Editor editor = mPrefs.edit();
            // Write the Geofence values to SharedPreferences
            editor.putFloat(
                    getGeofenceFieldKey(id, KEY_LATITUDE),
                    (float) geofence.getLatitude());
            editor.putFloat(
                    getGeofenceFieldKey(id, KEY_LONGITUDE),
                    (float) geofence.getLongitude());
            editor.putFloat(
                    getGeofenceFieldKey(id, KEY_RADIUS),
                    geofence.getRadius());
            editor.putLong(
                    getGeofenceFieldKey(id, KEY_EXPIRATION_DURATION),
                    geofence.getExpirationDuration());
            editor.putInt(
                    getGeofenceFieldKey(id, KEY_TRANSITION_TYPE),
                    geofence.getTransitionType());
            // Commit the changes
            editor.commit();
        }
        public void clearGeofence(String id) {
            /*
             * Remove a flattened geofence object from storage by
             * removing all of its keys
             */
            Editor editor = mPrefs.edit();
            editor.remove(getGeofenceFieldKey(id, KEY_LATITUDE));
            editor.remove(getGeofenceFieldKey(id, KEY_LONGITUDE));
            editor.remove(getGeofenceFieldKey(id, KEY_RADIUS));
            editor.remove(getGeofenceFieldKey(id,
                    KEY_EXPIRATION_DURATION));
            editor.remove(getGeofenceFieldKey(id, KEY_TRANSITION_TYPE));
            editor.commit();
        }
        /**
         * Given a Geofence object's ID and the name of a field
         * (for example, KEY_LATITUDE), return the key name of the
         * object's values in SharedPreferences.
         *
         * @param id The ID of a Geofence object
         * @param fieldName The field represented by the key
         * @return The full key name of a value in SharedPreferences
         */
        private String getGeofenceFieldKey(String id,
                String fieldName) {
            return KEY_PREFIX + "_" + id + "_" + fieldName;
        }
    }
    ...
}
```

### 创建地理围栏对象
下面的代码片段使用`SimpleGeofence`和`SimpleGeofenceStore`类从用户界面上获取地理围栏数据，然后将这些数据保存到```SimpleGeofence`对象里面，接着把这些`SimpleGeofence`对象保存到一个`SimpleGeofenceStore`里面，然后就可以创建 [Geofence](http://developer.android.com/reference/com/google/android/gms/location/Geofence.html)对象了:
```java
public class MainActivity extends FragmentActivity {
    ...
    /*
     * Use to set an expiration time for a geofence. After this amount
     * of time Location Services will stop tracking the geofence.
     */
    private static final long SECONDS_PER_HOUR = 60;
    private static final long MILLISECONDS_PER_SECOND = 1000;
    private static final long GEOFENCE_EXPIRATION_IN_HOURS = 12;
    private static final long GEOFENCE_EXPIRATION_TIME =
            GEOFENCE_EXPIRATION_IN_HOURS *
            SECONDS_PER_HOUR *
            MILLISECONDS_PER_SECOND;
    ...
    /*
     * Handles to UI views containing geofence data
     */
    // Handle to geofence 1 latitude in the UI
    private EditText mLatitude1;
    // Handle to geofence 1 longitude in the UI
    private EditText mLongitude1;
    // Handle to geofence 1 radius in the UI
    private EditText mRadius1;
    // Handle to geofence 2 latitude in the UI
    private EditText mLatitude2;
    // Handle to geofence 2 longitude in the UI
    private EditText mLongitude2;
    // Handle to geofence 2 radius in the UI
    private EditText mRadius2;
    /*
     * Internal geofence objects for geofence 1 and 2
     */
    private SimpleGeofence mUIGeofence1;
    private SimpleGeofence mUIGeofence2;
    ...
    // Internal List of Geofence objects
    List<Geofence> mGeofenceList;
    // Persistent storage for geofences
    private SimpleGeofenceStore mGeofenceStorage;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ...
        // Instantiate a new geofence storage area
        mGeofenceStorage = new SimpleGeofenceStore(this);

        // Instantiate the current List of geofences
        mCurrentGeofences = new ArrayList<Geofence>();
    }
    ...
    /**
     * Get the geofence parameters for each geofence from the UI
     * and add them to a List.
     */
    public void createGeofences() {
        /*
         * Create an internal object to store the data. Set its
         * ID to "1". This is a "flattened" object that contains
         * a set of strings
         */
        mUIGeofence1 = new SimpleGeofence(
                "1",
                Double.valueOf(mLatitude1.getText().toString()),
                Double.valueOf(mLongitude1.getText().toString()),
                Float.valueOf(mRadius1.getText().toString()),
                GEOFENCE_EXPIRATION_TIME,
                // This geofence records only entry transitions
                Geofence.GEOFENCE_TRANSITION_ENTER);
        // Store this flat version
        mGeofenceStorage.setGeofence("1", mUIGeofence1);
        // Create another internal object. Set its ID to "2"
        mUIGeofence2 = new SimpleGeofence(
                "2",
                Double.valueOf(mLatitude2.getText().toString()),
                Double.valueOf(mLongitude2.getText().toString()),
                Float.valueOf(mRadius2.getText().toString()),
                GEOFENCE_EXPIRATION_TIME,
                // This geofence records both entry and exit transitions
                Geofence.GEOFENCE_TRANSITION_ENTER |
                Geofence.GEOFENCE_TRANSITION_EXIT);
        // Store this flat version
        mGeofenceStorage.setGeofence(2, mUIGeofence2);
        mGeofenceList.add(mUIGeofence1.toGeofence());
        mGeofenceList.add(mUIGeofence2.toGeofence());
    }
    ...
}
```
除了这些你要监视的[Geofence](http://developer.android.com/reference/com/google/android/gms/location/Geofence.html)列表之外，你还需要为Location Services添加[Intent](http://developer.android.com/reference/android/content/Intent.html)，这个Intent在你的应用探测到地理围栏触发事件时会将这个事件发送给你的应用。

### 为地理围栏触发事件定义Intent
从Location Services发送来的Intent能够触发各种应用内的动作，但是不能用它来打开一个Activity或者Fragment，因为应用内的组件只能在响应用户动作时才能可见。大多数情况下，处理这一类的Intent最好使用[IntentService](http://developer.android.com/reference/android/app/IntentService.html)。一个[IntentService](http://developer.android.com/reference/android/app/IntentService.html)可以推送一个通知，可以进行长时的后台作业，可以将intent发送给其他的services，还可以广播intent。下面的代码展示了如何定义一个[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)来启动一个IntentService:
```java
public class MainActivity extends FragmentActivity {
    ...
    /*
     * Create a PendingIntent that triggers an IntentService in your
     * app when a geofence transition occurs.
     */
    private PendingIntent getTransitionPendingIntent() {
        // Create an explicit Intent
        Intent intent = new Intent(this,
                ReceiveTransitionsIntentService.class);
        /*
         * Return the PendingIntent
         */
        return PendingIntent.getService(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT);
    }
    ...
}
```
现在你已经拥有了所有发送监视地理围栏请求给Location Services的代码了。

### 发送监视请求
发送监视请求需要两个异步操作。第一个操作就是为这个请求获取一个location client，第二个操作就是使用这个client来生成请求。这两个操作里面，Location Services都会在操作结束的时候调用一个回调函数。处理这些操作最好的方法就是将这些方法调用连接起来。下面的代码展示了如何建立一个Activity，接着定义回调方法，然后以合适的顺序调用他们。
首先，让Activity实现必要的回调接口。需要添加以下接口：
[ConnectionCallbacks](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html)
* 设置当location client已连接或者断开连接时Location Services调用的方法。

[OnConnectionFailedListener](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.OnConnectionFailedListener.html)
* 设置当Location Services连接location client出错时Location Services调用的方法。

[OnAddGeofencesResultListener](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnAddGeofencesResultListener.html)
* 设置当Location Services已经添加地理围栏的时候Location Services调用的方法。

例如：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
}
```

### 开始请求进程
接下啦，在连接Location Services的时候定义一个启动请求进程的方法。记得将这个请求设置为全局变量，这样就可以让你使用回调方法[ConnectionCallbacks.onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle))来添加地理围栏，或者移除地理围栏。

为了防止当你的应用在第一个请求还没结束就开始第二个请求的时候不出现竞争状况，你可以定义一个boolean标志位来记录当前请求的状态：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    // Holds the location client
    private LocationClient mLocationClient;
    // Stores the PendingIntent used to request geofence monitoring
    private PendingIntent mGeofenceRequestIntent;
    // Defines the allowable request types.
    public enum REQUEST_TYPE = {ADD}
    private REQUEST_TYPE mRequestType;
    // Flag that indicates if a request is underway.
    private boolean mInProgress;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Start with the request flag set to false
        mInProgress = false;
        ...
    }
    ...
    /**
     * Start a request for geofence monitoring by calling
     * LocationClient.connect().
     */
    public void addGeofences() {
        // Start a request to add geofences
        mRequestType = ADD;
        /*
         * Test for Google Play services after setting the request type.
         * If Google Play services isn't present, the proper request
         * can be restarted.
         */
        if (!servicesConnected()) {
            return;
        }
        /*
         * Create a new location client object. Since the current
         * activity class implements ConnectionCallbacks and
         * OnConnectionFailedListener, pass the current activity object
         * as the listener for both parameters
         */
        mLocationClient = new LocationClient(this, this, this)
        // If a request is not already underway
        if (!mInProgress) {
            // Indicate that a request is underway
            mInProgress = true;
            // Request a connection from the client to Location Services
            mLocationClient.connect();
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

### 发送添加地理围栏的请求
在你对回调方法[ConnectionCallbacks.onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle))的实现里面，调用 [LocationClient.addGeofences()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#addGeofences(java.util.List<com.google.android.gms.location.Geofence>, android.app.PendingIntent, com.google.android.gms.location.LocationClient.OnAddGeofencesResultListener))。注意如果连接失败，[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle))方法不会被调用，这个请求也会停止。
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /*
     * Provide the implementation of ConnectionCallbacks.onConnected()
     * Once the connection is available, send a request to add the
     * Geofences
     */
    @Override
    private void onConnected(Bundle dataBundle) {
        ...
        switch (mRequestType) {
            case ADD :
                // Get the PendingIntent for the request
                mTransitionPendingIntent =
                        getTransitionPendingIntent();
                // Send a request to add the current geofences
                mLocationClient.addGeofences(
                        mCurrentGeofences, pendingIntent, this);
            ...
        }
    }
    ...
}
```
注意[addGeofences()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#addGeofences(java.util.List<com.google.android.gms.location.Geofence>, android.app.PendingIntent, com.google.android.gms.location.LocationClient.OnAddGeofencesResultListener))方法会直接返回，但是请求的状态却不是直接返回的，只有等到Location Services调用 [onAddGeofencesResult()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnAddGeofencesResultListener.html#onAddGeofencesResult(int, java.lang.String[])方法。一旦这个方法被调用，你就能知道这个请求是否成功。

### 通过Location Services检测请求返回的结果
当 Location Services 你对回调函数[onAddGeofencesResult()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnAddGeofencesResultListener.html#onAddGeofencesResult(int, java.lang.String[])的实现的时候，说明请求已经结束，你可以检测最终的结果状态码。如果请求成功，那么你轻轻的地理围栏是激活的，如果没有成功，那么你请求的地理围栏没有激活。如果没成功，你需要重试或者报告错误。例如：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
        ...
    /*
     * Provide the implementation of
     * OnAddGeofencesResultListener.onAddGeofencesResult.
     * Handle the result of adding the geofences
     *
     */
    @Override
    public void onAddGeofencesResult(
            int statusCode, String[] geofenceRequestIds) {
        // If adding the geofences was successful
        if (LocationStatusCodes.SUCCESS == statusCode) {
            /*
             * Handle successful addition of geofences here.
             * You can send out a broadcast intent or update the UI.
             * geofences into the Intent's extended data.
             */
        } else {
        // If adding the geofences failed
            /*
             * Report errors here.
             * You can log the error using Log.e() or update
             * the UI.
             */
        }
        // Turn off the in progress flag and disconnect the client
        mInProgress = false;
        mLocationClient.disconnect();
    }
    ...
}
```

### 处理断开连接
某些情况下，Location Services可能会在你调用disconnect()方法之前断开连接。为了处理这种情况，你需要实现onDisconnected()方法。在这个方法里面，设置请求状态标志位来表示这个请求已经不处于进程中，然后删除这个client：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /*
     * Implement ConnectionCallbacks.onDisconnected()
     * Called by Location Services once the location client is
     * disconnected.
     */
    @Override
    public void onDisconnected() {
        // Turn off the request flag
        mInProgress = false;
        // Destroy the current location client
        mLocationClient = null;
    }
    ...
}
```
###处理连接错误
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
                        "Geofence Detection");
            }
        }
    }
    ...
}
```

## 处理地理围栏触发事件
当Location Services探测到用户进入或者退出一个地理围栏，它会发送一个Intent，这个Intent就是

### 定义一个IntentService
下面的代码展示了如何定义一个当一个地理围栏触发事件出现的时候发送通知。当用户点击这个通知，这个应用的主界面出现：
```java
public class ReceiveTransitionsIntentService extends IntentService {
    ...
    /**
     * Sets an identifier for the service
     */
    public ReceiveTransitionsIntentService() {
        super("ReceiveTransitionsIntentService");
    }
    /**
     * Handles incoming intents
     *@param intent The Intent sent by Location Services. This
     * Intent is provided
     * to Location Services (inside a PendingIntent) when you call
     * addGeofences()
     */
    @Override
    protected void onHandleIntent(Intent intent) {
        // First check for errors
        if (LocationClient.hasError(intent)) {
            // Get the error code with a static method
            int errorCode = LocationClient.getErrorCode(intent);
            // Log the error
            Log.e("ReceiveTransitionsIntentService",
                    "Location Services error: " +
                    Integer.toString(errorCode));
            /*
             * You can also send the error code to an Activity or
             * Fragment with a broadcast Intent
             */
        /*
         * If there's no error, get the transition type and the IDs
         * of the geofence or geofences that triggered the transition
         */
        } else {
            // Get the type of transition (entry or exit)
            int transitionType =
                    LocationClient.getGeofenceTransition(intent);
            // Test that a valid transition was reported
            if (
                (transitionType == Geofence.GEOFENCE_TRANSITION_ENTER)
                 ||
                (transitionType == Geofence.GEOFENCE_TRANSITION_EXIT)
               ) {
                List <Geofence> triggerList =
                        getTriggeringGeofences(intent);

                String[] triggerIds = new String[geofenceList.size()];

                for (int i = 0; i < triggerIds.length; i++) {
                    // Store the Id of each geofence
                    triggerIds[i] = triggerList.get(i).getRequestId();
                }
                /*
                 * At this point, you can store the IDs for further use
                 * display them, or display the details associated with
                 * them.
                 */
            }
        // An invalid transition was reported
        } else {
            Log.e("ReceiveTransitionsIntentService",
                    "Geofence transition error: " +
                    Integer.toString()transitionType));
        }
    }
    ...
}
```

### 在manifest里面设置IntentService
为了在系统里面申明这个IntentService，在manifest里面添加一个`<service>` 元素即可。例如：
```java
<service
    android:name="com.example.android.location.ReceiveTransitionsIntentService"
    android:label="@string/app_name"
    android:exported="false">
</service>
```
注意你不必为这个service设置intent filters，因为它只接收特定的intent。这些地理围栏触发事件的intent是如何被创建的，请参看[发送监视请求](geofencing.html#requestmonitoring)这一课。

## 停止地理围栏监视
要停止地理围栏监视，你要移除这些地理围栏。你可以移除特定的某个地理围栏集合或者移除与某个[PendingIntent](http://developer.android.com/reference/android/app/PendingIntent.html)相关所有的地理围栏。这个过程与添加地理围栏类似。第一个操作就是获取一个移除请求的location client，然后使用这个client来生成请求。

Location Services在它完成移除地理围栏这个过程的时候调用的回调函数定义在[LocationClient.OnRemoveGeofencesResultListener](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnRemoveGeofencesResultListener.html)这个接口里面。在你的类里面申明这个接口，然后为它的两个方法添加定义：

[onRemoveGeofencesByPendingIntentResult()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnRemoveGeofencesResultListener.html#onRemoveGeofencesByPendingIntentResult(int, android.app.PendingIntent)
*  这个回调函数是Location Services完成移除所有地理围栏的请求时调用的，它是由 [removeGeofences(PendingIntent, LocationClient.OnRemoveGeofencesResultListener)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#removeGeofences(android.app.PendingIntent, com.google.android.gms.location.LocationClient.OnRemoveGeofencesResultListener))方法生成的。

[onRemoveGeofencesByRequestIdsResult(List<String>, LocationClient.OnRemoveGeofencesResultListener)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnRemoveGeofencesResultListener.html#onRemoveGeofencesByRequestIdsResult(int, java.lang.String[]))
* 这个回调函数是Location Services完成移除特定地理围栏ID集合的地理围栏的请求时调用的，它由 [removeGeofences(List<String>, LocationClient.OnRemoveGeofencesResultListener)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#removeGeofences(java.util.List<java.lang.String>, com.google.android.gms.location.LocationClient.OnRemoveGeofencesResultListener)方法生成的。

这些实现的代码将在下一个代码区域出现。

### 移除所有的地理围栏
因为移除地理围栏使用了添加地理围栏时的一些方法，你只需要添加另外几种请求类型即可：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    // Enum type for controlling the type of removal requested
    public enum REQUEST_TYPE = {ADD, REMOVE_INTENT}
    ...
}
```
在连接上Location Services的时候启动移除的请求。如果连接失败，那么[onConnected()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)方法就不会被调用，请求也就停止了。下面的代码就展示了如何启动这个请求：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /**
     * Start a request to remove geofences by calling
     * LocationClient.connect()
     */
    public void removeGeofences(PendingIntent requestIntent) {
        // Record the type of removal request
        mRequestType = REMOVE_INTENT;
        /*
         * Test for Google Play services after setting the request type.
         * If Google Play services isn't present, the request can be
         * restarted.
         */
        if (!servicesConnected()) {
            return;
        }
        // Store the PendingIntent
        mGeofenceRequestIntent = requestIntent;
        /*
         * Create a new location client object. Since the current
         * activity class implements ConnectionCallbacks and
         * OnConnectionFailedListener, pass the current activity object
         * as the listener for both parameters
         */
        mLocationClient = new LocationClient(this, this, this);
        // If a request is not already underway
        if (!mInProgress) {
            // Indicate that a request is underway
            mInProgress = true;
            // Request a connection from the client to Location Services
            mLocationClient.connect();
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
当Location Services调用这个函数的时候就表明连接已经打开，可以进行移除所有地理围栏的请求了。在这个请求完成之后就可以断开连接了。例如：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /**
     * Once the connection is available, send a request to remove the
     * Geofences. The method signature used depends on which type of
     * remove request was originally received.
     */
    private void onConnected(Bundle dataBundle) {
        /*
         * Choose what to do based on the request type set in
         * removeGeofences
         */
        switch (mRequestType) {
            ...
            case REMOVE_INTENT :
                mLocationClient.removeGeofences(
                        mGeofenceRequestIntent, this);
                break;
            ...
        }
    }
    ...
}
```
对[removeGeofences(PendingIntent, LocationClient.OnRemoveGeofencesResultListener)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#removeGeofences(android.app.PendingIntent, com.google.android.gms.location.LocationClient.OnRemoveGeofencesResultListener))会直接返回，而移除地理围栏的请求的结果要等到Location Services 调用onRemoveGeofencesByPendingIntentResult()方法才会返回。下面的代码展示了如何定义这个方法：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /**
     * When the request to remove geofences by PendingIntent returns,
     * handle the result.
     *
     *@param statusCode the code returned by Location Services
     *@param requestIntent The Intent used to request the removal.
     */
    @Override
    public void onRemoveGeofencesByPendingIntentResult(int statusCode,
            PendingIntent requestIntent) {
        // If removing the geofences was successful
        if (statusCode == LocationStatusCodes.SUCCESS) {
            /*
             * Handle successful removal of geofences here.
             * You can send out a broadcast intent or update the UI.
             * geofences into the Intent's extended data.
             */
        } else {
        // If adding the geocodes failed
            /*
             * Report errors here.
             * You can log the error using Log.e() or update
             * the UI.
             */
        }
        /*
         * Disconnect the location client regardless of the
         * request status, and indicate that a request is no
         * longer in progress
         */
        mInProgress = false;
        mLocationClient.disconnect();
    }
    ...
}
```

### 移除特定的地理围栏
移除个别地理围栏和地理围栏集合与移除所有地理围栏的过程类似。为了确定你要移除的地理围栏，需要将他们的地理围栏ID存储到一个字符串列表里面。将这个列表传给`removeGeofences`方法。这个方法接下来就可以启动这个移除过程了。

开始的时候要添加一个请求类型来申明这是一个删除里一个列表里面的地理围栏请求。同时还要全局变量来保存地理围栏的ID列表：
```java
...
    // Enum type for controlling the type of removal requested
    public enum REQUEST_TYPE = {ADD, REMOVE_INTENT, REMOVE_LIST}
    // Store the list of geofence Ids to remove
    String<List> mGeofencesToRemove;
```
接下来，定义一个你要移除的地理围栏列表。例如，下面的代码就移除了地理围栏ID为1的地理围栏：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
        List<String> listOfGeofences =
                Collections.singletonList("1");
        removeGeofences(listOfGeofences);
    ...
}
```
下面的代码定义了`removeGeofences()`方法：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /**
     * Start a request to remove monitoring by
     * calling LocationClient.connect()
     *
     */
    public void removeGeofences(List<String> geofenceIds) {
        // If Google Play services is unavailable, exit
        // Record the type of removal request
        mRequestType = REMOVE_LIST;
        /*
         * Test for Google Play services after setting the request type.
         * If Google Play services isn't present, the request can be
         * restarted.
         */
        if (!servicesConnected()) {
            return;
        }
        // Store the list of geofences to remove
        mGeofencesToRemove = geofenceIds;
        /*
         * Create a new location client object. Since the current
         * activity class implements ConnectionCallbacks and
         * OnConnectionFailedListener, pass the current activity object
         * as the listener for both parameters
         */
        mLocationClient = new LocationClient(this, this, this);
        // If a request is not already underway
        if (!mInProgress) {
            // Indicate that a request is underway
            mInProgress = true;
            // Request a connection from the client to Location Services
            mLocationClient.connect();
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
当Location Services 调用这个回调函数说明这个连接成功，可以进行移除一个列表的地理围栏请求了。完成请求后就可以断开连接。例如：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    private void onConnected(Bundle dataBundle) {
        ...
        switch (mRequestType) {
        ...
        // If removeGeofencesById was called
            case REMOVE_LIST :
                mLocationClient.removeGeofences(
                        mGeofencesToRemove, this);
                break;
        ...
        }
        ...
    }
    ...
}
```
定义 [onRemoveGeofencesByRequestIdsResult()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.OnRemoveGeofencesResultListener.html#onRemoveGeofencesByRequestIdsResult(int, java.lang.String[])方法的实现。 Location Services 调用这个方法的时候说明移除一个列表的地理围栏的请求已经完成了。在这个方法里面，检测得到的状态码并作出对应的动作：
```java
public class MainActivity extends FragmentActivity implements
        ConnectionCallbacks,
        OnConnectionFailedListener,
        OnAddGeofencesResultListener {
    ...
    /**
     * When the request to remove geofences by IDs returns, handle the
     * result.
     *
     * @param statusCode The code returned by Location Services
     * @param geofenceRequestIds The IDs removed
     */
    @Override
    public void onRemoveGeofencesByRequestIdsResult(
            int statusCode, String[] geofenceRequestIds) {
        // If removing the geocodes was successful
        if (LocationStatusCodes.SUCCESS == statusCode) {
            /*
             * Handle successful removal of geofences here.
             * You can send out a broadcast intent or update the UI.
             * geofences into the Intent's extended data.
             */
        } else {
        // If removing the geofences failed
            /*
             * Report errors here.
             * You can log the error using Log.e() or update
             * the UI.
             */
        }
        // Indicate that a request is no longer in progress
        mInProgress = false;
        // Disconnect the location client
        mLocationClient.disconnect();
    }
    ...
}
```
你可以将地理围栏同其他位置感知的特性结合起来，比如周期性的位置更新或者用户的活动识别。

下一课，[识别用户的活动状态](activity-recognition.html)将会告诉你如何请求和接受活动更新。Location Services 会以一个正常的频率向你发送当前用户的身体活动信息。基于这些信息，你可以改变你的应用的一些行为。；例如，当你探测到用户由驾驶改为步行的时候，你可以把应用的信息更新频率设置为更长的时间。
