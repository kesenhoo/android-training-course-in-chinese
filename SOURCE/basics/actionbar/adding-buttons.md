> 编写: [Vincent 4J](http://github.com/vincent4j)

> 校对:

# 添加 Action 按钮

Action bar 允许你为当前上下文中最重要的操作添加按钮。那些直接出现在 action bar 中的 icon 和/或文本被称作操作按钮。不匹配的或不足够重要的操作被隐藏在 action overflow 中。
  
![actionbar-actions](actionbar-actions.png)  
图 1. 一个有检索操作按钮和 action overflow 的 action bar，在 action overflow 里能展现额外的操作

## 在 XML 中指定操作

所有的操作按钮和 action overflow 中其他可用的条目都被定义在 [菜单资源](https://developer.android.com/guide/topics/resources/menu-resource.html) 的 XML 文件中。通过在项目的 `res/menu` 目录中新增一个 XML 文件来为 action bar 添加操作。

为你想添加到 action bar 中的每个条目添加一个 `<item>` 元素。例如：

res/menu/main_activity_actions.xml
```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android" >
    <!-- Search, should appear as action button -->
    <item android:id="@+id/action_search"
          android:icon="@drawable/ic_action_search"
          android:title="@string/action_search"
          android:showAsAction="ifRoom" />
    <!-- Settings, should always be in the overflow -->
    <item android:id="@+id/action_settings"
          android:title="@string/action_settings"
          android:showAsAction="never" />
</menu>
```

上述声明是这样的，当 action bar 有可用空间时，检索操作将作为一个操作按钮来显示，但设置操作将一直只在 action overflow 中显示。（默认情况下，所有的操作都显示在 action overflow 中，但为每一个操作指明设计意图是很好的做法。）

icon 属性要求每张图片提供一个 `resource ID`。在 `@drawable/` 之后的名字必须是存储在项目目录 `res/drawable/` 下图片的名字。例如：`ic_action_search.png` 对应 "@drawable/ic_action_search"。同样地，title 属性使用通过 XML 文件定义在项目目录 `res/values/` 中的一个 `string resource`，详情请参见 [创建一个简单的 UI](https://developer.android.com/training/basics/firstapp/building-ui.html#Strings) 。

>注释：当在创建 icon 和其他 bitmap 图片时，你得为优化不同屏幕密度下的显示效果提供多个版本，这一点很重要。在 [支持不同屏幕](https://developer.android.com/training/basics/supporting-devices/screens.html) 课程中将会更详细地讨论。






