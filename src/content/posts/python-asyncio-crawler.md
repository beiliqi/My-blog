---
title: 用 asyncio 重写爬虫：从 300 行到 90 行
description: 把一套回调式的并发爬虫改成 asyncio 结构，顺便把重试、限速、结果落盘拆成可测试的小块。
date: 2026-11-16
updated: 2026-11-18
tags: [python, asyncio, 爬虫]
category: 爬虫工程
cover: ./assets/cover-asyncio.png
coverAlt: 深色渐变封面，写着 asyncio
---

同步爬虫的问题不在于慢，而在于慢得没有规律：一个域名卡住，整批任务一起等。这篇记录一次把老爬虫改成 asyncio 的过程，重点不在 API，而在结构。

## 先看原来的样子

老代码用线程池加队列，核心长这样：

```python
def crawl(urls: list[str]) -> list[Result]:
    results = []
    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = [pool.submit(fetch, url) for url in urls]
        for future in as_completed(futures):
            results.append(future.result())
    return results
```

问题有三个：异常在 `future.result()` 里才炸；限速只能靠 `sleep` 全局生效；结果只能等全部结束才落盘。

## 目标结构

拆成三层，每层都能单独测：

1. `fetch`：单个 URL 的请求 + 解析，纯异步函数。
2. `Retry`：重试策略，不关心业务。
3. `run`：调度、限速、结果收集。

## 单次请求

```python title="fetcher.py" showLineNumbers {14-16}
import asyncio
from dataclasses import dataclass

import aiohttp

@dataclass(slots=True)
class Page:
    url: str
    status: int
    html: str

async def fetch(session: aiohttp.ClientSession, url: str) -> Page:
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
        html = await response.text()
        if response.status >= 400:
            raise FetchError(url, response.status)
        return Page(url=url, status=response.status, html=html)
```

`timeout` 挂在请求上而不是 `asyncio.wait_for` 上，好处是异常类型统一，重试策略不用管超时从哪来。

## 重试与退避

```python title="retry.py" showLineNumbers {12-18}
T = TypeVar("T")

@dataclass(slots=True)
class Retry:
    times: int = 3
    delay: float = 0.5
    backoff: float = 2.0
    errors: tuple[type[Exception], ...] = (aiohttp.ClientError, asyncio.TimeoutError)

    async def run(self, fn: Callable[[], Awaitable[T]]) -> T:
        wait = self.delay
        for attempt in range(1, self.times + 1):
            try:
                return await fn()
            except self.errors:
                if attempt == self.times:
                    raise
                await asyncio.sleep(wait)
                wait *= self.backoff
        raise AssertionError("unreachable")
```

## 限速：信号量不如令牌桶

对同一域名，最简单的做法是给每个域名一个 `Semaphore`。并发是控制了，但请求会在同一瞬间挤出去，对端看到的是突发流量。

改成令牌桶后，间隔是均匀的：

```python title="limiter.py" showLineNumbers
class TokenBucket:
    def __init__(self, rate: float, capacity: float) -> None:
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.updated = asyncio.get_running_loop().time()

    async def acquire(self) -> None:
        while True:
            now = asyncio.get_running_loop().time()
            self.tokens = min(self.capacity, self.tokens + (now - self.updated) * self.rate)
            self.updated = now
            if self.tokens >= 1:
                self.tokens -= 1
                return
            await asyncio.sleep((1 - self.tokens) / self.rate)
```

## 调度与流式落盘

结果不要攒到最后。用 `asyncio.as_completed`，谁先完成谁先写：

```python title="run.py" showLineNumbers
async def run(urls: list[str], sink: Sink) -> None:
    limiter = TokenBucket(rate=8, capacity=8)
    retry = Retry()

    async with aiohttp.ClientSession() as session:
        async def task(url: str) -> Page:
            await limiter.acquire()
            return await retry.run(lambda: fetch(session, url))

        coros = [task(url) for url in urls]
        for done in asyncio.as_completed(coros):
            try:
                page = await done
            except Exception as error:
                sink.failed(error)
            else:
                sink.write(page)
```

## 结果对比

同一批 5,000 个 URL，单机跑：

| 版本 | 耗时 | 峰值内存 | 失败重试 |
| --- | --- | --- | --- |
| 线程池 16 | 6 分 12 秒 | 480 MB | 无 |
| asyncio + 信号量 | 1 分 48 秒 | 96 MB | 无 |
| asyncio + 令牌桶 | 2 分 05 秒 | 92 MB | 3 次退避 |

限速版本慢十几秒，但对端没有任何 429，这是值得的。

## 几个坑

**不要在协程里用 `requests`。** 它会阻塞事件循环，所有并发都会退化成串行。

**`asyncio.as_completed` 在 3.13 之前不保留任务引用。** 如果不用 `gather` 包一层，任务可能被 GC 回收，表现为"随机少跑了几个"。

**`aiohttp` 的 `ClientSession` 要在事件循环里创建。** 在模块顶层创建再传进 `asyncio.run` 会绑定到错误的循环上。

## 小结

改完之后 90 行左右，每一层都能单独写测试：`fetch` 用 `aiohttp` 的测试服务器，`Retry` 纯函数式，`run` 用一个假 sink 验证顺序。比原来的 300 行好维护得多。
