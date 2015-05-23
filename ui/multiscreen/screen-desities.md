# 兼容不同的屏幕密度

> 编写:[riverfeng](https://github.com/riverfeng) - 原文:<http://developer.android.com/training/multiscreen/screendensities.html>

这节课将教你如何通过提供不同的资源和使用独立分辨率（dp）来支持不同的屏幕密度。

## 使用密度独立像素（dp）

设计布局时，要避免使用绝对像素（absolutepixels）定义距离和尺寸。使用像素单位来定义布局大小是有问题的。因为，不同的屏幕有不同的像素密度，所以，同样单位的像素在不同的设备上会有不同的物理尺寸。因此，在指定单位的时候，通常使用dp或者sp。一个dp代表一个密度独立像素，也就相当于在160 dpi的一个像素的物理尺寸，sp也是一个基本的单位，不过它主要是用在文本尺寸上（它也是一种尺寸规格独立的像素），所以，你在定义文本尺寸的时候应该使用这种规格单位（不要使用在布尺寸上）。

例如，当你是定义两个view之间的空间时，应该使用dp而不是px：
```xml
<Button android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/clickme"
    android:layout_marginTop="20dp" />
```
当指定文本尺寸时，始终应该使用sp：
```xml
<TextView android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:textSize="20sp" />
```

## 提供可供选择的图片

因为Android能运行在很多不同屏幕密度的设备上，所以，你应该针对不同的设备密度提供不同的bitmap资源：小屏幕（low），medium（中），high（高）以及超高（extra-high）密度。这将能帮助你在所有的屏幕密度中得到非常好的图形质量和性能。

为了提供更好的用户体验，你应该使用以下几种规格来缩放图片大小，为不同的屏幕密度提供相应的位图资源：
```xml
xhdpi:2.0
hdpi:1.5
mdpi:1.0(标准线)
ldpi:0.75
```

这也就意味着如果在xhdpi设备上你需要一个200x200的图片，那么你则需要一张150x150的图片用于hdpi，100x100的用于mdpi以及75x75的用户ldpi设备。

然后将这些图片资源放到res/对应的目录下面，系统会自动根据当前设备屏幕密度自动去选择合适的资源进行加载：
```xml
MyProject/
  res/
    drawable-xhdpi/
        awesomeimage.png
    drawable-hdpi/
        awesomeimage.png
    drawable-mdpi/
        awesomeimage.png
    drawable-ldpi/
        awesomeimage.png
```
这样放置图片资源后，不论你什么时候使用@drawable/awesomeimage，系统都会给予屏幕的dp来选择合适的图片。

如果你想知道更多关于如何为你的应用程序创建icon资源，你可以看看Icon设计指南[Icon Design Guidelines](http://developer.android.com/guide/practices/ui_guidelines/icon_design.html).
