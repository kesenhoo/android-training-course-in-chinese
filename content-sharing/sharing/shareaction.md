# 添加一个简便的分享功能

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/sharing/shareaction.html>

Android4.0之后系统中ActionProvider的引入使在ActionBar中添加分享功能变得更为简单。它会handle出现share功能的appearance与behavior。在ShareActionProvider的例子里面，我们只需要提供一个share intent，剩下的就交给[ShareActionProvider](https://developer.android.com/reference/android/widget/ShareActionProvider.html)来做。

![actionbar-shareaction.png](actionbar-shareaction.png "Figure 1. The ShareActionProvider in the Gallery app.")

<!-- more -->

## 更新菜单声明(Update Menu Declarations)

使用ShareActionProvider的第一步，在menu resources对应item中定义`android:actionProviderClass`属性。

```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@+id/menu_item_share"
        android:showAsAction="ifRoom"
        android:title="Share"
        android:actionProviderClass="android.widget.ShareActionProvider" />
    ...
</menu>
```

这表明了该item的appearance与function需要与ShareActionProvider匹配。此外，你还需要告诉provider想分享的内容。

## Set the Share Intent(设置分享的intent)

为了实现ShareActionProvider的功能，我们必须为它提供一个intent。该share intent应该像第一课讲的那样，带有`ACTION_SEND`和附加数据(例如`EXTRA_TEXT`与 `EXTRA_STREAM`)的。使用ShareActionProvider的例子如下：

```java
private ShareActionProvider mShareActionProvider;
...

@Override
public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate menu resource file.
    getMenuInflater().inflate(R.menu.share_menu, menu);

    // Locate MenuItem with ShareActionProvider
    MenuItem item = menu.findItem(R.id.menu_item_share);

    // Fetch and store ShareActionProvider
    mShareActionProvider = (ShareActionProvider) item.getActionProvider();

    // Return true to display menu
    return true;
}

// Call to update the share intent
private void setShareIntent(Intent shareIntent) {
    if (mShareActionProvider != null) {
        mShareActionProvider.setShareIntent(shareIntent);
    }
}
```

也许在创建菜单的时候仅仅需要设置一次share intent就满足需求了，或者说我们可能想先设置share intent，然后根据UI的变化来对intent进行更新。例如，当在Gallery里面全图查看照片的时候，share intent会在切换图片时候进行改变。
更多关于ShareActionProvider的内容，请查看[Action Bar](https://developer.android.com/guide/topics/ui/actionbar.html#ActionProvider) 。
