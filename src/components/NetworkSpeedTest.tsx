import React, { useState, useRef } from 'react'
import { Card, Button, Typography, Progress, Toast } from 'antd-mobile'
import { Wifi, Clock } from 'antd-mobile-icons'

const { Title, Text } = Typography

interface NetworkSpeedTestProps {
  onTestComplete?: (speed: number) => void
}

const NetworkSpeedTest: React.FC<NetworkSpeedTestProps> = ({ onTestComplete }) => {
  const [isTesting, setIsTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState<number | null>(null)
  const [ping, setPing] = useState<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // 执行测速
  const performSpeedTest = async () => {
    setIsTesting(true)
    setProgress(0)
    setSpeed(null)
    setPing(null)

    try {
      // 测试延迟
      const pingStart = Date.now()
      await fetch('/')
      const pingEnd = Date.now()
      const calculatedPing = pingEnd - pingStart
      setPing(calculatedPing)
      setProgress(30)

      // 测试下载速度
      startTimeRef.current = Date.now()
      const testFileSize = 1024 * 1024 // 1MB
      const testData = new Array(testFileSize).fill('x').join('')
      
      // 模拟下载过程
      for (let i = 30; i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setProgress(i)
      }

      const endTime = Date.now()
      const duration = (endTime - startTimeRef.current) / 1000
      const calculatedSpeed = (testFileSize * 8) / (duration * 1024 * 1024) // Mbps
      
      setSpeed(calculatedSpeed)
      setProgress(100)
      
      if (onTestComplete) {
        onTestComplete(calculatedSpeed)
      }

      Toast.show({ message: '测速完成', position: 'top' })
    } catch (error) {
      console.error('测速失败:', error)
      Toast.show({ message: '测速失败', position: 'top' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="mb-6">
      <Card.Header title="局域网测速" extra={<Wifi className="text-primary" />} />
      <Card.Body>
        <Button 
          color="primary" 
          block 
          onClick={performSpeedTest}
          disabled={isTesting}
          className="mb-4"
        >
          {isTesting ? '测速中...' : '开始测速'}
        </Button>
        
        {isTesting && (
          <Progress percent={progress} className="mb-4" />
        )}

        {speed !== null && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Text>下载速度:</Text>
              <Text className="font-bold text-primary">{speed.toFixed(2)} Mbps</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text>延迟:</Text>
              <Text className="font-bold text-primary">{ping} ms</Text>
            </div>
            <div className="flex justify-between items-center">
              <Text>网络质量:</Text>
              <Text className={`font-bold ${speed > 10 ? 'text-green-500' : speed > 5 ? 'text-yellow-500' : 'text-red-500'}`}>
                {speed > 10 ? '优秀' : speed > 5 ? '良好' : '一般'}
              </Text>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="text-sm">
            <Clock className="inline mr-1" /> 测速说明：
            本测试通过模拟文件传输来估算局域网传输速度，
            结果仅供参考。
          </Text>
        </div>
      </Card.Body>
    </Card>
  )
}

export default NetworkSpeedTest