# View间渐变

> 编写:[XizhiXu](https://github.com/XizhiXu) - 原文:<http://developer.android.com/training/animation/crossfade.html>

渐变动画（也叫消失）通常指渐渐的淡出某个 UI 组件，同时同步地淡入另一个。在你 App 想切换内容或 view的情况下，这种动画很有用。渐变简短不易察觉，它也能提供从一个界面到下一个之间流畅的转换。当你不使用它们，不管怎么样转换经常感到生硬而仓促。

下面是一个利用进度指示渐变到一些文本内容的例子。

<div style="
  background: transparent url(device_galaxynexus_blank_land_span8.png) no-repeat
scroll top left; padding: 26px 68px 38px 72px; overflow: hidden;">

<video style="width: 320px; height: 180px;" controls="" autoplay="">
    <source src="anim_crossfade.mp4" type="video/mp4">
    <source src="anim_crossfade.webm" type="video/webm">
    <source src="anim_crossfade.ogv" type="video/ogg">
</video>

</div>


如果你想跳过看整个例子，[下载](http://developer.android.com/shareables/training/Animations.zip) App 样例然后运行渐变例子。查看下列文件中的代码实现：

* src/CrossfadeActivity.java
* layout/activity_crossfade.xml
* menu/activity_crossfade.xml

## 创建View

创建两个你想相互渐变的 view。下面的例子创建了一个进度提示圈和可滑动文本 view。

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
        android:id="@+id/content"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <TextView style="?android:textAppearanceMedium"
            android:lineSpacingMultiplier="1.2"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="@string/lorem_ipsum"
            android:padding="16dp" />

    </ScrollView>

    <ProgressBar android:id="@+id/loading_spinner"
        style="?android:progressBarStyleLarge"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center" />

</FrameLayout>
```
## 设置动画

为设置动画，你需要：

1. 为你想渐变的 view 创建成员变量。之后动画应用途中修改 View 的时候你会需要这些引用的。

2. 对于被淡出的 view，设置它的 visibility 为 [GONE](http://developer.android.com/reference/android/view/View.html#GONE)。这样防止 view 再占据布局的空间，而且也能在布局计算中将其忽略，加速处理过程。

3. 将 [config_shortAnimTime](http://developer.android.com/reference/android/R.integer.html#config_shortAnimTime) 系统属性暂存到一个成员变量里。这个属性为动画定义了一个标准的“短”持续时间。对于微妙或者快速发生的动画，这是个很理想的时间段。[config_longAnimTime](http://developer.android.com/reference/android/R.integer.html#config_longAnimTime) 和 [config_mediumAnimTime](http://developer.android.com/reference/android/R.integer.html#config_mediumAnimTime) 也行，如果你想用的话。

下面是个内容 view 的 activity 例子，它使用了前面所述代码片段中的布局。

```java
public class CrossfadeActivity extends Activity {

    private View mContentView;
    private View mLoadingView;
    private int mShortAnimationDuration;

    ...

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_crossfade);

        mContentView = findViewById(R.id.content);
        mLoadingView = findViewById(R.id.loading_spinner);

        // Initially hide the content view.
        mContentView.setVisibility(View.GONE);

        // Retrieve and cache the system's default "short" animation time.
        mShortAnimationDuration = getResources().getInteger(
                android.R.integer.config_shortAnimTime);
    }
```

## 渐变View

既然正确地设置了那些 view，做下面这些事情来渐变他们吧：

1. 对于淡入的 view，设置 alpha 值为 0 并且设置 visibility 为 [VISIBLE](http://developer.android.com/reference/android/view/View.html#VISIBLE)（要记得他起初被设置成了 [GONE](http://developer.android.com/reference/android/view/View.html#GONE)）。这让 view 可见了但是它是透明的。

2. 对于淡入的 view，把 alpha 值从 0 动态改变到 1。同时，对于淡出的 view，把 alpha 值从 1 动态变到 0。

3. 使用 [Animator.AnimatorListener](http://developer.android.com/reference/android/animation/Animator.AnimatorListener.html) 中的 <a href="http://developer.android.com/reference/android/animation/Animator.AnimatorListener.html#onAnimationEnd(android.animation.Animator)">onAnimationEnd()</a>，设置淡出 view 的 visibility 为 [GONE](http://developer.android.com/reference/android/view/View.html#GONE)。即使 alpha 值为 0，也要把 view 的 visibility 设置成 [GONE](http://developer.android.com/reference/android/view/View.html#GONE) 来防止 view 占据布局空间，还能把它从布局计算中忽略，加速处理过程。

下面方法展示如何去做：

```java
private View mContentView;
private View mLoadingView;
private int mShortAnimationDuration;

...

private void crossfade() {

    // Set the content view to 0% opacity but visible, so that it is visible
    // (but fully transparent) during the animation.
    mContentView.setAlpha(0f);
    mContentView.setVisibility(View.VISIBLE);

    // Animate the content view to 100% opacity, and clear any animation
    // listener set on the view.
    mContentView.animate()
            .alpha(1f)
            .setDuration(mShortAnimationDuration)
            .setListener(null);

    // Animate the loading view to 0% opacity. After the animation ends,
    // set its visibility to GONE as an optimization step (it won't
    // participate in layout passes, etc.)
    mLoadingView.animate()
            .alpha(0f)
            .setDuration(mShortAnimationDuration)
            .setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mLoadingView.setVisibility(View.GONE);
                }
            });
}
```
