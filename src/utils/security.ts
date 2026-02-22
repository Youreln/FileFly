// 加密相关工具函数

// 生成随机密钥
const generateKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

// 导出密钥
const exportKey = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

// 导入密钥
const importKey = async (keyString: string): Promise<CryptoKey> => {
  const rawKey = Uint8Array.from(atob(keyString), c => c.charCodeAt(0))
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

// 加密数据
const encryptData = async (data: string | ArrayBuffer, key: CryptoKey): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    dataBuffer
  )
  
  const encryptedArray = new Uint8Array(encrypted)
  const combined = new Uint8Array(iv.length + encryptedArray.length)
  combined.set(iv, 0)
  combined.set(encryptedArray, iv.length)
  
  return btoa(String.fromCharCode(...combined))
}

// 解密数据
const decryptData = async (encryptedData: string, key: CryptoKey): Promise<string> => {
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encryptedArray = combined.slice(12)
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedArray
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

// 检查文件是否过期
const isFileExpired = (timestamp: number, expirationHours: number = 24): boolean => {
  const now = Date.now()
  const expirationTime = timestamp + (expirationHours * 60 * 60 * 1000)
  return now > expirationTime
}

// 生成文件过期时间
const generateExpirationTime = (hours: number = 24): number => {
  return Date.now() + (hours * 60 * 60 * 1000)
}

// 格式化过期时间
const formatExpirationTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

export {
  generateKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
  isFileExpired,
  generateExpirationTime,
  formatExpirationTime
}