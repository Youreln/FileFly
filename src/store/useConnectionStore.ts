import { create } from 'zustand'

interface LocalSendDevice {
  id: string
  name: string
  ip: string
  port: number
  os: string
  version: string
  status: 'online' | 'offline'
  lastSeen: Date
}

interface NetworkStatus {
  name: string
  ip: string
  connected: boolean
}

interface LocalSendStatus {
  enabled: boolean
  port: number
}

interface ConnectionState {
  // 设备信息
  deviceId: string
  deviceName: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
  
  // 网络状态
  networkStatus: NetworkStatus
  
  // LocalSend 状态
  localSendStatus: LocalSendStatus
  
  // 设备列表
  devices: LocalSendDevice[]
  isScanning: boolean
  
  // 连接状态
  isConnected: boolean
  
  // 操作方法
  refreshDevices: () => void
  connectToDevice: (deviceId: string) => void
  viewDeviceDetails: (deviceId: string) => void
  detectNetworkStatus: () => void
  startLocalSend: () => void
  stopLocalSend: () => void
}

// 生成6位配对码
const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 生成设备ID
const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 检测设备类型
const detectDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const userAgent = navigator.userAgent
  const width = window.innerWidth
  
  if (userAgent.match(/Mobile/)) {
    return 'mobile'
  } else if (width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

// 模拟检测网络状态
const detectNetworkStatus = (): NetworkStatus => {
  // 模拟网络状态
  return {
    name: 'Home WiFi',
    ip: '192.168.1.100',
    connected: true
  }
}

// 模拟发现设备
const discoverDevices = (): LocalSendDevice[] => {
  // 模拟发现的设备
  return [
    {
      id: 'device_1',
      name: '笔记本电脑',
      ip: '192.168.1.101',
      port: 53317,
      os: 'Windows 10',
      version: '1.0.0',
      status: 'online',
      lastSeen: new Date()
    },
    {
      id: 'device_2',
      name: '手机',
      ip: '192.168.1.102',
      port: 53317,
      os: 'Android 13',
      version: '1.0.0',
      status: 'online',
      lastSeen: new Date()
    },
    {
      id: 'device_3',
      name: '平板',
      ip: '192.168.1.103',
      port: 53317,
      os: 'iPadOS 17',
      version: '1.0.0',
      status: 'online',
      lastSeen: new Date()
    }
  ]
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  // 初始化状态
  deviceId: generateDeviceId(),
  deviceName: `设备_${generateRandomCode().substr(0, 4)}`,
  deviceType: detectDeviceType(),
  
  // 网络状态
  networkStatus: detectNetworkStatus(),
  
  // LocalSend 状态
  localSendStatus: {
    enabled: true,
    port: 53317
  },
  
  // 设备列表
  devices: [],
  isScanning: false,
  
  // 连接状态
  isConnected: false,
  
  // 刷新设备列表
  refreshDevices: () => {
    set({ isScanning: true })
    
    // 模拟设备发现过程
    setTimeout(() => {
      const devices = discoverDevices()
      set({ 
        devices, 
        isScanning: false,
        isConnected: devices.length > 0
      })
    }, 2000)
  },
  
  // 连接设备
  connectToDevice: (deviceId: string) => {
    const { devices } = get()
    const device = devices.find(d => d.id === deviceId)
    if (device) {
      set({ isConnected: true })
      // 这里可以添加实际的连接逻辑
      console.log('Connecting to device:', device.name)
    }
  },
  
  // 查看设备详情
  viewDeviceDetails: (deviceId: string) => {
    const { devices } = get()
    const device = devices.find(d => d.id === deviceId)
    if (device) {
      // 这里可以添加查看设备详情的逻辑
      console.log('Viewing device details:', device)
      // 模拟显示设备详情
      alert(`设备详情:\n名称: ${device.name}\nIP: ${device.ip}:${device.port}\n系统: ${device.os}\n版本: ${device.version}\n状态: ${device.status}`)
    }
  },
  
  // 检测网络状态
  detectNetworkStatus: () => {
    const networkStatus = detectNetworkStatus()
    set({ networkStatus })
  },
  
  // 启动 LocalSend
  startLocalSend: () => {
    set({ 
      localSendStatus: {
        enabled: true,
        port: 53317
      }
    })
  },
  
  // 停止 LocalSend
  stopLocalSend: () => {
    set({ 
      localSendStatus: {
        enabled: false,
        port: 53317
      }
    })
  }
}))