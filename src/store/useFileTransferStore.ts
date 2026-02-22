import { create } from 'zustand'
import { FileTransferManager, TransferTask, TransferStatus, fileTransferManager } from '../utils/fileTransfer'
import { webRTCManager } from '../utils/webrtc'

interface FileTransferState {
  // 传输列表
  transfers: TransferTask[]
  
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
          // 使用文件传输管理器创建任务
          const task = fileTransferManager.createTask(file, deviceId, '设备 ' + deviceId.substr(0, 4))
        })
        
        // 定期更新传输状态
        const updateInterval = setInterval(() => {
          const tasks = fileTransferManager.getTasks()
          set({ 
            transfers: tasks,
            totalTransfers: tasks.length,
            completedTransfers: tasks.filter(t => t.status === TransferStatus.COMPLETED).length,
            failedTransfers: tasks.filter(t => t.status === TransferStatus.FAILED).length
          })
          
          // 检查是否所有任务都已完成
          const allCompleted = tasks.every(task => 
            task.status === TransferStatus.COMPLETED || 
            task.status === TransferStatus.FAILED ||
            task.status === TransferStatus.CANCELLED
          )
          
          if (allCompleted) {
            clearInterval(updateInterval)
          }
        }, 500)
      }
    }
    input.click()
  },
  
  // 暂停传输
  pauseTransfer: (transferId: string) => {
    fileTransferManager.pauseTransfer(transferId)
    const tasks = fileTransferManager.getTasks()
    set({ 
      transfers: tasks,
      totalTransfers: tasks.length,
      completedTransfers: tasks.filter(t => t.status === TransferStatus.COMPLETED).length,
      failedTransfers: tasks.filter(t => t.status === TransferStatus.FAILED).length
    })
  },
  
  // 恢复传输
  resumeTransfer: (transferId: string) => {
    fileTransferManager.resumeTransfer(transferId)
    const tasks = fileTransferManager.getTasks()
    set({ 
      transfers: tasks,
      totalTransfers: tasks.length,
      completedTransfers: tasks.filter(t => t.status === TransferStatus.COMPLETED).length,
      failedTransfers: tasks.filter(t => t.status === TransferStatus.FAILED).length
    })
  },
  
  // 取消传输
  cancelTransfer: async (transferId: string) => {
    fileTransferManager.cancelTransfer(transferId)
    const tasks = fileTransferManager.getTasks()
    set({ 
      transfers: tasks,
      totalTransfers: tasks.length,
      completedTransfers: tasks.filter(t => t.status === TransferStatus.COMPLETED).length,
      failedTransfers: tasks.filter(t => t.status === TransferStatus.FAILED).length
    })
  },
  
  // 重试传输
  retryTransfer: (transferId: string) => {
    // 这里可以实现重试逻辑
    console.log('Retry transfer:', transferId)
  },
  
  // 移除传输
  removeTransfer: (transferId: string) => {
    // 从传输管理器中移除任务
    // 由于 FileTransferManager 没有提供直接移除方法，我们需要更新存储
    const { transfers } = get()
    const updatedTransfers = transfers.filter(transfer => transfer.id !== transferId)
    set({ 
      transfers: updatedTransfers,
      totalTransfers: updatedTransfers.length,
      completedTransfers: updatedTransfers.filter(t => t.status === TransferStatus.COMPLETED).length,
      failedTransfers: updatedTransfers.filter(t => t.status === TransferStatus.FAILED).length
    })
  },
  
  // 清除已完成的传输
  clearCompletedTransfers: () => {
    fileTransferManager.clearCompletedTasks()
    const tasks = fileTransferManager.getTasks()
    set({ 
      transfers: tasks,
      totalTransfers: tasks.length,
      completedTransfers: tasks.filter(t => t.status === TransferStatus.COMPLETED).length,
      failedTransfers: tasks.filter(t => t.status === TransferStatus.FAILED).length
    })
  },
  
  // 清除失败的传输
  clearFailedTransfers: () => {
    fileTransferManager.clearFailedTasks()
    const tasks = fileTransferManager.getTasks()
    set({ 
      transfers: tasks,
      totalTransfers: tasks.length,
      completedTransfers: tasks.filter(t => t.status === TransferStatus.COMPLETED).length,
      failedTransfers: tasks.filter(t => t.status === TransferStatus.FAILED).length
    })
  },
  
  // 获取传输统计信息
  getTransferStats: () => {
    const { transfers } = get()
    const total = transfers.length
    const completed = transfers.filter(t => t.status === TransferStatus.COMPLETED).length
    const failed = transfers.filter(t => t.status === TransferStatus.FAILED).length
    const inProgress = transfers.filter(t => t.status === TransferStatus.TRANSFERRING).length
    
    return { total, completed, failed, inProgress }
  }
}))

// 工具函数：计算剩余时间
export const calculateRemainingTime = (transfer: TransferTask): string => {
  if (transfer.progress >= 100 || transfer.speed === 0) return '0s'
  const remainingBytes = transfer.fileSize * (1 - transfer.progress / 100)
  const remainingSeconds = remainingBytes / transfer.speed
  if (remainingSeconds < 60) return Math.ceil(remainingSeconds) + 's'
  if (remainingSeconds < 3600) return Math.ceil(remainingSeconds / 60) + 'm'
  return Math.ceil(remainingSeconds / 3600) + 'h'
}