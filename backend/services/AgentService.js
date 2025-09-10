const { chromium } = require('playwright')
const { GoogleGenerativeAI } = require('@google/generative-ai')

class AgentService {
  constructor(io) {
    this.io = io
    this.browser = null
    this.page = null
    this.genAI = null
    this.model = null
    this.status = 'idle'
    this.currentTask = null
    this.currentTaskId = null
    this.isPaused = false
    this.logs = []
  }

  async initialize() {
    try {
      // Initialiseer Google AI
      if (process.env.GOOGLE_AI_API_KEY) {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      }

      // Initialiseer browser
      this.browser = await chromium.launch({ 
        headless: false, // Voor demo doeleinden
        slowMo: 1000 // Langzamer voor zichtbaarheid
      })

      this.log('info', 'Agent service geïnitialiseerd', 'Browser en AI model geladen')
    } catch (error) {
      this.log('error', 'Initialisatie gefaald', error.message)
      throw error
    }
  }

  async startTask(instructions) {
    if (this.status === 'running') {
      throw new Error('Agent is al actief')
    }

    this.currentTask = instructions
    this.currentTaskId = Date.now().toString()
    this.status = 'running'
    this.isPaused = false

    this.log('info', 'Taak gestart', instructions)
    this.emitStatus()

    // Start de taak uitvoering in de achtergrond
    this.executeTask().catch(error => {
      this.log('error', 'Taak uitvoering gefaald', error.message)
      this.status = 'idle'
      this.emitStatus()
    })

    return this.currentTaskId
  }

  async executeTask() {
    try {
      // Stap 1: Nieuwe browser pagina openen
      await this.step('Nieuwe browser sessie starten')
      this.page = await this.browser.newPage()
      
      // Stap 2: Navigeer naar 21QUBZ (demo URL)
      await this.step('Navigeren naar 21QUBZ testomgeving')
      await this.page.goto(process.env.QUBZ_TEST_URL || 'https://example.com', { 
        waitUntil: 'domcontentloaded' 
      })

      // Stap 3: Simuleer inloggen (demo)
      await this.step('Inloggen in het systeem')
      await this.simulateDelay(2000)
      
      // Stap 4: Analyseer instructies met AI
      await this.step('Instructies analyseren met AI')
      const analysisResult = await this.analyzeInstructions(this.currentTask)
      this.log('info', 'AI Analyse voltooid', JSON.stringify(analysisResult, null, 2))

      // Stap 5: Voer geplande acties uit
      await this.step('Geplande acties uitvoeren')
      await this.executeActions(analysisResult.actions || [])

      // Taak voltooid
      this.status = 'idle'
      this.currentTask = null
      this.log('success', 'Taak succesvol voltooid', 'Alle stappen uitgevoerd')
      this.emitStatus()

    } catch (error) {
      this.log('error', 'Fout tijdens taak uitvoering', error.message)
      this.status = 'idle'
      this.currentTask = null
      this.emitStatus()
    } finally {
      if (this.page) {
        await this.page.close()
        this.page = null
      }
    }
  }

  async step(description) {
    this.log('info', `Stap: ${description}`)
    this.io.emit('agent:step', { step: description, timestamp: new Date() })
    
    // Wacht als gepauzeerd
    while (this.isPaused && this.status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Check of gestopt
    if (this.status !== 'running') {
      throw new Error('Taak gestopt door gebruiker')
    }
  }

  async analyzeInstructions(instructions) {
    if (!this.model) {
      return {
        summary: 'AI analyse niet beschikbaar',
        actions: [
          { type: 'navigate', target: 'dashboard' },
          { type: 'search', query: 'verlopen contracten' },
          { type: 'cleanup', target: 'ledigingen' }
        ]
      }
    }

    try {
      const prompt = `
Analyseer de volgende instructies voor een 21QUBZ platform agent:

Instructies: "${instructions}"

Geef een gestructureerd plan terug met:
1. Een korte samenvatting van wat er moet gebeuren
2. Een lijst met concrete acties die uitgevoerd moeten worden
3. Mogelijke risico's of aandachtspunten

Antwoord in JSON formaat.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch {
        return {
          summary: text,
          actions: [{ type: 'manual', description: text }]
        }
      }
    } catch (error) {
      this.log('warning', 'AI analyse gefaald', error.message)
      return {
        summary: 'Fallback analyse',
        actions: [{ type: 'manual', description: instructions }]
      }
    }
  }

  async executeActions(actions) {
    for (const action of actions) {
      await this.step(`Uitvoeren: ${action.type} - ${action.description || action.target || action.query || ''}`)
      
      // Simuleer actie uitvoering
      await this.simulateDelay(1000 + Math.random() * 2000)
      
      switch (action.type) {
        case 'navigate':
          this.log('info', `Navigatie naar: ${action.target}`)
          break
        case 'search':
          this.log('info', `Zoeken naar: ${action.query}`)
          break
        case 'cleanup':
          this.log('info', `Opschonen: ${action.target}`)
          break
        default:
          this.log('info', `Actie uitgevoerd: ${action.type}`)
      }
    }
  }

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async stopTask() {
    if (this.status === 'running') {
      this.status = 'idle'
      this.currentTask = null
      this.currentTaskId = null
      this.isPaused = false
      
      if (this.page) {
        await this.page.close()
        this.page = null
      }
      
      this.log('info', 'Taak gestopt door gebruiker')
      this.emitStatus()
    }
  }

  async togglePause() {
    if (this.status === 'running') {
      this.isPaused = !this.isPaused
      const newStatus = this.isPaused ? 'paused' : 'running'
      this.log('info', `Agent ${this.isPaused ? 'gepauzeerd' : 'hervat'}`)
      this.emitStatus()
      return newStatus
    }
    return this.status
  }

  getStatus() {
    return {
      status: this.isPaused ? 'paused' : this.status,
      currentTask: this.currentTask,
      taskId: this.currentTaskId
    }
  }

  getLogs() {
    return this.logs
  }

  log(level, message, details = null) {
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      details
    }
    
    this.logs.push(logEntry)
    
    // Houd alleen laatste 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
    
    // Emit naar clients
    this.io.emit('agent:log', logEntry)
    
    // Console log
    console.log(`[${level.toUpperCase()}] ${message}${details ? ` - ${details}` : ''}`)
  }

  emitStatus() {
    this.io.emit('agent:status', this.getStatus())
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

module.exports = AgentService