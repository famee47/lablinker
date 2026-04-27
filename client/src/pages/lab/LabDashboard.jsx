import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiUsers, FiDroplet, FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle, FiChevronRight, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import api from '../../services/api'

const STATUS_STYLE = {
  pending:          { cls: 'badge bg-yellow-100 text-yellow-700',  label: 'Pending' },
  confirmed:        { cls: 'badge bg-blue-100 text-blue-700',      label: 'Confirmed' },
  sample_collected: { cls: 'badge bg-purple-100 text-purple-700',  label: 'Sample Collected' },
  processing:       { cls: 'badge bg-orange-100 text-orange-700',  label: 'Processing' },
  completed:        { cls: 'badge bg-green-100 text-green-700',    label: 'Completed' },
  cancelled:        { cls: 'badge bg-red-100 text-red-700',        label: 'Cancelled' },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Group paid bookings by date, then by month
const buildRevenueData = (bookings) => {
  const paid = bookings.filter(b => b.paymentStatus === 'paid')

  // By date
  const byDate = {}
  paid.forEach(b => {
    const d = new Date(b.bookingDate).toISOString().split('T')[0]
    if (!byDate[d]) byDate[d] = { date: d, total: 0, tests: [] }
    byDate[d].total += b.amount || 0
    byDate[d].tests.push({
      name: b.testId?.testName || 'Unknown Test',
      amount: b.amount || 0,
      patient: b.patientId?.name || 'Patient',
    })
  })

  // By month
  const byMonth = {}
  paid.forEach(b => {
    const dt = new Date(b.bookingDate)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
    if (!byMonth[key]) byMonth[key] = { key, label, total: 0, count: 0 }
    byMonth[key].total += b.amount || 0
    byMonth[key].count++
  })

  const dates = Object.values(byDate).sort((a, b) => new Date(b.date) - new Date(a.date))
  const months = Object.values(byMonth).sort((a, b) => b.key.localeCompare(a.key))
  return { dates, months }
}

export default function LabDashboard() {
  const [bookings, setBookings] = useState([])
  const [lab, setLab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [revenueTab, setRevenueTab] = useState('daily')
  const [expandedDate, setExpandedDate] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/bookings/lab'),
      api.get('/labs/my/info')
    ]).then(([b, l]) => {
      setBookings(b.data.bookings || [])
      setLab(l.data.lab)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const revenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.amount || 0), 0)
  const pending = bookings.filter(b => b.status === 'pending').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const { dates: revDates, months: revMonths } = buildRevenueData(bookings)

  const recentReceived = [...bookings].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  const stats = [
    { label: 'Total Bookings',    value: bookings.length, icon: FiCalendar,    color: 'text-primary-600 bg-primary-50', link: '/lab/bookings' },
    { label: 'Pending Review',    value: pending,          icon: FiClock,       color: 'text-yellow-600 bg-yellow-50',   link: '/lab/bookings?tab=pending' },
    { label: 'Completed',         value: completed,        icon: FiCheckCircle, color: 'text-green-600 bg-green-50',     link: '/lab/bookings?tab=completed' },
    { label: 'Revenue Earned',    value: `Rs. ${revenue.toLocaleString()}`, icon: FiTrendingUp, color: 'text-teal-600 bg-teal-50', link: '/lab/bookings' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Lab Dashboard 🔬</h1>
        <p className="text-gray-500 mt-1">{lab?.labName || 'Your lab overview'}</p>

        {/* Verification status */}
        {lab?.certificationVerified && lab?.approved && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
            ✅ Your lab is verified and approved. You can receive bookings.
          </div>
        )}
        {!lab?.approved && lab?.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ❌ <strong>Application Rejected:</strong> {lab.rejectionReason}
            <Link to="/lab/profile" className="font-bold underline ml-2">View Details →</Link>
          </div>
        )}
        {!lab?.approved && !lab?.rejectionReason && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            Your lab is pending admin approval. You cannot receive bookings until approved.
          </div>
        )}
        {lab?.approved && !lab?.certificationVerified && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            Please upload your lab certification. <Link to="/lab/profile" className="font-bold underline ml-1">Upload now →</Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}>
              <Link to={s.link} className="card block hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/lab/tests" className="card hover:shadow-lg transition-all group flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <FiDroplet className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Manage Tests</p>
            <p className="text-xs text-gray-500">Add or edit your tests</p>
          </div>
          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
        </Link>
        <Link to="/lab/technicians" className="card hover:shadow-lg transition-all group flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <FiUsers className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Technicians</p>
            <p className="text-xs text-gray-500">Manage your team</p>
          </div>
          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
        </Link>
        <Link to="/lab/profile" className="card hover:shadow-lg transition-all group flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <FiAlertCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Lab Profile</p>
            <p className="text-xs text-gray-500">Edit info & certification</p>
          </div>
          <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
        </Link>
      </div>

      {/* Revenue Section */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-teal-600" /> Revenue Breakdown
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setRevenueTab('daily')}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${revenueTab === 'daily' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
              By Date
            </button>
            <button onClick={() => setRevenueTab('monthly')}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${revenueTab === 'monthly' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
              By Month
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : revenueTab === 'daily' ? (
          revDates.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No paid bookings yet</p>
          ) : (
            <div className="space-y-2">
              {revDates.map(day => (
                <div key={day.date} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDate(expandedDate === day.date ? null : day.date)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                        <FiCalendar className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {new Date(day.date).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">{day.tests.length} test{day.tests.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-teal-600">Rs. {day.total.toLocaleString()}</span>
                      {expandedDate === day.date ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {expandedDate === day.date && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 space-y-2">
                      {day.tests.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{t.name}</span>
                            <span className="text-gray-400 ml-2">· {t.patient}</span>
                          </div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Rs. {t.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          revMonths.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No paid bookings yet</p>
          ) : (
            <div className="space-y-2">
              {revMonths.map(m => (
                <div key={m.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.count} paid booking{m.count !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="font-bold text-lg text-teal-600">Rs. {m.total.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800 mt-2">
                <p className="font-bold text-gray-900 dark:text-white">Total All Time</p>
                <span className="font-bold text-xl text-teal-600">Rs. {revenue.toLocaleString()}</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Recently Received Bookings</h2>
          <Link to="/lab/bookings" className="text-sm text-primary-600 hover:underline font-medium">Manage all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : recentReceived.length === 0 ? (
          <div className="text-center py-10">
            <FiCalendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No bookings received yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReceived.map(b => {
              const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
              return (
                <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{b.testId?.testName}</p>
                    <p className="text-xs text-gray-400">
                      Patient: {b.patientId?.name} · {new Date(b.bookingDate).toLocaleDateString()} · {b.timeSlot}
                      {b.homeCollection && <span className="ml-1 text-teal-600 font-medium">🏠 Home</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Rs. {b.amount?.toLocaleString()}</span>
                    <span className={st.cls}>{st.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
