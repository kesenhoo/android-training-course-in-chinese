# 添加移动

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/motion.html>

在屏幕上绘制图形是OpenGL的一个基本特性，但你也可以通过其它的Android图形框架类做这些事情，包括[Canvas](http://developer.android.com/reference/android/graphics/Canvas.html)和[Drawable](http://developer.android.com/reference/android/graphics/drawable/Drawable.html)对象。OpenGL ES提供额外的功能，能够在三维空间对绘制图形进行移动和变换操作，或者还可以通过其它独有的方法创建出引人入胜的用户体验。

在这节课中，一会更深入的学习OpenGL ES的知识：对一个形状添加旋转动画。

## 旋转一个形状

使用OpenGL ES 2.0 旋转一个绘制图形是比较简单的。首先创建一个变换矩阵（一个旋转矩阵）并且将它和你的投影变换矩阵和相机试图变换矩阵结合在一起：

```java
private float[] mRotationMatrix = new float[16];
public void onDrawFrame(GL10 gl) {
    ...
    float[] scratch = new float[16];

    // Create a rotation transformation for the triangle
    long time = SystemClock.uptimeMillis() % 4000L;
    float angle = 0.090f * ((int) time);
    Matrix.setRotateM(mRotationMatrix, 0, angle, 0, 0, -1.0f);

    // Combine the rotation matrix with the projection and camera view
    // Note that the mMVPMatrix factor *must be first* in order
    // for the matrix multiplication product to be correct.
    Matrix.multiplyMM(scratch, 0, mMVPMatrix, 0, mRotationMatrix, 0);

    // Draw triangle
    mTriangle.draw(scratch);
}
```

如果完成了这些变更以后，你的三角形还是没有旋转的话，确认一下你是否将[GLSurfaceView.RENDERMODE_WHEN_DIRTY](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#RENDERMODE_WHEN_DIRTY)的配置注释掉了，有关该方面的知识会在下一节中展开。

## 启用连续渲染

如果你严格按照这节课的样例代码走到了现在这一步，那么请确定您将设置渲染模式为“RENDERMODE_WHEN_DIRTY”的这一行注释了，不然的话OpenGL只会对这个形状执行一个增量的旋转，然后就等待[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)容器的[requestRender()](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#requestRender\(\))方法被调用。

```java
public MyGLSurfaceView(Context context) {
    ...
    // Render the view only when there is a change in the drawing data.
    // To allow the triangle to rotate automatically, this line is commented out:
    //setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
}
```

除非你的某个对象，它的变化和用户的交互无关，不然的话一般还是建议将这个配置打开。在下一节课将会将这个注释放开，并且再次调用。
