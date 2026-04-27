require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
app.use('/api', limiter)
app.use('/api/auth', authLimiter)

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/labs', require('./routes/labs'))
app.use('/api/tests', require('./routes/tests'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/technicians', require('./routes/technicians'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/payments', require('./routes/payments'))

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// DB + Server
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lablink')
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
