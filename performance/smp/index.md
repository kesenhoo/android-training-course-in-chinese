# SMP(Symmetric Multi-Processor) Primer for Android

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/articles/smp.html>

从Android 3.0开始，系统针对多核CPU架构的机器做了优化支持。这份文档介绍了针对多核系统应该如何编写C，C++以及Java程序。这里只是作为Android应用开发者的入门教程，并不会深入讨论这个话题，并且我们会把讨论范围集中在ARM架构的CPU上。

如果你并没有时间学习整篇文章，你可以跳过前面的理论部分，直接查看实践部分。但是我们并不建议这样做。

## 0)简要介绍

**SMP** 的全称是“**Symmetric Multi-Processor**”。 它表示的是一种双核或者多核CPU的设计架构。在几年前，所有的Android设备都还是单核的。

大多数的Android设备已经有了多个CPU，但是通常来说，其中一个CPU负责执行程序，其他的CPU则处理设备硬件的相关事务（例如，音频）。这些CPU可能有着不同的架构，运行在上面的程序无法在内存中彼此进行沟通交互。

目前大多数售卖的Android设备都是SMP架构的，这使得软件开发者处理问题更加复杂。对于多线程的程序，如果多个线程执行在不同的内核上，这会使得程序更加容易发生**race conditions**。 更糟糕的是，基于ARM架构的SMP比起x86架构来说，更加复杂，更难进行处理。那些在x86上测试通过的程序可能会在ARM上崩溃。

下面我们会介绍为何会这样以及如何做才能够使得你的代码行为正常。

## 1)理论篇

这里会快速并且简要的介绍这个复杂的主题。其中一些部分并不完整，但是并没有出现错误或者误导。

查看文章末尾的[**进一步阅读**]()可以了解这个主题的更多知识。

### 1.1)内存一致性模型(Memory consistency models)

内存一致性模型(Memory consistency models)通常也被叫做“memory models”，描述了硬件架构如何确保内存访问的一致性。例如，如果你对地址A进行了一个赋值，然后对地址B也进行了赋值，那么内存一致性模型就需要确保每一个CPU都需要知道刚才的操作赋值与操作顺序。

这个模型通常被程序员称为：**顺序一致性(sequential consistency)**, 请从文章末尾的**进一步阅读**查看**Adve & Gharachorloo**这篇文章。

* 所有的内存操作每次只能执行一个。
* 所有的操作，在单核CPU上，都是顺序执行的。

如果你关注一段代码在内存中的读写操作，在sequentially-consistent的CPU架构上，是按照期待的顺序执行的。It’s possible that the CPU is actually reordering instructions and delaying reads and writes, but there is no way for code running on the device to tell that the CPU is doing anything other than execute instructions in a straightforward manner. (We’re ignoring memory-mapped device driver I/O for the moment.)

To illustrate these points it’s useful to consider small snippets of code, commonly referred to as litmus tests. These are assumed to execute in program order, that is, the order in which the instructions appear here is the order in which the CPU will execute them. We don’t want to consider instruction reordering performed by compilers just yet.

Here’s a simple example, with code running on two threads:

Thread 1	Thread 2
A = 3
B = 5	reg0 = B
reg1 = A

| Thread 1 | Thread 2 |
| -- | -- |
| A = 3 B = 5 | reg0 = B reg1 = A |

In this and all future litmus examples, memory locations are represented by capital letters (A, B, C) and CPU registers start with “reg”. All memory is initially zero. Instructions are executed from top to bottom. Here, thread 1 stores the value 3 at location A, and then the value 5 at location B. Thread 2 loads the value from location B into reg0, and then loads the value from location A into reg1. (Note that we’re writing in one order and reading in another.)

Thread 1 and thread 2 are assumed to execute on different CPU cores. You should always make this assumption when thinking about multi-threaded code.

Sequential consistency guarantees that, after both threads have finished executing, the registers will be in one of the following states:

| Registers	| States |
| -- | -- |
| reg0=5, reg1=3	| possible (thread 1 ran first) |
| reg0=0, reg1=0	| possible (thread 2 ran first) |
| reg0=0, reg1=3	| possible (concurrent execution) |
| reg0=5, reg1=0	| never |

To get into a situation where we see B=5 before we see the store to A, either the reads or the writes would have to happen out of order. On a sequentially-consistent machine, that can’t happen.

Most uni-processors, including x86 and ARM, are sequentially consistent. Most SMP systems, including x86 and ARM, are not.

#### 1.1.1)Processor consistency
#### 1.1.2)CPU cache behavior
#### 1.1.3)Observability
#### 1.1.4)ARM’s weak ordering

### 1.2)Data memory barriers

#### 1.2.1)Store/store and load/load
#### 1.2.2)Load/store and store/load
#### 1.2.3)Barrier instructions
#### 1.2.4)Address dependencies and causal consistency
#### 1.2.5)Memory barrier summary

### 1.3)Atomic operations

#### 1.3.1)Atomic essentials
#### 1.3.2)Atomic + barrier pairing
#### 1.3.3)Acquire and release


## 2)实践篇

调试内存一致性(memory consistency)的问题非常困难。如果内存栅栏(memory barrier)导致一些代码读取到陈旧的数据，你将无法通过调试器检查内存dumps文件来找出原因。By the time you can issue a debugger query, the CPU cores will have all observed the full set of accesses, and the contents of memory and the CPU registers will appear to be in an “impossible” state.

### 2.1)What not to do in C
#### 2.1.1)C/C++ and “volatile”
#### 2.1.2)Examples

### 2.2)在Java中不应该做的事

我们没有讨论过Java语言的一些相关特性，因此我们首先来简要的看下那些特性。

#### 2.2.1)Java中的"synchronized"与"volatile"关键字

**“synchronized”**关键字提供了Java一种内置的锁机制。每一个对象都有一个相对应的“monitor”，这个监听器可以提供互斥的访问。

“synchronized”代码段的实现机制与自旋锁(spin lock)有着相同的基础结构: 他们都是从获取到CAS开始，以释放CAS结束。这意味着编译器(compilers)与代码优化器(code optimizers)可以轻松的迁移代码到“synchronized”代码段中。一个实践结果是：你**不能**判定synchronized代码段是执行在这段代码下面一部分的前面，还是这段代码上面一部分的后面。更进一步，如果一个方法有两个synchronized代码段并且锁住的是同一个对象，那么在这两个操作的中间代码都无法被其他的线程所检测到，编译器可能会执行“锁粗化lock coarsening”并且把这两者绑定到同一个代码块上。

另外一个相关的关键字是**“volatile”**。在Java 1.4以及之前的文档中是这样定义的：volatile声明和对应的C语言中的一样可不靠。从Java 1.5开始，提供了更有力的保障，甚至和synchronization一样具备强同步的机制。

volatile的访问效果可以用下面这个例子来说明。如果线程1给volatile字段做了赋值操作，线程2紧接着读取那个字段的值，那么线程2是被确保能够查看到之前线程1的任何写操作。更通常的情况是，**任何**线程对那个字段的写操作对于线程2来说都是可见的。实际上，写volatile就像是释放件监听器，读volatile就像是获取监听器。

非volatile的访问有可能因为照顾volatile的访问而需要做顺序的调整。例如编译器可能会往上移动一个非volatile加载操作，但是不会往下移动。Volatile之间的访问不会因为彼此而做出顺序的调整。虚拟机会注意处理如何的内存栅栏(memory barriers)。

当加载与保存大多数的基础数据类型，他们都是原子的atomic, 对于long以及double类型的数据则不具备原子型，除非他们被声明为volatile。即使是在单核处理器上，并发多线程更新非volatile字段值也还是不确定的。

#### 2.2.2)Examples

下面是一个错误实现的单步计数器(monotonic counter)的示例: ([Java theory and practice: Managing volatility](smp.html#more)).

```java
class Counter {
    private int mValue;

    public int get() {
        return mValue;
    }
    public void incr() {
        mValue++;
    }
}
```

假设get()与incr()方法是被多线程调用的。然后我们想确保当get()方法被调用时，每一个线程都能够看到当前的数量。最引人注目的问题是mValue++实际上包含了下面三个操作。

1. reg = mValue
2. reg = reg + 1
3. mValue = reg

如果两个线程同时在执行`incr()`方法，其中的一个更新操作会丢失。为了确保正确的执行`++`的操作，我们需要把`incr()`方法声明为“synchronized”。这样修改之后，这段代码才能够在单核多线程的环境中正确的执行。

然而，在SMP的系统下还是会执行失败。不同的线程通过`get()`方法获取到得值可能是不一样的。因为我们是使用通常的加载方式来读取这个值的。我们可以通过声明`get()`方法为synchronized的方式来修正这个错误。通过这些修改，这样的代码才是正确的了。

不幸的是，我们有介绍过有可能发生的锁竞争(lock contention)，这有可能会伤害到程序的性能。除了声明`get()`方法为synchronized之外，我们可以声明`mValue`为**“volatile”**. (请注意`incr()`必须使用synchronize) 现在我们知道volatile的mValue的写操作对于后续的读操作都是可见的。`incr()`将会稍稍有点变慢，但是`get()`方法将会变得更加快速。因此读操作多于写操作时，这会是一个比较好的方案。(请参考AtomicInteger.)

下面是另外一个示例，和之前的C示例有点类似：

```java
class MyGoodies {
    public int x, y;
}
class MyClass {
    static MyGoodies sGoodies;

    void initGoodies() {    // runs in thread 1
        MyGoodies goods = new MyGoodies();
        goods.x = 5;
        goods.y = 10;
        sGoodies = goods;
    }

    void useGoodies() {    // runs in thread 2
        if (sGoodies != null) {
            int i = sGoodies.x;    // could be 5 or 0
            ....
        }
    }
}
```

这段代码同样存在着问题，`sGoodies = goods`的赋值操作有可能在`goods`成员变量赋值之前被察觉到。如果你使用`volatile`声明`sGoodies`变量，你可以认为load操作为`atomic_acquire_load()`，并且把store操作认为是`atomic_release_store()`。

(请注意仅仅是`sGoodies`的引用本身为`volatile`，访问它的内部字段并不是这样的。赋值语句`z = sGoodies.x`会执行一个volatile load  MyClass.sGoodies的操作，其后会伴随一个non-volatile的load操作：：`sGoodies.x`。如果你设置了一个本地引用`MyGoodies localGoods = sGoodies, z = localGoods.x`，这将不会执行任何volatile loads.)

另外一个在Java程序中更加常用的范式就是臭名昭著的**“double-checked locking”**:

```java
class MyClass {
    private Helper helper = null;

    public Helper getHelper() {
        if (helper == null) {
            synchronized (this) {
                if (helper == null) {
                    helper = new Helper();
                }
            }
        }
        return helper;
    }
}
```

上面的写法是为了获得一个MyClass的单例。我们只需要创建一次这个实例，通过`getHelper()`这个方法。为了避免两个线程会同时创建这个实例。我们需要对创建的操作加synchronize机制。然而，我们不想要为了每次执行这段代码的时候都为“synchronized”付出额外的代价，因此我们仅仅在helper对象为空的时候加锁。

在单核系统上，这是不能正常工作的。JIT编译器会破坏这件事情。请查看[4)Appendix](#appendix)的“‘Double Checked Locking is Broken’ Declaration”获取更多的信息, 或者是Josh Bloch’s Effective Java书中的Item 71 (“Use lazy initialization judiciously”)。

在SMP系统上执行这段代码，引入了一个额外的方式会导致失败。把上面那段代码换成C的语言实现如下：

```c
if (helper == null) {
    // acquire monitor using spinlock
    while (atomic_acquire_cas(&this.lock, 0, 1) != success)
        ;
    if (helper == null) {
        newHelper = malloc(sizeof(Helper));
        newHelper->x = 5;
        newHelper->y = 10;
        helper = newHelper;
    }
    atomic_release_store(&this.lock, 0);
}
```

此时问题就更加明显了: `helper`的store操作发生在memory barrier之前，这意味着其他的线程能够在store x/y之前观察到非空的值。

你应该尝试确保store helper执行在`atomic_release_store()`方法之后。通过重新排序代码进行加锁，但是这是无效的，因为往上移动的代码，编译器可以把它移动回原来的位置：在`atomic_release_store()`前面。
(*这里没有读懂，下次再回读*)

有2个方法可以解决这个问题：

* 删除外层的检查。这确保了我们不会在synchronized代码段之外做任何的检查。
* 声明helper为volatile。仅仅这样一个小小的修改，在前面示例中的代码就能够在Java 1.5及其以后的版本中正常工作。

下面的示例演示了使用volatile的2各重要问题：

```java
class MyClass {
    int data1, data2;
    volatile int vol1, vol2;

    void setValues() {    // runs in thread 1
        data1 = 1;
        vol1 = 2;
        data2 = 3;
    }

    void useValues1() {    // runs in thread 2
        if (vol1 == 2) {
            int l1 = data1;    // okay
            int l2 = data2;    // wrong
        }
    }
    void useValues2() {    // runs in thread 2
        int dummy = vol2;
        int l1 = data1;    // wrong
        int l2 = data2;    // wrong
    }
```

请注意`useValues1()`，如果thread 2还没有察觉到`vol1`的更新操作，那么它也无法知道`data1`或者`data2`被设置的操作。一旦它观察到了`vol1`的更新操作，那么它也能够知道data1的更新操作。然而，对于`data2`则无法做任何猜测，因为store操作是在volatile store之后发生的。

`useValues2()`使用了第2个volatile字段：vol2，这会强制VM生成一个memory barrier。这通常不会发生。为了建立一个恰当的“happens-before”关系，2个线程都需要使用同一个volatile字段。在thread 1中你需要知道vol2是在data1/data2之后被设置的。(The fact that this doesn’t work is probably obvious from looking at the code; the caution here is against trying to cleverly “cause” a memory barrier instead of creating an ordered series of accesses.)


### 2.3)What to do
#### 2.3.1)General advice
在C/C++中，使用`pthread`操作，例如mutexes与semaphores。他们会使用合适的memory barriers，在所有的Android平台上提供正确有效的行为。请确保正确这些技术，例如在没有获得对应的mutex的情况下赋值操作需要很谨慎。

避免直接使用atomic方法。如果locking与unlocking之间没有竞争，locking与unlocking一个pthread mutex 分别需要一个单独的atomic操作。如果你需要一个lock-free的设计，你必须在开始写代码之前了解整篇文档的要点。（或者是寻找一个已经为SMP ARM设计好的库文件）。

Be extremely circumspect with "volatile” in C/C++. It often indicates a concurrency problem waiting to happen.

In Java, the best answer is usually to use an appropriate utility class from the java.util.concurrent package. The code is well written and well tested on SMP.

Perhaps the safest thing you can do is make your class immutable. Objects from classes like String and Integer hold data that cannot be changed once the class is created, avoiding all synchronization issues. The book Effective Java, 2nd Ed. has specific instructions in “Item 15: Minimize Mutability”. Note in particular the importance of declaring fields “final" (Bloch).

If neither of these options is viable, the Java “synchronized” statement should be used to guard any field that can be accessed by more than one thread. If mutexes won’t work for your situation, you should declare shared fields “volatile”, but you must take great care to understand the interactions between threads. The volatile declaration won’t save you from common concurrent programming mistakes, but it will help you avoid the mysterious failures associated with optimizing compilers and SMP mishaps.

The Java Memory Model guarantees that assignments to final fields are visible to all threads once the constructor has finished — this is what ensures proper synchronization of fields in immutable classes. This guarantee does not hold if a partially-constructed object is allowed to become visible to other threads. It is necessary to follow safe construction practices.(Safe Construction Techniques in Java).

#### 2.3.2)Synchronization primitive guarantees
The pthread library and VM make a couple of useful guarantees: all accesses previously performed by a thread that creates a new thread are observable by that new thread as soon as it starts, and all accesses performed by a thread that is exiting are observable when a join() on that thread returns. This means you don’t need any additional synchronization when preparing data for a new thread or examining the results of a joined thread.

Whether or not these guarantees apply to interactions with pooled threads depends on the thread pool implementation.

In C/C++, the pthread library guarantees that any accesses made by a thread before it unlocks a mutex will be observable by another thread after it locks that same mutex. It also guarantees that any accesses made before calling signal() or broadcast() on a condition variable will be observable by the woken thread.

Java language threads and monitors make similar guarantees for the comparable operations.

#### 2.3.3)Upcoming changes to C/C++
The C and C++ language standards are evolving to include a sophisticated collection of atomic operations. A full matrix of calls for common data types is defined, with selectable memory barrier semantics (choose from relaxed, consume, acquire, release, acq_rel, seq_cst).

See the Further Reading section for pointers to the specifications.

## 3)Closing Notes
While this document does more than merely scratch the surface, it doesn’t manage more than a shallow gouge. This is a very broad and deep topic. Some areas for further exploration:

* Learn the definitions of **happens-before**, **synchronizes-with**, and other essential concepts from the Java Memory Model. (It’s hard to understand what “volatile” really means without getting into this.)
* Explore what compilers are and aren’t allowed to do when reordering code. (The JSR-133 spec has some great examples of legal transformations that lead to unexpected results.)
* Find out how to write immutable classes in Java and C++. (There’s more to it than just “don’t change anything after construction”.)
* Internalize the recommendations in the Concurrency section of **Effective Java, 2nd Edition**. (For example, you should avoid calling methods that are meant to be overridden while inside a synchronized block.)
* Understand what sorts of barriers you can use on x86 and ARM. (And other CPUs for that matter, for example Itanium’s acquire/release instruction modifiers.)
* Read through the **java.util.concurrent** and **java.util.concurrent.atomic** APIs to see what's available.
* Consider using concurrency annotations like `@ThreadSafe` and `@GuardedBy` (from net.jcip.annotations).

The Further Reading section in the appendix has links to documents and web sites that will better illuminate these topics.

<a name="appendix"></a>
## 4)Appendix
### 4.1)SMP failure example
### 4.2)Implementing synchronization stores

<a name="more"></a>
### 4.3)Further reading
