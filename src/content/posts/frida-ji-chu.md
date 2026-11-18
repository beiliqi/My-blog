---
title: "frida基础"
description: ""
date: 2024-11-21
updated: 2025-06-26
tags: [frida, hook, 逆向]
category: 抓包与逆向
draft: false
---
模式：cli模式，RPC模式

启动方式 spawn(frida -f) attach(frida)

ptrace

由于Hook方案是一种在函数真实运行前对函数执行流程进行动态

二进制插桩的方式，因此其 时机非常重要：一定要在函数执行前对函

数进行Hook，否则如果在Hook之前函数已经执行结束并且不再执行

```javascript
# 进入安卓设备的命令行环境
adb shell

# 使用超级用户权限运行 Frida Server
# 这里指定 Frida Server 的路径为 /data/local/tmp/，版本为 16.5.6，适用于 arm64 架构设备
su -c /data/local/tmp/frida-server-16.5.6-android-arm64

# 将本地电脑的 TCP 端口 27042 转发到安卓设备的 TCP 端口 27042
# 这一步用于建立调试连接
adb forward tcp:27042 tcp:27042

# 列出所有设备上正在运行的进程（未指定设备）
frida-ps

# 列出当前 USB 设备上正在运行的进程
# -U 表示指定连接的 USB 设备
frida-ps -U

# 列出当前 USB 设备上的应用进程
# -Ua 表示列出所有应用程序的进程
frida-ps -Ua

# 列出当前 USB 设备上所有进程及其详细信息
# -Uai 表示同时显示所有应用程序进程和进程详细信息
frida-ps -Uai

# 启动目标应用并附加 Frida 脚本
# -U 表示连接 USB 设备
# -f 表示启动目标应用（包名为 com.example.myapplication）
# -l 表示加载指定的脚本路径（hello.js 文件）
frida -U -f com.example.myapplication -l /Users/beiliqi/Documents/git/UmeSpiderAPK12306/androidTest/hello.js
```

```python
调用setTimeout()方法是因为该方法将函数注册到JavaScript运行库中，
然后在JavaScript运行库中调用Java.perform()方法将函数注册到App的Java运行库中并在其中执行该函数

setImmediate（Frida的API函数）函数传递的参数是要被执行的函数，
比如传入main参数，表示当Frida注入App后立即执行main()函数。
这个函数和setTimeout()函数类似，都是用于指定要执行的函数，
不同的是setTimeout可以用于指定Frida注入App多长时间后执行函数，
往往用于延时注入。如果传递的第二个参数为0或者压根没有第二个参数，
就和setImmediate()函数的作用一样
```
