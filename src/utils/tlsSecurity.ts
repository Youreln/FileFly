// TLS 安全工具类，用于实现自签名 TLS 安全层

// 自签名证书配置
const CERT_CONFIG = {
  subject: {
    commonName: 'LocalSend',
    organization: 'LocalSend Project',
    organizationalUnit: 'Security',
    country: 'CN',
    state: 'Local',
    locality: 'Local'
  },
  validity: {
    days: 365
  }
};

// 证书存储键
const CERT_STORAGE_KEY = 'localsend_tls_cert';
const KEY_STORAGE_KEY = 'localsend_tls_key';

// 安全上下文接口
interface SecurityContext {
  certificate: string;
  privateKey: string;
  publicKey: string;
  validUntil: Date;
}

// 生成自签名证书（模拟）
export const generateSelfSignedCertificate = (): SecurityContext => {
  // 在实际应用中，这里应该使用 Web Crypto API 生成真正的证书
  // 由于浏览器环境限制，这里我们模拟生成证书
  
  const now = new Date();
  const validUntil = new Date(now.getTime() + CERT_CONFIG.validity.days * 24 * 60 * 60 * 1000);
  
  const certificate = `-----BEGIN CERTIFICATE-----
MIIBzjCCATegAwIBAgIUWN0b5q3e8vz7vz7vz7vz7vz7vz7vz7vz7vz7vz7vz7v
MB4XDTEyMDExMDE2MDAwMFoXDTIyMDExMDE2MDAwMFowEjEQMA4GA1UEBhMCQ04x
ETAPBgNVBAgMCExvY2FsMQ8wDQYDVQQHDAhMb2NhbDENMAsGA1UECgwETG9jYWwxF
DASBgNVBAsMC1NlY3VyaXR5MB4XDTIyMDExMDE2MDAwMFoXDTIzMDExMDE2MDAw
MFowEjEQMA4GA1UEBhMCQ04xETAPBgNVBAgMCExvY2FsMQ8wDQYDVQQHDAhMb2Nh
bDENMAsGA1UECgwETG9jYWwxFzAVBgNVBAsMDlNlY3VyaXR5MB4XDTIyMDExMDE2
MDAwMFoXDTIzMDExMDE2MDAwMFowEjEQMA4GA1UEBhMCQ04xETAPBgNVBAgMCExv
Y2FsMQ8wDQYDVQQHDAhMb2NhbDENMAsGA1UECgwETG9jYWwxFzAVBgNVBAsMDlNl
Y3VyaXR5MB4XDTIyMDExMDE2MDAwMFoXDTIzMDExMDE2MDAwMFowEjEQMA4GA1UE
BhMCQ04xETAPBgNVBAgMCExvY2FsMQ8wDQYDVQQHDAhMb2NhbDENMAsGA1UECgwE
TG9jYWwxFzAVBgNVBAsMDlNlY3VyaXR5MB4XDTIyMDExMDE2MDAwMFoXDTIzMDEx
MDE2MDAwMFowEjEQMA4GA1UEBhMCQ04xETAPBgNVBAgMCExvY2FsMQ8wDQYDVQQH
DAhMb2NhbDENMAsGA1UECgwETG9jYWwxFzAVBgNVBAsMDlNlY3VyaXR5MC4GA1Ud
EQQnMCWCCWxvY2Fsc2VuZC5jb20wDQYJKoZIhvcNAQELBQADggEBABjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
jzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjzjz
-----END CERTIFICATE-----`;
  
  const privateKey = `-----BEGIN PRIVATE KEY-----
MIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8AgEAAkEAzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz
-----END PRIVATE KEY-----`;
  
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
-----END PUBLIC KEY-----`;
  
  const context: SecurityContext = {
    certificate,
    privateKey,
    publicKey,
    validUntil
  };
  
  // 存储证书到本地存储
  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(context));
  
  return context;
};

// 获取安全上下文
export const getSecurityContext = (): SecurityContext | null => {
  try {
    const storedContext = localStorage.getItem(CERT_STORAGE_KEY);
    if (!storedContext) {
      return null;
    }
    
    const context = JSON.parse(storedContext);
    const validUntil = new Date(context.validUntil);
    
    // 检查证书是否过期
    if (validUntil < new Date()) {
      // 证书过期，生成新证书
      return generateSelfSignedCertificate();
    }
    
    return {
      ...context,
      validUntil
    };
  } catch (error) {
    console.error('Error getting security context:', error);
    return null;
  }
};

// 初始化安全上下文
export const initSecurityContext = (): SecurityContext => {
  const existingContext = getSecurityContext();
  if (existingContext) {
    return existingContext;
  }
  return generateSelfSignedCertificate();
};

// 验证服务器证书（模拟）
export const verifyServerCertificate = (certificate: string): boolean => {
  // 在实际应用中，这里应该验证服务器证书的有效性
  // 由于是自签名证书，我们只做基本验证
  return certificate.includes('BEGIN CERTIFICATE') && certificate.includes('END CERTIFICATE');
};

// 创建 HTTPS 请求选项
export const createHTTPSRequestOptions = (): RequestInit => {
  // 在实际应用中，这里应该添加证书验证选项
  // 由于浏览器环境限制，我们使用默认选项
  return {
    headers: {
      'Content-Type': 'application/json'
    },
    // 在实际应用中，这里应该添加证书验证逻辑
    credentials: 'include'
  };
};

// 处理 TLS 错误
export const handleTLSError = (error: unknown): boolean => {
  console.error('TLS Error:', error);
  
  // 在实际应用中，这里应该处理具体的 TLS 错误
  // 例如：证书过期、证书无效等
  
  return false;
};

// 加密数据（模拟）
export const encryptData = (data: string | ArrayBuffer): string => {
  // 在实际应用中，这里应该使用 Web Crypto API 进行真正的加密
  // 由于是模拟，我们简单返回原始数据
  if (typeof data === 'string') {
    return btoa(data);
  }
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

// 解密数据（模拟）
export const decryptData = (encryptedData: string): string => {
  // 在实际应用中，这里应该使用 Web Crypto API 进行真正的解密
  // 由于是模拟，我们简单返回原始数据
  return atob(encryptedData);
};

// 生成安全随机数
export const generateSecureRandom = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // 降级方案：使用 Math.random()
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return array;
};

// 生成会话密钥
export const generateSessionKey = (): string => {
  const random = generateSecureRandom(32);
  return Array.from(random, byte => byte.toString(16).padStart(2, '0')).join('');
};

// 验证会话密钥
export const verifySessionKey = (key: string): boolean => {
  return key.length === 64; // 32 bytes * 2 hex chars per byte
};
