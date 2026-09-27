/**
 * 飞传 FileFly - 构建准备脚本
 * 作者: Youreln
 *
 * v1.1.0 重写：
 *  - 移除对 sharp 的依赖（原脚本因缺少该依赖直接崩溃）
 *  - 校验应用图标资产存在（electron-builder 打包必需）
 *  - 将根目录前端文件同步到 public/，保持仓库两处一致
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const publicDir = path.join(rootDir, 'public');

// 需同步到 public/ 的前端文件
const FRONTEND_FILES = [
    'index.html',
    'settings.html',
    'style.css',
    'app.js',
    'p2p.js',
    'manifest.json',
    'sw.js'
];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    ensureDir(dest);
    fs.readdirSync(src).forEach(entry => {
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.statSync(s);
        if (stat.isDirectory()) {
            copyDir(s, d);
        } else {
            fs.copyFileSync(s, d);
        }
    });
}

function prepare() {
    console.log('[build-prepare] 准备构建...');

    // 1. 校验图标资产
    const iconPng = path.join(assetsDir, 'icon.png');
    if (!fs.existsSync(iconPng)) {
        console.error('[build-prepare] 缺少 assets/icon.png，请先从仓库恢复图标后再构建');
        process.exit(1);
    }
    console.log('[build-prepare] 图标资产已就绪:', iconPng);

    // 2. 同步前端文件到 public/
    ensureDir(publicDir);
    FRONTEND_FILES.forEach(name => {
        const src = path.join(rootDir, name);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(publicDir, name));
        }
    });
    copyDir(path.join(rootDir, 'icons'), path.join(publicDir, 'icons'));
    copyDir(path.join(rootDir, 'vendor'), path.join(publicDir, 'vendor'));
    copyDir(assetsDir, path.join(publicDir, 'assets'));

    // 3. 清理旧的构建产物，避免混淆
    const releaseDir = path.join(rootDir, 'release');
    if (fs.existsSync(releaseDir)) {
        fs.rmSync(releaseDir, { recursive: true, force: true });
        console.log('[build-prepare] 已清理旧构建产物 release/');
    }

    console.log('[build-prepare] 构建准备完成');
}

prepare();
