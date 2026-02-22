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

- **纯前端实现**：无需后端服务器，直接打开 HTML 文件即可使用
- **高速传输**：使用 WebRTC DataChannel 实现局域网 P2P 直传，速度快
- **安全加密**：使用 AES-GCM 256 位端到端加密技术，保护文件传输安全
- **多设备支持**：手机、电脑、平板全平台支持
- **文件管理**：实时传输进度、速度显示，支持取消传输
- **文件分块**：64KB 分块传输，支持大文件
- **响应式设计**：适配各种屏幕尺寸
- **深色模式**：支持系统深色模式偏好

## 🚀 快速开始

### 方法：直接打开 HTML 文件

1. **下载或克隆项目**
   ```bash
   git clone https://github.com/Youreln/filefly.git
   cd filefly
   ```

2. **打开应用**
   - 在文件管理器中找到 `index.html` 文件
   - 直接双击打开它，或右键选择 "打开方式" → 选择浏览器
   - 应用会在浏览器中加载，无需任何服务器

3. **开始使用**
   - 应用加载完成后，会自动扫描局域网设备
   - 选择要连接的设备，点击 "连接" 按钮
   - 连接成功后，点击 "发送文件" 按钮选择要传输的文件
   - 观察传输进度和速度，等待传输完成

### 注意事项

- **浏览器支持**：建议使用 Chrome、Firefox、Safari、Edge 等现代浏览器
- **局域网连接**：确保设备在同一局域网内（同一 WiFi 或有线网络）
- **权限要求**：某些浏览器可能需要权限才能访问网络和文件
- **防火墙设置**：如果无法发现设备，请检查防火墙设置，确保 WebRTC 流量被允许

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

| 类别 | 技术 |
| :--- | :--- |
| 前端框架 | React (CDN) |
| 状态管理 | Zustand (CDN) |
| UI 组件 | Ant Design Mobile (CDN) |
| 样式 | Tailwind CSS (CDN) |
| 实时通信 | WebRTC DataChannel |
| 加密技术 | Web Crypto API (AES-GCM 256) |
| 文件处理 | File API + Stream API |

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
├── index.html           # 主应用文件（包含所有代码）
├── LICENSE              # 许可证文件
└── README.md            # 项目说明
```

### 核心文件说明

- **index.html**：完整的应用代码，包含所有功能实现
  - 集成了 React、Zustand、Ant Design Mobile、Tailwind CSS
  - 实现了 WebRTC DataChannel 连接管理
  - 实现了文件分块传输和加密
  - 实现了设备发现和连接管理
  - 包含完整的用户界面

- **public/favicon.svg**：应用图标，显示在浏览器标签页

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

感谢以下开源项目和技术的支持：

- [React](https://reactjs.org/) - 前端UI库
- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理
- [Ant Design Mobile](https://ant.design/mobile) - 移动端UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [WebRTC](https://webrtc.org/) - 实时通信技术
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - 浏览器加密API
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API) - 文件操作API
- [Stream API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) - 流处理API

---

<div align="center">
  <p>Made with ❤️ by FileFly Team</p>
  <a href="https://github.com/Youreln/filefly" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-FileFly-blue" alt="GitHub">
  </a>
</div>
