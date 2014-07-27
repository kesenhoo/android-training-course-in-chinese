> 编写:[kesenhoo](https://github.com/kesenhoo)

> 原文:<http://developer.android.com/training/articles/smp.html>

# SMP(Symmetric Multi-Processor) Primer for Android

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

x86 SMP provides processor consistency, which is slightly weaker than sequential. While the architecture guarantees that loads are not reordered with respect to other loads, and stores are not reordered with respect to other stores, it does not guarantee that a store followed by a load will be observed in the expected order.

Consider the following example, which is a piece of Dekker’s Algorithm for mutual exclusion:

Thread 1	Thread 2
A = true
reg1 = B
if (reg1 == false)
    critical-stuff	B = true
reg2 = A
if (reg2 == false)
    critical-stuff

This results in both reg1 and reg2 set to “false”, allowing the threads to execute code in the critical section simultaneously. To understand how this can happen, it’s useful to know a little about CPU caches.

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

The implementation of the “synchronized” block has the same basic structure as the spin lock example: it begins with an acquiring CAS, and ends with a releasing store. This means that compilers and code optimizers are free to migrate code into a “synchronized” block. One practical consequence: you must not conclude that code inside a synchronized block happens after the stuff above it or before the stuff below it in a function. Going further, if a method has two synchronized blocks that lock the same object, and there are no operations in the intervening code that are observable by another thread, the compiler may perform “lock coarsening” and combine them into a single block.

The other relevant keyword is “volatile”. As defined in the specification for Java 1.4 and earlier, a volatile declaration was about as weak as its C counterpart. The spec for Java 1.5 was updated to provide stronger guarantees, almost to the level of monitor synchronization.

The effects of volatile accesses can be illustrated with an example. If thread 1 writes to a volatile field, and thread 2 subsequently reads from that same field, then thread 2 is guaranteed to see that write and all writes previously made by thread 1. More generally, the writes made by any thread up to the point where it writes the field will be visible to thead 2 when it does the read. In effect, writing to a volatile is like a monitor release, and reading from a volatile is like a monitor acquire.

Non-volatile accesses may be reorded with respect to volatile accesses in the usual ways, for example the compiler could move a non-volatile load or store “above” a volatile store, but couldn’t move it “below”. Volatile accesses may not be reordered with respect to each other. The VM takes care of issuing the appropriate memory barriers.

It should be mentioned that, while loads and stores of object references and most primitive types are atomic, long and double fields are not accessed atomically unless they are marked as volatile. Multi-threaded updates to non-volatile 64-bit fields are problematic even on uniprocessors.

#### 2.2.2)Examples

### 2.3)What to do
#### 2.3.1)General advice
#### 2.3.2)Synchronization primitive guarantees
#### 2.3.3)Upcoming changes to C/C++

## 3)Closing Notes

## 4)Appendix
### 4.1)SMP failure example
### 4.2)Implementing synchronization stores
### 4.3)Further reading
