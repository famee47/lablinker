const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  testName: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  homeCollectionAvailable: { type: Boolean, default: false },
  sampleType: { type: String, default: 'Blood' },
  reportTime: { type: String, default: '24 hours' },
  reportTimeHours: { type: Number, default: 24 },
  category: { type: String, default: 'General' },
  active: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Test', testSchema)
