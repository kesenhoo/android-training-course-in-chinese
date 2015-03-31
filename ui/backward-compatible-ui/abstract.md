# 抽象出新的APIs

> 编写:[spencer198711](https://github.com/spencer198711) - 原文:<http://developer.android.com/training/backward-compatible-ui/abstracting.html>

假如你想使用[Action Bar Tabs](http://developer.android.com/guide/topics/ui/actionbar.html#Tabs)作为你的应用的顶层导航的主要形式。不幸的是，[ActionBar](http://developer.android.com/reference/android/app/ActionBar.html) APIs只在Android 3.0（API等级11）之后才能使用。因此，如果你想要在运行之前版本的Android平台的设备上分发你的应用，你需要提供一个支持新的API的实现，同时提供一个回退机制，使得能够使用旧的APIs。

在本课程中，使用了具有面向特定版本实现的抽象类去构建一个tab页形式的用户界面，并以此提供向后兼容性。这一课描述了如何为新的tab API创建一个抽象层，并以此作为构建tab组件的第一步。

## 为抽象做准备

在Java编程语言中，抽象包含了创建一个或者多个接口或抽象类去隐藏具体的实现细节。在新版本的Android API的情况中，你可以使用抽象去构建能感知版本的组件，这个组件会在新版本的设备上使用当前的APIs，当回退到老的设备上同时存在兼容的APIs。

当使用这种方法时，你首先需要决定哪些要使用的类需要提供向后兼容，然后去根据新类中的public接口去创建抽象类。在创建抽象接口的过程中，你应该尽可能多的为新APIs创建镜像。这会最大化前向兼容性，使得在将来当这些接口不再需要的时候，废弃这些接口会更加容易。

在为新的APIs创建抽象类之后，任何数量的实现都可以在运行的过程中去创建和选择使用哪种。出于后向兼容的目的，这些实现可以通过所需的API级别而有所变化。一个实现可能会使用最新发布的APIs，而其他的则会去使用比较老的APIs。

## 创建抽象的Tab接口

为了能够创建一个向后兼容的tabs，你首先需要决定你的应用需要哪些功能和哪些特定的APIs接口。在顶层分节tabs的情况下，假设你有以下功能需求：

1. 显示图标和文本的Tab指示器
2. Tabs可以跟一个Fragment实例向关联
3. Activity可以监听到Tab变化

提前准备这些需求能够让你控制抽象层的范围。这意味着你可以花更少的时间去创建抽象层的多个具体实现，并很快就能使用这些新的后向兼容的实现。

Tabs的关键APIs是[ActionBar](http://developer.android.com/reference/android/app/ActionBar.html)和[ActionBar.Tab](http://developer.android.com/reference/android/app/ActionBar.Tab.html)，为了能够使得tab能够感知Android版本，这些是需要抽象出来的APIs。这个示例项目的需求要求同Eclair(API等级5)保持一致性，同时能够利用Honeycomb(API等级11)中新的tab功能。一张展示能够支持这两种实现的类结构和它们的抽象父类的图显示如下：

![backward-compatible-ui-classes](backward-compatible-ui-classes.png)

* 图1.抽象基类和版本相关的子类实现类结构图

## Abstract ActionBar.Tab

通过创建一个代表tab的抽象类来开始着手构建tab抽象层，这个类是[Actionbar.Tab](http://developer.android.com/reference/android/app/ActionBar.Tab.html)接口的镜像:

```java
public abstract class CompatTab {
    ...
    public abstract CompatTab setText(int resId);
    public abstract CompatTab setIcon(int resId);
    public abstract CompatTab setTabListener(
            CompatTabListener callback);
    public abstract CompatTab setFragment(Fragment fragment);
	public abstract CharSequence getText();
    public abstract Drawable getIcon();
    public abstract CompatTabListener getCallback();
    public abstract Fragment getFragment();
    ...
}
```

在这里，为了简化诸如tab对象和Activity的联系（未在代码片段中显示）等公共的功能，你可以使用一个抽象类而不是去使用接口。

## 抽象出Action Bar Tab的方法

下一步，定义一个能够允许你往Activity中创建和添加tab抽象类，并定义类似[ActionBar.newTab()](http://developer.android.com/reference/android/app/ActionBar.html#newTab())和[ActionBar.addTab()](http://developer.android.com/reference/android/app/ActionBar.html#addTab(android.app.ActionBar.Tab))的方法。

```java
public abstract class TabHelper {
    ...
	public CompatTab newTab(String tag) {
        // This method is implemented in a later lesson.
    }
	public abstract void addTab(CompatTab tab);
	...
}
```

在下一课程中，你将会创建TabHelper和CompatTab的实现，它能够在新旧不同的平台版本上都能工作。
