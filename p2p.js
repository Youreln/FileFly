/**
 * 飞传 FileFly - 在线互传模块（WebRTC P2P 直传）
 * 作者: Youreln
 *
 * 说明：无需服务器、无需下载客户端。
 * 打开本页即通过 PeerJS 公共信令建立浏览器间 P2P 连接，
 * 支持多设备互发文件，全链路点对点加密传输。
 */

(function () {
    'use strict';

    const CHUNK_SIZE = 64 * 1024; // 64KB 分片，避开信令消息上限并便于进度展示

    function $(id) { return document.getElementById(id); }

    const el = {
        status: null, dot: null, link: null, qrBox: null,
        peerInput: null, connectBtn: null, peerInfo: null,
        dropzone: null, fileInput: null, sendList: null, recvList: null,
        scanModal: null, scanVideo: null, scanCanvas: null, scanStatus: null
    };

    let peer = null;
    let myId = null;
    let conn = null;
    let connected = false;
    const transfers = new Map(); // fileId -> 传输上下文
    let sendQueue = [];          // 待发送文件队列
    let sending = false;
    let scanStream = null;        // 摄像头流
    let scanRaf = 0;              // 扫码动画帧
    let scanning = false;         // 是否正在扫码

    // ---------- 工具 ----------

    function deviceName() {
        const ua = navigator.userAgent;
        let dev = '电脑';
        if (/Android/i.test(ua) || /iPhone|iPad|iPod/i.test(ua)) dev = '手机';
        let os = '未知系统';
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Mac OS X/.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
        return dev + ' · ' + os;
    }

    function fmtSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(2) + ' GB';
    }

    function setStatus(text, state) {
        if (!el.status) return;
        el.status.innerHTML = '<span class="p2p-dot ' + state + '"></span> ' + text;
    }

    function setPeerInfo(text) {
        if (el.peerInfo) el.peerInfo.textContent = text;
    }

    function toast(text) {
        const box = $('toastContainer');
        if (!box) return;
        const div = document.createElement('div');
        div.className = 'toast';
        div.textContent = text;
        box.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    // ---------- 状态展示 ----------

    function renderPeerState() {
        if (!peer || !myId) {
            setStatus('正在连接信令服务...', 'connecting');
            return;
        }
        if (connected) {
            setStatus('已连接', 'online');
        } else {
            setStatus('在线等待 · 发送链接给对端即可互传', 'online');
        }
    }

    // ---------- 建立 Peer ----------

    function setupPeer() {
        if (peer) { try { peer.destroy(); } catch (e) { /* 忽略 */ } peer = null; }
        myId = null;
        setStatus('正在连接信令服务...', 'connecting');

        try {
            peer = new Peer();
        } catch (e) {
            setStatus('浏览器不支持 WebRTC', 'offline');
            return;
        }

        peer.on('open', (id) => {
            myId = id;
            const url = new URL(location.href);
            url.searchParams.set('p2p', id);
            if (el.link) el.link.value = url.toString();
            if (el.qrBox) {
                el.qrBox.innerHTML = '';
                try {
                    new QRCode(el.qrBox, { text: url.toString(), width: 168, height: 168 });
                } catch (e) { console.warn('QR 生成失败', e); }
            }
            renderPeerState();

            // 从分享链接打开时自动连接对端
            const target = new URLSearchParams(location.search).get('p2p');
            if (target && target !== id) {
                setTimeout(() => dial(target), 600);
            }
        });

        peer.on('connection', (incoming) => {
            if (conn && conn.open) {
                // 已有一个连接，拒绝新的（保持简单、防串扰）
                try { incoming.close(); } catch (e) { /* 忽略 */ }
                return;
            }
            bindConn(incoming);
        });

        peer.on('error', (err) => {
            console.warn('[p2p] peer error:', err);
            if (err && err.type === 'unavailable-id') {
                setupPeer();
                return;
            }
            setStatus('连接出错：' + (err && err.type ? err.type : '未知错误'), 'offline');
        });

        peer.on('disconnected', () => {
            if (myId) {
                setStatus('信令连接中断，尝试重连...', 'connecting');
                setTimeout(() => { try { peer.reconnect(); } catch (e) { /* 忽略 */ } }, 1500);
            }
        });
    }

    // ---------- 数据连接 ----------

    function bindConn(c) {
        conn = c;
        connected = false;
        setPeerInfo('正在连接对方...');

        c.on('open', () => {
            connected = true;
            c.send({ t: 'hello', name: deviceName() });
            renderPeerState();
            setPeerInfo('已连接对方设备');
            // 连接就绪后发送排队文件
            trySendNext();
        });

        c.on('data', (data) => {
            if (!data || typeof data !== 'object') return;
            if (data.t === 'hello') {
                setPeerInfo('已连接：' + (data.name || '对方设备'));
                return;
            }
            handleMessage(data);
        });

        c.on('close', () => {
            connected = false;
            conn = null;
            renderPeerState();
            setPeerInfo('连接已断开');
            sendQueue = [];
            sending = false;
            // 中断中的任务标记失败
            transfers.forEach((t) => {
                if (t.type === 'recv' && !t.done) {
                    updateRecvItem(t, '失败');
                }
                if (t.type === 'send' && !t.done) {
                    updateSendItem(t, '中断');
                    removeSendItem(t);
                }
                if (t.url) URL.revokeObjectURL(t.url);
            });
            transfers.clear();
        });

        c.on('error', (err) => {
            console.warn('[p2p] conn error:', err);
        });
    }

    function dial(remoteId) {
        const id = String(remoteId || '').trim();
        if (!id) return;
        // 支持粘贴完整链接，自动抽取 p2p 参数
        let target = id;
        if (/^https?:\/\//i.test(id)) {
            const u = new URL(id);
            const p = u.searchParams.get('p2p');
            target = p || u.hostname + u.pathname.replace(/\/$/, '');
        }
        if (conn) { try { conn.close(); } catch (e) { /* 忽略 */ } conn = null; connected = false; }
        setPeerInfo('正在连接 ' + target + ' ...');
        if (!peer || !myId) {
            toast('请等待本机上线后再连接');
            return;
        }
        try {
            bindConn(peer.connect(target, { reliable: true }));
        } catch (e) {
            setPeerInfo('连接失败');
            toast('连接失败：' + e.message);
        }
    }

    // ---------- 消息处理 ----------

    function handleMessage(msg) {
        switch (msg.t) {
            case 'meta': onRecvMeta(msg); break;
            case 'ack': onSendAck(msg); break;
            case 'chunk': onRecvChunk(msg); break;
            case 'done': onRecvDone(msg); break;
            case 'ackdone': onSendAckDone(msg); break;
            case 'cancel': onRecvCancelForSend(msg); break;
            default: break;
        }
    }

    // ---- 接收侧 ----

    function onRecvMeta(msg) {
        if (!conn || !conn.open) return;
        const ctx = {
            type: 'recv',
            fileId: msg.fileId,
            name: msg.name,
            size: msg.size,
            mime: msg.mime || 'application/octet-stream',
            chunks: msg.chunks,
            received: 0,
            parts: [],
            done: false
        };
        transfers.set(msg.fileId, ctx);
        addRecvItem(ctx);
        conn.send({ t: 'ack', fileId: msg.fileId });
    }

    function onRecvChunk(msg) {
        const ctx = transfers.get(msg.fileId);
        if (!ctx || ctx.type !== 'recv' || ctx.done) return;
        let bytes = 0;
        if (typeof msg.data === 'string') {
            // BinaryPack 偶发将字节数组序列化为字符串，做一次恢复
            const buf = new Uint8Array(msg.data.length);
            for (let i = 0; i < msg.data.length; i++) buf[i] = msg.data.charCodeAt(i) & 0xff;
            ctx.parts.push(buf);
            bytes = buf.length;
        } else if (msg.data instanceof ArrayBuffer) {
            const buf = new Uint8Array(msg.data);
            ctx.parts.push(buf);
            bytes = buf.length;
        } else if (msg.data && msg.data.buffer instanceof ArrayBuffer) {
            ctx.parts.push(new Uint8Array(msg.data));
            bytes = msg.data.length;
        } else {
            return;
        }
        ctx.received += bytes;
        updateRecvItem(ctx);
    }

    function onRecvDone(msg) {
        const ctx = transfers.get(msg.fileId);
        if (!ctx || ctx.type !== 'recv' || ctx.done) return;
        ctx.done = true;
        // 校验完整性
        let total = 0;
        ctx.parts.forEach((p) => { total += p.length; });
        if (total < ctx.size) {
            updateRecvItem(ctx, '不完整，已放弃');
            if (conn && conn.open) conn.send({ t: 'cancel', fileId: msg.fileId });
            return;
        }
        try {
            const blob = new Blob(ctx.parts, { type: ctx.mime });
            ctx.url = URL.createObjectURL(blob);
            updateRecvItem(ctx, '完成');
            saveRecvItem(ctx);
            if (conn && conn.open) conn.send({ t: 'ackdone', fileId: msg.fileId });
        } catch (e) {
            updateRecvItem(ctx, '保存失败');
        }
    }

    function onRecvCancel(msg) {
        const ctx = transfers.get(msg.fileId);
        if (!ctx || ctx.type !== 'recv') return;
        ctx.done = true;
        updateRecvItem(ctx, '对方取消');
        if (ctx.url) URL.revokeObjectURL(ctx.url);
        transfers.delete(msg.fileId);
    }

    // ---- 发送侧 ----

    function queueFiles(fileList) {
        if (!connected) {
            toast('尚未连接对方，请先建立连接');
            return;
        }
        Array.from(fileList).forEach((f) => {
            sendQueue.push(f);
        });
        trySendNext();
    }

    function trySendNext() {
        if (sending || !connected || !conn || sendQueue.length === 0) return;
        const file = sendQueue.shift();
        startSendFile(file);
    }

    function startSendFile(file) {
        sending = true;
        const fileId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        const chunks = Math.ceil(file.size / CHUNK_SIZE);
        const ctx = {
            type: 'send',
            fileId: fileId,
            file: file,
            name: file.name,
            size: file.size,
            mime: file.type || 'application/octet-stream',
            chunks: chunks,
            sent: 0,
            seq: 0,
            done: false
        };
        transfers.set(fileId, ctx);
        addSendItem(ctx);
        conn.send({
            t: 'meta', fileId: fileId, name: file.name, size: file.size,
            mime: file.type || 'application/octet-stream', chunks: chunks
        });
    }

    function onSendAck(msg) {
        const ctx = transfers.get(msg.fileId);
        if (!ctx || ctx.type !== 'send' || ctx.done) return;
        pumpChunks(ctx);
    }

    async function pumpChunks(ctx) {
        if (ctx.done || !conn || !conn.open) return;
        const step = Math.min(64, ctx.chunks - ctx.seq); // 每帧发送 64 片后让出主线程
        for (let i = 0; i < step; i++) {
            if (ctx.seq >= ctx.chunks) break;
            const start = ctx.seq * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, ctx.size);
            const slice = ctx.file.slice(start, end);
            // 关键：必须转成 ArrayBuffer 再发送，Blob 无法被 BinaryPack 正确序列化
            const buf = await slice.arrayBuffer();
            try {
                conn.send({ t: 'chunk', fileId: ctx.fileId, seq: ctx.seq, data: buf });
            } catch (e) {
                updateSendItem(ctx, '发送失败');
                ctx.done = true;
                return;
            }
            ctx.sent += (end - start);
            ctx.seq++;
        }
        updateSendItem(ctx);
        if (ctx.seq >= ctx.chunks) {
            // 分片全部发送完毕，通知接收端组装保存
            try {
                conn.send({ t: 'done', fileId: ctx.fileId });
            } catch (e) {
                updateSendItem(ctx, '发送失败');
                ctx.done = true;
            }
            return;
        }
        setTimeout(() => pumpChunks(ctx), 0);
    }

    function onSendAckDone(msg) {
        const ctx = transfers.get(msg.fileId);
        if (!ctx || ctx.type !== 'send') return;
        ctx.done = true;
        updateSendItem(ctx, '完成');
        transfers.delete(msg.fileId);
        setTimeout(() => { removeSendItem(ctx); }, 2500);
        sending = false;
        trySendNext();
    }

    function onRecvCancelForSend(msg) {
        const ctx = transfers.get(msg.fileId);
        if (!ctx || ctx.type !== 'send') return;
        ctx.done = true;
        updateSendItem(ctx, '对方取消');
        transfers.delete(msg.fileId);
        setTimeout(() => { removeSendItem(ctx); }, 2500);
        sending = false;
        trySendNext();
    }

    // ---------- UI 渲染 ----------

    function addSendItem(ctx) {
        const row = document.createElement('div');
        row.className = 'p2p-item';
        row.id = 'p2psend-' + ctx.fileId;
        row.innerHTML =
            '<span class="p2p-item-name" title="' + esc(ctx.name) + '"><i class="fas fa-arrow-up"></i> ' + esc(ctx.name) + '</span>' +
            '<div class="p2p-item-bar"><div class="p2p-item-fill"></div></div>' +
            '<span class="p2p-item-pct">0%</span>';
        el.sendList.appendChild(row);
    }

    function addRecvItem(ctx) {
        const row = document.createElement('div');
        row.className = 'p2p-item recv';
        row.id = 'p2precv-' + ctx.fileId;
        row.innerHTML =
            '<span class="p2p-item-name" title="' + esc(ctx.name) + '"><i class="fas fa-arrow-down"></i> ' + esc(ctx.name) + '</span>' +
            '<div class="p2p-item-bar"><div class="p2p-item-fill"></div></div>' +
            '<span class="p2p-item-pct">0%</span>';
        el.recvList.appendChild(row);
    }

    function updateSendItem(ctx, suffix) {
        const row = $('p2psend-' + ctx.fileId);
        if (!row) return;
        const pct = ctx.size > 0 ? Math.min(100, Math.round((ctx.sent / ctx.size) * 100)) : 0;
        row.querySelector('.p2p-item-fill').style.width = pct + '%';
        row.querySelector('.p2p-item-pct').textContent =
            (suffix ? suffix + ' · ' : '') + pct + '% · ' + fmtSize(ctx.sent) + ' / ' + fmtSize(ctx.size);
    }

    function updateRecvItem(ctx, suffix) {
        const row = $('p2precv-' + ctx.fileId);
        if (!row) return;
        const pct = ctx.size > 0 ? Math.min(100, Math.round((ctx.received / ctx.size) * 100)) : 0;
        row.querySelector('.p2p-item-fill').style.width = pct + '%';
        row.querySelector('.p2p-item-pct').textContent =
            (suffix ? suffix + ' · ' : '') + pct + '% · ' + fmtSize(ctx.received) + ' / ' + fmtSize(ctx.size);
    }

    function saveRecvItem(ctx) {
        const row = $('p2precv-' + ctx.fileId);
        if (!row) return;
        const btn = document.createElement('button');
        btn.className = 'p2p-save-btn';
        btn.innerHTML = '<i class="fas fa-download"></i> 保存';
        btn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = ctx.url;
            a.download = ctx.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
        row.appendChild(btn);
        // 自动触发一次下载（浏览器可能拦截，按钮兜底）
        setTimeout(() => btn.click(), 300);
    }

    function removeSendItem(ctx) {
        const row = $('p2psend-' + ctx.fileId);
        if (row) row.remove();
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    }

    // ---------- 扫码连接（摄像头扫描对方二维码） ----------

    function openScanner() {
        if (scanning) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast('当前环境不支持摄像头扫码（需 HTTPS 或 localhost）');
            return;
        }
        if (typeof jsQR !== 'function') {
            toast('扫码组件加载失败，请刷新页面重试');
            return;
        }
        if (!peer || !myId) {
            toast('请等待本机上线后再扫码');
            return;
        }
        scanning = true;
        el.scanModal.classList.remove('hidden');
        setScanStatus('正在启动摄像头...');
        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        }).then((stream) => {
            scanStream = stream;
            el.scanVideo.srcObject = stream;
            el.scanVideo.play().catch(() => { });
            setScanStatus('请将对方设备上的二维码对准摄像头');
            scanRaf = requestAnimationFrame(tick);
        }).catch((err) => {
            console.warn('[p2p] camera error:', err);
            let msg = '摄像头启动失败';
            if (err && err.name === 'NotAllowedError') msg = '摄像头权限被拒绝，请在浏览器设置中允许后重试';
            else if (err && err.name === 'NotFoundError') msg = '未检测到可用摄像头';
            else if (err && err.name === 'NotReadableError') msg = '摄像头被其他应用占用，请关闭后重试';
            else if (err && err.name === 'SecurityError') msg = '摄像头需要 HTTPS 或 localhost 环境';
            setScanStatus(msg);
            closeScanner(true);
            toast(msg);
        });
    }

    function setScanStatus(text) {
        if (el.scanStatus) el.scanStatus.textContent = text;
    }

    function tick() {
        if (!scanning) return;
        const video = el.scanVideo;
        const canvas = el.scanCanvas;
        if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
            const scale = Math.min(1, 640 / video.videoWidth);
            const w = Math.max(2, Math.round(video.videoWidth * scale));
            const h = Math.max(2, Math.round(video.videoHeight * scale));
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(video, 0, 0, w, h);
            try {
                const img = ctx.getImageData(0, 0, w, h);
                const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
                if (code && code.data && handleScanResult(code.data)) {
                    return; // 识别成功并已开始连接，停止扫描
                }
            } catch (e) { /* 单帧解码失败忽略 */ }
        }
        scanRaf = requestAnimationFrame(tick);
    }

    function handleScanResult(data) {
        const url = String(data || '').trim();
        let id = null;
        if (/p2p=([\w-]+)/i.test(url)) {
            id = url.match(/p2p=([\w-]+)/i)[1];
        } else if (/^[\w-]{8,}$/.test(url)) {
            id = url; // 二维码内容直接是 Peer ID
        }
        if (!id || id === myId) return false; // 未识别或扫到自己的码，继续
        setScanStatus('识别成功，正在连接...');
        closeScanner(false);
        setTimeout(() => dial(id), 200);
        return true;
    }

    function closeScanner(keepModal) {
        scanning = false;
        cancelAnimationFrame(scanRaf);
        if (scanStream) {
            scanStream.getTracks().forEach((t) => t.stop());
            scanStream = null;
        }
        if (el.scanVideo) el.scanVideo.srcObject = null;
        if (!keepModal && el.scanModal) el.scanModal.classList.add('hidden');
    }

    // ---------- 事件绑定 ----------

    function bindEvents() {
        $('p2pCopy').addEventListener('click', copyLink);

        $('p2pScanBtn').addEventListener('click', openScanner);
        $('p2pScanClose').addEventListener('click', () => closeScanner(false));
        $('p2pScanCancel').addEventListener('click', () => closeScanner(false));
        el.scanModal.addEventListener('click', (e) => {
            if (e.target === el.scanModal) closeScanner(false);
        });

        $('p2pConnectBtn').addEventListener('click', () => {
            dial(el.peerInput.value);
        });
        el.peerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') dial(el.peerInput.value);
        });

        el.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.dropzone.classList.add('dragging');
        });
        el.dropzone.addEventListener('dragleave', () => {
            el.dropzone.classList.remove('dragging');
        });
        el.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            el.dropzone.classList.remove('dragging');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                queueFiles(e.dataTransfer.files);
            }
        });
        el.dropzone.addEventListener('click', (e) => {
            if (e.target.closest('input')) return;
            el.fileInput.click();
        });
        el.fileInput.addEventListener('change', () => {
            if (el.fileInput.files && el.fileInput.files.length) {
                queueFiles(el.fileInput.files);
            }
            el.fileInput.value = '';
        });
    }

    function copyLink() {
        if (!el.link.value) {
            toast('链接生成中，请稍候');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(el.link.value).then(
                () => toast('链接已复制，发送给对方即可互传'),
                () => fallbackCopy()
            );
        } else {
            fallbackCopy();
        }
    }

    function fallbackCopy() {
        const input = el.link;
        input.select();
        input.setSelectionRange(0, input.value.length);
        try {
            document.execCommand('copy');
            toast('链接已复制');
        } catch (e) {
            toast('复制失败，请手动复制');
        }
    }

    // ---------- 启动 ----------

    function init() {
        const sec = $('p2pSection');
        if (!sec) return;

        el.status = $('p2pStatus');
        el.link = $('p2pLink');
        el.qrBox = $('p2pQr');
        el.peerInput = $('p2pPeerId');
        el.connectBtn = $('p2pConnectBtn');
        el.peerInfo = $('p2pPeerInfo');
        el.dropzone = $('p2pDropzone');
        el.fileInput = $('p2pFileInput');
        el.sendList = $('p2pSendList');
        el.recvList = $('p2pRecvList');
        el.scanModal = $('p2pScanModal');
        el.scanVideo = $('p2pScanVideo');
        el.scanCanvas = $('p2pScanCanvas');
        el.scanStatus = $('p2pScanStatus');

        // 测试钩子：无摄像头环境下模拟扫码识别结果，验证连接链路
        window.__fileflyScanTest = (data) => handleScanResult(data);

        bindEvents();
        setStatus('正在连接信令服务...', 'connecting');
        setupPeer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
