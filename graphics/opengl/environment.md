# 建立 OpenGL ES 的环境(Building an OpenGL ES Environment)

> 编写:[jdneo](https://github.com/jdneo) - 原文:<http://developer.android.com/training/graphics/opengl/environment.html>

要在应用中使用 OpenGL ES 绘制图像，我们必须为它们创建一个 View 容器。一种比较直接的方法是实现 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 类和 [GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html) 类。其中，[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 是一个View容器，它用来存放使用 OpenGL 绘制的图形，而 [GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html) 则用来控制在该 View 中绘制的内容。关于这两个类的更多信息，你可以阅读：[OpenGL ES 开发手册](http://developer.android.com/guide/topics/graphics/opengl.html)。

使用 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 只是一种将 OpenGL ES 集成到应用中的方法之一。对于一个全屏的或者接近全屏的图形 View，使用它是一个合理的选择。开发者如果希望把 OpenGL ES 的图形集成到整个布局的一小部分里面，那么可以考虑使用 [TextureView](http://developer.android.com/reference/android/view/TextureView.html)。对于喜欢自己动手实现的开发者来说，还可以通过使用 [SurfaceView](http://developer.android.com/reference/android/view/SurfaceView.html) 搭建一个 OpenGL ES 的视图环境，但是这将会需要我们编写更多额外的代码。

在这节课中，我们将展示如何在一个简单的 Activity 程序中完成 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 和 [GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html) 的完整落地实现。

## 在 Manifest 配置文件中声明使用 OpenGL ES (Declare OpenGL ES Use in the Manifest)

为了让应用能够使用 OpenGL ES 2.0 接口，我们必须将下列声明添加到 Manifest 配置文件当中：

```xml
<uses-feature android:glEsVersion="0x00020000" android:required="true" />
```

如果我们的应用使用纹理压缩（Texture Compression），那么我们必须对支持的压缩格式也进行声明，确保应用仅安装在可以兼容的设备上：

```xml
<supports-gl-texture android:name="GL_OES_compressed_ETC1_RGB8_texture" />
<supports-gl-texture android:name="GL_OES_compressed_paletted_texture" />
```

更多关于纹理压缩的内容，可以阅读：[OpenGL](http://developer.android.com/guide/topics/graphics/opengl.html#textures)开发手册。

## 为 OpenGL ES 图形创建 Activity (Create an Activity for OpenGL ES Graphics)

Android 应用在呈现 OpenGL ES 的时候会使用 activity 作为用户界面，这和其他应用也同样会使用一个用户界面进行呈现交互的道理一样。主要的差别就是往 acitivity 布局内容上的的输入差异。在其他应用中你可能会使用 [TextView](http://developer.android.com/reference/android/widget/TextView.html)，[Button](http://developer.android.com/reference/android/widget/Button.html) 和 [ListView](http://developer.android.com/reference/android/widget/ListView.html) 等等，而在使用 OpenGL ES 的应用中，我们还可以添加一个 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)。

下面的代码展示了一个使用 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 作为其主 View 的 Activity：

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

> **Note：**OpenGL ES 2.0 需要 Android 2.2（API Level 8）或更高版本的系统，所以确保你的 Android 项目的 API 版本满足该要求。

## 构建一个GLSurfaceView对象(Build a GLSurfaceView Object)

[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 是一种比较特殊的View，我们可以在该 View 中绘制 OpenGL ES 图形，不过它自己并不做太多和绘制图形相关的任务。绘制对象的任务是由你在该 View 中配置的 [GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html) 所控制完成的。事实上，这个对象的代码非常简短，你可能不会希望继承它，直接创建一个未经修改的 GLSurfaceView 实例，不过请不要这么做，因为我们需要继承该类来捕捉触控事件，这方面知识会在[响应触摸事件](touch.html)（该系列课程的最后一节课）中做进一步的介绍。

[GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 的核心代码非常简短，如果想要快速的实现效果，我们通常可以在 Acitvity 中创建一个内部类并使用它：

```java
class MyGLSurfaceView extends GLSurfaceView {

    private final MyGLRenderer mRenderer;

    public MyGLSurfaceView(Context context){
        super(context);

        // Create an OpenGL ES 2.0 context
        setEGLContextClientVersion(2);

        mRenderer = new MyGLRenderer();

        // Set the Renderer for drawing on the GLSurfaceView
        setRenderer(mRenderer);
    }
}
```

另一个对于 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 实现的可选项，是将渲染模式设置为：[GLSurfaceView.RENDERMODE_WHEN_DIRTY](http://developer.android.com/reference/android/opengl/GLSurfaceView.html#RENDERMODE_WHEN_DIRTY)，其含义是：仅在你的绘制数据发生变化时才对视图进行绘制操作：

```java
// Render the view only when there is a change in the drawing data
setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
```

如果选用这一配置选项，那么除非调用了<a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.html#requestRender()"> requestRender() </a>，否则 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 不会被重新绘制，这样做可以让示例中的应用效率更高。

## 构建一个渲染类(Build a Renderer Class)

在一个使用 OpenGL ES 的应用中，一个 [GLSurfaceView.Renderer](http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html) 类的实现（或者我们将其称之为渲染器），正是事情变得有趣的地方。该类会控制和其相关联的 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html)，具体而言，它会控制在 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 上绘制的内容。在渲染器中，一共有三个方法会被Android系统调用，以此来明确要在 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 上绘制的内容以及如何绘制：
* <a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onSurfaceCreated(javax.microedition.khronos.opengles.GL10, javax.microedition.khronos.egl.EGLConfig)">onSurfaceCreated()</a>：调用一次，用来建立 View 的 OpenGL ES 环境。
* <a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame(javax.microedition.khronos.opengles.GL10)">onDrawFrame()</a>：每次重新绘制 View 时被调用。
* <a href="http://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer.html#onDrawFrame(javax.microedition.khronos.opengles.GL10)">onSurfaceChanged()</a>：如果 View 的几何形态发生变化时会被调用，例如当设备的屏幕方向发生改变时。

下面是一个非常基本的 OpenGL ES 渲染器的实现，它仅仅在 [GLSurfaceView](http://developer.android.com/reference/android/opengl/GLSurfaceView.html) 中画一个黑色的背景：

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

就是这样！上面的代码创建了一个简单地应用程序，它使用 OpenGL 让屏幕呈现为黑色。虽然它的代码看上去并没有做什么非常有意思的事情，但是通过创建这些类，我们已经对使用 OpenGL 绘制图形有了基本的认识和铺垫。

> **Note：**你可能想知道，自己明明使用的是 OpenGL ES 2.0 接口，为什么这些方法会有一个 [GL10](http://developer.android.com/reference/javax/microedition/khronos/opengles/GL10.html) 的参数。这是因为这些方法的签名（Method Signature）在2.0接口中被简单地重用了，以此来保持Android框架的代码尽量简单。

如果你对OpenGL ES接口很熟悉，那么你现在就可以在你的应用中构建一个OpenGL ES的环境并绘制图形了。当然， 如果你希望获取更多的帮助来学会使用OpenGL，那么请继续学习下一节课程获取更多的知识。
