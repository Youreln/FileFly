/**
 * 飞传 FileFly - 主服务入口
 * 局域网高速文件传输工具
 * 作者: Youreln
 * 版权: © 2026 Youreln 版权所有
 *
 * v1.1.0 修复内容：
 *  - 修复静态目录整仓暴露（config.json 明文密码、uploads/ 等可被直接下载）
 *  - 修复设置密码后前端无法加载配置导致整页失效（GET /api/config 放行）
 *  - 修复密码模式下下载链接失效（支持 ?token= 查询参数鉴权）
 *  - 修复文件名含引号/特殊字符导致前端渲染崩溃（服务端同步净化文件名）
 *  - 修复下载/删除接口路径穿越风险（强制 basename）
 *  - 支持内嵌模式（Electron 直接 require 启动，可指定数据目录）
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const QRCode = require('qrcode');

const { getLocalIPs } = require('./utils/ip');
const {
    getFilesList,
    deleteFile,
    clearAllFiles,
    generateUniqueFilename,
    formatFileSize,
    getFileIcon
} = require('./utils/fileManager');

const VERSION = '1.1.0';
const AUTHOR = 'Youreln';

// 数据目录：桌面端通过 FILEFLY_DATA_DIR 指向用户数据目录，Web 版默认使用项目目录
const dataDir = process.env.FILEFLY_DATA_DIR || __dirname;
const configPath = path.join(dataDir, 'config.json');
const uploadsDir = path.join(dataDir, 'uploads');

let config = {
    port: process.env.PORT || 3000,
    password: '',
    allowUpload: true,
    allowDownload: true,
    allowDelete: true,
    autoCleanup: false,
    cleanupDays: 7
};

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const saved = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config = { ...config, ...saved };
        }
    } catch (e) {
        console.log('[FileFly] 配置加载失败，使用默认配置');
    }
}

function saveConfig() {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (e) {
        console.log('[FileFly] 配置保存失败', e.message);
    }
}

loadConfig();

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/** 净化上传文件名：去掉路径分隔符与控制字符，保留中文等合法字符 */
function sanitizeFilename(name) {
    let cleaned = String(name || '')
        .replace(/[\\/]/g, '_')
        .replace(/[\x00-\x1f\x7f]/g, '')
        .trim();
    return cleaned || 'unnamed';
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // multer 1.x 对非 ASCII 文件名按 latin1 编码，需还原为 utf8
        const decoded = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const originalName = sanitizeFilename(decoded);
        const uniqueName = generateUniqueFilename(uploadsDir, originalName);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 * 10 // 默认最大 10GB
    }
});

function createApp() {
    const app = express();
    app.use(express.json());

    // ---------- 安全静态资源：只暴露前端白名单，其余一律 404 ----------
    const publicDir = __dirname;
    const staticFile = (name) => (req, res) => {
        const filepath = path.join(publicDir, name);
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
            res.sendFile(filepath);
        } else {
            res.status(404).send('Not Found');
        }
    };

    app.use('/icons', express.static(path.join(publicDir, 'icons')));
    app.use('/assets', express.static(path.join(publicDir, 'assets')));
    app.get('/', staticFile('index.html'));
    app.get('/index.html', staticFile('index.html'));
    app.get('/settings', staticFile('settings.html'));
    app.get('/settings.html', staticFile('settings.html'));
    app.get('/style.css', staticFile('style.css'));
    app.get('/app.js', staticFile('app.js'));
    app.get('/manifest.json', staticFile('manifest.json'));
    app.get('/sw.js', staticFile('sw.js'));
    app.get('/favicon.ico', staticFile('assets/icon.png'));

    // ---------- 访问日志 ----------
    const accessLogs = [];

    function logAccess(req, type) {
        const log = {
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            time: new Date().toISOString(),
            type: type,
            userAgent: (req.get('User-Agent') || 'unknown').slice(0, 200)
        };
        accessLogs.unshift(log);
        if (accessLogs.length > 100) {
            accessLogs.pop();
        }
    }

    // ---------- 认证中间件 ----------
    // 公开：GET /api/config（不泄露密码）、/api/verify、/api/info、/api/version
    // 其余 /api/* 在设置密码后必须通过 Authorization: Bearer <密码> 或 ?token=<密码> 访问
    function checkAuth(req) {
        const authHeader = req.headers.authorization || '';
        if (authHeader === `Bearer ${config.password}`) return true;
        const token = req.query.token;
        return !!token && token === config.password;
    }

    app.use((req, res, next) => {
        const p = req.path;
        if (p.startsWith('/api/')) {
            const isPublicGetConfig = p === '/api/config' && req.method === 'GET';
            const isPublic = ['/api/verify', '/api/info', '/api/version'].includes(p);
            if (!isPublic && !isPublicGetConfig && config.password && !checkAuth(req)) {
                return res.status(401).json({ error: '未授权访问' });
            }
        }
        next();
    });

    // ---------- 基础页面 ----------
    app.get('/api/version', (req, res) => {
        res.json({ name: '飞传 FileFly', version: VERSION, author: AUTHOR });
    });

    app.get('/api/config', (req, res) => {
        res.json({
            password: config.password ? '******' : '',
            hasPassword: !!config.password,
            allowUpload: config.allowUpload,
            allowDownload: config.allowDownload,
            allowDelete: config.allowDelete,
            autoCleanup: config.autoCleanup,
            cleanupDays: config.cleanupDays
        });
    });

    app.post('/api/config', (req, res) => {
        const { password, allowUpload, allowDownload, allowDelete, autoCleanup, cleanupDays } = req.body;

        if (password !== undefined) {
            config.password = String(password);
        }
        if (allowUpload !== undefined) config.allowUpload = !!allowUpload;
        if (allowDownload !== undefined) config.allowDownload = !!allowDownload;
        if (allowDelete !== undefined) config.allowDelete = !!allowDelete;
        if (autoCleanup !== undefined) config.autoCleanup = !!autoCleanup;
        if (cleanupDays !== undefined) {
            const days = parseInt(cleanupDays, 10);
            if (!isNaN(days) && days >= 1 && days <= 3650) config.cleanupDays = days;
        }

        saveConfig();
        res.json({ success: true, message: '配置已保存' });
    });

    app.post('/api/verify', (req, res) => {
        const { password } = req.body;
        if (!config.password || password === config.password) {
            logAccess(req, 'login_success');
            res.json({ success: true, token: config.password });
        } else {
            logAccess(req, 'login_failed');
            res.status(401).json({ success: false, message: '密码错误' });
        }
    });

    app.get('/api/info', (req, res) => {
        const ips = getLocalIPs();
        const port = config.port;
        const addresses = ips.map(ip => `http://${ip}:${port}`);
        const primaryUrl = addresses[0] || `http://localhost:${port}`;

        QRCode.toDataURL(primaryUrl, { width: 200 }, (err, qrUrl) => {
            if (err) {
                res.json({ ips, port, addresses, qrCode: null, error: '二维码生成失败' });
            } else {
                res.json({ ips, port, addresses, qrCode: qrUrl });
            }
        });
    });

    app.get('/api/files', (req, res) => {
        logAccess(req, 'list_files');
        const files = getFilesList(uploadsDir);
        res.json(files);
    });

    app.post('/api/upload', (req, res) => {
        if (!config.allowUpload) {
            return res.status(403).json({ error: '上传功能已禁用' });
        }
        logAccess(req, 'upload');

        upload.array('files')(req, res, (err) => {
            if (err) {
                const msg = err.code === 'LIMIT_FILE_SIZE'
                    ? '文件超过大小限制（默认 10GB）'
                    : err.message;
                return res.status(500).json({ error: msg });
            }
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: '没有文件上传' });
            }
            const uploadedFiles = req.files.map(f => ({
                name: f.filename,
                size: f.size
            }));
            res.json({
                success: true,
                message: `成功上传 ${req.files.length} 个文件`,
                files: uploadedFiles
            });
        });
    });

    app.post('/api/upload-folder', (req, res) => {
        if (!config.allowUpload) {
            return res.status(403).json({ error: '上传功能已禁用' });
        }
        logAccess(req, 'upload_folder');

        upload.array('files')(req, res, (err) => {
            if (err) {
                const msg = err.code === 'LIMIT_FILE_SIZE'
                    ? '文件超过大小限制（默认 10GB）'
                    : err.message;
                return res.status(500).json({ error: msg });
            }
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: '没有文件上传' });
            }
            res.json({
                success: true,
                message: `成功上传 ${req.files.length} 个文件`,
                count: req.files.length
            });
        });
    });

    /** 安全解析下载/删除文件名，杜绝路径穿越 */
    function resolveFilename(raw) {
        if (typeof raw !== 'string' || !raw) return null;
        const name = path.basename(raw);
        if (!name || name === '.' || name === '..') return null;
        if (name.includes('/') || name.includes('\\')) return null;
        return name;
    }

    app.get('/api/download/:filename', (req, res) => {
        if (!config.allowDownload) {
            return res.status(403).json({ error: '下载功能已禁用' });
        }
        const filename = resolveFilename(req.params.filename);
        if (!filename) {
            return res.status(400).json({ error: '非法文件名' });
        }
        const filepath = path.join(uploadsDir, filename);
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: '文件不存在' });
        }

        logAccess(req, 'download');

        const stat = fs.statSync(filepath);
        const fileSize = stat.size;
        const range = req.headers.range;

        const headers = {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
        };

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            if (isNaN(start) || start < 0 || start >= fileSize || end < start) {
                return res.status(416).json({ error: 'Range 无效' });
            }
            const chunksize = end - start + 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                ...headers
            });
            fs.createReadStream(filepath, { start, end }).pipe(res);
        } else {
            res.writeHead(200, { 'Content-Length': fileSize, 'Accept-Ranges': 'bytes', ...headers });
            fs.createReadStream(filepath).pipe(res);
        }
    });

    app.post('/api/download-zip', (req, res) => {
        if (!config.allowDownload) {
            return res.status(403).json({ error: '下载功能已禁用' });
        }
        const { files } = req.body;
        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: '没有选择文件' });
        }

        logAccess(req, 'download_zip');

        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('FileFly_Download_' + Date.now() + '.zip')}`
        });

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        archive.on('error', () => {
            try { res.end(); } catch (e) { /* ignore */ }
        });

        files.forEach(rawName => {
            const filename = resolveFilename(rawName);
            if (!filename) return;
            const filepath = path.join(uploadsDir, filename);
            if (fs.existsSync(filepath)) {
                archive.file(filepath, { name: filename });
            }
        });
        archive.finalize();
    });

    app.delete('/api/file/:filename', (req, res) => {
        if (!config.allowDelete) {
            return res.status(403).json({ error: '删除功能已禁用' });
        }
        const filename = resolveFilename(req.params.filename);
        if (!filename) {
            return res.status(400).json({ error: '非法文件名' });
        }
        const result = deleteFile(uploadsDir, filename);
        if (result.success) {
            logAccess(req, 'delete');
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    });

    app.post('/api/clear', (req, res) => {
        if (!config.allowDelete) {
            return res.status(403).json({ error: '删除功能已禁用' });
        }
        logAccess(req, 'clear_all');
        const result = clearAllFiles(uploadsDir);
        res.json(result);
    });

    app.get('/api/logs', (req, res) => {
        res.json(accessLogs.slice(0, 50));
    });

    app.post('/api/change-port', (req, res) => {
        const { port } = req.body;
        const portNum = parseInt(port, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            return res.status(400).json({ error: '无效的端口号' });
        }
        config.port = portNum;
        saveConfig();
        res.json({
            success: true,
            message: '端口已修改，请重启服务生效',
            port: portNum
        });
    });

    // 兜底：其余路径一律 404，避免泄露仓库其他文件
    app.use((req, res) => {
        if (req.path.startsWith('/api/')) {
            res.status(404).json({ error: '接口不存在' });
        } else {
            res.status(404).send('Not Found');
        }
    });

    return app;
}

function autoCleanup() {
    if (!config.autoCleanup) return;
    try {
        const now = Date.now();
        const maxAge = config.cleanupDays * 24 * 60 * 60 * 1000;
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => {
            const filepath = path.join(uploadsDir, file);
            try {
                const stat = fs.statSync(filepath);
                if (stat.isFile() && now - stat.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filepath);
                    console.log(`[FileFly] 自动清理: ${file}`);
                }
            } catch (e) { /* ignore */ }
        });
    } catch (e) { /* ignore */ }
}

setInterval(autoCleanup, 24 * 60 * 60 * 1000);

/** 在指定端口启动（支持 autoPort 自动避让被占用端口） */
function startServer(options = {}) {
    const app = createApp();
    const initialPort = options.port != null ? parseInt(options.port, 10) : (config.port || 3000);
    const maxTries = options.autoPort ? 30 : 1;
    let port = initialPort;

    return new Promise((resolve, reject) => {
        function tryListen() {
            const server = app.listen(port, '0.0.0.0');
            server.on('listening', () => {
                resolve({ server, app, port: server.address().port });
            });
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE' && options.autoPort && port < initialPort + maxTries) {
                    port++;
                    tryListen();
                } else {
                    reject(err);
                }
            });
        }
        tryListen();
    });
}

// ---------- 独立运行模式（node index.js / npm start） ----------
if (require.main === module) {
    startServer()
        .then(({ server, port }) => {
            const ips = getLocalIPs();
            console.log('\n=================================');
            console.log('  飞传 FileFly 已启动!');
            console.log(`  版本: v${VERSION}`);
            console.log('  作者: Youreln');
            console.log('=================================\n');
            console.log('访问地址:');
            console.log(`  本地: http://localhost:${port}`);
            ips.forEach(ip => {
                console.log(`  局域网: http://${ip}:${port}`);
            });
            console.log('\n扫描二维码连接(访问 /api/info 获取)');
            console.log('---------------------------------\n');

            const shutdown = () => {
                console.log('\n正在关闭服务器...');
                server.close(() => {
                    console.log('服务器已关闭');
                    process.exit(0);
                });
            };
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
        })
        .catch(err => {
            if (err.code === 'EADDRINUSE') {
                console.error(`端口 ${config.port} 已被占用，请更换端口`);
            } else {
                console.error('服务器错误:', err.message);
            }
            process.exit(1);
        });
}

module.exports = {
    createApp,
    startServer,
    config,
    configPath,
    uploadsDir,
    VERSION,
    AUTHOR
};
