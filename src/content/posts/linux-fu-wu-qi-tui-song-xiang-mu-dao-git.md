---
title: "linux服务器推送项目到git"
description: ""
date: 2024-12-19
tags: [git, ssh, linux]
category: 服务器与部署
draft: false
---
本文档将介绍如何在Linux服务器中将项目工程推送到Git仓库。假设你已经有一个Git仓库，并且在Linux服务器中有一个项目工程，以下步骤将帮助你将该工程上传到Git仓库

## 步骤 一. 使用 SSH 密钥（推荐方式）

在 Linux 服务器上使用 Git 进行推送时，如果你希望避免每次输入用户名和密码，可以通过以下方法实现自动化认证；

SSH 密钥是最安全的方式，可以让你避免每次输入用户名和密码。以下是如何在 Linux 服务器上设置 SSH 密钥认证并与 Git 配合使用

### 1：生成 SSH 密钥

如果你还没有 SSH 密钥，可以通过以下命令生成一个新的 SSH 密钥对：

`ssh-keygen -t rsa -b 4096 -C "your_email@example.com"`

### 2：将公钥添加到 GitHub 或 GitLab（或其他 Git 服务）

查看生成的公钥：

`cat ~/.ssh/id_rsa.pub`

复制输出的公钥内容。

登录到你的 Git 仓库服务平台：

### 3：配置 Git 使用 SSH URL

确保 Git 使用 SSH 而不是 HTTPS 地址：

`git remote -v`

你可能看到类似以下的输出，表示当前使用 HTTPS 远程地址：

`origin  https://github.com/username/repository.git (fetch)
origin  https://github.com/username/repository.git (push)`

`git remote set-url origin git@github.com:username/repository.git`

这样，Git 就会使用 SSH 密钥进行认证，而不再要求你输入用户名和密码。

## 步骤二：初始化Git仓库

首先，确保项目目录已经在Linux服务器中。如果项目目录还没有Git仓库，需要进行初始化。

`cd /opt/app/pyprocess/gerapy   # 进入项目目录
git init                   # 初始化Git仓库`

此命令会在项目目录中创建一个`.git`目录，标志着该目录是一个Git仓库。

## 步骤三：配置Git用户信息

在推送到Git之前，最好设置Git的用户信息。这些信息将标识提交的作者。

`git config --global user.name "Your Name"        # 设置用户名
git config --global user.email "your@example.com" # 设置用户邮箱`

如果你只想在当前项目中设置用户名和邮箱，可以省略`--global`选项。

## 步骤四：添加远程仓库

接下来，添加远程Git仓库的地址。这是将项目推送到Git仓库的目标地址。

`git remote add origin https://github.com/username/repository.git`

将 `https://github.com/username/repository.git` 替换为你实际的Git仓库地址。

如果你使用SSH而不是HTTPS，可以使用类似的SSH URL：

`git remote add origin git@github.com:username/repository.git`

## 步骤五：添加项目文件到Git

现在，你可以将项目中的文件添加到Git仓库并准备提交。首先，查看当前文件的状态：

`git status`

然后，添加文件到Git：

`git add .   # 添加当前目录下的所有文件`

如果你只想添加某个特定文件，可以指定文件路径：

`git add Ldoscrapyproducts/`

## 步骤六：提交更改

文件添加后，进行提交操作，并写下提交信息：

`git commit -m "Auto commit: $(date)"  # 提交文件并写提交信息`

请确保提交信息清晰简洁，简要描述更改内容。

## 步骤七：推送项目到远程仓库

一切准备好后，你可以将项目推送到Git远程仓库。第一次推送时，通常需要指定远程分支（如`master`或`main`）。

`git push -u origin master   # 推送到远程仓库的master分支`

如果远程仓库的默认分支是`main`，则需要将`master`替换为`main`，

新建或切换分支

`git checkout -b gerapy165`

这里是推送到`gerapy165`：

`git push -u origin gerapy165   # 推送到远程仓库的main分支`

`-u`选项会将本地分支与远程分支关联，以后推送时可以省略远程分支的名称。

## 步骤八：验证推送结果

推送成功后，可以访问Git仓库（如GitHub、GitLab等）检查文件是否成功上传。如果你使用GitHub，可以在浏览器中打开你的Git仓库页面，查看文件是否已显示。
