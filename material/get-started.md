# 开始使用Material Design

> 编写: [allenlsy](https://github.com/allenlsy) - 原文: <https://developer.android.com/training/material/get-started.html>

要创建一个 Material Design 应用：

1. 学习 [Material Design 规格标准](http://www.google.com/design/spec/material-design/introduction.html)
2. 应用 Material Design 主题
3. 创建符合 Material Design 的 Layout 文件
4. 定义视图的 elevation 值来修改阴影
5. 使用系统组件来创建列表和卡片
6. 自定义动画

#### 维护向下兼容性

你可以添加 Material Design 特性，同时保持对 Android 5.0 之前版本的兼容。更多信息，请参见[维护兼容性章节](https://developer.android.com/training/material/compatibility.html)。

#### 使用 Material Design 更新现有应用

要更新现有应用，使其使用 Material Design，你需要翻新你的 layout 文件来遵从 Material Design 标准，并确保其包含了正确的元素高度，触摸反馈和动画。

#### 使用 Material Design 创建新的应用

如果你要创建使用 Material Design 的新的应用，Material Design 指南提供了一套跨平台统一的设计。请遵从指南，使用新功能来进行 Android 应用的设计和开发。

## 应用 Material 主题

要在应用中使用 Material 主题，需要定义一个继承于 `android:Theme.Material` 的 style 文件：

```xml
<!-- res/values/styles.xml -->
<resources>
  <!-- your theme inherits from the material theme -->
  <style name="AppTheme" parent="android:Theme.Material">
    <!-- theme customizations -->
  </style>
</resources>
```

Material 主题提供了更新后的系统组件，使你可以设置调色板和在触摸和 Activity 切换时使用默认的动画。更多信息，请参见 [Material 主题](http://developer.android.com/training/material/theme.html) 章节。

## 设计你的 Layouts

另外，要应用自定义的 Material 主题，你的 layout 应该要符合 [Material 设计规范](http://www.google.com/design/spec)。在设计 Layout 时，尤其要注意一下方面：

* 基准线网格
* Keyline
* 间隙
* 触摸目标的大小
* Layout 结构

## 定义视图的 Elevation

视图可以投射阴影， elevation 值决定了阴影的大小和绘制顺序。要设定 elevation 值，请使用 `android:elevation` 属性：

```xml
<TextView
    android:id="@+id/my_textview"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/next"
    android:background="@color/white"
    android:elevation="5dp" />
```

新的 `translationZ` 属性使得你可以设计临时变更 elevation 的动画。elevation 变化在做触摸反馈时很有用。

更多信息，请参见定义阴影和 Clipping 视图章节。

## 创建列表和卡片

[RecyclerView](http://developer.android.com/reference/android/support/v7/widget/RecyclerView.html) 是一个植入性更强的 ListView，它支持不同的 layout 类型，并可以提升性能。[CardView](http://developer.android.com/reference/android/support/v7/widget/CardView.html) 使得你可以在卡片内显示一部分内容，并且和其他应用保持外观一致。以下是一段样例代码展示如何在 layout 中添加 CardView

```xml
<android.support.v7.widget.CardView
    android:id="@+id/card_view"
    android:layout_width="200dp"
    android:layout_height="200dp"
    card_view:cardCornerRadius="3dp">
    ...
</android.support.v7.widget.CardView>
```

更多信息，请参见列表和卡片章节。

## 自定义动画

Android 5.0 (API level 21) 包含了新的创建自定义动画 API。比如，你可以在 activity 中定义进入和退出 activity 时的动画。


```java
public class MyActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // enable transitions
        getWindow().requestFeature(Window.FEATURE_CONTENT_TRANSITIONS);
        setContentView(R.layout.activity_my);
    }

    public void onSomeButtonClicked(View view) {
        getWindow().setExitTransition(new Explode());
        Intent intent = new Intent(this, MyOtherActivity.class);
        startActivity(intent,
                      ActivityOptions
                          .makeSceneTransitionAnimation(this).toBundle());
    }
}
```

当你从当前 activity 进入另一个 activity 时，退出切换动画会被调用。

想学习更多新的动画 API，参见[自定义动画章节](http://developer.android.com/reference/android/view/View.html#setSystemUiVisibility(int))。
