# 显示位置地址

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

[获取当前的位置](retrieve-current.html)和[接收位置更新](receive-location-updates.html)课程描述了如何以一个[Location](http://developer.android.com/reference/android/location/Location.html)对象的形式获取用户当前的位置信息，这个位置信息包括了经纬度。尽管经纬度对计算地理距离和在地图上显示位置很有帮助，但是更多情况下位置信息的地址更有用。

Android平台API提供一个根据地理经纬度返回一个大概的街道地址信息这一课教你如何使用这个地址检索功能。

> **注意：** 地址检索需要一个后台服务，然后这个后台服务是不包含在核心的Android框架里面的。如果这个后台服务不可用，[```Geocoder.getFromLocation()```](http://developer.android.com/reference/android/location/Geocoder.html#getFromLocation(double, double, int)方法将会返回一个空列表。在Android API 9以上的API里面有一个辅助方法[```isPresent()```](http://developer.android.com/reference/android/location/Geocoder.html#isPresent()可以检查这个后台服务是否可用。

下面的代码假设你已经获取到了位置信息并将位置信息以[Location](http://developer.android.com/reference/android/location/Location.html)对象的形式保存到全局变量```mLocation```里面。

## 定义地址检索任务
为了通过给定的经纬度获取地址信息，你需要调用[Geocoder.getFromLocation()](http://developer.android.com/reference/android/location/Geocoder.html#getFromLocation(double, double, int)方法并返回一个地址列表。由于这个方法是同步的，所以在获取地址信息的时候可能耗时较长，因此你需要通过[AsyncTask](http://developer.android.com/reference/android/os/AsyncTask.html)的[doInBackground()](http://developer.android.com/reference/android/os/AsyncTask.html#doInBackground(Params...) 方法来执行这个方法。

当你的应用在获取地址信息的时候，可以使用一个进度条之类的控件来表示你的应用正在后台工作中。你可以将这个控件的初始状态设为```android:visibility="gone"```，这样可以让这个控件不可见。当你开始进行地址检索的时候，你需要将这个控件的可见属性设为"visible"。

下面的代码教你如何在你的布局文件里面添加一个进度条：
```java
<ProgressBar
android:id="@+id/address_progress"
android:layout_width="wrap_content"
android:layout_height="wrap_content"
android:layout_centerHorizontal="true"
android:indeterminate="true"
android:visibility="gone" />
```
要创建一个后台任务，首先要定义一个AsycnTask的子类来调用getFromLocation()方法，然后返回地址。定义一个TextView对象mAddress来显示返回的地址信息，进度条则用来显示请求的进度过程。例如：
```java
public class MainActivity extends FragmentActivity {
    ...
    private TextView mAddress;
    private ProgressBar mActivityIndicator;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ...
    mAddress = (TextView) findViewById(R.id.address);
    mActivityIndicator =
            (ProgressBar) findViewById(R.id.address_progress);
    }
    ...
    /**
    * A subclass of AsyncTask that calls getFromLocation() in the
    * background. The class definition has these generic types:
    * Location - A Location object containing
    * the current location.
    * Void     - indicates that progress units are not used
    * String   - An address passed to onPostExecute()
    */
    private class GetAddressTask extends
            AsyncTask<Location, Void, String> {
        Context mContext;
        public GetAddressTask(Context context) {
            super();
            mContext = context;
        }
        ...
        /**
         * Get a Geocoder instance, get the latitude and longitude
         * look up the address, and return it
         *
         * @params params One or more Location objects
         * @return A string containing the address of the current
         * location, or an empty string if no address can be found,
         * or an error message
         */
        @Override
        protected String doInBackground(Location... params) {
            Geocoder geocoder =
                    new Geocoder(mContext, Locale.getDefault());
            // Get the current location from the input parameter list
            Location loc = params[0];
            // Create a list to contain the result address
            List<Address> addresses = null;
            try {
                /*
                 * Return 1 address.
                 */
                addresses = geocoder.getFromLocation(loc.getLatitude(),
                        loc.getLongitude(), 1);
            } catch (IOException e1) {
            Log.e("LocationSampleActivity",
                    "IO Exception in getFromLocation()");
            e1.printStackTrace();
            return ("IO Exception trying to get address");
            } catch (IllegalArgumentException e2) {
            // Error message to post in the log
            String errorString = "Illegal arguments " +
                    Double.toString(loc.getLatitude()) +
                    " , " +
                    Double.toString(loc.getLongitude()) +
                    " passed to address service";
            Log.e("LocationSampleActivity", errorString);
            e2.printStackTrace();
            return errorString;
            }
            // If the reverse geocode returned an address
            if (addresses != null && addresses.size() > 0) {
                // Get the first address
                Address address = addresses.get(0);
                /*
                 * Format the first line of address (if available),
                 * city, and country name.
                 */
                String addressText = String.format(
                        "%s, %s, %s",
                        // If there's a street address, add it
                        address.getMaxAddressLineIndex() > 0 ?
                                address.getAddressLine(0) : "",
                        // Locality is usually a city
                        address.getLocality(),
                        // The country of the address
                        address.getCountryName());
                // Return the text
                return addressText;
            } else {
                return "No address found";
            }
        }
        ...
    }
    ...
}
```
下一部分教你如何在用户界面上显示地址信息。

## 定义显示结果的方法
[doInBackground()](http://developer.android.com/reference/android/os/AsyncTask.html#doInBackground(Params...))方法返回一个包含地址检索结果的字符串。这个值会被传入[onPostExecute()](http://developer.android.com/reference/android/os/AsyncTask.html#onPostExecute(Result))方法，通过这个方法你可以对结果进行更深的处理。因为[onPostExecute()](http://developer.android.com/reference/android/os/AsyncTask.html#onPostExecute(Result))运行在UI主线程上面，它可以更新用户界面；例如，它可以隐藏进度条然后显示返回的地址结果给用户：
```java
  private class GetAddressTask extends
            AsyncTask<Location, Void, String> {
        ...
        /**
         * A method that's called once doInBackground() completes. Turn
         * off the indeterminate activity indicator and set
         * the text of the UI element that shows the address. If the
         * lookup failed, display the error message.
         */
        @Override
        protected void onPostExecute(String address) {
            // Set activity indicator visibility to "gone"
            mActivityIndicator.setVisibility(View.GONE);
            // Display the results of the lookup.
            mAddress.setText(address);
        }
        ...
    }
```
最后一步就是运行地址检索任务。

## 运行地址检索任务
为了获取地址信息，调用[execute()](http://developer.android.com/reference/android/os/AsyncTask.html#execute(Params...)方法即可。例如，下面的代码片段展示了当用户点击"Get Address"按钮时应用就开始检索地址信息了：
```java
public class MainActivity extends FragmentActivity {
    ...
    /**
     * The "Get Address" button in the UI is defined with
     * android:onClick="getAddress". The method is invoked whenever the
     * user clicks the button.
     *
     * @param v The view object associated with this method,
     * in this case a Button.
     */
    public void getAddress(View v) {
        // Ensure that a Geocoder services is available
        if (Build.VERSION.SDK_INT >=
                Build.VERSION_CODES.GINGERBREAD
                            &&
                Geocoder.isPresent()) {
            // Show the activity indicator
            mActivityIndicator.setVisibility(View.VISIBLE);
            /*
             * Reverse geocoding is long-running and synchronous.
             * Run it on a background thread.
             * Pass the current location to the background task.
             * When the task finishes,
             * onPostExecute() displays the address.
             */
            (new GetAddressTask(this)).execute(mLocation);
        }
        ...
    }
    ...
}
```
下一课，[创建和监视Geofences](geofencing.html)将会教你如何定义地理围栏以及如何使用地理围栏来探测用户对一个兴趣位置的接近程度。
