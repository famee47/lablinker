const router = require('express').Router()
const { auth, requireRole } = require('../middleware/auth')
const Lab = require('../models/Lab')
const multer = require('multer')
const { uploadCertification } = require('../utils/cloudinary')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.get('/', async (req, res) => {
  try {
    const labs = await Lab.find({ approved: true })
    res.json({ labs })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
    if (!lab) return res.status(404).json({ message: 'Not found' })
    res.json({ lab })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

router.get('/my/info', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    if (!lab) return res.status(404).json({ message: 'Lab not found' })
    res.json({ lab })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

router.put('/my/info', auth, requireRole('lab'), async (req, res) => {
  try {
    const { labName, location, phone, address, description, operatingHours, homeCollectionFee, servingAreas, licenseNumber } = req.body
    const lab = await Lab.findOneAndUpdate(
      { ownerId: req.user._id },
      { labName, location, phone, address, description, operatingHours, homeCollectionFee, servingAreas, licenseNumber },
      { new: true }
    )
    res.json({ lab })
  } catch (err) {
    res.status(500).json({ message: 'Update failed' })
  }
})

router.post('/my/certification', auth, requireRole('lab'), upload.single('certification'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const filename = `cert_${req.user._id}_${Date.now()}`
    const result = await uploadCertification(req.file.buffer, filename, req.file.mimetype)
    const lab = await Lab.findOneAndUpdate(
      { ownerId: req.user._id },
      { certificationUrl: result.secure_url, certificationName: req.body.certName || req.file.originalname, certificationVerified: false },
      { new: true }
    )
    res.json({ lab })
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

module.exports = router
