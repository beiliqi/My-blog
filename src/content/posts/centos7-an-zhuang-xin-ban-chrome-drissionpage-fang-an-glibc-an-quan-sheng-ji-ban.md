---
title: "🧭 CentOS7 安装新版 Chrome + DrissionPage 方案（GLIBC 安全升级版）"
description: ""
date: 2025-11-03
tags: [centos, chrome, glibc, drissionpage]
category: 服务器与部署
draft: false
---
---

## 一、方案背景

CentOS7 自带的 glibc 版本是 **2.17**，<br>但新版 Chrome 需要 **glibc ≥ 2.18** 才能启动。

⚠️ 直接替换系统 glibc 风险极高，可能导致系统崩溃。<br>✅ 推荐做法是：**自编译 glibc 并通过**`LD_LIBRARY_PATH`**让 Chrome 仅使用新库。**

---

## 二、方案总览

| 模块 | 版本 | 安装路径 | 说明 |
| --- | --- | --- | --- |
| glibc | 2.28 | `/opt/glibc-2.28` | 独立新版库，不影响系统 |
| Google Chrome | 最新稳定版 | `/opt/google/opt/google/chrome` | 解包安装 |
| DrissionPage | 最新版 | Python 模块 | 控制浏览器 |
| Python | 3.8+ | `/usr/local/bin/python3` | 运行脚本 |

---

## 三、安装步骤

### 1️⃣ 安装基础依赖环境

```bash
yum groupinstall -y "Development Tools"
yum install -y wget
```

---

### 2️⃣ 安装 Chrome 图形依赖（必需）

Chrome 即使在无头模式下，也需要这些库才能运行：

```bash
yum install -y \
    libX11 \
    GConf2 \
    libXcursor \
    libXdamage \
    libXrandr \
    libXcomposite \
    libXi \
    libXtst \
    cups-libs \
    libXScrnSaver \
    alsa-lib \
    atk \
    at-spi2-atk \
    gtk3
```

---

### 3️⃣ 编译并安装 glibc 2.28

```bash
cd /usr/local/src
wget http://ftp.gnu.org/gnu/libc/glibc-2.28.tar.gz
tar -xzf glibc-2.28.tar.gz
cd glibc-2.28
mkdir build && cd build
../configure --prefix=/opt/glibc-2.28
make -j$(nproc)
make install
```

安装完成后检查：

```bash
ls /opt/glibc-2.28/lib/libc.so.6
```

---

### 4️⃣ 下载并手动解包 Chrome（不要直接 yum 安装）

```bash
cd /usr/local/src
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

mkdir -p /opt/google
cd /opt/google
rpm2cpio /usr/local/src/google-chrome-stable_current_x86_64.rpm | cpio -idmv
```

Chrome 主程序路径：

```plain
/opt/google/opt/google/chrome/google-chrome
```

验证是否能运行：

```bash
LD_LIBRARY_PATH=/opt/glibc-2.28/lib /opt/google/opt/google/chrome/google-chrome --version
```

---

### 5️⃣ 安装 Python 库 DrissionPage

```bash
pip install -U DrissionPage
```

---

## 四、运行示例（DrissionPage 代码）

```python
import os
import sys
from DrissionPage import ChromiumOptions, Chromium

# 指定新版 glibc 路径
os.environ['LD_LIBRARY_PATH'] = '/opt/glibc-2.28/lib'

# Chrome 主程序路径
chrome_path = '/opt/google/opt/google/chrome/google-chrome'

co = ChromiumOptions()
co.set_browser_path(chrome_path)

# Linux 环境优化参数
if sys.platform.startswith('linux'):
    co.headless(True)
    co.set_argument("--headless=new")
    co.set_argument("--no-sandbox")
    co.set_argument("--disable-dev-shm-usage")
    co.set_argument("--disable-gpu")
    co.set_argument("--disable-software-rasterizer")
    co.set_argument("--window-size=1280,720")
else:
    co.headless(False)

browser = Chromium(co)
tab = browser.latest_tab
tab.cookies.clear()
tab.get('https://webcheck.cc/')
print(tab.title)
browser.quit()
```

---

## 五、可选优化（创建快捷命令）

```bash
echo '#!/bin/bash
LD_LIBRARY_PATH=/opt/glibc-2.28/lib /opt/google/opt/google/chrome/google-chrome --no-sandbox "$@"' > /usr/local/bin/chrome-glibc228
chmod +x /usr/local/bin/chrome-glibc228
```

验证：

```bash
chrome-glibc228 --version
```

---

## 六、验证检查

| 项目 | 检查命令 | 预期结果 |
| --- | --- | --- |
| 新 glibc 是否安装 | `ls /opt/glibc-2.28/lib/libc.so.6` | 文件存在 |
| Chrome 是否能运行 | `LD_LIBRARY_PATH=/opt/glibc-2.28/lib /opt/google/opt/google/chrome/google-chrome --version` | 输出版本号 |
| DrissionPage 是否可用 | 运行上面 Python 脚本 | 输出网页标题 |

---

## 七、常见错误与解决

| 错误提示 | 原因 | 解决方案 |
| --- | --- | --- |
| `GLIBC_2.18 not found` | 环境变量未生效 | 确保在导入 DrissionPage 前设置 `LD_LIBRARY_PATH` |
| `cannot open shared object file: libX11.so.6` | 缺少 GUI 依赖 | 重新执行第 2 步依赖安装 |
| `DevToolsActivePort file doesn't exist` | Chrome 无法启动 | 加 `--no-sandbox`、`--disable-dev-shm-usage` |
| `FileNotFoundError: Cannot find Chrome executable` | Chrome 路径错误 | 用 `co.set_browser_path()` 指定 |
| 页面渲染异常 | GPU 加速兼容问题 | 加 `--disable-gpu`、`--disable-software-rasterizer` |

---

## ✅ 最终结果

| 功能 | 状态 |
| --- | --- |
| 系统 glibc 保持 2.17（不破坏系统） | ✅ |
| Chrome 可运行（加载新版 glibc） | ✅ |
| DrissionPage 可正常控制 Chrome | ✅ |
| 支持无头模式 | ✅ |
| 可随时删除 `/opt/glibc-2.28` 恢复原状 | ✅ |

---
