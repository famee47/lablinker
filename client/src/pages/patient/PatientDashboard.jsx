import { fileUrl } from '../../services/config'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCalendar, FiDroplet, FiFileText, FiArrowRight,
  FiCheckCircle, FiClock, FiXCircle, FiAlertCircle, FiChevronRight, FiHeart
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  pending:          { cls: 'badge bg-yellow-100 text-yellow-700',  icon: FiClock,        label: 'Pending' },
  confirmed:        { cls: 'badge bg-blue-100 text-blue-700',      icon: FiCheckCircle,  label: 'Confirmed' },
  sample_collected: { cls: 'badge bg-purple-100 text-purple-700',  icon: FiDroplet,      label: 'Sample Collected' },
  processing:       { cls: 'badge bg-orange-100 text-orange-700',  icon: FiAlertCircle,  label: 'Processing' },
  completed:        { cls: 'badge bg-green-100 text-green-700',    icon: FiCheckCircle,  label: 'Completed' },
  cancelled:        { cls: 'badge bg-red-100 text-red-700',        icon: FiXCircle,      label: 'Cancelled' },
}

const TIMELINE_STEPS = [
  { key: 'pending',          label: 'Placed',          icon: FiCalendar },
  { key: 'confirmed',        label: 'Confirmed',       icon: FiCheckCircle },
  { key: 'sample_collected', label: 'Sample Taken',    icon: FiDroplet },
  { key: 'processing',       label: 'Processing',      icon: FiAlertCircle },
  { key: 'completed',        label: 'Report Ready',    icon: FiFileText },
]
const STATUS_ORDER = ['pending','confirmed','sample_collected','processing','completed']

function BookingTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status)
  if (status === 'cancelled') return (
    <div className="flex items-center gap-2 text-red-500 text-xs font-medium mt-2">
      <FiXCircle className="w-3.5 h-3.5" /> Booking Cancelled
    </div>
  )
  return (
    <div className="flex items-center gap-0.5 mt-2 flex-wrap">
      {TIMELINE_STEPS.map((step, i) => {
        const Icon = step.icon
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all
              ${active ? 'bg-primary-600 text-white' : done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`w-3 h-0.5 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data.bookings || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Bookings', value: bookings.length,                                      icon: FiCalendar,    color: 'text-primary-600 bg-primary-50', link: '/dashboard/history' },
    { label: 'Pending',        value: bookings.filter(b => b.status==='pending').length,     icon: FiClock,       color: 'text-yellow-600 bg-yellow-50',   link: '/dashboard/history' },
    { label: 'Completed',      value: bookings.filter(b => b.status==='completed').length,   icon: FiCheckCircle, color: 'text-green-600 bg-green-50',     link: '/dashboard/history' },
    { label: 'Reports Ready',  value: bookings.filter(b => b.reportUrl).length,              icon: FiFileText,    color: 'text-purple-600 bg-purple-50',   link: '/dashboard/records' },
  ]

  const handleCancel = async () => {
    if (!cancelModal) return
    setCancelling(true)
    try {
      await api.put(`/bookings/${cancelModal._id}/cancel`, { reason: cancelReason })
      setBookings(prev => prev.map(b => b._id === cancelModal._id ? { ...b, status: 'cancelled' } : b))
      toast.success('Booking cancelled')
      setCancelModal(null)
      setCancelReason('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    } finally { setCancelling(false) }
  }

  const canCancel = (status) => ['pending','confirmed'].includes(status)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your health dashboard</p>
      </div>

      {/* Clickable Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}>
              <Link to={s.link} className="card block hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xs text-primary-500 mt-1 flex items-center gap-1">View <FiChevronRight className="w-3 h-3" /></p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/dashboard/tests" className="card hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <FiDroplet className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white">Book a Test</p>
            <p className="text-sm text-gray-500">Browse lab tests</p>
          </div>
          <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </Link>
        <Link to="/dashboard/history" className="card hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <FiCalendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white">My Bookings</p>
            <p className="text-sm text-gray-500">Track & manage</p>
          </div>
          <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>
        <Link to="/dashboard/records" className="card hover:shadow-lg transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <FiHeart className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white">Health Records</p>
            <p className="text-sm text-gray-500">All reports & history</p>
          </div>
          <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Recent Bookings</h2>
          <Link to="/dashboard/history" className="text-sm text-primary-600 hover:underline font-medium">View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No bookings yet</p>
            <Link to="/dashboard/tests" className="btn-primary text-sm py-2 px-4 mt-4 inline-flex">Book Your First Test</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 5).map(b => {
              const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
              const Icon = st.icon
              return (
                <div key={b._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiDroplet className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{b.testId?.testName || 'Lab Test'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {b.labId?.labName} • {new Date(b.bookingDate).toLocaleDateString()} • {b.timeSlot}
                        {b.testId?.reportTime && <span className="ml-1">• ⏱ {b.testId.reportTime}</span>}
                      </p>
                      <BookingTimeline status={b.status} />

                      {/* Technician assigned */}
                      {b.technicianId && !['completed','cancelled'].includes(b.status) && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                          👨‍⚕️ Technician: <strong>{b.technicianId?.name}</strong>
                          {b.technicianId?.phone && <span> — {b.technicianId.phone}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-2">
                      <span className={st.cls}><Icon className="w-3 h-3 mr-1 inline" />{st.label}</span>

                      {b.reportUrl && (
                        <a href={fileUrl(b.reportUrl)} target="_blank" rel="noreferrer"
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 font-semibold whitespace-nowrap">
                          📄 Download Report
                        </a>
                      )}

                      {canCancel(b.status) && (
                        <button onClick={() => setCancelModal(b)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline whitespace-nowrap">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-1">Test: <strong>{cancelModal.testId?.testName}</strong></p>
            <p className="text-sm text-gray-500 mb-4">Date: <strong>{new Date(cancelModal.bookingDate).toLocaleDateString()}</strong></p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700 font-medium">⚠️ You can only cancel before sample collection begins.</p>
            </div>
            <label className="label">Reason for cancellation</label>
            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="input w-full mb-4">
              <option value="">Select a reason</option>
              <option>Changed my mind</option>
              <option>Found a better option</option>
              <option>Schedule conflict</option>
              <option>Doctor advised otherwise</option>
              <option>Financial reasons</option>
              <option>Other</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setCancelModal(null); setCancelReason('') }} className="flex-1 btn-outline">Keep Booking</button>
              <button onClick={handleCancel} disabled={!cancelReason || cancelling}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-bold hover:bg-red-700 disabled:opacity-50">
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
