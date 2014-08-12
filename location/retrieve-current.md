# 获取当前位置

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

位置服务会自动持有用户当前的位置信息，你的应用在需要位置的时候获取一下即可。位置的精确度基于你所请求的位置权限以及当前设备已经激活的位置传感器。

位置服务通过一个[LocationClient](https://developer.android.com/reference/com/google/android/gms/location/LocationClient.html)（位置服务类LocationClient的一个实例）将当前的位置发送给你的应用。关于位置信息的所有请求都是通过这个类发送。

> **注意:** 在开始这个课程之前，确定你的开发环境和测试设备处于正常可用状态。要了解更多，请阅读Google Play services 引导。

## 确定应用的权限
使用位置服务的应用必须用户位置权限。Android拥有两种位置权限：[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION) 和 [ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)。选择不同的权限决定你的应用最后获取的位置信息的精度。如果你只请求了一个精度比较低的位置权限，位置服务会对返回的位置信息处理成一个相当于城市级别精确度的位置。

请求[ACCESS_FINE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_FINE_LOCATION)权限时也包含了[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION)权限。

举个例子，如果你要添加[ACCESS_COARSE_LOCATION](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_COARSE_LOCATION)权限，你需要将下面的权限添加到`<manifest>`标签中：
```java
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

## 检测Google Play Services
位置服务是Google Play services 中的一部分。由于很难预料用户设备的状态，所以你在尝试连接位置服务之前应该要检测你的设备是否安装了Google Play services安装包。为了检测这个安装包是否被安装，你可以调用[GooglePlayServicesUtil.isGooglePlayServicesAvailable()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesUtil.html#isGooglePlayServicesAvailable(android.content.Context)，这个方法将会返回一个结果代码。你可以通过查询[ConnectionResult](http://developer.android.com/reference/com/google/android/gms/common/ConnectionResult.html)的参考文档中结果代码列表来理解对应的结果代码。如果你碰到了错误，你可以调用[GooglePlayServicesUtil.getErrorDialog()](http://developer.android.com/reference/com/google/android/gms/common/GooglePlayServicesUtil.html#getErrorDialog(int, android.app.Activity, int))获取本地化的对话框来提示用户采取适当地行为，接着你需要将这个对话框置于一个[DialogFragment](http://developer.android.com/reference/android/support/v4/app/DialogFragment.html)中显示。这个对话框可以让用户去纠正这个问题，这个时候Google Services可以将结果返回给你的activity。为了处理这个结果，重写[onActivityResult()](http://developer.android.com/reference/android/app/Activity.html#onActivityResult(int, int, android.content.Intent))即可。

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
为了获取当前的位置，你需要创建一个location client，将它连接到Location Services，然后调用它的 [getLastLocation()](https://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#getLastLocation()) 方法。最后返回的值是基于你应用请求的权限以及当时启用的位置传感器的最佳位置信息。

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

## 连接 Location Client
既然这个回调函数已经写好了，现在我们可以创建location client并将它连接到Location Services。

首先你要在onCreate()方法里面创建location client，然后在onStart()方法里面连接它 then connect it in，这样当你的activity对用户可见时 Location Services 就保存着当前的位置信息了。你需要在onStop()方法里面断开连接，这样当你的activity不可见时，Location Services 就不会保存你的位置信息。下面连接和断开连接的方式对节省电池很有帮助。例如：

> **注意:** 当前的位置信息只有在location client 连接到 Location Service时才会被保存。 假设没有其他应用连接到 Location Services，如果你断开 client 的连接，那么这时你调用 [getLastLocation() ](https://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#getLastLocation())所获取到的位置信息可能已经过时。

```java
public class MainActivity extends FragmentActivity implements
        GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener {
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        ...
        /*
         * Create a new location client, using the enclosing class to
         * handle callbacks.
         */
        mLocationClient = new LocationClient(this, this, this);
        ...
    }
    ...
    /*
     * 当Activity可见时调用
     */
    @Override
    protected void onStart() {
        super.onStart();
        // 连接 client.
        mLocationClient.connect();
    }
    ...
    /*
     * Called when the Activity is no longer visible.
     */
    @Override
    protected void onStop() {
        // 断开 client 与Location Services的连接，使client失效。
        mLocationClient.disconnect();
        super.onStop();
    }
    ...
}
```

## 获取当前的位置信息
为了获取当前的位置信息，调用[getLastLocation()](https://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#getLastLocation())方法。例如：
```java
public class MainActivity extends FragmentActivity implements
        GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener {
    ...
    // 保存当前位置信息的全局变量
    Location mCurrentLocation;
    ...
    mCurrentLocation = mLocationClient.getLastLocation();
    ...
}
```
下一课，[获取位置更新](receive-location-updates.html)，教你如果周期性地从Location Services获取位置信息更新。

