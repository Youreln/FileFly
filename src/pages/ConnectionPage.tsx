import React, { useEffect } from 'react'
import { Card, Button, Input, Typography, List, Avatar, Space, Divider, Toast } from 'antd-mobile'
import { QrCode, Link, Wifi, Copy, RefreshCw, Share2, Clipboard } from 'antd-mobile-icons'
import QRCode from 'qrcode.react'
import { useConnectionStore } from '../store/useConnectionStore'
import NetworkSpeedTest from '../components/NetworkSpeedTest'
import HotspotList from '../components/HotspotList'

const { Title, Text } = Typography

const ConnectionPage: React.FC = () => {
  const {
    deviceName,
    pairingCode,
    shareLink,
    connectedDevices,
    isConnected,
    generatePairingCode,
    generateShareLink,
    connectToDevice,
    disconnectFromDevice,
    discoverDevices,
    syncClipboard
  } = useConnectionStore()

  useEffect(() => {
    // 初始化时生成必要的连接信息
    generateShareLink()
  }, [])

  const handleCopyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode)
    Toast.show({ message: '配对码已复制', position: 'top' })
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    Toast.show({ message: '分享链接已复制', position: 'top' })
  }

  const handleRefreshPairingCode = () => {
    generatePairingCode()
    Toast.show({ message: '配对码已刷新', position: 'top' })
  }

  const handleDiscoverDevices = () => {
    discoverDevices()
    Toast.show({ message: '正在搜索附近设备...', position: 'top' })
  }

  const handleSyncClipboard = () => {
    // 模拟剪贴板同步
    syncClipboard('测试剪贴板同步内容')
    Toast.show({ message: '剪贴板已同步', position: 'top' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8 text-blue-600 dark:text-blue-400">
        连接设备
      </Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 二维码连接 */}
        <Card className="card fade-in">
          <Card.Header
            title="二维码连接"
            extra={<QrCode className="text-primary" />}
          />
          <Card.Body className="flex flex-col items-center">
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <QRCode value={JSON.stringify({ deviceId: 'test_device_id', deviceName })} size={200} />
            </div>
            <Text className="text-center mb-4">扫描二维码即可连接</Text>
            <Button color="primary" size="small" onClick={handleSyncClipboard}>
              <Clipboard className="mr-2" />
              同步剪贴板
            </Button>
          </Card.Body>
        </Card>

        {/* 配对码连接 */}
        <Card className="card fade-in">
          <Card.Header
            title="配对码连接"
            extra={<Link className="text-primary" />}
          />
          <Card.Body>
            <div className="flex justify-between items-center mb-4">
              <Text className="text-xl font-bold">{pairingCode}</Text>
              <Space>
                <Button
                  size="small"
                  shape="circle"
                  icon={<Copy />}
                  onClick={handleCopyPairingCode}
                />
                <Button
                  size="small"
                  shape="circle"
                  icon={<RefreshCw />}
                  onClick={handleRefreshPairingCode}
                />
              </Space>
            </div>
            <Input
              placeholder="输入对方的配对码"
              className="mb-4"
              maxLength={6}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // 这里可以添加配对码验证逻辑
                  Toast.show({ message: '连接中...', position: 'top' })
                }
              }}
            />
            <Button color="primary" block>连接</Button>
          </Card.Body>
        </Card>

        {/* 局域网发现 */}
        <Card className="card fade-in">
          <Card.Header
            title="局域网发现"
            extra={<Wifi className="text-primary" />}
          />
          <Card.Body>
            <Button color="primary" size="small" onClick={handleDiscoverDevices} className="mb-4">
              搜索附近设备
            </Button>
            <List>
              {connectedDevices.map((device) => (
                <List.Item
                  key={device.id}
                  prefix={<Avatar>{device.name.charAt(0)}</Avatar>}
                  title={device.name}
                  description={`${device.type === 'mobile' ? '手机' : device.type === 'tablet' ? '平板' : '电脑'}`}
                  suffix={
                    <Button
                      color={isConnected ? 'danger' : 'primary'}
                      size="small"
                      onClick={() => {
                        if (isConnected) {
                          disconnectFromDevice(device.id)
                        } else {
                          connectToDevice(device.id)
                        }
                      }}
                    >
                      {isConnected ? '断开' : '连接'}
                    </Button>
                  }
                />
              ))}
              {connectedDevices.length === 0 && (
                <List.Item>
                  <Text className="text-gray-500 dark:text-gray-400">未发现设备</Text>
                </List.Item>
              )}
            </List>
          </Card.Body>
        </Card>

        {/* 链接分享 */}
        <Card className="card fade-in">
          <Card.Header
            title="链接分享"
            extra={<Share2 className="text-primary" />}
          />
          <Card.Body>
            <div className="flex justify-between items-center mb-4">
              <Text className="truncate max-w-[200px]">{shareLink}</Text>
              <Button
                size="small"
                icon={<Copy />}
                onClick={handleCopyShareLink}
              >
                复制
              </Button>
            </div>
            <Space className="w-full justify-between">
              <Button color="primary" size="small" block>
                分享到微信
              </Button>
              <Button color="primary" size="small" block>
                分享到QQ
              </Button>
            </Space>
          </Card.Body>
        </Card>
      </div>

      {/* 已连接设备 */}
      {isConnected && (
        <Card className="mt-6 card fade-in">
          <Card.Header title="已连接设备" />
          <Card.Body>
            <List>
              {connectedDevices.map((device) => (
                <List.Item
                  key={device.id}
                  prefix={<Avatar>{device.name.charAt(0)}</Avatar>}
                  title={device.name}
                  description={`${device.type === 'mobile' ? '手机' : device.type === 'tablet' ? '平板' : '电脑'} - 在线`}
                  suffix={
                    <Button
                      color="danger"
                      size="small"
                      onClick={() => disconnectFromDevice(device.id)}
                    >
                      断开
                    </Button>
                  }
                />
              ))}
            </List>
          </Card.Body>
        </Card>
      )}

      {/* 附近热点 */}
      <HotspotList />

      {/* 局域网测速 */}
      <NetworkSpeedTest />
    </div>
  )
}

export default ConnectionPage