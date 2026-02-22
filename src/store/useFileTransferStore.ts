import { create } from 'zustand'

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  progress: number
  speed: number
  status: 'pending' | 'uploading' | 'downloading' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  fromDevice?: string
  toDevice?: string
}

interface FileTransferState {
  // 文件列表
  files: FileItem[]
  
  // 传输队列
  transferQueue: string[]
  
  // 操作方法
  addFile: (file: File) => void
  removeFile: (fileId: string) => void
  startTransfer: (fileId: string) => void
  pauseTransfer: (fileId: string) => void
  resumeTransfer: (fileId: string) => void
  cancelTransfer: (fileId: string) => void
  updateProgress: (fileId: string, progress: number) => void
  updateSpeed: (fileId: string, speed: number) => void
  completeTransfer: (fileId: string) => void
  failTransfer: (fileId: string) => void
  clearCompleted: () => void
}

// 生成文件ID
const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB'
  return (bytes / 1073741824).toFixed(2) + ' GB'
}

export const useFileTransferStore = create<FileTransferState>((set, get) => ({
  // 初始化状态
  files: [],
  transferQueue: [],
  
  // 添加文件
  addFile: (file: File) => {
    const newFile: FileItem = {
      id: generateFileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      speed: 0,
      status: 'pending',
      startTime: new Date()
    }
    set(state => ({ files: [...state.files, newFile] }))
  },
  
  // 移除文件
  removeFile: (fileId: string) => {
    const { files, transferQueue } = get()
    const updatedFiles = files.filter(file => file.id !== fileId)
    const updatedQueue = transferQueue.filter(id => id !== fileId)
    set({ files: updatedFiles, transferQueue: updatedQueue })
  },
  
  // 开始传输
  startTransfer: (fileId: string) => {
    const { files, transferQueue } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, status: 'uploading' }
      }
      return file
    })
    if (!transferQueue.includes(fileId)) {
      transferQueue.push(fileId)
    }
    set({ files: updatedFiles, transferQueue })
    
    // 模拟传输过程
    simulateTransfer(fileId)
  },
  
  // 暂停传输
  pauseTransfer: (fileId: string) => {
    const { files } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, status: 'pending' }
      }
      return file
    })
    set({ files: updatedFiles })
  },
  
  // 恢复传输
  resumeTransfer: (fileId: string) => {
    const { files } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, status: 'uploading' }
      }
      return file
    })
    set({ files: updatedFiles })
    
    // 继续模拟传输
    simulateTransfer(fileId)
  },
  
  // 取消传输
  cancelTransfer: (fileId: string) => {
    const { files, transferQueue } = get()
    const updatedFiles = files.filter(file => file.id !== fileId)
    const updatedQueue = transferQueue.filter(id => id !== fileId)
    set({ files: updatedFiles, transferQueue: updatedQueue })
  },
  
  // 更新进度
  updateProgress: (fileId: string, progress: number) => {
    const { files } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, progress }
      }
      return file
    })
    set({ files: updatedFiles })
  },
  
  // 更新速度
  updateSpeed: (fileId: string, speed: number) => {
    const { files } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, speed }
      }
      return file
    })
    set({ files: updatedFiles })
  },
  
  // 完成传输
  completeTransfer: (fileId: string) => {
    const { files, transferQueue } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, status: 'completed', endTime: new Date() }
      }
      return file
    })
    const updatedQueue = transferQueue.filter(id => id !== fileId)
    set({ files: updatedFiles, transferQueue: updatedQueue })
  },
  
  // 传输失败
  failTransfer: (fileId: string) => {
    const { files, transferQueue } = get()
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return { ...file, status: 'failed' }
      }
      return file
    })
    const updatedQueue = transferQueue.filter(id => id !== fileId)
    set({ files: updatedFiles, transferQueue: updatedQueue })
  },
  
  // 清除已完成的文件
  clearCompleted: () => {
    const { files } = get()
    const updatedFiles = files.filter(file => file.status !== 'completed')
    set({ files: updatedFiles })
  }
}))

// 模拟传输过程
const simulateTransfer = (fileId: string) => {
  const store = useFileTransferStore.getState()
  const file = store.files.find(f => f.id === fileId)
  if (!file) return
  
  let progress = file.progress
  const startTime = Date.now()
  const totalSize = file.size
  
  const interval = setInterval(() => {
    const currentFile = store.files.find(f => f.id === fileId)
    if (!currentFile || currentFile.status !== 'uploading') {
      clearInterval(interval)
      return
    }
    
    progress += Math.random() * 10
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      store.completeTransfer(fileId)
    }
    
    const elapsedTime = (Date.now() - startTime) / 1000
    const transferredSize = (progress / 100) * totalSize
    const speed = transferredSize / elapsedTime
    
    store.updateProgress(fileId, progress)
    store.updateSpeed(fileId, speed)
  }, 500)
}

// 工具函数：格式化文件大小
export const formatSize = formatFileSize

// 工具函数：格式化传输速度
export const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) return bytesPerSecond.toFixed(2) + ' B/s'
  if (bytesPerSecond < 1048576) return (bytesPerSecond / 1024).toFixed(2) + ' KB/s'
  if (bytesPerSecond < 1073741824) return (bytesPerSecond / 1048576).toFixed(2) + ' MB/s'
  return (bytesPerSecond / 1073741824).toFixed(2) + ' GB/s'
}

// 工具函数：计算剩余时间
export const calculateRemainingTime = (file: FileItem): string => {
  if (file.progress >= 100 || file.speed === 0) return '0s'
  const remainingBytes = file.size * (1 - file.progress / 100)
  const remainingSeconds = remainingBytes / file.speed
  if (remainingSeconds < 60) return Math.ceil(remainingSeconds) + 's'
  if (remainingSeconds < 3600) return Math.ceil(remainingSeconds / 60) + 'm'
  return Math.ceil(remainingSeconds / 3600) + 'h'
}