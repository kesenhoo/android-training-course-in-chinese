# 控制相机

> 编写:[kesenhoo](https://github.com/kesenhoo) - :<http://developer.android.com/training/camera/cameradirect.html>

在这一节课，我们会讨论如何通过使用框架的API来直接控制相机硬件。

直接控制设备的相机，比起向已有的相机应用请求图片或视频，要复杂一些。然而，如果你想要创建一个特殊的相机应用或将相机整合在你的应用当中，这节课会演示如何做到。

## 打开相机对象

获取一个 [Camera](http://developer.android.com/reference/android/hardware/Camera.html) 对象是直接控制相机的第一步。正如Android自带的相机程序一样，访问相机推荐的方式是在[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))方法里面另起一个线程来打开相机。这种办法可以避免因为启动时间较长导致UI线程被阻塞。还有一种更好的方法，可以把打开相机的操作延迟到[onResume()](http://developer.android.com/reference/android/app/Activity.html#onResume())方法里面去执行，这样使得代码更容易重用，并且保持控制流程简单。

当相机正在被另外一个程序使用的时候去执行[Camera.open()](http://developer.android.com/reference/android/hardware/Camera.html#open())会抛出一个Exception，利用`try`语句块进行捕获：

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

自从API Level 9开始，相机框架可以支持多个相机。如果你使用旧的API，在调用[open()](http://developer.android.com/reference/android/hardware/Camera.html#open())时不传入参数 ，那么你会获取后置摄像头。

## 创建相机预览界面

拍照通常需要向用户提供一个预览界面来显示待拍摄的事物。你可以使用[SurfaceView](http://developer.android.com/reference/android/view/SurfaceView.html)来展现照相机采集的图像。

### Preview类

为了显示一个预览界面，你需要一个Preview类。这个类需要实现`android.view.SurfaceHolder.Callback`接口，用这个接口把相机硬件获取的数据传递给程序。

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

这个Preview类必须在实时图像预览开始之前传递给[Camera](http://developer.android.com/reference/android/hardware/Camera.html)对象。正如下一节所描述的：

### 设置和启动Preview

一个Camera实例与它相关的Preview必须以特定的顺序来创建，其中Camera对象首先被创建。在下面的示例中，初始化Camera的动作被封装了起来，这样，无论用户想对Camera做出任何改变，[Camera.startPreview()](http://developer.android.com/reference/android/hardware/Camera.html#startPreview())都会被`setCamera()`调用。另外，Preview对象必须在`surfaceChanged()`这一回调方法里面重新启用（restart）。

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

相机设置可以改变拍照的方式，从缩放级别到曝光补偿等。下面的例子仅仅演示了如何改变预览大小，更多设置请参考相机应用的源代码。

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

大多数相机程序会锁定预览为横屏状态，因为该方向是相机传感器的自然方向。当然这一设定并不会阻止你去拍竖屏的照片，因为设备的方向信息会被记录在EXIF头中。[setCameraDisplayOrientation()](http://developer.android.com/reference/android/hardware/Camera.html#setDisplayOrientation(int))方法可以让你在不影响照片拍摄过程的情况下，改变预览的方向。然而，对于Android API Level 14及以下版本的系统，在改变方向之前，你必须先停止你的预览，然后再去重启它。

## 拍摄照片

只要预览开始之后，可以使用[Camera.takePicture()](http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback))方法拍摄照片。你可以创建[Camera.PictureCallback](http://developer.android.com/reference/android/hardware/Camera.PictureCallback.html)与[Camera.ShutterCallback](http://developer.android.com/reference/android/hardware/Camera.ShutterCallback.html)对象并将他们传递到[Camera.takePicture()](http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback))中。

如果你想要进行连拍，你可以创建一个[Camera.PreviewCallback](http://developer.android.com/reference/android/hardware/Camera.PreviewCallback.html)并实现[onPreviewFrame()](http://developer.android.com/reference/android/hardware/Camera.PreviewCallback.html#onPreviewFrame(byte[], android.hardware.Camera))方法。你可以拍摄选中的预览帧，或是为调用[takePicture()](http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback))建立一个延迟。

## 重启Preview

在拍摄好图片后，你必须在用户拍下一张图片之前重启预览。在下面的示例中，利用快门按钮来实现重启。

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

当你的程序在使用相机完毕后，有必要做清理的动作。特别地，你必须释放[Camera](http://developer.android.com/reference/android/hardware/Camera.html)对象，不然可能会引起其他应用崩溃，包括你自己应用的新实例。

那么何时应该停止预览并释放相机呢？在预览的Surface被摧毁之后，可以做停止预览与释放相机的动作。如下面Preview类中的方法所示：

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
