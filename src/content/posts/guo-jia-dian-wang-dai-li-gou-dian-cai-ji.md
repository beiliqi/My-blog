---
title: "国家电网-代理购电采集"
description: ""
date: 2025-03-12
updated: 2025-11-29
tags: [反爬, debugger, 采集]
category: 数据与调研
draft: false
---
爬取网站地址：aHR0cHM6Ly93d3cuOTU1OTguY24vb3Nnd2ViL2lwRWxlY3Ryb3ZhbGVuY2VTdGFuZGFyZD9wYXJ0Tm89UDIwMDM=

### 一、首先是无限 debugger 问题

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-01.png)<br>本次解决方法，使用油猴脚本进行无限 debugger 问题处理

##### 步骤 1、创建油猴脚本，添加新脚本

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-02.png)

##### 步骤 2：使用 GitHub 中开源的debugger代码进行处理，本次使用[https://github.com/0xsdeo/Bypass_Debugger](https://github.com/0xsdeo/Bypass_Debugger) ![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-03.png)

##### 步骤 3：将开源的过 debugger 代码复制到油猴脚本中并保存

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-04.png)

##### 步骤 4：此时再使用，可以看到已经过了无限 debugger

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-05.png)

### 二、堆栈跟踪请求接口

##### 步骤 1：观察请求接口发现请求参数的 data、skey 都是加密的，响应结果 encryptData,sign 也是加密的 ![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-06.png) ![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-07.png)

##### 步骤 2：通过关键词搜索和堆栈跟踪，找到加解密在 js 中生成的位置

从这个位置可以看到响应结果 encryptdata 的生成方法，通过打断点的方式，逐步找到加解密逻辑<br>![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-08.png)

##### 步骤 3：通过堆栈跟踪可以找到接口请求的地点

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-09.png)

##### 步骤 4：可以看到 a0 就是我们要请求的链接，a1 就是明文的入参 ![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-10.png)

##### 步骤 5：继续往下跟，从encryptSm4jsDataCBC 方法可以看到将明文数据进行加密的方法逻辑(入参 data 的一部分）

W 值为明文入参，X 为 uuid<br>![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-11.png)

##### 步骤 6：继续往下跟，可以看到 signdata 参数的入参 W 为刚才加密的明文数据+时间戳，得到的结果是（入参 data 的后半部分)

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-12.png)

##### 步骤 7：继续往下跟，找到 encryptData 方法，入参 W 为 uuid，X 为 publicKey（需要另一个接口获取），得到的 a1 结果为（入参 skey）

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-13.png)

##### 步骤 8：继续往下跟，到这一步，入参所有参数 data、skey、timestamp 字段都已获取到

可以看到 a3 的结果就是我们获取到的加密的响应结果值<br>![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-14.png)

##### 步骤 9：到这一步可以看到 W 值为响应结果的 encryptData,具体的实现方法为doDecryptSm4jsDataCBC

图 2 可以看到解密后的数据<br>![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-15.png)

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-16.png)

### 三、破解

##### 步骤 1：总结一下第二部分

需要处理的方法主要是：参数的加解密 sm4、uuid、keycode，publicKey、signdata 加密方式 sm2

##### 步骤 2：参数的加解密方法 sm4

从（图 1 ）中可以看到 使用的 sm4-cbc 的加密方法，在浏览器中使用 sm4 加密方法进行测试，发现 iv 值不对（图 2），只能使用此网站的加密方法，从（图 3）看到，代码是混淆的，此时可以借助大模型对混淆代码进行解混淆，这一块需要反复调整，也可直接将混淆的代码扣下来，（不过这种方式需要补充的代码多）<br>注：通过这种方式可以得到对应的解密方法

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-17.png)<br>![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-18.png)

#####  ![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-19.png)

##### 步骤 3：uuid 参数，这段代码也是混淆的代码，可以借助大模型进行解混淆，这个比较简单

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-20.png)

##### 步骤 4：keycode，publicKey 这两个参数

##### 需要另外的请求进行处理接口为 f02 ，入参相比上个接口多了个 client_id 参数，经测试，这个值是可以写死的 其他参数的加解密方式同上，响应结果中包含 keycode 和 publicKey 的值 ![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-21.png) 步骤 5：入参 signdata

跟代码可以从（图 1）到（图 2），可以看到，这个参数的实现代码也是混淆的，从（图 2）的方法往上找，可以看到，（图 2）的方法是包含在（图 3）的方法里的，这时候就需要将（图 3）整个方法给扣下来，这段代码是扣的源码，（使用大模型进行解混淆效果不佳)，扣完代码之后，缺啥代码就继续从 js 中扣

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-22.png)

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-23.png)

![](./assets/guo-jia-dian-wang-dai-li-gou-dian-cai-ji/img-24.png)

##### 步骤 6：到这一步接口需要的所有参数都已经处理完了，进行封装请求即可，代码地址：...
