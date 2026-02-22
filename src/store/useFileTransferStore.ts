import { create } from 'zustand'
import { uploadFile, downloadFile, cancelTransfer as cancelApiTransfer } from '../utils/restApi'

interface TransferItem {
  id: string
  deviceId: string
  deviceName: string
  fileName: string
  fileSize: number
  progress: number
  speed: number
  averageSpeed: number
  estimatedTime: string
  status: 'pending' | 'transferring' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  errorMessage?: string
  file?: File
  chunks?: {
    total: number
    completed: number
  }
}

interface FileTransferState {
  // 传输列表
  transfers: TransferItem[]
  
  // 统计信息
  totalTransfers: number
  completedTransfers: number
  failedTransfers: number
  
  // 操作方法
  sendFileToDevice: (deviceId: string) => void
  pauseTransfer: (transferId: string) => void
  resumeTransfer: (transferId: string) => void
  cancelTransfer: (transferId: string) => void
  retryTransfer: (transferId: string) => void
  removeTransfer: (transferId: string) => void
  clearCompletedTransfers: () => void
  clearFailedTransfers: () => void
  getTransferStats: () => { total: number; completed: number; failed: number; inProgress: number }
}

// 生成传输ID
const generateTransferId = (): string => {
  return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 模拟设备名称
const getDeviceName = (deviceId: string): string => {
  const deviceNames: Record<string, string> = {
    'device_1': '笔记本电脑',
    'device_2': '手机',
    'device_3': '平板'
  }
  return deviceNames[deviceId] || '未知设备'
}

// 格式化文件大小
export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB'
  return (bytes / 1073741824).toFixed(2) + ' GB'
}

// 格式化传输速度
export const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) return bytesPerSecond.toFixed(2) + ' B/s'
  if (bytesPerSecond < 1048576) return (bytesPerSecond / 1024).toFixed(2) + ' KB/s'
  if (bytesPerSecond < 1073741824) return (bytesPerSecond / 1048576).toFixed(2) + ' MB/s'
  return (bytesPerSecond / 1073741824).toFixed(2) + ' GB/s'
}

// 计算剩余时间
export const calculateRemainingTime = (transfer: TransferItem): string => {
  if (transfer.progress >= 100 || transfer.speed === 0) return '0s'
  const remainingBytes = transfer.fileSize * (1 - transfer.progress / 100)
  const remainingSeconds = remainingBytes / transfer.speed
  if (remainingSeconds < 60) return Math.ceil(remainingSeconds) + 's'
  if (remainingSeconds < 3600) return Math.ceil(remainingSeconds / 60) + 'm'
  return Math.ceil(remainingSeconds / 3600) + 'h'
}

export const useFileTransferStore = create<FileTransferState>((set, get) => ({
  // 初始化状态
  transfers: [],
  totalTransfers: 0,
  completedTransfers: 0,
  failedTransfers: 0,
  
  // 发送文件到设备
  sendFileToDevice: (deviceId: string) => {
    // 打开文件选择对话框
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files)
        files.forEach(file => {
          startFileTransfer(deviceId, file)
        })
      }
    }
    input.click()
  },
  
  // 暂停传输
  pauseTransfer: (transferId: string) => {
    const { transfers } = get()
    const updatedTransfers = transfers.map(transfer => {
      if (transfer.id === transferId) {
        return { ...transfer, status: 'pending' }
      }
      return transfer
    })
    set({ transfers: updatedTransfers })
  },
  
  // 恢复传输
  resumeTransfer: (transferId: string) => {
    const { transfers } = get()
    const updatedTransfers = transfers.map(transfer => {
      if (transfer.id === transferId) {
        return { ...transfer, status: 'transferring' }
      }
      return transfer
    })
    set({ transfers: updatedTransfers })
    
    // 继续模拟传输
    simulateFileTransfer(transferId)
  },
  
  // 取消传输
  cancelTransfer: async (transferId: string) => {
    const { transfers } = get()
    const transfer = transfers.find(t => t.id === transferId)
    
    if (transfer) {
      try {
        // 在实际应用中，这里应该调用 API 取消传输
        // await cancelApiTransfer(transferId, transfer.deviceIp, transfer.devicePort)
        
        const updatedTransfers = transfers.map(t => {
          if (t.id === transferId) {
            return { ...t, status: 'failed', errorMessage: '传输已取消' }
          }
          return t
        })
        set({ transfers: updatedTransfers })
      } catch (error) {
        console.error('Error canceling transfer:', error)
      }
    }
  },
  
  // 重试传输
  retryTransfer: (transferId: string) => {
    const { transfers } = get()
    const updatedTransfers = transfers.map(transfer => {
      if (transfer.id === transferId) {
        return { 
          ...transfer, 
          status: 'transferring', 
          progress: 0, 
          speed: 0, 
          averageSpeed: 0,
          estimatedTime: '计算中...',
          errorMessage: undefined
        }
      }
      return transfer
    })
    set({ transfers: updatedTransfers })
    
    // 重新模拟传输
    simulateFileTransfer(transferId)
  },
  
  // 移除传输
  removeTransfer: (transferId: string) => {
    const { transfers } = get()
    const updatedTransfers = transfers.filter(transfer => transfer.id !== transferId)
    set({ transfers: updatedTransfers })
  },
  
  // 清除已完成的传输
  clearCompletedTransfers: () => {
    const { transfers } = get()
    const updatedTransfers = transfers.filter(transfer => transfer.status !== 'completed')
    set({ transfers: updatedTransfers })
  },
  
  // 清除失败的传输
  clearFailedTransfers: () => {
    const { transfers } = get()
    const updatedTransfers = transfers.filter(transfer => transfer.status !== 'failed')
    set({ transfers: updatedTransfers })
  },
  
  // 获取传输统计信息
  getTransferStats: () => {
    const { transfers } = get()
    const total = transfers.length
    const completed = transfers.filter(t => t.status === 'completed').length
    const failed = transfers.filter(t => t.status === 'failed').length
    const inProgress = transfers.filter(t => t.status === 'transferring').length
    
    return { total, completed, failed, inProgress }
  }
}))

// 开始文件传输
const startFileTransfer = (deviceId: string, file: File) => {
  const store = useFileTransferStore.getState()
  const deviceName = getDeviceName(deviceId)
  
  // 创建传输任务
  const transferId = generateTransferId()
  const totalChunks = Math.ceil(file.size / (5 * 1024 * 1024)) // 5MB 每块
  
  const transfer: TransferItem = {
    id: transferId,
    deviceId: deviceId,
    deviceName: deviceName,
    fileName: file.name,
    fileSize: file.size,
    progress: 0,
    speed: 0,
    averageSpeed: 0,
    estimatedTime: '计算中...',
    status: 'pending',
    startTime: new Date(),
    file: file,
    chunks: {
      total: totalChunks,
      completed: 0
    }
  }
  
  store.transfers.push(transfer)
  useFileTransferStore.setState({ 
    transfers: [...store.transfers],
    totalTransfers: store.transfers.length
  })
  
  // 模拟文件传输
  simulateFileTransfer(transferId)
}

// 模拟文件传输
const simulateFileTransfer = (transferId: string) => {
  const store = useFileTransferStore.getState()
  const transfer = store.transfers.find(t => t.id === transferId)
  if (!transfer) return
  
  // 更新状态为传输中
  const updatedTransfers = store.transfers.map(t => {
    if (t.id === transferId) {
      return { ...t, status: 'transferring' }
    }
    return t
  })
  useFileTransferStore.setState({ transfers: updatedTransfers })
  
  let progress = 0
  let completedChunks = 0
  const startTime = Date.now()
  const totalSize = transfer.fileSize
  const totalChunks = transfer.chunks?.total || 1
  const speeds: number[] = []
  
  const interval = setInterval(() => {
    const currentTransfer = useFileTransferStore.getState().transfers.find(t => t.id === transferId)
    if (!currentTransfer || currentTransfer.status !== 'transferring') {
      clearInterval(interval)
      return
    }
    
    // 模拟传输进度
    const chunkProgress = Math.random() * 15 // 每次传输 0-15% 的进度
    progress = Math.min(progress + chunkProgress, 100)
    
    // 计算已完成的块数
    completedChunks = Math.min(Math.floor((progress / 100) * totalChunks), totalChunks)
    
    // 计算速度
    const elapsedTime = (Date.now() - startTime) / 1000
    const transferredSize = (progress / 100) * totalSize
    const currentSpeed = transferredSize / elapsedTime
    
    // 记录速度用于计算平均值
    speeds.push(currentSpeed)
    if (speeds.length > 10) {
      speeds.shift() // 只保留最近 10 次的速度
    }
    
    const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
    
    // 计算估计剩余时间
    const remainingBytes = totalSize - transferredSize
    const estimatedTime = remainingBytes > 0 && currentSpeed > 0 
      ? calculateRemainingTime({ ...currentTransfer, speed: currentSpeed })
      : '0s'
    
    if (progress >= 100) {
      progress = 100
      completedChunks = totalChunks
      clearInterval(interval)
      
      // 完成传输
      const completedTransfers = useFileTransferStore.getState().transfers.map(t => {
        if (t.id === transferId) {
          return { 
            ...t, 
            status: 'completed', 
            progress: 100,
            endTime: new Date(),
            chunks: {
              total: totalChunks,
              completed: totalChunks
            }
          }
        }
        return t
      })
      
      const completedCount = completedTransfers.filter(t => t.status === 'completed').length
      useFileTransferStore.setState({ 
        transfers: completedTransfers,
        completedTransfers: completedCount
      })
      return
    }
    
    // 更新进度和速度
    const progressTransfers = useFileTransferStore.getState().transfers.map(t => {
      if (t.id === transferId) {
        return { 
          ...t, 
          progress, 
          speed: currentSpeed,
          averageSpeed,
          estimatedTime,
          chunks: {
            total: totalChunks,
            completed: completedChunks
          }
        }
      }
      return t
    })
    
    useFileTransferStore.setState({ transfers: progressTransfers })
  }, 300) // 更频繁地更新进度，使动画更流畅
}

// 工具函数：计算剩余时间
export const calculateRemainingTime = (transfer: TransferItem): string => {
  if (transfer.progress >= 100 || transfer.speed === 0) return '0s'
  const remainingBytes = transfer.fileSize * (1 - transfer.progress / 100)
  const remainingSeconds = remainingBytes / transfer.speed
  if (remainingSeconds < 60) return Math.ceil(remainingSeconds) + 's'
  if (remainingSeconds < 3600) return Math.ceil(remainingSeconds / 60) + 'm'
  return Math.ceil(remainingSeconds / 3600) + 'h'
}