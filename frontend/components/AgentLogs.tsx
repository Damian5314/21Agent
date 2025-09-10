'use client'

import { useState, useEffect } from 'react'
import { ScrollText, Download, Trash2, Filter } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: string
}

interface AgentLogsProps {
  logs: LogEntry[]
  clearLogs: () => void
}

export default function AgentLogs({ logs, clearLogs }: AgentLogsProps) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all')

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return '💭'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
    }
  }


  const exportLogs = () => {
    const logData = logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      details: log.details
    }))
    
    const dataStr = JSON.stringify(logData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `21agent-logs-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <ScrollText className="w-5 h-5 mr-2" />
          Agent Logs
        </h2>
        <div className="flex items-center space-x-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Alle logs</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Waarschuwing</option>
            <option value="error">Error</option>
          </select>
          
          <button
            onClick={exportLogs}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Logs exporteren"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={clearLogs}
            className="p-1 text-gray-500 hover:text-red-600"
            title="Logs wissen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ScrollText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Geen logs beschikbaar</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`border rounded-lg p-3 ${getLevelColor(log.level)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <span className="text-sm">{getLevelIcon(log.level)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    {log.details && (
                      <p className="text-xs opacity-75 mt-1">{log.details}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs opacity-60 ml-2 flex-shrink-0">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}