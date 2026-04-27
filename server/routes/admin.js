const router = require('express').Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const Lab = require('../models/Lab')
const Booking = require('../models/Booking')
const { sendEmail } = require('../utils/email')

// Stats
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const [totalPatients, totalTechs, totalLabUsers, totalLabs, totalBookings, completedBookings, pendingBookings, pendingLabs, recentBookings] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'technician' }),
      User.countDocuments({ role: 'lab' }),
      Lab.countDocuments({ approved: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'pending' }),
      Lab.countDocuments({ approved: false }),
      Booking.find().populate('patientId', 'name').populate('testId', 'testName price').populate('labId', 'labName').sort('-createdAt').limit(10),
    ])

    // Revenue per lab
    const labs = await Lab.find({ approved: true })
    const revenueByLab = await Promise.all(labs.map(async (lab) => {
      const bookings = await Booking.find({ labId: lab._id, paymentStatus: 'paid' })
      const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
      return { labId: lab._id, labName: lab.labName, revenue, bookingCount: bookings.length }
    }))

    const totalRevenue = revenueByLab.reduce((sum, l) => sum + l.revenue, 0)

    const bookingsByStatus = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    const bookingsByStatusMap = {}
    bookingsByStatus.forEach(b => { bookingsByStatusMap[b._id] = b.count })

    res.json({
      totalPatients, totalTechs, totalLabUsers, totalLabs, totalBookings,
      completedBookings, pendingBookings, pendingLabs, totalRevenue,
      revenueByLab, recentBookings, bookingsByStatus: bookingsByStatusMap,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// All users
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt')
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Delete user
router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot delete yourself' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Promote user to admin
router.put('/users/:id/promote', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// All labs
router.get('/labs', auth, requireRole('admin'), async (req, res) => {
  try {
    const labs = await Lab.find().sort('-createdAt')
    res.json({ labs })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Approve lab
router.put('/labs/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, { approved: true, certificationVerified: true }, { new: true })
    const owner = await User.findById(lab.ownerId)
    if (owner?.email) {
      await sendEmail(owner.email, 'Lab Approved – LabLink',
        `Congratulations ${owner.name}!\n\nYour lab "${lab.labName}" has been approved. You can now add tests and accept bookings.\n\nLabLink Team`)
    }
    res.json({ lab })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Reject lab — keep record so owner sees rejection reason in dashboard
router.put('/labs/:id/reject', auth, requireRole('admin'), async (req, res) => {
  try {
    const reason = req.body.reason || 'Please contact support for details'
    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      { approved: false, rejectionReason: reason },
      { new: true }
    )
    const owner = await User.findById(lab?.ownerId)
    if (owner?.email) {
      await sendEmail(owner.email, 'Lab Application Update - LabLink',
        `Hi ${owner.name},\n\nYour lab "${lab.labName}" was not approved.\nReason: ${reason}\n\nLog in to your dashboard to see details.\n\nLabLink Team`)
    }
    res.json({ message: 'Rejected', lab })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

module.exports = router
