---
layout: ../layouts/PageLayout.astro
title: 代码块实验室
description: 高亮、行号、diff、折叠、错误标记的回归页面，改样式前先看这里。
noindex: true
---

这一页用来验收代码块渲染：每一种 meta 写法都放了一个样本。改动主题或样式后，回到这里逐项对照。

## 默认：短片段不加行号

```python
def add(a: int, b: int) -> int:
    return a + b
```

## 长片段自动加行号（≥ 8 行）

```python
from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field


@dataclass(slots=True)
class Retry:
    times: int = 3
    delay: float = 0.5
    backoff: float = 2.0
    errors: tuple[type[Exception], ...] = (OSError, asyncio.TimeoutError)

    async def run(self, fn: Callable[[], Awaitable[None]]) -> None:
        wait = self.delay
        for attempt in range(1, self.times + 1):
            try:
                await fn()
                return
            except self.errors:
                if attempt == self.times:
                    raise
                await asyncio.sleep(wait)
                wait *= self.backoff
```

## 标题栏 + 指定行高亮

```python title="tasks.py" showLineNumbers {4,9-11}
import asyncio

async def worker(name, queue):
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        try:
            await handle(name, item)
        finally:
            queue.task_done()
```

## diff：注释式标记

```js title="cache.js"
const cache = new Map();

export function get(key) {
  return cache.get(key);
}

export async function load(key, fetchValue) {
  if (cache.has(key)) return cache.get(key); // [!code --]
  const value = await fetchValue(key);       // [!code ++]
  cache.set(key, value);                     // [!code ++]
  return value;
}
```

## 聚焦：只强调关键几行

```js
async function main() {
  const config = await readConfig();
  const db = await connect(config.db); // [!code focus]
  const server = createServer(db);     // [!code focus]
  await server.listen(config.port);    // [!code focus]
}
```

## 关键词高亮

```js title="parse.ts" {2}
const raw = await response.text();
const payload = JSON.parse(raw); // [!code word:JSON]
```

## 错误 / 警告行

```python
def parse_port(value: str) -> int:
    port = int(value)
    if port < 1 or port > 65535: # [!code error]
        raise ValueError("端口必须在 1-65535 之间")
    if port < 1024: # [!code warning]
        print("低于 1024 的端口通常需要 root 权限")
    return port
```

## 折叠：默认收起长代码

```python title="migration.py" collapse
SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts (published_at);
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
"""

def upgrade(conn):
    conn.executescript(SCHEMA)
    columns = {row[1] for row in conn.execute("PRAGMA table_info(posts)")}
    if "updated_at" not in columns:
        conn.execute("ALTER TABLE posts ADD COLUMN updated_at TEXT")
    if "summary" not in columns:
        conn.execute("ALTER TABLE posts ADD COLUMN summary TEXT")
    conn.commit()
```

## 关闭复制按钮

```bash no-copy
docker compose up -d --build
docker compose logs -f blog
```

## 自动换行

```text wrap
这是一段很长的文本，用来检查自动换行开关是否生效：The quick brown fox jumps over the lazy dog, then keeps running far beyond the right edge of the code block so that the line has to wrap somewhere.
```

## 其它语言

```bash
#!/usr/bin/env bash
set -euo pipefail

target="${1:?usage: deploy.sh <host>}"
rsync -az --delete dist/ "${target}:/srv/blog/"
ssh "$target" 'nginx -t && systemctl reload nginx'
```

```yaml title="docker-compose.yml"
services:
  blog:
    image: inkwell:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

```sql
SELECT p.title, count(pt.tag_id) AS tag_count
FROM posts p
JOIN post_tags pt ON pt.post_id = p.id
WHERE p.published_at IS NOT NULL
GROUP BY p.id
ORDER BY tag_count DESC
LIMIT 10;
```

```diff
- const timeout = 3000;
+ const timeout = 8000;
```

## 行内代码与表格

行内代码写成 `npm run build`，表格用来对照参数：

| meta | 作用 | 示例 |
| --- | --- | --- |
| `title` | 文件名标题栏 | `title="spider.py"` |
| `showLineNumbers` | 强制显示行号 | `showLineNumbers` |
| `noLineNumbers` | 强制关闭行号 | `noLineNumbers` |
| `{1,3-5}` | 高亮指定行 | `{2,7-9}` |
| `collapse` | 收起长代码 | `collapse` |
| `no-copy` | 隐藏复制按钮 | `no-copy` |
| `wrap` | 默认自动换行 | `wrap` |
| `start` | 行号起始值 | `start=10` |
