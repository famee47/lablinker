import { fileUrl } from '../../services/config'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiX, FiUser, FiCalendar, FiDroplet, FiUpload, FiLock } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TABS = ['all','pending','confirmed','sample_collected','processing','completed','cancelled']

const STATUS_STYLE = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  sample_collected: 'bg-purple-100 text-purple-700',
  processing:       'bg-orange-100 text-orange-700',
  completed:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
}

const PAYMENT_LABELS = {
  cash: '💵 Cash', card: '💳 Card', easypaisa: '📱 EasyPaisa',
  jazzcash: '📲 JazzCash', bank_transfer: '🏦 Bank Transfer'
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [uploadModal, setUploadModal] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/bookings/lab'), api.get('/technicians/my')])
      .then(([b, t]) => {
        setBookings(b.data.bookings || [])
        setTechnicians(t.data.technicians || [])
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status, extra = {}) => {
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status, ...extra })
      setBookings(prev => prev.map(b => b._id === id ? { ...b, ...data.booking } : b))
      toast.success(`Status updated to: ${status.replace('_',' ')}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const confirmPayment = async (id) => {
    try {
      const { data } = await api.post(`/bookings/${id}/pay`, { method: 'cash' })
      setBookings(prev => prev.map(b => b._id === id ? { ...b, ...data.booking } : b))
      toast.success('Payment confirmed!')
    } catch { toast.error('Failed') }
  }

  const assignTech = async (bookingId, technicianId) => {
    if (!technicianId) return
    try {
      const { data } = await api.put(`/bookings/${bookingId}/assign`, { technicianId })
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, ...data.booking } : b))
      toast.success('Technician assigned — patient notified!')
    } catch { toast.error('Assignment failed') }
  }

  const uploadReport = async () => {
    if (!file || !uploadModal) return
    setUploading(true)
    const fd = new FormData()
    fd.append('report', file)
    try {
      const { data } = await api.post(`/bookings/${uploadModal._id}/report`, fd)
      setBookings(prev => prev.map(b => b._id === uploadModal._id ? { ...b, ...data.booking } : b))
      toast.success('Report uploaded — patient notified!')
      setUploadModal(null)
      setFile(null)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const canUpload = (status) => ['sample_collected', 'processing', 'completed'].includes(status)
  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Booking Management</h1>
        <p className="text-gray-500 mt-1">Review, accept, assign and manage all bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
        {TABS.map(t => {
          const count = t === 'all' ? bookings.length : bookings.filter(b => b.status === t).length
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all
                ${tab===t ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
              {t.replace('_',' ')} <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No bookings in this category</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <motion.div key={b._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-bold text-gray-900 dark:text-white">{b.testId?.testName}</p>
                    <span className={`badge text-xs capitalize ${STATUS_STYLE[b.status]}`}>{b.status.replace('_',' ')}</span>
                    {b.homeCollection && <span className="badge bg-teal-100 text-teal-700 text-xs">🏠 Home</span>}
                    <span className={`badge text-xs ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />{b.patientId?.name}</span>
                    <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{new Date(b.bookingDate).toLocaleDateString()} {b.timeSlot}</span>
                    <span className="flex items-center gap-1"><FiDroplet className="w-3 h-3" />Rs. {b.amount?.toLocaleString()}</span>
                    {b.patientId?.phone && <span>📞 {b.patientId.phone}</span>}
                    {b.homeCollection && b.address && <span className="col-span-2">📍 {b.address}</span>}
                    <span>{PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod}</span>
                    {b.testId?.reportTime && <span>⏱ Report in: {b.testId.reportTime}</span>}
                  </div>

                  {/* Technician */}
                  {b.technicianId && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-xs font-medium">
                      👨‍⚕️ {b.technicianId?.name} {b.technicianId?.phone && `— ${b.technicianId.phone}`}
                    </div>
                  )}

                  {b.rejectionReason && <p className="text-xs text-red-500 mt-2">Rejection reason: {b.rejectionReason}</p>}
                  {b.cancellationReason && <p className="text-xs text-orange-500 mt-2">Cancelled by patient: {b.cancellationReason}</p>}
                </div>

                {/* Actions column */}
                <div className="flex flex-col gap-2 items-end min-w-fit">

                  {/* Accept / Reject */}
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(b._id, 'confirmed')}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">
                        <FiCheck className="w-3 h-3" /> Accept
                      </button>
                      <button onClick={() => setRejectModal(b)}
                        className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">
                        <FiX className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}

                  {/* Assign technician */}
                  {b.homeCollection && ['confirmed','sample_collected','processing'].includes(b.status) && (
                    <select defaultValue={b.technicianId?._id || b.technicianId || ''}
                      onChange={e => assignTech(b._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:border-gray-600">
                      <option value="">Assign Technician</option>
                      {technicians.map(t => <option key={t._id} value={t._id}>{t.name} — {t.phone}</option>)}
                    </select>
                  )}

                  {/* Mark sample collected */}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b._id, 'sample_collected')}
                      className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200">
                      Mark Sample Collected
                    </button>
                  )}

                  {/* Mark processing */}
                  {b.status === 'sample_collected' && (
                    <button onClick={() => updateStatus(b._id, 'processing')}
                      className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-200">
                      Mark Processing
                    </button>
                  )}

                  {/* Confirm cash payment */}
                  {b.paymentStatus !== 'paid' && ['confirmed','sample_collected','processing','completed'].includes(b.status) && (
                    <button onClick={() => confirmPayment(b._id)}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200">
                      💵 Confirm Payment Received
                    </button>
                  )}

                  {/* Upload report — always visible, disabled until sample collected */}
                  {!b.reportUrl && b.status !== 'cancelled' && (
                    canUpload(b.status) ? (
                      <button onClick={() => setUploadModal(b)}
                        className="flex items-center gap-1 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-700">
                        <FiUpload className="w-3 h-3" /> Upload Report
                      </button>
                    ) : (
                      <button disabled title="Sample must be collected first"
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed">
                        <FiLock className="w-3 h-3" /> Upload Report
                      </button>
                    )
                  )}

                  {/* View report */}
                  {b.reportUrl && (
                    <a href={fileUrl(b.reportUrl)} target="_blank" rel="noreferrer"
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700">
                      📄 View Report
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Reject Booking</h3>
            <p className="text-sm text-gray-500 mb-4">
              Patient: <strong>{rejectModal.patientId?.name}</strong><br/>
              Test: <strong>{rejectModal.testId?.testName}</strong>
            </p>
            <label className="label">Reason <span className="text-red-500">*</span></label>
            <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="input w-full mb-4">
              <option value="">Select a reason</option>
              <option>Test not available on selected date</option>
              <option>Lab closed on selected date</option>
              <option>Home collection not available in this area</option>
              <option>Equipment under maintenance</option>
              <option>Staff unavailable</option>
              <option>Other</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="flex-1 btn-outline">Cancel</button>
              <button onClick={() => {
                updateStatus(rejectModal._id, 'cancelled', { rejectionReason: rejectReason })
                setRejectModal(null); setRejectReason('')
              }} disabled={!rejectReason}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-bold hover:bg-red-700 disabled:opacity-50">
                Reject Booking
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Upload Report</h3>
            <p className="text-sm text-gray-500 mb-4">
              Patient: <strong>{uploadModal.patientId?.name}</strong><br/>
              Test: <strong>{uploadModal.testId?.testName}</strong>
            </p>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors
              ${file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary-400'}`}>
              <input type="file" accept=".pdf" id="report-upload" className="hidden"
                onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="report-upload" className="cursor-pointer">
                <FiUpload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                {file
                  ? <p className="text-green-700 font-semibold">{file.name}</p>
                  : <><p className="font-semibold text-gray-700">Click to select PDF report</p>
                     <p className="text-sm text-gray-400 mt-1">Max 10MB</p></>}
              </label>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-700">✅ Patient will be automatically notified by email when you upload.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setUploadModal(null); setFile(null) }} className="flex-1 btn-outline">Cancel</button>
              <button onClick={uploadReport} disabled={!file || uploading}
                className="flex-1 btn-primary disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
