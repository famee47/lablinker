const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['patient', 'lab', 'technician', 'admin'], default: 'patient' },
  address: { type: String },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' }, // for technicians
  emailVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.resetToken
  delete obj.resetTokenExpiry
  return obj
}

module.exports = mongoose.model('User', userSchema)
