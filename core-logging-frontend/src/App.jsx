import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DrillHoles from './components/DrillHoles'
import CoreLogging from './components/CoreLogging'
import CoreRecoveryCalculator from './components/CoreRecoveryCalculator'
import TrayTracking from './components/TrayTracking'
import Analytics from './components/Analytics'
import QAQCManagement from './components/QAQCManagement'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiHealth, setApiHealth] = useState(null)

  useEffect(() => {
    // Check API health on startup
    fetch('http://localhost:5001/api/health')
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(err => {
        console.error('API health check failed:', err)
        setApiHealth({ status: 'error', message: 'API connection failed' })
      })
  }, [])

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-500 hover:text-gray-700 lg:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold hidden sm:flex text-gray-900 ml-4 lg:ml-0">
                  Core Logging System
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* API Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    apiHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {apiHealth?.status === 'healthy' ? 'API Connected' : 'API Disconnected'}
                  </span>
                </div>
                
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">G</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Geologist</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/drill-holes" element={<DrillHoles />} />
              <Route path="/core-logging" element={<CoreLogging />} />
              <Route path="/core-recovery" element={<CoreRecoveryCalculator />} />
              <Route path="/tray-tracking" element={<TrayTracking />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/qaqc" element={<QAQCManagement />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
        
        <Toaster />
      </div>
    </Router>
  )
}

export default App

