# 代码性能优化建议

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/articles/perf-tips.html>

这篇文章主要介绍一些小细节的优化技巧，虽然这些小技巧不能较大幅度的提升应用性能，但是恰当的运用这些小技巧并发生累积效应的时候，对于整个App的性能提升还是有不小作用的。通常来说，选择合适的算法与数据结构会是你首要考虑的因素，在这篇文章中不会涉及这方面的知识点。你应该使用这篇文章中的小技巧作为平时写代码的习惯，这样能够提升代码的效率。

通常来说，高效的代码需要满足下面两个原则：

* 不要做冗余的工作
* 尽量避免执行过多的内存分配操作

在优化App时其中一个难点就是让App能在各种型号的设备上运行。不同版本的虚拟机在不同的处理器上会有不同的运行速度。你甚至不能简单的认为“设备X的速度是设备Y的F倍”，然后还用这种倍数关系去推测其他设备。另外，在模拟器上的运行速度和在实际设备上的速度没有半点关系。同样，设备有没有JIT也对运行速度有重大影响：在有JIT情况下的最优化代码不一定在没有JIT的情况下也是最优的。

为了确保App在各设备上都能良好运行，就要确保你的代码在不同档次的设备上都尽可能的优化。

## 避免创建不必要的对象

创建对象从来不是免费的。**Generational GC**可以使临时对象的分配变得廉价一些，但是执行分配内存总是比不执行分配操作更昂贵。

随着你在App中分配更多的对象，你可能需要强制gc，而gc操作会给用户体验带来一点点卡顿。虽然从Android 2.3开始，引入了并发gc，它可以帮助你显著提升gc的效率，减轻卡顿，但毕竟不必要的内存分配操作还是应该尽量避免。

因此请尽量避免创建不必要的对象，有下面一些例子来说明这个问题：

* 如果你需要返回一个String对象，并且你知道它最终会需要连接到一个`StringBuffer`，请修改你的函数实现方式，避免直接进行连接操作，应该采用创建一个临时对象来做字符串的拼接这个操作。
* 当从已经存在的数据集中抽取出String的时候，尝试返回原数据的substring对象，而不是创建一个重复的对象。使用substring的方式，你将会得到一个新的String对象，但是这个string对象是和原string共享内部`char[]`空间的。

一个稍微激进点的做法是把所有多维的数据分解成一维的数组:

* 一组int数据要比一组Integer对象要好很多。可以得知，两组一维数组要比一个二维数组更加的有效率。同样的，这个道理可以推广至其他原始数据类型。
* 如果你需要实现一个数组用来存放(Foo,Bar)的对象，记住使用Foo[]与Bar[]要比(Foo,Bar)好很多。(例外的是，为了某些好的API的设计，可以适当做一些妥协。但是在自己的代码内部，你应该多多使用分解后的容易）。

通常来说，需要避免创建更多的临时对象。更少的对象意味者更少的gc动作，gc会对用户体验有比较直接的影响。

## 选择Static而不是Virtual

如果你不需要访问一个对象的值，请保证这个方法是static类型的，这样方法调用将快15%-20%。这是一个好的习惯，因为你可以从方法声明中得知调用无法改变这个对象的状态。

## 常量声明为Static Final

考虑下面这种声明的方式

```java
static int intVal = 42;
static String strVal = "Hello, world!";
```

编译器会使用一个初始化类的函数<clinit>，然后当类第一次被使用的时候执行。这个函数将42存入`intVal`，还从class文件的常量表中提取了`strVal`的引用。当之后使用`intVal`或`strVal`的时候，他们会直接被查询到。

我们可以用`final`关键字来优化：

```java
static final int intVal = 42;
static final String strVal = "Hello, world!";
```

这时再也不需要上面的<clinit>方法了，因为final声明的常量进入了静态dex文件的域初始化部分。调用`intVal`的代码会直接使用42，调用`strVal`的代码也会使用一个相对廉价的“字符串常量”指令，而不是查表。

> **Notes：**这个优化方法只对原始类型和String类型有效，而不是任意引用类型。不过，在必要时使用`static final`是个很好的习惯。

## 避免内部的Getters/Setters

像C++等native language，通常使用getters(i = getCount())而不是直接访问变量(i = mCount)。这是编写C++的一种优秀习惯，而且通常也被其他面向对象的语言所采用，例如C#与Java，因为编译器通常会做inline访问，而且你需要限制或者调试变量，你可以在任何时候在getter/setter里面添加代码。

然而，在Android上，这不是一个好的写法。虚函数的调用比起直接访问变量要耗费更多。在面向对象编程中，将getter和setting暴露给公用接口是合理的，但在类内部应该仅仅使用域直接访问。

在没有JIT(Just In Time Compiler)时，直接访问变量的速度是调用getter的3倍。有JIT时，直接访问变量的速度是通过getter访问的7倍。

请注意，如果你使用[ProGuard](http://developer.android.com/tools/help/proguard.html)，你可以获得同样的效果，因为ProGuard可以为你inline accessors.

## 使用增强的For循环

增强的For循环（也被称为 for-each 循环）可以被用在实现了 Iterable 接口的 collections 以及数组上。使用collection的时候，Iterator会被分配，用于for-each调用`hasNext()`和`next()`方法。使用ArrayList时，手写的计数式for循环会快3倍（不管有没有JIT），但是对于其他collection，增强的for-each循环写法会和迭代器写法的效率一样。

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

> **Tips：**你还可以参考 Josh Bloch 的 《Effective Java》这本书的第46条

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

这里重要的是，我们定义了一个私有的内部类（`Foo$Inner`），它直接访问了外部类中的私有方法以及私有成员对象。这是合法的，这段代码也会如同预期一样打印出"Value is 27"。

问题是，VM因为`Foo`和`Foo$Inner`是不同的类，会认为在`Foo$Inner`中直接访问`Foo`类的私有成员是不合法的。即使Java语言允许内部类访问外部类的私有成员。为了去除这种差异，编译器会产生一些仿造函数：

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

就速度而言，现代硬件上，float 和 double 的速度是一样的。空间而言，double 是两倍float的大小。在空间不是问题的情况下，你应该使用 double 。

同样，对于整型，有些处理器实现了硬件几倍的乘法，但是没有除法。这时，整型的除法和取余是在软件内部实现的，这在你使用哈希表或大量计算操作时要考虑到。

## 使用库函数

除了那些常见的让你多使用自带库函数的理由以外，记得系统函数有时可以替代第三方库，并且还有汇编级别的优化，他们通常比带有JIT的Java编译出来的代码更高效。典型的例子是：Android API 中的 `String.indexOf()`，Dalvik出于内联性能考虑将其替换。同样 `System.arraycopy()`函数也被替换，这样的性能在Nexus One测试，比手写的for循环并使用JIT还快9倍。

> **Tips：**参见 Josh Bloch 的 《Effective Java》这本书的第47条

## 谨慎使用native函数

结合Android NDK使用native代码开发，并不总是比Java直接开发的效率更好的。Java转native代码是有代价的，而且JIT不能在这种情况下做优化。如果你在native代码中分配资源（比如native堆上的内存，文件描述符等等），这会对收集这些资源造成巨大的困难。你同时也需要为各种架构重新编译代码（而不是依赖JIT）。你甚至对已同样架构的设备都需要编译多个版本：为G1的ARM架构编译的版本不能完全使用Nexus One上ARM架构的优势，反之亦然。

Native 代码是在你已经有本地代码，想把它移植到Android平台时有优势，而不是为了优化已有的Android Java代码使用。

如果你要使用JNI,请学习[JNI Tips](http://developer.android.com/guide/practices/jni.html)

> **Tips：**参见 Josh Bloch 的 《Effective Java》这本书的第54条

## 关于性能的误区

在没有JIT的设备上，使用一种确切的数据类型确实要比抽象的数据类型速度要更有效率（例如，调用`HashMap map`要比调用`Map map`效率更高）。有误传效率要高一倍，实际上只是6%左右。而且，在JIT之后，他们直接并没有大多差异。

在没有JIT的设备上，读取缓存域比直接读取实际数据大概快20%。有JIT时，域读取和本地读取基本无差。所以优化并不值得除非你觉得能让你的代码更易读（这对 final, static, static final 域同样适用）。

## 关于测量

在优化之前，你应该确定你遇到了性能问题。你应该确保你能够准确测量出现在的性能，否则你也不会知道优化是否真的有效。

本章节中所有的技巧都需要Benchmark（基准测试）的支持。Benchmark可以在 [code.google.com "dalvik" project](http://code.google.com/p/dalvik/source/browse/#svn/trunk/benchmarks) 中找到

Benchmark是基于Java版本的 [Caliper](http://code.google.com/p/caliper/) microbenchmarking框架开发的。Microbenchmarking很难做准确，所以Caliper帮你完成这部分工作，甚至还帮你测了你没想到需要测量的部分（因为，VM帮你管理了代码优化，你很难知道这部分优化有多大效果）。我们强烈推荐使用Caliper来做你的基准微测工作。

我们也可以用[Traceview](http://developer.android.com/tools/debugging/debugging-tracing.html) 来测量，但是测量的数据是没有经过JIT优化的，所以实际的效果应该是要比测量的数据稍微好些。

关于如何测量与调试，还可以参考下面两篇文章：

* [Profiling with Traceview and dmtracedump](http://developer.android.com/tools/debugging/debugging-tracing.html)
* [Analysing Display and Performance with Systrace](http://developer.android.com/tools/debugging/systrace.html)
