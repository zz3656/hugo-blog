---
title: exo：将多台设备组成AI推理集群的完整指南
date: 2026-05-03T05:35:00+08:00
tags:
  - exo
  - AI集群
  - 分布式推理
categories:
  - 前沿技术
---

## 什么是 exo？

exo 是一个由 [exo labs](https://x.com/exolabs) 维护的开源项目（Apache 2.0 协议），它的核心理念非常简单但强大：**把你所有的设备连接起来，组成一个统一的 AI 推理集群**。

不管你手上有 MacBook、Linux 服务器、还是其他设备，只要装上 exo，它们就能自动发现彼此，协同运行大语言模型。这意味着你可以运行单个设备放不下的大模型——比如用 4 台 Mac Studio 跑 671B 参数的 DeepSeek v3.1。

项目地址：[https://github.com/exo-explore/exo](https://github.com/exo-explore/exo)

## 核心特性

### 1. 自动设备发现

运行 exo 的设备会自动在局域网内发现彼此，无需任何手动配置。你不需要写配置文件，不需要指定 IP 地址，启动就能用。

### 2. Thunderbolt RDMA 支持

exo 是首个支持 Thunderbolt 5 RDMA（远程直接内存访问）的 AI 推理框架。通过 Thunderbolt 5 连接设备，可以将设备间延迟降低 99%。这意味着添加更多设备不仅增加了显存，还真正加快了推理速度。

### 3. 拓扑感知的自动并行

exo 会实时分析你的设备拓扑——每台设备的算力、内存，以及设备间的网络延迟和带宽——然后自动决定如何最优地拆分模型。你不需要手动配置流水线并行还是张量并行，exo 帮你搞定。

### 4. 张量并行（Tensor Parallelism）

支持将模型张量切分到多台设备上并行计算。实测效果：
- 2 台设备：最高 1.8 倍加速
- 4 台设备：最高 3.2 倍加速

### 5. 多种 API 兼容

exo 同时兼容以下 API 格式，可以直接对接你现有的工具：
- OpenAI Chat Completions API
- Claude Messages API
- OpenAI Responses API
- Ollama API

### 6. 内置 Web 仪表盘

提供图形化的集群管理界面，可以查看集群状态、加载模型、进行对话测试。

## 实测性能

以下是 Jeff Geerling 使用 4 台 M3 Ultra Mac Studio（每台 512GB 统一内存）的测试结果：

| 模型 | 精度 | 总参数 | 配置 |
|------|------|--------|------|
| Qwen3-235B | 8-bit | 235B | 4×M3 Ultra + RDMA |
| DeepSeek v3.1 | 8-bit | 671B | 4×M3 Ultra + RDMA |
| Kimi K2 Thinking | 4-bit | - | 4×M3 Ultra + RDMA |

4 台 Mac Studio 总计拥有约 2TB 的统一内存，足以加载和运行这些超大模型。

## 安装部署

### macOS 安装（从源码）

**前置条件：**

1. 安装 Xcode（提供 MLX 编译所需的 Metal 工具链）
2. 安装 Homebrew：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
3. 安装 uv 和 Node.js：
```bash
brew install uv node
```
4. 安装 Rust nightly：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup toolchain install nightly
```
5. 安装 macmon（Apple Silicon 硬件监控）：
```bash
cargo install --git https://github.com/vladkens/macmon \
  --rev a1cd06b6cc0d5e61db24fd8832e74cd992097a7d \
  macmon --force
```

**克隆并运行：**
```bash
git clone https://github.com/exo-explore/exo
cd exo/dashboard && npm install && npm run build && cd ..
uv run exo
```

启动后访问 `http://localhost:52415/` 即可打开仪表盘。

> 如果你使用 Nix，可以直接运行 `nix run .#exo`，跳过大部分安装步骤。

### macOS App 方式

如果你不想折腾命令行，exo 还提供了 macOS 桌面应用，会在后台运行。

- 下载地址：[EXO-latest.dmg](https://assets.exolabs.net/EXO-latest.dmg)
- 系统要求：macOS Tahoe 26.2 或更高版本
- 首次运行会请求系统权限和网络配置

卸载方法：点击菜单栏图标 → Advanced → Uninstall。

### Linux 安装

**前置条件：**
- uv（Python 依赖管理）
- Node.js 18+（构建仪表盘）
- Rust nightly（编译 Rust 绑定）

**Ubuntu/Debian 安装依赖：**
```bash
sudo apt update
sudo apt install nodejs npm

# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup toolchain install nightly
```

**克隆并运行：**
```bash
git clone https://github.com/exo-explore/exo
cd exo/dashboard && npm install && npm run build && cd ..
uv run exo
```

**重要提示：** 目前 exo 在 Linux 上仅支持 CPU 推理，GPU 支持正在开发中。

Linux 上的文件存放位置遵循 XDG 规范：
- 配置文件：`~/.config/exo/`
- 数据文件：`~/.local/share/exo/`
- 缓存文件：`~/.cache/exo/`
- 日志文件：`~/.cache/exo/exo_log/`

## 启用 RDMA（Thunderbolt 5）

RDMA 是 exo 的杀手级特性，但需要在 macOS 中手动开启。操作步骤：

1. 关机
2. 长按电源键 10 秒，进入启动菜单
3. 选择 "Options" 进入恢复模式
4. 在恢复模式的终端中执行：
```
rdma_ctl enable
```
5. 重启

**注意事项：**
- RDMA 集群中的每台设备都必须与所有其他设备直连
- 必须使用支持 Thunderbolt 5 的线缆
- Mac Studio 上不能使用网口旁边的 Thunderbolt 5 端口
- 从源码运行时，使用 `tmp/set_rdma_network_config.sh` 配置网络
- 所有设备的 macOS 版本必须完全一致（包括 beta 版本号）

## 环境变量配置

exo 支持通过环境变量进行灵活配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `EXO_DEFAULT_MODELS_DIR` | 模型下载和缓存的默认目录 | `~/.local/share/exo/models`（Linux）<br>`~/.exo/models`（macOS） |
| `EXO_MODELS_DIRS` | 额外的可写模型目录（冒号分隔） | 无 |
| `EXO_MODELS_READ_ONLY_DIRS` | 只读模型目录（如 NFS 挂载） | 无 |
| `EXO_OFFLINE` | 离线模式，仅使用本地模型 | `false` |
| `EXO_ENABLE_IMAGE_MODELS` | 启用图像模型支持 | `false` |
| `EXO_LIBP2P_NAMESPACE` | 自定义集群命名空间（用于隔离） | 无 |
| `EXO_FAST_SYNCH` | 控制 MLX_METAL_FAST_SYNCH 行为 | 自动 |

**使用示例：**
```bash
# 使用 NFS 上的预下载模型（只读）
EXO_MODELS_READ_ONLY_DIRS=/mnt/nfs/models:/opt/ai-models uv run exo

# 下载模型到外置 SSD
EXO_MODELS_DIRS=/Volumes/ExternalSSD/exo-models uv run exo

# 离线模式
EXO_OFFLINE=true uv run exo

# 启用图像模型
EXO_ENABLE_IMAGE_MODELS=true uv run exo

# 使用自定义命名空间隔离集群
EXO_LIBP2P_NAMESPACE=my-dev-cluster uv run exo
```

## API 使用方法

exo 启动后在 `http://localhost:52415` 提供服务。以下是完整的使用流程：

### 第一步：预览模型部署方案

```bash
curl "http://localhost:52415/instance/previews?model_id=llama-3.2-1b"
```

返回所有可行的部署方案，包括分片策略、所需内存等：
```json
{
  "previews": [
    {
      "model_id": "mlx-community/Llama-3.2-1B-Instruct-4bit",
      "sharding": "Pipeline",
      "instance_meta": "MlxRing",
      "memory_delta_by_node": {"local": 729808896}
    }
  ]
}
```

### 第二步：创建模型实例

```bash
curl -X POST http://localhost:52415/instance \
  -H 'Content-Type: application/json' \
  -d '{"instance": {...}}'
```

### 第三步：发送推理请求

**OpenAI 格式：**
```bash
curl -N -X POST http://localhost:52415/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "mlx-community/Llama-3.2-1B-Instruct-4bit",
    "messages": [
      {"role": "user", "content": "什么是 Llama 3.2 1B？"}
    ],
    "stream": true
  }'
```

**Claude 格式：**
```bash
curl -N -X POST http://localhost:52415/v1/messages \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "mlx-community/Llama-3.2-1B-Instruct-4bit",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "max_tokens": 1024,
    "stream": true
  }'
```

**Ollama 格式（兼容 OpenWebUI 等工具）：**
```bash
curl -X POST http://localhost:52415/ollama/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "mlx-community/Llama-3.2-1B-Instruct-4bit",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "stream": false
  }'
```

### 第四步：删除模型实例

```bash
curl -X DELETE http://localhost:52415/instance/YOUR_INSTANCE_ID
```

### 加载自定义模型

支持从 HuggingFace 加载任意模型：
```bash
curl -X POST http://localhost:52415/models/add \
  -H 'Content-Type: application/json' \
  -d '{"model_id": "mlx-community/my-custom-model"}'
```

### 其他有用的 API 端点

- 列出所有模型：`curl http://localhost:52415/models`
- 仅列出已下载模型：`curl http://localhost:52415/models?status=downloaded`
- 搜索 HuggingFace：`curl "http://localhost:52415/models/search?query=llama&limit=10"`
- 查看实例状态：`curl http://localhost:52415/state`

## 性能基准测试

exo 内置了 `exo-bench` 工具用于性能测试：

```bash
uv run bench/exo_bench.py \
  --model Llama-3.2-1B-Instruct-4bit \
  --pp 128,256,512 \
  --tg 128,256
```

**主要参数：**
- `--model`：要测试的模型
- `--pp`：Prompt 长度提示（逗号分隔）
- `--tg`：生成长度（逗号分隔）
- `--max-nodes`：限制使用节点数（默认 4）
- `--sharding`：分片方式过滤（`pipeline`/`tensor`/`both`）
- `--repeat`：每个配置重复次数（默认 1）

输出包括 Prompt Tokens/s、生成 Tokens/s 和峰值内存使用量。

## 典型使用场景

**场景一：个人开发者**
一台 MacBook Pro + 一台 Mac Mini，通过 Thunderbolt 连接，可以运行 70B 级别的量化模型，速度比单机快近一倍。

**场景二：小型团队**
4 台 Mac Studio 组成集群，拥有 2TB 统一内存，足以运行 DeepSeek v3.1（671B）等超大模型，完全本地化，无需云服务费用。

**场景三：混合环境**
几台不同型号的 Mac/Linux 机器在同一网络中，exo 自动发现并合理分配模型分片，充分利用每台设备的算力。

## 总结

exo 的出现让"家庭/小团队 AI 集群"成为现实。它的核心优势在于：

1. **零配置**：设备自动发现，开箱即用
2. **高性能**：Thunderbolt RDMA 将设备间延迟降到微秒级
3. **智能调度**：自动分析拓扑，选择最优并行策略
4. **广泛兼容**：支持 OpenAI/Claude/Ollama 等多种 API
5. **完全开源**：Apache 2.0 协议，可自由使用和修改

如果你手边有多台 Mac 或 Linux 机器，强烈推荐尝试 exo——几行命令就能将它们变成一个强大的 AI 推理集群。
