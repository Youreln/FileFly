import React, { useEffect, useState } from 'react'
import { Card, Button, Typography, List, Avatar, Space, Toast, Progress, Badge, Statistic, Row, Col } from 'antd-mobile'
import { RefreshCw, Wifi, Send, Info, Check, X, Pause, Play, Server, Network, ClockCircle, Zap, CloudUpload, CheckCircle, AlertCircle, Hourglass } from 'antd-mobile-icons'
import { useConnectionStore } from '../store/useConnectionStore'
import { useFileTransferStore, formatSize, formatSpeed } from '../store/useFileTransferStore'

const { Title, Text } = Typography

const ConnectionPage: React.FC = () => {
  const { 
    networkStatus, 
    localSendStatus, 
    devices, 
    isScanning, 
    refreshDevices, 
    connectToDevice, 
    viewDeviceDetails
  } = useConnectionStore()
  
  const { 
    transfers, 
    sendFileToDevice, 
    pauseTransfer, 
    cancelTransfer, 
    retryTransfer, 
    removeTransfer,
    clearCompletedTransfers,
    clearFailedTransfers,
    getTransferStats
  } = useFileTransferStore()

  const [stats, setStats] = useState(getTransferStats())
  const [animateValues, setAnimateValues] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    // 初始化时刷新设备列表
    refreshDevices()
  }, [])

  useEffect(() => {
    // 更新统计信息
    setStats(getTransferStats())
  }, [transfers])

  useEffect(() => {
    // 为每个传输项创建动画值
    const newAnimateValues: { [key: string]: number } = {}
    transfers.forEach(transfer => {
      newAnimateValues[transfer.id] = 0
    })
    setAnimateValues(newAnimateValues)

    // 启动动画
    transfers.forEach(transfer => {
      setTimeout(() => {
        setAnimateValues(prev => ({
          ...prev,
          [transfer.id]: transfer.progress
        }))
      }, 100)
    })
  }, [transfers])

  const handleSendFile = (deviceId: string) => {
    sendFileToDevice(deviceId)
  }

  const handleConnect = (deviceId: string) => {
    connectToDevice(deviceId)
  }

  const handleViewDetails = (deviceId: string) => {
    viewDeviceDetails(deviceId)
  }

  const handleClearCompleted = () => {
    clearCompletedTransfers()
    Toast.show({ message: '已清除完成的传输', position: 'top' })
  }

  const handleClearFailed = () => {
    clearFailedTransfers()
    Toast.show({ message: '已清除失败的传输', position: 'top' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-full bg-blue-600/10 dark:bg-blue-500/20 mb-4 animate-pulse">
            <Wifi className="text-blue-600 dark:text-blue-400" style={{ fontSize: '2rem' }} />
          </div>
          <Title level={2} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
            LocalSend 协议连接
          </Title>
          <Text className="text-gray-500 dark:text-gray-400">
            安全、快速的局域网文件传输
          </Text>
        </div>

        {/* 网络连接状态 */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <Card.Header 
            title={
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-3">
                  <Wifi className="text-blue-600 dark:text-blue-400" />
                </div>
                <Text className="font-bold text-gray-800 dark:text-white">网络状态</Text>
              </div>
            } 
          />
          <Card.Body className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">网络名称</Text>
                <Text className="font-semibold text-gray-800 dark:text-white">{networkStatus.name}</Text>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">IP地址</Text>
                <Text className="font-mono font-semibold text-gray-800 dark:text-white">{networkStatus.ip}</Text>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">连接状态</Text>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${networkStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <Text className="font-semibold text-gray-800 dark:text-white">
                    {networkStatus.connected ? '已连接' : '未连接'}
                  </Text>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">LocalSend状态</Text>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSendStatus.enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <Text className="font-semibold text-gray-800 dark:text-white">
                    {localSendStatus.enabled ? '已启动' : '未启动'}
                  </Text>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700 md:col-span-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">端口</Text>
                <Text className="font-mono font-semibold text-gray-800 dark:text-white">{localSendStatus.port}</Text>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 设备列表 */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl transition-all duration-300 hover:shadow-xl">
          <Card.Header 
            title={
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mr-3">
                  <Server className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <Text className="font-bold text-gray-800 dark:text-white">在线设备</Text>
              </div>
            } 
            extra={
              <Button 
                size="small" 
                icon={<RefreshCw />} 
                loading={isScanning}
                onClick={refreshDevices}
                className="rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition-all"
              >
                刷新
              </Button>
            }
          />
          <Card.Body className="pt-6">
            {isScanning ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <Text className="text-gray-600 dark:text-gray-300 font-medium">正在搜索设备...</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">使用 UDP 53317 组播发现</Text>
              </div>
            ) : devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700/50 mb-6">
                  <Server className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                </div>
                <Text className="text-gray-600 dark:text-gray-300 font-medium">未发现设备</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
                  请确保其他设备已启动 LocalSend 并连接到同一局域网
                </Text>
                <Button 
                  size="small" 
                  color="primary" 
                  className="mt-8 rounded-full px-8 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all"
                  onClick={refreshDevices}
                >
                  重新搜索
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    发现 {devices.length} 台在线设备
                  </div>
                </div>
                <div className="space-y-4">
                  {devices.map((device, index) => (
                    <div 
                      key={device.id}
                      className="p-5 rounded-xl bg-white/90 dark:bg-gray-700/50 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-600/50"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start">
                        <div className="mr-4">
                          <Avatar 
                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold"
                          >
                            {device.name.charAt(0)}
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Text className="font-bold text-gray-800 dark:text-white text-lg">{device.name}</Text>
                            <div className="ml-3 flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                              <Text className="text-sm text-green-600 dark:text-green-400">在线</Text>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="font-mono">IP: {device.ip}:{device.port}</span>
                            </div>
                            <div>系统: {device.os} | LocalSend v{device.version}</div>
                            <div>上次在线: {device.lastSeen.toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <Button 
                            size="small" 
                            icon={<Info />} 
                            onClick={() => handleViewDetails(device.id)}
                            className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                          >
                            详情
                          </Button>
                          <Button 
                            size="small" 
                            icon={<Send />} 
                            onClick={() => handleSendFile(device.id)}
                            className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/80 transition-all"
                          >
                            发送
                          </Button>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => handleConnect(device.id)}
                            className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all"
                          >
                            连接
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* 传输统计 */}
        {transfers.length > 0 && (
          <Card className="mb-8 overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl transition-all duration-300 hover:shadow-xl">
            <Card.Header 
              title={
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-3">
                    <Network className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <Text className="font-bold text-gray-800 dark:text-white">传输统计</Text>
                </div>
              } 
            />
            <Card.Body className="pt-6">
              <Row gutter={[16, 16]} className="mb-6">
                <Col span={6} className="text-center">
                  <div className="p-4 rounded-xl bg-white dark:bg-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">总传输</Text>
                    <Text className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</Text>
                  </div>
                </Col>
                <Col span={6} className="text-center">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 shadow-sm transition-all duration-300 hover:shadow-md">
                    <Text className="text-sm text-green-600 dark:text-green-400 mb-1">完成</Text>
                    <Text className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</Text>
                  </div>
                </Col>
                <Col span={6} className="text-center">
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 shadow-sm transition-all duration-300 hover:shadow-md">
                    <Text className="text-sm text-red-600 dark:text-red-400 mb-1">失败</Text>
                    <Text className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</Text>
                  </div>
                </Col>
                <Col span={6} className="text-center">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 shadow-sm transition-all duration-300 hover:shadow-md">
                    <Text className="text-sm text-blue-600 dark:text-blue-400 mb-1">进行中</Text>
                    <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</Text>
                  </div>
                </Col>
              </Row>
              <div className="flex gap-3 justify-end">
                <Button 
                  size="small" 
                  onClick={handleClearCompleted}
                  className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  清除完成
                </Button>
                <Button 
                  size="small" 
                  onClick={handleClearFailed}
                  className="rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/80 transition-all"
                >
                  清除失败
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* 传输状态 */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl transition-all duration-300 hover:shadow-xl">
          <Card.Header 
            title={
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/50 mr-3">
                  <CloudUpload className="text-teal-600 dark:text-teal-400" />
                </div>
                <Text className="font-bold text-gray-800 dark:text-white">传输状态</Text>
              </div>
            } 
          />
          <Card.Body className="pt-6">
            {transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-5 rounded-full bg-gray-100 dark:bg-gray-700/50 mb-6">
                  <Network className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                </div>
                <Text className="text-gray-600 dark:text-gray-300 font-medium mb-2">暂无传输任务</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                  选择设备开始传输文件
                </Text>
              </div>
            ) : (
              <div className="space-y-6">
                {transfers.map((transfer, index) => {
                  let statusColor = '#1677FF'
                  let statusText = '传输中'
                  let statusIcon = <Zap className="text-blue-500" />
                  let bgColor = 'bg-blue-50 dark:bg-blue-900/20'
                  let borderColor = 'border-blue-200 dark:border-blue-800/50'
                  
                  if (transfer.status === 'completed') {
                    statusColor = '#52c41a'
                    statusText = '已完成'
                    statusIcon = <CheckCircle className="text-green-500" />
                    bgColor = 'bg-green-50 dark:bg-green-900/20'
                    borderColor = 'border-green-200 dark:border-green-800/50'
                  } else if (transfer.status === 'failed') {
                    statusColor = '#ff4d4f'
                    statusText = '失败'
                    statusIcon = <AlertCircle className="text-red-500" />
                    bgColor = 'bg-red-50 dark:bg-red-900/20'
                    borderColor = 'border-red-200 dark:border-red-800/50'
                  } else if (transfer.status === 'pending') {
                    statusColor = '#faad14'
                    statusText = '等待中'
                    statusIcon = <Hourglass className="text-yellow-500" />
                    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20'
                    borderColor = 'border-yellow-200 dark:border-yellow-800/50'
                  }
                  
                  return (
                    <div 
                      key={transfer.id} 
                      className={`p-6 rounded-xl ${bgColor} border ${borderColor} shadow-md transition-all duration-300 hover:shadow-lg`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="mr-3">
                              {statusIcon}
                            </div>
                            <Text className="font-bold text-gray-800 dark:text-white text-lg truncate">{transfer.fileName}</Text>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Text>→ {transfer.deviceName}</Text>
                          </div>
                          {transfer.errorMessage && (
                            <Text className="text-sm text-red-600 dark:text-red-400 mt-2">{transfer.errorMessage}</Text>
                          )}
                        </div>
                        <Badge 
                          color={statusColor} 
                          text={statusText} 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <Progress 
                          percent={transfer.progress} 
                          color={statusColor} 
                          className="h-2 rounded-full overflow-hidden"
                          showText={false}
                        />
                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{transfer.progress.toFixed(1)}%</span>
                          <span>{transfer.estimatedTime}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                        <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-700/50">
                          <div className="text-gray-500 dark:text-gray-400 mb-1">文件大小</div>
                          <div className="font-semibold text-gray-800 dark:text-white">{formatSize(transfer.fileSize)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-700/50">
                          <div className="text-gray-500 dark:text-gray-400 mb-1">速度</div>
                          <div className="font-semibold text-gray-800 dark:text-white">{formatSpeed(transfer.speed)}</div>
                        </div>
                        {transfer.chunks && (
                          <>
                            <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-700/50">
                              <div className="text-gray-500 dark:text-gray-400 mb-1">已传块数</div>
                              <div className="font-semibold text-gray-800 dark:text-white">{transfer.chunks.completed}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-700/50">
                              <div className="text-gray-500 dark:text-gray-400 mb-1">总块数</div>
                              <div className="font-semibold text-gray-800 dark:text-white">{transfer.chunks.total}</div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {transfer.status === 'transferring' && (
                          <Button 
                            size="small" 
                            icon={<Pause />} 
                            onClick={() => pauseTransfer(transfer.id)}
                            className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                          >
                            暂停
                          </Button>
                        )}
                        {transfer.status === 'pending' && (
                          <Button 
                            size="small" 
                            icon={<Play />} 
                            onClick={() => retryTransfer(transfer.id)}
                            className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600 transition-all"
                          >
                            继续
                          </Button>
                        )}
                        {transfer.status === 'transferring' && (
                          <Button 
                            size="small" 
                            icon={<X />} 
                            onClick={() => cancelTransfer(transfer.id)}
                            className="rounded-full bg-red-100 text-red-700 dark:bg-red-600/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-600 transition-all"
                          >
                            取消
                          </Button>
                        )}
                        {transfer.status === 'failed' && (
                          <Button 
                            size="small" 
                            icon={<RefreshCw />} 
                            onClick={() => retryTransfer(transfer.id)}
                            className="rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-600/50 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-600 transition-all"
                          >
                            重试
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          onClick={() => removeTransfer(transfer.id)}
                          className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                          移除
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* 页脚 */}
        <div className="text-center mt-12 mb-8">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            LocalSend Protocol v1.0 | 安全、快速的局域网文件传输
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ConnectionPage