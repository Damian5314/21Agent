'use client'

import { useState, useEffect } from 'react'
import { Eye, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

interface TaskMonitorProps {
  agentStatus: 'idle' | 'running' | 'paused'
  currentTask: string
  currentStep: string
}

export default function TaskMonitor({ agentStatus, currentTask, currentStep }: TaskMonitorProps) {
  const getStatusIcon = (status: 'pending' | 'running' | 'completed' | 'error') => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Live Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Real-time weergave</span>
        </div>
      </div>

      {agentStatus === 'idle' ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Agent is inactief</p>
          <p className="text-sm">Start een taak om de voortgang te bekijken</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Task */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Huidige Taak</h3>
            <p className="text-sm text-blue-700">{currentTask}</p>
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                <span className="text-sm font-medium text-green-800">{currentStep}</span>
              </div>
            </div>
          )}

          {/* Steps Progress - Simplified for demo */}
          {agentStatus === 'running' && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Demo Stappen</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verbinding maken met 21QUBZ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Inloggen in testomgeving</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span>Instructies analyseren met AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Acties uitvoeren</span>
                </div>
              </div>
            </div>
          )}

          {agentStatus === 'paused' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Agent gepauzeerd</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}