---
title: "Android 14 抓包、安装系统证书"
description: ""
date: 2025-07-11
tags: []
draft: true
---
## Fiddler / Charles 抓包安卓 14 问题解决：系统根证书安装教程

---

## 一、准备阶段

你需要准备以下工具：

- 一台已 **ROOT** 的 Android 手机

- 手机安装：

- 电脑端安装并配置：

---

## 二、Magisk 安装扩展

1. 下载插件 `Magisk-MoveCACerts.zip`

https://github.com/wjf0214/Magisk-MoveCACerts/releases/tag/V1.1.1

1. 打开 Magisk App：

1. 安装后重启，并确保模块启用

---

## 三、将 `.cer` 证书转换为 `.pem` 格式

如果你已有 `.pem` 文件可跳过此步骤。

### 执行以下任一命令将 `.cer` 转换为 `.pem`：

```bash
openssl x509 -in your_cert.cer -inform DER -out output.pem -outform PEM
# 或
openssl x509 -inform DER -in your_cert.cer -outform PEM -out output.pem
```

### 获取证书哈希值（用于重命名）

```bash
openssl x509 -subject_hash_old -in output.pem
```

输出类似如下内容，其中 `269953fb` 是接下来需要用到的文件名：

```bash
269953fb
```

### 创建符合 Android 证书格式的 `.0` 文件：

```bash
openssl x509 -inform PEM -in output.pem -out 269953fb.0
```

---

## 四、证书提权（拷贝到系统根证书目录）

1. 使用 USB 将 `269953fb.0` 拷贝到手机根目录

1. 打开 MT管理器：

1. 长按 `.0` 文件 → 选择「移动」 → 移动至右侧系统证书目录

1. 移动完成后，长按文件 → 选择「属性」 → 设置权限为： `664`

1. 重启手机，检查系统证书中是否存在该证书

---

## 五、特殊情况处理

### 如果证书未生效：

- 重复上面步骤 **但将目标路径改为** ：

```plain
/data/adb/modules/MoveCACerts/system/etc/security/cacerts/
```

⚠️ **注意**：如模块已安装，后续添加的证书可直接复制至该路径，无需重复整个流程，只需重启手机即可。

### 若抓包仍失败或 WIFI 提示网络受限：

- 尝试删除该目录下所有证书，重新导入新证书

- 检查抓包工具配置，例如：

---

## 六、结语

通过上述步骤，可以将抓包证书成功导入 Android 14 系统根证书中，实现 Fiddler / Charles 抓包功能。

如遇问题，建议：

- 检查证书路径是否正确

- 检查证书格式是否为 `.0`

- 检查权限设置是否为 `664`

- 检查抓包工具插件配置是否完善

---

原文链接：[https://blog.csdn.net/qq_35041117/article/details/136547490](https://blog.csdn.net/qq_35041117/article/details/136547490)

---
