const router = require('express').Router()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const Lab = require('../models/Lab')
const { sendEmail } = require('../utils/email')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'lablink_secret_2024', { expiresIn: '30d' })

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })
    if (!['patient', 'lab'].includes(role || 'patient')) return res.status(400).json({ message: 'Invalid role' })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(400).json({ message: 'Email already in use' })

    const user = await User.create({ name, email, phone, password, role: role || 'patient' })

    // If lab partner, create lab entry
    if (role === 'lab') {
      const lab = await Lab.create({
        labName: name + "'s Lab",
        ownerName: name,
        ownerId: user._id,
        email: email,
        approved: false,
      })
      user.labId = lab._id
      await user.save()
    }

    const token = signToken(user._id)
    await sendEmail(email, 'Welcome to LabLink!', `Hi ${name},\n\nYour account has been created successfully!\n\nBest,\nLabLink Team`)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ message: 'Login failed' })
  }
})

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email?.toLowerCase() })
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = Date.now() + 3600000 // 1 hour
    await user.save()

    const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    await sendEmail(email, 'LabLink Password Reset', `Click to reset your password:\n\n${link}\n\nThis link expires in 1 hour.`)

    res.json({ message: 'Reset link sent to your email.' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset email' })
  }
})

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } })
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' })

    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' })
  }
})

module.exports = router

// Temp fix route
router.post('/fix-demo-passwords', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const demoEmails = [
      'citylab@demo.com', 'medpoint@demo.com',
      'healthplus@demo.com', 'labone@demo.com', 'diagnofast@demo.com',
      'tech1@demo.com', 'tech2@demo.com', 'tech3@demo.com'
    ]
    const hashed = await bcrypt.hash('Demo1234', 12)
    const result = await User.updateMany(
      { email: { $in: demoEmails } },
      { $set: { password: hashed } }
    )
    res.json({ message: 'Done', modified: result.modifiedCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
