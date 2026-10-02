# 🚀 飞传 FileFly

<div align="center">

**局域网高速文件传输工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)](https://nodejs.org)
[![Author](https://img.shields.io/badge/author-Youreln-orange.svg)](https://github.com/Youreln)
[![Pages](https://img.shields.io/badge/GitHub-Pages-brightgreen.svg)](https://youreln.github.io/FileFly)
[![Release](https://img.shields.io/github/v/release/Youreln/FileFly)](https://github.com/Youreln/FileFly/releases)

**作者**: Youreln  
**版权**: © 2026 Youreln 版权所有  
**开源地址**: [https://github.com/Youreln/FileFly](https://github.com/Youreln/FileFly)

**🌐 [在线演示](https://youreln.github.io/FileFly) | 📥 [下载客户端](https://github.com/Youreln/FileFly/releases)**

</div>

---

## 📖 项目简介

**飞传 FileFly** 是一款现代化的局域网文件传输工具，支持多设备间快速、安全地传输文件。无需安装客户端，只需浏览器即可使用；也提供 Windows / macOS / Linux 桌面客户端与移动端 PWA，满足完整使用场景。

### ✨ 核心特性

- 🌐 **多方式连接** - 自动获取局域网IP、二维码扫码连接、热点直连
- 📤 **超强传输** - 多选上传、文件夹上传、拖拽上传、截图粘贴
- 📊 **实时进度** - 字节级进度条、实时速度显示、大文件支持(4GB+)
- 📁 **文件管理** - 单文件下载、批量ZIP打包、删除、清空
- 🔒 **安全权限** - 访问密码、权限开关、自动清理、访问日志
- 🎨 **炫酷界面** - 现代科技风、渐变动画、深浅主题切换

---

## ⚡ 在线互传（无需安装）

**打开网页即可互传文件，无需下载任何客户端。** 打开 [FileFly 在线版](https://youreln.github.io/FileFly)，把页面生成的分享链接（或二维码）发给对方，对方打开后自动建立 **WebRTC 点对点加密连接**，即可拖拽互传文件（支持大文件分片、实时进度、多文件队列）。

- ✅ 零安装：浏览器打开即用，Android / iOS / Windows / macOS / Linux 全平台互通
- ✅ 点对点：数据不经过服务器中转，浏览器直连加密传输
- ✅ 大文件：64KB 分片传输，带进度条与自动保存
- ✅ 无需注册：分享链接即会话入口
- 📷 **扫二维码连接** - 点击「扫对方二维码」，用摄像头扫对方屏幕上的二维码即可自动建立连接

> 说明：在线互传依赖 PeerJS 公共信令服务建立连接；双方处于同一局域网/家庭网络时成功率最高，跨严格 NAT 网络可能连接失败（此场景建议使用下方桌面客户端 + 局域网模式）。

---

## 📥 客户端下载

> 完整下载中心（Windows / macOS / Linux / Android / PWA）：**https://youreln.github.io/FileFly/download.html**

### 安卓版（APK）

- **[FileFly-Android-v1.1.0.apk](android/FileFly-Android-v1.1.0.apk)** - 安卓 8.0+ 直接下载安装，打开即用（WebView 加载在线互传网页，支持摄像头扫码连接）

### 桌面端


### 桌面端（v1.1.0）

| 平台 | 架构 | 下载 |
|------|------|------|
| Windows | 64位 | [安装包 FileFly-Setup-1.1.0-x64.exe](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-Setup-1.1.0-x64.exe) |
| Windows | 32位 | [安装包 FileFly-Setup-1.1.0-ia32.exe](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-Setup-1.1.0-ia32.exe) |
| Windows | 64位 | [便携版 FileFly-Portable-1.1.0-x64.exe](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-Portable-1.1.0-x64.exe) |
| macOS | Apple 芯片 (M1/M2/M3/M4) | [FileFly-1.1.0-mac-arm64.dmg](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-1.1.0-mac-arm64.dmg) |
| macOS | Intel 芯片 | [FileFly-1.1.0-mac-x64.dmg](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-1.1.0-mac-x64.dmg) |
| Linux | x64 | [FileFly-1.1.0-linux-x86_64.AppImage](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-1.1.0-linux-x86_64.AppImage) |
| Linux | x64 | [FileFly-1.1.0-linux-amd64.deb](https://github.com/Youreln/FileFly/releases/download/v1.1.0/FileFly-1.1.0-linux-amd64.deb) |

> 📌 所有版本见 [Releases 页面](https://github.com/Youreln/FileFly/releases)

**桌面端优势：**
- ✅ 后台运行，系统托盘常驻
- ✅ 开机自启动（可在菜单/托盘开启）
- ✅ 原生通知提醒
- ✅ 更稳定的文件传输
- ✅ 配置与文件数据保存在用户目录，卸载重装不丢失

> ⚠️ **macOS 首次打开提示**：当前版本未进行 Apple 签名，首次打开若提示"无法验证开发者"，请在 系统设置 → 隐私与安全性 → 点击"仍要打开"，或右键应用 → 打开。

### 移动端 (PWA)

| 平台 | 安装方式 |
|------|---------|
| Android | Chrome/Edge 打开 FileFly 页面 → 菜单 → 添加到主屏幕 |
| iOS | Safari 打开 FileFly 页面 → 分享 → 添加到主屏幕 |

**移动端优势：**
- ✅ 无需安装包，扫码即用
- ✅ 离线访问支持（PWA 缓存）
- ✅ 类原生应用体验
- ✅ 全屏运行

---

## ⚠️ 网页版局限性说明

当前 GitHub Pages 演示版本为静态页面，无法提供实际文件传输功能。请下载客户端或自建服务端使用完整功能：

| 功能 | 网页版(GitHub Pages) | 客户端 |
|------|--------|--------|
| 文件传输 | ❌ 需要自建服务端 | ✅ 内置服务端 |
| 后台运行 | ❌ 关闭页面即停止 | ✅ 最小化到托盘 |
| 离线使用 | ❌ 需要网络 | ✅ 完全离线 |
| 开机自启 | ❌ 不支持 | ✅ 支持 |
| 系统通知 | ⚠️ 部分支持 | ✅ 完整支持 |

**建议：** 如需完整功能，请下载对应平台的客户端！

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Node.js | 后端运行环境 |
| Express | Web服务框架 |
| Electron | 桌面应用框架 |
| Multer | 文件上传处理 |
| Archiver | ZIP打包下载 |
| QRCode | 二维码生成 |
| PWA | 移动端渐进式应用 |
| Font Awesome | 图标库 |

---

## 📦 安装与启动

### 方式一：下载客户端（推荐）

1. 前往 [Releases](https://github.com/Youreln/FileFly/releases) 页面
2. 下载对应平台的安装包
3. 安装并运行

### 方式二：源码运行（Web 服务）

```bash
# 克隆项目
git clone https://github.com/Youreln/FileFly.git

# 进入目录
cd FileFly

# 安装依赖
npm install

# 启动服务
npm start
```

### 方式三：开发模式（Electron）

```bash
# 安装依赖
npm install

# 启动 Electron 开发模式
npm run electron:dev
```

启动成功后，控制台会显示访问地址：

```
=================================
  飞传 FileFly 已启动!
=================================

访问地址:
  本地: http://localhost:3000
  局域网: http://192.168.x.x:3000
```

---

## 🔨 构建客户端

### 构建桌面应用

```bash
# 安装依赖
npm install

# 构建 Windows 版
npm run build:win

# 构建 macOS 版（需在 macOS 上执行）
npm run build:mac

# 构建 Linux 版
npm run build:linux

# 构建所有平台
npm run build:all
```

构建产物位于 `release/` 目录。

### 构建要求

- Node.js >= 14.0.0
- Windows: 无额外要求
- macOS: 需在 macOS 上构建（Xcode Command Line Tools）
- Linux: fakeroot, dpkg

### 自动构建（GitHub Actions）

推送 `v*` 标签到仓库后，会自动在 Windows/macOS/Linux 三平台构建并发布到 Releases：

```bash
git tag v1.1.0
git push origin v1.1.0
```

---

## 🔗 连接方式

### 方式一：局域网连接（推荐）

1. 确保设备连接同一WiFi/路由器
2. 启动服务后查看局域网地址
3. 在手机/其他设备浏览器输入地址

### 方式二：二维码扫码

1. 启动服务后打开主页
2. 使用手机扫描二维码
3. 自动跳转到传输页面

### 方式三：热点直连

1. 电脑开启移动热点
2. 手机连接该热点
3. 使用热点IP地址访问

### 方式四：USB共享

1. 手机通过USB连接电脑
2. 开启USB网络共享
3. 使用共享网络IP访问

---

## 📋 功能清单

### 文件上传

| 功能 | 说明 |
|------|------|
| 多选上传 | 一次选择多个文件上传 |
| 文件夹上传 | 整个文件夹批量上传 |
| 拖拽上传 | 拖拽文件到上传区域 |
| 截图粘贴 | Ctrl+V 直接粘贴截图 |
| 进度显示 | 实时字节级进度条 |
| 速度显示 | 实时传输速度 MB/s |

### 文件下载

| 功能 | 说明 |
|------|------|
| 单文件下载 | 点击下载单个文件 |
| 批量下载 | 勾选多个文件打包ZIP |
| 断点续传 | 支持Range请求 |

### 文件管理

| 功能 | 说明 |
|------|------|
| 文件列表 | 实时显示所有文件 |
| 类型图标 | 自动识别文件类型 |
| 文件信息 | 名称、大小、时间 |
| 单文件删除 | 删除指定文件 |
| 一键清空 | 清除所有文件 |

### 安全权限

| 功能 | 说明 |
|------|------|
| 访问密码 | 设置密码保护 |
| 上传权限 | 开关上传功能 |
| 下载权限 | 开关下载功能 |
| 删除权限 | 开关删除功能 |
| 自动清理 | 定时清理过期文件 |
| 访问日志 | 记录IP和操作 |

---

## 📁 项目结构

```
FileFly/
├── index.js              # 主服务入口（支持内嵌模式供 Electron 调用）
├── electron.js           # Electron 主进程
├── package.json          # 依赖配置
├── assets/               # 应用图标（打包必需）
├── icons/                # PWA 图标
├── public/               # 前端文件（构建时同步）
├── utils/                # 后端工具
│   ├── ip.js             # IP获取工具
│   ├── auth.js           # 认证工具
│   └── fileManager.js    # 文件管理工具
├── scripts/              # 构建脚本
├── uploads/              # 文件存储目录
├── docs/                 # GitHub Pages 页面
├── .github/workflows/    # 自动部署与自动构建
└── README.md             # 使用文档
```

---

## 🚀 部署到 GitHub Pages

本项目支持自动部署到 GitHub Pages，提供在线演示页面。

### 自动部署

1. Fork 本项目到你的 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 推送代码后自动部署

部署完成后访问：`https://你的用户名.github.io/FileFly`

---

## ❓ 常见问题

### Q: 局域网其他设备无法访问？

**A:** 检查以下几点：
1. 确认设备在同一局域网
2. 检查防火墙是否放行端口
3. Windows防火墙设置：
   ```bash
   netsh advfirewall firewall add rule name="FileFly" dir=in action=allow protocol=tcp localport=3000
   ```

### Q: macOS 打开提示"无法验证开发者"？

**A:** 当前版本未进行 Apple 签名，首次打开请：
- 右键应用图标 → 打开 → 仍要打开
- 或 系统设置 → 隐私与安全性 → 仍要打开

### Q: Linux AppImage 无法运行？

**A:**
```bash
chmod +x FileFly-1.1.0-linux-x86_64.AppImage
./FileFly-1.1.0-linux-x86_64.AppImage
# 若提示缺少 FUSE：
./FileFly-1.1.0-linux-x86_64.AppImage --appimage-extract-and-run
```

### Q: 上传大文件失败？

**A:**
1. 默认支持最大10GB文件
2. 如需更大，修改 index.js 中的 `limits.fileSize`

### Q: 如何修改端口？

**A:**
```bash
# 临时修改
PORT=8080 npm start
```

### Q: 忘记密码怎么办？

**A:**
- Web 版：删除项目目录下 `config.json` 文件或手动编辑移除 password 字段
- 桌面端：删除用户数据目录下的 `config.json`（Windows 为 `%APPDATA%\飞传 FileFly` 或 `%APPDATA%\com.youreln.filefly`）

### Q: 手机无法扫描二维码？

**A:**
直接在手机浏览器输入显示的局域网地址即可。

### Q: 如何安装 PWA 到手机？

**A:**
- **Android**: Chrome 菜单 → 添加到主屏幕
- **iOS**: Safari 分享 → 添加到主屏幕

---

## 🔄 更新日志

### v1.1.0 (2026-09-26)

**🐛 修复：**
- 修复桌面客户端打包后无法启动（服务端改为内嵌启动，不再依赖外部进程）
- 修复托盘图标缺失导致应用启动崩溃
- 修复设置密码后网页版整页失效（认证与配置加载流程）
- 修复密码模式下文件下载链接失效（支持 token 鉴权）
- 修复文件名含引号等特殊字符导致文件列表渲染崩溃
- 修复仓库根目录被静态暴露（config.json 明文密码、uploads 可被直接下载）
- 修复下载/删除接口路径穿越风险
- 修复构建脚本依赖缺失（移除 sharp）
- 修复 PWA 图标缺失无法安装
- 修复 `release/` 下载链接 404，下载统一指向 GitHub Releases

**✨ 新增：**
- 三平台自动构建发布（Windows/macOS/Linux，GitHub Actions）
- 桌面端数据目录改为用户目录，持久化配置与文件
- 单实例运行、开机自启开关、端口冲突自动避让
- macOS 同时支持 Apple 芯片与 Intel 芯片

### v1.0.0 (2026-01-01)

- ✨ 首次发布
- 🎉 完整文件传输功能
- 🔒 安全权限控制
- 🎨 炫酷界面设计
- 📱 全平台兼容
- 🌐 GitHub Pages 在线演示
- 💻 Electron 桌面客户端
- 📲 PWA 移动端支持

---

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<div align="center">

**⭐ 如果觉得有用，请给个 Star ⭐**

Made with ❤️ by [Youreln](https://github.com/Youreln)

© 2026 Youreln · 飞传 FileFly

</div>
