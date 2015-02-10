# 创建TV应用的第一步

> 编写:[awong1900](https://github.com/awong1900) - 原文:<http://developer.android.com/training/tv/start/start.html>

TV apps use the same structure as those for phones and tablets. This similarity means you can modify your existing apps to also run on TV devices or create new apps based on what you already know about building apps for Android.

>**Important**: There are specific requirements your app must meet to qualify as an Android TV app on Google Play. For more information, see the requirements listed in [TV App Quality](http://developer.android.com/distribute/essentials/quality/tv.html).

This lesson describes how to prepare your development environment for building TV apps, and the minimum required changes to enable an app to run on TV devices.

## Set up a TV Project

This section discusses how to modify an existing app to run on TV devices, or create a new one. These are the main components you must use to create an app that runs on TV devices:

* Activity for TV (Required) - In your application manifest, declare an activity that is intended to run on TV devices.
* TV Support Libraries (Optional) - There are several Support Libraries available for TV devices that provide widgets for building user interfaces.

### Prerequisites

Before you begin building apps for TV, you must:
*
*
*

### Declare a TV Activity

