# 获取位置更新

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

如果你的应用需要导航或者记录路径，你可能会周期性地去获取用户的位置信息。此时你可以使用Location Services 里面的 [LocationClient.getLastLocation()](https://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#getLastLocation())来进行周期性的位置信息更新。使用这个方法之后，Location Services 会基于当前可用的位置信息提供源（比如WiFi和GPS）返回最准确的位置信息更新。

你可以使用一个location client从 Location Services 那里请求周期性的位置更新。根据不同请求的形式，Location Services 要么调用一个回调函数并传入一个 [Location](http://developer.android.com/reference/android/location/Location.html) 对象，或者发送一个包含位置信息的 [Intent](http://developer.android.com/reference/android/content/Intent.html) 。位置更新的精度和频率与你的应用所申请的权限相关联。

## 确定应用的权限
使用位置服务的应用必须用户位置权限。Android拥有两种位置权限：[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION) 和 [ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)。选择不同的权限决定你的应用最后获取的位置信息的精度。如果你只请求了一个精度比较低的位置权限，位置服务会对返回的位置信息处理成一个相当于城市级别精确度的位置。

请求[ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)权限时也包含了[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION)权限。

举个例子，如果你要添加[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION)权限，你需要将下面的权限添加到```<manifest>```标签中：
```java
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

## 检测Google Play Services
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
                        "Location Updates");
            }
        }
    }
    ...
}
```

下面的代码片段使用了这个方法来检查Google Play services是否可用。

## 定义位置服务回调函数
在你创建location client之前, 你必须实现一些被 Location Services用来同你的应用通信的接口

[ConnectionCallbacks](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.ConnectionCallbacks.html)
* 设置了当一个location client连接成功或者断开连接时 Location Services必须调用了方法。

[OnConnectionFailedListener](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesClient.OnConnectionFailedListener.html)
* 设置了当一个错误出现而需要去连接location client时Location Services需要要调用的方法。这个方法用到了之前定义好的 ```showErrorDialog``` 方法来显示一个error dialog，并尝试用Google Play services来修复这个问题。

下面的代码片段展示了如何实现这些接口并定义对应的方法：
```java
public class MainActivity extends FragmentActivity implements
        GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener {
    ...
    /*
     * 当连接到client的请求成功结束时被Location Services 调用。这时你可以请求当前位置或者开始周期性的更新位置信息。
     */
    @Override
    public void onConnected(Bundle dataBundle) {
        // 显示连接状态
        Toast.makeText(this, "Connected", Toast.LENGTH_SHORT).show();

    }
    ...
    /*
     * 当连接因为错误被location client丢弃时，Location Services调用此方法
     */
    @Override
    public void onDisconnected() {
        // 显示连接状态
        Toast.makeText(this, "Disconnected. Please re-connect.",
                Toast.LENGTH_SHORT).show();
    }
    ...
    /*
     * 尝试连接Location Services失败后被 Location Services调用的方法
     */
    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        /*
         * Google Play services 可以解决它探测到的一些错误。
         * 如果这个错误有一个解决方案，这个方法会试着发送一个Intent去启动一个Google Play services activity来解决错误。
         */
        if (connectionResult.hasResolution()) {
            try {
                // 启动一个尝试解决问题的Activity
                connectionResult.startResolutionForResult(
                        this,
                        CONNECTION_FAILURE_RESOLUTION_REQUEST);
                /*
                 * 如果Google Play services 取消这个最初的PendingIntent，抛出异常
                 */
            } catch (IntentSender.SendIntentException e) {
                // 记录错误
                e.printStackTrace();
            }
        } else {
            /*
             * 如果没有可用的解决方案，将错误通过一个 dialog 显示给用户
             */
            showErrorDialog(connectionResult.getErrorCode());
        }
    }
    ...
}
```
现在你已经写好了回调函数，你可以设置位置更新的请求了。第一步就是确定可以控制位置更新的参数。

## 确定位置更新参数
Location Services可以让你通过设置[LocationRequest](https://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html)里面的值来控制位置更新的频率和精度，然后把[LocationRequest](https://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html)这个对象作为更新请求的一部分发送出去，接着就可以开始更新位置信息了。

首页，设置下面的周期参数：

更新频率
* 更新频率通过 [LocationRequest.setInterval()](https://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setInterval(long))方法来设置。 这个方法设置的毫秒数表示你的应用在这个时间内尽可能的接受位置更新信息。如果当时没有其他应用从Location Services获取位置更新，那么你的应用就会已设置的频率接收位置更新。

最快更新频率
* 最快更新频率通过[LocationRequest.setFastestInterval()](https://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#setFastestInterval(long)方法设置。这个方法设置你的应用能够接收位置更新最快的频率。你必须设置这个频率因为其他应用也会影响位置更新的频率。 Location Services 会以选择所有请求位置更新的应用中频率最快的发送位置更新。。如果这个频率比你的应用能处理的频率还要快，那么你的应用可能会出现UI闪烁或者数据溢出。为了防止这样的情况出现，调用LocationRequest.setFastestInterval()方法来设置位置更新频率的上限，同时还可以节约电量。当你通过 LocationRequest.setInterval()方法设置理想的更新频率，通过 LocationRequest.setFastestInterval()设置更新频率的上限，然后你的应用就会在系统中获得最快的位置更新频率。如果其他应用设置的更新频率更快，那么你的应用也跟着受益。如果其他应用的更新频率没有你的频率快，那么你的应用将会以你通过LocationRequest.setInterval()方法设置的频率更新位置信息。

接着，设置精度参数。在一个前台应用（foreground app）中，你需要不断地获取高精度的位置更新，因此需要使用[LocationRequest.PRIORITY_HIGH_ACCURACY](https://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_HIGH_ACCURACY)。

下面的代码片段展示了如何在```onCreate()```方法里面设置更新频率和精度：
```java
public class MainActivity extends FragmentActivity implements
        GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener,
        LocationListener {
    ...
    // Global constants
    ...
    // Milliseconds per second
    private static final int MILLISECONDS_PER_SECOND = 1000;
    // Update frequency in seconds
    public static final int UPDATE_INTERVAL_IN_SECONDS = 5;
    // Update frequency in milliseconds
    private static final long UPDATE_INTERVAL =
            MILLISECONDS_PER_SECOND * UPDATE_INTERVAL_IN_SECONDS;
    // The fastest update frequency, in seconds
    private static final int FASTEST_INTERVAL_IN_SECONDS = 1;
    // A fast frequency ceiling in milliseconds
    private static final long FASTEST_INTERVAL =
            MILLISECONDS_PER_SECOND * FASTEST_INTERVAL_IN_SECONDS;
    ...
    // 定义一个包含定位精度和定位频率的对象
    LocationRequest mLocationRequest;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Create the LocationRequest object
        mLocationRequest = LocationRequest.create();
        // 使用高精度
        mLocationRequest.setPriority(
                LocationRequest.PRIORITY_HIGH_ACCURACY);
        // 设置更新频率为 5 seconds
        mLocationRequest.setInterval(UPDATE_INTERVAL);
        // 设置最快更新频率为  1 second
        mLocationRequest.setFastestInterval(FASTEST_INTERVAL);
        ...
    }
    ...
}
```

> **注意：** 如果你的应用在获取位置更新后需要访问网络或者进行长时的操作，你可以将最快更新频率调整至更慢的值。这样可以让你的应用不会接受无法使用的位置更新。一旦这样的长时操作完成，将最快更新频率设回原值。

## 开始进行位置更新
To send the request for location updates, create a location client in onCreate(), then connect it and make the request by calling requestLocationUpdates(). Since your client must be connected for your app to receive updates, you should connect the client in onStart(). This ensures that you always have a valid, connected client while your app is visible. Since you need a connection before you can request updates, make the update request in ConnectionCallbacks.onConnected()

Remember that the user may want to turn off location updates for various reasons. You should provide a way for the user to do this, and you should ensure that you don't start updates in onStart() if updates were previously turned off. To track the user's preference, store it in your app's SharedPreferences in onPause() and retrieve it in onResume().

The following snippet shows how to set up the client in onCreate(), and how to connect it and request updates in onStart():
```java
public class MainActivity extends FragmentActivity implements
        GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener,
        LocationListener {
    ...
    // Global variables
    ...
    LocationClient mLocationClient;
    boolean mUpdatesRequested;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...
        // Open the shared preferences
        mPrefs = getSharedPreferences("SharedPreferences",
                Context.MODE_PRIVATE);
        // Get a SharedPreferences editor
        mEditor = mPrefs.edit();
        /*
         * Create a new location client, using the enclosing class to
         * handle callbacks.
         */
        mLocationClient = new LocationClient(this, this, this);
        // Start with updates turned off
        mUpdatesRequested = false;
        ...
    }
    ...
    @Override
    protected void onPause() {
        // Save the current setting for updates
        mEditor.putBoolean("KEY_UPDATES_ON", mUpdatesRequested);
        mEditor.commit();
        super.onPause();
    }
    ...
    @Override
    protected void onStart() {
        ...
        mLocationClient.connect();
    }
    ...
    @Override
    protected void onResume() {
        /*
         * Get any previous setting for location updates
         * Gets "false" if an error occurs
         */
        if (mPrefs.contains("KEY_UPDATES_ON")) {
            mUpdatesRequested =
                    mPrefs.getBoolean("KEY_UPDATES_ON", false);

        // Otherwise, turn off location updates
        } else {
            mEditor.putBoolean("KEY_UPDATES_ON", false);
            mEditor.commit();
        }
    }
    ...
    /*
     * Called by Location Services when the request to connect the
     * client finishes successfully. At this point, you can
     * request the current location or start periodic updates
     */
    @Override
    public void onConnected(Bundle dataBundle) {
        // Display the connection status
        Toast.makeText(this, "Connected", Toast.LENGTH_SHORT).show();
        // If already requested, start periodic updates
        if (mUpdatesRequested) {
            mLocationClient.requestLocationUpdates(mLocationRequest, this);
        }
    }
    ...
}
```

For more information about saving preferences, read Saving Key-Value Sets.

## Stop Location Updates
To stop location updates, save the state of the update flag in onPause(), and stop updates in onStop() by calling removeLocationUpdates(LocationListener). For example:
```java
public class MainActivity extends FragmentActivity implements
        GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener,
        LocationListener {
    ...
    /*
     * Called when the Activity is no longer visible at all.
     * Stop updates and disconnect.
     */
    @Override
    protected void onStop() {
        // If the client is connected
        if (mLocationClient.isConnected()) {
            /*
             * Remove location updates for a listener.
             * The current Activity is the listener, so
             * the argument is "this".
             */
            removeLocationUpdates(this);
        }
        /*
         * After disconnect() is called, the client is
         * considered "dead".
         */
        mLocationClient.disconnect();
        super.onStop();
    }
    ...
}
```

You now have the basic structure of an app that requests and receives periodic location updates. You can combine the features described in this lesson with the geofencing, activity recognition, or reverse geocoding features described in other lessons in this class.

The next lesson, Displaying a Location Address, shows you how to use the current location to display the current street address.





