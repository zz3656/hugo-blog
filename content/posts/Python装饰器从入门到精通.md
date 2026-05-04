---
title: Python 装饰器从入门到精通
date: 2026-04-29T23:40:00+08:00
tags:
  - Python
  - 装饰器
  - 编程技巧
categories:
  - 编程开发
---

## 前言

Python 装饰器是 Python 中非常强大且优雅的特性，理解装饰器对于写出高质量的 Python 代码至关重要。本文将带你从零开始，逐步掌握装饰器的各种用法。

## 什么是装饰器

装饰器本质上是一个函数，它接受一个函数作为参数，返回一个新的函数。它可以在不修改原函数代码的情况下，给函数增加新的功能。

## 基础装饰器

```python
def timer(func):
    """计算函数执行时间的装饰器"""
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行耗时: {end - start:.4f}秒")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)
    print("函数执行完毕")

slow_function()
# 输出: 函数执行完毕
# 输出: slow_function 执行耗时: 1.0012秒
```

## 带参数的装饰器

```python
def retry(max_attempts=3, delay=1):
    """失败自动重试装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    print(f"第 {attempt + 1} 次失败，{delay}秒后重试...")
                    import time
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def unstable_api_call():
    import random
    if random.random() < 0.7:
        raise ConnectionError("连接失败")
    return "请求成功"
```

## 使用 functools.wraps 保留元信息

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        """这是 wrapper 的文档"""
        print("调用前")
        result = func(*args, **kwargs)
        print("调用后")
        return result
    return wrapper

@my_decorator
def greet(name):
    """打招呼函数"""
    print(f"你好, {name}!")

print(greet.__name__)   # greet（而非 wrapper）
print(greet.__doc__)    # 打招呼函数
```

## 类装饰器

```python
class Singleton:
    """单例模式装饰器"""
    def __init__(self, cls):
        self._cls = cls
        self._instance = None

    def __call__(self, *args, **kwargs):
        if self._instance is None:
            self._instance = self._cls(*args, **kwargs)
        return self._instance

@Singleton
class Database:
    def __init__(self):
        print("数据库连接创建")

db1 = Database()  # 输出: 数据库连接创建
db2 = Database()  # 无输出，返回同一实例
print(db1 is db2)  # True
```

## 总结

装饰器是 Python 中实现代码复用和功能增强的利器。掌握装饰器后，你会发现很多看似复杂的需求都可以用优雅的方式解决。记住核心原则：装饰器 = 接受函数 + 返回函数。
