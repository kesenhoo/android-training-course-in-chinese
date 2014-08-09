# 建立OpenGL ES的环境

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/environment.html>

要在你的应用中使用OpenGL ES绘制图像，你必须为它们创建一个View容器。一个比较直接的方法是同时实现一个[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)和一个[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)。[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)是那些用OpenGL所绘制的图形的View容器，而[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)则用来控制在该View中绘制的内容。关于这两个类的更多信息，你可以阅读：[OpenGL ES](http://developer.android.com/guide/topics/graphics/opengl.html)开发手册。

使用[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)只是一种将你的应用与OpenGL ES合并起来的方法。对于一个全屏的或者接近全屏的图形View，使用它是一个理想的选择。开发者如果希望把OpenGL ES的图形融合在布局的一小部分里面，那么可以考虑使用[TextureView](http://developer.android.com/reference/android/view/TextureView.html)。对于自己动手开发的开发者来说（DIY），还可以通过使用[SurfaceView](http://developer.android.com/reference/android/view/SurfaceView.html)来搭建一个OpenGL ES View，但这将需要编写更多的代码。

在这节课中，我们将解释如何在一个简单地应用activity中完成[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)和[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)的最小实现。

## 在配置文件中声明使用OpenGL ES

为了让你的应用能够使用OpenGL ES 2.0接口，你必须将下列声明添加到配置文件当中：

```xml
<uses-feature android:glEsVersion="0x00020000" android:required="true" />
```

如果你的应用使用纹理压缩（texture compression），那么你必须对你支持的压缩格式也进行声明，这样的话那些不支持这些格式的设备就不会尝试运行你的应用：

```xml
<supports-gl-texture android:name="GL_OES_compressed_ETC1_RGB8_texture" />
<supports-gl-texture android:name="GL_OES_compressed_paletted_texture" />
```

更多关于文理压缩的内容，可以阅读：[OpenGL](http://developer.android.com/guide/topics/graphics/opengl.html#textures)开发手册。

## 为OpenGL ES图形创建一个activity

使用OpenGL ES的安卓应用就像其它类型的应用有自己的用户接口一样，也拥有多个activity。主要的区别就在于acitivity布局上的不同。在许多应用中你可能会使用[TextView](http://developer.android.com/reference/android/widget/TextView.html)，[Button](http://developer.android.com/reference/android/widget/Button.html)和[ListView](http://developer.android.com/reference/android/widget/ListView.html)，在使用OpenGL ES的应用中，你需要添加一个[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)。

下面的代码展示了使用一个[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的最小化实现。它作为主View：

```java
public class OpenGLES20Activity extends Activity {

    private GLSurfaceView mGLView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Create a GLSurfaceView instance and set it
        // as the ContentView for this Activity.
        mGLView = new MyGLSurfaceView(this);
        setContentView(mGLView);
    }
}
```

> **Note：**OpenGL ES 2.0需要Android 2.2（API Level 8）或更高版本的系统，所以确保你的Android项目的API版本满足该要求。

## 构建一个GLSurfaceView对象

一个[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)是一个特定的View，在View中你可以绘制OpenGL ES图形。不过它自己所做的事情并不多。对于绘制对象的控制实际上是由你在该View中配置的[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)所负责的。事实上，这个对象的代码非常简短，你可能会希望跳过继承它，并且只创建一个未经修改的GLSurfaceView实例，不过请不要这么做。你需要继承该类来捕捉触控事件，这方面知识在[响应触摸事件](touch.html)（该系列课程的最后一节课）中会做进一步的介绍。

[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)的核心代码是很小的，所以对于一个快速地实现，通常可以在acitvity中创建一个内部类并使用它：

```java
class MyGLSurfaceView extends GLSurfaceView {

    public MyGLSurfaceView(Context context){
        super(context);

        // Set the Renderer for drawing on the GLSurfaceView
        setRenderer(new MyRenderer());
    }
}
```

当使用OpenGL ES 2.0时，你必须对你的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)构造函数添加另一个调用，以此明确你希望使用的是2.0版本的接口：

```java
// Create an OpenGL ES 2.0 context
setEGLContextClientVersion(2);
```

> **Note：**如果你在使用OpenGL ES 2.0版本的接口，确保在你的应用配置文件中也进行了相关声明。这在之前的章节中已经讨论过了。

另一个对于[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)实现的可选选项，是将渲染模式设置为：[GLSurfaceView.RENDERMODE_WHEN_DIRTY](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#RENDERMODE_WHEN_DIRTY)，其含义是：仅在你的绘画数据发生变化时才在视图中进行绘画操作：

```java
// Render the view only when there is a change in the drawing data
setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
```

这一配置将防止[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)框架被重新绘制，直到你调用了[requestRender()](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#requestRender\(\))，这将让应用的性能及效率得到提高。

## 构建一个渲染类

[GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html)类的实现，或者说在一个应用中使用OpenGL ES来进行渲染，正是事情变得有趣的地方。该类会控制和其相关联的[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)，决定在上面画什么。一共有三个渲染器的方法被Android系统调用，以此来明确要在[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)上画什么以及如何画：
* [onSurfaceCreated()](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceCreated\(javax.microedition.khronos.opengles.GL10, javax.microedition.khronos.egl.EGLConfig\))：调用一次，用来配置视图的OpenGL ES环境。
* [onDrawFrame()](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame\(javax.microedition.khronos.opengles.GL10\))：每次重画视图时被调用。
* [onSurfaceChanged()](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame\(javax.microedition.khronos.opengles.GL10\))：如果视图的几何形态发生变化时会被调用，例如当设备的屏幕方向发生改变时。

下面是一个非常基本的OpenGL ES渲染器的实现，作用仅仅是在[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)中画一个灰色的背景：

```java
public class MyGLRenderer implements GLSurfaceView.Renderer {

    public void onSurfaceCreated(GL10 unused, EGLConfig config) {
        // Set the background frame color
        GLES20.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    }

    public void onDrawFrame(GL10 unused) {
        // Redraw background color
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
    }

    public void onSurfaceChanged(GL10 unused, int width, int height) {
        GLES20.glViewport(0, 0, width, height);
    }
}
```

就仅仅是这样！上面的代码创建了一个简单地应用程序，它使用OpenGL显示一个灰色的屏幕。虽然它的代码做的事情并不怎么有趣，但是通过创建这些类，你已经为使用OpenGL绘制图形有了基本的认识和铺垫。

> **Note：**你可能想知道，在你明明使用的是OpenGL ES 2.0的接口的时候，为什么这些方法有一个[GL10](http://developer.android.com/reference/javax/microedition/khronos/opengles/GL10.html)的参数。这是因为这些方法在2.0接口中被简单地重用了，以此来保持Android框架尽量简单。

如果你对OpenGL ES接口很熟悉，那么你现在就可以在你的应用中部署一个OpenGL ES的环境并绘制图形。然而， 如果你希望获取更多的帮助来学会使用OpenGL，那么请继续学习下一节课程获取更多的知识。
