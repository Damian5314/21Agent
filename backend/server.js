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
    // Hier zou de agent gestart worden
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