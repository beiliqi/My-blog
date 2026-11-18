---
title: "java-修复fcntl异常"
description: ""
date: 2025-06-24
updated: 2025-07-15
tags: [java, 排错, idea]
category: 编程与工程
draft: false
---
![](./assets/java-xiu-fu-fcntl-yi-chang/img-01.png)

## 1、安装插件，并重启 IDEA

![](./assets/java-xiu-fu-fcntl-yi-chang/img-02.png)<br>![](./assets/java-xiu-fu-fcntl-yi-chang/img-03.png)

## 2、点击异常，直接到达异常点![](./assets/java-xiu-fu-fcntl-yi-chang/img-04.png)

## 3、修改 jar 包，增加 case 5 判断逻辑

![](./assets/java-xiu-fu-fcntl-yi-chang/img-05.png)
