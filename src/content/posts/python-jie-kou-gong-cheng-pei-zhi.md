---
title: "python接口工程配置"
description: ""
date: 2025-06-29
updated: 2026-02-11
tags: []
draft: false
---
## 1、表结构

保存用户登录后的基本信息

```sql
CREATE TABLE user_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL COMMENT '用户唯一ID',
  name VARCHAR(100) COMMENT '用户',
  mobile_no VARCHAR(20) COMMENT '手机号码',
  user_name VARCHAR(100) COMMENT '用户名/昵称',
  tk VARCHAR(255) COMMENT 'TK令牌',
  bbid VARCHAR(255) COMMENT 'BBID标识',
  device_no VARCHAR(255) COMMENT '设备号',
  biz_id VARCHAR(255) DEFAULT '' COMMENT '业务ID',
  zim_id VARCHAR(255) DEFAULT '' COMMENT 'ZIM ID',
  certify_id VARCHAR(255) DEFAULT '' COMMENT '认证ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
```

## 2、业务功能逻辑

```python
# python版本
python3.10

# node npm 版本 可调整版本，主要功能是加密密码
npm -v # 6.14.11
node -v # v14.16.0

# 创建虚拟环境
python3.10 -m venv env-py310

# 进入虚拟环境
source env-py310/bin/activate

# 安装依赖
pip install -r requirements.txt 

# 启动程序
sh start.sh

# 关闭程序
sh stop.sh
```
