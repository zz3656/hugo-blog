---
title: Multipass 使用完全指南：本地 Ubuntu 虚拟化管理利器
date: 2026-04-30T05:30:00+08:00
tags:
  - Multipass
  - Ubuntu
  - 虚拟机
categories:
  - 技术教程
---

## 什么是 Multipass

Multipass 是由 Canonical（Ubuntu 母公司）开发的一款轻量级虚拟机管理工具，可以在 Linux、macOS 和 Windows 上快速创建和管理 cloud 风格的 Ubuntu 虚拟机（称为「实例」）。它提供了一个简洁而强大的命令行界面（CLI），让你能够在几秒钟内获得一个 Ubuntu 命令行环境，或者在本地构建一个迷你云。

Multipass 适合以下场景：

- 快速获得一个 Ubuntu Shell 环境
- 本地开发与测试云部署方案
- 构建多实例或基于容器的云应用原型
- 在 Mac 或 Windows 上获得原生 Ubuntu 命令行
- 安全的沙盒环境，尝试新事物而不影响宿主机

---

## 一、安装 Multipass

### Linux

Multipass 在 Linux 上以 Snap 包形式发布。Ubuntu 系统默认已包含 snapd，直接运行：

```bash
sudo snap install multipass
```

安装开发版：

```bash
sudo snap install multipass --edge
```

安装完成后，确认当前用户属于 Multipass socket 的读写组：

```bash
ls -l /var/snap/multipass/common/multipass_socket
groups | grep sudo
```

> 系统要求：需要安装 snapd。Ubuntu 默认已包含，其他发行版请参考 snapd 安装文档。

### macOS

macOS 上默认使用 QEMU 后端（封装了 Apple 的 Hypervisor 框架）。

- 系统要求：macOS 13.3 Ventura 及以上
- 支持 M 系列芯片和 Intel 芯片

通过 Homebrew 安装：

```bash
brew install --cask multipass
```

### Windows

Windows 上支持 Hyper-V 和 VirtualBox 两种后端。

- Hyper-V 需要 Windows 10 Pro/Enterprise 1803 及以上版本
- 也可以使用 VirtualBox 作为虚拟化提供者

从 [Multipass 官网](https://multipass.run/) 下载安装包即可。

---

## 二、镜像管理

### 查看可用镜像

使用 `find` 命令列出所有可用的镜像：

```bash
multipass find
```

输出示例：

```
Image                       Aliases           Version          Description
core                        core16            20200818         Ubuntu Core 16
core18                                        20211124         Ubuntu Core 18
20.04                       focal             20240129.1       Ubuntu 20.04 LTS
22.04                       jammy,lts         20240126         Ubuntu 22.04 LTS
24.04                       noble             20240129         Ubuntu 24.04 LTS
```

强制刷新镜像列表：

```bash
multipass find --force-update
```

搜索特定镜像：

```bash
multipass find 22
```

### 镜像别名说明

| 别名 | 含义 |
|------|------|
| `default` | 该远程仓库的默认镜像 |
| `lts` | 最新的长期支持版本 |
| `devel` | 最新的开发版本（仅在 `daily:` 远程仓库中可用） |
| 版本号（如 `22.04`） | 特定版本 |
| 代号（如 `jammy`） | Ubuntu 系列代号 |
| 首字母（如 `j`） | 代号首字母缩写 |

也可以使用本地文件或 URL 中的镜像启动实例：

```bash
multipass launch file:///path/to/image.img
multipass launch https://example.com/image.img
```

---

## 三、创建实例

### 基本创建

最简单的方式 —— 直接运行：

```bash
multipass launch
```

这会创建一个使用最新 Ubuntu LTS 镜像的实例，自动分配一个随机名称，例如：

```
Launched: relishing-lionfish
```

### 指定镜像

按名称或别名启动特定版本：

```bash
multipass launch 22.04 --name dev-env
multipass launch noble --name noble-test
multipass launch lts --name my-lts
```

### 指定资源配置

通过 `--cpus`、`--memory`、`--disk` 自定义资源：

```bash
multipass launch --name my-ubuntu --cpus 2 --memory 2G --disk 20G
```

### 启动时挂载目录

使用 `--mount` 在创建时直接挂载宿主机目录：

```bash
multipass launch --mount /home/user/project my-ubuntu
```

### 使用 cloud-init 自定义

通过 `--cloud-init` 在首次启动时自动配置实例：

```bash
multipass launch --name web-server --cloud-init cloud-config.yaml
```

`cloud-config.yaml` 示例：

```yaml
#cloud-config
packages:
  - nginx
  - git
runcmd:
  - systemctl start nginx
  - echo "Hello from Multipass!" > /var/www/html/index.html
```

也可以直接使用 URL：

```bash
multipass launch --cloud-init https://example.com/cloud-init.yaml
```

---

## 四、实例操作

### 进入实例 Shell

```bash
multipass shell <实例名>
```

如果实例未运行，会自动启动。进入后显示标准的 Ubuntu 登录信息：

```
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-44-generic aarch64)
 ...
ubuntu@loving-duck:~$
```

退出 Shell 使用 `logout`、`exit` 或 `Ctrl-D`。

### 在实例中执行命令

使用 `exec` 在实例中运行命令，无需进入 Shell：

```bash
multipass exec my-ubuntu -- uname -r
multipass exec my-ubuntu -- lsb_release -a
```

> `--` 用于分隔 Multipass 选项和要执行的命令。如果命令需要参数，`--` 是必须的。

也可以指定工作目录：

```bash
multipass exec my-ubuntu --working-directory /home -- ls -a
```

支持管道操作：

```bash
multipass exec my-ubuntu -- lsb_release -a | grep ^Codename:
```

### 查看实例信息

```bash
multipass info <实例名>
```

输出示例：

```
Name:           my-ubuntu
State:          Running
Snapshots:      0
IPv4:           10.218.69.109
Release:        Ubuntu 22.04 LTS
Image hash:     e898c1c93b32 (Ubuntu 22.04 LTS)
CPU(s):         2
Load:           0.49, 0.70, 0.71
Disk usage:     849.4M out of 19.5G
Memory usage:   41.9M out of 1.9G
Mounts:         /home/user => Home
```

### 列出所有实例

```bash
multipass list
```

输出示例：

```
Name                    State             IPv4             Release
primary                 SUSPENDED         --               Ubuntu 22.04 LTS
my-ubuntu               RUNNING           10.218.69.109    Ubuntu 22.04 LTS
```

支持 JSON、YAML 或 CSV 格式输出：

```bash
multipass list --format yaml
multipass list --format json
```

### 启动和停止实例

```bash
# 启动实例
multipass start my-ubuntu

# 启动所有实例
multipass start --all

# 停止实例
multipass stop my-ubuntu

# 停止所有实例
multipass stop --all

# 延迟停止（指定分钟后）
multipass stop my-ubuntu --time 10
```

### 挂起实例

挂起会保存实例状态到内存，恢复速度更快：

```bash
multipass suspend my-ubuntu
```

### 重启实例

```bash
multipass restart my-ubuntu
```

---

## 五、Primary 实例

Multipass 有一个特殊的「Primary 实例」。运行以下命令会自动创建并进入该实例：

```bash
multipass shell
```

Primary 实例的特点：

- 不带参数执行 `shell`、`start`、`stop`、`restart`、`suspend` 命令时默认操作 Primary 实例
- 如果不存在会自动创建（使用最新 LTS 镜像和默认配置）
- 自动挂载宿主机的 `$HOME` 目录到实例内的 `Home` 文件夹
- 在 `list` 输出中始终排在第一位

也可以手动指定资源配置创建 Primary 实例：

```bash
multipass launch --name primary --cpus 4 lts
```

### 修改 Primary 实例

可以将任何现有实例设置为 Primary：

```bash
multipass set client.primary-name=my-ubuntu
```

取消自动挂载：

```bash
multipass umount primary
```

---

## 六、修改实例配置

实例的 CPU、内存、磁盘空间可以在创建后修改：

```bash
# 先停止实例
multipass stop my-ubuntu

# 修改资源配置
multipass set local.my-ubuntu.cpus=4
multipass set local.my-ubuntu.disk=60G
multipass set local.my-ubuntu.memory=7G

# 查看当前配置（无需停止实例）
multipass get local.my-ubuntu.cpus
```

> 注意：磁盘大小只能增加，不能缩小。如果磁盘已满，增加磁盘大小后可能需要手动扩展分区。

手动扩展分区的方法：

```bash
multipass shell my-ubuntu
sudo parted /dev/sda resizepart 1 100%
sudo resize2fs /dev/sda1
```

---

## 七、文件传输与目录挂载

### 文件传输（transfer）

使用 `transfer` 在宿主机和实例之间复制文件，无需挂载目录：

```bash
# 从宿主机复制到实例
multipass transfer local_file.txt my-ubuntu:.

# 从实例复制到宿主机
multipass transfer my-ubuntu:remote_file.txt .

# 递归复制目录
multipass transfer --recursive my-ubuntu:dir .

# 自动创建不存在的父目录
multipass transfer --parents local_file.txt my-ubuntu:non/existent/path/file.txt
```

### 目录挂载（mount）

挂载宿主机目录到实例中，实现实时文件同步：

```bash
multipass mount /home/user/project my-ubuntu:/home/ubuntu/project
```

也可以在 `launch` 时直接指定挂载：

```bash
multipass launch --mount /home/user/project my-ubuntu
```

指定用户/组 ID 映射：

```bash
multipass mount /host/path my-ubuntu:/instance/path --uid-map 1000:1000 --gid-map 1000:1000
```

### 挂载类型

Multipass 支持两种挂载类型：

| 类型 | 技术 | 特点 |
|------|------|------|
| Classic（默认） | SSHFS | 跨平台兼容性好，性能稍低 |
| Native | QEMU: 9P / Hyper-V: SMB/CIFS | 性能更好，兼容性受限 |

指定挂载类型：

```bash
multipass mount --type=native /host/path my-ubuntu:/instance/path
```

### 取消挂载

```bash
multipass umount my-ubuntu:/home/ubuntu/project
```

> 注意：Windows 上默认禁用挂载功能，需要通过 `multipass set local.privileged-mounts=true` 启用。

---

## 八、快照管理

快照可以保存实例的当前状态，方便随时回滚。快照会记录磁盘内容与大小、CPU 数量、内存大小和挂载信息。

### 创建快照

实例需要在 **Stopped** 状态下才能创建快照：

```bash
multipass stop my-ubuntu
multipass snapshot my-ubuntu
```

输出：

```
Snapshot taken: my-ubuntu.snapshot1
```

指定快照名称和备注：

```bash
multipass snapshot my-ubuntu --name before-update --comment "更新前的状态"
```

### 查看快照

```bash
# 列出所有快照
multipass list --snapshots

# 查看特定快照详情
multipass info my-ubuntu.snapshot1
```

输出示例：

```
Instance        Snapshot    Parent      Comment
my-ubuntu       snapshot1   --          --
my-ubuntu       snapshot3   snapshot1   Before restoring snapshot2
```

### 从快照恢复

```bash
multipass restore my-ubuntu.snapshot1
```

恢复时系统会询问是否先保存当前状态。使用 `--destructive` 跳过确认直接丢弃当前状态：

```bash
multipass restore my-ubuntu.snapshot1 --destructive
```

### 删除快照

```bash
multipass delete my-ubuntu.snapshot1
```

> 注意：快照采用分层存储，每个快照记录相对于父快照的变更。过长的快照链会影响性能。快照与原始镜像存储在同一介质中，不适合作为可靠的备份方案。

---

## 九、克隆实例

从 Multipass 1.15.0 开始支持实例克隆功能，可用于备份或创建相同配置的测试环境：

```bash
# 确保实例已停止
multipass stop my-ubuntu

# 克隆（自动生成名称）
multipass clone my-ubuntu

# 指定克隆名称
multipass clone my-ubuntu --name my-ubuntu-backup
```

克隆的实例是独立的副本，包含原始实例的所有配置、安装的软件和数据。

---

## 十、删除与恢复实例

### 删除（可恢复）

```bash
multipass delete my-ubuntu
```

删除后的实例进入「回收站」状态，可以恢复：

```bash
multipass recover my-ubuntu
```

批量删除：

```bash
multipass delete --all
```

### 永久删除

```bash
# 删除并立即清除
multipass delete --purge my-ubuntu

# 清除所有已删除的实例
multipass purge
```

> 注意：`purge` 命令不接受参数，它会永久清除所有标记为 Deleted 的实例。快照删除也是永久性的。

---

## 十一、网络配置

### 查看可用网络

```bash
multipass networks
```

输出示例：

```
Name            Type        Description
bridge0         bridge      Network bridge with en1, en2
en0             wifi        Wi-Fi (Wireless)
en1             ethernet    Ethernet device
```

### 启动时指定网络

```bash
# 使用桥接网络
multipass launch --name bridged-vm --network bridged

# 使用自定义网络
multipass launch --name custom-vm --network name=localbr,mode=manual,mac="52:54:00:4b:ab:cd"
```

### 给现有实例添加桥接网络

```bash
# 设置首选桥接网络
multipass set local.bridged-network=eth0

# 停止实例
multipass stop my-ubuntu

# 启用桥接
multipass set local.my-ubuntu.bridged=true

# 启动实例
multipass start my-ubuntu
```

### 配置静态 IP

可以为实例配置额外的静态 IP 地址，确保重启后 IP 不变：

```bash
# 1. 在宿主机创建网桥
nmcli connection add type bridge con-name localbr ifname localbr \
  ipv4.method manual ipv4.addresses 10.13.31.1/24

# 2. 启动实例并连接到网桥
multipass launch --name test1 --network name=localbr,mode=manual,mac="52:54:00:4b:ab:cd"

# 3. 在实例内配置静态 IP
multipass exec -n test1 -- sudo bash -c 'cat << EOF > /etc/netplan/10-custom.yaml
network:
  version: 2
  ethernets:
    extra0:
      dhcp4: no
      match:
        macaddress: "52:54:00:4b:ab:cd"
      addresses: [10.13.31.13/24]
EOF'

# 4. 应用配置
multipass exec -n test1 -- sudo netplan apply

# 5. 验证
multipass info test1
ping 10.13.31.13
```

---

## 十二、命令别名

Multipass 支持为实例内的命令创建别名，方便从宿主机直接调用：

### 创建别名

```bash
multipass alias my-ubuntu:ls ls-vm
```

### 列出所有别名

```bash
multipass aliases
```

输出示例：

```
Alias    Instance     Command    Context      Working directory
ls-vm    my-ubuntu    ls         default      map
```

### 使用别名

```bash
ls-vm
```

### 别名上下文

可以创建不同的上下文来管理别名：

```bash
multipass prefer secondary
multipass alias another-vm:ls ls-vm
```

### 删除别名

```bash
multipass unalias ls-vm
```

---

## 十三、常用设置

### 查看所有配置键

```bash
multipass get --keys
```

### 查看特定配置

```bash
multipass get local.driver
```

### 修改配置

```bash
# 关闭 GUI 自动启动
multipass set client.gui.autostart=false

# 设置默认驱动
multipass set local.driver=qemu

# 设置默认 Primary 实例名称
multipass set client.primary-name=my-default
```

### 配置日志级别

```bash
multipass set local.logging.level=debug
```

---

## 十四、实例状态说明

| 状态 | 说明 |
|------|------|
| Running | 实例正在运行，可以正常使用 |
| Stopped | 实例已停止，不占用资源，可随时启动 |
| Deleted | 实例已标记为删除，可恢复或永久清除 |
| Starting | 实例正在启动和初始化中 |
| Restarting | 实例正在重启 |
| Delayed shutdown | 实例收到关机信号，延迟关机中 |
| Suspending | 实例正在挂起中 |
| Suspended | 实例已挂起，状态和内存已保存 |
| Unknown | 无法确定实例状态 |

---

## 十五、命令速查表

| 命令 | 说明 |
|------|------|
| `multipass launch` | 创建并启动实例 |
| `multipass list` | 列出所有实例 |
| `multipass list --snapshots` | 列出所有快照 |
| `multipass info <name>` | 查看实例详情 |
| `multipass shell <name>` | 进入实例 Shell |
| `multipass exec <name> -- <cmd>` | 在实例中执行命令 |
| `multipass start <name>` | 启动实例 |
| `multipass stop <name>` | 停止实例 |
| `multipass suspend <name>` | 挂起实例 |
| `multipass restart <name>` | 重启实例 |
| `multipass delete <name>` | 删除实例 |
| `multipass recover <name>` | 恢复已删除的实例 |
| `multipass purge` | 永久清除已删除的实例 |
| `multipass find` | 查看可用镜像 |
| `multipass mount <src> <name>:<dst>` | 挂载目录 |
| `multipass umount <name>:<dst>` | 取消挂载 |
| `multipass transfer <src> <dst>` | 传输文件 |
| `multipass snapshot <name>` | 创建快照 |
| `multipass restore <name>.<snap>` | 恢复快照 |
| `multipass clone <name>` | 克隆实例 |
| `multipass networks` | 查看可用网络 |
| `multipass alias <name>:<cmd> <alias>` | 创建命令别名 |
| `multipass aliases` | 列出所有别名 |
| `multipass unalias <alias>` | 删除命令别名 |
| `multipass get <key>` | 查看配置 |
| `multipass set <key>=<value>` | 修改配置 |

---

## 总结

Multipass 是本地开发和测试 Ubuntu 环境的最佳工具之一。它的核心优势在于：

1. 极速启动 —— 几秒钟获得一个全新的 Ubuntu 环境
2. 跨平台 —— Linux、macOS、Windows 全覆盖
3. 功能完整 —— 从基础的实例管理到高级的网络配置、快照、克隆，一应俱全
4. cloud-init 支持 —— 自动化实例初始化
5. 轻量高效 —— 默认仅需 1GB 内存、5GB 磁盘

无论你是需要快速测试一个 Ubuntu 命令、搭建本地开发环境，还是构建一个多实例的迷你云，Multipass 都能轻松胜任。

> 参考文档：[Multipass 官方文档](https://documentation.ubuntu.com/multipass/latest/)
