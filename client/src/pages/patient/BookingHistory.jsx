import { fileUrl } from '../../services/config'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiDownload, FiSearch, FiDroplet, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'
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

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data.bookings || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

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
      toast.error(err.response?.data?.message || 'Cannot cancel at this stage')
    } finally { setCancelling(false) }
  }

  const canCancel = (status) => ['pending','confirmed'].includes(status)

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter
    const matchSearch = !search || b.testId?.testName?.toLowerCase().includes(search.toLowerCase()) || b.labId?.labName?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">My Bookings</h1>
        <p className="text-gray-500 mt-1">Track all your lab test bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all','pending','confirmed','sample_collected','processing','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${filter===f ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
            {f.replace('_',' ')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        <input className="input pl-10" placeholder="Search test or lab name..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => {
            const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
            const Icon = st.icon
            return (
              <motion.div key={b._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiDroplet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-gray-900 dark:text-white">{b.testId?.testName || 'Lab Test'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{b.labId?.labName}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                      <span>📅 {new Date(b.bookingDate).toLocaleDateString()}</span>
                      <span>🕐 {b.timeSlot}</span>
                      {b.testId?.reportTime && <span>⏱ Report in: {b.testId.reportTime}</span>}
                      {b.homeCollection && <span>🏠 Home Collection</span>}
                      <span>💳 {b.paymentMethod?.replace('_',' ')}</span>
                      <span className={b.paymentStatus === 'paid' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                        {b.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'} — Rs. {b.amount?.toLocaleString()}
                      </span>
                    </div>

                    {/* Technician */}
                    {b.technicianId && !['completed','cancelled'].includes(b.status) && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                        👨‍⚕️ Technician assigned: <strong>{b.technicianId?.name}</strong>
                        {b.technicianId?.phone && <span> — {b.technicianId.phone}</span>}
                      </div>
                    )}

                    {b.cancellationReason && (
                      <p className="text-xs text-red-400 mt-2">Reason: {b.cancellationReason}</p>
                    )}
                    {b.rejectionReason && (
                      <p className="text-xs text-orange-400 mt-2">Lab rejected: {b.rejectionReason}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={st.cls}><Icon className="w-3 h-3 mr-1 inline" />{st.label}</span>

                    {b.reportUrl && (
                      <a href={fileUrl(b.reportUrl)} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                        <FiDownload className="w-3.5 h-3.5" /> Download Report
                      </a>
                    )}

                    {canCancel(b.status) && (
                      <button onClick={() => setCancelModal(b)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-1">Test: <strong>{cancelModal.testId?.testName}</strong></p>
            <p className="text-sm text-gray-500 mb-4">Date: <strong>{new Date(cancelModal.bookingDate).toLocaleDateString()}</strong></p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700">⚠️ You can only cancel before sample collection begins.</p>
            </div>
            <label className="label">Reason</label>
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
