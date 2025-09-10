'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface AgentStatus {
  status: 'idle' | 'running' | 'paused'
  currentTask: string | null
  taskId: string | null
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: string
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    status: 'idle',
    currentTask: null,
    taskId: null
  })
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentStep, setCurrentStep] = useState<string>('')

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      upgrade: false
    })

    newSocket.on('connect', () => {
      console.log('Verbonden met server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Verbinding verbroken')
      setIsConnected(false)
    })

    // Agent status updates
    newSocket.on('agent:status', (status: AgentStatus) => {
      setAgentStatus(status)
    })

    // Agent logs
    newSocket.on('agent:log', (logEntry: any) => {
      const formattedLog: LogEntry = {
        ...logEntry,
        timestamp: new Date(logEntry.timestamp)
      }
      setLogs(prev => [...prev, formattedLog].slice(-100)) // Keep last 100 logs
    })

    // Agent steps
    newSocket.on('agent:step', (data: { step: string; timestamp: string }) => {
      setCurrentStep(data.step)
    })

    // Task events
    newSocket.on('task:created', (task: any) => {
      console.log('Nieuwe taak:', task)
    })

    newSocket.on('task:updated', (task: any) => {
      console.log('Taak bijgewerkt:', task)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const startAgent = (instructions: string) => {
    if (socket && isConnected) {
      socket.emit('agent:start', { instructions })
    }
  }

  const stopAgent = () => {
    if (socket && isConnected) {
      socket.emit('agent:stop')
    }
  }

  const pauseAgent = () => {
    if (socket && isConnected) {
      socket.emit('agent:pause')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return {
    socket,
    isConnected,
    agentStatus,
    logs,
    currentStep,
    startAgent,
    stopAgent,
    pauseAgent,
    clearLogs
  }
}