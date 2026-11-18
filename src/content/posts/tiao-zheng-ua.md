---
title: "调整ua"
description: ""
date: 2025-09-02
updated: 2026-03-02
tags: [反爬, ua]
category: 抓包与逆向
draft: false
---
调整背景：优化 43003 问题

# 1、在数据表中新增 ua 字段

```json
ALTER TABLE user_info ADD COLUMN ua VARCHAR(200) not null DEFAULT '' COMMENT 'user-agent' AFTER device_no;
```

# 2、在代码中增加 ua 字段

## 调整逻辑：

1、在登录是随机获取 ua 用于登录，并将登录成功后的账号和 ua 一同存入数据表

2、在调用其他接口时，根据账号信息将数据表中的 ua 取出，进行数据请求
