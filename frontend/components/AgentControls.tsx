'use client'

import { useState } from 'react'
import { Play, Square, Pause, Send } from 'lucide-react'

interface AgentControlsProps {
  agentStatus: 'idle' | 'running' | 'paused'
  currentTask: string
  startAgent: (instructions: string) => void
  stopAgent: () => void
  pauseAgent: () => void
  isConnected: boolean
}

export default function AgentControls({ 
  agentStatus, 
  currentTask,
  startAgent,
  stopAgent,
  pauseAgent,
  isConnected
}: AgentControlsProps) {
  const [instructions, setInstructions] = useState('')

  const handleStart = () => {
    if (instructions.trim() && isConnected) {
      startAgent(instructions)
      setInstructions('')
    }
  }

  const handleStop = () => {
    if (isConnected) {
      stopAgent()
    }
  }

  const handlePause = () => {
    if (isConnected) {
      pauseAgent()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Besturing</h2>
      
      <div className="space-y-4">
        {/* Instructions Input */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Instructies voor de agent
          </label>
          <textarea
            id="instructions"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Bijvoorbeeld: Verwijder alle ingeplande ledigingen bij contracten die al verlopen zijn..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            disabled={agentStatus === 'running' || !isConnected}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3">
          {agentStatus === 'idle' ? (
            <button
              onClick={handleStart}
              disabled={!instructions.trim() || !isConnected}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Agent
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <Pause className="w-4 h-4 mr-2" />
                {agentStatus === 'paused' ? 'Hervatten' : 'Pauzeren'}
              </button>
              <button
                onClick={handleStop}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </button>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Snelle Acties</h3>
          <div className="space-y-2">
            <button
              onClick={() => setInstructions('Controleer alle verlopen contracten en verwijder bijbehorende ingeplande ledigingen')}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              disabled={agentStatus === 'running' || !isConnected}
            >
              🗑️ Verlopen contracten opschonen
            </button>
            <button
              onClick={() => setInstructions('Zoek naar dubbele entries in het systeem en markeer deze voor review')}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              disabled={agentStatus === 'running' || !isConnected}
            >
              🔍 Dubbele entries detecteren
            </button>
            <button
              onClick={() => setInstructions('Controleer alle openstaande facturen ouder dan 30 dagen')}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              disabled={agentStatus === 'running' || !isConnected}
            >
              💰 Openstaande facturen controleren
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}