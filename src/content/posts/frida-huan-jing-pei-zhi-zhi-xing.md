---
title: "frida环境配置-执行"
description: ""
date: 2025-06-12
updated: 2025-07-23
tags: []
draft: false
---
## 需要安装 frida 环境后执行

⚠️注意 手机端安装的 frida 版本和电脑端版本保持一致

[https://blog.csdn.net/qq_41179280/article/details/112467196](https://blog.csdn.net/qq_41179280/article/details/112467196)

[https://github.com/frida/frida/releases](https://github.com/frida/frida/releases) 下载地址

## frida 常用命令

```python
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

## 1、启用 frida

```python
adb shell

su -c /data/local/tmp/frida-server-16.5.6-android-arm64
```

## 2、另起一个终端窗口，进行端口转发

```python
adb forward tcp:27042 tcp:27042
```

## 3、在 python 环境中执行 hook 脚本

```python
frida -U -f com.MobileTicket -l /Users/beiliqi/Documents/JS/12306.js
```
