# 使用模拟位置进行测试

> 编写:[penkzhou](https://github.com/penkzhou) - 原文:

当你在测试一个使用Location Services基于地理位置的应用时，你是不需要把你的设备从一个地方移动到另一个地方来产生位置数据的。你可以将Location Services设置成模拟模式。在这个模式里面，你可以发送模拟位置给Location Services，然后Location Services再将这些数据发送给位置client。在模拟模式里面，Location Services也可以使用模拟位置对象来触发地理围栏。

使用模拟位置有以下几个优点：

* 模拟位置可以让你创建特定的模拟数据，而不需要你移动你的设备到特定的地方来获取接近的数据。

* 因为模拟位置来源于Location Services，它们可以测试你处理地理位置代码的每一个部分。而且，因为你可以从你的正式版应用之外发送模拟数据，那么你就不必在发布你的应用之前禁用或者删掉测试代码。

* 因为你不必通过移动设备来产生测试位置，那你就可以使用模拟器来测试应用了。


使用模拟位置最好的方式就是从一个单独的模拟位置提供应用发送模拟位置数据。这一课就包括了一个位置提供应用，你可以下载下来测试你的软件。你也可以更改这个应用来满足你自己的需求。为应用提供测试数据的一些想法也列在[管理测试数据](location-testing.html#TestData)这一块里面。

这个课程接下来的部分就是教你如何开启模拟模式以及如何使用一个位置client来发送模拟数据给Location Services。

>**注意：** 模拟位置对Location Services的活动识别算法没有影响想要了解更多关于活动识别，请参看课程 [识别用户的当下活动](activity-recognition.html)。

## 开启模拟模式

一个应用要想在模拟模式下面给Location Services发送模拟位置 ，那么它必须要设置 [```ACCESS_MOCK_LOCATION```](http://developer.android.com/reference/android/Manifest.permission.html#ACCESS_MOCK_LOCATION)权限。而且，你必须在测试设备上开启模拟位置选项。要了解如何开启设备的模拟位置选项，请参看开启设备的开发者模式。

为了在Location Services里面开启模拟模式，你需要先连接一个位置client到Location Services，就像之前的课程 [接收当前位置信息](retrieve-current.html)一样。接着，调用[LocationClient.setMockMode(true)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#setMockMode(boolean))方法。一旦你调用了这个方法，Location Services就会关掉它内部的位置提供器，然后只转发你发给它的模拟位置。下面的代码教你如何调用[LocationClient.setMockMode(true)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#setMockMode(boolean))方法：

```java
// Define a LocationClient object
    public LocationClient mLocationClient;
    ...
    // Connect to Location Services
    mLocationClient.connect();
    ...
    // When the location client is connected, set mock mode
    mLocationClinet.setMockMode(true);
```

一旦这个位置client连接上了Location Services，你必须保持这个连接知道你结束发送模拟位置为止。一旦你调用[LocationClient.disconnect()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#disconnect())这个方法，Location Services便会开始启用它的内部位置提供器。在位置client连接的时候调用[LocationClient.setMockMode(false)](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#setMockMode(boolean))方法就可以关掉模拟模式了。

## 发送模拟位置

一旦你设置好了模拟模式，你就可以创建模拟位置对象了，然后就可以将它们发送给Location Services。接着，Location Services 又会把这些模拟位置发送给连接的位置clients。Location Services 还可以使用模拟位置来控制地理围栏的触发。

要创建一个新的模拟位置，你要用你的测试数据创建一个新的位置对象。你还需要将提供者的值设为```flp```，接着Location Services把这些信息放到位置对象里面，然后发送出去。下面的代码展示了如何创建一个新的模拟位置：

```java
   private static final String PROVIDER = "flp";
    private static final double LAT = 37.377166;
    private static final double LNG = -122.086966;
    private static final float ACCURACY = 3.0f;
    ...
    /*
     * From input arguments, create a single Location with provider set to
     * "flp"
     */
    public Location createLocation(double lat, double lng, float accuracy) {
        // Create a new Location
        Location newLocation = new Location(PROVIDER);
        newLocation.setLatitude(lat);
        newLocation.setLongitude(lng);
        newLocation.setAccuracy(accuracy);
        return newLocation;
    }
    ...
    // Example of creating a new Location from test data
    Location testLocation = createLocation(LAT, LNG, ACCURACY);
```

在模拟模式里面，你需要使用[LocationClient.setMockLocation()](http://developer.android.com/reference/com/google/android/gms/location/LocationClient.html#setMockLocation(android.location.Location))方法来发送模拟位置给Location Services。 例如：

```java
 mLocationClient.setMockLocation(testLocation);
```

Location Services 将这个模拟位置设为当前位置，接着这个位置会在下一个位置更新来的时候被送出去。如何这个新的模拟位置进入了一个地理围栏，Location Services 会触发这个地理围栏的。

## 运行模拟位置提供应用

这一部分包含了这个模拟位置提供应用的总体概览，然后给你一些使用这个应用测试你自己的代码的一些指导。

### 总体概览

这个模拟位置提供应用从后台运行的已经启动的一个服务发送模拟位置对象给Location Services。通过使用一个已经启动服务，这个应用可以即使在主界面因为系统配置改变被销毁的前提下保持运行状态。通过使用 一个后台线程，这个服务可以执行长时的测试而不会阻塞UI主线程。

这个应用启动的界面可以让你控制发送的模拟数据类型。你有以下可选项：

Pause before test
* 这个参数可以设置应用在开始发送测试数据给Location Services之前要等待的秒数。这个间隔可以允许你在测试开始之前从模拟位置提供应用跳转至当前测试应用。

Send interval
* 这个参数可以设置模拟位置发送周期。你可以参考下面的[测试小技巧](location-testing.html#TestingTips)来了解更多发送周期的设置。

Run once
* 从正常模式转换至模拟模式，运行完测试数据之后，又转换回正常模式，接着便终结服务。

Run continuously
* 从正常模式转换至模拟模式，然后无期限的运行测试数据。 后台线程和启动的服务会一直运行下去，即便主界面被销毁。

Stop test
* 如果处于测试中，那么这个测试会被终止，否则会发回一个警告信息。启动的服务会从模拟模式转回正常模式，然后自己停止自己。这个操作也会停掉后台线程。


在这些选项之外，这个应用还提供了两种状态显示：

App status
* 显示这个应用相关的生命周期信息。

Connection status
* 显示这个连接的位置client相关的状态信息。
会

在这个启动的服务运行的时候，它还会发送测试状态的通知。这些通知可以让你看到即便应用不在前台的时候也能知道它的状态更新。当你点击这些通知的时候，主界面会回到前台来。

### 使用模拟位置提供应用来测试

测试来自模拟位置提供应用的测试模拟位置数据：

1. 在已经安装好了Google Play Services的设备上安装模拟位置提供应用。Location Services是Google Play services的一部分。
2. 在设备上，开启模拟位置选项。要了解如何操作，请参看如何开启设备开发者模式。
3. 从桌面启动应用，然后选择你要设置的选项。
4. 除非你删掉这个pause interval这个特征，要不然应用会暂停几秒钟，然后开始发生模拟位置数据给Location Services。
5. 运行你要测试的应用。在模拟位置提供应用运行的时候，你测试的应用接收的时模拟位置而不是真实地位置。
6. 你可以在模拟应用测试到一半的时候点击停止测试将模式从模拟转换至真实位置。这个操作会强制启动的服务去停掉模拟模式，然后自己停掉自己。当服务自己停掉自己之后，后台线程也会被销毁。

## 测试小贴士

下面的教程包含了创建模拟位置数据以及使用模拟位置数据的一些小贴士。

### 选择一个发送周期

每一个位置提供者在为有Location Services发送的位置服务时都有自己的更新频率。例如，GPS最快的频率也是一秒钟一次更新，WiFi的更新频率最快是5秒钟一次。这些周期时间是真实位置里面的处理周期，但是你在使用模拟位置的时候你需要设置好这些。例如，你的频率不能超过一秒一次。如果你在室内测试，这说明你很依赖WiFi，那么你应该将频率设为5秒一次。

### 模拟速度

为了模拟一个真实设备的速度，缩短或者加长两个连续位置之间的距离。例如，通过每秒改变设备位置88英尺来模拟汽车驾驶，因为这样算出来的时速是60英里。作为比较，通过每秒改变设备位置1.5英尺来模拟跑步，因为换算成时速就是3英里。

### 计算位置数据

通过搜索，你可以找到很多计算指定距离的位置经纬度和两点之间的距离的小程序。事实上，Location类提供了两个计算位置距离的方法：

[distanceBetween()](http://developer.android.com/reference/android/location/Location.html#distanceBetween(double, double, double, double, float[]))
* 计算两个已知经纬度的地点之间的距离的静态方法。

[distanceTo()](http://developer.android.com/reference/android/location/Location.html#distanceTo(android.location.Location))
* 给定一个地点，返回到另一个地点的距离。

### 地理围栏测试

当你的测试一个使用地理围栏探测的应用时，使用反应不同运动模式的测试数据，这些模式包括步行，骑行，驾驶，火车。对于慢的运动模式，可以对位置做较小的更改；相反，对于快的运动模式，可以对位置做较大的更改。

### 管理测试数据

这一课里面的模拟位置提供应用以常量的形式包含了测试经纬度，数据精度。你可能想以其他形式来组织数据：

XML
* 将位置数据保存到XML文件里面。这样将代码和数据分离开，你可以很容易更改数据了。

Server download
* 将位置数据保存到服务器上面，然后使用应用下载下来。因为数据和应用已经完全分隔开来，你可以无需重建应用就可以更改数据了。你还可以直接在服务器上面更改数据然后影响你的模拟位置。。

Recorded data
* 除了生成测试数据，写一个工具应用来记录你的设备在移动的时候产生的地理位置信息。使用这些记录作为你的测试数据，或者使用这些数据来引导你开发测试数据。例如，记录你在步行的时候设备产生的位置信息，然后用它来创建模拟位置，因为这种数据随着时间有比较合适的改变。
