---
title: "CentOS 7.9 上 Python 3.10.13 缺失 _ssl 模块问题"
description: ""
date: 2025-03-14
updated: 2025-08-21
tags: []
draft: false
---
以下是针对 **CentOS 7.9 上 Python 3.10.13 缺失**`_ssl`**模块问题**的完整解决步骤总结：

---

### 最终解决方案步骤

#### 1. 安装 OpenSSL 1.1.1w

```bash
# 下载并解压
wget https://www.openssl.org/source/openssl-1.1.1w.tar.gz
tar xzf openssl-1.1.1w.tar.gz
cd openssl-1.1.1w

# 配置、编译、安装
./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl
make -j$(nproc)
sudo make install

# 配置系统库路径
echo '/usr/local/openssl/lib' | sudo tee /etc/ld.so.conf.d/openssl-1.1.1w.conf
sudo ldconfig
```

#### 2. 安装 GCC 及开发工具链

```bash
sudo yum install gcc make glibc-devel kernel-devel perl -y
```

#### 3. 重新编译 Python 3.10.13

```bash
# 进入 Python 源码目录
cd Python-3.10.13

# 彻底清理旧编译文件
make distclean

# 配置编译参数（关键！）
export LDFLAGS="-L/usr/local/openssl/lib"
export CPPFLAGS="-I/usr/local/openssl/include"
./configure \
  --enable-optimizations \
  --with-openssl=/usr/local/openssl \
  --with-ssl-default-suites=openssl

# 编译并安装
make -j$(nproc)
sudo make altinstall
```

#### 4. 验证修复结果

```bash
# 检查 OpenSSL 版本
/usr/local/openssl/bin/openssl version  # 应输出 OpenSSL 1.1.1w

# 检查 Python 的 SSL 模块
python3.10 -c "import ssl; print(ssl.OPENSSL_VERSION)"  # 应输出 OpenSSL 1.1.1w
```

---

### 关键注意事项

1. **路径一致性** ：

1. **彻底清理** ：

1. **依赖项验证** ：

```bash
# 检查 Python 是否链接到正确的 OpenSSL 库
ldd $(which python3.10) | grep ssl
# 应输出：libssl.so.1.1 => /usr/local/openssl/lib/libssl.so.1.1
```

---

### 常见问题排查

| **现象** | **原因** | **解决** |
| --- | --- | --- |
| `openssl/ssl.h not found` | 头文件路径未正确传递 | 检查 `CPPFLAGS` 是否包含 `-I/usr/local/openssl/include` |
| `libssl.so.1.1: cannot open shared object` | 动态库路径未配置 | 运行 `sudo ldconfig` 并检查 `/etc/ld.so.conf.d/openssl-1.1.1w.conf` |
| Python 仍使用旧版 OpenSSL | 编译参数未生效 | 重新执行 `make distclean` 并严格按步骤配置环境变量 |

---

### 流程图解

```plain
[安装 OpenSSL 1.1.1w]  
       ↓  
[安装 GCC 工具链]  
       ↓  
[清理 Python 编译环境]  
       ↓  
[配置 Python 链接新 OpenSSL]  
       ↓  
[重新编译并验证]
```

通过以上步骤，您将彻底修复 Python 的 `_ssl` 模块缺失问题，并确保其正确使用 OpenSSL 1.1.1w。
