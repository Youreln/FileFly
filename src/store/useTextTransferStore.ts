import { create } from 'zustand'

interface TextItem {
  id: string
  content: string
  type: 'text' | 'code'
  status: 'sent' | 'received' | 'failed'
  timestamp: Date
  fromDevice?: string
  toDevice?: string
}

interface TextTransferState {
  // 文本列表
  texts: TextItem[]
  
  // 操作方法
  sendText: (content: string, type: 'text' | 'code') => void
  receiveText: (content: string, type: 'text' | 'code') => void
  copyText: (textId: string) => void
  deleteText: (textId: string) => void
  clearTexts: () => void
}

// 生成文本ID
const generateTextId = (): string => {
  return `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useTextTransferStore = create<TextTransferState>((set, get) => ({
  // 初始化状态
  texts: [],
  
  // 发送文本
  sendText: (content: string, type: 'text' | 'code') => {
    const newText: TextItem = {
      id: generateTextId(),
      content,
      type,
      status: 'sent',
      timestamp: new Date(),
      fromDevice: 'local',
      toDevice: 'remote'
    }
    set(state => ({ texts: [newText, ...state.texts] }))
  },
  
  // 接收文本
  receiveText: (content: string, type: 'text' | 'code') => {
    const newText: TextItem = {
      id: generateTextId(),
      content,
      type,
      status: 'received',
      timestamp: new Date(),
      fromDevice: 'remote',
      toDevice: 'local'
    }
    set(state => ({ texts: [newText, ...state.texts] }))
  },
  
  // 复制文本
  copyText: (textId: string) => {
    const { texts } = get()
    const text = texts.find(t => t.id === textId)
    if (text) {
      navigator.clipboard.writeText(text.content)
    }
  },
  
  // 删除文本
  deleteText: (textId: string) => {
    const { texts } = get()
    const updatedTexts = texts.filter(text => text.id !== textId)
    set({ texts: updatedTexts })
  },
  
  // 清空文本
  clearTexts: () => {
    set({ texts: [] })
  }
}))