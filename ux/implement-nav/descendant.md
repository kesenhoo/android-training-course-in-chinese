# 实现向下的导航

> 编写:[Lin-H](https://github.com/Lin-H) - 原文:<http://developer.android.com/training/implementing-navigation/descendant.html>

Descendant Navigation是用来向下导航至应用的信息层次。在[Designing Effective Navigation](http://developer.android.com/training/design-navigation/descendant-lateral.html)和[Android Design: Application Structure](http://developer.android.com/design/patterns/app-structure.html)中说明。

Descendant navigation通常使用[Intent](http://developer.android.com/reference/android/content/Intent.html)和[startActivity()](http://developer.android.com/reference/android/content/Context.html#startActivity%28android.content.Intent%29)实现，或使用[FragmentTransaction](http://developer.android.com/reference/android/app/FragmentTransaction.html)对象添加fragment到一个activity中。这节课程涵盖了在实现Descendant navigation时遇到的其他有趣的情况。

## 在手机和平板(Tablet)上实现Master/Detail Flow

在master/detail导航流程(navigation flow)中，master screen(主屏幕)包含一个集合中item的列表，detail screen(详细屏幕)显示集合中特定item的详细信息。实现从master screen到detail screen的导航是Descendant Navigation的一种形式。

手机触摸屏非常适合一次显示一种屏幕(master screen或detail screen)；这一想法在[Planning for Multiple Touchscreen Sizes](http://developer.android.com/training/design-navigation/multiple-sizes.html)中进一步说明。在这种情况下，一般使用[Intent](http://developer.android.com/reference/android/content/Intent.html)启动detail screen来实现activityDescendant navigation。另一方面，平板的显示，特别是用横屏来浏览时，最适合一次显示多个内容窗格，master内容在左边，detail在右边。在这里一般就使用[FragmentTransaction](http://developer.android.com/reference/android/app/FragmentTransaction.html)实现descendant navigation。[FragmentTransaction](http://developer.android.com/reference/android/app/FragmentTransaction.html)用来添加、删除或用新内容替换detail窗格(pane)。

实现这一模式的基础内容在Designing for Multiple Screens的[Implementing Adaptive UI Flows](http://developer.android.com/training/multiscreen/adaptui.html)课程中说明。课程中说明了如何在手机上使用两个activity，在平板上使用一个activity来实现master/detail flow。

## 导航至外部Activities

有很多情况，是从别的应用下降(descend)至你的应用信息层次(application's information hierarchy)再到activity。例如，当正在浏览手机通讯录中联系信息的details screen，子屏幕详细显示由社交网络联系提供的最近文章，子屏幕可就可以属于一个社交网络应用。

当启动另一个应用的activity来允许用户说话，发邮件或选择一个照片附件，如果用户是从启动器(设备的home屏幕)重启你的应用，你一般不会希望用户返回到别的activity。如果点击你的应用图标又回到“发邮件”的屏幕，这会使用户感到很迷惑。

为防止这种情况的发生，只需要添加[FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET](http://developer.android.com/reference/android/content/Intent.html#FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET)标记到用来启动外部activity的intent中，就像:

```java
Intent externalActivityIntent = new Intent(Intent.ACTION_PICK);
externalActivityIntent.setType("image/*");
externalActivityIntent.addFlags(
        Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET);
startActivity(externalActivityIntent);
```
