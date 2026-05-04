---
title: OpenClaw全方位指南
date: 2026-04-30T20:30:00+08:00
tags:
  - OpenClaw
  - AI助手
  - 开源
categories:
  - 前沿技术
---

# OpenClaw 全方位指南 — 你的个人 AI 助手

## 项目简介

**OpenClaw** 是一款开源的个人 AI 助手，GitHub 星标超过 **36.6 万**，由 OpenAI、GitHub、NVIDIA、Vercel 等顶级公司赞助。它运行在你自己的设备上，通过你已经在用的聊天软件与你交互，支持语音唤醒和实时对话，甚至能控制可视化画布（Canvas）。

官网：[openclaw.ai](https://openclaw.ai)
文档：[docs.openclaw.ai](https://docs.openclaw.ai)
GitHub：[github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
技能市场：[clawhub.ai](https://clawhub.ai)

口号：**EXFOLIATE! EXFOLIATE!** 🦞

---

## 一、核心特性

| 特性 | 说明 |
|------|------|
| **本地优先网关** | 单一控制平面管理会话、频道、工具和事件 |
| **25+ 聊天频道** | WhatsApp、Telegram、Slack、Discord、微信、QQ、飞书等 |
| **多智能体路由** | 按频道/账号/对端路由到隔离的 Agent |
| **语音唤醒** | macOS/iOS 唤醒词，Android 持续语音（ElevenLabs + 系统 TTS） |
| **实时画布** | Agent 驱动的可视化工作区（Canvas + A2UI） |
| **一流工具** | 浏览器、画布、节点、Cron 定时任务、会话管理等 |
| **配套 App** | macOS 菜单栏应用 + iOS/Android 节点 |
| **引导式设置** | `openclaw onboard` 一键配置 |

---

## 二、快速安装

### 环境要求

- **Node.js 24**（推荐）或 Node 22.14+
- 一个模型提供商的 API Key（Anthropic / OpenAI / Google 等）

### 一键安装

**macOS / Linux：**

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**Windows（PowerShell）：**

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

**npm 全局安装：**

```bash
npm install -g openclaw@latest
```

### 引导配置

```bash
openclaw onboard --install-daemon
```

向导会引导你完成：
1. 选择模型提供商并设置 API Key
2. 配置网关参数
3. 安装系统守护进程（launchd / systemd）
4. 初始化工作区

### 验证运行

```bash
openclaw gateway status   # 查看网关状态
openclaw dashboard        # 打开控制面板
```

网关默认监听 `127.0.0.1:18789`。

---

## 三、架构设计

OpenClaw 采用 **WebSocket 网关架构**，核心组件：

```
┌─────────────────────────────────────────┐
│            Gateway (守护进程)             │
│   管理 WhatsApp/Telegram/Slack/Discord   │
│   WebSocket API (JSON)                   │
│   Canvas / A2UI 服务                     │
│   Cron 调度器                            │
└────────┬──────────┬──────────┬───────────┘
         │          │          │
    ┌────┴───┐ ┌───┴────┐ ┌──┴───────┐
    │ 客户端  │ │  节点   │ │ WebChat  │
    │ CLI    │ │ iOS     │ │          │
    │ macOS  │ │ Android │ │          │
    │ Web UI │ │ Headless│ │          │
    └────────┘ └─────────┘ └──────────┘
```

- **Gateway**：单一长驻进程，拥有所有消息面。暴露类型化 WebSocket API。
- **客户端**（CLI / macOS App / Web UI）：通过 WS 连接网关，发送请求并订阅事件。
- **节点**（iOS / Android / Headless）：通过 WS 以 `role: node` 连接，暴露画布、摄像头、屏幕等设备能力。

### 通信协议

- 传输层：WebSocket，文本帧 JSON 载荷
- 首帧必须是 `connect`
- 请求/响应模式：`{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
- 事件推送：`{type:"event", event, payload, seq}`

---

## 四、聊天频道

OpenClaw 支持 **25+ 消息平台**，全部通过网关统一管理：

| 平台 | 协议 | 备注 |
|------|------|------|
| WhatsApp | Baileys | QR 码登录 |
| Telegram | grammY Bot API | 支持群组 |
| Discord | Bot API + Gateway | 支持 DM/频道/服务器 |
| Slack | Bolt SDK | 工作区应用 |
| Signal | signal-cli | 隐私优先 |
| 微信 | iLink Bot | 二维码登录，仅私聊 |
| QQ | QQ Bot API | 私聊+群聊+富媒体 |
| 飞书 | WebSocket | 内置插件 |
| iMessage | BlueBubbles | 推荐，全功能支持 |
| Matrix | 内置插件 | 去中心化 |
| Google Chat | HTTP Webhook | 企业支持 |
| Microsoft Teams | Bot Framework | 企业支持 |
| LINE | Messaging API | 内置插件 |
| IRC | 经典 IRC | 频道 + DM |
| 以及 Nostr、Twitch、Synology Chat、Nextcloud Talk 等... |

### DM 安全机制

默认启用 **DM 配对（Pairing）**：未知发送者收到配对码，需要手动审批：

```bash
openclaw pairing approve <channel> <code>
```

---

## 五、Agent 运行时

### 工作区结构

Agent 使用单一工作区目录（`~/.openclaw/workspace`）作为唯一工作目录。核心引导文件：

| 文件 | 作用 |
|------|------|
| `AGENTS.md` | 操作指令 + 记忆 |
| `SOUL.md` | 人格、边界、语气 |
| `TOOLS.md` | 用户维护的工具使用说明 |
| `BOOTSTRAP.md` | 首次运行仪式（完成后可删除） |
| `IDENTITY.md` | Agent 名称/风格/表情 |
| `USER.md` | 用户档案 + 称呼偏好 |

新会话启动时，这些文件自动注入 Agent 上下文。

### 内置工具

| 工具 | 功能 |
|------|------|
| `exec` / `process` | 执行 Shell 命令，管理后台进程 |
| `code_execution` | 沙箱远程 Python 分析 |
| `browser` | 控制 Chromium 浏览器 |
| `web_search` / `web_fetch` | 网页搜索和内容抓取 |
| `message` | 发送消息到任意频道 |
| `canvas` | Agent 驱动的可视化画布 |
| `sessions_*` | 会话列表/历史/发送 |
| `cron` | 定时任务管理 |

### 工具、技能与插件三层体系

1. **Tools**：Agent 调用的类型化函数（exec、browser、web_search 等）
2. **Skills**：Markdown 文件（SKILL.md），注入系统提示词，教 Agent 如何使用工具
3. **Plugins**：打包一切（频道、模型、工具、技能、语音等），可发布到 npm

---

## 六、技能系统（Skills）

技能使用 [AgentSkills](https://agentskills.io) 兼容格式，每个技能是一个包含 `SKILL.md` 的目录。

### 加载优先级（从高到低）

| 优先级 | 来源 | 路径 |
|--------|------|------|
| 1 | 工作区技能 | `<workspace>/skills` |
| 2 | 项目 Agent 技能 | `<workspace>/.agents/skills` |
| 3 | 个人 Agent 技能 | `~/.agents/skills` |
| 4 | 托管/本地技能 | `~/.openclaw/skills` |
| 5 | 内置技能 | 随安装附带 |
| 6 | 额外目录 | `skills.load.extraDirs` |

同名技能以高优先级为准。

### 按需配置

```json5
{
  agents: {
    defaults: {
      skills: ["github", "weather"],
    },
    list: [
      { id: "writer" },                    // 继承默认技能
      { id: "docs", skills: ["docs-search"] }, // 替换为指定技能
      { id: "locked-down", skills: [] },    // 无技能
    ],
  },
}
```

技能市场 [ClawHub](https://clawhub.ai) 提供了 5400+ 已分类的社区技能。

---

## 七、会话管理

消息按来源路由到不同会话：

| 来源 | 会话策略 |
|------|----------|
| 私聊（DM） | 默认共享一个会话 |
| 群聊 | 按群隔离 |
| Cron 任务 | 每次运行独立会话 |
| Webhook | 按 Hook 隔离 |

### DM 隔离

多用户场景下必须启用隔离，防止消息串台：

```json5
{
  session: {
    dmScope: "per-channel-peer",  // 按频道+发送者隔离
  },
}
```

可选值：`main`（默认共享）| `per-peer` | `per-channel-peer`（推荐）| `per-account-channel-peer`

### 会话生命周期

- **每日重置**：默认凌晨 4:00 自动开启新会话
- **空闲重置**：设置 `session.reset.idleMinutes` 超时后新建
- **手动重置**：聊天中输入 `/new` 或 `/reset`

---

## 八、定时任务（Cron）

Cron 是网关内置的调度器，持久化存储任务定义，定时唤醒 Agent。

### 快速上手

```bash
# 一次性提醒
openclaw cron add \
  --name "提醒" \
  --at "2026-05-01T09:00:00+08:00" \
  --session main \
  --system-event "提醒：检查项目进度" \
  --wake now \
  --delete-after-run

# 查看任务
openclaw cron list

# 查看运行历史
openclaw cron runs --id <job-id>
```

### 关键特性

- 任务持久化到 `~/.openclaw/cron/jobs.json`，重启不丢失
- 一次性任务成功后自动删除
- 所有 Cron 执行创建后台任务记录
- 支持将输出发送到聊天频道或 Webhook
- 隔离运行时自动清理浏览器标签和后台进程

---

## 九、节点系统（Nodes）

节点是连接到网关的配套设备（macOS/iOS/Android/Headless），通过 WebSocket 暴露设备能力。

### 设备配对

```bash
# 查看配对请求
openclaw devices list

# 审批
openclaw devices approve <requestId>

# 拒绝
openclaw devices reject <requestId>

# 查看节点状态
openclaw nodes status
```

### 节点能力

| 能力 | 说明 |
|------|------|
| `canvas.*` | Agent 驱动的可视化画布 |
| `camera.*` | 拍照获取视觉上下文 |
| `screen.record` | 屏幕录制 |
| `device.*` | 设备信息与控制 |
| `notifications.*` | 通知管理 |
| `system.*` | 远程命令执行 |
| `location.get` | 获取地理位置 |

### 远程节点

网关运行在一台机器上，但命令可以在另一台机器上执行。网关将 `exec` 调用转发到远程节点主机。

---

## 十、安全模型

### 核心原则

- **默认安全**：工具在宿主机上为 main 会话运行，Agent 拥有完全访问权限（因为是个人使用）
- **群组/频道安全**：设置 `agents.defaults.sandbox.mode: "non-main"` 让非 main 会话在沙箱中运行
- **DM 配对**：未知发送者必须通过配对码验证

### 沙箱机制

默认沙箱后端为 Docker，也支持 SSH 和 OpenShell：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",  // 非 main 会话走沙箱
      },
    },
  },
}
```

典型沙箱策略：允许 bash、read、write、edit；拒绝 browser、canvas、cron、gateway。

### 安全审计

```bash
openclaw doctor          # 检查风险配置
openclaw security audit  # 安全审计
```

---

## 十一、配置指南

配置文件位于 `~/.openclaw/openclaw.json`，使用 **JSON5** 格式（支持注释和尾逗号）。

### 最小配置

```json5
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
  channels: { whatsapp: { allowFrom: ["+86188****1234"] } },
}
```

### 配置方式

| 方式 | 命令 |
|------|------|
| 交互式向导 | `openclaw onboard` 或 `openclaw configure` |
| CLI 单行 | `openclaw config set agents.defaults.heartbeat.every "2h"` |
| 控制面板 | 打开 `http://127.0.0.1:18789` 使用 Config 标签页 |
| 直接编辑 | 编辑 `~/.openclaw/openclaw.json`，网关自动热加载 |

### 模型配置

```json5
{
  agents: {
    defaults: {
      model: "anthropic/claude-sonnet-4",
      // 或使用模型故障转移
      models: {
        primary: "anthropic/claude-sonnet-4",
        fallback: ["openai/gpt-4o", "google/gemini-2.5-pro"],
      },
    },
  },
}
```

---

## 十二、Docker 部署

Docker 部署是可选方案，适合需要容器化隔离或无本地安装的场景。

### 前提

- Docker Desktop / Engine + Docker Compose v2
- 至少 2GB RAM
- 足够磁盘空间

### 部署步骤

```bash
# 克隆仓库
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# 构建并启动（含引导配置）
./scripts/docker/setup.sh

# 或使用预构建镜像
export OPENCLAW_IMAGE="ghcr.io/openclaw/openclaw:latest"
./scripts/docker/setup.sh
```

预构建镜像发布在 [GitHub Container Registry](https://github.com/openclaw/openclaw/pkgs/container/openclaw)，常用标签：`main`、`latest`、版本号。

### 配置频道

```bash
# WhatsApp（QR 码）
docker compose run --rm openclaw-cli channels login

# Telegram
docker compose run --rm openclaw-cli channels add --channel telegram --token "<token>"

# Discord
docker compose run --rm openclaw-cli channels add --channel discord --token "<token>"
```

---

## 十三、聊天命令速查

| 命令 | 说明 |
|------|------|
| `/status` | 查看当前状态 |
| `/new` | 新建会话 |
| `/reset` | 重置会话 |
| `/compact` | 压缩上下文 |
| `/think <level>` | 设置思考深度 |
| `/verbose on/off` | 开关详细输出 |
| `/trace on/off` | 开关追踪 |
| `/usage off/tokens/full` | 用量显示 |
| `/restart` | 重启 Agent |
| `/activation mention/always` | 激活模式 |

---

## 十四、与同类项目对比

| 维度 | OpenClaw | Hermes Agent | ChatGPT |
|------|----------|-------------|---------|
| 部署方式 | 本地/Docker | Docker 容器 | 云端 |
| 消息频道 | 25+ | 10+ | 网页/App |
| 开源 | MIT | 开源 | 闭源 |
| 技能生态 | ClawHub 5400+ | Skills 系统 | GPTs 商店 |
| 语音 | 唤醒词+持续对话 | TTS | 语音模式 |
| 沙箱 | Docker/SSH/OpenShell | Docker | OpenAI 托管 |
| 配置格式 | JSON5 | YAML | 网页设置 |

---

## 总结

OpenClaw 是目前最全面的**本地优先个人 AI 助手**方案：

1. **真正的全平台覆盖**：25+ 消息频道，包含微信、QQ、飞书等国内平台
2. **本地部署，数据自主**：所有数据在本地，不依赖云端
3. **强大的工具生态**：内置浏览器、代码执行、定时任务，加上 5400+ 社区技能
4. **安全可控**：DM 配对、沙箱隔离、安全审计三重保障
5. **多设备协作**：macOS/iOS/Android 节点联动，画布、摄像头、屏幕共享
6. **灵活部署**：支持裸机、Docker、Nix 多种方式

如果你需要一个始终在线、能在任何聊天软件里回复你、还能帮你执行任务的 AI 助手，OpenClaw 是目前最值得尝试的选择。

---

> 参考资料：
> - [OpenClaw GitHub](https://github.com/openclaw/openclaw)
> - [OpenClaw 官方文档](https://docs.openclaw.ai)
> - [ClawHub 技能市场](https://clawhub.ai)
> - [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
