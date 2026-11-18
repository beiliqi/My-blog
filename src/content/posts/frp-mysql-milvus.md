---
title: "frp-mysql-milvus"
description: ""
date: 2025-03-21
updated: 2025-03-22
tags: []
draft: true
---
公网机器 203.0.113.10

frp-path G:\Download\frp_0.61.2_windows_amd64

mysql D:\Environment\mysql-8.0.41-winx64

milvus G:\Download\milvus

frpc 启动命令

cd G:\Download\frp_0.61.2_windows_amd64<br>.\frpc.exe -c .\frpc.toml

mysql 启动命令

net stop mysql

net start mysql

milvus 启动命令

在 docker 中启动

mysql 运行远程连接-配置防火墙，地址[https://blog.csdn.net/qq_39939748/article/details/146235987](https://blog.csdn.net/qq_39939748/article/details/146235987)

包括-

1、 配置防火墙规则

2、 修改D:\Environment\mysql-8.0.41-winx64\my.ini 文件，增加bind-address=0.0.0.0

3、启动 mysql net stop mysql net start mysql

4、MySQL 授权 先创建用户，再授予权限

CREATE USER 'root'@'%' IDENTIFIED BY 'your_password';

GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';

FLUSH PRIVILEGES;

安装 navicat [https://blog.csdn.net/2402_85610348/article/details/140192000](https://blog.csdn.net/2402_85610348/article/details/140192000)

安装 docker 向量数据库 attu milvus [https://blog.csdn.net/m0_54345753/article/details/136738293](https://blog.csdn.net/m0_54345753/article/details/136738293)
