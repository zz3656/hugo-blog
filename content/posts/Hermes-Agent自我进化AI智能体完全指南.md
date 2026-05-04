---
title: Hermes Agent：能自我进化的AI智能体完全指南
date: 2026-04-30T06:00:00+08:00
tags:
  - AI
  - Hermes
  - 智能体
categories:
  - 编程开发
top: 1
---

## 什么是 Hermes Agent？

Hermes Agent 是由 Nous Research 开发的一款**自我改进型 AI 智能体**。它不仅仅是一个聊天机器人，而是一个能够从经验中学习、积累技能、跨会话记忆，并通过消息平台随时随地为你服务的全能型 AI 助手。

与传统 AI 助手最大的不同在于：Hermes 具备内置的学习循环。每次完成任务后，它会自动总结经验，将有效的解决方案保存为可复用的"技能"，将重要信息存入持久化"记忆"。这意味着它用得越久，能力越强。

### 核心特性一览

- **自我学习**：从每次任务中总结经验，自动生成可复用技能
- **跨会话记忆**：持久化存储用户偏好、环境信息和工作上下文
- **全平台消息网关**：支持 Telegram、Discord、Slack、WhatsApp、Signal、Matrix、微信、飞书等
- **7种终端后端**：本地 Shell、Docker、SSH、Modal、Daytona、Vercel Sandbox、Singularity
- **20+ LLM 提供商**：Nous Portal、OpenRouter、Anthropic、OpenAI、智谱GLM、Kimi、MiniMax 等
- **定时任务（Cron）**：支持自然语言描述的定时执行
- **多智能体协作**：子任务委派和并行执行
- **MCP 协议支持**：原生集成 Model Context Protocol
- **深度安全模型**：7层纵深防御，危险命令分级审批

---

## 快速安装

### 一键安装（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装脚本会自动检测系统环境，安装 Python 3.10+、创建虚拟环境、下载 Hermes Agent 并完成初始配置。

### 手动安装

```bash
# 克隆仓库
git clone https://github.com/nousresearch/hermes-agent.git
cd hermes-agent

# 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动
python run_agent.py
```

### Docker 部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  hermes:
    image: ghcr.io/nousresearch/hermes-agent:latest
    volumes:
      - ./hermes-data:/root/.hermes
    ports:
      - "8080:8080"
    environment:
      - HERMES_LLM_PROVIDER=openrouter
      - OPENROUTER_API_KEY=your-key-here
```

启动：`docker compose up -d`

### Termux（Android）

在安卓手机上也能运行 Hermes：

```bash
# 安装 Termux（从 F-Droid）
pkg install python git
git clone https://github.com/nousresearch/hermes-agent.git
cd hermes-agent
pip install -r requirements.txt
python run_agent.py
```

---

## 配置详解

Hermes 的配置文件位于 `~/.hermes/` 目录下：

```
~/.hermes/
├── config.yaml      # 主配置文件
├── .env             # 环境变量（API密钥等）
├── SOUL.md          # 人格定义文件
├── memories/        # 持久化记忆
├── skills/          # 技能库
└── agents/          # 智能体定义
```

### config.yaml 核心配置

```yaml
# LLM 提供商配置
llm:
  provider: openrouter           # 提供商名称
  model: anthropic/claude-sonnet-4  # 模型名称
  api_key: ${OPENROUTER_API_KEY}    # API密钥（推荐用环境变量）

# 消息网关配置
telegram:
  enabled: true
  bot_token: ${TELEGRAM_BOT_TOKEN}

discord:
  enabled: true
  bot_token: ${DISCORD_BOT_TOKEN}

# 安全配置
security:
  command_approval: smart    # manual / smart / off
  blocked_commands:
    - rm -rf /
    - mkfs

# 工具集配置
tools:
  enabled:
    - terminal
    - browser
    - web
    - file
    - cron
```

### 支持的 LLM 提供商

Hermes 支持 20+ 种 LLM 后端，部分列举如下：

| 提供商 | 配置值 | 说明 |
|--------|--------|------|
| Nous Portal | `nous` | Nous Research 官方平台 |
| OpenRouter | `openrouter` | 聚合多模型的路由平台 |
| Anthropic | `anthropic` | Claude 系列模型 |
| OpenAI | `openai` | GPT 系列模型 |
| 智谱 AI | `zai` | GLM 系列国产模型 |
| Moonshot | `moonshot` | Kimi 模型 |
| MiniMax | `minimax` | MiniMax 国产模型 |
| 本地 Ollama | `ollama` | 本地部署的开源模型 |
| 自定义 | `custom` | 兼容 OpenAI API 的自定义端点 |

### 环境变量（.env）

```bash
# LLM API 密钥
OPENROUTER_API_KEY=sk-or-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# 消息平台令牌
TELEGRAM_BOT_TOKEN=123456:ABC...
DISCORD_BOT_TOKEN=MTIz...

# 可选：HTTP 代理
HTTPS_PROXY=http://proxy:7890
```

---

## CLI 命令速查

启动交互式对话：

```bash
hermes                    # 使用默认配置启动
hermes --model gpt-4o     # 指定模型
hermes --provider anthropic  # 指定提供商
```

常用命令行参数：

```
hermes [选项]

选项:
  -m, --model MODEL        指定 LLM 模型
  -p, --provider PROVIDER  指定 LLM 提供商
  --no-memory              禁用记忆加载
  --no-skills              禁用技能加载
  --workdir DIR            设置工作目录
  --config FILE            指定配置文件路径
  --debug                  启用调试模式
```

在对话中，你可以直接用自然语言下达指令，Hermes 会自动选择合适的工具来执行。

---

## 消息网关：全平台接入

Hermes 最强大的功能之一是**消息网关**——让你可以通过常用的聊天工具与 AI 交互。

### 支持的平台

- **Telegram**：通过 Bot 接入，支持群组、私聊、话题分区
- **Discord**：服务器集成，支持频道和线程
- **Slack**：工作空间集成
- **WhatsApp**：通过扫码配对
- **Signal**：端到端加密通信
- **Matrix**：去中心化协议支持
- **微信**：通过 Web 协议桥接
- **飞书**：企业级协作集成
- **SMS**：短信接口

### Telegram 接入示例

1. 通过 @BotFather 创建 Bot，获取 Token
2. 在 `config.yaml` 中配置：

```yaml
telegram:
  enabled: true
  bot_token: ${TELEGRAM_BOT_TOKEN}
  allowed_users:
    - your_telegram_id
```

3. 启动 Hermes，Bot 即上线

### Discord 接入示例

1. 在 Discord Developer Portal 创建 Bot
2. 邀请 Bot 到服务器（需要 Send Messages 权限）
3. 配置：

```yaml
discord:
  enabled: true
  bot_token: ${DISCORD_BOT_TOKEN}
  allowed_channels:
    - "#bot-home"
```

---

## 工具系统（Tools）

Hermes 内置了丰富的工具集，每个工具专门处理一类任务：

### 核心工具集

| 工具集 | 说明 | 典型用途 |
|--------|------|----------|
| `terminal` | Shell 命令执行 | 系统管理、脚本运行、包安装 |
| `browser` | 浏览器自动化 | 网页交互、截图、表单填写 |
| `web` | 网络搜索和抓取 | 信息检索、API 调用 |
| `file` | 文件读写操作 | 配置管理、日志分析 |
| `cron` | 定时任务管理 | 定期巡检、自动化报告 |
| `search` | 会话历史搜索 | 回溯过去的工作 |
| `vision` | 图像分析 | 截图理解、图片识别 |
| `tts` | 文本转语音 | 语音消息回复 |

### 终端后端（7种）

Hermes 的终端工具支持多种执行环境：

- **Local**：本地 Shell，最直接
- **Docker**：容器化隔离执行
- **SSH**：远程服务器操作
- **Modal**：云端无服务器执行
- **Daytona**：开发环境管理
- **Vercel Sandbox**：前端沙箱环境
- **Singularity**：HPC 环境支持

### 工具限制与安全

每个工具调用都有内置的安全机制：

```yaml
security:
  command_approval: smart    # smart 模式：智能判断是否需要审批
```

- `manual`：所有危险命令都需手动确认
- `smart`：AI 智能判断风险等级，高危操作才需确认
- `off`：关闭审批（不推荐，仅限受控环境）

---

## 技能系统（Skills）

技能是 Hermes 最独特的功能——它可以从经验中学习并保存为可复用的操作手册。

### 技能如何工作

每个技能是一个 Markdown 文件（`SKILL.md`），包含：

```markdown
---
name: my-skill
description: 技能描述
version: 1.0
tags: [devops, python]
---

# 技能名称

## 触发条件
什么时候使用这个技能...

## 步骤
1. 第一步：执行命令 X
2. 第二步：检查输出 Y
3. 第三步：如果失败则...

## 注意事项
- 常见坑点 A
- 必须满足的前提条件 B

## 验证
如何确认任务成功完成...
```

### 技能管理命令

```
# 列出所有技能
/skills

# 查看技能详情
/skill view <name>

# 创建新技能
/skill create <name>

# 更新技能
/skill patch <name>

# 删除技能
/skill delete <name>
```

### 技能自动进化

当你完成一个复杂任务后，Hermes 会主动询问是否将解决方案保存为技能。下次遇到类似任务时，它会自动加载并复用，避免重复犯错。

技能遵循 [agentskills.io](https://agentskills.io) 开放标准，支持渐进式信息披露。

---

## 记忆系统（Memory）

Hermes 拥有两套持久化记忆：

### 系统记忆（MEMORY.md）

存储环境事实、工具特性、项目约定等信息：

```
当前环境: Ubuntu 22.04, Python 3.13.5
项目路径: /opt/data/home/my-blog
博客使用 Hexo + Matery 主题
GitHub 仓库: zz3656/zz3656.github.io
```

### 用户档案（USER.md）

存储用户偏好和沟通习惯：

```
用户使用中文沟通
偏好简洁的回复，不需要过多追问
项目使用 pytest 测试框架
```

记忆会在每次对话开始时自动加载，确保 Hermes 始终了解你的上下文。你可以随时通过对话来更新记忆。

---

## 定时任务（Cron）

用自然语言创建定时任务：

```
# 每天早上 9 点发送天气预报
"每天早上9点查一下北京天气发给我"

# 每 2 小时检查服务器状态
"每隔2小时检查一次服务器负载"

# 每周一生成项目周报
"每周一生成上周的项目总结"
```

Cron 配置也支持标准 crontab 表达式：

```yaml
# config.yaml 中的 cron 配置
cron:
  timezone: Asia/Shanghai
  max_concurrent: 3
```

管理命令：

```
/cron list           # 查看所有任务
/cron pause <id>     # 暂停任务
/cron resume <id>    # 恢复任务
/cron remove <id>    # 删除任务
/cron run <id>       # 手动触发
```

---

## 上下文文件（Context Files）

Hermes 支持通过项目级上下文文件来理解你的代码库：

- **AGENTS.md**：项目级指令，定义项目规范和工作流程
- **CLAUDE.md**：兼容 Claude Code 的指令格式
- **.cursorrules**：兼容 Cursor 编辑器的规则文件

将这些文件放在项目根目录，Hermes 在 `--workdir` 模式下会自动读取：

```bash
hermes --workdir /path/to/project
```

这样 Hermes 就能理解项目结构、编码规范、测试要求等上下文信息。

---

## 多智能体协作（Delegation）

Hermes 支持将复杂任务拆分给子智能体并行处理：

### 工作模式

- **单任务模式**：提供一个目标，子智能体独立完成
- **批量模式**：提供多个任务，最多并行执行 N 个子智能体

### 示例场景

```
"帮我同时做三件事：
1. 研究 Kubernetes 最新版本特性
2. 分析这个日志文件中的错误
3. 给项目写一个 README"
```

Hermes 会为每个任务启动独立的子智能体，各自拥有独立的终端和工具集，最终汇总结果。

### 编排模式

- **Leaf（叶子节点）**：只能执行任务，不能再委派
- **Orchestrator（编排者）**：可以再生成子智能体，实现多级委派

---

## MCP 协议支持

Hermes 原生集成 Model Context Protocol (MCP)，可以连接外部工具服务器：

```yaml
# config.yaml
mcp:
  servers:
    - name: filesystem
      command: npx
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    
    - name: database
      command: npx
      args: ["-y", "@modelcontextprotocol/server-sqlite", "db.sqlite"]
```

配置后，MCP 服务器提供的工具会自动出现在 Hermes 的工具列表中，无需额外代码。

---

## 安全模型

Hermes 采用 **7 层纵深防御** 安全模型：

1. **输入验证**：过滤恶意指令和注入攻击
2. **工具权限控制**：每个工具的访问范围可配置
3. **命令审批**：危险终端命令需要用户确认
4. **文件系统隔离**：限制可访问的目录范围
5. **网络安全**：控制出站网络请求
6. **资源限制**：防止无限循环和资源耗尽
7. **审计日志**：所有操作都有完整日志记录

### 命令审批模式

```yaml
security:
  command_approval: smart  # 推荐
```

- **manual**：所有命令都需要用户确认——最安全但最慢
- **smart**：AI 判断风险等级，低风险自动执行，高风险需确认
- **off**：关闭审批——仅限完全受信的隔离环境

---

## 常见问题（FAQ）

### Q: Hermes 支持哪些操作系统？

A: 支持所有主流平台——Linux、macOS、Windows（WSL 推荐）、Android（Termux）。

### Q: 需要多少 API 费用？

A: 取决于使用的模型和调用量。推荐使用 OpenRouter 来灵活切换模型并控制成本。基础使用每天约 $0.1-$1。

### Q: 数据存在本地还是云端？

A: 所有数据（记忆、技能、配置）都存储在本地 `~/.hermes/` 目录。你可以完全掌控自己的数据。

### Q: 如何备份和迁移？

A: 只需备份 `~/.hermes/` 目录，在新机器上恢复即可。

### Q: 可以同时连接多个消息平台吗？

A: 可以。Telegram + Discord + Slack 同时运行完全没问题。

### Q: 如何更新 Hermes？

A: 运行安装脚本即可自动更新，或在 git 仓库中 `git pull && pip install -r requirements.txt`。

---

## 总结

Hermes Agent 不是一个普通的 AI 聊天工具，而是一个**持续进化的 AI 工作伙伴**。它的自我学习能力让它越用越好用，全平台消息网关让你随时随地都能与它交互，丰富的工具集和插件生态覆盖了从开发运维到日常办公的各种场景。

无论你是开发者需要自动化工作流，还是技术爱好者想要一个全能助手，Hermes Agent 都值得一试。

**项目地址**：https://github.com/nousresearch/hermes-agent
**官方文档**：https://hermes-agent.nousresearch.com
