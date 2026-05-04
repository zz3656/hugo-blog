---
title: "Hugo 博客搭建实录：从 GitHub Pages 到 Cloudflare Workers 双线部署"
date: 2026-05-04T10:00:00+08:00
draft: false
categories:
  - 技术教程
tags:
  - Hugo
  - GitHub Pages
  - Cloudflare Workers
  - PaperMod
  - 博客搭建
---

## 前言

作为一个折腾不止的博主，我原本在用 Hexo + Matery 主题搭建博客，部署在 GitHub Pages 上。但 Hexo 基于 Node.js，构建速度慢、依赖多，每次换电脑都要重新安装环境。于是决定尝试 Hugo —— 一个用 Go 写的静态站点生成器，号称"世界上最快的网站框架"。

本文记录了完整的搭建过程：从新建仓库、迁移文章，到实现 **GitHub Pages + Cloudflare Workers 双线自动部署**，以及踩过的各种坑。

## 最终效果

| 平台 | 地址 | 特点 |
|------|------|------|
| GitHub Pages | https://zz3656.github.io/hugo-blog/ | 稳定、免费 |
| Cloudflare Workers | https://blog.inte8.top/ | 全球 CDN、国内访问快 |

每次 `git push` 到 main 分支，GitHub Actions 自动构建并同步部署到两个平台。

---

## 一、环境准备

### 1.1 安装 Hugo

macOS 直接用 Homebrew：

```bash
brew install hugo
```

安装完成后验证：

```bash
hugo version
# hugo v0.161.1+extended
```

> 注意：一定要装 **extended** 版本，有些主题需要 SCSS 支持。

### 1.2 创建 GitHub 仓库

在 GitHub 上创建一个公开仓库，比如 `zz3656/hugo-blog`。

### 1.3 本地初始化 Hugo 站点

```bash
mkdir hugo-blog && cd hugo-blog
git init
hugo new site . --force
```

---

## 二、安装主题

选择 PaperMod 主题，简洁现代、功能丰富：

```bash
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

用 submodule 而不是直接复制，方便后续更新主题。

---

## 三、配置站点

创建 `hugo.toml`：

```toml
baseURL = 'https://zz3656.github.io/hugo-blog/'
defaultContentLanguage = 'zh'
title = '因特吧'
theme = 'PaperMod'

[pagination]
  pagerSize = 10

[params]
  defaultTheme = 'auto'
  ShowReadingTime = true
  ShowCodeCopyButtons = true
  ShowToc = true
  description = '因特吧的博客，分享技术与生活'
  author = '因特吧'

  # 个人资料模式（头像+副标题）
  [params.profileMode]
    enabled = true
    title = '因特吧'
    subtitle = '分享技术与生活'
    imageUrl = 'logo.png'
    imageWidth = 120
    imageHeight = 120

  [[params.socialIcons]]
    name = 'github'
    url = 'https://github.com/zz3656'

# 代码高亮
[markup.highlight]
  style = 'dracula'
  lineNos = true
  noClasses = false
  guessSyntax = true

# 菜单
[menu]
  [[menu.main]]
    identifier = '首页'
    name = '首页'
    url = '/'
    weight = 5
  [[menu.main]]
    identifier = '归档'
    name = '归档'
    url = '/archives/'
    weight = 10
```

---

## 四、迁移 Hexo 文章

这是最麻烦的一步。Hexo 和 Hugo 的 front matter 格式不同：

| 项目 | Hexo | Hugo |
|------|------|------|
| 日期格式 | `2026-05-04 10:00:00` | `2026-05-04T10:00:00+08:00` |
| 分类/标签 | `- 标签名` | `- 标签名`（相同） |
| 特有字段 | `cover`, `img`, `abbrlink` | 无，需要清理 |

用 Python 脚本批量处理：

```python
import os, re, datetime

src = 'hexo/source/_posts'
dst = 'hugo/content/posts'

for f in os.listdir(src):
    if not f.endswith('.md'):
        continue
    with open(os.path.join(src, f), 'r') as fh:
        content = fh.read()
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        continue
    
    fm = parts[1]
    body = parts[2]
    
    # 修复日期格式
    fm = re.sub(r'date:\s*(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})', 
                r'date: \1T\2+08:00', fm)
    
    # 清理 Hexo 特有字段
    for key in ['img', 'cover', 'abbrlink', 'mathjax', 'toc']:
        fm = re.sub(rf'^{key}:.*$', '', fm, flags=re.MULTILINE)
    
    # 修复 tags 中的方括号
    fm = re.sub(r'^\s+-\s+\[(.+)\]$', r'  - \1', fm, flags=re.MULTILINE)
    
    new_content = '---\n' + fm.strip() + '\n---' + body
    with open(os.path.join(dst, f), 'w') as fh:
        fh.write(new_content)
```

> 踩坑：有些文章的 tags 写成了 `- [Hermes` 和 `- AI Agent]`，Hugo 解析报错。需要把方括号去掉。

---

## 五、GitHub Actions 部署

### 5.1 GitHub Pages 部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Hugo Blog

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.161.1
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb \
            https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb
          sudo dpkg -i ${{ runner.temp }}/hugo.deb

      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5

      - name: Build with Hugo
        run: hugo --minify --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

在仓库 Settings → Pages 里设置 build_type 为 workflow 即可。

### 5.2 Cloudflare Workers 双线部署

这是重头戏。目标：**同一个仓库 push 一次，同时部署到两个平台**。

**Cloudflare 准备：**

1. 注册 Cloudflare 账号
2. 创建一个 Worker（比如命名为 `hugo`）
3. 生成 API Token：个人资料 → API 令牌 → 编辑 Workers
4. 记下 Account ID

**GitHub Secrets 配置：**

在仓库 Settings → Secrets → Actions 中添加：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**关键问题：两个平台的 baseURL 不同**

GitHub Pages 是 `https://zz3656.github.io/hugo-blog/`（有子路径），而 Workers 自定义域名是 `https://blog.inte8.top/`（根路径）。需要分别构建。

在 deploy.yml 的 build job 里添加：

```yaml
      # 先构建 GitHub Pages 版本
      - name: Build for GitHub Pages
        run: hugo --minify --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload for GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

      # 再构建 Cloudflare Workers 版本
      - name: Build for Cloudflare Workers
        run: hugo --minify --baseURL "https://blog.inte8.top/" --destination public-cf

      - name: Prepare Workers assets
        run: rm -rf public && mv public-cf public

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
        continue-on-error: true
```

> 踩坑：最初只构建一次，Workers 上的链接全指向上 `hugo.zz3656.workers.dev`，改成自定义域后链接又跳回 workers.dev。根本原因是 baseURL 写死了。分别构建后完美解决。

---

## 六、自定义域名

在 Cloudflare Workers 设置中添加自定义域名 `blog.inte8.top`，Cloudflare 会自动配置 DNS 和 SSL。

---

## 七、资源路径兼容

Hugo 的资源路径写法会影响两个平台：

```toml
# 错误：绝对路径，GitHub Pages 子路径下 404
imageUrl = '/logo.png'
# 解析为 https://zz3656.github.io/logo.png ❌

# 正确：相对路径，Hugo 自动拼接 baseURL
imageUrl = 'logo.png'
# GitHub Pages: https://zz3656.github.io/hugo-blog/logo.png ✅
# Workers: https://blog.inte8.top/logo.png ✅
```

所有资源文件（favicon、logo、RSS）都用相对路径，两个平台自动兼容。

---

## 八、主题定制

### 8.1 个人资料模式

PaperMod 支持三种首页模式，我选了 profileMode（头像+副标题+社交图标）：

```toml
[params.profileMode]
  enabled = true
  title = '因特吧'
  subtitle = '分享技术与生活'
  imageUrl = 'logo.png'
  imageWidth = 120
  imageHeight = 120
```

### 8.2 Logo 渐变色

用 Python 给白色 logo 加上 IE 浏览器风格的渐变色（金黄→橙红→深蓝），背景透明：

```python
from PIL import Image

gradient = [
    (0.00, (249, 215, 74)),   # 金黄
    (0.35, (235, 110, 53)),   # 橙红
    (0.65, (27, 127, 202)),   # 蓝
    (1.00, (0, 100, 180)),    # 深蓝
]

for y in range(height):
    for x in range(width):
        r, g, b, a = img.getpixel((x, y))
        if a > 0:
            t = (y - min_y) / span
            color = get_gradient_color(t)
            img.putpixel((x, y), (*color, a))
```

### 8.3 代码高亮

```toml
[markup.highlight]
  style = 'dracula'      # 主题
  lineNos = true          # 显示行号
  guessSyntax = true      # 自动猜测语言
  noClasses = false       # 用外部 CSS
```

---

## 九、构建速度对比

同样的 25 篇文章：

| 框架 | 构建时间 | 依赖 |
|------|---------|------|
| Hexo | 3-5 秒 | Node.js + npm packages |
| Hugo | 0.14 秒 | 单个二进制文件 |

Hugo 快了大约 30 倍，而且零依赖。

---

## 总结

这次迁移踩了不少坑，主要教训：

1. **baseURL 是关键** -- 双平台部署必须分别构建
2. **资源路径用相对路径** -- 不要以 `/` 开头
3. **front matter 要清理** -- Hexo 的特有字段会导致 Hugo 构建失败
4. **Cloudflare Workers 的 Static Assets** -- 用 `[assets]` 配置指定静态文件目录

最终实现了双线部署，GitHub Pages 做备份，Cloudflare Workers 做主站（国内访问快），每次 push 自动同步。整套流程完全免费。

---

> 本篇文章由 Hermes Agent + GLM-5.1 协作完成，记录于 2026年5月4日。
