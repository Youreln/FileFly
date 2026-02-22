import React, { useState } from 'react'
import { Card, Button, Typography, List, Input, Textarea, Space, Toast, Radio } from 'antd-mobile'
import { Send, Copy, X, Code, FileText } from 'antd-mobile-icons'
import { useTextTransferStore } from '../store/useTextTransferStore'

const { Title, Text } = Typography

const TextTransferPage: React.FC = () => {
  const { texts, sendText, copyText, deleteText, clearTexts } = useTextTransferStore()
  const [content, setContent] = useState('')
  const [textType, setTextType] = useState<'text' | 'code'>('text')

  // 处理发送文本
  const handleSendText = () => {
    if (!content.trim()) {
      Toast.show({ message: '请输入内容', position: 'top' })
      return
    }
    sendText(content, textType)
    setContent('')
    Toast.show({ message: '发送成功', position: 'top' })
  }

  // 处理复制文本
  const handleCopyText = (textId: string) => {
    copyText(textId)
    Toast.show({ message: '已复制到剪贴板', position: 'top' })
  }

  // 处理删除文本
  const handleDeleteText = (textId: string) => {
    deleteText(textId)
    Toast.show({ message: '已删除', position: 'top' })
  }

  // 处理清空文本
  const handleClearTexts = () => {
    clearTexts()
    Toast.show({ message: '已清空', position: 'top' })
  }

  // 格式化时间
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8 text-blue-600 dark:text-blue-400">
        文本互传
      </Title>

      {/* 文本输入区域 */}
      <Card className="mb-6">
        <Card.Header title="发送文本" />
        <Card.Body>
          <Radio.Group value={textType} onChange={(value) => setTextType(value)} className="mb-4">
            <Space>
              <Radio value="text">
                <FileText className="mr-1" />
                普通文本
              </Radio>
              <Radio value="code">
                <Code className="mr-1" />
                代码片段
              </Radio>
            </Space>
          </Radio.Group>
          <Textarea
            value={content}
            onChange={(value) => setContent(value)}
            placeholder={textType === 'text' ? '输入普通文本...' : '输入代码片段...'}
            rows={4}
            className="mb-4"
          />
          <Button color="primary" block onClick={handleSendText}>
            <Send className="mr-2" />
            发送
          </Button>
        </Card.Body>
      </Card>

      {/* 文本历史记录 */}
      <Card className="mb-6">
        <Card.Header 
          title="文本历史" 
          extra={
            texts.length > 0 && (
              <Button size="small" onClick={handleClearTexts}>
                清空
              </Button>
            )
          }
        />
        <Card.Body>
          {texts.length === 0 ? (
            <div className="text-center py-8">
              <Text className="text-gray-500 dark:text-gray-400">暂无文本记录</Text>
            </div>
          ) : (
            <List>
              {texts.map((text) => (
                <List.Item
                  key={text.id}
                  prefix={
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${text.status === 'sent' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'}`}>
                      {text.type === 'code' ? <Code size={16} /> : <FileText size={16} />}
                    </div>
                  }
                  title={
                    <div>
                      <div className="flex justify-between items-center">
                        <Text className="font-medium">
                          {text.status === 'sent' ? '已发送' : '已接收'} - {text.type === 'code' ? '代码片段' : '普通文本'}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(text.timestamp)}
                        </Text>
                      </div>
                      <div className={`mt-2 p-3 rounded-lg ${text.type === 'code' ? 'bg-gray-100 dark:bg-gray-800 font-mono text-sm' : 'bg-gray-50 dark:bg-gray-900'}`}>
                        <Text className="whitespace-pre-wrap break-words">{text.content}</Text>
                      </div>
                    </div>
                  }
                  suffix={
                    <Space>
                      <Button
                        size="small"
                        icon={<Copy />}
                        onClick={() => handleCopyText(text.id)}
                      />
                      <Button
                        size="small"
                        color="danger"
                        icon={<X />}
                        onClick={() => handleDeleteText(text.id)}
                      />
                    </Space>
                  }
                />
              ))}
            </List>
          )}
        </Card.Body>
      </Card>

      {/* 使用提示 */}
      <Card>
        <Card.Header title="使用提示" />
        <Card.Body>
          <List>
            <List.Item description="支持发送普通文本和代码片段" />
            <List.Item description="接收方可以一键复制内容" />
            <List.Item description="所有文本仅在本地存储，不会上传到服务器" />
            <List.Item description="支持跨设备实时同步" />
          </List>
        </Card.Body>
      </Card>
    </div>
  )
}

export default TextTransferPage