# 响应触摸事件

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/touch.html>

让对象根据预设的程序运动，如让一个三角形旋转可以有效地让人引起注意，但是如果你希望可以让OpenGL ES与用户交互呢？让你的OpenGL ES应用可以与触摸交互的关键点在于，拓展你的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的实现，覆写[onTouchEvent()](http://developer.android.com/reference/android/view/View.html#onTouchEvent\(android.view.MotionEvent\))方法来监听触摸事件。

这节课将会向你展示如何监听触摸事件，让用户旋转一个OpenGL ES对象。

## 配置触摸监听器

为了让你的OpenGL ES应用响应触摸事件，你必须实现在[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)类中的[onTouchEvent()](http://developer.android.com/reference/android/view/View.html#onTouchEvent\(android.view.MotionEvent\))方法。下述实现的样例展示了如何监听[MotionEvent.ACTION_MOVE](http://developer.android.com/reference/android/view/MotionEvent.html#ACTION_MOVE)事件，并将它们转换为形状旋转的角度：

```java
@Override
public boolean onTouchEvent(MotionEvent e) {
    // MotionEvent reports input details from the touch screen
    // and other input controls. In this case, you are only
    // interested in events where the touch position changed.

    float x = e.getX();
    float y = e.getY();

    switch (e.getAction()) {
        case MotionEvent.ACTION_MOVE:

            float dx = x - mPreviousX;
            float dy = y - mPreviousY;

            // reverse direction of rotation above the mid-line
            if (y > getHeight() / 2) {
              dx = dx * -1 ;
            }

            // reverse direction of rotation to left of the mid-line
            if (x < getWidth() / 2) {
              dy = dy * -1 ;
            }

            mRenderer.setAngle(
                    mRenderer.getAngle() +
                    ((dx + dy) * TOUCH_SCALE_FACTOR);  // = 180.0f / 320
            requestRender();
    }

    mPreviousX = x;
    mPreviousY = y;
    return true;
}
```

注意在计算旋转角度后，该方法会调用[requestRender()](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#requestRender\(\))来告诉渲染器现在可以进行渲染了。该方法对于这个例子来说是最有效的，因为图形并不需要重新绘制，除非有一个旋转角度的变化。然而，它对于执行效率并没有任何影响，除非你需要渲染器仅在数据变化时才会重新绘制（使用[setRenderMode()](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#setRenderMode\(int\))方法），所以请确保这一行没有被注释掉：

```java
public MyGLSurfaceView(Context context) {
    ...
    // Render the view only when there is a change in the drawing data
    setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
}
```

## 公开旋转角度

上述样例代码需要你公开旋转的角度，方法是在你的渲染器中添加一个共有成员。由于渲染器代码运行在一个独立的线程中（非主UI线程），你必须将你的这个公共变量声明为volatile。请看下面的代码：

```java
public class MyGLRenderer implements GLSurfaceView.Renderer {
    ...
    public volatile float mAngle;
```

## 应用旋转

为了应用触摸输入所导致的旋转，注释掉创建一个旋转角度的代码，然后添加mAngle，该变量包含了输入所导致的角度：

```java
public void onDrawFrame(GL10 gl) {
    ...
    float[] scratch = new float[16];

    // Create a rotation for the triangle
    // long time = SystemClock.uptimeMillis() % 4000L;
    // float angle = 0.090f * ((int) time);
    Matrix.setRotateM(mRotationMatrix, 0, mAngle, 0, 0, -1.0f);

    // Combine the rotation matrix with the projection and camera view
    // Note that the mMVPMatrix factor *must be first* in order
    // for the matrix multiplication product to be correct.
    Matrix.multiplyMM(scratch, 0, mMVPMatrix, 0, mRotationMatrix, 0);

    // Draw triangle
    mTriangle.draw(scratch);
}
```

当你完成了上述的步骤，运行这个程序并用你的手指在屏幕上拖动，来旋转三角形：

![ogl-triangle-touch](ogl-triangle-touch.png "由触摸输入所旋转的三角形（圆形代表了当前触摸位置）")
