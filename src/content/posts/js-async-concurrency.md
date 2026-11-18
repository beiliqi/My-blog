---
title: 浏览器里的并发控制：Promise.all 之后还得自己管
description: Promise.all 只解决"一起发"，不解决"发多少"。这篇记录手写并发池、取消与错误聚合的三个版本。
date: 2026-11-12
tags: [javascript, 并发, 浏览器]
category: 编程与工程
---

`Promise.all(items.map(fetchItem))` 是很多人写并发请求的第一反应。它在小数据量下没问题，但如果 `items` 有 5000 条，浏览器会瞬间打开上千个连接，然后被同域连接数限制卡住，队列越排越长，取消也无从下手。

这篇记录三个版本的演进：从裸 `Promise.all`，到并发池，再到能取消、能聚合错误的版本。

## 版本一：Promise.all 的两个坑

```js title="naive.js"
async function loadAll(ids) {
  const results = await Promise.all(ids.map((id) => fetchItem(id)));
  return results;
}
```

第一个坑是**没有上限**。第二个坑是**一个失败全盘皆输**：`Promise.all` 在第一个 rejection 时就返回，但其余请求还在跑，它们的结果没人要，也不会被取消。

如果只是想"失败也继续"，`Promise.allSettled` 可以解决第二个坑，但第一个坑仍然存在。

## 版本二：固定并发的池子

思路很简单：维护一个"运行中"的计数器，每完成一个就补一个。

```js title="pool.js" showLineNumbers
export async function pool(items, worker, concurrency = 6) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run(),
  );

  await Promise.all(runners);
  return results;
}
```

几个细节值得注意：

- `cursor++` 是同步的，所以多个 runner 不会拿到同一个 index（JS 单线程保证了这点）。
- 用 `results[index]` 而不是 `push`，保证输出顺序和输入一致。
- runner 的数量取 `min(concurrency, items.length)`，空数组时直接返回。

这个版本能用了，但还有两个问题：worker 抛错会中断整个池子；没有办法中途叫停。

## 版本三：可取消 + 错误聚合

```js title="pool-v3.js" showLineNumbers {9-14}
export async function pool(items, worker, options = {}) {
  const { concurrency = 6, signal } = options;
  const results = new Array(items.length);
  const errors = [];
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      if (signal?.aborted) return;
      const index = cursor++;
      try {
        results[index] = await worker(items[index], index, signal);
      } catch (error) {
        if (error?.name === 'AbortError') return;
        errors.push({ index, error });
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );

  if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');
  return { results, errors };
}
```

这里做了三个决定：

1. **单个任务失败不中断池子**，错误收集到 `errors` 里，调用方自己决定严重性。
2. **取消用 `AbortSignal`**，和 `fetch` 共用一套语义，不用自己发明 `cancelled` 标志。
3. **取消后抛出**，而不是返回部分结果——否则调用方很容易把半份数据当成完整数据。

## 和 fetch 对接

`AbortSignal` 可以直接传给 `fetch`，任务在途时也能被中断：

```js title="fetch-item.js"
async function fetchItem(id, signal) {
  const response = await fetch(`/api/items/${id}`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
```

`signal` 被 abort 时，`fetch` 会 reject 一个 `AbortError`，上面的 `catch` 会识别并安静退出，不会记成业务错误。

## 实测数据

同一批 300 个请求，本地 mock 服务延迟 30ms：

| 并发数 | 总耗时 | 峰值连接 | 失败率 |
| --- | --- | --- | --- |
| 无上限 | 1.9s | 300 | 0 |
| 6 | 2.4s | 6 | 0 |
| 32 | 1.3s | 32 | 0 |
| 128 | 1.2s | 128 | 2.1% |

并发到 128 时开始出现失败，原因是 mock 服务的连接队列被打满。真实浏览器同域 HTTP/1.1 只有 6 个连接，开再多也只是排队；HTTP/2 下可以到 100 左右，但服务端不一定扛得住。

> 结论不是"并发越高越好"，而是"并发数应该由下游能力决定"，通常 6–16 是个安全的起点。

## 一个小陷阱

`Promise.all([...])` 里的 Promise 在构造时就开始执行了。如果你这样写：

```js
// [!code --]
const tasks = items.map((item) => fetchItem(item));
// [!code --]
await pool(tasks, (task) => task, 6);
```

池子拿到的是"已经在跑的 Promise"，限流完全无效。正确的做法是把**函数**交给池子，让池子决定什么时候调用：

```js
// [!code ++]
await pool(items, (item) => fetchItem(item), 6);
```

这也是为什么 `pool` 的签名是 `(items, worker)` 而不是 `(tasks)`。

## 小结

`Promise.all` 的语义是"全部成功或全部失败"，它不管调度。一旦请求数量超过个位数，就值得写一个明确的池子：并发上限、错误策略、取消语义三件事定清楚，后面的代码会简单很多。
