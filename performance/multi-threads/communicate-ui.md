# 与UI线程通信

> 编写:[AllenZheng1991](https://github.com/AllenZheng1991) - 原文:<http://developer.android.com/training/multiple-threads/communicate-ui.html>

在前面的课程中你学习了如何在一个被ThreadPoolExecutor管理的线程中开启一个任务。最后这一节课将会向你展示如何从执行的任务中发送数据给运行在UI线程中的对象。这个功能允许你的任务可以做后台工作，然后把得到的结果数据转移给UI元素使用，例如Bitmaps。

任何一个APP都有自己特定的一个线程用来运行UI对象，比如View对象，这个线程我们称之为UI线程。只有运行在UI线程中的对象能访问UI线程中的其他对象。因为你的任务执行的线程来自一个线程池而不是执行在UI线程，所以他们不能访问UI对象。为了把数据从一个后台线程转移到UI线程，需要使用一个运行在UI线程里的[Handler](http://developer.android.com/reference/android/os/Handler.html)。

## 在UI线程中定义一个Handler

Handler属于Android系统的线程管理框架的一部分。一个Handler对象用于接收消息和执行处理消息的代码。一般情况下，你会为一个新的线程创建一个对应的Handler，但是，你也可以把新创建的Handler与已经存在的线程进行关联。如果你把一个Handler关联到UI线程，处理消息的代码就会在UI线程中执行。

你可以在一个用于创建你的线程池的类的构造方法中实例化一个Handler对象，并把它定义为全局变量，然后通过使用Handler(Looper)这一构造方法实例化它，用于关联到UI线程。Handler(Looper)这一构造方法需要传入了一个[Looper](http://developer.android.com/reference/android/os/Looper.html)对象，它是Android系统的线程管理框架中的另一部分。当你在一个特定的[Looper](http://developer.android.com/reference/android/os/Looper.html)实例的基础上去实例化一个Handler时，这个Handler与[Looper](http://developer.android.com/reference/android/os/Looper.html)运行在同一个线程里。例如：

```java
private PhotoManager() {
...
    // Defines a Handler object that's attached to the UI thread
    mHandler = new Handler(Looper.getMainLooper()) {
    ...
```

在这个Handler里需要重写handleMessage()方法。当这个Handler对应的线程发出消息时，Android系统会自动调用这个方法。所有绑定到同一个线程的Handler都会收到相同信息。例如：

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
下一部分将向你展示如何用Handler转移数据。

## 把数据从一个任务中转移到UI线程

为了从一个运行在后台线程的任务对象中转移数据到UI线程中的一个对象，首先需要存储任务对象中的数据和UI对象的引用；接下来传递任务对象和状态码给实例化Handler的那个对象。在这个对象里，发送一个包含任务对象和状态的Message给Handler，因为Handler运行在UI线程中，所以它可以把数据转移到UI线程。

### 在任务对象中存储数据

比如这里有一个Runnable，它运行在一个后台线程，它的任务是decode 一个Bitmap然后把这个Bitmap存储到到父类对象`PhotoTask`中。这个Runnable同样也存储了状态码`DECODE_STATE_COMPLETED`。

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

`PhotoTask`类还包含一个用于给ImageView显示Bitmap的handler。虽然Bitmap和ImageView的引用在同一个对象中，但你不能把这个Bitmap分配给ImageView去显示，因为它们并没有运行在UI线程中。

这时，下一步应该发送这个状态给`PhotoTask`对象。

### 发送状态取决于对象层次

`PhotoTask`在对象层级中属于一个更高的级别，它包含将要展示数据的编码数据和View对象的引用。它会收到一个来自`PhotoDecodeRunnable`的状态码，并把这个状态码单独传递到一个包含线程池和Handler实例的对象：

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

### 转移数据到UI

从`PhotoTask`对象那里，`PhotoManager`对象收到了一个状态码和一个`PhotoTask`对象的handler。因为状态码是`TASK_COMPLETE`，所以创建一个Message应该包含状态和任务对象，然后把它发送给Handler：

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

最终，Handler.handleMessage()会检查每个传入进来的Message，如果状态码是`TASK_COMPLETE`，这时任务就完成了，而传入的Message里的`PhotoTask`对象里同时包含一个Bitmap和一个ImageView。因为Handler.handleMessage()运行在UI线程里，所以它能安全地转移Bitmap数据给ImageView：

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

