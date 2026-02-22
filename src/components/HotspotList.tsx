import React, { useState, useEffect } from 'react'
import { Card, Typography, List, Avatar, Button, Toast } from 'antd-mobile'
import { Wifi, RefreshCw } from 'antd-mobile-icons'

const { Title, Text } = Typography

interface Hotspot {
  id: string
  name: string
  signal: number // 0-100
  security: 'none' | 'wep' | 'wpa' | 'wpa2'
  isConnected: boolean
}

const HotspotList: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // 初始化时扫描热点
    scanHotspots()
    
    // 每30秒自动刷新
    const interval = setInterval(scanHotspots, 30000)
    return () => clearInterval(interval)
  }, [])

  // 扫描热点
  const scanHotspots = async () => {
    setIsScanning(true)
    Toast.show({ message: '正在搜索热点...', position: 'top' })

    try {
      // 模拟热点数据
      const mockHotspots: Hotspot[] = [
        {
          id: 'hotspot_1',
          name: 'Home WiFi',
          signal: 90,
          security: 'wpa2',
          isConnected: true
        },
        {
          id: 'hotspot_2',
          name: 'Office Network',
          signal: 75,
          security: 'wpa2',
          isConnected: false
        },
        {
          id: 'hotspot_3',
          name: 'Public WiFi',
          signal: 60,
          security: 'none',
          isConnected: false
        },
        {
          id: 'hotspot_4',
          name: 'Mobile Hotspot',
          signal: 85,
          security: 'wpa2',
          isConnected: false
        }
      ]

      // 模拟扫描延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHotspots(mockHotspots)
      Toast.show({ message: `发现 ${mockHotspots.length} 个热点`, position: 'top' })
    } catch (error) {
      console.error('扫描热点失败:', error)
      Toast.show({ message: '扫描热点失败', position: 'top' })
    } finally {
      setIsScanning(false)
    }
  }

  // 获取信号强度图标
  const getSignalIcon = (signal: number) => {
    if (signal >= 80) return '📶'
    if (signal >= 60) return '📶'
    if (signal >= 40) return '📶'
    return '📶'
  }

  // 获取安全类型文本
  const getSecurityText = (security: Hotspot['security']) => {
    switch (security) {
      case 'none':
        return '无密码'
      case 'wep':
        return 'WEP'
      case 'wpa':
        return 'WPA'
      case 'wpa2':
        return 'WPA2'
      default:
        return '未知'
    }
  }

  return (
    <Card className="mb-6">
      <Card.Header 
        title="附近热点" 
        extra={
          <Button 
            size="small" 
            icon={<RefreshCw />} 
            onClick={scanHotspots}
            disabled={isScanning}
          >
            {isScanning ? '扫描中...' : '刷新'}
          </Button>
        }
      />
      <Card.Body>
        {hotspots.length === 0 ? (
          <div className="text-center py-4">
            <Wifi className="text-4xl text-gray-400 mb-2" />
            <Text className="text-gray-500">未发现热点</Text>
            <Button 
              color="primary" 
              size="small" 
              onClick={scanHotspots}
              className="mt-4"
            >
              扫描热点
            </Button>
          </div>
        ) : (
          <List>
            {hotspots.map((hotspot) => (
              <List.Item
                key={hotspot.id}
                prefix={
                  <Avatar>
                    {getSignalIcon(hotspot.signal)}
                  </Avatar>
                }
                title={
                  <div className="flex justify-between items-center">
                    <Text className="font-medium">{hotspot.name}</Text>
                    {hotspot.isConnected && (
                      <Text className="text-xs text-green-500">已连接</Text>
                    )}
                  </div>
                }
                description={
                  <div className="flex justify-between items-center">
                    <Text className="text-xs">
                      {getSecurityText(hotspot.security)}
                    </Text>
                    <Text className="text-xs">
                      信号: {hotspot.signal}%
                    </Text>
                  </div>
                }
                suffix={
                  !hotspot.isConnected && (
                    <Button size="small" color="primary">
                      连接
                    </Button>
                  )
                }
              />
            ))}
          </List>
        )}
      </Card.Body>
    </Card>
  )
}

export default HotspotList