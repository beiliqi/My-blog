---
title: "无限debugger"
description: ""
date: 2026-04-17
tags: [debugger, 反爬, javascript]
category: 抓包与逆向
draft: false
---
方案一是可用的，此网址是可用的 [https://im1907.top/](https://im1907.top/)

https://chat.deepseek.com/a/chat/s/cc2f5dd2-411f-4a27-9c06-04014b293a1a

### 🔍 代码分析

1. **定时器** ：每 `50ms` 执行一次。
2. **核心干扰** ： `Function("debugger")()` —— 这行会在运行时动态创建一个函数并立即执行，导致 Chrome DevTools 强制暂停。
3. **反检测/惩罚机制** ：

**结论**：如果你用普通的“永不在此暂停”，时间差会超过 500ms，页面就会被清空。

### ✅ 针对此代码的 3 种破解方案

#### 方案一：Hook 定时器 + 覆盖 Function 构造器（推荐，无需刷新）

直接在 Console 中粘贴运行以下代码。这段代码会提前拦截 `Function` 的调用，如果发现内容是 `"debugger"`，就把它变成一个无害的空函数。

```javascript
// 1. 保存原始 Function 构造器
const OrigFunction = window.Function;

// 2. 覆盖 Function 构造器
window.Function = function(...args) {
    // 如果参数包含 "debugger"，直接返回一个空函数
    if (args.length && args.join('').includes('debugger')) {
        return function() {};
    }
    // 否则正常构造
    return OrigFunction.apply(this, args);
};

// 3. (可选) 为了不让页面被清空，把 document.body.innerHTML 的赋值也屏蔽掉
Object.defineProperty(document.body, 'innerHTML', {
    set: function(val) {
        if (val === '') {
            console.warn('阻止页面清空操作');
            return;
        }
        this.innerHTML = val;
    }
});
```

#### 方案二：本地替换（Overrides）精确修改

如果你更喜欢用 Overrides，可以修改以下两处：

1. 找到 `Function("debugger")();` 这一行， **直接删掉** 。
2. 找到 `if (now() - a > 500)` 这段逻辑，为了彻底安全，把判断条件改成 `false` ：

```javascript
// 修改前
if (now() - a > 500) { ... }

// 修改后
if (false) { ... }
```

#### 方案三：油猴脚本（Tampermonkey）自动拦截

如果你需要经常访问这个页面，可以用脚本自动处理：

```javascript
// ==UserScript==
// @name         干掉无限Debugger + 防清屏
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  拦截 Function("debugger") 并防止页面被清空
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 在页面脚本执行前覆盖 Function
    const origFunction = window.Function;
    window.Function = function() {
        for (let i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'string' && arguments[i].includes('debugger')) {
                return function() {};
            }
        }
        return origFunction.apply(this, arguments);
    };
    
    // 防止清屏
    Object.defineProperty(document, 'body', {
        get: () => null,
        configurable: true
    });
})();
```

### ⚠️ 特别提醒

这个脚本里的 `document.body.innerHTML = ''` 是**真实存在的破坏行为**。如果你直接使用 Fiddler/Charles 粗暴地屏蔽整个 JS 文件，页面可能会因为缺少其他功能而无法正常加载。**首选推荐方案一（Hook）**，它只过滤有害部分，保留其他功能。
