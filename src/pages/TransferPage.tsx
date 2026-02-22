import React, { useState, useRef } from 'react'
import { Card, Button, Typography, List, Progress, Space, Toast, Uploader } from 'antd-mobile'
import { Upload, Pause, Play, X, RefreshCw, FileText, Image, Video, Archive, Eye } from 'antd-mobile-icons'
import { useFileTransferStore, formatSize, formatSpeed, calculateRemainingTime } from '../store/useFileTransferStore'
import FilePreview from '../components/FilePreview'

const { Title, Text } = Typography

const TransferPage: React.FC = () => {
  const { 
    files, 
    addFile, 
    removeFile, 
    startTransfer, 
    pauseTransfer, 
    resumeTransfer, 
    cancelTransfer, 
    clearCompleted 
  } = useFileTransferStore()
  
  const [dragging, setDragging] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewFile, setPreviewFile] = useState({ name: '', type: '', url: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => {
        addFile(file)
      })
      Toast.show({ message: `已添加 ${selectedFiles.length} 个文件`, position: 'top' })
    }
    // 重置input，以便可以重复选择相同的文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  // 处理拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  // 处理文件拖拽
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      Array.from(droppedFiles).forEach(file => {
        addFile(file)
      })
      Toast.show({ message: `已添加 ${droppedFiles.length} 个文件`, position: 'top' })
    }
  }

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // 处理文件预览
  const handlePreviewFile = (file: any) => {
    setPreviewFile({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(new Blob()) // 模拟文件URL
    })
    setPreviewVisible(true)
  }

  // 处理关闭预览
  const handleClosePreview = () => {
    setPreviewVisible(false)
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

  // 获取文件状态文本
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
      default:
        return '未知状态'
    }
  }

  return (
    <div 
      className="container mx-auto px-4 py-8"
      onDragOver={handleDragStart}
      onDragLeave={handleDragEnd}
      onDrop={handleDrop}
    >
      <Title level={2} className="text-center mb-8 text-blue-600 dark:text-blue-400">
        文件传输
      </Title>

      {/* 拖拽上传区域 */}
      <Card className={`mb-6 ${dragging ? 'border-2 border-primary bg-blue-50 dark:bg-blue-900/20' : ''}`}>
        <Card.Body className="flex flex-col items-center p-8">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Upload className="text-4xl text-primary mb-4" />
          <Title level={4} className="text-center mb-2">拖拽文件到此处</Title>
          <Text className="text-center mb-4">或点击按钮选择文件</Text>
          <Button color="primary" block onClick={triggerFileSelect}>
            选择文件
          </Button>
        </Card.Body>
      </Card>

      {/* 文件列表 */}
      <Card className="mb-6">
        <Card.Header 
          title="传输列表" 
          extra={
            files.some(file => file.status === 'completed') && (
              <Button size="small" onClick={clearCompleted}>
                清除已完成
              </Button>
            )
          }
        />
        <Card.Body>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <Text className="text-gray-500 dark:text-gray-400">暂无文件，请添加文件开始传输</Text>
            </div>
          ) : (
            <List>
              {files.map((file) => (
                <List.Item
                  key={file.id}
                  prefix={getFileIcon(file.type)}
                  title={
                    <div>
                      <Text className="font-medium">{file.name}</Text>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Text>{formatSize(file.size)}</Text>
                        <Text>{getStatusText(file.status)}</Text>
                      </div>
                    </div>
                  }
                  description={
                    file.status === 'uploading' || file.status === 'downloading' ? (
                      <div className="w-full">
                        <Progress percent={file.progress} className="mb-1" />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <Text>{formatSpeed(file.speed)}</Text>
                          <Text>{calculateRemainingTime(file)}</Text>
                        </div>
                      </div>
                    ) : file.status === 'completed' ? (
                      <Text className="text-green-500">传输完成</Text>
                    ) : file.status === 'failed' ? (
                      <Text className="text-red-500">传输失败</Text>
                    ) : null
                  }
                  suffix={
                    <Space>
                      {file.status === 'pending' && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => startTransfer(file.id)}
                        >
                          开始
                        </Button>
                      )}
                      {file.status === 'uploading' && (
                        <Button
                          size="small"
                          icon={<Pause />}
                          onClick={() => pauseTransfer(file.id)}
                        />
                      )}
                      {file.status === 'downloading' && (
                        <Button
                          size="small"
                          icon={<Pause />}
                          onClick={() => pauseTransfer(file.id)}
                        />
                      )}
                      {file.status === 'failed' && (
                        <Button
                          size="small"
                          icon={<RefreshCw />}
                          onClick={() => startTransfer(file.id)}
                        />
                      )}
                      {file.status === 'completed' && (
                        <>
                          <Button
                            size="small"
                            icon={<Eye />}
                            onClick={() => handlePreviewFile(file)}
                          >
                            预览
                          </Button>
                          <Button
                            size="small"
                            color="danger"
                            icon={<X />}
                            onClick={() => removeFile(file.id)}
                          />
                        </>
                      )}
                    </Space>
                  }
                />
              ))}
            </List>
          )}
        </Card.Body>
      </Card>

      {/* 传输统计 */}
      {files.length > 0 && (
        <Card>
          <Card.Header title="传输统计" />
          <Card.Body>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Text className="text-xl font-bold text-primary">{files.length}</Text>
                <Text className="text-gray-500 dark:text-gray-400">总文件数</Text>
              </div>
              <div className="text-center">
                <Text className="text-xl font-bold text-primary">
                  {files.filter(file => file.status === 'completed').length}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">已完成</Text>
              </div>
              <div className="text-center">
                <Text className="text-xl font-bold text-primary">
                  {files.filter(file => file.status === 'uploading' || file.status === 'downloading').length}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">传输中</Text>
              </div>
              <div className="text-center">
                <Text className="text-xl font-bold text-primary">
                  {files.filter(file => file.status === 'failed').length}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">传输失败</Text>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 文件预览组件 */}
      <FilePreview
        visible={previewVisible}
        onClose={handleClosePreview}
        file={previewFile}
      />
    </div>
  )
}

export default TransferPage