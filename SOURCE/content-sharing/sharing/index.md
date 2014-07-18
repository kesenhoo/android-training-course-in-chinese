> 编写:[kesenhoo](https://github.com/kesenhoo) - 校对:

> 原文:<http://developer.android.com/training/sharing/index.html>

# 分享简单的数据
Android程序中很炫的一个功能是程序之间可以互相通信。为什么要重新发明一个已经存在于另外一个程序中的功能呢，而且这个功能并非自己程序的核心部分。

这一章节会讲述一些通常使用的方法来在不同程序之间通过使用[Intent](https://developer.android.com/reference/android/content/Intent.html) APIs与[ActionProvider](https://developer.android.com/reference/android/view/ActionProvider.html)对象来发送与接受content。

<!-- more -->

当你构建一个intent，你必须指定这个intent需要触发的actions。Android定义了一些actions，包括ACTION_SEND，这个action表明着这个intent是用来从一个activity发送数据到另外一个activity的，甚至是跨进程之间的。

为了发送数据到另外一个activity，你需要做的是指定数据与数据的类型，系统会识别出能够兼容接受的这些数据的activity并且把这些activity显示给用户进行选择(如果有多个选择)，或者是立即启动Activity(只有一个兼容的选择)。同样的，你可以在manifest文件的Activity描述中添加接受哪些数据类型。

在不同的程序之间使用intent来发送与接受数据是在社交分享内容的时候最常用的方法。Intent使得用户用最常用的程序进行快速简单的分享信息。

**注意:**为ActionBar添加分享功能的最好方法是使用[ShareActionProvider](https://developer.android.com/reference/android/widget/ShareActionProvider.html)，它能够在API level 14以上进行使用。ShareActionProvider会在第3课中进行详细介绍。
