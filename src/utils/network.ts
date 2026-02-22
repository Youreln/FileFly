import { DeviceInfo } from '../store/useConnectionStore'

// 文件传输块接口
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

// 网络工具函数
export class NetworkUtils {
  // 获取本地 IP 地址
  static async getLocalIPAddress(): Promise<string> {
    return new Promise((resolve) => {
      // 创建一个 RTCPeerConnection 来获取本地 IP
      const pc = new RTCPeerConnection({ iceServers: [] })
      
      pc.createDataChannel('')
      
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer)
      })
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const ipMatch = event.candidate.candidate.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/)
          if (ipMatch) {
            const ip = ipMatch[1]
            resolve(ip)
          }
        }
      }
      
      // 超时后返回 localhost
      setTimeout(() => {
        resolve('127.0.0.1')
      }, 1000)
    })
  }

  // 检查端口是否可用
  static async checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      // 在浏览器环境中，我们无法直接检查端口
      // 这里返回 true 作为默认值
      resolve(true)
    })
  }

  // 生成随机端口
  static generateRandomPort(): number {
    return Math.floor(Math.random() * (65535 - 1024) + 1024)
  }

  // 验证 IP 地址格式
  static validateIPAddress(ip: string): boolean {
    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (!ipRegex.test(ip)) {
      return false
    }
    
    const parts = ip.split('.')
    for (const part of parts) {
      const num = parseInt(part)
      if (num < 0 || num > 255) {
        return false
      }
    }
    
    return true
  }

  // 生成随机设备 ID
  static generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 生成配对码
  static generatePairingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // 生成分享链接
  static generateShareLink(): string {
    const deviceId = this.generateDeviceId()
    return `${window.location.origin}?deviceId=${deviceId}`
  }
}
