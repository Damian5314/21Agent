const BrowserService = require('./BrowserService')
const CommandInterpreter = require('./CommandInterpreter')

class AgentService {
  constructor(io) {
    this.io = io
    this.browserService = new BrowserService()
    this.commandInterpreter = new CommandInterpreter()
    this.status = 'idle'
    this.currentTask = null
    this.currentTaskId = null
    this.isPaused = false
    this.logs = []
  }

  async initialize() {
    try {
      // Initialiseer browser service
      await this.browserService.initialize()
      this.log('info', 'Agent service geïnitialiseerd', 'Browser en AI command interpreter geladen')
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
      await this.step('Browser sessie controleren')
      
      if (!this.browserService.isRunning) {
        await this.browserService.initialize()
      }

      await this.step('AI commando interpreteren')
      const commandResult = await this.commandInterpreter.interpretCommand(
        this.currentTask, 
        this.browserService.getStatus()
      )

      this.log('info', 'AI Commando geïnterpreteerd', commandResult.explanation)

      await this.step('Browser acties uitvoeren')
      await this.executeBrowserActions(commandResult.actions || [])

      // Taak voltooid
      this.status = 'idle'
      this.currentTask = null
      this.log('success', 'Taak succesvol voltooid', commandResult.explanation)
      this.emitStatus()

    } catch (error) {
      this.log('error', 'Fout tijdens taak uitvoering', error.message)
      this.status = 'idle'
      this.currentTask = null
      this.emitStatus()
    }
  }

  async executeBrowserActions(actions) {
    for (const action of actions) {
      // Skip step() call for direct commands to avoid status issues
      this.log('info', `Uitvoeren: ${action.description}`)
      
      try {
        let result = null
        
        switch (action.type) {
          case 'navigate':
            result = await this.browserService.navigateTo(action.parameters.url)
            this.log('info', `Genavigeerd naar: ${action.parameters.url}`)
            break
            
          case 'search':
            result = await this.browserService.search(action.parameters.query)
            this.log('info', `Gezocht naar: ${action.parameters.query}`)
            break
            
          case 'click':
            result = await this.browserService.clickElement(action.parameters.selector)
            this.log('info', `Geklikt op: ${action.parameters.selector}`)
            break
            
          case 'type':
            result = await this.browserService.typeText(action.parameters.selector, action.parameters.text)
            this.log('info', `Getypt in ${action.parameters.selector}: "${action.parameters.text}"`)
            break
            
          case 'scroll':
            result = await this.browserService.scrollPage(action.parameters.direction, action.parameters.amount)
            this.log('info', `Gescrolld ${action.parameters.direction}`)
            break
            
          case 'wait':
            result = await this.browserService.waitForElement(action.parameters.selector)
            this.log('info', `Gewacht op element: ${action.parameters.selector}`)
            break
            
          case 'screenshot':
            result = await this.browserService.takeScreenshot()
            this.log('info', 'Screenshot gemaakt')
            break
            
          case 'getTitle':
            result = await this.browserService.getPageTitle()
            this.log('info', `Pagina titel: ${result}`)
            break
            
          case 'getUrl':
            result = await this.browserService.getPageUrl()
            this.log('info', `Huidige URL: ${result}`)
            break
            
          default:
            this.log('warning', `Onbekende actie: ${action.type}`)
        }
        
        // Korte pauze tussen acties
        await this.simulateDelay(1000)
        
      } catch (error) {
        this.log('error', `Fout bij uitvoeren actie ${action.type}`, error.message)
        // Ga door naar volgende actie
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

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async stopTask() {
    if (this.status === 'running') {
      this.status = 'idle'
      this.currentTask = null
      this.currentTaskId = null
      this.isPaused = false
      
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

  // Nieuwe methode voor real-time commando's
  async executeCommand(command) {
    try {
      this.log('info', `Uitvoeren commando: "${command}"`)
      
      // Zorg dat browser draait
      if (!this.browserService.isRunning) {
        await this.browserService.initialize()
      }

      // Interpreteer commando
      const commandResult = await this.commandInterpreter.interpretCommand(
        command, 
        this.browserService.getStatus()
      )

      this.log('info', 'Commando geïnterpreteerd', commandResult.explanation)

      // Voer acties uit
      await this.executeBrowserActions(commandResult.actions || [])

      return {
        success: true,
        explanation: commandResult.explanation,
        actions: commandResult.actions
      }
      
    } catch (error) {
      this.log('error', 'Fout bij uitvoeren commando', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async closeBrowser() {
    try {
      await this.browserService.close()
      this.log('info', 'Browser gesloten')
    } catch (error) {
      this.log('error', 'Fout bij sluiten browser', error.message)
    }
  }

  getBrowserStatus() {
    return this.browserService.getStatus()
  }

  getStatus() {
    return {
      status: this.isPaused ? 'paused' : this.status,
      currentTask: this.currentTask,
      taskId: this.currentTaskId,
      browser: this.browserService.getStatus()
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
    await this.closeBrowser()
  }
}

module.exports = AgentService