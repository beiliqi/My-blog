---
title: "java-修复文件路径异常"
description: ""
date: 2025-06-25
updated: 2025-07-15
tags: [java, 排错]
category: 编程与工程
draft: false
---
问题：在 Windows 中出现文件路径拼接异常

![](./assets/java-xiu-fu-wen-jian-lu-jing-yi-chang/img-01.png)

## 1、点击错误信息，进入打开文件的代码 ![](./assets/java-xiu-fu-wen-jian-lu-jing-yi-chang/img-02.png)

## 2、定位问题原因为，在打开文件的时间对两个地址进行拼接导致![](./assets/java-xiu-fu-wen-jian-lu-jing-yi-chang/img-03.png)

## 3、修复问题，去除 this.rootDir

![](./assets/java-xiu-fu-wen-jian-lu-jing-yi-chang/img-04.png)
