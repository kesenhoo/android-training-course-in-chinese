# Android Training Course in Chinese

* Android Training翻译组：363415744
* Android Training交流群：348663273

欢迎所有学习Android开发的同学加入交流，更欢迎有意向参与到这个课程汉化项目中的同学。请看到的同学Star支持，感谢！

## Android Training Course
<http://developer.android.com/training/index.html>

这是由Google Android团队开设的一系列培训课程，从2012年开始的10几篇文章，不断的增加与更新，直到现在2014年中，已经有近百个课程。这真的是一份学习Android应用开发绝佳一手资料。

很可惜，这么一份很好的资料一直没有一份完整的中文版，个人从2012年发现Training课程开始，一直断断续续的在学习Android官方的Training课程，并很拙劣的输出了不少学习翻译笔记，个人实力与精力有限，很期待这次能够发起这个项目，借助大家的力量，一起尽快完成所有课程的中文版，更好的为学习Android开发贡献力量。

整个课程的目录已经搭建完毕，大部分课程都有分了好几个篇章，期待大家的加入！

<a name="online_reading"></a>
## 在线阅读

点击在线阅读<http://hukai.me/android-training-course-in-chinese/index.html>

Power by [Gitbook](https://www.gitbook.io/)

<a name="courses"></a>
## 课程结构

**目录对应的文件路径：所有的源文件放在项目根目录的`SOURCE`目录下，打开`SOURCE`目录下的`SUMMARY.md`文件查看下面章节对应的路径与文件名**

* [序言](README.md)
* [开始](basics/index.md)
   * [建立你的第一个App](basics/firstapp/index.md)
       * [创建一个Android项目](basics/firstapp/creating-project.md)
       * [执行你的程序](basics/firstapp/running-app.md)
       * [建立一个简单的用户界面](basics/firstapp/building-ui.md)
       * [启动另外的Activity](basics/firstapp/starting-activity.md)
   * [添加ActionBar](basics/actionbar/index.md)
       * [建立ActionBar](basics/actionbar/setting-up.md)
       * [添加Action按钮](basics/actionbar/adding-buttons.md)
       * [ActionBar的风格化](basics/actionbar/styling.md)
   * [兼容不同的设备](basics/supporting-devices/index.md)
       * [适配不同的语言](basics/supporting-devices/languages.md)
       * [适配不同的屏幕](basics/supporting-devices/screens.md)
       * [适配不同的系统版本](basics/supporting-devices/platforms.md)
   * **[管理Activity的生命周期](basics/activity-lifecycle/index.md)(待校验，由@[kesenhoo](https://github.com/kesenhoo)编写)**
       * [启动与销毁Activity](basics/activity-lifecycle/starting.md)
       * [暂停与恢复Activity](basics/activity-lifecycle/pausing.md)
       * [停止与重启Activity](basics/activity-lifecycle/stopping.md)
       * [重新创建Activity](basics/activity-lifecycle/recreating.md)
   * **[使用Fragment建立动态的UI](basics/fragments/index.md)(编写进行中@[fastcome1985](https://github.com/fastcome1985))**
       * [创建一个Fragment](basics/fragments/creating.md)
       * [建立灵活动态的UI](basics/fragments/fragment-ui.md)
       * [Fragments之间的交互](basics/fragments/communicating.md)
   * [数据保存](basics/data-storage/index.md)
       * [保存到Preference](basics/data-storage/shared-preference.md)
       * [保存到文件](basics/data-storage/files.md)
       * [保存到数据库](basics/data-storage/database.md)
   * [与其他应用的交互](basics/intents/index.md)
       * [Intent的发送](basics/intents/sending.md)
       * [接收Activity返回的结果](basics/intents/result.md)
       * [Intent过滤](basics/intents/filters.md)
* [分享](content-sharing/index.md)
   * [分享简单的数据](content-sharing/sharing/index.md)
      * [给其他App发送简单的数据](content-sharing/sharing/send.md)
      * [接收从其他App返回的数据](content-sharing/sharing/receive.md)
      * [添加一个简便的分享动作](content-sharing/sharing/shareaction.md)
   * [分享文件](content-sharing/secure-file-sharing/index.md)
      * [建立文件分享](content-sharing/secure-file-sharing/setup-sharing.md)
      * [分享文件](content-sharing/secure-file-sharing/sharing-file.md)
      * [请求分享一个文件](content-sharing/secure-file-sharing/request-file.md)
      * [获取文件信息](content-sharing/secure-file-sharing/retrieve-info.md)
   * [使用NFC分享文件](content-sharing/beam-files/index.md)
      * [发送文件给其他设备](content-sharing/beam-files/sending-files.md)
      * [接收其他设备的文件](content-sharing/beam-files/receive-files.md)
* [多媒体](multimedia/index.md)
   * [管理音频播放](multimedia/audio/index.md)
      * [控制你得应用的音量与播放](multimedia/audio/volume-playback.md)
      * [管理音频焦点](multimedia/audio/audio-focus.md)
      * [兼容音频输出设备](multimedia/audio/audio-output.md)
   * [拍照](multimedia/camera/index.md)
      * [简单的拍照](multimedia/camera/photobasic.md)
      * [简单的录像](multimedia/camera/videobasic.md)
      * [控制相机硬件](multimedia/camera/cameradirect.md)
   * [打印](multimedia/printing/index.md)
      * [打印照片](multimedia/printing/photos.md)
      * [打印HTML文档](multimedia/printing/html-docs.md)
      * [打印自定义文档](multimedia/printing/custom-docs.md)
* [图像](graphics/index.md)
   * [高效显示Bitmap](graphics/displaying-bitmaps/index.md)
      * [高效加载大图](graphics/displaying-bitmaps/load-bitmap.md)
      * [非UI线程处理Bitmap](graphics/displaying-bitmaps/process-bitmap.md)
      * [缓存Bitmap](graphics/displaying-bitmaps/cache-bitmap.md)
      * [管理Bitmap的内存占用](graphics/displaying-bitmaps/manage-bitmap-memory.md)
      * [在UI上显示Bitmap](graphics/displaying-bitmaps/display-bitmap.md)
   * [使用OpenGL ES显示图像](graphics/opengl/index.md)
      * [建立OpenGL ES的环境](graphics/opengl/environment.md)
      * [定义Shapes](graphics/opengl/shapes.md)
      * [绘制Shapes](graphics/opengl/draw.md)
      * [运用投影与相机视图](graphics/opengl/projection.md)
      * [添加移动](graphics/opengl/motion.md)
      * [响应触摸事件](graphics/opengl/touch.md)
* **[动画](animations/index.md)(编写进行中:@[wangyan3](https://github.com/wangyan3))**
   * [淡入淡出两个View](animations/crossfade.md)
   * [使用ViewPager实现屏幕滑动](animations/screen-slide.md)
   * [卡片翻转的动画](animations/cardflip.md)
   * [缩放动画](animations/zoom.md)
   * [控件切换动画](animations/layout.md)
* [连接](connectivity/index.md)
   * [无线连接设备](connectivity/connect-devices-wireless/index.md)
      * [使得网络服务可发现](connectivity/connect-devices-wireless/nsd.md)
      * [使用WiFi建立P2P连接](connectivity/connect-devices-wireless/wifi-direct.md)
      * [使用WiFi P2P服务](connectivity/connect-devices-wireless/nsd-wifi-index.md)
   * [网络连接操作](connectivity/network-ops/index.md)
      * [连接到网络](connectivity/network-ops/connecting.md)
      * [管理使用的网络](connectivity/network-ops/managing.md)
      * [解析XML数据](connectivity/network-ops/xml.md)
   * [高效下载](connectivity/efficient-downloads/index.md)
      * [为网络访问更加高效而优化下载](connectivity/efficient-downloads/efficient-network-access.md)
      * [最小化更新操作的影响](connectivity/efficient-downloads/regular-update.md)
      * [避免下载多余的数据](connectivity/efficient-downloads/redundant-redundant.md)
      * [根据网络类型改变下载模式](connectivity/efficient-downloads/connectivity-patterns.md)
   * [使用Sync Adapter传输数据](connectivity/sync-adapters/index.md)
      * [创建Stub授权器](connectivity/sync-adapters/create-authenticator.md)
      * [创建Stub Content Provider](connectivity/sync-adapters/create-stub-provider.md)
      * [创建Sync Adpater](connectivity/sync-adapters/create-sync-adapter.md)
      * [执行Sync Adpater](connectivity/sync-adapters/running-sync-adapter.md)
   * [使用Volley执行网络数据传输](connectivity/volley/index.md)
      * [发送简单的网络请求](connectivity/volley/simple.md)
      * [建立请求队列](connectivity/volley/request-queue.md)
      * [创建标准的网络请求](connectivity/volley/request.md)
      * [实现自定义的网络请求](connectivity/volley/request-custom.md)
* [云服务](cloud/index.md)
   * [云同步](cloud/cloudsync/index.md)
      * [使用备份API](cloud/cloudsync/backupapi.md)
      * [使用Google Cloud Messaging](cloud/cloudsync/gcm.md)
   * [解决云同步的保存冲突](cloud/cloudsave/index.md)
* **[用户信息](contacts-provider/index.md)(编写进行中:@[spencer198711](https://github.com/spencer198711))**
   * [获取联系人列表](contacts-provider/retrieve-names.md)
   * [获取联系人详情](contacts-provider/retrieve-detail.md)
   * [修改联系人信息](contacts-provider/modify-data.md)
   * [显示联系人头像](contacts-provider/display-badge.md)
* [位置信息](location/index.md)
   * [获取当前位置](location/retrieve-current.md)
   * [获取位置更新](location/retrieve-location-updates.md)
   * [显示位置地址](location/display-address.md)
   * [创建并监视异常区域](location/geofencing.md)
   * [识别用户的当下活动](location/activity-recognition.md)
   * [使用模拟位置进行测试](location/location-testing.md)
* [交互](ux/index.md)
   * [设计高效的导航](ux/design-nav/index.md)
      * [规划屏幕界面与他们之间的关系](ux/design-nav/screen-planning.md)
      * [为多种大小的屏幕进行规划](ux/design-nav/multi-sizes.md)
      * [提供向下与侧滑的导航](ux/design-nav/descendant-lateral.md)
      * [提供向上与暂时的导航](ux/design-nav/ancestral-temporal.md)
      * [综合上面所有的导航](ux/design-nav/wireframing.md)
   * [实现高效的导航](ux/implement-nav/index.md)
      * [使用Tabs创建Swipe视图](ux/implement-nav/lateral.md)
      * [创建抽屉导航](ux/implement-nav/nav-drawer.md)
      * [提供向上的导航](ux/implement-nav/ancestral.md)
      * [提供向后的导航](ux/implement-nav/temporal.md)
      * [实现向下的导航](ux/implement-nav/descendant.md)
   * [通知提示用户](ux/notify-user/index.md)
      * [建立Notification](ux/notify-user/build-notification.md)
      * [当启动Activity时保留导航](ux/notify-user/nav.md)
      * [更新Notification](ux/notify-user/update-notification.md)
      * [使用BigView风格](ux/notify-user/expand-notification.md)
      * [显示Notification进度](ux/notify-user/progess-notification.md)
   * [增加搜索功能](ux/search/index.md)
      * [建立搜索界面](ux/search/setup.md)
      * [保存并搜索数据](ux/search/search.md)
      * [保留向后兼容](ux/search/back-compat.md)
   * [使得你的App内容可被Google搜索](ux/app-indexing/index.md)
      * [为App内容开启深度链接](ux/app-indexing/deep-linking.md)
      * [为索引指定App内容](ux/app-indexing/enable-app-indexing.md)
* [UI](ui/index.md)
   * [为多屏幕设计](ui/multiscreen/index.md)
      * [兼容不同的屏幕大小](ui/multiscreen/screen-sizes.md)
      * [兼容不同的屏幕密度](ui/multiscreen/screen-desities.md)
      * [实现可适应的UI](ui/multiscreen/adapt-ui.md)
   * [为TV进行设计](ui/tv/index.md)
      * [为TV优化Layout](ui/tv/optimize-layouts-tv.md)
      * [为TV优化导航](ui/tv/optimize-nav-tv.md)
      * [处理不支持TV的功能](ui/tv/unsupport-features-tv.md)
   * [创建自定义View](ui/custom-view/index.md)
      * [创建自定义的View类](ui/custom-view/create-view.md)
      * [实现自定义View的绘制](ui/custom-view/custom-draw.md)
      * [使得View可交互](ui/custom-view/make-interactive.md)
      * [优化自定义View](ui/custom-view/optimize-view.md)
   * [创建向后兼容的UI](ui/backward-compatible-ui/index.md)
      * [抽象新的APIs](ui/backward-compatible-ui/abstract.md)
      * [代理至新的APIs](ui/backward-compatible-ui/new-impl.md)
      * [使用旧的APIs实现新API的效果](ui/backward-compatible-ui/older-impl.md)
      * [使用版本敏感的组件](ui/backward-compatible-ui/using-component.md)
   * [实现辅助功能](ui/accessibility/index.md)
      * [开发辅助程序](ui/accessibility/accessible-app.md)
      * [开发辅助服务](ui/accessibility/accessible-service.md)
   * [管理系统UI](ui/system-ui/index.md)
      * [淡化系统Bar](ui/system-ui/dim.md)
      * [隐藏系统Bar](ui/system-ui/hide-ui.md)
      * [隐藏导航Bar](ui/system-ui/hide-nav.md)
      * [全屏沉浸式应用](ui/system-ui/immersive.md)
      * [响应UI可见性的变化](ui/system-ui/visibility.md)
* [用户输入](input/index.md)
   * [使用触摸手势](input/gestures/index.md)
      * [检测常用的手势](input/gestures/detector.md)
      * [跟踪手势移动](input/gestures/movement.md)
      * [Scroll手势动画](input/gestures/scroll.md)
      * [处理多触摸手势](input/gestures/multi.md)
      * [拖拽与缩放](input/gestures/scale.md)
      * [管理ViewGroup中的触摸事件](input/gestures/viewgroup.md)
   * [处理按键点击](input/keyboard-input/index.md)
      * [指定输入法类型](input/keyboard-input/type.md)
      * [处理输入法可见性](input/keyboard-input/visibility.md)
      * [兼容硬件导航](input/keyboard-input/navigation.md)
      * [处理输入命令](input/keyboard-input/commands.md)
   * [兼容游戏控制器](input/game-controller/index.md)
      * [处理控制器输入动作](input/game-controller/controller-inputs.md)
      * [支持不同的Android系统版本](input/game-controller/compatibility.md)
      * [支持多个控制器](input/game-controller/multi-controller.md)
* [后台任务](background-jobs/index.md)
   * [执行一个后台Service](background-jobs/run-background-service/index.md)
      * [创建后台Service](background-jobs/run-background-service/create-service.md)
      * [发送任务到后台Service](background-jobs/run-background-service/send-request.md)
      * [后台Service报告执行状态](background-jobs/run-background-service/report-status.md)
   * [在后台加载数据](background-jobs/load-data-background/index.md)
      * [使用CursorLoader执行查询任务](background-jobs/load-data-background/setup-loader.md)
      * [处理查询的结果](background-jobs/load-data-background/handle-result.md)    
   * [管理设备的唤醒状态](background-jobs/scheduling/index.md)
      * [保持设备的唤醒](background-jobs/scheduling/wake-lock.md)
      * [执行重复的闹钟任务](background-jobs/scheduling/alarms.md)
* [性能优化](performance/index.md)
   * [管理应用的内存](performance/memory.md)
   * [性能优化Tips](performance/performance-tips.md)
   * [提升Layout的性能](performance/improving-layouts/index.md)
      * [优化layout的层级](performance/improving-layouts/optimizing-layout.md)
      * [使用include标签重用layouts](performance/improving-layouts/reuse-layouts.md)
      * [按需加载视图](performance/improving-layouts/loading-ondemand.md)
      * [使得ListView滑动顺畅](performance/improving-layouts/smooth-scrolling.md)
   * [优化电池寿命](performance/monitor-device-state/index.md)
      * [监测电量与充电状态](performance/monitor-device-state/battery-monitor.md)
      * [判断与监测Docking状态](performance/monitor-device-state/docking-monitor.md)
      * [判断与监测网络连接状态](performance/monitor-device-state/connectivity-monitor.md)
      * [根据需要操作Broadcast接受者](performance/monitor-device-state/manifest-receivers.md)
   * [多线程操作](performance/multi-threads/index.md)
      * [指定一段代码执行在一个线程](performance/multi-threads/define-runnable.md)
      * [为多线程创建线程池](performance/multi-threads/create-threadpool.md)
      * [执行代码运行在线程池中](performance/multi-threads/run-code.md)
      * [与UI线程进行交互](performance/multi-threads/communicate-ui.md)
   * [避免ANR](performance/perf-anr/index.md)
   * [JNI Tips](performance/perf-jni/index.md)
   * [SMP for Android](performance/smp/index.md)
* [安全与隐私](security/index.md)
   * [Security Tips](security/security-tips.md)
   * [使用HTTPS与SSL](security/security-ssl.md)
   * [企业版App](security/enterprise.md)
* [测试程序](testing/index.md)
   * [测试你的Activity](testing/activity-testing/index.md)
      * [建立测试环境](testing/activity-testing/prepare-activity-testing.md)
      * [创建与执行测试用例](testing/activity-testing/activity-basic-testing.md)
      * [测试UI组件](testing/activity-testing/activity-ui-testing.md)
      * [创建单元测试](testing/activity-testing/activity-unit-testing.md)
      * [创建功能测试](testing/activity-testing/activity-function-testing.md)
* [分发与盈利](distribute/index.md)
   * [售卖App内置产品](distribute/in-app-billing/index.md)
      * [准备你的App](distribute/in-app-billing/prepare-iab-app.md)
      * [建立售卖的产品](distribute/in-app-billing/list-iab-products.md)
      * [购买产品](distribute/in-app-billing/purchase-iab-products.md)
      * [测试你的App](distribute/in-app-billing/test-iab-app.md)
   * [维护多个APK](distribute/multi-apks/index.md)
      * [为不同API Level创建多个APK](distribute/multi-apks/api.md)
      * [为不同屏幕大小创建多个APK](distribute/multi-apks/screen-size.md)
      * [为不同的GL Texture创建多个APK](distribute/multi-apks/texture.md)
      * [为2种以上的维度创建多个APK](distribute/multi-apks/multiple.md)
   * [App盈利](distribute/monetization/index.md)
      * [在不影响用户体验的前提下添加广告](distribute/monetization/ads-and-ux.md)
      

## 认领流程
先申请加入Android Training翻译组或者私信邮件给我(联系方式见Github主页)，和我说明认领的章节与你的Github账户名，我会及时更新认领进度到项目主页。

## 贡献流程

* 存放路径：所有的源文件放在项目根目录的`SOURCE`目录下，按照上面的目录结构，找到对应的md文件(可以通过打开`SOURCE`目录下的`SUMMARY.md`文件查看章节对应的路径与文件名)
* 编写要求：使用[markdown](http://jianshu.io/p/q81RER)的格式进行编写

### 会Git操作的请参考下面的流程(推荐)：

* 1)fork我的项目到自己的账户下

`https://github.com/kesenhoo/android-training-course-in-chinese`

* 2)把fork之后的项目clone到本地

`git clone https://github.com/{user_name}/android-training-course-in-chinese`

* 3)创建一个新的分支并切换到该分支下

`git branch dev`

`git checkout dev`

* 4)为本地的工作分支添加将合并的远程仓库

`git remote add uploadrepo https://github.com/kesenhoo/android-training-course-in-chinese.git`

* 5)抓取远程合并仓库的更新，再与本地进行Merge

`git remote update`

`git fetch uploadrepo gh-pages`

`git rebase uploadrepo/gh-pages`

前面1-5的是首次初始化的步骤，想要再次获取远程仓库uploadrepo的更新，需要再次执行步骤5)。

后续本地的所有修改都在dev分支进行，编写好的文档，commit到本地之后，先PUSH到自己的远程仓库，然后登入Github账户，，找到Fork的Repo，在右边的Pull Request里面进行拉取合并的请求，提交之后，我会进行处理再合并到主干。

此流程参考自<https://github.com/numbbbbb/the-swift-programming-language-in-chinese>

### 不会Git的同学操作流程
认领之后，找到目录文件，打开编写。之后把文件直接传递给我，我来进行提交提交！


## 校验流程
翻译完毕之后，难免有些地方不流畅，欢迎愿意一起学习的同学加入帮忙校验，提升这份文档的质量，谢谢！

申请加入翻译组，对翻译完成的文章进行校验梳理，我会及时更新状态到项目主页。

## MarkDown简明语法

<http://jianshu.io/p/q81RER>

Ps:
* [点击链接跳到首页的待认领列表](index.html#courses)。
`[点击链接跳到首页](index.html#course)`
* [点击链接跳到本页面的在线阅读模块](#online_reading)
`[点击链接跳到页面内部](#online_reading)`
* 插入图片(请把图片统一放到images/articles目录下)
` ![basic-lifecycle-paused](/images/articles/basic-lifecycle-paused.png)`

有不清楚的地方请直接查看现成的源码示例。
