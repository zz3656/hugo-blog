---
title: RouterOS v7入门到精通学习笔记
date: 2026-04-30T19:30:00+08:00
tags:
  - RouterOS
  - 软路由
  - MikroTik
categories:
  - 网络技术
top: 3
---

# RouterOS v7 入门到精通学习笔记

本文整理自余松老师的《RouterOS 入门到精通 v7.4e》教程（共 192 页），系统梳理了 RouterOS v7 的核心新功能和配置要点。教程官网：[www.irouteros.com](http://www.irouteros.com)

---

## 一、RouterOS v7 升级概览

RouterOS v7 相比 v6 做了重大改动，主要体现在路由性能和配置架构上，同时引入了多项新功能：

| 新功能 | 说明 |
|--------|------|
| **WireGuard** | 现代 VPN 协议，轻量高速 |
| **ZeroTier** | 软件定义的虚拟局域网，零配置组网 |
| **L2TPv3** | 二层以太网桥接隧道 |
| **Docker/Container** | 在路由器上运行容器化应用 |
| **User Manager v5** | RADIUS 用户管理，支持 802.1x |
| **GPIO** | IoT 设备控制（继电器、传感器） |
| **ROSE 存储** | RAID、iSCSI、NFS、SMB 企业存储 |
| **VXLAN** | 虚拟扩展局域网 |
| **Device-Mode** | 设备功能安全管理 |

---

## 二、路由（第一章）

### 2.1 路由协议多任务支持

v7 的 BGP 支持 Sub-Tasks 多任务处理，每条 BGP 连接独立运行，提升大型网络的收敛速度。

### 2.2 路由表（Routing Tables）

v7 重新设计了路由表结构，通过 `/routing table` 管理，支持更灵活的策略路由。

查看路由命令：

```routeros
/ip route print
/routing route print
```

### 2.3 策略路由配置

v7 策略路由通过 Routing Tables + Routing Rules 配合实现：

```routeros
# 创建自定义路由表
/routing table add name=isp2 fib

# 添加路由规则
/routing rule add src-address=192.168.1.0/24 table=isp2

# 在路由表中添加网关
/ip route add gateway=10.0.0.1 routing-table=isp2
```

### 2.4 PCC 负载均衡

PCC（Per-Connection Classifier）是常用的多线负载均衡方案，v7 配置有改动，官方提供了新的配置模板。

### 2.5 OSPF 配置

v7 的 OSPF 配置更规范：

```routeros
# 启用 OSPF 实例
/routing ospf instance add name=ospf1

# 定义区域
/routing ospf area add instance=ospf1 name=backbone

# 添加接口
/routing ospf interface-template add area=backbone interfaces=ether1
```

支持通过 PPTP、WireGuard 等隧道建立 OSPF 邻居关系，实现多路径等价路由（ECMP）。

### 2.6 BGP 配置

v7 的 BGP 做了重大改进：

```routeros
# 建立 BGP 连接
/routing bgp connection add name=peer1 remote.address=10.0.0.1 remote.as=65001
```

支持 CPU 亲和参数，可将 BGP 任务绑定到特定 CPU 核心运行。路由过滤使用新的 Routing Filter 语法。

---

## 三、WireGuard VPN（第二章）

WireGuard 是 v7 最亮眼的新功能之一，配置简洁，性能优异。

### 3.1 基本配置

```routeros
# 添加 WireGuard 接口
/interface wireguard add name=wg1 listen-port=13231 private-key="xxx"

# 添加对端
/interface wireguard peers add interface=wg1 public-key="yyy" \
  allowed-address=10.0.0.2/32 endpoint-address=1.2.3.4 endpoint-port=13231
```

### 3.2 防火墙配置

WireGuard 需要放行 UDP 端口和转发流量：

```routeros
/ip firewall filter add chain=input protocol=udp dst-port=13231 action=accept
/ip firewall filter add chain=forward in-interface=wg1 action=accept
```

### 3.3 Windows 客户端连接

在 Windows 上安装 WireGuard 客户端，导入配置文件即可连接 RouterOS 的 WireGuard 服务。

### 3.4 基于 WireGuard 的 EoIP 隧道

通过 WireGuard 建立 IP 连通性后，再在其上运行 EoIP 隧道，实现二层桥接：

```routeros
# 创建 EoIP 隧道，对端使用 WireGuard 隧道 IP
/interface eoip add name=eoip1 remote-address=10.0.0.2 tunnel-id=100

# 将 EoIP 和本地网口加入同一个 bridge
/interface bridge add name=bridge1
/interface bridge port add bridge=bridge1 interface=eoip1
/interface bridge port add bridge=bridge1 interface=ether2
```

### 3.5 与 Ubuntu 建立 WireGuard

RouterOS 和 Linux（Ubuntu 20.04+）之间建立 WireGuard 隧道，实现异地网络互联。

### 3.6 WireGuard 多节点组网

多台 RouterOS 通过 WireGuard 互联，结合 OSPF 或 BGP 动态路由实现全网自动路由学习：

- **OSPF 方案**：适合中小型网络，配置简单
- **BGP 方案**：适合大规模网络，灵活性高

---

## 四、ZeroTier（第三章）

ZeroTier 是一个零配置的虚拟网络方案，RouterOS v7 原生支持。

### 使用建议

- 本地网络与 ZeroTier 网络使用不同网段，避免冲突
- RouterOS 上配置 NAT 转发，让 ZeroTier 客户端访问本地网络

```routeros
# 启用 ZeroTier
/zerotier enable

# 加入网络
/zerotier join network=xxxxxxxxxx
```

---

## 五、Container / Docker（第四章）

RouterOS v7 支持在路由器上运行 Docker 容器，扩展功能无限可能。

### 5.1 启用 Container 模式

```routeros
# 需要先通过 device-mode 启用 container
/system/device-mode/update container=yes
# 物理重启生效
```

### 5.2 创建网络

**路由模式**：容器使用独立网段，通过 NAT 访问外部网络。

**桥接模式**：容器直接加入本地 bridge，获取同网段 IP。

```routeros
# 创建 veth 接口
/interface veth add name=veth1 address=172.17.0.2/24 gateway=172.17.0.1

# 桥接模式：将 veth 加入 bridge
/interface bridge port add bridge=bridge1 interface=veth1
```

### 5.3 镜像管理

支持三种方式导入镜像：
1. 从外部仓库拉取（如 Docker Hub）
2. 从 PC 导入 tar 镜像文件
3. 在 PC 上用 docker build 创建镜像后上传

### 5.4 实战案例

教程演示了在 RouterOS 上安装 **nginx** 和 **DNSMasq** 等常用服务。

---

## 六、IoT / GPIO（第五章）

支持 GPIO 引脚控制，可连接传感器和继电器：

- **analog**：模拟信号读取（如温度传感器）
- **digital**：数字信号输入输出
- **继电器控制**：远程开关设备
- **信号监测**：监测输入信号变化

---

## 七、User Manager v5（第六章）

RouterOS 内置的 RADIUS 用户管理系统，适用于：

- PPPoE 宽带计费
- HotSpot 认证
- WiFi 802.1x EAP 认证
- VPN 用户管理

### WiFi 802.1x EAP 认证配置要点

1. 签发证书（CA + Server 证书）
2. 配置 RADIUS 服务器
3. 配置 User Manager 添加用户
4. 在 AP 上配置 EAP 认证
5. Windows 客户端配置 PEAP 认证

---

## 八、证书管理（第七章）

### 8.1 自签名证书

```routeros
# 创建证书模板
/certificate add name=ca-template common-name="MyCA" key-size=2048 \
  days-valid=3650 key-usage=crl-sign,key-cert-sign

# 签发 CA
/certificate sign ca-template name=ca

# 签发服务器证书
/certificate add name=server-template common-name="server" key-size=2048
/certificate sign server-template ca=ca name=server
```

### 8.2 Let's Encrypt

RouterOS 支持 ACME 协议自动申请和续期 Let's Encrypt 证书。

### 8.3 SSTP VPN 证书

详细演示了生成 SSTP 服务端证书、配置 SSTP Server、导出证书到 Windows 客户端的完整流程。

---

## 九、Dot1x 以太网认证（第八章）

RouterOS v7 支持 802.1x 以太网端口认证：

- **客户端模式**：对接上游交换机认证
- **服务器模式**：对下游设备进行认证
- **RADIUS 联动**：配合 User Manager 或外部 RADIUS
- **动态 VLAN 分配**：根据认证结果分配不同 VLAN

### 组网实例

教程展示了 RB5009 + CRS326 交换机 + hAP 客户端的完整 802.1x 组网配置。

---

## 十、VXLAN（第九章）

VXLAN 用于数据中心和跨地域二层网络扩展：

```routeros
# 创建 VXLAN 接口
/interface vxlan add name=vxlan1 vni=100 port=4789

# 配置转发表
/interface vxlan vtep add interface=vxlan1 remote-ip=10.0.0.2

# 加入 bridge
/interface bridge port add bridge=bridge1 interface=vxlan1
```

---

## 十一、L2TPv3（第十章）

L2TPv3 可建立二层以太网桥接隧道，与 EoIP、VxLAN 功能类似但基于 L2TP 协议：

```routeros
# Server 端启用 L2TP
/interface l2tp-server/server set enabled=yes

# 创建 L2TP 以太网接口
/interface l2tp-eth add name=l2tp-ether1 circuit-id=100

# Client 端连接
/interface l2tp-eth add name=l2tp-ether1 connect-to=192.168.88.1 circuit-id=100

# 两端分别加入 bridge
/interface bridge port add bridge=bridge1 interface=l2tp-ether1
/interface bridge port add bridge=bridge1 interface=ether2
```

> 与 EoIP 不同的是，L2TPv3 只需一端有公网 IP 即可建立。

---

## 十二、Branding 定制（第十一章）

通过 MikroTik 官网的 Branding Maker 工具定制路由器外观：

- **ASCII Logo**：命令行登录时显示的品牌标志
- **默认页面**：自定义 Web 登录页 HTML
- **LCD Logo**：设备液晶屏显示的 Logo（160x72px）
- **默认配置**：重置后自动加载的初始配置脚本

生成 `.dpk` 文件，上传到 RouterOS 重启生效。

---

## 十三、Device-Mode 安全（第十二章）

Device-Mode 控制设备功能开关，有 **enterprise**（默认）和 **home** 两种模式。

```routeros
# 查看当前模式
/system/device-mode/print

# 切换到 home 模式（需物理重启确认）
/system/device-mode/update mode=home

# 单独启用/禁用功能
/system/device-mode/update container=yes    # 启用容器
/system/device-mode/update sniffer=no       # 禁用抓包
```

> enterprise 模式默认允许所有功能（除 container）；home 模式禁用 scheduler、proxy、hotspot 等功能。

### Flagged 安全机制

系统启动时自动检测配置篡改。如果 flagged=yes，会限制敏感功能（bandwidth-test、sniffer、scheduler 等），需物理确认才能解除。

---

## 十四、ROSE 存储功能（第十三章）

ROSE 扩展包为企业数据中心提供存储能力，需 RouterOS v7.8beta2+ 并单独安装 `rose-storage` 功能包。

### 14.1 RAID

支持 RAID 0/1/4/5/6/10，最多 10 盘：

```routeros
/disk add type=raid raid-type=6 raid-device-count=10 slot=raid1
/disk set pcie1-nvme1 raid-master=raid1 raid-role=0
```

### 14.2 网络存储协议

| 协议 | 用途 | 模式 |
|------|------|------|
| **iSCSI** | IP 网络块存储 | Target + Initiator |
| **NFS v4** | Linux 文件共享 | Server + Client |
| **SMB 2.1/3.0/3.1.1** | Windows 文件共享 | Server + Client |
| **NVMe over TCP** | 高性能网络存储 | Target + Initiator |

### 14.3 其他存储功能

- **RAMdisk**：将内存虚拟为磁盘，重启丢失
- **数据加密**：支持 SED（自加密驱动器）和 dm-crypt
- **文件同步**：rsync 方式在多台 RouterOS 间同步文件

---

## 十五、VPS 隧道应用（应用案例）

### 15.1 弹性 IP 通过 Proxy-ARP 分配

VPS 获取弹性公网 IP 后，通过 PPTP/L2TP 隧道分配给远端 PC：

1. 创建 PPP Profile 和账号
2. 将账号的 remote-address 设为弹性 IP 对应的内网地址
3. 设置 ether1 的 ARP 模式为 proxy-arp

### 15.2 EoIP 二层隧道

VPS 与远端路由器通过 EoIP 隧道建立二层桥接，远端设备直接获取 VPS 公网 IP：

1. 两端创建 bridge
2. 建立 EoIP 隧道（两端需公网 IP）
3. 将 ether 和 eoip 隧道加入同一个 bridge

> 如果远端没有公网 IP，可先建 WireGuard 隧道，再在其上运行 EoIP。

---

## 总结

RouterOS v7 是一次重大升级，核心变化：

1. **路由架构重构**：Routing Tables + Rules 更灵活
2. **WireGuard 原生支持**：VPN 配置更简洁高效
3. **容器化能力**：路由器上跑 Docker，扩展无限
4. **企业存储**：RAID/iSCSI/NFS/SMB 一应俱全
5. **安全增强**：Device-Mode + Flagged 双重保护
6. **网络虚拟化**：VXLAN、L2TPv3、ZeroTier 多方案

---

> 参考资料：《RouterOS 入门到精通 v7.4e》- 余松 (www.irouteros.com)
> 
> MikroTik 官方文档：[help.mikrotik.com](https://help.mikrotik.com)
