const express = require('express')
const router = express.Router()

// In-memory task storage (in productie zou dit een database zijn)
let tasks = []
let taskIdCounter = 1

// Haal alle taken op
router.get('/', (req, res) => {
  res.json(tasks)
})

// Haal specifieke taak op
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id))
  if (!task) {
    return res.status(404).json({ error: 'Taak niet gevonden' })
  }
  res.json(task)
})

// Maak nieuwe taak aan
router.post('/', (req, res) => {
  const { instructions, priority = 'medium' } = req.body
  
  const newTask = {
    id: taskIdCounter++,
    instructions,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [],
    logs: []
  }
  
  tasks.push(newTask)
  
  // Emit to connected clients
  req.io.emit('task:created', newTask)
  
  res.status(201).json(newTask)
})

// Update taak status
router.patch('/:id', (req, res) => {
  const taskId = parseInt(req.params.id)
  const task = tasks.find(t => t.id === taskId)
  
  if (!task) {
    return res.status(404).json({ error: 'Taak niet gevonden' })
  }
  
  const { status, currentStep, logs } = req.body
  
  if (status) task.status = status
  if (currentStep) task.currentStep = currentStep
  if (logs) task.logs = [...task.logs, ...logs]
  
  task.updatedAt = new Date().toISOString()
  
  // Emit to connected clients
  req.io.emit('task:updated', task)
  
  res.json(task)
})

// Verwijder taak
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id)
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Taak niet gevonden' })
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0]
  
  // Emit to connected clients
  req.io.emit('task:deleted', { id: taskId })
  
  res.json(deletedTask)
})

// Wis alle voltooide taken
router.delete('/completed/all', (req, res) => {
  const completedTasks = tasks.filter(t => t.status === 'completed')
  tasks = tasks.filter(t => t.status !== 'completed')
  
  req.io.emit('tasks:cleared', { count: completedTasks.length })
  
  res.json({ deleted: completedTasks.length, remaining: tasks.length })
})

module.exports = router