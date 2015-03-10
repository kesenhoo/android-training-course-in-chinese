# 布局变更动画

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/animation/layout.html>

布局动画是一种预加载动画，系统在你每次改变的布局配置时运行它。你需要做的仅是在布局文件里设置属性告诉Android系统为你这些布局的变更应用动画。系统动画时为你默认执行的。

> **小贴士:** 如果你想补充自定义布局动画，创建 [LayoutTransition](http://developer.android.com/reference/android/animation/LayoutTransition.html) 对象和然后用 <a href="http://developer.android.com/reference/android/view/ViewGroup.html#setLayoutTransition(android.animation.LayoutTransition)"> setLayoutTransition() </a> 方法把它加到布局中。

下面是在一个list中添加一项的默认布局动画：

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_layout_changes.mp4" type="video/mp4">
    <source src="anim_layout_changes.mp4" type="video/mp4">
    <source src="anim_layout_changes.ogv" type="video/ogg">
</video>

</div>

如果你想跳过看整个例子，[下载](http://developer.android.com/shareables/training/Animations.zip) App 样例然后运行布局渐变的例子。查看下列文件中的代码实现：

1. src/LayoutChangesActivity.java
2. layout/activity_layout_changes.xml
3. menu/activity_layout_changes.xml

## 创建布局

在你activity的XML布局文件中，为你想开启动画的布局设置 `android:animateLayoutChanges` 属性为真。例如：

```xml
<LinearLayout android:id="@+id/container"
    android:animateLayoutChanges="true"
    ...
/>
```

## 从布局中添加，更新或删除项目

现在，你需要做的就是添加，删除或更新布局里的项目，然后这些项目就会自动显示动画啦：

```java
private ViewGroup mContainerView;
...
private void addItem() {
    View newView;
    ...
    mContainerView.addView(newView, 0);
}
```
