const router = require('express').Router()
const { auth, requireRole } = require('../middleware/auth')
const Booking = require('../models/Booking')
const Test = require('../models/Test')
const Lab = require('../models/Lab')
const User = require('../models/User')
const { sendEmail } = require('../utils/email')
const { uploadPDF } = require('../utils/cloudinary')
const multer = require('multer')

// Use memory storage — files go to Cloudinary not disk
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only PDF, JPG, or PNG files allowed'))
  }
})

// Create booking
router.post('/', auth, requireRole('patient'), async (req, res) => {
  try {
    const { testId, labId, bookingDate, timeSlot, homeCollection, address, paymentMethod } = req.body
    const test = await Test.findById(testId)
    if (!test) return res.status(404).json({ message: 'Test not found' })
    const lab = await Lab.findById(labId)
    const homeCollectionFee = homeCollection && lab?.homeCollectionFee ? lab.homeCollectionFee : 0
    const totalAmount = test.price + homeCollectionFee

    const booking = await Booking.create({
      patientId: req.user._id,
      labId,
      testId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      homeCollection: !!homeCollection,
      homeCollectionFee,
      address: address || '',
      paymentMethod: paymentMethod || 'cash',
      amount: totalAmount,
      notifications: [{ message: 'Booking placed. Waiting for lab confirmation.', type: 'info' }]
    })
    await booking.populate(['patientId', 'testId', 'labId'])

    if (lab?.email) {
      await sendEmail(lab.email, 'New Booking – LabLinker',
        `New booking from ${req.user.name}\nTest: ${test.testName}\nDate: ${new Date(bookingDate).toDateString()}\nTime: ${timeSlot}`)
    }
    await sendEmail(req.user.email, 'Booking Placed – LabLinker',
      `Hi ${req.user.name},\n\nYour booking for "${test.testName}" has been placed.\nDate: ${new Date(bookingDate).toDateString()}\nTime: ${timeSlot}\nAmount: Rs. ${totalAmount}\n\nLabLinker Team`)

    res.status(201).json({ booking })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Booking failed' })
  }
})

// Patient bookings
router.get('/my', auth, requireRole('patient'), async (req, res) => {
  try {
    const bookings = await Booking.find({ patientId: req.user._id })
      .populate('testId', 'testName price reportTime reportTimeHours sampleType category')
      .populate('labId', 'labName location phone')
      .populate('technicianId', 'name phone')
      .sort('-createdAt')
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Lab bookings
router.get('/lab', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    if (!lab) return res.json({ bookings: [] })
    const bookings = await Booking.find({ labId: lab._id })
      .populate('patientId', 'name email phone')
      .populate('testId', 'testName price reportTime sampleType')
      .populate('technicianId', 'name phone')
      .sort('-createdAt')
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Technician bookings
router.get('/technician', auth, requireRole('technician'), async (req, res) => {
  try {
    const bookings = await Booking.find({ technicianId: req.user._id })
      .populate('patientId', 'name email phone')
      .populate('testId', 'testName')
      .populate('labId', 'labName')
      .sort('bookingDate')
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Patient cancel
router.put('/:id/cancel', auth, requireRole('patient'), async (req, res) => {
  try {
    const { reason } = req.body
    const booking = await Booking.findById(req.params.id).populate('patientId testId labId')
    if (!booking) return res.status(404).json({ message: 'Not found' })
    if (booking.patientId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' })
    if (['sample_collected','processing','completed','cancelled'].includes(booking.status))
      return res.status(400).json({ message: `Cannot cancel a booking that is ${booking.status}` })

    booking.status = 'cancelled'
    booking.cancellationReason = reason || 'Cancelled by patient'
    booking.cancelledBy = 'patient'
    booking.notifications.push({ message: `Booking cancelled. Reason: ${reason || 'Not specified'}`, type: 'warning' })
    await booking.save()

    if (booking.labId?.email) {
      await sendEmail(booking.labId.email, 'Booking Cancelled – LabLinker',
        `Booking for ${booking.testId?.testName} from ${booking.patientId?.name} was cancelled.\nReason: ${reason || 'Not specified'}`)
    }
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: 'Cancel failed' })
  }
})

// Update status — lab (own bookings only) or technician (assigned to them only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body
    const booking = await Booking.findById(req.params.id).populate('patientId testId')
    if (!booking) return res.status(404).json({ message: 'Not found' })

    // Lab: verify they own this booking's lab
    if (req.user.role === 'lab') {
      const lab = await require('../models/Lab').findOne({ ownerId: req.user._id })
      if (!lab || lab._id.toString() !== booking.labId.toString()) {
        return res.status(403).json({ message: 'Not authorized' })
      }
    }
    // Technician: verify this booking is assigned to them
    else if (req.user.role === 'technician') {
      if (!booking.technicianId || booking.technicianId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' })
      }
    }
    // Admin can update any booking status
    else if (req.user.role === 'admin') {
      // allowed
    }
    // Patient and any other role cannot update status
    else {
      return res.status(403).json({ message: 'Not authorized' })
    }

    booking.status = status
    if (rejectionReason) booking.rejectionReason = rejectionReason

    const msgs = {
      confirmed: '✅ Your booking has been confirmed by the lab!',
      cancelled: `❌ Your booking was cancelled. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
      sample_collected: '🧪 Your sample has been collected. Processing begins shortly.',
      processing: '🔬 Your sample is being processed in the lab.',
      completed: '📋 Your test results are ready! Download your report from the dashboard.',
    }

    booking.notifications.push({
      message: msgs[status] || `Status updated to ${status}`,
      type: status === 'cancelled' ? 'warning' : status === 'completed' ? 'success' : 'info'
    })
    await booking.save()

    if (msgs[status] && booking.patientId?.email) {
      await sendEmail(booking.patientId.email, `Booking Update – LabLinker`, msgs[status])
    }
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: 'Status update failed' })
  }
})

// Assign technician
router.put('/:id/assign', auth, requireRole('lab'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('patientId testId')
    if (!booking) return res.status(404).json({ message: 'Not found' })
    const technician = await User.findById(req.body.technicianId)
    booking.technicianId = req.body.technicianId
    booking.technicianAssignedAt = new Date()
    booking.notifications.push({
      message: `👨‍⚕️ Technician ${technician?.name || ''} assigned for your home collection. They will contact you before arriving.`,
      type: 'info'
    })
    await booking.save()
    if (booking.patientId?.email && technician) {
      await sendEmail(booking.patientId.email, 'Technician Assigned – LabLinker',
        `Hi ${booking.patientId.name},\n\nTechnician ${technician.name} has been assigned.\nPhone: ${technician.phone || 'Will contact you'}\nTest: ${booking.testId?.testName}\nDate: ${new Date(booking.bookingDate).toDateString()}\n\nLabLinker Team`)
    }
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Confirm payment — only the lab that owns the booking OR the patient who made it
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Not found' })

    // Lab: must own the booking's lab
    if (req.user.role === 'lab') {
      const lab = await require('../models/Lab').findOne({ ownerId: req.user._id })
      if (!lab || lab._id.toString() !== booking.labId.toString()) {
        return res.status(403).json({ message: 'Not authorized' })
      }
    }
    // Patient: must be the one who made the booking
    else if (req.user.role === 'patient') {
      if (booking.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' })
      }
    }
    // Any other role is not allowed
    else {
      return res.status(403).json({ message: 'Not authorized' })
    }

    booking.paymentStatus = 'paid'
    booking.paymentMethod = req.body.method || booking.paymentMethod
    booking.notifications.push({ message: '✅ Payment confirmed.', type: 'success' })
    await booking.save()
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Upload report to Cloudinary
router.post('/:id/report', auth, requireRole('lab'), upload.single('report'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const filename = `report_${req.params.id}_${Date.now()}`
    const result = await uploadPDF(req.file.buffer, filename, req.file.mimetype)

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        reportUrl: result.secure_url,
        status: 'completed',
        reportUploadedAt: new Date(),
        $push: { notifications: { message: '📋 Your lab report is ready! Click Download Report to view it.', type: 'success' } }
      },
      { new: true }
    ).populate('patientId testId')

    if (booking?.patientId?.email) {
      await sendEmail(booking.patientId.email, 'Your Report is Ready – LabLinker',
        `Hi ${booking.patientId.name},\n\nYour report for ${booking.testId?.testName} is ready.\nLog in to download it.\n\nLabLinker Team`)
    }
    res.json({ booking })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Upload failed' })
  }
})

module.exports = router
