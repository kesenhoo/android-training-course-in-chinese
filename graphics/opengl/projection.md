# 运用投影与相机视图

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/projection.html>

在OpenGL ES环境中，投影和相机视图允许你显示绘图对象时，其效果更加酷似于你用肉眼看到的真实物体。这个物理视图的仿真是使用绘制对象坐标的数学变换实现的：
* **投影（Projection）：**这个变换会基于显示它们的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的长和宽，来调整绘图对象的坐标。如果没有该计算，那么用OpenGL ES绘制的对象会由于视图窗口比例的不匹配而发生形变。一个投影变换一般仅需要在渲染器的[onSurfaceChanged()](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceChanged\(javax.microedition.khronos.opengles.GL10, int, int\))方法中，OpenGL视图的比例建立时或发生变化时才被计算。关于更多OpenGL ES投影和坐标映射的知识，可以阅读[Mapping Coordinates for Drawn Objects](http://developer.android.com/guide/topics/graphics/opengl.html#coordinate-mapping)。
* **相机视图（camera view）：**这个变化会基于一个虚拟相机位置改变绘图对象的坐标。注意到OpenGL ES并没有定义一个实际的相机对象，但是取而代之的，它提供了一些辅助方法，通过变化绘图对象的显示来模拟相机。一个相机视图变换可能仅在你建立你的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)时计算一次，也可能根据用户的行为或者你的应用的功能进行动态调整。

这节课将解释如何创建一个投影和一个相机视图，并应用它们到[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)中的绘制图像上。

## 定义一个投影

投影变换的数据会在你的[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)类中的[onSurfaceChanged()](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceChanged\(javax.microedition.khronos.opengles.GL10, int, int\))方法中被计算。下面的代码首先接收[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的高和宽，然后用它来填充一个投影变换矩阵（[Matrix](http://developer.android.com/reference/android/opengl/Matrix.html)），使用[Matrix.frustumM()](http://developer.android.com/reference/android/opengl/Matrix.html#frustumM\(float[], int, float, float, float, float, float, float\))方法：

```java
@Override
public void onSurfaceChanged(GL10 unused, int width, int height) {
    GLES20.glViewport(0, 0, width, height);

    float ratio = (float) width / height;

    // this projection matrix is applied to object coordinates
    // in the onDrawFrame() method
    Matrix.frustumM(mProjectionMatrix, 0, -ratio, ratio, -1, 1, 3, 7);
}
```

该代码填充了一个投影矩阵：mProjectionMatrix，在下一节中，你可以在[onDrawFrame()](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame\(javax.microedition.khronos.opengles.GL10\))将它和一个相机视图变换结合起来。

> **Note：**在你的绘图对象上只应用一个投影变换会导致一个看上去很空的显示效果。一般而言，你必须同时为每一个要在屏幕上显示的任何东西实现一个相机视图。

## 定义一个相机视图

通过添加一个相机视图变换作为绘图过程的一部分，以此来完成你的绘图对象变换的所有步骤。在下面的代码中，使用[Matrix.setLookAtM()](http://developer.android.com/reference/android/opengl/Matrix.html#setLookAtM\(float[], int, float, float, float, float, float, float, float, float, float\))方法来计算相机视图变换，然后与之前计算的投影矩阵结合起来。结合后的变换矩阵传递给绘制图像：

```java
@Override
public void onDrawFrame(GL10 unused) {
    ...
    // Set the camera position (View matrix)
    Matrix.setLookAtM(mViewMatrix, 0, 0, 0, -3, 0f, 0f, 0f, 0f, 1.0f, 0.0f);

    // Calculate the projection and view transformation
    Matrix.multiplyMM(mMVPMatrix, 0, mProjectionMatrix, 0, mViewMatrix, 0);

    // Draw shape
    mTriangle.draw(mMVPMatrix);
}
```

## 应用投影和相机变换

为了使用在之前章节中结合了的相机视图变换和投影变换，修改你的图形对象的draw()方法，接收结合的变换并将其应用到图形上：

```java
public void draw(float[] mvpMatrix) { // pass in the calculated transformation matrix
    ...

    // get handle to shape's transformation matrix
    mMVPMatrixHandle = GLES20.glGetUniformLocation(mProgram, "uMVPMatrix");

    // Pass the projection and view transformation to the shader
    GLES20.glUniformMatrix4fv(mMVPMatrixHandle, 1, false, mvpMatrix, 0);

    // Draw the triangle
    GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, vertexCount);
    ...
}
```

一旦你正确地计算了投影变换和相机视图变换，并应用了它们，你的图形就会以正确的比例画出，看上去会像是这样:

![ogl-triangle-projected](ogl-triangle-projected.png "应用了投影变换和相机视图变换的三角形")

现在你有了一个能以正确的比例显示你的图形的应用了，下面就该为图形添加一些动画效果了！
