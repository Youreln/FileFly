import { create } from 'zustand'

interface Device {
  id: string
  name: string
  type: 'mobile' | 'desktop' | 'tablet'
  status: 'online' | 'offline'
  lastSeen: Date
}

interface ConnectionState {
  // 设备信息
  deviceId: string
  deviceName: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
  
  // 连接状态
  isConnected: boolean
  connectedDevices: Device[]
  
  // 配对信息
  pairingCode: string
  qrCodeUrl: string
  shareLink: string
  
  // 操作方法
  generatePairingCode: () => string
  generateQRCode: () => string
  generateShareLink: () => string
  connectToDevice: (deviceId: string) => void
  disconnectFromDevice: (deviceId: string) => void
  scanQRCode: (qrCodeData: string) => void
  enterPairingCode: (code: string) => void
  discoverDevices: () => void
  syncClipboard: (data: string | File) => void
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

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  // 初始化状态
  deviceId: generateDeviceId(),
  deviceName: `设备_${generateRandomCode().substr(0, 4)}`,
  deviceType: detectDeviceType(),
  isConnected: false,
  connectedDevices: [],
  pairingCode: generateRandomCode(),
  qrCodeUrl: '',
  shareLink: '',
  
  // 生成配对码
  generatePairingCode: () => {
    const code = generateRandomCode()
    set({ pairingCode: code })
    return code
  },
  
  // 生成二维码
  generateQRCode: () => {
    const { deviceId, deviceName } = get()
    const qrData = JSON.stringify({ deviceId, deviceName })
    const qrCodeUrl = `data:image/svg+xml;base64,${btoa(qrData)}`
    set({ qrCodeUrl })
    return qrCodeUrl
  },
  
  // 生成分享链接
  generateShareLink: () => {
    const { deviceId } = get()
    const shareLink = `${window.location.origin}?deviceId=${deviceId}`
    set({ shareLink })
    return shareLink
  },
  
  // 连接设备
  connectToDevice: (deviceId: string) => {
    const { connectedDevices } = get()
    const device = connectedDevices.find(d => d.id === deviceId)
    if (device) {
      set({ isConnected: true })
    }
  },
  
  // 断开连接
  disconnectFromDevice: (deviceId: string) => {
    const { connectedDevices } = get()
    const updatedDevices = connectedDevices.filter(d => d.id !== deviceId)
    set({ 
      connectedDevices: updatedDevices,
      isConnected: updatedDevices.length > 0
    })
  },
  
  // 扫描二维码
  scanQRCode: (qrCodeData: string) => {
    try {
      const { deviceId, deviceName } = JSON.parse(qrCodeData)
      const newDevice: Device = {
        id: deviceId,
        name: deviceName,
        type: 'mobile',
        status: 'online',
        lastSeen: new Date()
      }
      set(state => ({
        connectedDevices: [...state.connectedDevices, newDevice],
        isConnected: true
      }))
    } catch (error) {
      console.error('Invalid QR code data:', error)
    }
  },
  
  // 输入配对码
  enterPairingCode: (code: string) => {
    // 模拟通过配对码查找设备
    const mockDevice: Device = {
      id: `device_${code}`,
      name: `设备_${code}`,
      type: 'desktop',
      status: 'online',
      lastSeen: new Date()
    }
    set(state => ({
      connectedDevices: [...state.connectedDevices, mockDevice],
      isConnected: true
    }))
  },
  
  // 发现局域网设备
  discoverDevices: () => {
    // 模拟发现设备
    const mockDevices: Device[] = [
      {
        id: 'device_1',
        name: '笔记本电脑',
        type: 'desktop',
        status: 'online',
        lastSeen: new Date()
      },
      {
        id: 'device_2',
        name: '手机',
        type: 'mobile',
        status: 'online',
        lastSeen: new Date()
      }
    ]
    set({ connectedDevices: mockDevices, isConnected: mockDevices.length > 0 })
  },
  
  // 同步剪贴板
  syncClipboard: (data: string | File) => {
    // 模拟剪贴板同步
    console.log('Syncing clipboard data:', data)
  }
}))