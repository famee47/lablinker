const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'cash', 'easypaisa', 'jazzcash', 'bank_transfer'], default: 'cash' },
  stripePaymentId: { type: String },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  homeCollection: { type: Boolean, default: false },
  homeCollectionFee: { type: Number, default: 0 },
  address: { type: String },
  reportUrl: { type: String },
  reportUploadedAt: { type: Date },
  amount: { type: Number },
  cancellationReason: { type: String },
  cancelledBy: { type: String, enum: ['patient', 'lab', 'admin'] },
  rejectionReason: { type: String },
  technicianAssignedAt: { type: Date },
  notes: { type: String },
  notifications: [{
    message: String,
    type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)
