# 保存到Preference

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/basics/data-storage/shared-preferences.html>

当有一个相对较小的key-value集合需要保存时，可以使用[SharedPreferences](http://developer.android.com/reference/android/content/SharedPreferences.html) APIs。 SharedPreferences 对象指向一个保存key-value pairs的文件，并为读写他们提供了简单的方法。每个 SharedPreferences 文件均由framework管理，其既可以是私有的，也可以是共享的。
这节课会演示如何使用 SharedPreferences APIs 来存储与检索简单的数据。

> **Note：** SharedPreferences APIs 仅仅提供了读写key-value对的功能，请不要与[Preference](http://developer.android.com/reference/android/preference/Preference.html) APIs相混淆。后者可以帮助我们建立一个设置用户配置的页面（尽管它实际上是使用SharedPreferences 来实现保存用户配置的)。更多关于Preference APIs的信息，请参考[Settings](http://developer.android.com/guide/topics/ui/settings.html) 指南。

## 获取SharedPreference

我们可以通过以下两种方法之一创建或者访问shared preference 文件:

* <a href="http://developer.android.com/reference/android/content/Context.html#getSharedPreferences(java.lang.String, int)">getSharedPreferences()</a> — 如果需要多个通过名称参数来区分的shared preference文件, 名称可以通过第一个参数来指定。可在app中通过任何一个[Context](http://developer.android.com/reference/android/content/Context.html) 执行该方法。
* <a href="http://developer.android.com/reference/android/app/Activity.html#getPreferences(int)">getPreferences()</a> — 当activity仅需要一个shared preference文件时。因为该方法会检索activity下默认的shared preference文件，并不需要提供文件名称。

例：下面的示例在一个 [Fragment](http://developer.android.com/reference/android/app/Fragment.html) 中被执行，它以private模式访问名为 `R.string.preference_file_key` 的shared preference文件。这种情况下，该文件仅能被我们的app访问。

```java
Context context = getActivity();
SharedPreferences sharedPref = context.getSharedPreferences(
        getString(R.string.preference_file_key), Context.MODE_PRIVATE);
```

应以与app相关的方式为shared preference文件命名，该名称应唯一。如本例中可将其命名为 `"com.example.myapp.PREFERENCE_FILE_KEY"` 。

当然，当activity仅需要一个shared preference文件时，我们可以使用<a href="http://developer.android.com/reference/android/app/Activity.html#getPreferences(int)">getPreferences()</a>方法：

```java
SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
```

> **Caution:** 如果创建了一个[MODE_WORLD_READABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_READABLE)或者[MODE_WORLD_WRITEABLE](http://developer.android.com/reference/android/content/Context.html#MODE_WORLD_WRITEABLE) 模式的shared preference文件，则其他任何app均可通过文件名访问该文件。

## 写Shared Preference

为了写`shared preferences`文件，需要通过执行<a href="http://developer.android.com/reference/android/content/SharedPreferences.html#edit()">edit()</a>创建一个 [SharedPreferences.Editor](http://developer.android.com/reference/android/content/SharedPreferences.Editor.html)。

通过类似<a href="http://developer.android.com/reference/android/content/SharedPreferences.Editor.html#putInt(java.lang.String, int)">putInt()</a>与<a href="http://developer.android.com/reference/android/content/SharedPreferences.Editor.html#putString(java.lang.String, java.lang.String)">putString()</a>等方法传递keys与values，接着通过<a href="http://developer.android.com/reference/android/content/SharedPreferences.Editor.html#commit()">commit()</a> 提交改变. 

```java
SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
SharedPreferences.Editor editor = sharedPref.edit();
editor.putInt(getString(R.string.saved_high_score), newHighScore);
editor.commit();
```

## 读Shared Preference

为了从shared preference中读取数据，可以通过类似于 getInt() 及 getString()等方法来读取。在那些方法里面传递我们想要获取的value对应的key，并提供一个默认的value作为查找的key不存在时函数的返回值。如下：

```java
SharedPreferences sharedPref = getActivity().getPreferences(Context.MODE_PRIVATE);
int defaultValue = getResources().getInteger(R.string.saved_high_score_default);
long highScore = sharedPref.getInt(getString(R.string.saved_high_score), default);
```
