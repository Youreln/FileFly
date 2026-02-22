import React, { useState, useEffect } from 'react'
import { Button, Switch, Typography, TabBar } from 'antd-mobile'
import { Link, File, MessageSquare, History, Settings, Moon, Sun, Github } from 'antd-mobile-icons'
import ConnectionPage from './pages/ConnectionPage'
import TransferPage from './pages/TransferPage'
import TextTransferPage from './pages/TextTransferPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

const { Title, Text } = Typography

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('connection')

  useEffect(() => {
    // 检测系统深色模式偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'connection':
        return <ConnectionPage />
      case 'transfer':
        return <TransferPage />
      case 'text':
        return <TextTransferPage />
      case 'history':
        return <HistoryPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <ConnectionPage />
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Title level={1} className="text-blue-600 dark:text-blue-400 text-xl">
            飞传
          </Title>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            (FileFly)
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://github.com/filefly-app/filefly" target="_blank" rel="noopener noreferrer">
            <Button
              size="small"
              shape="circle"
              icon={<Github />}
            />
          </a>
          <Button
            size="small"
            shape="circle"
            icon={darkMode ? <Sun /> : <Moon />}
            onClick={toggleDarkMode}
          />
        </div>
      </div>

      <div className="pb-20">
        {renderContent()}
      </div>

      <TabBar activeKey={activeTab} onChange={setActiveTab} className="fixed bottom-0 left-0 right-0 z-10">
        <TabBar.Item key="connection" icon={<Link />} label="连接">
          连接
        </TabBar.Item>
        <TabBar.Item key="transfer" icon={<File />} label="传输">
          传输
        </TabBar.Item>
        <TabBar.Item key="text" icon={<MessageSquare />} label="文本">
          文本
        </TabBar.Item>
        <TabBar.Item key="history" icon={<History />} label="历史">
          历史
        </TabBar.Item>
        <TabBar.Item key="settings" icon={<Settings />} label="设置">
          设置
        </TabBar.Item>
      </TabBar>
    </div>
  )
}

export default App