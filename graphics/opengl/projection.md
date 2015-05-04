# 运用投影与相机视角

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/projection.html>

在OpenGL ES环境中，利用投影和相机视角可以让显示的绘图对象更加酷似于我们用肉眼看到的真实物体。该物理视角的仿真是对绘制对象坐标的进行数学变换实现的：
* **投影（Projection）：**这个变换会基于显示它们的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的长和宽，来调整绘图对象的坐标。如果没有该计算，那么用OpenGL ES绘制的对象会由于其长宽比例和View窗口比例的不一致而发生形变。一个投影变换一般仅当OpenGL View的比例在渲染器的<a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceChanged(javax.microedition.khronos.opengles.GL10, int, int)">onSurfaceChanged()</a>方法中建立或发生变化时才被计算。关于更多OpenGL ES投影和坐标映射的知识，可以阅读[Mapping Coordinates for Drawn Objects](http://developer.android.com/guide/topics/graphics/opengl.html#coordinate-mapping)。
* **相机视角（Camera View）：**这个变换会基于一个虚拟相机位置改变绘图对象的坐标。注意到OpenGL ES并没有定义一个实际的相机对象，取而代之的，它提供了一些辅助方法，通过对绘图对象的变换来模拟相机视角。一个相机视角变换可能仅在建立你的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)时计算一次，也可能根据用户的行为或者你的应用的功能进行动态调整。

这节课将解释如何创建一个投影和一个相机视角，并应用它们到[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)中的绘制图像上。

## 定义一个投影

投影变换的数据会在[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)类的<a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceChanged(javax.microedition.khronos.opengles.GL10, int, int)">onSurfaceChanged()</a>方法中被计算。下面的代码首先接收[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的高和宽，然后利用它并使用<a href="http://developer.android.com/reference/android/opengl/Matrix.html#frustumM(float[], int, float, float, float, float, float, float)">Matrix.frustumM()</a>方法来填充一个投影变换矩阵（Projection Transformation [Matrix](http://developer.android.com/reference/android/opengl/Matrix.html)）：

```java
// mMVPMatrix is an abbreviation for "Model View Projection Matrix"
private final float[] mMVPMatrix = new float[16];
private final float[] mProjectionMatrix = new float[16];
private final float[] mViewMatrix = new float[16];

@Override
public void onSurfaceChanged(GL10 unused, int width, int height) {
    GLES20.glViewport(0, 0, width, height);

    float ratio = (float) width / height;

    // this projection matrix is applied to object coordinates
    // in the onDrawFrame() method
    Matrix.frustumM(mProjectionMatrix, 0, -ratio, ratio, -1, 1, 3, 7);
}
```

该代码填充了一个投影矩阵：mProjectionMatrix，在下一节中，我们可以在<a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame(javax.microedition.khronos.opengles.GL10)">onDrawFrame()</a>方法中将它和一个相机视角变换结合起来。

> **Note：**在绘图对象上只应用一个投影变换会导致显示效果看上去很空旷。一般而言，我们还要实现一个相机视角，使得所有对象出现在屏幕上。

## 定义一个相机视角

在渲染器中添加一个相机视角变换作为绘图过程的一部分，以此完成我们的绘图对象所需变换的所有步骤。在下面的代码中，使用<a href="http://developer.android.com/reference/android/opengl/Matrix.html#setLookAtM(float[], int, float, float, float, float, float, float, float, float, float)">Matrix.setLookAtM()</a>方法来计算相机视角变换，然后与之前计算的投影矩阵结合起来，结合后的变换矩阵传递给绘制图像：

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

为了使用在之前章节中结合了的相机视角变换和投影变换，我们首先为之前在Triangle类中定义的顶点着色器添加一个Matrix变量：

```java
public class Triangle {

    private final String vertexShaderCode =
        // This matrix member variable provides a hook to manipulate
        // the coordinates of the objects that use this vertex shader
        "uniform mat4 uMVPMatrix;" +
        "attribute vec4 vPosition;" +
        "void main() {" +
        // the matrix must be included as a modifier of gl_Position
        // Note that the uMVPMatrix factor *must be first* in order
        // for the matrix multiplication product to be correct.
        "  gl_Position = uMVPMatrix * vPosition;" +
        "}";

    // Use to access and set the view transformation
    private int mMVPMatrixHandle;

    ...
}
```

之后，修改图形对象的`draw()`方法，使得它接收组合后的变换矩阵，并将它应用到图形上：

```java
public void draw(float[] mvpMatrix) { // pass in the calculated transformation matrix
    ...

    // get handle to shape's transformation matrix
    mMVPMatrixHandle = GLES20.glGetUniformLocation(mProgram, "uMVPMatrix");

    // Pass the projection and view transformation to the shader
    GLES20.glUniformMatrix4fv(mMVPMatrixHandle, 1, false, mvpMatrix, 0);

    // Draw the triangle
    GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, vertexCount);

    // Disable vertex array
    GLES20.glDisableVertexAttribArray(mPositionHandle);
}
```

一旦我们正确地计算并应用了投影变换和相机视角变换，我们的图形就会以正确的比例绘制出来，它看上去会像是这样:

![ogl-triangle-projected](ogl-triangle-projected.png "应用了投影变换和相机视图变换的三角形")

现在，应用已经可以通过正确的比例显示图形了，下面就为图形添加一些动画效果吧！
