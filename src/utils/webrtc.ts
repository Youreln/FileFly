// WebRTC 工具类，实现 P2P 传输功能

// WebRTC 连接状态
export enum WebRTCStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

// WebRTC 消息类型
export enum WebRTCMessageType {
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice_candidate',
  FILE_TRANSFER_START = 'file_transfer_start',
  FILE_TRANSFER_CHUNK = 'file_transfer_chunk',
  FILE_TRANSFER_COMPLETE = 'file_transfer_complete',
  FILE_TRANSFER_CANCEL = 'file_transfer_cancel',
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error'
}

// WebRTC 消息接口
export interface WebRTCMessage {
  type: WebRTCMessageType
  data?: any
  transferId?: string
  timestamp: number
}

// 文件块接口
export interface FileChunk {
  transferId: string
  chunkIndex: number
  totalChunks: number
  chunkSize: number
  totalSize: number
  data: ArrayBuffer
  fileName: string
  fileType: string
}

// WebRTC 配置
export interface WebRTCConfig {
  iceServers?: RTCIceServer[]
  iceTransportPolicy?: 'all' | 'relay'
  bundlePolicy?: 'balanced' | 'max-bundle' | 'max-compat'
  rtcpMuxPolicy?: 'require'
  iceCandidatePoolSize?: number
}

// 默认 WebRTC 配置
const DEFAULT_CONFIG: WebRTCConfig = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
    }
  ],
  iceCandidatePoolSize: 10
}

// WebRTC 客户端类
export class WebRTCClient {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private status: WebRTCStatus = WebRTCStatus.DISCONNECTED
  private messageHandlers: Map<WebRTCMessageType, ((message: WebRTCMessage) => void)[]>
  private config: WebRTCConfig
  private onConnect: (() => void) | null = null
  private onDisconnect: (() => void) | null = null
  private onError: ((error: Error) => void) | null = null

  constructor(config: WebRTCConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.messageHandlers = new Map()
  }

  // 初始化对等连接
  init() {
    this.peerConnection = new RTCPeerConnection(this.config)
    this.status = WebRTCStatus.DISCONNECTED

    // 监听连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return

      switch (this.peerConnection.connectionState) {
        case 'connected':
          this.status = WebRTCStatus.CONNECTED
          this.onConnect?.()
          break
        case 'disconnected':
        case 'closed':
          this.status = WebRTCStatus.DISCONNECTED
          this.onDisconnect?.()
          break
        case 'failed':
          this.status = WebRTCStatus.ERROR
          this.onError?.(new Error('WebRTC connection failed'))
          break
      }
    }

    // 监听 ICE 候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emitMessage({
          type: WebRTCMessageType.ICE_CANDIDATE,
          data: event.candidate,
          timestamp: Date.now()
        })
      }
    }

    // 监听数据通道
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel
      this.setupDataChannel()
    }
  }

  // 创建数据通道（发起方）
  createDataChannel() {
    if (!this.peerConnection) {
      this.init()
    }

    this.dataChannel = this.peerConnection!.createDataChannel('file-transfer', {
      ordered: true,
      maxRetransmits: 10
    })

    this.setupDataChannel()
  }

  // 设置数据通道
  private setupDataChannel() {
    if (!this.dataChannel) return

    this.dataChannel.onopen = () => {
      console.log('Data channel opened')
      this.status = WebRTCStatus.CONNECTED
      this.onConnect?.()
    }

    this.dataChannel.onclose = () => {
      console.log('Data channel closed')
      this.status = WebRTCStatus.DISCONNECTED
      this.onDisconnect?.()
    }

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error)
      this.status = WebRTCStatus.ERROR
      this.onError?.(error)
    }

    this.dataChannel.onmessage = (event) => {
      try {
        const message: WebRTCMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Error parsing WebRTC message:', error)
      }
    }
  }

  // 创建连接提议
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      this.init()
    }

    this.status = WebRTCStatus.CONNECTING
    const offer = await this.peerConnection!.createOffer()
    await this.peerConnection!.setLocalDescription(offer)
    return offer
  }

  // 处理连接提议
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      this.init()
    }

    this.status = WebRTCStatus.CONNECTING
    await this.peerConnection!.setRemoteDescription(offer)
    const answer = await this.peerConnection!.createAnswer()
    await this.peerConnection!.setLocalDescription(answer)
    return answer
  }

  // 处理连接应答
  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    await this.peerConnection.setRemoteDescription(answer)
  }

  // 处理 ICE 候选
  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  // 发送消息
  sendMessage(type: WebRTCMessageType, data?: any, transferId?: string): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false
    }

    const message: WebRTCMessage = {
      type,
      data,
      transferId,
      timestamp: Date.now()
    }

    try {
      this.dataChannel.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Error sending WebRTC message:', error)
      return false
    }
  }

  // 发送文件块
  sendFileChunk(chunk: FileChunk): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false
    }

    try {
      // 将 ArrayBuffer 转换为 Base64 字符串
      const dataStr = this.arrayBufferToBase64(chunk.data)
      const message: WebRTCMessage = {
        type: WebRTCMessageType.FILE_TRANSFER_CHUNK,
        data: {
          ...chunk,
          data: dataStr
        },
        transferId: chunk.transferId,
        timestamp: Date.now()
      }

      this.dataChannel.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Error sending file chunk:', error)
      return false
    }
  }

  // 接收消息
  on(type: WebRTCMessageType, handler: (message: WebRTCMessage) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)?.push(handler)
  }

  // 移除消息处理器
  off(type: WebRTCMessageType, handler: (message: WebRTCMessage) => void) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type)?.filter(h => h !== handler)
      if (handlers) {
        this.messageHandlers.set(type, handlers)
      }
    }
  }

  // 设置连接回调
  onConnect(handler: () => void) {
    this.onConnect = handler
  }

  // 设置断开回调
  onDisconnect(handler: () => void) {
    this.onDisconnect = handler
  }

  // 设置错误回调
  onError(handler: (error: Error) => void) {
    this.onError = handler
  }

  // 获取连接状态
  getStatus(): WebRTCStatus {
    return this.status
  }

  // 关闭连接
  close() {
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    this.status = WebRTCStatus.DISCONNECTED
  }

  // 处理接收到的消息
  private handleMessage(message: WebRTCMessage) {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message))
    }
  }

  // 触发消息
  private emitMessage(message: WebRTCMessage) {
    this.handleMessage(message)
  }

  // ArrayBuffer 转 Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Base64 转 ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return buffer
  }
}

// WebRTC 连接管理器
export class WebRTCManager {
  private clients: Map<string, WebRTCClient> = new Map()

  // 创建新的 WebRTC 客户端
  createClient(id: string, config?: WebRTCConfig): WebRTCClient {
    const client = new WebRTCClient(config)
    this.clients.set(id, client)
    return client
  }

  // 获取 WebRTC 客户端
  getClient(id: string): WebRTCClient | undefined {
    return this.clients.get(id)
  }

  // 移除 WebRTC 客户端
  removeClient(id: string) {
    const client = this.clients.get(id)
    if (client) {
      client.close()
      this.clients.delete(id)
    }
  }

  // 关闭所有连接
  closeAll() {
    this.clients.forEach(client => {
      client.close()
    })
    this.clients.clear()
  }

  // 获取连接数量
  size(): number {
    return this.clients.size
  }
}

// 导出默认实例
export const webRTCManager = new WebRTCManager()
