'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Globe, Loader2, RotateCcw, Home, ArrowLeft, ArrowRight } from 'lucide-react'

interface BrowserInterfaceProps {
  onCommand: (command: string) => void
  isProcessing: boolean
  currentUrl: string
}

export default function BrowserInterface({ onCommand, isProcessing, currentUrl }: BrowserInterfaceProps) {
  const [command, setCommand] = useState('')
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isProcessing) {
      onCommand(command.trim())
      setCommand('')
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (browserUrl.trim()) {
      setBrowserUrl(browserUrl)
      onCommand(`ga naar ${browserUrl}`)
    }
  }

  const handleNavigation = (direction: 'back' | 'forward' | 'home' | 'refresh') => {
    switch (direction) {
      case 'back':
        onCommand('ga terug')
        break
      case 'forward':
        onCommand('ga vooruit')
        break
      case 'home':
        setBrowserUrl('https://www.google.com')
        onCommand('ga naar google.com')
        break
      case 'refresh':
        onCommand('ververs de pagina')
        break
    }
  }

  // Update browser URL when currentUrl changes
  useEffect(() => {
    if (currentUrl && currentUrl !== browserUrl) {
      setBrowserUrl(currentUrl)
    }
  }, [currentUrl])

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* Browser Controls */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavigation('back')}
              disabled={isProcessing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigation('forward')}
              disabled={isProcessing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigation('refresh')}
              disabled={isProcessing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigation('home')}
              disabled={isProcessing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex items-center space-x-2 mb-4">
          <div className="flex-1 flex items-center bg-white border rounded-lg">
            <Globe className="w-4 h-4 text-gray-400 ml-3" />
            <input
              type="text"
              value={browserUrl}
              onChange={(e) => setBrowserUrl(e.target.value)}
              placeholder="Voer een URL in..."
              className="flex-1 px-3 py-2 border-none outline-none rounded-lg"
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !browserUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ga</span>
          </button>
        </form>

        {/* AI Command Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Geef een AI commando... (bijv. 'zoek naar katten', 'klik op de eerste link', 'scroll omlaag')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !command.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Uitvoeren</span>
          </button>
        </form>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {isProcessing && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI commando wordt uitgevoerd...</span>
            </div>
          )}
          
          {/* Simulated Browser Window */}
          <div className="w-full h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center">
            <Globe className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Browser Interface</h3>
            <p className="text-gray-500 mb-4">
              De AI controleert een echte browser in de achtergrond.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md w-full">
              <p className="text-sm text-gray-600 mb-2"><strong>Huidige URL:</strong></p>
              <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                {currentUrl || 'Geen actieve browser sessie'}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p><strong>Voorbeeldcommando's:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>"ga naar youtube.com"</li>
                <li>"zoek naar Nederlandse recepten"</li>
                <li>"klik op de eerste link"</li>
                <li>"scroll omlaag"</li>
                <li>"maak een screenshot"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}