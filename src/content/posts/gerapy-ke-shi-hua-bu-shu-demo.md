---
title: "gerapy可视化部署-demo"
description: ""
date: 2024-12-03
updated: 2026-04-28
tags: []
draft: true
---
**Gerapy** 是一个基于 Scrapy 的分布式爬虫框架，旨在为大规模爬虫任务提供更高效的管理和调度功能。它支持分布式任务调度、集中式配置管理、爬虫任务监控和日志管理等功能，非常适合用于多节点分布式环境下的大规模数据抓取。

**scrapy + scrapyd + gerapy**

- **scrapy**
- **scrapy-redis**
- **scrapyd**
- **gerapy**
- **kafka-python**

**scrapyd**

**修改项目配置**

**找到项目配置文件scrapy.cfg：**

```python
[deploy]
#url = http://localhost:6800/
project = Ldoscrapyproducts
```

**修改为如下：**

```python
[deploy:test]
url = http://localhost:6800/ # 服务器地址
project = Ldoscrapyproducts
```

配置 scrapyd

为了让 Scrapyd 能够识别和管理我们的爬虫项目，需要在项目根目录创建一个名为scrapyd.conf的配置文件，如下所示：

```python
[scrapyd]
# 项目的 eggs 存储位置
eggs_dir    = eggs
# Scrapy日志的存储目录。如果要禁用存储日志，请将此选项设置为空，如下
# logs_dir = 
logs_dir    = logs
# Scrapyitem将被存储的目录，默认情况下禁用此选项，如果设置了 值，会覆盖 scrapy的 FEED_URI 配置项
items_dir   =
# 每个蜘蛛保持完成的工作数量。默认为5
jobs_to_keep = 5
# 项目数据库存储的目录
dbs_dir     = dbs
# 并发scrapy进程的最大数量，默认为0，没有设置或者设置为0时，将使用系统中可用的cpus数乘以max_proc_per_cpu配置的值
max_proc    = 0
# 每个CPU启动的进程数，默认4
max_proc_per_cpu = 4
# 保留在启动器中的完成进程的数量。默认为100
finished_to_keep = 100
# 用于轮询队列的时间间隔，以秒为单位。默认为5.0
poll_interval = 5.0
# webservices监听地址
bind_address = 0.0.0.0
# 默认 http 监听端口
http_port   = 8080
# 是否调试模式
debug       = off
# 将用于启动子流程的模块，可以使用自己的模块自定义从Scrapyd启动的Scrapy进程
runner      = scrapyd.runner
application = scrapyd.app.application
launcher    = scrapyd.launcher.Launcher
webroot     = scrapyd.website.Root

[services]
schedule.json     = scrapyd.webservice.Schedule
cancel.json       = scrapyd.webservice.Cancel
addversion.json   = scrapyd.webservice.AddVersion
listprojects.json = scrapyd.webservice.ListProjects
listversions.json = scrapyd.webservice.ListVersions
listspiders.json  = scrapyd.webservice.ListSpiders
delproject.json   = scrapyd.webservice.DeleteProject
delversion.json   = scrapyd.webservice.DeleteVersion
listjobs.json     = scrapyd.webservice.ListJobs
daemonstatus.json = scrapyd.webservice.DaemonStatus
```

启动 scrapyd

```python
# 启动scrapyd
scrapyd
# 后台启动
nohup scrapyd > /dev/null 2>&1 &
```

更改 scrapyd 启动时的端口号和绑定 IP

```python
pip show scrapyd

Name: scrapyd
Version: 1.5.0
Summary: A service for running Scrapy spiders, with an HTTP API
Home-page: https://github.com/scrapy/scrapyd
Author: Scrapy developers
Author-email: info@scrapy.org
License: BSD
Location: /opt/app/pyprocess/env-Python3.8/lib/python3.8/site-packages
Requires: packaging, scrapy, setuptools, twisted, w3lib, zope.interface
Required-by:

进入路径
cd /opt/app/pyprocess/env-Python3.8/lib/python3.8/site-packages/scrapyd

vim default_scrapyd.conf

修改绑定IP和端口
[scrapyd]
# Application options
application       = scrapyd.app.application
bind_address      = 0.0.0.0
http_port         = 8080
unix_socket_path  =
username          =
password          =
spiderqueue       = scrapyd.spiderqueue.SqliteSpiderQueue
```

gerapy

gerapy 启动配置

```python
# 新建一个项目
gerapy init
# 对数据库进行初始化(在gerapy目录中操作)，先切换到gerapy目录下，执行如下命令
gerapy migrate
# 此时登录gerapy平台需要账号密码登录，这还需要如下设置
gerapy createsuperuser
# 启动 gerapy服务
gerapy runserver
gerapy runserver 0.0.0.0:443
```

```python
# 解决方法 https://zhuanlan.zhihu.com/p/497831108
# https://www.sqlite.org/download.html
# https://www.sqlite.org/2024/sqlite-autoconf-3470100.tar.gz

Traceback (most recent call last):
  File "/root/app/pyprocess/env-python3.8/bin/gerapy", line 8, in <module>
    sys.exit(cmd())
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/gerapy/cmd/__init__.py", line 171, in cmd
    manage()
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/gerapy/server/manage.py", line 24, in manage
    execute_from_command_line(sys.argv)
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/core/management/__init__.py", line 381, in execute_from_command_line
    utility.execute()
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/core/management/__init__.py", line 357, in execute
    django.setup()
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/__init__.py", line 24, in setup
    apps.populate(settings.INSTALLED_APPS)
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/apps/registry.py", line 114, in populate
    app_config.import_models()
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/apps/config.py", line 211, in import_models
    self.models_module = import_module(models_module_name)
  File "/usr/local/lib/python3.8/importlib/__init__.py", line 127, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
  File "<frozen importlib._bootstrap>", line 1014, in _gcd_import
  File "<frozen importlib._bootstrap>", line 991, in _find_and_load
  File "<frozen importlib._bootstrap>", line 975, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 671, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 848, in exec_module
  File "<frozen importlib._bootstrap>", line 219, in _call_with_frames_removed
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/contrib/auth/models.py", line 2, in <module>
    from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/contrib/auth/base_user.py", line 47, in <module>
    class AbstractBaseUser(models.Model):
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/models/base.py", line 117, in __new__
    new_class.add_to_class('_meta', Options(meta, app_label))
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/models/base.py", line 321, in add_to_class
    value.contribute_to_class(cls, name)
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/models/options.py", line 204, in contribute_to_class
    self.db_table = truncate_name(self.db_table, connection.ops.max_name_length())
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/__init__.py", line 28, in __getattr__
    return getattr(connections[DEFAULT_DB_ALIAS], item)
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/utils.py", line 201, in __getitem__
    backend = load_backend(db['ENGINE'])
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/utils.py", line 110, in load_backend
    return import_module('%s.base' % backend_name)
  File "/usr/local/lib/python3.8/importlib/__init__.py", line 127, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/backends/sqlite3/base.py", line 66, in <module>
    check_sqlite_version()
  File "/root/app/pyprocess/env-python3.8/lib/python3.8/site-packages/django/db/backends/sqlite3/base.py", line 63, in check_sqlite_version
    raise ImproperlyConfigured('SQLite 3.8.3 or later is required (found %s).' % Database.sqlite_version)
django.core.exceptions.ImproperlyConfigured: SQLite 3.8.3 or later is required (found 3.7.17).
```

```python
#下载sqlite3
wget https://www.sqlite.org/2024/sqlite-autoconf-3470100.tar.gz

#解压并安装sqlite3
$ tar -zxvf sqlite-autoconf-3270200.tar.gz
$ cd sqlite-autoconf-3270200
$ ./configure --prefix=/usr/local
$ make && make install

#设置软链接
$ mv /usr/bin/sqlite3  /usr/bin/sqlite3_old
$ ln -s /usr/local/bin/sqlite3   /usr/bin/sqlite3

#修改.bashrc文件
vim ~/.bashrc
#在用户目录下.bashrc文件最后一行添加
export LD_LIBRARY_PATH="/usr/local/lib"

#并在终端输入立即生效命令
source ~/.bashrc
```

定时清理日志

```python
#!/bin/bash

# 查找并清空日志
find /root/app/pyprocess/gerapy/projects/Ldoscrapyproducts/logs/Ldoscrapyproducts -type f -name "*.log" -exec truncate -s 0 {} \;
```

crontab 配置定时任务

```python
crontab -e 

*/10 * * * * /opt/app/pyprocess/gerapy/projects/Ldoscrapyproducts/clear_logs.sh

chmod 777 clear_log.sh
```

后台启动 gerapy

```python
#!/bin/bash

nohup gerapy runserver 0.0.0.0:443 > /dev/null 2>&1 &
```
