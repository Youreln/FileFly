import { generateKey, encryptData, decryptData } from './security'
import { WebRTCClient, WebRTCMessageType, webRTCManager } from './webrtc'

// 传输状态枚举
export enum TransferStatus {
  PENDING = 'pending',
  TRANSFERRING = 'transferring',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// 文件传输任务接口
export interface TransferTask {
  id: string
  fileName: string
  fileSize: number
  deviceId: string
  deviceName: string
  status: TransferStatus
  progress: number
  speed: number
  estimatedTime: string
  chunks: {
    total: number
    completed: number
  }
  startTime: Date
  lastUpdated: Date
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

// 文件传输配置
export interface TransferConfig {
  chunkSize: number // 分块大小，默认 64KB
  maxRetries: number // 最大重试次数
  retryDelay: number // 重试延迟（毫秒）
  concurrencyLimit: number // 并发传输限制
}

// 默认传输配置
const DEFAULT_CONFIG: TransferConfig = {
  chunkSize: 64 * 1024, // 64KB
  maxRetries: 3,
  retryDelay: 1000,
  concurrencyLimit: 3
}

// 文件传输管理器类
export class FileTransferManager {
  private config: TransferConfig
  private tasks: TransferTask[] = []
  private activeTasks: number = 0
  private cryptoKey: CryptoKey | null = null

  constructor(config: Partial<TransferConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }
    this.initCrypto()
  }

  // 初始化加密密钥
  private async initCrypto() {
    this.cryptoKey = await generateKey()
  }

  // 创建传输任务
  createTask(file: File, deviceId: string, deviceName: string): TransferTask {
    const task: TransferTask = {
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      deviceId,
      deviceName,
      status: TransferStatus.PENDING,
      progress: 0,
      speed: 0,
      estimatedTime: '计算中',
      chunks: {
        total: Math.ceil(file.size / this.config.chunkSize),
        completed: 0
      },
      startTime: new Date(),
      lastUpdated: new Date()
    }

    this.tasks.push(task)
    this.processNextTask()
    return task
  }

  // 处理下一个任务
  private async processNextTask() {
    if (this.activeTasks >= this.config.concurrencyLimit) {
      return
    }

    const pendingTask = this.tasks.find(t => t.status === TransferStatus.PENDING)
    if (!pendingTask) {
      return
    }

    this.activeTasks++
    pendingTask.status = TransferStatus.TRANSFERRING
    
    try {
      // 注意：这里需要从外部获取 file 对象
      // 由于是模拟环境，我们暂时跳过实际传输
      await new Promise(resolve => setTimeout(resolve, 2000))
      pendingTask.status = TransferStatus.COMPLETED
      pendingTask.progress = 100
      pendingTask.speed = 0
      pendingTask.estimatedTime = '已完成'
    } catch (error) {
      console.error('Transfer failed:', error)
      pendingTask.status = TransferStatus.FAILED
      pendingTask.speed = 0
      pendingTask.estimatedTime = '传输失败'
    } finally {
      this.activeTasks--
      this.processNextTask()
    }
  }

  // 传输文件
  async transferFile(file: File, deviceId: string): Promise<TransferTask> {
    const task = this.createTask(file, deviceId, '设备 ' + deviceId.substr(0, 4))
    
    // 获取 WebRTC 客户端
    const client = webRTCManager.getClient(deviceId)
    if (!client) {
      task.status = TransferStatus.FAILED
      task.errorMessage = 'WebRTC 连接不存在'
      return task
    }

    const totalChunks = task.chunks.total
    const chunkSize = this.config.chunkSize

    for (let i = 0; i < totalChunks; i++) {
      if (task.status === TransferStatus.CANCELLED) {
        break
      }

      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      try {
        const chunkData = await this.readChunk(chunk)
        const fileChunk: FileChunk = {
          transferId: task.id,
          chunkIndex: i,
          totalChunks,
          chunkSize: end - start,
          totalSize: file.size,
          data: chunkData,
          fileName: file.name,
          fileType: file.type
        }

        // 加密文件块
        if (this.cryptoKey) {
          fileChunk.data = await this.encryptChunk(fileChunk.data)
        }

        // 使用 WebRTC 发送文件块
        const success = client.sendFileChunk(fileChunk)
        if (!success) {
          throw new Error('Failed to send chunk')
        }

        task.chunks.completed++
        task.progress = (task.chunks.completed / totalChunks) * 100
        task.lastUpdated = new Date()

        // 计算速度和估计时间
        this.updateTaskMetrics(task)
      } catch (error) {
        console.error('Chunk transfer failed:', error)
        // 重试机制
        for (let retry = 0; retry < this.config.maxRetries; retry++) {
          try {
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
            const chunkData = await this.readChunk(chunk)
            const fileChunk: FileChunk = {
              transferId: task.id,
              chunkIndex: i,
              totalChunks,
              chunkSize: end - start,
              totalSize: file.size,
              data: chunkData,
              fileName: file.name,
              fileType: file.type
            }

            if (this.cryptoKey) {
              fileChunk.data = await this.encryptChunk(fileChunk.data)
            }

            const success = client.sendFileChunk(fileChunk)
            if (success) {
              task.chunks.completed++
              break
            }
          } catch (retryError) {
            console.error(`Retry ${retry + 1} failed:`, retryError)
          }
        }
      }
    }

    if (task.chunks.completed === totalChunks) {
      task.status = TransferStatus.COMPLETED
      task.progress = 100
      task.speed = 0
      task.estimatedTime = '已完成'
    } else {
      task.status = TransferStatus.FAILED
      task.errorMessage = '传输未完成'
    }

    return task
  }

  // 读取文件块
  private async readChunk(chunk: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(chunk)
    })
  }

  // 加密文件块
  private async encryptChunk(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.cryptoKey) {
      return data
    }
    const encrypted = await encryptData(data, this.cryptoKey)
    return new TextEncoder().encode(encrypted).buffer
  }

  // 解密文件块
  private async decryptChunk(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.cryptoKey) {
      return data
    }
    const encryptedString = new TextDecoder().decode(data)
    const decrypted = await decryptData(encryptedString, this.cryptoKey)
    return new TextEncoder().encode(decrypted).buffer
  }

  // 更新任务 metrics
  private updateTaskMetrics(task: TransferTask) {
    const now = new Date()
    const elapsed = (now.getTime() - task.startTime.getTime()) / 1000
    const transferred = task.chunks.completed * this.config.chunkSize
    
    if (elapsed > 0) {
      task.speed = transferred / elapsed
      const remaining = task.fileSize - transferred
      const remainingTime = remaining / task.speed
      task.estimatedTime = this.formatTime(remainingTime)
    }
  }

  // 格式化时间
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}分${Math.round(seconds % 60)}秒`
    } else {
      return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`
    }
  }

  // 取消传输
  cancelTransfer(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId)
    if (task) {
      task.status = TransferStatus.CANCELLED
      task.speed = 0
    }
  }

  // 暂停传输
  pauseTransfer(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && task.status === TransferStatus.TRANSFERRING) {
      task.status = TransferStatus.PENDING
    }
  }

  // 恢复传输
  resumeTransfer(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && task.status === TransferStatus.PENDING) {
      task.status = TransferStatus.TRANSFERRING
      this.processNextTask()
    }
  }

  // 获取任务列表
  getTasks(): TransferTask[] {
    return this.tasks
  }

  // 获取任务
  getTask(taskId: string): TransferTask | undefined {
    return this.tasks.find(t => t.id === taskId)
  }

  // 清除完成的任务
  clearCompletedTasks(): void {
    this.tasks = this.tasks.filter(t => t.status !== TransferStatus.COMPLETED)
  }

  // 清除失败的任务
  clearFailedTasks(): void {
    this.tasks = this.tasks.filter(t => t.status !== TransferStatus.FAILED)
  }
}

// 进度跟踪器类
export class ProgressTracker {
  private totalSize: number
  private transferred: number
  private startTime: Date
  private lastUpdate: Date
  private lastTransferred: number

  constructor(totalSize: number) {
    this.totalSize = totalSize
    this.transferred = 0
    this.startTime = new Date()
    this.lastUpdate = new Date()
    this.lastTransferred = 0
  }

  // 更新进度
  update(amount: number): void {
    this.transferred += amount
    this.lastUpdate = new Date()
  }

  // 获取进度百分比
  getProgress(): number {
    return Math.min((this.transferred / this.totalSize) * 100, 100)
  }

  // 获取传输速度（字节/秒）
  getSpeed(): number {
    const elapsed = (this.lastUpdate.getTime() - this.startTime.getTime()) / 1000
    return elapsed > 0 ? this.transferred / elapsed : 0
  }

  // 获取平均速度
  getAverageSpeed(): number {
    const elapsed = (this.lastUpdate.getTime() - this.startTime.getTime()) / 1000
    return elapsed > 0 ? this.transferred / elapsed : 0
  }

  // 获取瞬时速度
  getInstantSpeed(): number {
    const elapsed = (this.lastUpdate.getTime() - this.startTime.getTime()) / 1000
    const transferred = this.transferred - this.lastTransferred
    this.lastTransferred = this.transferred
    return elapsed > 0 ? transferred / elapsed : 0
  }

  // 获取估计完成时间
  getEstimatedTime(): string {
    const speed = this.getSpeed()
    if (speed === 0) return '计算中'
    const remaining = this.totalSize - this.transferred
    const seconds = remaining / speed
    return this.formatTime(seconds)
  }

  // 格式化时间
  private formatTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${Math.round(seconds % 60)}秒`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`
  }
}

// 导出默认实例
export const fileTransferManager = new FileTransferManager()
