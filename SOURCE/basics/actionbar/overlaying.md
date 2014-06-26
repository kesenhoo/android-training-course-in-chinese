> 编写: [Vincent 4J](http://github.com/vincent4j)

> 校对:

# Action Bar 覆盖叠加

默认情况下，action bar 显示在 activity 窗口的顶部，会稍微地减少其他布局的有效空间。如果在用户交互过程中你要隐藏和显示 action bar，可以通过调用 [ActionBar](https://developer.android.com/reference/android/app/ActionBar.html) 中的 [hide()](https://developer.android.com/reference/android/app/ActionBar.html#hide()) 和 [show()](https://developer.android.com/reference/android/app/ActionBar.html#show()) 来实现。但是，这将会导致 activity 基于新尺寸重现计算和重新绘制布局。

