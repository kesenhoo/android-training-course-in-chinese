# 开发辅助服务

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/accessibility/service.html>

本课程将教您：

1. 创建可达性服务(Accessibility Service)

2. 配置可达性服务(Accessibility Service)

3. 响应可达性事件(AccessibilityEvents)

4. 从View层级中提取更多信息

Accessibility Service是Android系统框架提供给安装在设备上应用的一个可选的导航反馈特性。Accessibility Service 可以替代应用与用户交流反馈，比如将文本转化为语音提示，或是用户的手指悬停在屏幕上一个较重要的区域时的触摸反馈等。本课程将教您如何创建一个Accessibility Service，同时处理来自应用的信息，并将这些信息反馈给用户。

## 创建Accessibility Service

Accessibility Service可以绑定在一个正常的应用中，或者是单独的一个Android项目都可以。创建一个Accessibility Service的步骤与创建普通Service的步骤相似，在你的项目中创建一个继承于[AccessibilityService](http://developer.android.com/reference/android/accessibilityservice/AccessibilityService.html)的类：

```java
package com.example.android.apis.accessibility;

import android.accessibilityservice.AccessibilityService;

public class MyAccessibilityService extends AccessibilityService {
...
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
    }

    @Override
    public void onInterrupt() {
    }

...
}
```

与其他Service类似，你必须在manifest文件当中声明这个Service。记得标明它监听处理了`android.accessibilityservice`事件，以便Service在其他应用产生[AccessibilityEvent](http://developer.android.com/reference/android/view/accessibility/AccessibilityEvent.html)的时候被调用。

```xml
<application ...>
...
<service android:name=".MyAccessibilityService">
     <intent-filter>
         <action android:name="android.accessibilityservice.AccessibilityService" />
     </intent-filter>
     . . .
</service>
...
</application>
```

如果你为这个Service创建了一个新项目，且仅仅是一个Service而不准备做成一个应用，那么你就可以移除启动的Activity(一般为MainActivity.java)，同样也记得在manifest中将这个Activity声明移除。

## 配置Accessibility Service

设置Accessibility Service的配置变量会告诉系统如何让Service运行与何时运行。你希望响应哪种类型的事件？Service是否对所有的应用有效还是对部分指定包名的应用有效？使用哪些不同类型的反馈？

你有两种设置这些变量属性的方法，一种向下兼容的办法是通过代码来进行设定，使用`setServiceInfo`([android.accessibilityservice.AccessibilityServiceInfo](http://developer.android.com/reference/android/accessibilityservice/AccessibilityService.html#setServiceInfo(android.accessibilityservice.AccessibilityServiceInfo))。你需要重写(*override*)`onServiceConnected()`方法，并在这里进行Service的配置。

```java
@Override
public void onServiceConnected() {
    // Set the type of events that this service wants to listen to.  Others
    // won't be passed to this service.
    info.eventTypes = AccessibilityEvent.TYPE_VIEW_CLICKED |
            AccessibilityEvent.TYPE_VIEW_FOCUSED;

    // If you only want this service to work with specific applications, set their
    // package names here.  Otherwise, when the service is activated, it will listen
    // to events from all applications.
    info.packageNames = new String[]
            {"com.example.android.myFirstApp", "com.example.android.mySecondApp"};

    // Set the type of feedback your service will provide.
    info.feedbackType = AccessibilityServiceInfo.FEEDBACK_SPOKEN;

    // Default services are invoked only if no package-specific ones are present
    // for the type of AccessibilityEvent generated.  This service *is*
    // application-specific, so the flag isn't necessary.  If this was a
    // general-purpose service, it would be worth considering setting the
    // DEFAULT flag.

    // info.flags = AccessibilityServiceInfo.DEFAULT;

    info.notificationTimeout = 100;

    this.setServiceInfo(info);

}
```

在Android 4.0之后，就用另一种方式来设置了：通过设置XML文件来进行配置。一些特性的选项比如`canRetrieveWindowContent`仅仅可以在XML可以配置。对于上面所示的相应的配置，利用XML配置如下：

```xml
<accessibility-service
     android:accessibilityEventTypes="typeViewClicked|typeViewFocused"
     android:packageNames="com.example.android.myFirstApp, com.example.android.mySecondApp"
     android:accessibilityFeedbackType="feedbackSpoken"
     android:notificationTimeout="100"
     android:settingsActivity="com.example.android.apis.accessibility.TestBackActivity"
     android:canRetrieveWindowContent="true"
/>
```
如果你确定是通过XML进行配置，那么请确保在manifest文件中通过< meta-data >标签指定这个配置文件。假设此配置文件存放的地址为：`res/xml/serviceconfig.xml`，那么标签应该如下:

```xml
<service android:name=".MyAccessibilityService">
     <intent-filter>
         <action android:name="android.accessibilityservice.AccessibilityService" />
     </intent-filter>
     <meta-data android:name="android.accessibilityservice"
     android:resource="@xml/serviceconfig" />
</service>
```

## 响应Accessibility Event

现在你的Service已经配置好并可以监听Accessibility Event了，来写一些响应这些事件的代码吧！首先就是要重写*onAccessibilityEvent(AccessibilityEvent)*方法，在这个方法中，使用`getEventType()`来确定事件的类型，使用`getContentDescription()`来提取产生事件的View的相关的文本标签。

```java
@Override
public void onAccessibilityEvent(AccessibilityEvent event) {
    final int eventType = event.getEventType();
    String eventText = null;
    switch(eventType) {
        case AccessibilityEvent.TYPE_VIEW_CLICKED:
            eventText = "Focused: ";
            break;
        case AccessibilityEvent.TYPE_VIEW_FOCUSED:
            eventText = "Focused: ";
            break;
    }

    eventText = eventText + event.getContentDescription();

    // Do something nifty with this text, like speak the composed string
    // back to the user.
    speakToUser(eventText);
    ...
}
```

## 从View层级中提取更多信息

这一步并不是必要步骤，但是却非常有用。Android 4.0版本中增加了一个新特性，就是能够用AccessibilityService来遍历View层级，并从产生Accessibility 事件的组件与它的父子组件中提取必要的信息。为了实现这个目的，你需要在XML文件中进行如下的配置：

```xml
android:canRetrieveWindowContent="true"
```

一旦完成，使用[getSource()](http://developer.android.com/reference/android/view/accessibility/AccessibilityRecord.html#getSource())获取一个[AccessibilityNodeInfo](http://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.html)对象，如果触发事件的窗口是活动窗口，该调用只返回一个对象，如果不是,它将返回null，做出相应的反响。下面的示例是一个代码片段,当它接收到一个事件时,执行以下步骤:


1. 立即获取到产生这个事件的Parent
2. 在这个Parent中寻找文本标签或勾选框
3. 如果找到，创建一个文本内容来反馈给用户，提示内容和是否已勾选。
4. 如果当遍历View的时候某处返回了null值，那么就直接结束这个方法。

```java
// Alternative onAccessibilityEvent, that uses AccessibilityNodeInfo

@Override
public void onAccessibilityEvent(AccessibilityEvent event) {

    AccessibilityNodeInfo source = event.getSource();
    if (source == null) {
        return;
    }

    // Grab the parent of the view that fired the event.
    AccessibilityNodeInfo rowNode = getListItemNodeInfo(source);
    if (rowNode == null) {
        return;
    }

    // Using this parent, get references to both child nodes, the label and the checkbox.
    AccessibilityNodeInfo labelNode = rowNode.getChild(0);
    if (labelNode == null) {
        rowNode.recycle();
        return;
    }

    AccessibilityNodeInfo completeNode = rowNode.getChild(1);
    if (completeNode == null) {
        rowNode.recycle();
        return;
    }

    // Determine what the task is and whether or not it's complete, based on
    // the text inside the label, and the state of the check-box.
    if (rowNode.getChildCount() < 2 || !rowNode.getChild(1).isCheckable()) {
        rowNode.recycle();
        return;
    }

    CharSequence taskLabel = labelNode.getText();
    final boolean isComplete = completeNode.isChecked();
    String completeStr = null;

    if (isComplete) {
        completeStr = getString(R.string.checked);
    } else {
        completeStr = getString(R.string.not_checked);
    }
    String reportStr = taskLabel + completeStr;
    speakToUser(reportStr);
}
```
现在你已经实现了一个完整可运行的Accessibility Service。尝试着调整它与用户的交互方式吧！比如添加语音引擎，或者添加震动来提供触觉上的反馈都是不错的选择！
