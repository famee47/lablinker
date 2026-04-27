const router = require('express').Router()
const { auth, requireRole } = require('../middleware/auth')
const Test = require('../models/Test')
const Lab = require('../models/Lab')

// Get all tests (public)
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find({ active: true }).populate('labId', 'labName location approved').sort('-createdAt')
    const visible = tests.filter(t => t.labId?.approved)
    res.json({ tests: visible })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tests' })
  }
})

// Get my lab's tests (lab owner)
router.get('/my', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    if (!lab) return res.json({ tests: [] })
    const tests = await Test.find({ labId: lab._id }).sort('-createdAt')
    res.json({ tests })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tests' })
  }
})

// Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('labId', 'labName location phone email')
    if (!test) return res.status(404).json({ message: 'Test not found' })
    res.json({ test })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test' })
  }
})

// Add test (lab)
router.post('/', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    if (!lab) return res.status(404).json({ message: 'Lab not found' })
    if (!lab.approved) return res.status(403).json({ message: 'Lab must be approved before adding tests' })

    const { testName, description, price, homeCollectionAvailable, sampleType, reportTime, category } = req.body
    const test = await Test.create({ labId: lab._id, testName, description, price: Number(price), homeCollectionAvailable, sampleType, reportTime, category })
    res.status(201).json({ test })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create test' })
  }
})

// Update test
router.put('/:id', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    const test = await Test.findOne({ _id: req.params.id, labId: lab?._id })
    if (!test) return res.status(404).json({ message: 'Test not found' })

    Object.assign(test, req.body)
    if (req.body.price) test.price = Number(req.body.price)
    await test.save()
    res.json({ test })
  } catch (err) {
    res.status(500).json({ message: 'Update failed' })
  }
})

// Delete test
router.delete('/:id', auth, requireRole('lab'), async (req, res) => {
  try {
    const lab = await Lab.findOne({ ownerId: req.user._id })
    await Test.findOneAndDelete({ _id: req.params.id, labId: lab?._id })
    res.json({ message: 'Test deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

module.exports = router
