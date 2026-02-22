import React, { useState, useEffect } from 'react'
import { Card, Button, Typography, List, Switch, InputNumber, Toast } from 'antd-mobile'
import { Shield, Clock, Trash2, Info } from 'antd-mobile-icons'
import { generateKey, exportKey } from '../utils/security'

const { Title, Text } = Typography

const SettingsPage: React.FC = () => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [expirationHours, setExpirationHours] = useState(24)
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true)
  const [encryptionKey, setEncryptionKey] = useState<string>('')

  useEffect(() => {
    // 生成加密密钥
    generateEncryptionKey()
  }, [])

  // 生成加密密钥
  const generateEncryptionKey = async () => {
    try {
      const key = await generateKey()
      const keyString = await exportKey(key)
      setEncryptionKey(keyString.substring(0, 20) + '...') // 只显示部分密钥
      Toast.show({ message: '加密密钥已生成', position: 'top' })
    } catch (error) {
      console.error('生成密钥失败:', error)
      Toast.show({ message: '生成密钥失败', position: 'top' })
    }
  }

  // 处理保存设置
  const handleSaveSettings = () => {
    Toast.show({ message: '设置已保存', position: 'top' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8 text-blue-600 dark:text-blue-400">
        设置
      </Title>

      <Card className="mb-6">
        <Card.Header title="安全设置" extra={<Shield className="text-primary" />} />
        <Card.Body>
          <List>
            <List.Item
              title="端到端加密"
              description="启用后，所有传输的数据都会被加密"
              suffix={
                <Switch
                  checked={encryptionEnabled}
                  onChange={setEncryptionEnabled}
                />
              }
            />
            <List.Item
              title="自动过期"
              description="设置文件自动过期时间"
              suffix={
                <div className="flex items-center gap-2">
                  <InputNumber
                    value={expirationHours}
                    onChange={setExpirationHours}
                    min={1}
                    max={720}
                    style={{ width: 80 }}
                  />
                  <Text>小时</Text>
                </div>
              }
            />
            <List.Item
              title="自动删除"
              description="启用后，过期文件会自动删除"
              suffix={
                <Switch
                  checked={autoDeleteEnabled}
                  onChange={setAutoDeleteEnabled}
                />
              }
            />
            <List.Item
              title="加密密钥"
              description="用于端到端加密的密钥"
              suffix={
                <Button size="small" onClick={generateEncryptionKey}>
                  重新生成
                </Button>
              }
            />
            <List.Item description={
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                {encryptionKey}
              </div>
            } />
          </List>
        </Card.Body>
      </Card>

      <Card className="mb-6">
        <Card.Header title="关于" extra={<Info className="text-primary" />} />
        <Card.Body>
          <List>
            <List.Item title="应用名称" description="飞传 (FileFly)" />
            <List.Item title="版本" description="1.0.0" />
            <List.Item title="描述" description="跨设备文件互传工具" />
            <List.Item title="GitHub" description="https://github.com/filefly-app/filefly" />
          </List>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header title="数据管理" extra={<Trash2 className="text-primary" />} />
        <Card.Body>
          <Button color="danger" block className="mb-4">
            清除所有传输记录
          </Button>
          <Button color="danger" block>
            清除所有缓存
          </Button>
        </Card.Body>
      </Card>

      <div className="mt-8">
        <Button color="primary" block onClick={handleSaveSettings}>
          保存设置
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage