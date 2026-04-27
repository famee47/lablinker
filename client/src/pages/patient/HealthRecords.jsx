import { fileUrl } from '../../services/config'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiDownload, FiDroplet, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi'
import api from '../../services/api'

export default function HealthRecords() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings/my')
      .then(r => {
        const completed = (r.data.bookings || []).filter(b => b.status === 'completed')
        setBookings(completed)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Health Records</h1>
        <p className="text-gray-500 mt-1">Your complete test history and reports</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">No completed tests yet</p>
          <p className="text-gray-400 text-sm mt-1">Your completed test reports will appear here</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 to-gray-200 dark:to-gray-700 hidden sm:block" />

          <div className="space-y-6">
            {bookings.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                className="relative flex gap-4 sm:gap-6">
                {/* Timeline dot */}
                <div className="hidden sm:flex flex-col items-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 border-4 border-primary-400 rounded-full flex items-center justify-center z-10 shadow-md flex-shrink-0">
                    <FiDroplet className="w-5 h-5 text-primary-500" />
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-gray-900 dark:text-white text-lg">{b.testId?.testName}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 text-primary-400" />
                          {b.labId?.labName}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5 text-blue-400" />
                          {new Date(b.bookingDate).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5 text-orange-400" />
                          {b.timeSlot}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="badge bg-green-100 text-green-700 text-xs">✅ Completed</span>
                        {b.testId?.category && <span className="badge bg-gray-100 text-gray-600 text-xs">{b.testId.category}</span>}
                        {b.testId?.sampleType && <span className="badge bg-blue-50 text-blue-600 text-xs">💉 {b.testId.sampleType}</span>}
                        <span className="badge bg-primary-50 text-primary-700 text-xs">Rs. {b.amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Report button */}
                    <div className="flex flex-col gap-2 items-end">
                      {b.reportUrl ? (
                        <a href={fileUrl(b.reportUrl)} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md">
                          <FiDownload className="w-4 h-4" /> Download Report
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold">
                          <FiFileText className="w-4 h-4" /> No Report
                        </span>
                      )}
                      <p className="text-xs text-gray-400">
                        {b.reportUploadedAt ? `Uploaded ${new Date(b.reportUploadedAt).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom summary */}
          <div className="mt-8 card bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950 dark:to-teal-950 border border-primary-100 dark:border-primary-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-display font-bold text-gray-900 dark:text-white">Health Summary</p>
                <p className="text-sm text-gray-500">{bookings.length} test{bookings.length !== 1 ? 's' : ''} completed</p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-display font-bold text-primary-600">{bookings.length}</p>
                  <p className="text-xs text-gray-500">Total Tests</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-green-600">{bookings.filter(b => b.reportUrl).length}</p>
                  <p className="text-xs text-gray-500">Reports Ready</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-teal-600">
                    Rs. {bookings.reduce((s,b) => s + (b.amount||0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
