const express = require('express')
const router = express.Router()
const AgentService = require('../services/AgentService')

let agentService = null

// Initialiseer agent
router.post('/initialize', async (req, res) => {
  try {
    agentService = new AgentService(req.io)
    await agentService.initialize()
    res.json({ success: true, message: 'Agent geïnitialiseerd' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Start agent met taak
router.post('/start', async (req, res) => {
  try {
    const { instructions } = req.body
    
    if (!instructions) {
      return res.status(400).json({ success: false, error: 'Instructies zijn vereist' })
    }
    
    if (!agentService) {
      agentService = new AgentService(req.io)
      await agentService.initialize()
    }
    
    const taskId = await agentService.startTask(instructions)
    res.json({ success: true, taskId, message: 'Agent gestart' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Stop agent
router.post('/stop', async (req, res) => {
  try {
    if (agentService) {
      await agentService.stopTask()
    }
    res.json({ success: true, message: 'Agent gestopt' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Pauzeer/hervat agent
router.post('/pause', async (req, res) => {
  try {
    if (agentService) {
      const status = await agentService.togglePause()
      res.json({ success: true, status, message: `Agent ${status}` })
    } else {
      res.status(400).json({ success: false, error: 'Geen actieve agent' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Agent status
router.get('/status', (req, res) => {
  const status = agentService ? agentService.getStatus() : { status: 'idle', currentTask: null }
  res.json(status)
})

// Agent logs
router.get('/logs', (req, res) => {
  const logs = agentService ? agentService.getLogs() : []
  res.json(logs)
})

// Directe commando uitvoering
router.post('/command', async (req, res) => {
  try {
    const { command } = req.body
    
    if (!command) {
      return res.status(400).json({ success: false, error: 'Commando is vereist' })
    }
    
    if (!agentService) {
      agentService = new AgentService(req.io)
      await agentService.initialize()
    }
    
    const result = await agentService.executeCommand(command)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Browser status
router.get('/browser/status', (req, res) => {
  const status = agentService ? agentService.getBrowserStatus() : { isRunning: false }
  res.json(status)
})

// Start browser
router.post('/browser/start', async (req, res) => {
  try {
    if (!agentService) {
      agentService = new AgentService(req.io)
    }
    await agentService.initialize()
    res.json({ success: true, message: 'Browser gestart' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Stop browser
router.post('/browser/stop', async (req, res) => {
  try {
    if (agentService) {
      await agentService.closeBrowser()
    }
    res.json({ success: true, message: 'Browser gesloten' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router