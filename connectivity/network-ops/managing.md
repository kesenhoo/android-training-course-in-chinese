# 管理使用的网络Managing Network Usage

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/network-ops/managing.html>

这一课会介绍如何细化管理使用的网络资源。如果你的程序需要执行很多网络操作，你应该提供用户设置选项来允许用户控制程序的数据偏好。例如，同步数据的频率，是否只在连接到WiFi才进行下载与上传操作，是否在漫游时使用套餐数据流量等等。这样用户才能在快到达流量上限时关闭你的程序获取数据功能。

关于如何编写一个最小化下载与网络操作对电量影响的程序，请参考：

* [Optimizing Battery Life](http://developer.android.com/training/monitoring-device-state/index.html):
* [Transferring Data Without Draining the Battery](http://developer.android.com/training/efficient-downloads/index.html):

<!-- more -->

## Check a Device's Network Connection(检查设备的网络连接信息)
设备可以有许多种网络连接。关于所有可能的网络连接类型，请看[ConnectivityManager](http://developer.android.com/reference/android/net/ConnectivityManager.html).

通常Wi-Fi是比较快的。移动数据通常都是需要按流量计费，会比较贵. 通常我们会选择让app在连接到WiFi时去获取大量的数据。

那么，我们就需要在执行网络操作之前检查当前连接的网络信息。这样可以防止你的程序不经意连接使用了非意向的网络频道。为了实现这个目的，我们需要使用到下面两个类：

* [ConnectivityManager](http://developer.android.com/reference/android/net/ConnectivityManager.html): Answers queries about the state of network connectivity. It also notifies applications when network connectivity changes.
* [NetworkInfo](http://developer.android.com/reference/android/net/NetworkInfo.html): Describes the status of a network interface of a given type (currently either Mobile or Wi-Fi).

下面示例了检查WiFi与Mobile是否连接上(请注意available与isConnected的区别)：
```java
private static final String DEBUG_TAG = "NetworkStatusExample";
...
ConnectivityManager connMgr = (ConnectivityManager)
        getSystemService(Context.CONNECTIVITY_SERVICE);
NetworkInfo networkInfo = connMgr.getNetworkInfo(ConnectivityManager.TYPE_WIFI);
boolean isWifiConn = networkInfo.isConnected();
networkInfo = connMgr.getNetworkInfo(ConnectivityManager.TYPE_MOBILE);
boolean isMobileConn = networkInfo.isConnected();
Log.d(DEBUG_TAG, "Wifi connected: " + isWifiConn);
Log.d(DEBUG_TAG, "Mobile connected: " + isMobileConn);
```

一个更简单的检查网络是否可用的示例如下：

```java
public boolean isOnline() {
    ConnectivityManager connMgr = (ConnectivityManager)
            getSystemService(Context.CONNECTIVITY_SERVICE);
    NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
    return (networkInfo != null && networkInfo.isConnected());
}
```

你可以使用[NetworkInfo.DetailedState](http://developer.android.com/reference/android/net/NetworkInfo.DetailedState.html), 来获取更加详细的网络信息。

## Manage Network Usage(管理网络使用)
你可以实现一个偏好设置的activity ，来允许用户设置程序的网络资源的使用。例如:

* 你可以允许用户在仅仅连接到WiFi时上传视频。
* 你可以根据诸如网络可用等条件来选择是否做同步的操作。

网络操作需要添加下面的权限：

* [android.permission.INTERNET](http://developer.android.com/reference/android/Manifest.permission.html#INTERNET)—Allows applications to open network sockets.
* [android.permission.ACCESS_NETWORK_STATE](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_NETWORK_STATE)—Allows applications to access information about networks.

你可以为你的设置Activity声明intent filter for the `ACTION_MANAGE_NETWORK_USAGE` action (introduced in Android 4.0),这样你的这个activity就可以提供数据控制的选项了。在章节概览提供的Sample中，这个action is handled by the class SettingsActivity, 它提供了偏好设置UI来让用户决定何时进行下载。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.android.networkusage"
    ...>

    <uses-sdk android:minSdkVersion="4"
           android:targetSdkVersion="14" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        ...>
        ...
        <activity android:label="SettingsActivity" android:name=".SettingsActivity">
             <intent-filter>
                <action android:name="android.intent.action.MANAGE_NETWORK_USAGE" />
                <category android:name="android.intent.category.DEFAULT" />
          </intent-filter>
        </activity>
    </application>
</manifest>
```

## Implement a Preferences Activity(实现一个偏好设置activity)
正如上面看到的那样，SettingsActivity is a subclass ofPreferenceActivity.

所实现的功能见下图：

![network-settings1.png](network-settings1.png)
![network-settings2.png](network-settings2.png)

下面是一个 SettingsActivity. 请注意它实现了OnSharedPreferenceChangeListener. 当用户改变了他的偏好，就会触发 onSharedPreferenceChanged(), 这个方法会设置refreshDisplay 为true(这里的变量存在于自己定义的activity，见下一部分的代码示例). 这会使的当用户返回到main activity的时候进行refresh。(请注意，代码中的注释，不得不说，Googler写的Code看起来就是舒服)

```java
public class SettingsActivity extends PreferenceActivity implements OnSharedPreferenceChangeListener {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Loads the XML preferences file
        addPreferencesFromResource(R.xml.preferences);
    }

    @Override
    protected void onResume() {
        super.onResume();

        // Registers a listener whenever a key changes
        getPreferenceScreen().getSharedPreferences().registerOnSharedPreferenceChangeListener(this);
    }

    @Override
    protected void onPause() {
        super.onPause();

       // Unregisters the listener set in onResume().
       // It's best practice to unregister listeners when your app isn't using them to cut down on
       // unnecessary system overhead. You do this in onPause().
       getPreferenceScreen().getSharedPreferences().unregisterOnSharedPreferenceChangeListener(this);
    }

    // When the user changes the preferences selection,
    // onSharedPreferenceChanged() restarts the main activity as a new
    // task. Sets the the refreshDisplay flag to "true" to indicate that
    // the main activity should update its display.
    // The main activity queries the PreferenceManager to get the latest settings.

    @Override
    public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
        // Sets refreshDisplay to true so that when the user returns to the main
        // activity, the display refreshes to reflect the new settings.
        NetworkActivity.refreshDisplay = true;
    }
}
```

## Respond to Preference Changes(对偏好改变进行响应)
当用户在设置界面改变了偏好，它通常都会对app的行为产生影响。
在下面的代码示例中，app会在onStart(). 方法里面检查偏好设置。如果设置的类型与当前设备的网络连接类型相一致，那么程序就会下载数据并刷新显示。(for example, if the setting is "Wi-Fi" and the device has a Wi-Fi connection)。(这是一个很好的代码示例，如何选择合适的网络类型进行下载操作)
```java
public class NetworkActivity extends Activity {
    public static final String WIFI = "Wi-Fi";
    public static final String ANY = "Any";
    private static final String URL = "http://stackoverflow.com/feeds/tag?tagnames=android&sort=newest";

    // Whether there is a Wi-Fi connection.
    private static boolean wifiConnected = false;
    // Whether there is a mobile connection.
    private static boolean mobileConnected = false;
    // Whether the display should be refreshed.
    public static boolean refreshDisplay = true;

    // The user's current network preference setting.
    public static String sPref = null;

    // The BroadcastReceiver that tracks network connectivity changes.
    private NetworkReceiver receiver = new NetworkReceiver();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registers BroadcastReceiver to track network connection changes.
        IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        receiver = new NetworkReceiver();
        this.registerReceiver(receiver, filter);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Unregisters BroadcastReceiver when app is destroyed.
        if (receiver != null) {
            this.unregisterReceiver(receiver);
        }
    }

    // Refreshes the display if the network connection and the
    // pref settings allow it.

    @Override
    public void onStart () {
        super.onStart();

        // Gets the user's network preference settings
        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);

        // Retrieves a string value for the preferences. The second parameter
        // is the default value to use if a preference value is not found.
        sPref = sharedPrefs.getString("listPref", "Wi-Fi");

        updateConnectedFlags();

        if(refreshDisplay){
            loadPage();
        }
    }

    // Checks the network connection and sets the wifiConnected and mobileConnected
    // variables accordingly.
    public void updateConnectedFlags() {
        ConnectivityManager connMgr = (ConnectivityManager)
                getSystemService(Context.CONNECTIVITY_SERVICE);

        NetworkInfo activeInfo = connMgr.getActiveNetworkInfo();
        if (activeInfo != null && activeInfo.isConnected()) {
            wifiConnected = activeInfo.getType() == ConnectivityManager.TYPE_WIFI;
            mobileConnected = activeInfo.getType() == ConnectivityManager.TYPE_MOBILE;
        } else {
            wifiConnected = false;
            mobileConnected = false;
        }
    }

    // Uses AsyncTask subclass to download the XML feed from stackoverflow.com.
    public void loadPage() {
        if (((sPref.equals(ANY)) && (wifiConnected || mobileConnected))
                || ((sPref.equals(WIFI)) && (wifiConnected))) {
            // AsyncTask subclass
            new DownloadXmlTask().execute(URL);
        } else {
            showErrorPage();
        }
    }
...

}
```

## Detect Connection Changes(监测网络连接的改变)
最后一部分是关于 BroadcastReceiver 的子类： NetworkReceiver. 当设备网络连接改变时，NetworkReceiver会监听到 CONNECTIVITY_ACTION, 这时需要判断当前网络连接类型并相应的设置好 wifiConnected 与 mobileConnected .

我们需要控制好BroadcastReceiver的使用，不必要的声明注册会浪费系统资源。通常是在 onCreate() 去registers 这个BroadcastReceiver ， 在onPause()或者onDestroy() 时unregisters它。这样做会比直接在manifest里面直接注册 <receiver> 更轻量. 当你在manifest里面注册了一个 <receiver> ，你的程序可以在任何时候被唤醒, 即使你已经好几个星期没有使用这个程序了。而通过前面的办法进行注册，可以确保用户离开你的程序之后，不会因为那个Broadcast而被唤起。如果你确保知道何时需要使用到它，你可以在合适的地方使用 [setComponentEnabledSetting()](http://developer.android.com/reference/android/content/pm/PackageManager.html#setComponentEnabledSetting(android.content.ComponentName, int, int)) 来开启或者关闭它。

```java
public class NetworkReceiver extends BroadcastReceiver {

@Override
public void onReceive(Context context, Intent intent) {
    ConnectivityManager conn =  (ConnectivityManager)
        context.getSystemService(Context.CONNECTIVITY_SERVICE);
    NetworkInfo networkInfo = conn.getActiveNetworkInfo();

    // Checks the user prefs and the network connection. Based on the result, decides whether
    // to refresh the display or keep the current display.
    // If the userpref is Wi-Fi only, checks to see if the device has a Wi-Fi connection.
    if (WIFI.equals(sPref) && networkInfo != null && networkInfo.getType() == ConnectivityManager.TYPE_WIFI) {
        // If device has its Wi-Fi connection, sets refreshDisplay
        // to true. This causes the display to be refreshed when the user
        // returns to the app.
        refreshDisplay = true;
        Toast.makeText(context, R.string.wifi_connected, Toast.LENGTH_SHORT).show();

    // If the setting is ANY network and there is a network connection
    // (which by process of elimination would be mobile), sets refreshDisplay to true.
    } else if (ANY.equals(sPref) && networkInfo != null) {
        refreshDisplay = true;

    // Otherwise, the app can't download content--either because there is no network
    // connection (mobile or Wi-Fi), or because the pref setting is WIFI, and there
    // is no Wi-Fi connection.
    // Sets refreshDisplay to false.
    } else {
        refreshDisplay = false;
        Toast.makeText(context, R.string.lost_connection, Toast.LENGTH_SHORT).show();
    }
}
```

***
