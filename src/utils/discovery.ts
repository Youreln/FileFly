import { LocalSendDevice } from '../store/useConnectionStore'

// 设备发现类型类型类型：设备信息（此设备信息可能已。

// 设备发现器类
export enum DiscoveryProtocol {
  MDNS = 'mdns',
  HTTP_POLLING = 'http_polling',
  SSDP = 'ssdp'
}

// 设备发现状态
export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CONNECTING = 'connecting'
}

// 设备信息接口
export interface DiscoveredDevice {
  id: string
  name: string
  ip: string
  port: number
  os: string
  version: string
  status: DeviceStatus
  lastSeen: Date
  protocol: DiscoveryProtocol
}

// 设备扫描选项接口
export interface DiscoveryOptions {
  timeout?: number // 扫描超时时间（毫秒）
  concurrencyLimit?: number // 并发扫描限制
  ipRange?: string[] // 自定义 IP 范围
  port?: number // 扫描端口
  protocol?: DiscoveryProtocol // 发现协议
}

// 设备发现器类
export class DeviceDiscoverer {
  private devices: DiscoveredDevice[] = []
  private isScanning: boolean = false
  private scanTimeout: NodeJS.Timeout | null = null

  // 开始扫描设备
  async discover(options: DiscoveryOptions = {}): Promise<DiscoveredDevice[]> {
    this.isScanning = true
    this.devices = []

    const {
      timeout = 30000,
      concurrencyLimit = 10,
      ipRange,
      port = 53317,
      protocol = DiscoveryProtocol.HTTP_POLLING
    } = options

    try {
      // 设置扫描超时
      if (timeout > 0) {
        this.scanTimeout = setTimeout(() => {
          this.isScanning = false
          throw new Error('Device discovery timeout')
        }, timeout)
      }

      switch (protocol) {
        case DiscoveryProtocol.HTTP_POLLING:
          await this.scanWithHttpPolling(concurrencyLimit, ipRange, port)
          break
        case DiscoveryProtocol.MDNS:
          await this.scanWithMDNS(port)
          break
        default:
          await this.scanWithHttpPolling(concurrencyLimit, ipRange, port)
      }

      return this.devices
    } finally {
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout)
        this.scanTimeout = null
      }
      this.isScanning = false
    }
  }

  // 使用 HTTP 轮询扫描
  private async scanWithHttpPolling(concurrencyLimit: number, customIpRange?: string[], port: number = 53317): Promise<void> {
    const ipRange = customIpRange || await this.getLocalIpRange()
    const scanPromises: Promise<void>[] = []

    // 并发控制
    let activeScans = 0
    let scanIndex = 0

    const scanNext = async () => {
      if (scanIndex >= ipRange.length || !this.isScanning) {
        return
      }

      const targetIp = ipRange[scanIndex++]
      activeScans++

      try {
        await this.scanIp(targetIp, port)
      } finally {
        activeScans--
        if (this.isScanning) {
          scanNext()
        }
      }
    }

    // 启动并发扫描
    for (let i = 0; i < Math.min(concurrencyLimit, ipRange.length); i++) {
      if (scanIndex < ipRange.length && this.isScanning) {
        scanNext()
      }
    }

    // 等待所有扫描完成
    while (activeScans > 0 && this.isScanning) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // 扫描单个 IP
  private async scanIp(ip: string, port: number): Promise<void> {
    try {
      // 发送 HTTP 请求检测 LocalSend 服务
      const response = await fetch(`http://${ip}:${port}/api/info`, {
        method: 'GET',
        timeout: 1000
      })

      if (response.ok) {
        const deviceInfo = await response.json()
        
        // 创建设备对象
        const device: DiscoveredDevice = {
          id: deviceInfo.deviceId || `device_${ip}_${port}`,
          name: deviceInfo.deviceName || `Device ${ip}`,
          ip,
          port,
          os: deviceInfo.deviceType || 'Unknown',
          version: deviceInfo.version || '1.0.0',
          status: DeviceStatus.ONLINE,
          lastSeen: new Date(),
          protocol: DiscoveryProtocol.HTTP_POLLING
        }

        // 添加到设备列表
        this.addOrUpdateDevice(device)
      }
    } catch (error) {
      // IP 不可达或不是 LocalSend 设备，忽略错误
    }
  }

  // 使用 mDNS 扫描（模拟）
  private async scanWithMDNS(port: number = 53317): Promise<void> {
    // 由于浏览器限制，我们无法直接使用 mDNS
    // 这里使用 HTTP 轮询来模拟 mDNS 发现
    console.log('Simulating mDNS discovery...')
    
    // 获取本地 IP 范围
    const ipRange = await this.getLocalIpRange()
    
    // 扫描 IP 范围
    for (const ip of ipRange) {
      if (!this.isScanning) break
      await this.scanIp(ip, port)
    }
  }

  // 获取本地 IP 范围
  private async getLocalIpRange(): Promise<string[]> {
    return new Promise((resolve) => {
      // 创建一个 RTCPeerConnection 来获取本地 IP
      const pc = new RTCPeerConnection({ iceServers: [] })
      pc.createDataChannel('')
      
      let localIP = '192.168.1.1'
      
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer)
      })
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const ipMatch = event.candidate.candidate.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/)
          if (ipMatch) {
            localIP = ipMatch[1]
          }
        }
      }
      
      // 超时后生成 IP 范围
      setTimeout(() => {
        pc.close()
        
        // 生成 IP 范围
        const ipSegments = localIP.split('.')
        const baseIP = ipSegments.slice(0, 3).join('.')
        const ipRange: string[] = []
        
        // 扫描 1-254 范围
        for (let i = 1; i <= 254; i++) {
          const ip = `${baseIP}.${i}`
          if (ip !== localIP) { // 跳过自己
            ipRange.push(ip)
          }
        }
        
        resolve(ipRange)
      }, 1000)
    })
  }

  // 添加或更新设备
  private addOrUpdateDevice(device: DiscoveredDevice): void {
    const existingIndex = this.devices.findIndex(d => d.ip === device.ip && d.port === device.port)
    
    if (existingIndex >= 0) {
      // 更新现有设备
      this.devices[existingIndex] = {
        ...this.devices[existingIndex],
        ...device,
        lastSeen: new Date()
      }
    } else {
      // 添加新设备
      this.devices.push(device)
    }
  }

  // 停止扫描
  stop(): void {
    this.isScanning = false
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout)
      this.scanTimeout = null
    }
  }

  // 获取当前扫描状态
  getIsScanning(): boolean {
    return this.isScanning
  }

  // 获取已发现的设备
  getDevices(): DiscoveredDevice[] {
    return this.devices
  }
}

// 设备发现缓存
export class DeviceCache {
  private cache: Map<string, DiscoveredDevice>
  private cacheTimeout: number

  constructor(cacheTimeout: number = 300000) { // 默认 5 分钟缓存
    this.cache = new Map()
    this.cacheTimeout = cacheTimeout
  }

  // 添加设备到缓存
  addDevice(device: DiscoveredDevice): void {
    const key = `${device.ip}:${device.port}`
    this.cache.set(key, {
      ...device,
      lastSeen: new Date()
    })
  }

  // 从缓存获取设备
  getDevice(ip: string, port: number): DiscoveredDevice | undefined {
    const key = `${ip}:${port}`
    const device = this.cache.get(key)
    
    if (device) {
      // 检查缓存是否过期
      const now = new Date()
      const cacheTime = new Date(device.lastSeen)
      
      if (now.getTime() - cacheTime.getTime() > this.cacheTimeout) {
        this.cache.delete(key)
        return undefined
      }
    }
    
    return device
  }

  // 获取所有缓存设备
  getAllDevices(): DiscoveredDevice[] {
    const devices: DiscoveredDevice[] = []
    const now = new Date()
    
    for (const [key, device] of this.cache.entries()) {
      const cacheTime = new Date(device.lastSeen)
      
      if (now.getTime() - cacheTime.getTime() <= this.cacheTimeout) {
        devices.push(device)
      } else {
        // 删除过期缓存
        this.cache.delete(key)
      }
    }
    
    return devices
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size
  }
}

// 设备发现管理器
export class DiscoveryManager {
  private discoverer: DeviceDiscoverer
  private cache: DeviceCache
  private scanInterval: NodeJS.Timeout | null = null

  constructor() {
    this.discoverer = new DeviceDiscoverer()
    this.cache = new DeviceCache()
  }

  // 开始自动发现
  startAutoDiscovery(interval: number = 30000, options?: DiscoveryOptions): void {
    // 立即执行一次发现
    this.discoverDevices(options)
    
    // 设置定期发现
    this.scanInterval = setInterval(() => {
      this.discoverDevices(options)
    }, interval)
  }

  // 停止自动发现
  stopAutoDiscovery(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
    }
  }

  // 发现设备
  async discoverDevices(options?: DiscoveryOptions): Promise<DiscoveredDevice[]> {
    try {
      const devices = await this.discoverer.discover(options)
      
      // 更新缓存
      devices.forEach(device => {
        this.cache.addDevice(device)
      })
      
      // 合并缓存设备
      const allDevices = this.cache.getAllDevices()
      
      // 去重
      const uniqueDevices = this.deduplicateDevices(allDevices)
      
      return uniqueDevices
    } catch (error) {
      console.error('Device discovery failed:', error)
      // 返回缓存设备
      return this.cache.getAllDevices()
    }
  }

  // 设备去重
  private deduplicateDevices(devices: DiscoveredDevice[]): DiscoveredDevice[] {
    const uniqueMap = new Map<string, DiscoveredDevice>()
    
    devices.forEach(device => {
      const key = `${device.ip}:${device.port}`
      uniqueMap.set(key, device)
    })
    
    return Array.from(uniqueMap.values())
  }

  // 获取缓存设备
  getCachedDevices(): DiscoveredDevice[] {
    return this.cache.getAllDevices()
  }

  // 清空缓存
  clearCache(): void {
    this.cache.clear()
  }
}

// 导出默认实例
export const discoveryManager = new DiscoveryManager()
