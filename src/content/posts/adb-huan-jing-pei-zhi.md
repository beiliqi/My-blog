---
title: "adb环境配置"
description: ""
date: 2025-06-19
updated: 2025-12-23
tags: []
draft: false
---
## 安装教程

-参考链接[https://blog.csdn.net/Python_0011/article/details/132040387](https://blog.csdn.net/Python_0011/article/details/132040387)

## adb 常用命令

```python
# 参考链接 https://cloud.tencent.com/developer/article/2342099

# 查看当前连接的设备列表
adb devices

# 安装一个应用程序
adb install [apk文件路径]

# 卸载一个应用程序
adb uninstall [包名]

# 进入shell模式
adb shell

# 查看系统的架构
getprop ro.product.cpu.abi

# 从设备上复制文件到本地计算机
adb pull [设备文件路径] [本地文件路径]

# 将本地文件复制到设备上
adb push [本地文件路径] [设备文件路径]
```
