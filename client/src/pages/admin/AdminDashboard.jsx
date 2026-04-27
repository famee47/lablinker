import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, FiDroplet, FiChevronRight } from 'react-icons/fi'
import api from '../../services/api'

const STATUS_STYLE = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  sample_collected: 'bg-purple-100 text-purple-700',
  processing:       'bg-orange-100 text-orange-700',
  completed:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>

  const userStats = [
    { label: 'Total Patients',   value: stats?.totalPatients||0,  icon: FiUsers,       color: 'text-blue-600 bg-blue-50',     link: '/admin/users?role=patient' },
    { label: 'Lab Partners',     value: stats?.totalLabUsers||0,  icon: FiDroplet,     color: 'text-teal-600 bg-teal-50',     link: '/admin/users?role=lab' },
    { label: 'Technicians',      value: stats?.totalTechs||0,     icon: FiUsers,       color: 'text-purple-600 bg-purple-50', link: '/admin/users?role=technician' },
    { label: 'Approved Labs',    value: stats?.totalLabs||0,      icon: FiCheckCircle, color: 'text-green-600 bg-green-50',   link: '/admin/labs' },
  ]

  const bookingStats = [
    { label: 'Total Bookings',   value: stats?.totalBookings||0,    icon: FiCalendar,     color: 'text-primary-600 bg-primary-50' },
    { label: 'Completed',        value: stats?.completedBookings||0, icon: FiCheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Pending',          value: stats?.pendingBookings||0,   icon: FiClock,       color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Pending Lab Approval', value: stats?.pendingLabs||0,  icon: FiAlertCircle, color: 'text-orange-600 bg-orange-50', link: '/admin/labs' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Admin Dashboard 🛡️</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* User Stats */}
      <h2 className="font-display font-bold text-lg text-gray-700 dark:text-gray-300 mb-3">👥 Users</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userStats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
              <Link to={s.link||'#'} className="card block hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Booking Stats */}
      <h2 className="font-display font-bold text-lg text-gray-700 dark:text-gray-300 mb-3">📅 Bookings</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {bookingStats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
              <Link to={s.link||'#'} className="card block hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue by Lab */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">💰 Revenue by Lab</h2>
          <p className="text-lg font-bold text-green-600">Overall: Rs. {(stats?.totalRevenue||0).toLocaleString()}</p>
        </div>
        {stats?.revenueByLab?.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No revenue data yet</p>
        ) : (
          <div className="space-y-3">
            {(stats?.revenueByLab||[]).sort((a,b) => b.revenue - a.revenue).map((lab, i) => {
              const pct = stats.totalRevenue > 0 ? (lab.revenue / stats.totalRevenue * 100) : 0
              return (
                <div key={lab.labId} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-xs font-bold text-primary-600">
                    {i+1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{lab.labName}</p>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Rs. {lab.revenue.toLocaleString()} <span className="text-xs text-gray-400">({lab.bookingCount} bookings)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary-500 to-teal-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Recent Bookings</h2>
          <Link to="/admin/labs" className="text-sm text-primary-600 hover:underline">Manage labs →</Link>
        </div>
        {stats?.recentBookings?.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No recent bookings</p>
        ) : (
          <div className="space-y-3">
            {(stats?.recentBookings||[]).map(b => (
              <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{b.testId?.testName || 'Lab Test'}</p>
                  <p className="text-xs text-gray-400">{b.patientId?.name} • {b.labId?.labName} • {new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-600">Rs. {(b.amount||0).toLocaleString()}</span>
                  <span className={`badge text-xs ${STATUS_STYLE[b.status]}`}>{b.status?.replace('_',' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
