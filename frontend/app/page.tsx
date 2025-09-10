'use client'

import { Play, Square, Eye, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react'
import AgentControls from '@/components/AgentControls'
import TaskMonitor from '@/components/TaskMonitor'
import AgentLogs from '@/components/AgentLogs'
import { useSocket } from '@/hooks/useSocket'

export default function Dashboard() {
  const { 
    isConnected, 
    agentStatus, 
    logs, 
    currentStep,
    startAgent, 
    stopAgent, 
    pauseAgent, 
    clearLogs 
  } = useSocket()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">21Agent Dashboard</h1>
              <p className="text-sm text-gray-600">AI-agent voor 21QUBZ platform ondersteuning</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-600">
                  {isConnected ? 'Verbonden' : 'Niet verbonden'}
                </span>
              </div>
              
              {/* Agent Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  agentStatus.status === 'running' ? 'bg-green-500 animate-pulse' :
                  agentStatus.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {agentStatus.status === 'running' ? 'Actief' :
                   agentStatus.status === 'paused' ? 'Gepauzeerd' : 'Inactief'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Controls */}
          <div className="lg:col-span-1">
            <AgentControls 
              agentStatus={agentStatus.status}
              currentTask={agentStatus.currentTask || ''}
              startAgent={startAgent}
              stopAgent={stopAgent}
              pauseAgent={pauseAgent}
              isConnected={isConnected}
            />
          </div>

          {/* Task Monitor & Logs */}
          <div className="lg:col-span-2 space-y-8">
            <TaskMonitor 
              agentStatus={agentStatus.status}
              currentTask={agentStatus.currentTask || ''}
              currentStep={currentStep}
            />
            <AgentLogs 
              logs={logs}
              clearLogs={clearLogs}
            />
          </div>
        </div>
      </div>
    </div>
  )
}