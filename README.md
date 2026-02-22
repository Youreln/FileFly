# FileFly - 跨设备文件互传工具

<div align="center">
  <img src="public/favicon.svg" width="100" height="100" alt="FileFly Logo">
  <h1>FileFly</h1>
  <p>快速、安全、跨平台的文件传输解决方案</p>
  <a href="https://github.com/Youreln/filefly" target="_blank">
    <img src="https://img.shields.io/github/stars/Youreln/filefly.svg?style=social" alt="GitHub Stars">
  </a>
  <a href="https://github.com/Youreln/filefly" target="_blank">
    <img src="https://img.shields.io/github/forks/Youreln/filefly.svg?style=social" alt="GitHub Forks">
  </a>
</div>

## 📋 项目简介

FileFly 是一款纯前端的跨设备文件互传工具，支持在局域网内快速传输文件，无需服务器中转，保护您的隐私安全。

### ✨ 核心特性

- **多连接方式**：二维码、配对码、局域网发现、链接分享
- **高速传输**：局域网 P2P 直传，速度快，无服务器中转
- **安全加密**：端到端加密技术，保护文件传输安全
- **多设备支持**：手机、电脑、平板全平台支持
- **文件管理**：实时传输进度、速度显示，支持暂停/恢复/取消
- **文本传输**：支持文本和代码片段快速传输
- **响应式设计**：适配各种屏幕尺寸
- **深色模式**：支持系统深色模式偏好

## 🚀 快速开始

### 方法一：直接访问

1. 打开浏览器访问 [FileFly](http://127.0.0.1:3000)
2. 点击 "立即开始" 按钮
3. 选择连接方式连接设备
4. 开始传输文件

### 方法二：本地运行

1. **克隆项目**
   ```bash
   git clone https://github.com/Youreln/filefly.git
   cd filefly
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 `http://localhost:5173`

## 📱 使用指南

### 1. 连接设备

FileFly 提供多种连接方式，您可以选择最适合您的方式：

#### 二维码连接

1. 在主设备上打开 FileFly
2. 选择 "二维码连接"
3. 使用另一台设备的摄像头扫描二维码
4. 连接成功后即可开始传输文件

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20connection%20interface%20for%20file%20transfer%20tool&image_size=square" width="400" alt="二维码连接">
</div>

#### 配对码连接

1. 在主设备上打开 FileFly
2. 选择 "配对码连接"
3. 在另一台设备上输入显示的 6 位配对码
4. 连接成功后即可开始传输文件

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pairing%20code%20connection%20interface%20for%20file%20transfer%20tool&image_size=square" width="400" alt="配对码连接">
</div>

#### 局域网发现

1. 在主设备上打开 FileFly
2. 选择 "局域网发现"
3. 系统会自动搜索同一局域网内的设备
4. 选择要连接的设备
5. 连接成功后即可开始传输文件

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=LAN%20device%20discovery%20interface%20for%20file%20transfer%20tool&image_size=square" width="400" alt="局域网发现">
</div>

#### 链接分享

1. 在主设备上打开 FileFly
2. 选择 "分享链接"
3. 复制生成的链接并发送给其他设备
4. 其他设备打开链接即可连接
5. 连接成功后即可开始传输文件

### 2. 文件传输

连接设备后，您可以开始传输文件：

1. **拖拽上传**：直接将文件拖拽到传输区域
2. **选择文件**：点击 "选择文件" 按钮选择要传输的文件
3. **查看进度**：实时查看传输进度和速度
4. **控制传输**：可暂停、恢复或取消传输

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=File%20transfer%20interface%20with%20progress%20bars%20and%20speed%20display&image_size=landscape_16_9" width="600" alt="文件传输">
</div>

### 3. 文本传输

除了文件传输，FileFly 还支持文本传输：

1. 在文本传输页面输入要传输的文本
2. 选择文本类型（普通文本或代码）
3. 点击 "发送" 按钮
4. 文本会立即传输到已连接的设备

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Text%20transfer%20interface%20for%20file%20transfer%20tool&image_size=square" width="400" alt="文本传输">
</div>

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
| :--- | :--- | :--- |
| 前端框架 | React | ^18.2.0 |
| 开发语言 | TypeScript | ^5.2.2 |
| 构建工具 | Vite | ^4.5.0 |
| UI 组件 | Ant Design Mobile | ^5.34.0 |
| 样式 | Tailwind CSS | ^3.4.1 |
| 状态管理 | Zustand | ^4.5.0 |
| 二维码 | qrcode.react | ^3.1.0 |
| 实时通信 | Socket.io Client | ^4.7.4 |

## 🎨 界面设计

FileFly 采用现代简约的设计风格，以蓝色为主色调，搭配白色和浅灰色，营造出清新、专业的视觉效果。

### 主要特点：

- **响应式设计**：适配手机、平板、电脑等各种设备
- **深色模式**：支持系统深色模式偏好，自动切换
- **动画效果**：流畅的过渡动画，提升用户体验
- **卡片布局**：清晰的卡片式布局，信息层次分明
- **图标系统**：统一的图标风格，增强视觉识别性

<div align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20file%20transfer%20tool%20interface%20with%20blue%20color%20scheme&image_size=landscape_16_9" width="600" alt="界面设计">
</div>

## 🔒 安全性

FileFly 注重用户数据安全，采取了多种安全措施：

- **端到端加密**：使用 AES-GCM 256 位加密算法
- **局域网直传**：无需服务器中转，数据不经过第三方
- **临时连接**：连接会话临时生成，传输完成后自动断开
- **无存储**：不会在任何服务器上存储用户文件
- **自动过期**：传输链接自动过期，提高安全性

## 📈 性能优化

FileFly 针对文件传输进行了多项性能优化：

- **大文件分块**：支持大文件分块传输，避免内存溢出
- **断点续传**：支持传输中断后继续传输，节省时间
- **速度限制**：智能调整传输速度，避免网络拥塞
- **多文件并行**：支持多个文件并行传输，提高效率
- **缓存优化**：合理使用浏览器缓存，提升加载速度

## 📁 项目结构

```
FileFly/
├── public/              # 静态资源
│   └── favicon.svg      # 项目图标
├── src/                 # 源代码
│   ├── components/      # 可复用组件
│   │   ├── FilePreview.tsx        # 文件预览组件
│   │   ├── HotspotList.tsx        # 热点列表组件
│   │   └── NetworkSpeedTest.tsx   # 网络测速组件
│   ├── pages/           # 页面组件
│   │   ├── ConnectionPage.tsx      # 连接页面
│   │   ├── TransferPage.tsx        # 文件传输页面
│   │   ├── TextTransferPage.tsx    # 文本传输页面
│   │   ├── HistoryPage.tsx         # 传输历史页面
│   │   └── SettingsPage.tsx        # 设置页面
│   ├── store/           # 状态管理
│   │   ├── useConnectionStore.ts   # 连接状态管理
│   │   ├── useFileTransferStore.ts # 文件传输状态管理
│   │   └── useTextTransferStore.ts # 文本传输状态管理
│   ├── utils/           # 工具函数
│   │   └── security.ts             # 加密相关工具
│   ├── App.tsx          # 应用根组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── README.md            # 项目说明
```

## 🤝 贡献指南

欢迎对 FileFly 项目做出贡献！您可以通过以下方式参与：

1. **报告问题**：在 GitHub Issues 中提交 bug 报告或功能建议
2. **提交代码**：Fork 项目并提交 Pull Request
3. **改进文档**：帮助完善项目文档
4. **分享项目**：向您的朋友和同事推荐 FileFly

### 提交代码流程：

1. Fork 项目仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

FileFly 采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 📞 联系方式

- **GitHub**：[https://github.com/Youreln/filefly](https://github.com/Youreln/filefly)
- **作者**：Youreln

## 🙏 致谢

感谢以下开源项目的支持：

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design Mobile](https://ant.design/mobile)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Socket.io](https://socket.io/)
- [qrcode.react](https://github.com/zpao/qrcode.react)

---

<div align="center">
  <p>Made with ❤️ by FileFly Team</p>
  <a href="https://github.com/Youreln/filefly" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-FileFly-blue" alt="GitHub">
  </a>
</div>
