const router = require('express').Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const Lab = require('../models/Lab')

// Get technicians for my lab
router.get('/my', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    if (!lab) return res.json({ technicians: [] })
    const technicians = await User.find({ role: 'technician', labId: lab._id })
    res.json({ technicians })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch technicians' })
  }
})

// Add technician (lab creates account for technician)
router.post('/', auth, requireRole('lab'), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' })

    const lab = await Lab.findOne({ ownerId: req.user._id })
    if (!lab) return res.status(404).json({ message: 'Lab not found' })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(400).json({ message: 'Email already in use' })

    const technician = await User.create({
      name,
      email,
      phone,
      password,
      role: 'technician',
      labId: lab._id,
    })

    res.status(201).json({ technician })
  } catch (err) {
    res.status(500).json({ message: 'Failed to add technician' })
  }
})

// Remove technician
router.delete('/:id', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    await User.findOneAndDelete({ _id: req.params.id, labId: lab?._id, role: 'technician' })
    res.json({ message: 'Technician removed' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

module.exports = router
