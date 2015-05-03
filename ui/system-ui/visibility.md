# 响应UI可见性的变化

> 编写:[K0ST](https://github.com/K0ST) - 原文:<http://developer.android.com/training/system-ui/visibility.html>

本节课将教你如果注册监听器来监听系统UI可见性的变化。这个方法在将系统栏与你自己的UI控件进行同步操作时很有用。

## 注册监听器

为了获取系统UI可见性变化的通知，我们需要对View注册`View.OnSystemUiVisibilityChangeListener`监听器。通常上来说，这个View是用来控制导航的可见性的。

例如你可以添加如下代码在onCreate中

```java
View decorView = getWindow().getDecorView();
decorView.setOnSystemUiVisibilityChangeListener
        (new View.OnSystemUiVisibilityChangeListener() {
    @Override
    public void onSystemUiVisibilityChange(int visibility) {
        // Note that system bars will only be "visible" if none of the
        // LOW_PROFILE, HIDE_NAVIGATION, or FULLSCREEN flags are set.
        if ((visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
            // TODO: The system bars are visible. Make any desired
            // adjustments to your UI, such as showing the action bar or
            // other navigational controls.
        } else {
            // TODO: The system bars are NOT visible. Make any desired
            // adjustments to your UI, such as hiding the action bar or
            // other navigational controls.
        }
    }
});
```

保持系统栏和UI同步是一种很好的实践方式，比如当状态栏显示或隐藏的时候进行ActionBar的显示和隐藏等等。
