# 更新你的Security Provider来对抗SSL漏洞利用

> 编写:[craftsmanBai](https://github.com/craftsmanBai) - <http://z1ng.net> - 原文: <http://developer.android.com/training/articles/security-gms-provider.html>

安卓依靠security provider保障网络通信安全。然而有时默认的security provider存在安全漏洞。为了防止这些漏洞被利用，Google Play services 提供了一个自动更新设备的security provider的方法来对抗已知的漏洞。通过调用Google Play services方法，可以确保你的应用运行在可以抵抗已知漏洞的设备上。

举个例子，OpenSSL的漏洞(CVE-2014-0224)会导致中间人攻击，在通信双方不知情的情况下解密流量。Google Play services 5.0提供了一个补丁，但是必须确保应用安装了这个补丁。通过调用Google Play services方法，可以确保你的应用运行在可抵抗攻击的安全设备上。

**注意**：更新设备的security provider不是更新[android.net.SSLCertificateSocketFactory](http://developer.android.com/reference/android/net/SSLCertificateSocketFactory.html).比起使用这个类，我们更鼓励应用开发者使用融入密码学的高级方法。大多数应用可以使用类似[HttpsURLConnection](http://developer.android.com/reference/javax/net/ssl/HttpsURLConnection.html)，[HttpClient](http://developer.android.com/reference/org/apache/http/client/HttpClient.html)，[AndroidHttpClient](http://developer.android.com/reference/android/net/http/AndroidHttpClient.html)这样的API，而不必去设置[TrustManager](http://developer.android.com/reference/javax/net/ssl/TrustManager.html)或者创建一个[SSLCertificateSocketFactory](http://developer.android.com/reference/android/net/SSLCertificateSocketFactory.html)。


## 使用ProviderInstaller给Security Provider打补丁

使用providerinstaller类来更新设备的security provider。你可以通过调用该类的方法[installIfNeeded()]()(或者[ installifneededasync]())来验证security provider是否为最新的(必要的话更新它)。

当你调用[installifneeded]()时，[providerinstaller]()会做以下事情：

*	如果设备的Provider成功更新(或已经是最新的)，该方法返回正常。

*	如果设备的Google Play services 库已经过时了，这个方法抛出[googleplayservicesrepairableexception]()异常表明无法更新Provider。应用程序可以捕获这个异常并向用户弹出合适的对话框提示更新Google Play services。

*	如果产生了不可恢复的错误，该方法抛出[googleplayservicesnotavailableexception]()表示它无法更新[Provider]()。应用程序可以捕获异常并选择合适的行动，如显示标准问题解决流程图。

[installifneededasync]()方法类似，但它不抛出异常，而是通过相应的回调方法，以提示成功或失败。

如果[installifneeded]()需要安装一个新的[Provider]()，可能耗费30-50毫秒（较新的设备）到350毫秒（旧设备）。如果security provider已经是最新的，该方法需要的时间量可以忽略不计。为了避免影响用户体验：

*	线程加载后立即在后台网络线程中调用[installifneeded]()，而不是等待线程尝试使用网络。（多次调用该方法没有害处，如果安全提供程序不需要更新它会立即返回。）

*	如果用户体验会受线程阻塞的影响——比如从UI线程中调用，那么使用[installifneededasync()]()调用该方法的异步版本。（当然，如果你要这样做，在尝试任何安全通信之前必须等待操作完成。[providerinstaller]()调用监听者的[onproviderinstalled()]()方法发出成功信号。

**警告**：如果[providerinstaller]()无法安装更新Provider，您的设备security provider会容易受到已知漏洞的攻击。你的程序等同于所有HTTP通信未被加密。
一旦[Provider]()更新，所有安全API（包括SSL API）的调用会经过它(但这并不适用于[android.net.sslcertificatesocketfactory]()，面对[cve-2014-0224]()这种漏洞仍然是脆弱的)。


## 同步修补

修补security provider最简单的方法就是调用同步方法[installIfNeeded()](http://developer.android.com/reference/com/google/android/gms/security/ProviderInstaller.html##installIfNeeded(android.content.Context).如果用户体验不会被线程阻塞影响的话，这种方法很合适。

举个例子，这里有一个sync adapter会更新security provider。由于它运行在后台，因此在等待security provider更新的时候线程阻塞是可以的。sync adapter调用installifneeded()更新security provider。如果返回正常，sync adapter可以确保security provider是最新的。如果返回异常，sync adapter可以采取适当的行动（如提示用户更新Google Play services）。

```java

/**
 * Sample sync adapter using {@link ProviderInstaller}.
 */
public class SyncAdapter extends AbstractThreadedSyncAdapter {

  ...

  // This is called each time a sync is attempted; this is okay, since the
  // overhead is negligible if the security provider is up-to-date.
  @Override
  public void onPerformSync(Account account, Bundle extras, String authority,
      ContentProviderClient provider, SyncResult syncResult) {
    try {
      ProviderInstaller.installIfNeeded(getContext());
    } catch (GooglePlayServicesRepairableException e) {

      // Indicates that Google Play services is out of date, disabled, etc.

      // Prompt the user to install/update/enable Google Play services.
      GooglePlayServicesUtil.showErrorNotification(
          e.getConnectionStatusCode(), getContext());

      // Notify the SyncManager that a soft error occurred.
      syncResult.stats.numIOExceptions++;
      return;

    } catch (GooglePlayServicesNotAvailableException e) {
      // Indicates a non-recoverable error; the ProviderInstaller is not able
      // to install an up-to-date Provider.

      // Notify the SyncManager that a hard error occurred.
      syncResult.stats.numAuthExceptions++;
      return;
    }

    // If this is reached, you know that the provider was already up-to-date,
    // or was successfully updated.
  }
}

```


### 异步修补

更新security provider可能耗费350毫秒（旧设备）。如果在一个会直接影响用户体验的线程中更新，如UI线程，那么你不会希望进行同步更新，因为这可能导致应用程序或设备冻结直到操作完成。因此你应该使用异步方法[installifneededasync()](http://developer.android.com/reference/com/google/android/gms/security/ProviderInstaller.html#installIfNeededAsync(android.content.Context, com.google.android.gms.security.ProviderInstaller.ProviderInstallListener)。方法通过调用回调函数来反馈其成功或失败。
例如，下面是一些关于更新security provider在UI线程中的活动的代码。调用installifneededasync()来更新security provider，并指定自己为监听器接收成功或失败的通知。如果security provider是最新的或更新成功，会调用[onproviderinstalled()](http://developer.android.com/reference/com/google/android/gms/security/ProviderInstaller.ProviderInstallListener.html#onProviderInstalled()方法，并且知道通信是安全的。如果security provider无法更新，会调用[onproviderinstallfailed()](http://developer.android.com/reference/com/google/android/gms/security/ProviderInstaller.ProviderInstallListener.html#onProviderInstallFailed(int, android.content.Intent)方法，并采取适当的行动（如提示用户更新Google Play services）


```java
/**
 * Sample activity using {@link ProviderInstaller}.
 */
public class MainActivity extends Activity
    implements ProviderInstaller.ProviderInstallListener {

  private static final int ERROR_DIALOG_REQUEST_CODE = 1;

  private boolean mRetryProviderInstall;

  //Update the security provider when the activity is created.
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ProviderInstaller.installIfNeededAsync(this, this);
  }

  /**
   * This method is only called if the provider is successfully updated
   * (or is already up-to-date).
   */
  @Override
  protected void onProviderInstalled() {
    // Provider is up-to-date, app can make secure network calls.
  }

  /**
   * This method is called if updating fails; the error code indicates
   * whether the error is recoverable.
   */
  @Override
  protected void onProviderInstallFailed(int errorCode, Intent recoveryIntent) {
    if (GooglePlayServicesUtil.isUserRecoverableError(errorCode)) {
      // Recoverable error. Show a dialog prompting the user to
      // install/update/enable Google Play services.
      GooglePlayServicesUtil.showErrorDialogFragment(
          errorCode,
          this,
          ERROR_DIALOG_REQUEST_CODE,
          new DialogInterface.OnCancelListener() {
            @Override
            public void onCancel(DialogInterface dialog) {
              // The user chose not to take the recovery action
              onProviderInstallerNotAvailable();
            }
          });
    } else {
      // Google Play services is not available.
      onProviderInstallerNotAvailable();
    }
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode,
      Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == ERROR_DIALOG_REQUEST_CODE) {
      // Adding a fragment via GooglePlayServicesUtil.showErrorDialogFragment
      // before the instance state is restored throws an error. So instead,
      // set a flag here, which will cause the fragment to delay until
      // onPostResume.
      mRetryProviderInstall = true;
    }
  }

  /**
   * On resume, check to see if we flagged that we need to reinstall the
   * provider.
   */
  @Override
  protected void onPostResume() {
    super.onPostResult();
    if (mRetryProviderInstall) {
      // We can now safely retry installation.
      ProviderInstall.installIfNeededAsync(this, this);
    }
    mRetryProviderInstall = false;
  }

  private void onProviderInstallerNotAvailable() {
    // This is reached if the provider cannot be updated for some reason.
    // App should consider all HTTP communication to be vulnerable, and take
    // appropriate action.
  }
}

```
