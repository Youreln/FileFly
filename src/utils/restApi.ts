// REST API 工具类，用于实现 LocalSend 协议的文件传输

// 分块传输配置
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 每块
const MAX_RETRIES = 3; // 最大重试次数

// API 端点
const API_ENDPOINTS = {
  INFO: '/api/info',
  SEND: '/api/send',
  UPLOAD: '/api/upload',
  DOWNLOAD: '/api/download'
};

// 设备信息接口
interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  version: string;
  port: number;
}

// 文件传输选项
interface TransferOptions {
  deviceIp: string;
  devicePort: number;
  timeout?: number;
  onProgress?: (progress: number, speed: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// 获取设备信息
export const getDeviceInfo = async (deviceIp: string, devicePort: number): Promise<DeviceInfo> => {
  try {
    const url = `http://${deviceIp}:${devicePort}${API_ENDPOINTS.INFO}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get device info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting device info:', error);
    throw error;
  }
};

// 分块上传文件
export const uploadFile = async (file: File, options: TransferOptions): Promise<void> => {
  const { deviceIp, devicePort, onProgress, onComplete, onError } = options;
  const totalSize = file.size;
  let uploadedSize = 0;
  let retryCount = 0;
  const startTime = Date.now();

  try {
    // 1. 初始化上传
    const initResponse = await fetch(`http://${deviceIp}:${devicePort}${API_ENDPOINTS.SEND}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: totalSize,
        fileType: file.type
      })
    });

    if (!initResponse.ok) {
      throw new Error(`Failed to initialize upload: ${initResponse.status}`);
    }

    const uploadInfo = await initResponse.json();
    const uploadId = uploadInfo.uploadId;

    // 2. 分块上传
    for (let start = 0; start < totalSize; start += CHUNK_SIZE) {
      const end = Math.min(start + CHUNK_SIZE, totalSize);
      const chunk = file.slice(start, end);
      const chunkIndex = Math.floor(start / CHUNK_SIZE);

      try {
        const formData = new FormData();
        formData.append('file', chunk, `${file.name}.chunk${chunkIndex}`);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', Math.ceil(totalSize / CHUNK_SIZE).toString());

        const chunkResponse = await fetch(`http://${deviceIp}:${devicePort}${API_ENDPOINTS.UPLOAD}`, {
          method: 'POST',
          body: formData
        });

        if (!chunkResponse.ok) {
          throw new Error(`Failed to upload chunk ${chunkIndex}: ${chunkResponse.status}`);
        }

        uploadedSize = end;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = uploadedSize / elapsedTime;
        const progress = (uploadedSize / totalSize) * 100;

        if (onProgress) {
          onProgress(progress, speed);
        }

        // 重置重试计数
        retryCount = 0;
      } catch (chunkError) {
        console.error(`Error uploading chunk ${chunkIndex}:`, chunkError);
        retryCount++;

        if (retryCount > MAX_RETRIES) {
          throw new Error(`Max retries exceeded for chunk ${chunkIndex}`);
        }

        // 重试当前块
        start -= CHUNK_SIZE;
        continue;
      }
    }

    // 3. 完成上传
    if (onComplete) {
      onComplete();
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
};

// 下载文件
export const downloadFile = async (fileId: string, options: TransferOptions): Promise<Blob> => {
  const { deviceIp, devicePort, onProgress, onComplete, onError } = options;
  let receivedSize = 0;
  let totalSize = 0;
  const startTime = Date.now();

  try {
    const url = `http://${deviceIp}:${devicePort}${API_ENDPOINTS.DOWNLOAD}?fileId=${fileId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    // 获取文件总大小
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      totalSize = parseInt(contentLength, 10);
    }

    // 处理响应流
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        chunks.push(value);
        receivedSize += value.length;

        if (totalSize > 0 && onProgress) {
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed = receivedSize / elapsedTime;
          const progress = (receivedSize / totalSize) * 100;
          onProgress(progress, speed);
        }
      }
    }

    // 合并 chunks
    const blob = new Blob(chunks);

    if (onComplete) {
      onComplete();
    }

    return blob;
  } catch (error) {
    console.error('Error downloading file:', error);
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
};

// 取消传输
export const cancelTransfer = async (transferId: string, deviceIp: string, devicePort: number): Promise<void> => {
  try {
    const response = await fetch(`http://${deviceIp}:${devicePort}${API_ENDPOINTS.SEND}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transferId })
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel transfer: ${response.status}`);
    }
  } catch (error) {
    console.error('Error canceling transfer:', error);
    throw error;
  }
};

// 工具函数：格式化错误信息
export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// 工具函数：检查网络连接
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // 尝试连接到本地网络
    const response = await fetch('http://192.168.1.1', {
      method: 'HEAD',
      timeout: 2000
    });
    return response.ok;
  } catch {
    return false;
  }
};
