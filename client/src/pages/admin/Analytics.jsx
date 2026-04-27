import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi'
import api from '../../services/api'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Platform-wide performance metrics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₨${(stats.revenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
              { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-primary-600 bg-primary-50 dark:bg-primary-950' },
              { label: 'Bookings', value: stats.totalBookings, icon: FiCalendar, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
              { label: 'Completion Rate', value: stats.totalBookings ? `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}%` : '0%', icon: FiTrendingUp, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950' },
            ].map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">{c.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4">Booking Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Pending', value: stats.bookingsByStatus?.pending || 0, color: 'bg-yellow-400' },
                  { label: 'Confirmed', value: stats.bookingsByStatus?.confirmed || 0, color: 'bg-blue-400' },
                  { label: 'Completed', value: stats.completedBookings || 0, color: 'bg-green-400' },
                  { label: 'Cancelled', value: stats.bookingsByStatus?.cancelled || 0, color: 'bg-red-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{s.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-500`}
                        style={{ width: stats.totalBookings ? `${(s.value / stats.totalBookings) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4">User Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Patients', value: stats.usersByRole?.patient || 0, color: 'bg-primary-400' },
                  { label: 'Lab Partners', value: stats.usersByRole?.lab || 0, color: 'bg-purple-400' },
                  { label: 'Technicians', value: stats.usersByRole?.technician || 0, color: 'bg-teal-400' },
                  { label: 'Admins', value: stats.usersByRole?.admin || 0, color: 'bg-red-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{s.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`}
                        style={{ width: stats.totalUsers ? `${(s.value / stats.totalUsers) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
