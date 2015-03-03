# 控制相机硬件

> 编写:[kesenhoo](https://github.com/kesenhoo) - :<http://developer.android.com/training/camera/cameradirect.html>

在这一节课，我们会讨论如何通过使用framework的APIs来直接控制相机的硬件。

直接控制设备的相机，相比向已有的相机应用请求图片或视频，要复杂一些。然而，如果你想要创建一个专业的相机程序或将相机整合在你的应用里，这节课会演示如何做到。

## 打开相机对象(Open the Camera Object)

获取一个 [Camera](http://developer.android.com/reference/android/hardware/Camera.html) 对象是直接控制Camera的第一步。正如Android自带的相机程序一样，推荐访问Camera的方式是在[onCreate()](http://developer.android.com/reference/android/app/Activity.html#onCreate(android.os.Bundle))方法里面另起一个Thread来打开Camera。这个方法可以避免因为打开工作比较费时而引起ANR。在一个更加基础的实现方法里面，打开Camera的动作可以延迟到onResume()方法里面去执行，这样使得代码更容易重用，并且保持控制流程简单。(原文是：In a more basic implementation, opening the camera can be deferred to the onResume() method to facilitate code reuse and keep the flow of control simple.)

<!-- more -->

在camera正在被另外一个程序使用的时候去执行 Camera.open() 会抛出一个exception，所以需要捕获起来。

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

自从API level 9开始，camera的framework可以支持多个cameras。如果你使用旧的API，调用open()时不传入参数 ，你会获取后置摄像头。

## 创建相机预览界面(Create the Camera Preview)

拍照通常需要提供一个预览界面来显示待拍的事物。你可以使用 [SurfaceView](http://developer.android.com/reference/android/view/SurfaceView.html) 来展现照相机采集的图像。

### Preview Class
为了显示一个预览界面，你需要一个Preview类。这个类需要实现android.view.SurfaceHolder.Callback 接口，用这个接口把camera硬件获取的数据传递给程序。

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

这个Preview类必须在图片预览开始之前传递给 Camera 对象。正如下面描述的：

### 设置和启动预览(Set and Start the Preview)

一个Camera实例与它相关的preview必须以一种指定的顺序来创建，首先是创建Camera对象。在下面的示例中，初始化camera的动作被封装起来，这样，无论用户想对Camera做任何的改变，[Camera.startPreview()](http://developer.android.com/reference/android/hardware/Camera.html#startPreview())都会被setCamera()调用。Preview对象必须在 surfaceChanged() 的回调方法里面做重新创建(restarted)的动作。

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

## 修改相机设置(Modify Camera Settings)

相机设置可以改变拍照的方式，从缩放级别到曝光补偿(exposure compensation)。下面的例子仅仅演示了改变预览大小的设置，更多设置请参考Camera应用的源代码。

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

## 设置预览方向(Set the Preview Orientation)

大多数相机程序会锁定预览为横屏的，因为相机传感器的自然方向。设置里面并没有阻止你去拍竖屏的照片，这些信息会被记录在EXIF(照片拍摄信息)里面。 [setCameraDisplayOrientation()](http://developer.android.com/reference/android/hardware/Camera.html#setDisplayOrientation(int)) 方法可以使得你改变预览的方向，并且不会影响到图片被记录的效果。然而，在Android API level 14之前，你必须在改变方向之前，先停止你的预览，然后才能去重启它。

## 拍一张图片(Take a Picture)

只要预览开始之后，可以使用[Camera.takePicture()](http://developer.android.com/reference/android/hardware/Camera.html#takePicture(android.hardware.Camera.ShutterCallback, android.hardware.Camera.PictureCallback, android.hardware.Camera.PictureCallback)) 方法来拍下一张图片。你可以创建[Camera.PictureCallback](http://developer.android.com/reference/android/hardware/Camera.PictureCallback.html) 与 [Camera.ShutterCallback](http://developer.android.com/reference/android/hardware/Camera.ShutterCallback.html) 对象并传递他们到Camera.takePicture()中。

如果你想要做连拍的动作，你可以创建一个[Camera.PreviewCallback](http://developer.android.com/reference/android/hardware/Camera.PreviewCallback.html) 并实现[onPreviewFrame()](http://developer.android.com/reference/android/hardware/Camera.PreviewCallback.html#onPreviewFrame(byte[], android.hardware.Camera)).你还可以选择几个预览帧来进行拍照，或是建立一个延迟拍照的动作。

## 重启预览(Restart the Preview)

在图片被获取后，你必须在用户拍下一张图片之前重启预览。在下面的示例中，通过重载快门按钮(shutter button)来实现重启。

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

## 停止预览并释放相机(Stop the Preview and Release the Camera)

当你的程序在使用Camera之后，有必要做清理的动作。特别是，你必须释放 Camera 对象，不然会引起其他app crash，包括你自己应用的新实例。

那么何时应该停止预览并释放相机呢? 在预览的surface被摧毁之后，可以做停止预览与释放相机的动作。如下面Preview类中的方法所示：

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

在这节课的前面，这一些系列的动作也是setCamera() 方法的一部分，因此初始化一个camera的动作，总是从停止预览开始的。
