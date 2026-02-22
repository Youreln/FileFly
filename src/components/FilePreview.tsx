import React from 'react'
import { Modal, Image as AMImage, Video, Typography } from 'antd-mobile'
import { X } from 'antd-mobile-icons'

const { Text } = Typography

interface FilePreviewProps {
  visible: boolean
  onClose: () => void
  file: {
    name: string
    type: string
    url?: string
    blob?: Blob
  }
}

const FilePreview: React.FC<FilePreviewProps> = ({ visible, onClose, file }) => {
  // 获取文件URL
  const getFileUrl = () => {
    if (file.url) return file.url
    if (file.blob) return URL.createObjectURL(file.blob)
    return ''
  }

  // 渲染预览内容
  const renderPreviewContent = () => {
    const url = getFileUrl()
    if (!url) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Text className="text-gray-500">无法预览文件</Text>
        </div>
      )
    }

    if (file.type.startsWith('image/')) {
      return (
        <AMImage
          src={url}
          alt={file.name}
          mode="aspectFit"
          style={{ width: '100%', maxHeight: '80vh' }}
        />
      )
    } else if (file.type.startsWith('video/')) {
      return (
        <div className="w-full max-h-96">
          <Video
            src={url}
            controls
            autoPlay
            muted
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )
    } else if (file.type.includes('pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <iframe
            src={url}
            title={file.name}
            className="w-full h-full"
          />
        </div>
      )
    } else if (file.type.includes('text') || file.type.includes('code')) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Text className="text-gray-500">文本文件预览</Text>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Text className="text-gray-500">不支持的文件类型</Text>
        </div>
      )
    }
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={file.name}
      footer={null}
      closeIcon={<X />}
      className="file-preview-modal"
    >
      <div className="p-4">
        {renderPreviewContent()}
      </div>
    </Modal>
  )
}

export default FilePreview