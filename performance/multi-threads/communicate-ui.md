# 与UI线程通信

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/communicate-ui.html>

在前面的课程中你学习了如何在一个被[ThreadPoolExecutor](http://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor.html)管理的线程中开启一个任务。最后这一节课将会向你展示如何从执行的任务中发送数据给运行在UI线程中的对象。这个功能允许你的任务可以做后台工作，然后把得到的结果数据转移给UI元素使用，例如位图数据。

任何一个APP都有自己特定的一个线程用来运行UI对象，比如[View](http://developer.android.com/reference/android/view/View.html)对象，这个线程我们称之为UI线程。只有运行在UI线程中的对象能访问运行在其它线程中的对象。因为你的任务执行的线程来自一个线程池而不是执行在UI线程，所以他们不能访问UI对象。为了把数据从一个后台线程转移到UI线程，需要使用一个运行在UI线程里的[Handler](http://developer.android.com/reference/android/os/Handler.html)。

##在UI线程中定义一个Handler

[Handler](http://developer.android.com/reference/android/os/Handler.html)属于Android系统的线程管理框架的一部分。一个[Handler](http://developer.android.com/reference/android/os/Handler.html)对象用于接收消息和执行处理消息的代码。一般情况下，如果你为一个新线程创建了一个[Handler](http://developer.android.com/reference/android/os/Handler.html)，你还需要创建一个[Handler](http://developer.android.com/reference/android/os/Handler.html)，让它与一个已经存在的线程关联，用于这两个线程之间的通信。如果你把一个[Handler](http://developer.android.com/reference/android/os/Handler.html)关联到UI线程，处理消息的代码就会在UI线程中执行。

你可以在一个用于创建你的线程池的类的构造方法中实例化一个[Handler](http://developer.android.com/reference/android/os/Handler.html)对象，并把它定义为全局变量，然后通过使用[Handler (Looper) ](http://developer.android.com/reference/android/os/Handler.html#Handler)这一构造方法实例化它，用于关联到UI线程。<a href="http://developer.android.com/reference/android/os/Handler.html#Handler(android.os.Looper)" target="_blank">Handler(Looper)</a>这一构造方法需要传入了一个[Looper](http://developer.android.com/reference/android/os/Looper.html)对象，它是Android系统的线程管理框架中的另一部分。当你在一个特定的[Looper](http://developer.android.com/reference/android/os/Looper.html)实例的基础上去实例化一个[Handler](http://developer.android.com/reference/android/os/Handler.html)时，这个[Handler](http://developer.android.com/reference/android/os/Handler.html)与[Looper](http://developer.android.com/reference/android/os/Looper.html)运行在同一个线程里。例如：

```java
private PhotoManager() {
...
    // Defines a Handler object that's attached to the UI thread
    mHandler = new Handler(Looper.getMainLooper()) {
    ...
```

在这个[Handler](http://developer.android.com/reference/android/os/Handler.html)里需要重写<a href="http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message)" target="_blank">handleMessage()</a>方法。当这个[Handler](http://developer.android.com/reference/android/os/Handler.html)接收到由另外一个线程管理的[Handler](http://developer.android.com/reference/android/os/Handler.html)发送过来的新消息时，Android系统会自动调用这个方法，而所有线程对应的[Handler](http://developer.android.com/reference/android/os/Handler.html)都会收到相同信息。例如：

```java
        /*
         * handleMessage() defines the operations to perform when
         * the Handler receives a new Message to process.
         */
        @Override
        public void handleMessage(Message inputMessage) {
            // Gets the image task from the incoming Message object.
            PhotoTask photoTask = (PhotoTask) inputMessage.obj;
            ...
        }
    ...
    }
}
```

下一部分将向你展示如何用[Handler](http://developer.android.com/reference/android/os/Handler.html)转移数据。

##把数据从一个任务中转移到UI线程

为了从一个运行在后台线程的任务对象中转移数据到UI线程中的一个对象，首先需要存储任务对象中的数据和UI对象的引用；接下来传递任务对象和状态码给实例化[Handler](http://developer.android.com/reference/android/os/Handler.html)的那个对象。在这个对象里，发送一个包含任务对象和状态的[Message](http://developer.android.com/reference/android/os/Message.html)给[Handler](http://developer.android.com/reference/android/os/Handler.html)也运行在UI线程中，所以它可以把数据转移到UI线程。

###在任务对象中存储数据

比如这里有一个[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)，它运行在一个编码了一个[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)且存储这个[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)到父类*PhotoTask*对象里的后台线程。这个[Runnable](http://developer.android.com/reference/java/lang/Runnable.html)同样也存储了状态码*DECODE_STATE_COMPLETED*。

```java
// A class that decodes photo files into Bitmaps
class PhotoDecodeRunnable implements Runnable {
    ...
    PhotoDecodeRunnable(PhotoTask downloadTask) {
        mPhotoTask = downloadTask;
    }
    ...
    // Gets the downloaded byte array
    byte[] imageBuffer = mPhotoTask.getByteBuffer();
    ...
    // Runs the code for this task
    public void run() {
        ...
        // Tries to decode the image buffer
        returnBitmap = BitmapFactory.decodeByteArray(
                imageBuffer,
                0,
                imageBuffer.length,
                bitmapOptions
        );
        ...
        // Sets the ImageView Bitmap
        mPhotoTask.setImage(returnBitmap);
        // Reports a status of "completed"
        mPhotoTask.handleDecodeState(DECODE_STATE_COMPLETED);
        ...
    }
    ...
}
...
```

*PhotoTask*类还包含一个用于显示[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)的[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)的引用。虽然[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)和[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)ImageView</a>的引用在同一个对象中，但你不能把这个[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)分配给[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)去显示，因为它们并没有运行在UI线程中。

这时，下一步应该发送这个状态给`PhotoTask`对象。

###发送状态取决于对象层次

*PhotoTask*是下一个层次更高的对象，它包含将要展示数据的编码数据和[View](http://developer.android.com/reference/android/view/View.html)对象的引用。它会收到一个来自*PhotoDecodeRunnable*的状态码，并把这个状态码单独传递到一个包含线程池和[Handler](http://developer.android.com/reference/android/os/Handler.html)实例的对象：

```java
public class PhotoTask {
    ...
    // Gets a handle to the object that creates the thread pools
    sPhotoManager = PhotoManager.getInstance();
    ...
    public void handleDecodeState(int state) {
        int outState;
        // Converts the decode state to the overall state.
        switch(state) {
            case PhotoDecodeRunnable.DECODE_STATE_COMPLETED:
                outState = PhotoManager.TASK_COMPLETE;
                break;
            ...
        }
        ...
        // Calls the generalized state method
        handleState(outState);
    }
    ...
    // Passes the state to PhotoManager
    void handleState(int state) {
        /*
         * Passes a handle to this task and the
         * current state to the class that created
         * the thread pools
         */
        sPhotoManager.handleState(this, state);
    }
    ...
}
```

###转移数据到UI
从*PhotoTask*对象那里，*PhotoManager*对象收到了一个状态码和一个*PhotoTask*对象的引用。因为状态码是*TASK_COMPLETE*，所以创建一个[Message](http://developer.android.com/reference/android/os/Message.html)应该包含状态和任务对象，然后把它发送给[Handler](http://developer.android.com/reference/android/os/Handler.html)：

```java
public class PhotoManager {
    ...
    // Handle status messages from tasks
    public void handleState(PhotoTask photoTask, int state) {
        switch (state) {
            ...
            // The task finished downloading and decoding the image
            case TASK_COMPLETE:
                /*
                 * Creates a message for the Handler
                 * with the state and the task object
                 */
                Message completeMessage =
                        mHandler.obtainMessage(state, photoTask);
                completeMessage.sendToTarget();
                break;
            ...
        }
        ...
    }
```

最终，<a href="http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message)" target="_blank">Handler.handleMessage()</a>会检查每个传入进来的[Message](http://developer.android.com/reference/android/os/Message.html)，如果状态码是*TASK_COMPLETE*，这时任务就完成了，而传入的[Message](http://developer.android.com/reference/android/os/Message.html)里的*PhotoTask*对象里同时包含一个[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)和一个[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)。因为<a href="http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message)" target="_blank">Handler.handleMessage()</a>运行在UI线程里，所以它能安全地转移[Bitmap](http://developer.android.com/reference/android/graphics/Bitmap.html)数据给[ImageView](http://developer.android.com/reference/android/widget/ImageView.html)：

```java
private PhotoManager() {
        ...
            mHandler = new Handler(Looper.getMainLooper()) {
                @Override
                public void handleMessage(Message inputMessage) {
                    // Gets the task from the incoming Message object.
                    PhotoTask photoTask = (PhotoTask) inputMessage.obj;
                    // Gets the ImageView for this task
                    PhotoView localView = photoTask.getPhotoView();
                    ...
                    switch (inputMessage.what) {
                        ...
                        // The decoding is done
                        case TASK_COMPLETE:
                            /*
                             * Moves the Bitmap from the task
                             * to the View
                             */
                            localView.setImageBitmap(photoTask.getImage());
                            break;
                        ...
                        default:
                            /*
                             * Pass along other messages from the UI
                             */
                            super.handleMessage(inputMessage);
                    }
                    ...
                }
                ...
            }
            ...
    }
...
}
```

