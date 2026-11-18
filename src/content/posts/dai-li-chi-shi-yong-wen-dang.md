---
title: "代理池使用文档"
description: ""
date: 2025-05-22
updated: 2025-06-23
tags: [代理池, redis, python]
category: 爬虫工程
draft: false
---
## 1、从Redis代理池随机获取一个代理IP

```python
def get_proxy_redis():
    # 连接 Redis 获取代理
    redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT,  password=REDIS_PASSWORD, decode_responses=True)
    proxy_pool = redis_client.hgetall("proxyPool")
    proxy = random.choice(list(proxy_pool)) if proxy_pool else None
    proxies = {
        "http": proxy,
        "https": proxy
    }
    return proxies
```

## 2、通过API接口获取代理IP

```python
def get_proxy_api():
    # 通过 API接口 获取代理
    proxy_url = "http://203.0.113.20:80/getproxy"
    proxies = requests.get(proxy_url).json()
    proxy = proxies if proxies else None
    return proxy
```

## 3、通过 api 获取长效代理

```python
def get_proxy_api():
    # 通过 API接口 获取长效代理
    proxy_url = "http://203.0.113.20:80/long"
    proxies = requests.get(proxy_url).json()
    proxy = proxies if proxies else None
    return proxy
```

## 4、测试代理

```python
def test_proxy():
    proxies = get_proxy_api()
    url = "https://httpbin.org/ip"
    try:
        response = requests.get(url, proxies=proxies, timeout=5)
        print(response.status_code)
        print(response.text)
    except Exception as e:
        print(e)
```
