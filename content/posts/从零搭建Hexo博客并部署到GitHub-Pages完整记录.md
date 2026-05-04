---
title: 从零搭建 Hexo 博客并部署到 GitHub Pages 完整记录
date: 2026-04-29T23:00:00+08:00
tags:
  - hexo
  - github
  - 博客搭建
categories:
  - 编程开发
top: 2
---

## 前言

今天花了一些时间从零搭建了一个基于 Hexo 的个人博客，并成功部署到了 GitHub Pages。整个过程中踩了一些坑，也学到了不少东西，这里把完整的搭建流程记录下来，方便自己以后回顾，也希望能帮到有需要的朋友。

## 环境准备

在开始之前，确保你的系统已经安装了以下工具：

- **Node.js**（建议 v18 以上）
- **npm**（随 Node.js 一起安装）
- **Git**

可以通过以下命令检查版本：

```bash
node -v
npm -v
git --version
```

## 第一步：安装 Hexo 并初始化博客

首先全局安装 Hexo CLI：

```bash
npm install -g hexo-cli
```

然后初始化博客项目：

```bash
hexo init my-blog
cd my-blog
npm install
```

初始化完成后，目录结构如下：

```
my-blog/
  _config.yml        # 站点配置文件
  source/
    _posts/          # 文章目录
  themes/            # 主题目录
  public/            # 生成的静态页面
```

## 第二步：安装 Matery 主题

默认的 landscape 主题比较简陋，我选择了功能丰富的 Matery 主题，它采用了 Material Design 风格，界面美观大方。

```bash
cd my-blog
git clone https://github.com/blinkfox/hexo-theme-matery.git themes/matery
```

然后修改 `_config.yml` 中的主题配置：

```yaml
theme: matery
```

Matery 主题需要创建一些必要的页面：

```bash
hexo new page tags
hexo new page categories
hexo new page about
hexo new page contact
hexo new page friends
```

每个页面的 `index.md` 中需要添加对应的 `type` 和 `layout` 字段，例如标签页：

```yaml
---
title: tags
type: "tags"
layout: "tags"
---
```

## 第三步：配置 PrismJS 代码高亮

根据 Matery 主题文档，从 Hexo 5.0 开始自带了 prismjs 代码语法高亮支持。需要修改 `_config.yml`：

```yaml
syntax_highlighter: prismjs
highlight:
  enable: false
  line_number: true
  auto_detect: false
  tab_replace: ''
  wrap: true
  hljs: false
prismjs:
  enable: true
  preprocess: true
  line_number: true
  tab_replace: ''
```

主题默认使用 **Tomorrow Night** 暗色风格，也可以到 [prismjs 下载页面](https://prismjs.com/download.html) 自定义主题。

测试一下代码高亮效果：

```python
def fibonacci(n):
    """生成斐波那契数列"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

```javascript
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('请求失败:', error);
    }
};
```

## 第四步：安装常用插件

### 1. 搜索插件

安装 `hexo-generator-search` 实现站内搜索：

```bash
npm install hexo-generator-search --save
```

在 `_config.yml` 中添加：

```yaml
search:
  path: search.xml
  field: post
```

### 2. 中文链接转拼音

中文链接不利于 SEO，安装 `hexo-permalink-pinyin` 自动将中文链接转为拼音：

```bash
npm i hexo-permalink-pinyin --save
```

配置：

```yaml
permalink_pinyin:
  enable: true
  separator: '-'
```

### 3. 文章字数统计

安装 `hexo-wordcount` 显示文章字数和阅读时长：

```bash
npm i --save hexo-wordcount
```

然后在主题的 `_config.yml` 中激活：

```yaml
postInfo:
  date: true
  update: true
  wordCount: true
  totalCount: true
  min2read: true
  readCount: true
```

### 4. Emoji 表情支持

安装 `hexo-filter-github-emojis` 让文章支持 emoji 语法：

```bash
npm install hexo-filter-github-emojis --save
```

配置：

```yaml
githubEmojis:
  enable: true
  className: github-emoji
  inject: true
  styles:
  customEmojis:
```

使用方法：在文章中写 `:smile:` `:heart:` 等语法即可。

### 5. RSS 订阅支持

安装 `hexo-generator-feed` 提供 RSS 订阅功能：

```bash
npm install hexo-generator-feed --save
```

配置：

```yaml
feed:
  type: atom
  path: atom.xml
  limit: 20
  hub:
  content:
  content_limit: 140
  content_limit_delim: ' '
  order_by: -date
```

## 第五步：配置社交链接

在主题的 `_config.yml` 中修改 `socialLink` 部分，填写自己的社交信息：

```yaml
socialLink:
  github: https://www.github.com/zz3656
  email: uuuuf@qq.com
  qq: 155166660
  rss: true
```

## 第六步：部署到 GitHub Pages

### 安装部署插件

```bash
npm install hexo-deployer-git --save
```

### 创建 GitHub 仓库

在 GitHub 上创建一个名为 `用户名.github.io` 的仓库（例如 `zz3656.github.io`）。

### 配置部署信息

修改 `_config.yml`：

```yaml
url: https://zz3656.github.io

deploy:
  type: git
  repo: https://github.com/zz3656/zz3656.github.io.git
  branch: main
```

### 执行部署

```bash
hexo clean
hexo generate
hexo deploy
```

### 踩坑记录

部署过程中遇到了两个问题：

**问题一：GitHub Push Protection 拦截**

Matery 主题自带的 `twikoo.all.min.js` 文件被 GitHub 识别为包含密钥，导致推送被拒绝。解决方法是删除该文件（如果不用 twikoo 评论功能的话）。

**问题二：邮箱隐私保护**

如果 GitHub 设置了隐藏邮箱，推送会被拒绝。需要将 git 的 email 改为 GitHub 提供的 no-reply 邮箱：

```bash
git config --global user.email "用户名@users.noreply.github.com"
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `hexo new "文章标题"` | 新建文章 |
| `hexo new page "页面名"` | 新建页面 |
| `hexo generate` | 生成静态文件 |
| `hexo server` | 本地预览（默认 localhost:4000） |
| `hexo deploy` | 部署到远程 |
| `hexo clean` | 清除缓存和生成的文件 |

## 总结

整个搭建过程虽然遇到了一些小问题，但总体还是比较顺利的。Hexo + Matery 主题的组合功能丰富、界面美观，非常适合用来搭建个人博客。后续还可以继续完善评论系统、自定义域名等功能，让博客更加完善。

如果你也在搭建博客，希望这篇文章能帮到你 :smile:
