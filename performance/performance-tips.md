# Performance Tips

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/articles/perf-tips.html>


这篇文章主要是介绍了一些小细节的优化技巧，当这些小技巧综合使用起来的时候，对于整个App的性能提升还是有作用的，只是不能较大幅度的提升性能而已。选择合适的算法与数据结构才应该是你首要考虑的因素，在这篇文章中不会涉及这方面。你应该使用这篇文章中的小技巧作为平时写代码的习惯，这样能够提升代码的效率。

<!-- more -->

通常来说，高效的代码需要满足下面两个规则：

* 不要做冗余的动作
* 如果能避免，尽量不要分配内存

代码的执行效果会受到设备CPU,设备内存,系统版本等诸多因素的影响。为了确保代码能够在不同设备上都运行良好，需要最大化代码的效率。

## 避免创建不必要的对象
虽然GC可以回收不用的对象，可是为这些对象分配内存，并回收它们同样是需要耗费资源的。
因此请尽量避免创建不必要的对象，有下面一些例子来说明这个问题：

* 如果你需要返回一个String对象，并且你知道它最终会需要连接到一个StringBuffer，请修改你的实现方式，避免直接进行连接操作，应该采用创建一个临时对象来做这个操作.
* 当从输入的数据集中抽取出Strings的时候，尝试返回原数据的substring对象，而不是创建一个重复的对象。

一个稍微激进点的做法是把所有多维的数据分解成1维的数组:

* 一组int数据要比一组Integer对象要好很多。可以得知，两组1维数组要比一个2维数组更加的有效率。同样的，这个道理可以推广至其他原始数据类型。
* 如果你需要实现一个数组用来存放(Foo,Bar)的对象，尝试分解为Foo[]与Bar[]要比(Foo,Bar)好很多。(当然，为了某些好的API的设计，可以适当做一些妥协。但是在自己的代码内部，你应该多多使用分解后的容易。

通常来说，需要避免创建更多的对象。更少的对象意味者更少的GC动作，GC会对用户体验有比较直接的影响。

## 选择Static而不是Virtual
如果你不需要访问一个对象的值域,请保证这个方法是static类型的,这样方法调用将快15%-20%。这是一个好的习惯，因为你可以从方法声明中得知调用无法改变这个对象的状态。

## 常量声明为Static Final
先看下面这种声明的方式
```java
static int intVal = 42;
static String strVal = "Hello, world!";
```
编译器会使用<clinit>方法来初始化上面的值，之后访问的时候会需要先到它那里查找，然后才返回数据。我们可以使用static final来提升性能：
```java
static final int intVal = 42;
static final String strVal = "Hello, world!";
```
这时再也不需要上面的那个方法来做多余的查找动作了。
** 所以，请尽可能的为常量声明为static final类型的。**

## 避免内部的Getters/Setters
像C++等native language,通常使用getters(i = getCount())而不是直接访问变量(i = mCount).这是编写C++的一种优秀习惯，而且通常也被其他面向对象的语言所采用，例如C#与Java，因为编译器通常会做inline访问，而且你需要限制或者调试变量，你可以在任何时候在getter/setter里面添加代码。
然而，在Android上，这是一个糟糕的写法。Virtual method的调用比起直接访问变量要耗费更多。那么合理的做法是：在面向对象的设计当中应该使用getter/setter，但是在类的内部你应该直接访问变量.
没有JIT(Just In Time Compiler)时，直接访问变量的速度是调用getter的3倍。有JIT时,直接访问变量的速度是通过getter访问的7倍。
请注意，如果你使用[ProGuard](http://developer.android.com/tools/help/proguard.html), 你可以获得同样的效果，因为ProGuard可以为你inline accessors.

## 使用增强的For循环
请比较下面三种循环的方法：

```java
static class Foo {
    int mSplat;
}

Foo[] mArray = ...

public void zero() {
    int sum = 0;
    for (int i = 0; i < mArray.length; ++i) {
        sum += mArray[i].mSplat;
    }
}

public void one() {
    int sum = 0;
    Foo[] localArray = mArray;
    int len = localArray.length;

    for (int i = 0; i < len; ++i) {
        sum += localArray[i].mSplat;
    }
}

public void two() {
    int sum = 0;
    for (Foo a : mArray) {
        sum += a.mSplat;
    }
}
```

* zero()是最慢的，因为JIT没有办法对它进行优化。
* one()稍微快些。
* two() 在没有做JIT时是最快的，可是如果经过JIT之后，与方法one()是差不多一样快的。它使用了增强的循环方法for-each。

所以请尽量使用for-each的方法，但是对于ArrayList，请使用方法one()。

## 使用包级访问而不是内部类的私有访问
参考下面一段代码

```java
public class Foo {
    private class Inner {
        void stuff() {
            Foo.this.doStuff(Foo.this.mValue);
        }
    }

    private int mValue;

    public void run() {
        Inner in = new Inner();
        mValue = 27;
        in.stuff();
    }

    private void doStuff(int value) {
        System.out.println("Value is " + value);
    }
}
```

这里重要的是，我们定义了一个私有的内部类（Foo$Inner），它直接访问了外部类中的私有方法以及私有成员对象。这是合法的，这段代码也会如同预期一样打印出"Value is 27"。

问题是，VM因为Foo和Foo$Inner是不同的类，会认为在Foo$Inner中直接访问Foo类的私有成员是不合法的。即使Java语言允许内部类访问外部类的私有成员。为了去除这种差异，编译器会产生一些仿造函数：

```java
/*package*/ static int Foo.access$100(Foo foo) {
    return foo.mValue;
}
/*package*/ static void Foo.access$200(Foo foo, int value) {
    foo.doStuff(value);
}
```

每当内部类需要访问外部类中的mValue成员或需要调用doStuff()函数时，它都会调用这些静态方法。这意味着，上面的代码可以归结为，通过accessor函数来访问成员变量。早些时候我们说过，通过accessor会比直接访问域要慢。所以，这是一个特定语言用法造成性能降低的例子。

如果你正在性能热区（hotspot:高频率、重复执行的代码段）使用像这样的代码，你可以把内部类需要访问的域和方法声明为包级访问，而不是私有访问权限。不幸的是，这意味着在相同包中的其他类也可以直接访问这些域，所以在公开的API中你不能这样做。

## 避免使用float类型
Android系统中float类型的数据存取速度是int类型的一半，尽量优先采用int类型。

## 使用库函数
尽量使用System.arraycopy()等一些封装好的库函数，它的效率是手动编写copy实现的9倍多。

** Tip: Also see Josh Bloch's Effective Java, item 47. **

## 谨慎使用native函数
当你需要把已经存在的native code迁移到Android，请谨慎使用JNI。如果你要使用JNI,请学习[JNI Tips](http://developer.android.com/guide/practices/jni.html)

## 关于性能的误区
在没有做JIT之前，使用一种确切的数据类型确实要比抽象的数据类型速度要更有效率。(例如，使用HashMap要比Map效率更高。) 有误传效率要高一倍，实际上只是6%左右。而且，在JIT之后，他们直接并没有大多差异。

## 关于测量
上面文档中出现的数据是Android的实际运行效果。我们可以用[Traceview](http://developer.android.com/tools/debugging/debugging-tracing.html) 来测量，但是测量的数据是没有经过JIT优化的，所以实际的效果应该是要比测量的数据稍微好些。

关于如何测量与调试，还可以参考下面两篇文章：

* [Profiling with Traceview and dmtracedump](http://developer.android.com/tools/debugging/debugging-tracing.html)
* [Analysing Display and Performance with Systrace](http://developer.android.com/tools/debugging/systrace.html)
