const mongoose = require('mongoose')

const labSchema = new mongoose.Schema({
  labName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, trim: true },
  phone: { type: String },
  email: { type: String, lowercase: true },
  address: { type: String },
  approved: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  description: { type: String },
  operatingHours: { type: String, default: '8:00 AM - 8:00 PM' },
  homeCollectionFee: { type: Number, default: 0 },
  // Legal certification
  certificationUrl: { type: String },
  certificationName: { type: String },
  certificationVerified: { type: Boolean, default: false },
  licenseNumber: { type: String },
  servingAreas: [{ type: String }],
  rejectionReason: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Lab', labSchema)
