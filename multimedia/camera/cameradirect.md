# 控制相机

> 编写:[kesenhoo](https://github.com/kesenhoo)@2016/11/30 - <http://developer.android.com/training/camera/cameradirect.html> 

在这一节课，我们会讨论如何通过使用Android框架所提供的API来直接控制相机硬件，实现自定义相机模块。

直接控制相机，相比起请求已经存在的相机应用进行拍照或录制视频，要复杂一些。这节课将会讲解如何创建一个专业的相机应用并将其整合到我们自己的应用界面中去。

## 打开相机对象

获取一个 [Camera](http://developer.android.com/reference/android/hardware/Camera.html) 实例是直接控制相机的第一步。正如Android自带的Camera程序一样，推荐的方式是在Activity的<a href="http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle)">onCreate()</a>方法里面另起一个线程，在这个单独的线程里面对Camera进行操作。在单独的线程里面访问Camera实例可以避免操作Camera实例的时间较长而导致UI线程被阻塞。更基础的实现方式是，编写一个打开Camera的方法，这个方法可以在<a href="http://developer.android.com/reference/android/app/Activity.html#onResume()">onResume()</a>方法里面去调用执行，单独的方法使得代码更容易重用，也便于保持控制流程更加简单。

如果我们在执行<a href="http://developer.android.com/reference/android/hardware/Camera.html#open()">Camera.open()</a>方法的时候Camera正在被另外一个应用使用，那么函数会抛出一个Exception，我们可以利用`try`语句块进行捕获：

```java
private boolean safeCameraOpen(int id) {
    boolean qOpened = false;
  
    try {
        releaseCameraAndPreview();
        mCamera = Camera.open(id);
        qOpened = (mCamera != null);
    } catch (Exception e) {
        Log.e(getString(R.string.app_name), "failed to open Camera");
        e.printStackTrace();
    }

    return qOpened;    
}

private void releaseCameraAndPreview() {
    mPreview.setCamera(null);
    if (mCamera != null) {
        mCamera.release();
        mCamera = null;
    }
}
```

自从API level 9开始，相机框架可以支持多个摄像头的打开操作。如果使用旧的API，在调用<a href="http://developer.android.com/reference/android/hardware/Camera.html#open()">open()</a>时不传入参数指定打开哪个摄像头，默认情况下会使用后置摄像头。

## 创建相机预览界面

拍照通常需要向用户提供一个预览界面来显示待拍摄的画面内容。我们可以使用[SurfaceView](http://developer.android.com/reference/android/view/SurfaceView.html)来呈现相机采集到的图像画面。

### Preview预览组件

我们需要使用preview class来显示预览界面。这个类需要实现`android.view.SurfaceHolder.Callback`接口，它会用这个接口把相机硬件获取到的图像数据传递给应用程序。

```java
class Preview extends ViewGroup implements SurfaceHolder.Callback {

    SurfaceView mSurfaceView;
    SurfaceHolder mHolder;

    Preview(Context context) {
        super(context);

        mSurfaceView = new SurfaceView(context);
        addView(mSurfaceView);

        // Install a SurfaceHolder.Callback so we get notified when the
        // underlying surface is created and destroyed.
        mHolder = mSurfaceView.getHolder();
        mHolder.addCallback(this);
        mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
    }
...
}
```

为了能够呈现相机图像画面，Preview类必须先获取[Camera](http://developer.android.com/reference/android/hardware/Camera.html)实例。

### 设置和启动Preview

一个Camera实例与它相关的Preview必须按照特定的顺序来创建，通常来说Camera对象优先被创建。在下面的示例中，初始化Camera的动作被封装了起来，这样，无论用户想对Camera做什么样的改变，<a href="http://developer.android.com/reference/android/hardware/Camera.html#startPreview()">Camera.startPreview()</a>都会被`setCamera()`调用。另外，Preview对象必须在`surfaceChanged()`这一回调方法里面重新启用（restart）。

```java
public void setCamera(Camera camera) {
    if (mCamera == camera) { return; }
    
    stopPreviewAndFreeCamera();
    
    mCamera = camera;
    
    if (mCamera != null) {
        List<Size> localSizes = mCamera.getParameters().getSupportedPreviewSizes();
        mSupportedPreviewSizes = localSizes;
        requestLayout();
      
        try {
            mCamera.setPreviewDisplay(mHolder);
        } catch (IOException e) {
            e.printStackTrace();
        }
      
        // Important: Call startPreview() to start updating the preview
        // surface. Preview must be started before you can take a picture.
        mCamera.startPreview();
    }
}
```

## 修改相机设置

相机参数的修改可以改变拍照的成像效果，例如缩放大小，曝光补偿值等等。下面的例子仅仅演示了如何改变预览大小，更多设置请参考相机应用的源代码。

```java
public void surfaceChanged(SurfaceHolder holder, int format, int w, int h) {
    // Now that the size is known, set up the camera parameters and begin
    // the preview.
    Camera.Parameters parameters = mCamera.getParameters();
    parameters.setPreviewSize(mPreviewSize.width, mPreviewSize.height);
    requestLayout();
    mCamera.setParameters(parameters);

    // Important: Call startPreview() to start updating the preview surface.
    // Preview must be started before you can take a picture.
    mCamera.startPreview();
}
```

## 设置预览方向

大多数相机程序会锁定预览方向为横屏状态，因为该方向是相机传感器的自然放置方向。当然这一设定并不妨碍我们去拍竖屏的照片，这个时候设备的方向角度信息会被记录在EXIF文件头中。<a href="http://developer.android.com/reference/android/hardware/Camera.html#setDisplayOrientation(int)">setCameraDisplayOrientation()</a>方法可以让你在不影响照片拍摄过程的情况下，改变预览的方向。然而，对于Android API level 14及更旧版本的系统，在改变方向之前，我们必须先停止相机预览，设置方向之后，然后再重启预览。

## 拍摄照片

一旦预览启动成功之后，可以使用<a href="http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback)">Camera.takePicture()</a>方法拍摄照片。我们可以创建<a href="http://developer.android.com/reference/android/hardware/Camera.PictureCallback.html">Camera.PictureCallback</a>与<a href="http://developer.android.com/reference/android/hardware/Camera.ShutterCallback.html">Camera.ShutterCallback</a>对象并将他们传递到<a href="http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback)">Camera.takePicture()</a>中。

如果我们想要获取每一帧的相机画面，可以创建一个[Camera.PreviewCallback](http://developer.android.com/reference/android/hardware/Camera.PreviewCallback.html)并实现<a href="http://developer.android.com/reference/android/hardware/Camera.PreviewCallback.html#onPreviewFrame(byte[], android.hardware.Camera)">onPreviewFrame()</a>回调。我们可以取景画面帧进行保存，也可以延迟调用<a href="http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback)">takePicture()</a>来进行拍照。

## 重启Preview

在拍摄好图片后，我们必须在用户拍下一张图片之前重启预览。下面的示例是根据快门按钮的不同状态来实现重启预览。

```java
@Override
public void onClick(View v) {
    switch(mPreviewState) {
    case K_STATE_FROZEN:
        mCamera.startPreview();
        mPreviewState = K_STATE_PREVIEW;
        break;

    default:
        mCamera.takePicture( null, rawCallback, null);
        mPreviewState = K_STATE_BUSY;
    } // switch
    shutterBtnConfig();
}
```

## 停止预览并释放相机

当应用使用完相机之后，我们有必要进行清理释放资源的操作。尤其是，我们必须释放[Camera](http://developer.android.com/reference/android/hardware/Camera.html)对象，不然的话可能会引起其他应用程序使用Camera实例的时候发生崩溃，包括我们自己应用也同样会遇到这个问题。

那么何时应该停止预览并释放相机呢？在预览Surface组件被销毁之后，可以做停止预览与释放相机的操作。如下面Preview类中的方法所做的那样：

```java
public void surfaceDestroyed(SurfaceHolder holder) {
    // Surface will be destroyed when we return, so stop the preview.
    if (mCamera != null) {
        // Call stopPreview() to stop updating the preview surface.
        mCamera.stopPreview();
    }
}

/**
 * When this function returns, mCamera will be null.
 */
private void stopPreviewAndFreeCamera() {

    if (mCamera != null) {
        // Call stopPreview() to stop updating the preview surface.
        mCamera.stopPreview();
    
        // Important: Call release() to release the camera for use by other
        // applications. Applications should release the camera immediately
        // during onPause() and re-open() it during onResume()).
        mCamera.release();
    
        mCamera = null;
    }
}
```

在这节课的前部分中，这一些系列的动作也是`setCamera()`方法的一部分，因此初始化一个相机的动作，总是从停止预览开始的。
