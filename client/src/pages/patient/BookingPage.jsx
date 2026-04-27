import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiHome, FiMapPin, FiCreditCard, FiCheck, FiDroplet, FiInfo } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const TIME_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']

const PAYMENT_METHODS = [
  { key: 'cash',          label: 'Cash on Collection',  icon: '💵', desc: 'Pay when sample is collected' },
  { key: 'card',          label: 'Debit / Credit Card', icon: '💳', desc: 'Lab will confirm payment details' },
  { key: 'easypaisa',     label: 'EasyPaisa',           icon: '📱', desc: 'Lab will share account details' },
  { key: 'jazzcash',      label: 'JazzCash',            icon: '📲', desc: 'Lab will share account details' },
  { key: 'bank_transfer', label: 'Bank Transfer',       icon: '🏦', desc: 'Lab will share bank details' },
]

export default function BookingPage() {
  const { testId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [test, setTest] = useState(null)
  const [lab, setLab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)

  const [form, setForm] = useState({
    date: '', timeSlot: '', homeCollection: false,
    address: user?.address || '', paymentMethod: 'cash'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/tests/${testId}`).then(async r => {
      setTest(r.data.test)
      const labRes = await api.get(`/labs/${r.data.test.labId}`)
      setLab(labRes.data.lab)
    }).catch(() => toast.error('Test not found')).finally(() => setLoading(false))
  }, [testId])

  const homeCollectionFee = form.homeCollection ? (lab?.homeCollectionFee || 0) : 0
  const totalAmount = (test?.price || 0) + homeCollectionFee

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!form.date || !form.timeSlot) return toast.error('Please select date and time')
    if (form.homeCollection && !form.address) return toast.error('Please enter your address for home collection')
    setSubmitting(true)
    try {
      const { data } = await api.post('/bookings', {
        testId, labId: test.labId,
        bookingDate: form.date, timeSlot: form.timeSlot,
        homeCollection: form.homeCollection, address: form.address,
        paymentMethod: form.paymentMethod
      })
      setBooking(data.booking)
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!test) return <div className="text-center py-20 text-gray-400">Test not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Book Test</h1>
      <p className="text-gray-500 mb-6">{test.testName} — {lab?.labName}</p>

      {/* Step indicators */}
      {step < 3 && (
        <div className="flex items-center gap-2 mb-8">
          {[1,2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
              <span className={`text-sm font-medium ${step >= s ? 'text-primary-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Schedule' : 'Payment'}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 — Schedule */}
      {step === 1 && (
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
          {/* Test summary */}
          <div className="card bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FiDroplet className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white">{test.testName}</p>
                <p className="text-sm text-gray-500">{lab?.labName} • Sample: {test.sampleType}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">Rs. {test.price?.toLocaleString()}</p>
                <p className="text-xs text-gray-400">⏱ {test.reportTime}</p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="card">
            <label className="label flex items-center gap-2"><FiCalendar className="w-4 h-4" /> Select Date</label>
            <input type="date" className="input" min={minDateStr}
              value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>

          {/* Time Slots */}
          <div className="card">
            <label className="label flex items-center gap-2"><FiClock className="w-4 h-4" /> Select Time Slot</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {TIME_SLOTS.map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, timeSlot: t})}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all
                    ${form.timeSlot === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Home Collection */}
          {test.homeCollectionAvailable && (
            <div className="card">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.homeCollection}
                  onChange={e => setForm({...form, homeCollection: e.target.checked})}
                  className="w-5 h-5 accent-teal-500" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiHome className="w-4 h-4 text-teal-500" /> Home Sample Collection
                    {lab?.homeCollectionFee > 0
                      ? <span className="text-sm text-teal-600 font-bold">+Rs. {lab.homeCollectionFee}</span>
                      : <span className="text-sm text-green-600 font-bold">FREE</span>}
                  </p>
                  <p className="text-sm text-gray-400">Technician visits your home to collect sample</p>
                </div>
              </label>
              {form.homeCollection && (
                <div className="mt-3">
                  <label className="label flex items-center gap-2"><FiMapPin className="w-4 h-4" /> Your Address</label>
                  <textarea className="input" rows={2} value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="Enter your full home address..." />
                </div>
              )}
            </div>
          )}

          {/* Price breakdown */}
          <div className="card bg-gray-50 dark:bg-gray-800">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Test Price</span>
                <span className="font-semibold">Rs. {test.price?.toLocaleString()}</span>
              </div>
              {form.homeCollection && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Home Collection Fee</span>
                  <span className="font-semibold text-teal-600">
                    {lab?.homeCollectionFee > 0 ? `Rs. ${lab.homeCollectionFee}` : 'FREE'}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="font-bold text-primary-600 text-lg">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={() => {
            if (!form.date || !form.timeSlot) return toast.error('Please select date and time slot')
            if (form.homeCollection && !form.address) return toast.error('Please enter your address')
            setStep(2)
          }} className="btn-primary w-full">
            Continue to Payment →
          </button>
        </motion.div>
      )}

      {/* STEP 2 — Payment */}
      {step === 2 && (
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
          {/* Summary */}
          <div className="card bg-gray-50 dark:bg-gray-800">
            <p className="font-bold text-gray-900 dark:text-white mb-3">Booking Summary</p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>🧪 <strong>{test.testName}</strong></p>
              <p>🏥 {lab?.labName}</p>
              <p>📅 {new Date(form.date).toDateString()} at {form.timeSlot}</p>
              <p>⏱ Report ready in: <strong>{test.reportTime}</strong></p>
              {form.homeCollection && <p>🏠 Home collection at: {form.address}</p>}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <p className="font-bold text-gray-900 dark:text-white">Total: Rs. {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card">
            <label className="label flex items-center gap-2"><FiCreditCard className="w-4 h-4" /> Payment Method</label>
            <div className="space-y-2 mt-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${form.paymentMethod === m.key ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 hover:border-primary-200'}`}>
                  <input type="radio" name="payment" value={m.key} checked={form.paymentMethod === m.key}
                    onChange={() => setForm({...form, paymentMethod: m.key})} className="accent-primary-600" />
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  {form.paymentMethod === m.key && <FiCheck className="w-4 h-4 text-primary-600" />}
                </label>
              ))}
            </div>

            {form.paymentMethod !== 'cash' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                <FiInfo className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Your booking will be marked as <strong>payment pending</strong>. The lab will contact you with payment details after confirming your booking.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 btn-outline">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 btn-primary">
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3 — Confirmed */}
      {step === 3 && (
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center">
          <div className="card">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-6">Your booking has been placed. The lab will confirm it shortly.</p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
              <p>🧪 <strong>{test.testName}</strong></p>
              <p>🏥 {lab?.labName}</p>
              <p>📅 {new Date(form.date).toDateString()} at {form.timeSlot}</p>
              <p>⏱ Report ready in: <strong>{test.reportTime}</strong></p>
              <p>💳 Payment: <strong className="capitalize">{form.paymentMethod.replace('_',' ')}</strong>
                {form.paymentMethod !== 'cash' && <span className="text-yellow-600 ml-1">(Pending — lab will contact you)</span>}
              </p>
              <p className="font-bold text-primary-600">Total: Rs. {totalAmount.toLocaleString()}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard/history')} className="flex-1 btn-primary">
                View My Bookings
              </button>
              <button onClick={() => navigate('/dashboard/tests')} className="flex-1 btn-outline">
                Book Another Test
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
