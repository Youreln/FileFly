/**
 * 飞传 FileFly - Electron 主进程
 * 桌面应用入口
 * 作者: Youreln
 * 版权: © 2026 Youreln 版权所有
 *
 * v1.1.0 修复内容：
 *  - 修复打包后无法启动服务器（原实现 spawn process.execPath 在打包环境失效，
 *    且 asar 内脚本无法被 spawn），改为内嵌方式直接启动服务端
 *  - 修复托盘图标崩溃（assets/icon.png 已随包发布；并增加失败降级）
 *  - 数据目录改为用户目录（userData），打包后配置与上传文件可持久化
 *  - 新增单实例锁、开机自启开关、端口冲突自动避让
 */

const { app, BrowserWindow, Menu, Tray, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

// 简易文件日志（排查桌面端启动问题用；写临时目录，无副作用）
function fileLog(...args) {
    try {
        fs.appendFileSync(path.join(os.tmpdir(), 'filefly-debug.log'),
            `[${new Date().toISOString()}] ${args.join(' ')}\n`);
    } catch (e) { /* 忽略 */ }
}

let mainWindow = null;
let tray = null;
let serverHandle = null; // { server, port }
let serverPort = 3000;
let isQuitting = false;

const isDev = process.env.ELECTRON_DEV === 'true';
const isPackaged = app.isPackaged;

// Windows 通知归属
app.setAppUserModelId('com.youreln.filefly');

// 部分虚拟化/远程桌面/多实例残留环境下 GPU 或磁盘缓存异常会导致渲染进程崩溃、
// 窗口被销毁进而整个应用退出。禁用硬件加速与磁盘缓存以保证稳定。
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disk-cache-size', '0');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// 单实例锁：避免重复启动
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
}

function getServerBaseUrl() {
    return `http://127.0.0.1:${serverPort}`;
}

function createWindow() {
    fileLog('createWindow enter');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: '飞传 FileFly',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        show: false,
        backgroundColor: '#0f172a'
    });

    mainWindow.loadURL(getServerBaseUrl());

    mainWindow.webContents.on('did-finish-load', () => {
        fileLog('did-finish-load');
    });

    mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
        fileLog('did-fail-load', code, desc);
        // 服务器尚未就绪时重试
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(getServerBaseUrl());
            }
        }, 1000);
    });

    mainWindow.once('ready-to-show', () => {
        fileLog('ready-to-show');
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // 渲染进程异常时打印原因并重载，避免整应用退出
    mainWindow.webContents.on('render-process-gone', (event, details) => {
        fileLog('render-process-gone', JSON.stringify(details));
        console.log('[FileFly] 渲染进程异常:', JSON.stringify(details));
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(getServerBaseUrl());
            }
        }, 1500);
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (/^https?:/i.test(url)) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    mainWindow.on('close', (event) => {
        fileLog('window close 事件');
        console.log('[FileFly] window close 事件');
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        fileLog('window closed 事件');
        console.log('[FileFly] window closed 事件');
        mainWindow = null;
    });
}

function openSettings() {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.loadURL(getServerBaseUrl() + '/settings');
}

function openMainPage() {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.loadURL(getServerBaseUrl());
}

function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                { label: '打开主页', accelerator: 'CmdOrCtrl+1', click: () => openMainPage() },
                { label: '打开设置', accelerator: 'CmdOrCtrl+,', click: () => openSettings() },
                { type: 'separator' },
                { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
                { type: 'separator' },
                { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => quitApp() }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { label: '重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'reload' },
                { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+F5', role: 'forceReload' },
                { type: 'separator' },
                { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
                { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: 'GitHub 开源地址',
                    click: () => shell.openExternal('https://github.com/Youreln/FileFly')
                },
                {
                    label: '检查更新',
                    click: () => shell.openExternal('https://github.com/Youreln/FileFly/releases')
                },
                { type: 'separator' },
                {
                    label: '开机自启',
                    type: 'checkbox',
                    checked: app.getLoginItemSettings().openAtLogin,
                    click: (item) => {
                        app.setLoginItemSettings({ openAtLogin: item.checked });
                    }
                },
                { type: 'separator' },
                {
                    label: '关于',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于 飞传 FileFly',
                            message: '飞传 FileFly v1.1.0',
                            detail: '局域网高速文件传输工具\n\n作者: Youreln\n© 2026 Youreln 版权所有\n\nhttps://github.com/Youreln/FileFly'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createTray() {
    try {
        const iconPath = path.join(__dirname, 'assets', 'icon.png');
        let trayIcon = nativeImage.createFromPath(iconPath);
        if (trayIcon.isEmpty()) {
            trayIcon = nativeImage.createEmpty();
        }

        tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

        const contextMenu = Menu.buildFromTemplate([
            { label: '显示主窗口', click: () => openMainPage() },
            { label: '打开设置', click: () => openSettings() },
            { type: 'separator' },
            { label: '开机自启', type: 'checkbox', checked: app.getLoginItemSettings().openAtLogin, click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked }) },
            { type: 'separator' },
            { label: 'GitHub', click: () => shell.openExternal('https://github.com/Youreln/FileFly') },
            { type: 'separator' },
            { label: '退出', click: () => quitApp() }
        ]);

        tray.setToolTip('飞传 FileFly');
        tray.setContextMenu(contextMenu);

        tray.on('double-click', () => openMainPage());
    } catch (e) {
        console.log('[FileFly] 托盘创建失败（不影响使用）:', e.message);
    }
}

/**
 * 内嵌启动服务端：
 *  - 打包环境：数据目录指向用户数据目录，可持久化配置与上传文件
 *  - 开发环境：数据目录为项目目录
 */
async function startEmbeddedServer() {
    if (isPackaged) {
        process.env.FILEFLY_DATA_DIR = app.getPath('userData');
    }

    // 打包后 __dirname 位于 resources/app，前端文件与 assets 随包分发
    const server = require('./index.js');

    const handle = await server.startServer({ autoPort: true });
    serverHandle = handle;
    serverPort = handle.port;
    console.log(`[FileFly] 内嵌服务器已启动: http://127.0.0.1:${serverPort}`);
    return handle;
}

function stopServer() {
    if (serverHandle && serverHandle.server) {
        try {
            serverHandle.server.close();
        } catch (e) { /* ignore */ }
        serverHandle = null;
    }
}

function quitApp() {
    isQuitting = true;
    stopServer();
    if (tray) {
        try { tray.destroy(); } catch (e) { /* ignore */ }
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
    }
    app.quit();
}

app.on('second-instance', () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
});

app.whenReady().then(async () => {
    try {
        fileLog('whenReady enter');
        // 一律内嵌启动服务端（autoPort 自动避让被占用端口），开发/打包行为一致
        await startEmbeddedServer();

        fileLog('创建主窗口...');
        console.log('[FileFly] 创建主窗口...');
        createWindow();
        createMenu();
        createTray();
        fileLog('应用启动完成');
        console.log('[FileFly] 应用启动完成');

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            } else {
                mainWindow?.show();
            }
        });
    } catch (err) {
        fileLog('启动失败 catch:', err && err.message);
        console.error('启动失败:', err);
        dialog.showErrorBox('启动失败', `服务器启动失败: ${err.message}`);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    fileLog('window-all-closed');
    console.log('[FileFly] window-all-closed');
    if (process.platform !== 'darwin') {
        quitApp();
    }
});

app.on('before-quit', () => {
    fileLog('before-quit');
    console.log('[FileFly] before-quit');
    isQuitting = true;
    stopServer();
});

app.on('will-quit', () => {
    fileLog('will-quit');
    console.log('[FileFly] will-quit');
});

app.on('quit', () => {
    fileLog('quit');
    console.log('[FileFly] quit');
});

process.on('uncaughtException', (err) => {
    fileLog('uncaughtException:', err && err.stack);
    console.error('未捕获的异常:', err);
});

app.on('child-process-gone', (event, details) => {
    fileLog('child-process-gone:', JSON.stringify(details));
});
