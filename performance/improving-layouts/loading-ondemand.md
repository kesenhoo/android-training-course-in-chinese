# 按需加载视图

> 编写:[allenlsy](https://github.com/allenlsy) - 原文:<http://developer.android.com/training/improving-layouts/loading-ondemand.html>

有时你的 Layout 会用到不怎么重用的复杂视图。不管它是列表项 细节，进度显示器，或是撤销时的提示信息，你可以仅在需要的时候载入它们，提高 UI 渲染速度。

## 定义 ViewStub

[ViewStub](http://developer.android.com/reference/android/view/ViewStub.html) 是一个轻量的视图，不需要大小信息，也不会在被加入的 Layout 中绘制任何东西。每个 ViewStub 只需要设置 `android:layout` 属性来指定需要被 inflate 的 Layout 类型。

以下 ViewStub 是一个半透明的进度条覆盖层。功能上讲，它应该只在新的数据项被导入到应用程序时可见。

```xml
<ViewStub
    android:id="@+id/stub_import"
    android:inflatedId="@+id/panel_import"
    android:layout="@layout/progress_overlay"
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:layout_gravity="bottom" />
```

## 载入 ViewStub Layout

当你要载入用 ViewStub 声明的 Layout 时，要么用 `setVisibility(View.VISIBLE)` 设置它的可见性，要么调用其 `inflate()` 方法。

```java
((ViewStub) findViewById(R.id.stub_import)).setVisibility(View.VISIBLE);
// or
View importPanel = ((ViewStub) findViewById(R.id.stub_import)).inflate();
```

> **Notes**：`inflate()` 方法会在渲染完成后返回被 inflate 的视图，所以如果你需要和这个 Layout 交互的话， 你不需要再调用 `findViewById()` 去查找这个元素，。

一旦 ViewStub 可见或是被 inflate 了，ViewStub 就不再继续存在View的层级机构中了。取而代之的是被 inflate 的 Layout，其 id 是 ViewStub 上的 `android:inflatedId` 属性。（ViewStub 的 `android:id` 属性仅在 ViewStub 可见以前可用）

> **Notes**：ViewStub 的一个缺陷是，它目前不支持使用 `<merge/>` 标签的 Layout 。
