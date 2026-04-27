const router = require('express').Router()
const { auth } = require('../middleware/auth')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

// Get me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user })
})

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Update failed' })
  }
})

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields required' })
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const user = await User.findById(req.user._id)
    const valid = await user.comparePassword(currentPassword)
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' })

    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Password change failed' })
  }
})

module.exports = router
