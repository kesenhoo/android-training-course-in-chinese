# 定义形状

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/shapes.html>

在一个OpenGL ES View的上下文（Context）中定义形状，是创建你的杰作所需要的第一步。在了解关于OpenGL ES如何定义图形对象的基本知识之前，通过OpenGL ES 绘图可能会有些困难。

这节课将讲解OpenGL ES相对于Android设备屏幕的坐标系，定义形状和形状表面的基本知识，如定义一个三角形和一个矩形。

## 定义一个三角形

OpenGL ES允许我们使用三维空间的坐标来定义绘画对象。所以在我们能画三角形之前，必须先定义它的坐标。在OpenGL 中，典型的办法是为坐标定义一个浮点型的顶点数组。为了高效起见，我们可以将坐标写入一个[ByteBuffer](http://developer.android.com/reference/java/nio/ByteBuffer.html)，它将会传入OpenGl ES的图形处理流程中：

```java
public class Triangle {

    private FloatBuffer vertexBuffer;

    // number of coordinates per vertex in this array
    static final int COORDS_PER_VERTEX = 3;
    static float triangleCoords[] = {   // in counterclockwise order:
             0.0f,  0.622008459f, 0.0f, // top
            -0.5f, -0.311004243f, 0.0f, // bottom left
             0.5f, -0.311004243f, 0.0f  // bottom right
    };

    // Set color with red, green, blue and alpha (opacity) values
    float color[] = { 0.63671875f, 0.76953125f, 0.22265625f, 1.0f };

    public Triangle() {
        // initialize vertex byte buffer for shape coordinates
        ByteBuffer bb = ByteBuffer.allocateDirect(
                // (number of coordinate values * 4 bytes per float)
                triangleCoords.length * 4);
        // use the device hardware's native byte order
        bb.order(ByteOrder.nativeOrder());

        // create a floating point buffer from the ByteBuffer
        vertexBuffer = bb.asFloatBuffer();
        // add the coordinates to the FloatBuffer
        vertexBuffer.put(triangleCoords);
        // set the buffer to read the first coordinate
        vertexBuffer.position(0);
    }
}
```

默认情况下，OpenGL ES会假定一个坐标系，在这个坐标系中，[0, 0, 0]（分别对应X轴坐标, Y轴坐标, Z轴坐标）对应的是GLSurfaceView的中心。[1, 1, 0]对应的是右上角，[-1, -1, 0]对应的则是左下角。如果想要看此坐标系的插图说明，可以阅读[OpenGL ES](http://developer.android.com/guide/topics/graphics/opengl.html#faces-winding)开发手册。

注意到这个形状的坐标是以逆时针顺序定义的。绘制的顺序非常关键，因为它定义了哪一面是形状的正面（希望绘制的一面），以及背面（使用OpenGL ES的Cull Face功能可以让背面不要绘制）。更多关于该方面的信息，可以阅读[OpenGL ES](http://developer.android.com/guide/topics/graphics/opengl.html#faces-winding)开发手册。

## 定义一个矩形

在OpenGL中定义三角形非常简单，那么你是否想要来点更复杂的呢？比如，定义一个矩形？有很多方法可以用来定义矩形，不过在OpenGL ES中最典型的办法是使用两个三角形拼接在一起：

![ccw-square](ccw-square.png "使用两个三角形画一个矩形")

再一次地，我们需要逆时针地为三角形顶点定义坐标来表现这个图形，并将值放入一个[ByteBuffer](http://developer.android.com/reference/java/nio/ByteBuffer.html)中。为了避免由两个三角形重合的那条边的顶点被重复定义，可以使用一个绘制列表来告诉OpenGL ES图形处理流程应该如何画这些顶点。下面是代码样例：

```java
public class Square {

    private FloatBuffer vertexBuffer;
    private ShortBuffer drawListBuffer;

    // number of coordinates per vertex in this array
    static final int COORDS_PER_VERTEX = 3;
    static float squareCoords[] = {
            -0.5f,  0.5f, 0.0f,   // top left
            -0.5f, -0.5f, 0.0f,   // bottom left
             0.5f, -0.5f, 0.0f,   // bottom right
             0.5f,  0.5f, 0.0f }; // top right

    private short drawOrder[] = { 0, 1, 2, 0, 2, 3 }; // order to draw vertices

    public Square() {
        // initialize vertex byte buffer for shape coordinates
        ByteBuffer bb = ByteBuffer.allocateDirect(
        // (# of coordinate values * 4 bytes per float)
                squareCoords.length * 4);
        bb.order(ByteOrder.nativeOrder());
        vertexBuffer = bb.asFloatBuffer();
        vertexBuffer.put(squareCoords);
        vertexBuffer.position(0);

        // initialize byte buffer for the draw list
        ByteBuffer dlb = ByteBuffer.allocateDirect(
        // (# of coordinate values * 2 bytes per short)
                drawOrder.length * 2);
        dlb.order(ByteOrder.nativeOrder());
        drawListBuffer = dlb.asShortBuffer();
        drawListBuffer.put(drawOrder);
        drawListBuffer.position(0);
    }
}
```

该样例可以看作是一个如何使用OpenGL创建复杂图形的启发，通常来说，我们需要使用三角形的集合来绘制对象。在下一节课中，我们将学习如何在屏幕上画这些形状。
