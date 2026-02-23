# 🚀 飞传 FileFly

<div align="center">

**局域网高速文件传输工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)](https://nodejs.org)
[![Author](https://img.shields.io/badge/author-Youreln-orange.svg)](https://github.com/Youreln)

**作者**: Youreln  
**版权**: © 2026 Youreln 版权所有  
**开源地址**: [https://github.com/Youreln/FileFly](https://github.com/Youreln/FileFly)

</div>

---

## 📖 项目简介

**飞传 FileFly** 是一款现代化的局域网文件传输工具，支持多设备间快速、安全地传输文件。无需安装客户端，只需浏览器即可使用。

### ✨ 核心特性

- 🌐 **多方式连接** - 自动获取局域网IP、二维码扫码连接、热点直连
- 📤 **超强传输** - 多选上传、文件夹上传、拖拽上传、截图粘贴
- 📊 **实时进度** - 字节级进度条、实时速度显示、大文件支持(4GB+)
- 📁 **文件管理** - 单文件下载、批量ZIP打包、删除、清空
- 🔒 **安全权限** - 访问密码、权限开关、自动清理、访问日志
- 🎨 **炫酷界面** - 现代科技风、渐变动画、深浅主题切换

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Node.js | 后端运行环境 |
| Express | Web服务框架 |
| Multer | 文件上传处理 |
| Archiver | ZIP打包下载 |
| QRCode | 二维码生成 |
| Font Awesome | 图标库 |

---

## 📦 安装与启动

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 快速开始

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

启动成功后，控制台会显示访问地址：

```
=================================
  飞传 FileFly 已启动!
  作者: Youreln
=================================

访问地址:
  本地: http://localhost:3000
  局域网: http://192.168.x.x:3000
```

### 自定义端口

```bash
# 方式1: 环境变量
PORT=8080 npm start

# 方式2: 修改配置
# 编辑 config.json 文件中的 port 字段
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
├── index.js              # 主服务入口
├── package.json          # 依赖配置
├── config.json           # 运行时配置（自动生成）
├── public/
│   ├── index.html        # 主页面
│   ├── settings.html     # 设置页面
│   ├── style.css         # 样式文件
│   └── app.js            # 前端逻辑
├── utils/
│   ├── ip.js             # IP获取工具
│   ├── auth.js           # 认证工具
│   └── fileManager.js    # 文件管理工具
├── uploads/              # 文件存储目录
└── README.md             # 使用文档
```

---

## ❓ 常见问题

### Q: 局域网其他设备无法访问？

**A:** 检查以下几点：
1. 确认设备在同一局域网
2. 检查防火墙是否放行端口
3. Windows防火墙设置：
   ```bash
   # 添加防火墙规则（管理员权限）
   netsh advfirewall firewall add rule name="FileFly" dir=in action=allow protocol=tcp localport=3000
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

# 永久修改
# 编辑 config.json 或在设置页面修改
```

### Q: 忘记密码怎么办？

**A:** 
删除 `config.json` 文件或手动编辑移除 password 字段。

### Q: 手机无法扫描二维码？

**A:** 
直接在手机浏览器输入显示的局域网地址即可。

---

## 🔄 更新日志

### v1.0.0 (2026-01-01)

- ✨ 首次发布
- 🎉 完整文件传输功能
- 🔒 安全权限控制
- 🎨 炫酷界面设计
- 📱 全平台兼容

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
