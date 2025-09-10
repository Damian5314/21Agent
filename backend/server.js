const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const agentRoutes = require('./routes/agent')
const taskRoutes = require('./routes/tasks')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client verbonden:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('Client verbroken:', socket.id)
  })
  
  socket.on('agent:start', (data) => {
    console.log('Agent start request:', data)
    socket.emit('agent:status', { status: 'running' })
  })
  
  socket.on('agent:stop', () => {
    console.log('Agent stop request')
    socket.emit('agent:status', { status: 'idle' })
  })
  
  socket.on('agent:pause', () => {
    console.log('Agent pause request')
    socket.emit('agent:status', { status: 'paused' })
  })
  
  // Browser command handling via Socket.IO
  socket.on('browser:command', async (data) => {
    console.log('Browser commando ontvangen:', data)
    try {
      const AgentService = require('./services/AgentService')
      
      // Initialize if needed (dit zou eigenlijk beter via een singleton of global instance)
      if (!global.agentService) {
        global.agentService = new AgentService(io)
        await global.agentService.initialize()
      }
      
      const result = await global.agentService.executeCommand(data.command)
      socket.emit('browser:command:result', result)
    } catch (error) {
      console.error('Fout bij browser commando:', error)
      socket.emit('browser:command:error', { error: error.message })
    }
  })
  
  socket.on('browser:start', async () => {
    console.log('Browser start request')
    try {
      const AgentService = require('./services/AgentService')
      
      if (!global.agentService) {
        global.agentService = new AgentService(io)
      }
      await global.agentService.initialize()
      
      socket.emit('browser:status', global.agentService.getBrowserStatus())
    } catch (error) {
      console.error('Fout bij browser start:', error)
      socket.emit('browser:error', { error: error.message })
    }
  })
  
  socket.on('browser:stop', async () => {
    console.log('Browser stop request')
    try {
      if (global.agentService) {
        await global.agentService.closeBrowser()
        socket.emit('browser:status', global.agentService.getBrowserStatus())
      }
    } catch (error) {
      console.error('Fout bij browser stop:', error)
      socket.emit('browser:error', { error: error.message })
    }
  })
})

// Maak io beschikbaar voor routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Routes
app.use('/api/agent', agentRoutes)
app.use('/api/tasks', taskRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: '21Agent Backend'
  })
})

server.listen(PORT, () => {
  console.log(`🚀 21Agent Backend draait op poort ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})