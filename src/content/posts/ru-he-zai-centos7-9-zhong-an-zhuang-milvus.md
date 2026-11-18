---
title: "如何在CentOS7.9中安装milvus"
description: ""
date: 2025-03-18
tags: [milvus, docker, centos]
category: 服务器与部署
draft: false
---
一、安装 milvus<br>1、使用Docker Compose安装Milvus Standalone

1.1下载YAML文件

wget https://github.com/milvus-io/milvus/releases/download/v2.2.11/milvus-standalone-docker-compose.yml -O docker-compose.yml

1.2开始Milvus

docker-compose up -d

##### 2.1.docker-compose: command not found 解决办法

运行 docker-compose up -d 命令的时候出现命令没找到的报错

```javascript
# docker-compose up -d
-bash: docker-compose: command not found
```

**解决办法：**

1. 安装 pip

```javascript
# yum -y install epel-release
# yum -y install python-pip
```

1. 升级 pip

```javascript
# pip install --upgrade pip
```

1. 安装 docker-compose 插件

```javascript
# pip install docker-compose
```

1. 验证是否安装成功

```javascript
# docker-compose -version
docker-compose version 1.29.2, build unknown
```

继续执行docker-compose up -d

二、运行

cd /root/milvus

docker-compose down -v

docker-compose up -d

docker-compose ps

docker ps

三、执行 attu，需要在阿里云中开放 19530 端口

docker run -d -p 8000:3000 -e MILVUS_URL=203.0.113.10:19530 zilliz/attu:v2.2.8

参考链接[https://cloud.tencent.com/developer/article/2338320](https://cloud.tencent.com/developer/article/2338320)
