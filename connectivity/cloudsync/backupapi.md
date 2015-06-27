# 使用备份API

> 编写:[kesenhoo](https://github.com/kesenhoo) - 原文:<http://developer.android.com/training/cloudsync/backupapi.html>

当用户购买了一台新的设备或者是对当前的设备做了恢复出厂设置的操作，用户会希望在进行初始化设置的时候，Google Play 能够把之前安装过的应用恢复到设备上。默认情况是，用户的这些期望并不会发生，他们之前的设置与数据都会丢失。

对于一些数据量相对较少的情况（通常少于1MB），例如用户偏好设置、笔记、游戏分数或者是其他的一些状态数据，可以使用 Backup API 来提供一个轻量级的解决方案。这节课会介绍如何将 Backup API 集成到我们的应用当中，以及如何利用 Backup API 将数据恢复到新的设备上。

## 注册 Android Backup Service

这节课中所使用的 [Android Backup Service](http://developer.android.com/google/backup/index.html) 需要进行注册。我们可以点击[这里](http://code.google.com/android/backup/signup.html)进行注册。注册成功后，服务器会提供一段类似于下面的代码，我们需要将它添加到应用的 Manifest 文件中:

<!-- More -->

```xml
<meta-data android:name="com.google.android.backup.api_key"
android:value="ABcDe1FGHij2KlmN3oPQRs4TUvW5xYZ" />
```

请注意，每一个备份 Key 都只能在特定的包名下工作。如果我们有不同的应用需要使用这个方法进行备份，那么需要分别为他们进行注册。

## 配置 Manifest 文件

使用 Android 的备份服务需要将两个额外的内容添加到应用的 Manifest 文件中。首先，声明备份代理的类名，然后添加一段类似上面的代码作为 Application 标签的子标签。假设我们的备份代理叫作 `TheBackupAgent`，下面的例子展示了如何在 Manifest 文件中添加这些信息:

```xml
<application android:label="MyApp"
             android:backupAgent="TheBackupAgent">
    ...
    <meta-data android:name="com.google.android.backup.api_key"
    android:value="ABcDe1FGHij2KlmN3oPQRs4TUvW5xYZ" />
    ...
</application>
```

## 编写备份代理

创建备份代理最简单的方法是继承 [BackupAgentHelper](http://developer.android.com/reference/android/app/backup/BackupAgentHelper.html)。 创建这个帮助类实际上非常简便。首先创建一个类，其类名和上述 Manifest 文件中声明的类名一致（本例中，它叫做 `TheBackupAgent`），然后继承 `BackupAgentHelper`，之后重写 <a href="http://developer.android.com/reference/android/app/backup/BackupAgent.html#onCreate()">onCreate()</a> 方法。

在 <a href="http://developer.android.com/reference/android/app/backup/BackupAgent.html#onCreate()">onCreate()</a> 中创建一个 [BackupHelper](http://developer.android.com/reference/android/app/backup/BackupHelper.html)。这些帮助类是专门用来备份某些数据的。目前 Android Framework 包含了两种帮助类：[FileBackupHelper](http://developer.android.com/reference/android/app/backup/FileBackupHelper.html) 与 [SharedPreferencesBackupHelper](http://developer.android.com/reference/android/app/backup/SharedPreferencesBackupHelper.html)。在我们创建一个帮助类并且指向需要备份的数据的时候，仅仅需要使用 <a href="http://developer.android.com/reference/android/app/backup/BackupAgentHelper.html#addHelper(java.lang.String, android.app.backup.BackupHelper)">addHelper()</a> 方法将它们添加到 `BackupAgentHelper` 当中， 之后再增加一个 Key 用来恢复数据。大多数情况下，完整的实现差不多只需要10行左右的代码。

下面是一个对高分数据进行备份的例子：

```java
 import android.app.backup.BackupAgentHelper;
 import android.app.backup.FileBackupHelper;


 public class TheBackupAgent extends BackupAgentHelper {
    // The name of the SharedPreferences file
    static final String HIGH_SCORES_FILENAME = "scores";

    // A key to uniquely identify the set of backup data
    static final String FILES_BACKUP_KEY = "myfiles";

    // Allocate a helper and add it to the backup agent
    @Override
    void onCreate() {
        FileBackupHelper helper = new FileBackupHelper(this, HIGH_SCORES_FILENAME);
        addHelper(FILES_BACKUP_KEY, helper);
    }
}
```

为了使得程序更加灵活，[FileBackupHelper](http://developer.android.com/reference/android/app/backup/FileBackupHelper.html) 的构造函数可以带有任意数量的文件名。我们只需简单地通过增加一个额外的参数，就能实现同时对最高分文件与游戏进度文件进行备份，如下所述：

```java
    @Override
    void onCreate() {
        FileBackupHelper helper = new FileBackupHelper(this, HIGH_SCORES_FILENAME, PROGRESS_FILENAME);
        addHelper(FILES_BACKUP_KEY, helper);
    }
```

备份用户偏好同样比较简单。和创建 [FileBackupHelper](http://developer.android.com/reference/android/app/backup/FileBackupHelper.html) 一样来创建一个 [SharedPreferencesBackupHelper](http://developer.android.com/reference/android/app/backup/SharedPreferencesBackupHelper.html)。在这种情况下, 不是添加文件名到构造函数当中，而是添加被应用所使用的 Shared Preference Groups 的名称。下面的例子展示的是，如果高分数据是以 Preference 的形式而非文件的形式存储的，备份代理帮助类应该如何设计：

```java
 import android.app.backup.BackupAgentHelper;
 import android.app.backup.SharedPreferencesBackupHelper;

 public class TheBackupAgent extends BackupAgentHelper {
     // The names of the SharedPreferences groups that the application maintains.  These
     // are the same strings that are passed to getSharedPreferences(String, int).
     static final String PREFS_DISPLAY = "displayprefs";
     static final String PREFS_SCORES = "highscores";

     // An arbitrary string used within the BackupAgentHelper implementation to
     // identify the SharedPreferencesBackupHelper's data.
     static final String MY_PREFS_BACKUP_KEY = "myprefs";

     // Simply allocate a helper and install it
     void onCreate() {
         SharedPreferencesBackupHelper helper =
                 new SharedPreferencesBackupHelper(this, PREFS_DISPLAY, PREFS_SCORES);
         addHelper(MY_PREFS_BACKUP_KEY, helper);
     }
 }
```

虽然我们可以根据喜好增加任意数量的备份帮助类到备份代理帮助类中，但是请记住每一种类型的备份帮助类只需要一个就够了。一个 [FileBackupHelper](http://developer.android.com/reference/android/app/backup/FileBackupHelper.html) 可以处理所有我们想要备份的文件, 而一个 [SharedPreferencesBackupHelper](http://developer.android.com/reference/android/app/backup/SharedPreferencesBackupHelper.html) 则能够处理所有我们想要备份的 Shared Preference Groups。

## 请求备份

为了请求一个备份，仅仅需要创建一个 [BackupManager](http://developer.android.com/reference/android/app/backup/BackupManager.html) 实例，然后调用它的 <a href="http://developer.android.com/reference/android/app/backup/BackupManager.html#dataChanged()">dataChanged()</a> 方法即可：

```java
 import android.app.backup.BackupManager;
 ...

 public void requestBackup() {
   BackupManager bm = new BackupManager(this);
   bm.dataChanged();
 }
```

该调用会告知备份管理器即将有数据会被备份到云端。在之后的某个时间点，备份管理器会执行备份代理的 <a href="http://developer.android.com/reference/android/app/backup/BackupAgent.html#onBackup(android.os.ParcelFileDescriptor, android.app.backup.BackupDataOutput, android.os.ParcelFileDescriptor)">onBackup()</a> 方法。无论任何时候，只要数据发生了改变，我们都可以去调用它，并且不用担心这样会增加网络的负荷。如果我们在备份正式发生之前请求了两次备份，那么最终备份操作仅仅会出现一次。

## 恢复备份数据

一般而言，我们不应该手动去请求恢复，而是应该让应用安装到设备上的时候自动进行恢复。然而，如果确实有必要手动去触发恢复，只需要调用 <a href="http://developer.android.com/reference/android/app/backup/BackupManager.html#requestRestore(android.app.backup.RestoreObserver)">requestRestore()</a> 方法就可以了。
