# 适配不同的语言

> 编写:[Lin-H](http://github.com/Lin-H) - 原文:<http://developer.android.com/training/basics/supporting-devices/languages.html>

把UI中的字符串存储在外部文件，通过代码提取，这是一种很好的做法。Android可以通过工程中的资源目录轻松实现这一功能。

如果使用Android SDK Tools(详见[创建Android项目(Creating an Android Project)](../../basics/firstapp/creating-project.html))来创建工程，则在工程的根目录会创建一个`res/`的目录，目录中包含所有资源类型的子目录。其中包含工程的默认文件比如`res/values/strings.xml`，用于保存字符串值。

## 创建区域设置目录及字符串文件

为支持多国语言，在`res/`中创建一个额外的`values`目录以连字符和ISO国家代码结尾命名，比如`values-es/` 是为语言代码为"es"的区域设置的简单的资源文件的目录。Android会在运行时根据设备的区域设置，加载相应的资源。详见[Providing Alternative Resources](http://developer.android.com/guide/topics/resources/providing-resources.html#AlternativeResources)。

若决定支持某种语言，则需要创建资源子目录和字符串资源文件，例如:

```
MyProject/
    res/
       values/
           strings.xml
       values-es/
           strings.xml
       values-fr/
           strings.xml
```

添加不同区域语言的字符串值到相应的文件。

Android系统运行时会根据用户设备当前的区域设置，使用相应的字符串资源。

例如，下面列举了几个不同语言对应不同的字符串资源文件。

英语(默认区域语言)，`/values/strings.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="title">My Application</string>
    <string name="hello_world">Hello World!</string>
</resources>
```

西班牙语，`/values-es/strings.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="title">Mi Aplicación</string>
    <string name="hello_world">Hola Mundo!</string>
</resources>
```

法语，`/values-fr/strings.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="title">Mon Application</string>
    <string name="hello_world">Bonjour le monde !</string>
</resources>
```

> **Note**：可以在任何资源类型中使用区域修饰词(或者任何配置修饰符)，比如为bitmap提供本地化的版本，更多信息见[Localization](https://developer.android.com/guide/topics/resources/localization.html)。

## 使用字符资源

我们可以在源代码和其他XML文件中通过`<string>`元素的`name`属性来引用自己的字符串资源。

在源代码中可以通过`R.string.<string_name>`语法来引用一个字符串资源，很多方法都可以通过这种方式来接受字符串。

例如:

```java
// Get a string resource from your app's Resources
String hello = getResources().getString(R.string.hello_world);

// Or supply a string resource to a method that requires a string
TextView textView = new TextView(this);
textView.setText(R.string.hello_world);
```

在其他XML文件中，每当XML属性要接受一个字符串值时，你都可以通过`@string/<string_name>`语法来引用字符串资源。

例如:

```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/hello_world" />
```
