# 保存到Preference

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/data-storage/shared-preferences.html>

如果你有一个相对较小的key-value集合需要保存，你应该使用[SharedPreferences](http://developer.android.com/reference/android/content/SharedPreferences.html) APIs。 SharedPreferences 对象指向了一个保存key-value pairs的文件，并且它提供了简单的方法来读写这个文件。每一个 SharedPreferences 文件都是由framework管理的并且可以是私有或者可共享的。
这节课会演示如何使用 SharedPreferences APIs 来存储与检索简单的数据。

> **Note：** SharedPreferences APIs 仅仅提供了读写key-value对的功能，请不要与[Preference](http://developer.android.com/reference/android/preference/Preference.html) APIs相混淆。后者可以帮助你建立一个设置用户配置的页面（尽管它实际上是使用SharedPreferences 来实现保存用户配置的)。如果想了解更多关于Preference APIs的信息，请参考[Settings](http://developer.android.com/guide/topics/ui/settings.html) 指南。

## 获取SharedPreference

你可以通过下面两个方法之一来创建或者访问shared preference 文件:

* <a href="http://developer.android.com/reference/android/content/Context.html#getSharedPreferences(java.lang.String, int)">getSharedPreferences()</a> — 如果你需要多个通过名称参数来区分的shared preference文件, 名称可以通过第一个参数来指定。你可以在你的app里面通过任何一个[Context](http://developer.android.com/reference/android/content/Context.html) 来执行这个方法。
* <a href="http://developer.android.com/reference/android/app/Activity.html#getPreferences(int)">getPreferences()</a> — 当你的activity仅仅需要一个shared preference文件时。因为这个方法会检索activity下的默认的shared preference文件，并不需要提供文件名称。

例如：下面的示例是在 [Fragment](http://developer.android.com/reference/android/app/Fragment.html) 中被执行的，它会访问名为 `R.string.preference_file_key` 的shared preference文件，并使用private模式来打开它，这样的话，此时文件就仅仅可以被你的app访问了。

```java
Context context = getActivity();
SharedPreferences sharedPref = context.getSharedPreferences(
        getString(R.string.preference_file_key), Context.MODE_PRIVATE);
```

当命名你的shared preference文件时，你应该像 `"com.example.myapp.PREFERENCE_FILE_KEY"` 这样来命名。

当然，如果你的activity仅仅需要一个shared preference文件时，你可以使用<a href="http://developer.android.com/reference/android/app/Activity.html#getPreferences(int)">getPreferences()</a>方法：

```java
SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
```

> **Caution:** 如果你创建了一个[MODE_WORLD_READABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_READABLE)或者[MODE_WORLD_WRITEABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_WRITEABLE) 模式的shared preference文件，那么任何其他的app只要知道文件名，则可以访问这个文件。

## 写Shared Preference

为了写`shared preferences`文件，需要通过执行<a href="http://developer.android.com/reference/android/content/SharedPreferences.html#edit()">edit()</a>来创建一个 [SharedPreferences.Editor](http://developer.android.com/reference/android/content/SharedPreferences.Editor.html)。

通过类似<a href="http://developer.android.com/reference/android/content/SharedPreferences.Editor.html#putInt(java.lang.String, int)">putInt()</a>与<a href="http://developer.android.com/reference/android/content/SharedPreferences.Editor.html#putString(java.lang.String, java.lang.String)">putString()</a>方法来传递keys与values。然后执行<a href="http://developer.android.com/reference/android/content/SharedPreferences.Editor.html#commit()">commit()</a> 来提交改变. (*后来有建议除非是出于线程同步的需要，否则请使用apply()方法来替代commit()，因为后者有可能会卡到UI Thread.*)

```java
SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
SharedPreferences.Editor editor = sharedPref.edit();
editor.putInt(getString(R.string.saved_high_score), newHighScore);
editor.commit();
```

## 读Shared Preference

为了从shared preference中检索读取数据，可以通过类似 getInt() 与 getString()等方法来读取。在那些方法里面传递你想要获取value对应的key，并且提供一个默认的value。如下：

```java
SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
long default = getResources().getInteger(R.string.saved_high_score_default));
long highScore = sharedPref.getInt(getString(R.string.saved_high_score), default);
```
