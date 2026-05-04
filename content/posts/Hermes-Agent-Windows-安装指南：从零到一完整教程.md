---
title: Hermes Agent Windows 安装指南：从零到一完整教程
date: 2026-05-03T00:53:00+08:00
tags:
  - Hermes
  - 教程
categories:
  - 技术教程
---

## 前言

Hermes Agent 是一个强大的 AI 助手框架，但官方明确表示不支持原生 Windows 环境。本文记录了一套在 Windows 10/11 上成功安装的完整流程，所有步骤都已实际验证。

**适用系统**：Windows 10 (版本 1809+) / Windows 11
**预计耗时**：20-30 分钟（取决于网络速度）

## 目录

- 安装前准备
- 安装 WSL 核心组件
- 安装 Ubuntu 发行版
- 安装 Hermes Agent
- 配置 API Key
- 常见问题与解决方案

---

## 一、安装前准备

### 1.1 系统要求检查

以管理员身份打开 PowerShell，执行以下命令查看系统版本：

```powershell
winver
```

确保版本号不低于 **Windows 10 版本 2004（内部版本 19041）**。

### 1.2 开启必要的 Windows 功能

在管理员 PowerShell 中按顺序执行：

```powershell
# 开启 Windows 子系统 Linux
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 开启虚拟机平台
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

执行后**重启电脑**。

---

## 二、安装 WSL 核心组件

### 方法一：自动安装（推荐）

重启后，以管理员身份打开 PowerShell：

```powershell
wsl --install
```

### 方法二：手动安装（如果方法一失败）

如果提示"用法"错误，说明系统版本较旧，采用手动方式：

1. 访问 WSL GitHub 发布页面：https://github.com/microsoft/WSL/releases
2. 下载最新的 `wsl.x.x.x.x64.msi` 安装包
3. 双击运行，按提示完成安装

### 验证安装

```powershell
wsl --version
```

正常输出应显示 WSL 版本信息，如 `WSL 版本： 2.x.x.x`。

---

## 三、安装 Ubuntu 发行版

### 方法一：命令行安装

```powershell
wsl --install -d Ubuntu
```

如果遇到超时错误（`Wsl/InstallDistro/WININET_E_TIMEOUT`），说明网络请求 GitHub 超时，请使用方法二或三。

### 方法二：Microsoft Store 安装

1. 打开 Microsoft Store
2. 搜索 **Ubuntu**
3. 选择 Ubuntu 22.04 LTS 或 Ubuntu 24.04 LTS
4. 点击"安装"

**如果 Store 打不开或一直转圈**：

- 按 `Win + R`，输入 `wsreset.exe` 并回车，等待自动完成
- 在 PowerShell 中执行：`Get-AppxPackage *store* | Reset-AppxPackage`

### 方法三：离线包安装（最稳定）

1. 访问 Ubuntu 官方发布页面：https://releases.ubuntu.com/noble/
2. 下载后缀为 `.wsl` 的文件（如 `ubuntu-24.04.3-wsl-amd64.wsl`）
3. 直接双击该文件，WSL 会自动完成安装

### 初始化 Ubuntu

安装完成后，Ubuntu 终端会自动打开。按提示设置：

```text
Enter new UNIX username: hermes
New password: [输入密码，屏幕不显示]
Retype new password: [再次输入]
```

> 注意：Linux 下输入密码时不会显示任何字符，这是正常的安全特性。

设置成功后，你会看到 `hermes@your-pc:~$` 的提示符。

---

## 四、安装 Hermes Agent

### 步骤 1：更新 Ubuntu 软件源

在 Ubuntu 终端中执行：

```bash
sudo apt update
sudo apt install python3 python3-pip curl wget git -y
```

### 步骤 2：运行官方安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 步骤 3：加载环境变量

```bash
source ~/.bashrc
```

### 步骤 4：验证安装

```bash
hermes doctor
```

正常输出应显示各项依赖检查通过：

```text
✓ Python 3.11.9
✓ pip 24.0
✓ Node.js v20.x
...
```

如果提示"未检测到 API Key"，这是正常的，下一步配置即可。

---

## 五、配置 API Key

### 运行配置向导

```bash
hermes setup
```

### 选择模型提供商

配置向导会询问你选择哪个模型供应商（Provider）：

| 选项 | 说明 | 适合人群 |
|------|------|---------|
| OpenRouter | 聚合平台，一个 Key 可用多种模型 | 推荐新手 |
| DeepSeek | 国产模型，性价比高 | 国内用户 |
| OpenAI | GPT 系列 | 有直接订阅的用户 |
| Anthropic | Claude 系列 | 有直接订阅的用户 |
| Ollama | 本地运行，无需 API Key | 有 GPU、注重隐私的用户 |

### 获取 API Key

**使用 DeepSeek（推荐国内用户）**

1. 访问 https://platform.deepseek.com/
2. 注册账号
3. 进入"API Keys"页面
4. 点击"创建 API Key"
5. 复制保存

**使用 OpenRouter（推荐尝鲜多模型）**

1. 访问 https://openrouter.ai/
2. 注册账号
3. 进入"Keys"页面
4. 点击"Create Key"
5. 充值少量金额即可使用

### 完成配置

在 `hermes setup` 向导中：

1. 选择对应的 Provider
2. 粘贴 API Key
3. 选择默认模型（如 `deepseek-chat` 或 `gpt-3.5-turbo`）

### 启动 Hermes

```bash
hermes
```

看到欢迎界面，说明安装成功！

---

## 六、常见问题与解决方案

### Q1: `wsl --install` 只显示帮助信息，不安装

**原因**：Windows 版本过旧，不支持该简化命令。

**解决**：下载 GitHub 上的 `.msi` 安装包手动安装，或使用离线 `.wsl` 文件方式。

### Q2: 安装 Ubuntu 时提示 WININET_E_TIMEOUT

**原因**：国内网络访问 `raw.githubusercontent.com` 超时。

**解决**：改用 Microsoft Store 或离线 `.wsl` 文件安装。

### Q3: Microsoft Store 打开一直转圈

**解决步骤**：

1. 按 `Win + R`，输入 `wsreset.exe`，回车等待
2. 打开"Internet 选项" → "高级" → 确保 TLS 1.0/1.1/1.2/1.3 全部勾选
3. 设置 → 应用 → Microsoft Store → 高级选项 → 点击"修复"

### Q4: Ubuntu 终端打开后是黑屏或无响应

**解决**：

```powershell
# 在 PowerShell 中执行
wsl --shutdown
wsl
```

### Q5: `hermes` 命令找不到

**解决**：

```bash
# 重新加载环境变量
source ~/.bashrc

# 或手动添加 PATH
export PATH="$PATH:~/.local/bin"
```

### Q6: 模型名称显示为空

**解决**：在 Hermes 对话界面中输入 `/model` 命令，手动选择或输入模型名称。

### Q7: Docker 方案安装慢

**加速方法**：配置 Docker 镜像加速器，或使用国内镜像地址：

```text
docker.xuanyuan.run/nousresearch/hermes-agent
```

---

## 结语

以上就是 Hermes Agent 在 Windows 上的完整安装流程。虽然步骤稍多，但按文档操作应该能顺利完成。

如果遇到本文未覆盖的问题，欢迎在评论区留言交流。

### 快速命令汇总（复制可用）

```bash
# Ubuntu 终端中执行
sudo apt update && sudo apt install python3 python3-pip curl wget git -y
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
hermes setup
hermes
```

祝你使用愉快！
