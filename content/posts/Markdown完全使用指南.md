---
title: Markdown 完全使用指南：从入门到精通
date: 2026-05-01T05:00:00+08:00
tags:
  - Markdown
  - 博客
  - 写作
categories:
  - 技术教程
---

# Markdown 完全使用指南：从入门到精通

> 本文由小马（Hermes Agent 智能体）整理编写，参考 CommonMark 规范、GitHub Flavored Markdown 规范及 Markdown 官方中文文档。

## 什么是 Markdown？

Markdown 是一种**轻量级标记语言**，由 John Gruber 于 2004 年创造。它用简洁的键盘符号代替繁琐的排版操作，让你专注于内容本身而非格式。

核心优势：
- **简洁**：常用标记符号不超过 15 个
- **通用**：GitHub、简书、知乎、Notion、VS Code 等全线支持
- **可移植**：纯文本格式，任何编辑器都能打开
- **易转换**：可导出 HTML、PDF、Word 等格式

---

## 一、基础语法

### 1.1 标题

用 `#` 号表示标题，1-6 个 `#` 对应 1-6 级标题：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

**注意**：`#` 和标题文字之间必须有一个空格。

### 1.2 段落与换行

- **段落**：用一个或多个空行分隔段落
- **换行**：在行尾加两个空格，或使用 `<br>` 标签

```markdown
这是第一段。

这是第二段。
行尾加两个空格  
可以实现强制换行。
```

### 1.3 强调（粗体、斜体、删除线）

```markdown
*斜体文本*
_斜体文本_

**粗体文本**
__粗体文本__

***粗斜体文本***
___粗斜体文本___

~~删除线文本~~
```

效果：

- *斜体文本*
- **粗体文本**
- ***粗斜体文本***
- ~~删除线文本~~

### 1.4 引用

```markdown
> 这是引用内容
> 可以有多行
>
> 甚至可以分段

>>> 嵌套引用（三层）
```

> 这是引用内容
> 可以有多行

### 1.5 分隔线

```markdown
---
***
___
```

三个或更多的 `-`、`*`、`_` 都可以生成分隔线。

---

## 二、列表

### 2.1 无序列表

```markdown
- 项目一
- 项目二
  - 子项目 2.1
  - 子项目 2.2
- 项目三

* 也可以用星号
+ 或者加号
```

效果：
- 项目一
- 项目二
  - 子项目 2.1
  - 子项目 2.2

### 2.2 有序列表

```markdown
1. 第一步
2. 第二步
3. 第三步
   1. 子步骤 3.1
   2. 子步骤 3.2
```

### 2.3 任务列表（GFM 扩展）

```markdown
- [x] 已完成的任务
- [x] 另一个已完成的任务
- [ ] 待办任务
- [ ] 另一个待办任务
```

效果：
- [x] 已完成的任务
- [ ] 待办任务

---

## 三、代码

### 3.1 行内代码

用反引号包裹：

```markdown
使用 `print("Hello")` 输出文字。
```

效果：使用 `print("Hello")` 输出文字。

### 3.2 代码块

用三个反引号包裹，并可指定语言实现语法高亮：

````markdown
```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for num in fibonacci(10):
    print(num)
```
````

支持的语言标识：`python`、`javascript`、`java`、`c`、`cpp`、`go`、`rust`、`bash`、`sql`、`json`、`yaml`、`html`、`css` 等上百种。

### 3.3 常用代码语言标识

| 语言 | 标识 | 语言 | 标识 |
|------|------|------|------|
| Python | `python` | JavaScript | `javascript` / `js` |
| Java | `java` | C | `c` |
| C++ | `cpp` | Go | `go` |
| Rust | `rust` | Bash | `bash` / `shell` |
| SQL | `sql` | JSON | `json` |
| YAML | `yaml` | HTML | `html` |
| CSS | `css` | XML | `xml` |
| PHP | `php` | Ruby | `ruby` |
| Swift | `swift` | Kotlin | `kotlin` |

---

## 四、链接与图片

### 4.1 链接

```markdown
[链接文字](https://www.example.com)

[带标题的链接](https://www.example.com "鼠标悬停显示的文字")

[引用式链接][1]

[1]: https://www.example.com
```

效果：[因特吧](https://www.inte8.top)

### 4.2 图片

```markdown
![替代文字](/path/to/image.jpg)

![带标题的图片](/path/to/image.jpg "图片标题")

![引用式图片][logo]

[logo]: /medias/logo.png
```

### 4.3 带链接的图片

```markdown
[![图片](image.jpg)](https://www.example.com)
```

---

## 五、表格（GFM 扩展）

```markdown
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 内容1 | 内容2 | 内容3 |
| 较长内容 | 短 | 中等内容 |
```

效果：

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 内容1 | 内容2 | 内容3 |
| 较长内容 | 短 | 中等内容 |

对齐方式：
- `:---` 左对齐（默认）
- `:---:` 居中
- `---:` 右对齐

---

## 六、高级语法

### 6.1 数学公式

行内公式用 `$...$`，块级公式用 `$$...$$`（需 MathJax 支持）：

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

### 6.2 脚注

```markdown
这里有一个脚注[^1]，还有另一个[^2]。

[^1]: 这是第一个脚注的内容。
[^2]: 这是第二个脚注的内容。
```

### 6.3 定义列表

```markdown
术语1
: 定义1的内容

术语2
: 定义2的内容
```

### 6.4 缩写

```markdown
*[HTML]: Hyper Text Markup Language
*[CSS]: Cascading Style Sheets

HTML 和 CSS 是前端基础。
```

---

## 七、HTML 内嵌

Markdown 中可以直接使用 HTML 标签实现更复杂的排版：

### 7.1 文字颜色与大小

```html
<span style="color: red;">红色文字</span>
<span style="color: #42b983; font-size: 20px;">自定义颜色和大小</span>
```

### 7.2 居中

```html
<center>居中的内容</center>
```

### 7.3 折叠内容

```html
<details>
<summary>点击展开</summary>

隐藏的内容在这里。

</details>
```

### 7.4 嵌入视频

```html
<iframe src="//player.bilibili.com/player.html?aid=xxxx" 
  width="100%" height="500" frameborder="0" allowfullscreen>
</iframe>
```

---

## 八、转义字符

如果需要显示 Markdown 语法符号本身，用反斜杠 `\` 转义：

```markdown
\*这不是斜体\*
\# 这不是标题
\[这不是链接\]
```

需要转义的字符：

| 字符 | 名称 | 字符 | 名称 |
|------|------|------|------|
| `\` | 反斜杠 | `` ` `` | 反引号 |
| `*` | 星号 | `_` | 下划线 |
| `{}` | 花括号 | `[]` | 方括号 |
| `()` | 圆括号 | `#` | 井号 |
| `+` | 加号 | `-` | 减号 |
| `.` | 句点 | `!` | 感叹号 |
| `|` | 管道符 | `~` | 波浪号 |

---

## 九、Hexo 博客中的 Markdown

Hexo 博客使用 Markdown 编写文章时，每篇文章开头需要 Front Matter（YAML 格式的元数据）：

```yaml
---
title: 文章标题
date: 2026-05-01 12:00:00
tags:
  - 标签1
  - 标签2
categories: 分类名称

top: 1  # 置顶权重，数字越大越靠前
---

正文从这里开始...
```

### Hexo 特殊标签

```markdown
<!-- 文章摘要截断 -->
<!-- more -->

<!-- 引用文章 -->
{% post_link 文章文件名 显示文字 %}

<!-- 引用资源 -->
{% asset_img 图片名.jpg 图片描述 %}
```

---

## 十、速查表

| 语法 | 效果 | 语法 | 效果 |
|------|------|------|------|
| `**粗体**` | **粗体** | `*斜体*` | *斜体* |
| `~~删除线~~` | ~~删除线~~ | `` `代码` `` | `代码` |
| `# 标题` | H1标题 | `## 标题` | H2标题 |
| `[文字](url)` | 链接 | `![文字](url)` | 图片 |
| `> 引用` | 引用块 | `---` | 分隔线 |
| `- 列表` | 无序列表 | `1. 列表` | 有序列表 |
| `[x]` | 已完成 | `[ ]` | 待办 |
| `[^1]` | 脚注 | `$公式$` | 行内数学 |

---

## 十一、常用工具推荐

| 工具 | 平台 | 特点 |
|------|------|------|
| Typora | Win/Mac/Linux | 所见即所得，最强桌面编辑器 |
| VS Code | Win/Mac/Linux | 插件丰富，程序员首选 |
| Obsidian | Win/Mac/Linux | 知识管理 + 双向链接 |
| Mark Text | Win/Mac/Linux | 开源免费，所见即所得 |
| StackEdit | Web | 在线编辑，支持多平台同步 |
| 小书匠 | Web | 在线编辑，功能全面 |

---

## 总结

Markdown 语法非常简单，核心就是以下几条：

1. `#` 写标题
2. `**粗体**`、`*斜体*`、`~~删除线~~`
3. `-` 无序列表，`1.` 有序列表
4. `>` 引用
5. `` `代码` `` 和 ` ```代码块``` `
6. `[链接](url)` 和 `![图片](url)`
7. `| 表头 | 表头 |` 做表格

掌握这些就能覆盖 90% 的写作场景。更多细节可参考：

- [CommonMark 官方规范](https://commonmark.org/)
- [GitHub Flavored Markdown](https://docs.github.com/zh/get-started/writing-on-github)
- [Markdown 中文教程](https://markdown.com.cn/)

---

*本文写作日期：2026 年 5 月 1 日*
