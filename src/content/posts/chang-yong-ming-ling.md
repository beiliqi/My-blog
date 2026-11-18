---
title: "常用命令"
description: ""
date: 2024-11-15
updated: 2025-07-08
tags: [命令, 速查, linux]
category: 环境与工具
draft: false
---
# 目录

一、[java](https://www.yuque.com/beiliqi/hspoqe/fdlvz944qt3haloc#OAwnX)

二、[adb](https://www.yuque.com/beiliqi/hspoqe/fdlvz944qt3haloc#mccEe)

三、[Linux](https://www.yuque.com/beiliqi/hspoqe/fdlvz944qt3haloc#v6HGG)

四、[redis](https://www.yuque.com/beiliqi/hspoqe/fdlvz944qt3haloc#qhOHZ)

五、[git](https://www.yuque.com/beiliqi/hspoqe/fdlvz944qt3haloc#ED0oo)

六、[scrapy](https://www.yuque.com/beiliqi/hspoqe/fdlvz944qt3haloc#AkAGD)

# java

```python
# byte 数组转字符串，将数组元素以,分隔并输出在方括号内
import java.util.Arrays;
Arrays.toString(byteArray)

# 新建一个字节数组
byte[] byteArray = {10, 20, 30, 40, 50};
```

# adb

```python
adb shell

# 查看系统的架构
getprop ro.product.cpu.abi

# 查看当前处于前台的Activity
adb shell dumpsys activity top

# 查看包信息，包括四大组件信息以及MIME等相关信息。
adb shell dumpsys package <package-name>

# “用于查看App使用的数据库信息，包括执行操作的查询语句等信息都会被打印出来。
adb shell dbinfo <package-name>

# 用于执行截图操作，并保存到<path>目录下。
adb shell screencap -p <path>

# 用于在屏幕选中的输入框内输入文字，可惜不能直接输入中文。
adb shell input text <text>

# pm命令是Android中packageManager的命令行，是用于管理package的命令，比如通过pm list packages命令可以列出所有安装的APK包名。
adb shell pm命令
adb shell pm list packages

# am命令是一个重要的调试工具，主要用于启动或停止服务、发送广播、启动Activity等。在逆向过程中，往往在需要以Debug模式启动App时会使用这个命令。
adb shell am命令
```

# Linux

```python
# 防火墙命令
# centos 安装防火墙
yum install firewalld

# 检查防火墙状态
systemctl status firewalld

# 启动 firewalld 防火墙
systemctl start firewalld

# 设置 firewalld 防火墙开机自启
systemctl enable firewalld

# 允许指定端口（443）
firewall-cmd --zone=public --add-port=443/tcp --permanent

# 重新加载防火墙规则
firewall-cmd --reload

# 查看当前开放的端口
firewall-cmd --zone=public --list-ports

# 移除已开放的端口
firewall-cmd --zone=public --remove-port=443/tcp --permanent
firewall-cmd --reload

# 查看端口占用情况
ss -tuln | grep 端口号
```

# redis

```python
# 启动 Redis 服务
systemctl start redis
# 查看 Redis 服务的状态
systemctl status redis
# 设置 Redis 服务开机自启
systemctl enable redis
# 刷新 Redis 服务的配置
systemctl daemon-reload
# 启动 Redis 命令行客户端
redis-cli
# 向 Redis 的集合中添加一个代理地址
SADD "proxy_pool" "203.0.113.30:20046"
# 在 Redis 中进行身份验证
auth 123456
# 获取 Redis 数据库中的所有键
keys *
# 查看指定键的数据类型
type key
# 获取 Redis 中指定集合的所有成员
smembers key
# 获取 Redis 中指定集合的成员数量
scard key
# 获取 Redis 中指定有序集合的成员数量
zcard key
# 远程连接Redis
redis-cli -h 192.168.1.100 -p 6379
```

# git

```python
# 清除代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

# scrapy

```python
custom_settings = {
    'DOWNLOAD_DELAY': 0.5,  # 0.5 秒的下载延迟
    'CONCURRENT_REQUESTS': 1,  # 每次只允许一个请求
    'DUPEFILTER_CLASS': 'scrapy_redis.dupefilter.RFPDupeFilter',  # 使用 redis 的去重功能
    'SCHEDULER': 'scrapy_redis.scheduler.Scheduler',  # 使用 redis 的调度器
    'SCHEDULER_PERSIST': True,  # 确保爬虫停止后任务保存在 Redis 中
}
```
