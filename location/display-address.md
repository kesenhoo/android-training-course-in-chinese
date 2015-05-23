# 显示位置地址

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:<http://developer.android.com/training/location/display-address.html>

[获取最后可知位置](retrieve-current.html)和[获取位置更新](receive-location-updates.html)课程描述了如何以一个[Location](http://developer.android.com/reference/android/location/Location.html)对象的形式获取用户的位置信息，这个位置信息包括了经纬度。尽管经纬度对计算地理距离和在地图上显示位置很有用，但是更多情况下位置的地址更有用。例如，如果我们想让用户知道他们在哪里，那么一个街道地址比地理坐标（经度/纬度）更加有意义。

使用 Android 框架位置 APIs 的 [Geocoder](http://developer.android.com/reference/android/location/Geocoder.html) 类，我们可以将地址转换成相应的地理坐标。这个过程叫做*地理编码*。或者，我们可以将地理位置转换成相应的地址。这种地址查找功能叫做*反向地理编码*。

这节课介绍了如何用 <a href="http://developer.android.com/reference/android/location/Geocoder.html#getFromLocation(double, double, int)">getFromLocation()</a> 方法将地理位置转换成地址。这个方法返回与制定经纬度相对应的估计的街道地址。

## 获取地理位置

设备的最后可知位置对于地址查找功能是很有用的基础。[获取最后可知位置](retrieve-current.html)介绍了如何通过调用 [fused location provider](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html) 提供的 [getLastLocation()](http://developer.android.com/reference/com/google/android/gms/location/FusedLocationProviderApi.html#getLastLocation(com.google.android.gms.common.api.GoogleApiClient)) 方法找到设备的最后可知位置。

为了访问 fused location provider，我们需要创建一个 Google Play services API client 的实例。关于如何连接 client，请见[连接 Google Play Services](retrieve-current.html) 。

为了让 fused location provider 得到一个准确的街道地址，在应用的 manifest 文件添加位置权限 `ACCESS_FINE_LOCATION`，如下所示：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.gms.location.sample.locationupdates" >

  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
</manifest>
```

## 定义一个 Intent 服务来取得地址

[Geocoder](http://developer.android.com/reference/android/location/Geocoder.html) 类的 <a href="http://developer.android.com/reference/android/location/Geocoder.html#getFromLocation(double, double, int)">getFromLocation()</a> 方法接收一个经度和纬度，返回一个地址列表。这个方法是同步的，可能会花很长时间来完成它的工作，所以我们不应该在应用的主线程和 UI 线程里调用这个方法。

[IntentService](http://developer.android.com/reference/android/app/IntentService.html) 类提供了一种结构使一个任务在后台线程运行。使用这个类，我们可以在不影响 UI 响应速度的情况下处理一个长时间运行的操作。注意到，[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 类也可以执行后台操作，但是它被设计用于短时间运行的操作。在 activity 重新创建时（例如当设备旋转时），[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html) 不应该保存 UI 的引用。相反，当 activity 重建时，不需要取消 [IntentService](http://developer.android.com/reference/android/app/IntentService.html)。

定义一个继承 [IntentService](http://developer.android.com/reference/android/app/IntentService.html) 的类 `FetchAddressIntentService`。这个类是地址查找服务。这个 Intent 服务在一个工作线程上异步地处理一个 intent，并在它离开这个工作时自动停止。Intent 外加的数据提供了服务需要的数据，包括一个用于转换成地址的 [Location](http://developer.android.com/reference/android/location/Location.html) 对象和一个用于处理地址查找结果的 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html) 对象。这个服务用一个 [Geocoder](http://developer.android.com/reference/android/location/Geocoder.html) 来获取位置的地址，并且将结果发送给 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html)。

### 在应用的 manifest 文件中定义 Intent 服务

在 manifest 文件中添加一个节点以定义 intent 服务：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.android.gms.location.sample.locationaddress" >
    <application
        ...
        <service
            android:name=".FetchAddressIntentService"
            android:exported="false"/>
    </application>
    ...
</manifest>
```

> **Note：**manifest 文件里的 `<service>` 节点不需要包含一个 intent filter，这是因为我们的主 activity 通过指定 intent 用到的类的名字来创建一个隐式的 intent。

### 创建一个 Geocoder

将一个地理位置传换成地址的过程叫做*反向地理编码*。通过实现 `FetchAddressIntentService ` 类的 [onHandleIntent()](http://developer.android.com/reference/android/app/IntentService.html#onHandleIntent(android.content.Intent)) 来执行 intent 服务的主要工作，即反向地理编码请求。创建一个 [Geocoder](http://developer.android.com/reference/android/location/Geocoder.html) 对象来处理反向地理编码。

一个区域设置代表一个特定的地理上的或者语言上的区域。Locale 对象用于调整信息的呈现方式，例如数字或者日期，来适应区域设置表示的区域的约定。传一个 [Locale](http://developer.android.com/reference/java/util/Locale.html) 对象到 [Geocoder](http://developer.android.com/reference/android/location/Geocoder.html) 对象，确保地址结果为用户的地理区域作出了本地化。

```java
@Override
protected void onHandleIntent(Intent intent) {
    Geocoder geocoder = new Geocoder(this, Locale.getDefault());
    ...
}
```

### 获取街道地址数据

下一步是从 geocoder 获取街道地址，处理可能出现的错误，和将结果返回给请求地址的 activity。我们需要两个分别代表成功和失败的数字常量来报告地理编码过程的结果。定义一个 `Constants` 类来包含这些值，如下所示：

```java
public final class Constants {
    public static final int SUCCESS_RESULT = 0;
    public static final int FAILURE_RESULT = 1;
    public static final String PACKAGE_NAME =
        "com.google.android.gms.location.sample.locationaddress";
    public static final String RECEIVER = PACKAGE_NAME + ".RECEIVER";
    public static final String RESULT_DATA_KEY = PACKAGE_NAME +
        ".RESULT_DATA_KEY";
    public static final String LOCATION_DATA_EXTRA = PACKAGE_NAME +
        ".LOCATION_DATA_EXTRA";
}
```

为了获取与地理位置相对应的街道地址，调用 <a href="http://developer.android.com/reference/android/location/Geocoder.html#getFromLocation(double, double, int)">getFromLocation()</a>，传入位置对象的经度和纬度，以及我们想要返回的地址的最大数量。在这种情况下，我们只需要一个地址。geocoder 返回一个地址数组。如果没有找到匹配指定位置的地址，那么它会返回空的列表。如果没有可用的后台地理编码服务，geocoder 会返回 null。

如下面代码介绍来检查下述这些错误。如果出现错误，就将相应的错误信息传给变量 `errorMessage`，从而将错误信息发送给发出请求的 activity：

* **No location data provided** - Intent 的附加数据没有包含反向地理编码需要用到的 [Location](http://developer.android.com/reference/android/location/Location.html) 对象。
* **Invalid latitude or longitude used** - [Location](http://developer.android.com/reference/android/location/Location.html) 对象提供的纬度和/或者经度无效。
* **No geocoder available** - 由于网络错误或者 IO 异常，导致后台地理编码服务不可用。
* **Sorry, no address found** - geocoder 找不到指定纬度/经度对应的地址。

使用 [Address](http://developer.android.com/reference/android/location/Address.html) 类中的 [getAddressLine()](http://developer.android.com/reference/android/location/Address.html#getAddressLine(int)) 方法来获得地址对象的个别行。然后将这些行加入一个地址 fragment 列表当中。其中，这个地址 fragment 列表准备好返回到发出地址请求的 activity。

为了将结果返回给发出地址请求的 activity，需要调用 `deliverResultToReceiver()` 方法（定义于下面的[把地址返回给请求端]()）。结果由之前提到的成功/失败数字代码和一个字符串组成。在反向地理编码成功的情况下，这个字符串包含着地址。在失败的情况下，这个字符串包含错误的信息。如下所示：

```java
@Override
protected void onHandleIntent(Intent intent) {
    String errorMessage = "";

    // Get the location passed to this service through an extra.
    Location location = intent.getParcelableExtra(
            Constants.LOCATION_DATA_EXTRA);

    ...

    List<Address> addresses = null;

    try {
        addresses = geocoder.getFromLocation(
                location.getLatitude(),
                location.getLongitude(),
                // In this sample, get just a single address.
                1);
    } catch (IOException ioException) {
        // Catch network or other I/O problems.
        errorMessage = getString(R.string.service_not_available);
        Log.e(TAG, errorMessage, ioException);
    } catch (IllegalArgumentException illegalArgumentException) {
        // Catch invalid latitude or longitude values.
        errorMessage = getString(R.string.invalid_lat_long_used);
        Log.e(TAG, errorMessage + ". " +
                "Latitude = " + location.getLatitude() +
                ", Longitude = " +
                location.getLongitude(), illegalArgumentException);
    }

    // Handle case where no address was found.
    if (addresses == null || addresses.size()  == 0) {
        if (errorMessage.isEmpty()) {
            errorMessage = getString(R.string.no_address_found);
            Log.e(TAG, errorMessage);
        }
        deliverResultToReceiver(Constants.FAILURE_RESULT, errorMessage);
    } else {
        Address address = addresses.get(0);
        ArrayList<String> addressFragments = new ArrayList<String>();

        // Fetch the address lines using getAddressLine,
        // join them, and send them to the thread.
        for(int i = 0; i < address.getMaxAddressLineIndex(); i++) {
            addressFragments.add(address.getAddressLine(i));
        }
        Log.i(TAG, getString(R.string.address_found));
        deliverResultToReceiver(Constants.SUCCESS_RESULT,
                TextUtils.join(System.getProperty("line.separator"),
                        addressFragments));
    }
}
```

### 把地址返回给请求端

Intent 服务最后要做的事情是将地址返回给启动服务的 activity 里的 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html)。这个 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html) 类允许我们发送一个带有结果的数字代码和一个包含结果数据的消息。这个数字代码说明了地理编码请求是成功还是失败。在反向地理编码成功的情况下，这个消息包含着地址。在失败的情况下，这个消息包含一些描述失败原因的文本。

我们已经可以从 geocoder 取得地址，捕获到可能出现的错误，调用 `deliverResultToReceiver()` 方法。现在我们需要定义 `deliverResultToReceiver()` 方法来将结果代码和消息包发送给结果接收端。

对于结果代码，使用已经传给 `deliverResultToReceiver()` 方法的 `resultCode` 参数的值。对于消息包的结构，连接 `Constants` 类的 `RESULT_DATA_KEY` 常量（定义与[获取街道地址数据]()）和传给 `deliverResultToReceiver()` 方法的 `message` 参数的值。如下所示：

```java
public class FetchAddressIntentService extends IntentService {
    protected ResultReceiver mReceiver;
    ...
    private void deliverResultToReceiver(int resultCode, String message) {
        Bundle bundle = new Bundle();
        bundle.putString(Constants.RESULT_DATA_KEY, message);
        mReceiver.send(resultCode, bundle);
    }
}
```

## 启动 Intent 服务

上节课定义的 intent 服务在后台运行，同时，该服务负责提取与指定地理位置相对应的地址。当我们启动服务，Android 框架会实例化并启动服务（如果该服务没有运行），并且如果需要的话，创建一个进程。如果服务正在运行，那么让它保持运行状态。因为服务继承于 [IntentService](http://developer.android.com/reference/android/app/IntentService.html)，所以当所有 intent 都被处理完之后，该服务会自动停止。

在我们应用的主 activity 中启动服务，并且创建一个 [Intent](http://developer.android.com/reference/android/content/Intent.html) 来把数据传给服务。我们需要创建一个*显式的* intent，这是因为我们只想我们的服务响应该 intent。详细请见 [Intent Types](http://developer.android.com/guide/components/intents-filters.html#Types)。

为了创建一个显式的 intent，需要为服务指定要用到的类名：`FetchAddressIntentService.class`。在 intent 附加数据中传入两个信息：

* 一个用于处理地址查找结果的 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html)。
* 一个包含想要转换成地址的纬度和经度的 [Location](http://developer.android.com/reference/android/location/Location.html) 对象。

下面的代码介绍了如何启动 intent 服务：

```java
public class MainActivity extends ActionBarActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {

    protected Location mLastLocation;
    private AddressResultReceiver mResultReceiver;
    ...

    protected void startIntentService() {
        Intent intent = new Intent(this, FetchAddressIntentService.class);
        intent.putExtra(Constants.RECEIVER, mResultReceiver);
        intent.putExtra(Constants.LOCATION_DATA_EXTRA, mLastLocation);
        startService(intent);
    }
}
```

当用户请求查找地理地址时，调用上述的 `startIntentService()` 方法。例如，用户可能会在我们应用的 UI 上面点击*提取地址*按钮。在启动 intent 服务之前，我们需要检查是否已经连接到 Google Play services。下面的代码片段介绍在一个按钮 handler 中调用 `startIntentService()` 方法。

```java
public void fetchAddressButtonHandler(View view) {
    // Only start the service to fetch the address if GoogleApiClient is
    // connected.
    if (mGoogleApiClient.isConnected() && mLastLocation != null) {
        startIntentService();
    }
    // If GoogleApiClient isn't connected, process the user's request by
    // setting mAddressRequested to true. Later, when GoogleApiClient connects,
    // launch the service to fetch the address. As far as the user is
    // concerned, pressing the Fetch Address button
    // immediately kicks off the process of getting the address.
    mAddressRequested = true;
    updateUIWidgets();
}
```

如果用户点击了应用 UI 上面的*提取地址*按钮，那么我们必须在 Google Play services 连接稳定之后启动 intent 服务。下面的代码片段介绍了调用 Google API Client 提供的 [onConnected()](http://developer.android.com/reference/com/google/android/gms/common/api/GoogleApiClient.ConnectionCallbacks.html#onConnected(android.os.Bundle)) 回调函数中的 `startIntentService()` 方法。

```java
public class MainActivity extends ActionBarActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    @Override
    public void onConnected(Bundle connectionHint) {
        // Gets the best and most recent location currently available,
        // which may be null in rare cases when a location is not available.
        mLastLocation = LocationServices.FusedLocationApi.getLastLocation(
                mGoogleApiClient);

        if (mLastLocation != null) {
            // Determine whether a Geocoder is available.
            if (!Geocoder.isPresent()) {
                Toast.makeText(this, R.string.no_geocoder_available,
                        Toast.LENGTH_LONG).show();
                return;
            }

            if (mAddressRequested) {
                startIntentService();
            }
        }
    }
}
```

## 获取地理编码结果

Intent 服务已经处理完地理编码请求，并用 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html) 将结果返回给发出请求的 activity。在发出请求的 activity 里，定义一个继承于 [ResultReceiver](http://developer.android.com/reference/android/os/ResultReceiver.html) 的 `AddressResultReceiver`，用于处理在 `FetchAddressIntentService` 中的响应。

结果包含一个数字代码（`resultCode`）和一个包含结果数据（`resultData`）的消息。如果反向地理编码成功的话，`resultData` 会包含地址。如果失败，`resultData` 包含描述失败原因的文本。关于错误信息更详细的内容，请见[把地址返回给请求端]()

重写 <a href="http://developer.android.com/reference/android/os/ResultReceiver.html#onReceiveResult(int, android.os.Bundle)">onReceiveResult()</a> 方法来处理发送给接收端的结果，如下所示：

```java
public class MainActivity extends ActionBarActivity implements
        ConnectionCallbacks, OnConnectionFailedListener {
    ...
    class AddressResultReceiver extends ResultReceiver {
        public AddressResultReceiver(Handler handler) {
            super(handler);
        }

        @Override
        protected void onReceiveResult(int resultCode, Bundle resultData) {

            // Display the address string
            // or an error message sent from the intent service.
            mAddressOutput = resultData.getString(Constants.RESULT_DATA_KEY);
            displayAddressOutput();

            // Show a toast message if an address was found.
            if (resultCode == Constants.SUCCESS_RESULT) {
                showToast(getString(R.string.address_found));
            }

        }
    }
}
```
