import React from 'react'
import { Card, Button, Typography, List, Space, Toast } from 'antd-mobile'
import { History, RefreshCw, X, FileText, Image, Video, Archive, MessageSquare } from 'antd-mobile-icons'
import { useFileTransferStore, formatSize } from '../store/useFileTransferStore'
import { useTextTransferStore } from '../store/useTextTransferStore'

const { Title, Text } = Typography

const HistoryPage: React.FC = () => {
  const { files, removeFile } = useFileTransferStore()
  const { texts, deleteText } = useTextTransferStore()

  // 合并所有传输记录并按时间排序
  const allRecords = [
    ...files.map(file => ({
      id: file.id,
      type: 'file' as const,
      name: file.name,
      size: file.size,
      fileType: file.type,
      progress: file.progress,
      status: file.status,
      timestamp: file.startTime
    })),
    ...texts.map(text => ({
      id: text.id,
      type: 'text' as const,
      content: text.content,
      textType: text.type,
      status: text.status,
      timestamp: text.timestamp
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // 格式化时间
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString()
  }

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="text-primary" />
    } else if (fileType.startsWith('video/')) {
      return <Video className="text-primary" />
    } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
      return <Archive className="text-primary" />
    } else {
      return <FileText className="text-primary" />
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待传输'
      case 'uploading':
        return '传输中'
      case 'downloading':
        return '下载中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '传输失败'
      case 'sent':
        return '已发送'
      case 'received':
        return '已接收'
      default:
        return '未知状态'
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'sent':
      case 'received':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      case 'uploading':
      case 'downloading':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  // 处理删除记录
  const handleDeleteRecord = (id: string, type: 'file' | 'text') => {
    if (type === 'file') {
      removeFile(id)
    } else {
      deleteText(id)
    }
    Toast.show({ message: '已删除', position: 'top' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8 text-blue-600 dark:text-blue-400">
        传输历史
      </Title>

      <Card className="mb-6">
        <Card.Header title="所有传输记录" />
        <Card.Body>
          {allRecords.length === 0 ? (
            <div className="text-center py-8">
              <History className="text-4xl text-gray-400 mb-4" />
              <Text className="text-gray-500 dark:text-gray-400">暂无传输记录</Text>
            </div>
          ) : (
            <List>
              {allRecords.map((record) => (
                <List.Item
                  key={record.id}
                  prefix={
                    record.type === 'file' ? (
                      getFileIcon(record.fileType)
                    ) : (
                      <MessageSquare className="text-primary" />
                    )
                  }
                  title={
                    <div>
                      <div className="flex justify-between items-center">
                        <Text className="font-medium">
                          {record.type === 'file' ? record.name : record.textType === 'code' ? '代码片段' : '文本消息'}
                        </Text>
                        <Text className={`text-xs ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </Text>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Text>
                          {record.type === 'file' ? formatSize(record.size) : `${record.content.length} 字符`}
                        </Text>
                        <Text>{formatTime(record.timestamp)}</Text>
                      </div>
                      {record.type === 'text' && (
                        <div className={`mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm`}>
                          <Text className="whitespace-pre-wrap break-words">
                            {record.content.length > 50 ? `${record.content.substring(0, 50)}...` : record.content}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                  suffix={
                    <Space>
                      <Button
                        size="small"
                        icon={<RefreshCw />}
                        onClick={() => {
                          // 这里可以添加重发功能
                          Toast.show({ message: '重发功能开发中', position: 'top' })
                        }}
                      />
                      <Button
                        size="small"
                        color="danger"
                        icon={<X />}
                        onClick={() => handleDeleteRecord(record.id, record.type)}
                      />
                    </Space>
                  }
                />
              ))}
            </List>
          )}
        </Card.Body>
      </Card>

      {/* 统计信息 */}
      {allRecords.length > 0 && (
        <Card>
          <Card.Header title="传输统计" />
          <Card.Body>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Text className="text-xl font-bold text-primary">{files.length}</Text>
                <Text className="text-gray-500 dark:text-gray-400">文件传输</Text>
              </div>
              <div className="text-center">
                <Text className="text-xl font-bold text-primary">{texts.length}</Text>
                <Text className="text-gray-500 dark:text-gray-400">文本传输</Text>
              </div>
              <div className="text-center">
                <Text className="text-xl font-bold text-green-500">
                  {allRecords.filter(r => r.status === 'completed' || r.status === 'sent' || r.status === 'received').length}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">成功传输</Text>
              </div>
              <div className="text-center">
                <Text className="text-xl font-bold text-red-500">
                  {allRecords.filter(r => r.status === 'failed').length}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">传输失败</Text>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default HistoryPage