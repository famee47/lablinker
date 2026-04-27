import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiCheckCircle, FiClock } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function TechnicianDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/bookings/technician').then(r => setBookings(r.data.bookings || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status })
    toast.success('Status updated')
    load()
  }

  const today = bookings.filter(b => {
    const d = new Date(b.bookingDate)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">My Assigned Visits</h1>
        <p className="text-gray-500 dark:text-gray-400">Home sample collection assignments</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{today.length}</p>
          <p className="text-sm text-gray-400">Today's Visits</p>
        </div>
        <div className="card">
          <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{bookings.filter(b => b.status === 'sample_collected').length}</p>
          <p className="text-sm text-gray-400">Completed</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <FiCheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No visits assigned yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{b.patientId?.name || 'Patient'}</h3>
                    <span className={`badge text-xs ${b.status === 'sample_collected' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'}`}>
                      {b.status === 'sample_collected' ? '✓ Collected' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{b.testId?.testName}</p>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><FiClock className="w-4 h-4" />{new Date(b.bookingDate).toLocaleDateString()} at {b.timeSlot}</p>
                    {b.address && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><FiMapPin className="w-4 h-4" />{b.address}</p>}
                    {b.patientId?.phone && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><FiPhone className="w-4 h-4" />{b.patientId.phone}</p>}
                  </div>
                </div>
                {b.status !== 'sample_collected' && b.status !== 'completed' && (
                  <button onClick={() => updateStatus(b._id, 'sample_collected')} className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
                    <FiCheckCircle className="w-4 h-4" /> Mark Collected
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
