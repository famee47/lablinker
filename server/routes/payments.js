const router = require('express').Router()
const { auth, requireRole } = require('../middleware/auth')
const Booking = require('../models/Booking')

// Create Stripe payment intent (optional - requires Stripe keys)
router.post('/create-intent', auth, requireRole('patient'), async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ message: 'Stripe not configured. Use cash on collection.' })
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const { bookingId } = req.body
    const booking = await Booking.findById(bookingId).populate('testId')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const intent = await stripe.paymentIntents.create({
      amount: Math.round((booking.amount || booking.testId?.price || 0) * 100),
      currency: 'pkr',
      metadata: { bookingId: bookingId.toString() },
    })

    res.json({ clientSecret: intent.client_secret })
  } catch (err) {
    res.status(500).json({ message: 'Payment intent failed' })
  }
})

// Confirm payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      stripePaymentId: paymentIntentId,
    })
    res.json({ message: 'Payment confirmed' })
  } catch (err) {
    res.status(500).json({ message: 'Confirmation failed' })
  }
})

module.exports = router
