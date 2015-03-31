# 绘制形状

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/draw.html>

在定义了使用OpenGL绘制的形状之后，你可能希望绘制出它们。使用OpenGL ES 2.0绘制图形可能会比你想象当中更复杂一些，因为API中提供了大量对于图形渲染流程的控制。

这节课将解释如何使用OpenGL ES 2.0接口画出在上一节课中定义的形状。

## 初始化形状

在你开始绘画之前，你需要初始化并加载你期望绘制的图形。除非你所使用的形状结构（原始坐标）在执行过程中发生了变化，不然的话你应该在渲染器的<a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceCreated(javax.microedition.khronos.opengles.GL10, javax.microedition.khronos.egl.EGLConfig)">onSurfaceCreated()</a>方法中初始化它们，这样做是出于内存和执行效率的考量。

```java
public class MyGLRenderer implements GLSurfaceView.Renderer {

    ...
    private Triangle mTriangle;
    private Square   mSquare;

    public void onSurfaceCreated(GL10 unused, EGLConfig config) {
        ...

        // initialize a triangle
        mTriangle = new Triangle();
        // initialize a square
        mSquare = new Square();
    }
    ...
}
```

### 画一个形状

使用OpenGL ES 2.0画一个定义好的形状需要较多代码，因为你需要提供很多图形渲染流程的细节。具体而言，你必须定义如下几项：
* 顶点着色器（Vertex Shader）：用来渲染形状顶点的OpenGL ES代码。
* 片段着色器（Fragment Shader）：使用颜色或纹理渲染形状表面的OpenGL ES代码。
* 程式（Program）：一个OpenGL ES对象，包含了你希望用来绘制一个或更多图形所要用到的着色器。

你需要至少一个顶点着色器来绘制一个形状，以及一个片段着色器为该形状上色。这些着色器必须被编译然后添加到一个OpenGL ES Program当中，并利用它来绘制形状。下面的代码在Triangle类中定义了基本的着色器，我们可以利用它们绘制出一个图形：

```java
public class Triangle {

    private final String vertexShaderCode =
        "attribute vec4 vPosition;" +
        "void main() {" +
        "  gl_Position = vPosition;" +
        "}";

    private final String fragmentShaderCode =
        "precision mediump float;" +
        "uniform vec4 vColor;" +
        "void main() {" +
        "  gl_FragColor = vColor;" +
        "}";

    ...
}
```

着色器包含了OpenGL Shading Language（GLSL）代码，它必须先被编译然后才能在OpenGL环境中使用。要编译这些代码，需要在你的渲染器类中创建一个辅助方法：

```java
public static int loadShader(int type, String shaderCode){

    // create a vertex shader type (GLES20.GL_VERTEX_SHADER)
    // or a fragment shader type (GLES20.GL_FRAGMENT_SHADER)
    int shader = GLES20.glCreateShader(type);

    // add the source code to the shader and compile it
    GLES20.glShaderSource(shader, shaderCode);
    GLES20.glCompileShader(shader);

    return shader;
}
```

为了绘制你的图形，你必须编译着色器代码，将它们添加至一个OpenGL ES Program对象中，然后执行链接。在你的绘制对象的构造函数里做这些事情，这样上述步骤就只用执行一次。

> **Note：**编译OpenGL ES着色器及链接操作对于CPU周期和处理时间而言，消耗是巨大的，所以你应该避免重复执行这些事情。如果在执行期间不知道着色器的内容，那么你应该在构建你的应用时，确保它们只被创建了一次，并且缓存以备后续使用。

```java
public class Triangle() {
    ...

    private final int mProgram;

    public Triangle() {
        ...

        int vertexShader = MyGLRenderer.loadShader(GLES20.GL_VERTEX_SHADER,
                                        vertexShaderCode);
        int fragmentShader = MyGLRenderer.loadShader(GLES20.GL_FRAGMENT_SHADER,
                                        fragmentShaderCode);

        // create empty OpenGL ES Program
        mProgram = GLES20.glCreateProgram();

        // add the vertex shader to program
        GLES20.glAttachShader(mProgram, vertexShader);

        // add the fragment shader to program
        GLES20.glAttachShader(mProgram, fragmentShader);

        // creates OpenGL ES program executables
        GLES20.glLinkProgram(mProgram);
    }
}
```

至此，你已经完全准备好添加实际的调用语句来绘制你的图形了。使用OpenGL ES绘制图形需要你定义一些变量来告诉渲染流程你需要绘制的内容以及如何绘制。既然绘制属性会根据形状的不同而发生变化，把绘制逻辑包含在形状类里面将是一个不错的主意。

创建一个`draw()`方法来绘制图形。下面的代码为形状的顶点着色器和形状着色器设置了位置和颜色值，然后执行绘制函数：

```java
private int mPositionHandle;
private int mColorHandle;

private final int vertexCount = triangleCoords.length / COORDS_PER_VERTEX;
private final int vertexStride = COORDS_PER_VERTEX * 4; // 4 bytes per vertex

public void draw() {
    // Add program to OpenGL ES environment
    GLES20.glUseProgram(mProgram);

    // get handle to vertex shader's vPosition member
    mPositionHandle = GLES20.glGetAttribLocation(mProgram, "vPosition");

    // Enable a handle to the triangle vertices
    GLES20.glEnableVertexAttribArray(mPositionHandle);

    // Prepare the triangle coordinate data
    GLES20.glVertexAttribPointer(mPositionHandle, COORDS_PER_VERTEX,
                                 GLES20.GL_FLOAT, false,
                                 vertexStride, vertexBuffer);

    // get handle to fragment shader's vColor member
    mColorHandle = GLES20.glGetUniformLocation(mProgram, "vColor");

    // Set color for drawing the triangle
    GLES20.glUniform4fv(mColorHandle, 1, color, 0);

    // Draw the triangle
    GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, vertexCount);

    // Disable vertex array
    GLES20.glDisableVertexAttribArray(mPositionHandle);
}
```

一旦你完成了上述所有代码，仅需要在你渲染器的<a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame(javax.microedition.khronos.opengles.GL10)">onDrawFrame()</a>方法中调用`draw()`方法就可以画出我们想要画的对象了：

```java
public void onDrawFrame(GL10 unused) {
    ...

    mTriangle.draw();
}
```

当你运行这个应用时，它看上去会像是这样：

![ogl-triangle](ogl-triangle.png "不使用投影或者相机视图画出来的三角形")

在这个代码样例中，还存在一些问题。首先，它无法给用户带来什么深刻的印象。其次，这个三角形看上去有一些扁，另外当你改变屏幕方向时，它的形状也会随之改变。发生形变的原因是因为对象的顶点没有根据显示[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的屏幕区域的长宽比进行修正。你可以在下一节课中使用投影（Projection）或者相机视角（Camera View）来解决这个问题。

最后，这个三角形是静止的，这看上去有些无聊。在[添加移动](motion.html)课程当中（后续课程），你会让这个形状发生旋转，并使用一些OpenGL ES图形处理流程中更加新奇的用法。
