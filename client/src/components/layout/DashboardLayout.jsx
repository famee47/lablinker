import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiActivity, FiHome, FiCalendar, FiClipboard, FiUser, FiDroplet, FiUsers,
  FiSettings, FiLogOut, FiMenu, FiX, FiMoon, FiSun, FiCheckSquare,
  FiBarChart2, FiShield, FiBell, FiHeart
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const PATIENT_NAV = [
  { label: 'Dashboard',      path: '/dashboard',         icon: FiHome },
  { label: 'Browse Tests',   path: '/dashboard/tests',   icon: FiDroplet },
  { label: 'My Bookings',    path: '/dashboard/history', icon: FiCalendar },
  { label: 'Health Records', path: '/dashboard/records', icon: FiHeart },
  { label: 'Profile',        path: '/dashboard/profile', icon: FiUser },
]
const LAB_NAV = [
  { label: 'Dashboard', path: '/lab/dashboard', icon: FiHome },
  { label: 'Manage Tests', path: '/lab/tests', icon: FiDroplet },
  { label: 'Bookings', path: '/lab/bookings', icon: FiCalendar },
  { label: 'Technicians', path: '/lab/technicians', icon: FiUsers },
  { label: 'Lab Profile', path: '/lab/profile', icon: FiUser },
]
const TECH_NAV = [
  { label: 'My Visits', path: '/technician/dashboard', icon: FiCheckSquare },
]
const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
  { label: 'Users', path: '/admin/users', icon: FiUsers },
  { label: 'Lab Approvals', path: '/admin/labs', icon: FiShield },
  { label: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
]

const NAV_MAP = { patient: PATIENT_NAV, lab: LAB_NAV, technician: TECH_NAV, admin: ADMIN_NAV }

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)

  const navItems = NAV_MAP[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const roleBadge = {
    patient: { label: 'Patient', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
    lab: { label: 'Lab Partner', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
    technician: { label: 'Technician', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
    admin: { label: 'Admin', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  }[user?.role] || {}

  const Sidebar = ({ onClose }) => (
    <aside className={`${collapsed && !onClose ? 'w-16' : 'w-64'} flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300 ${onClose ? 'w-64' : ''}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
        {(!collapsed || onClose) && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg flex items-center justify-center">
              <FiActivity className="text-white w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">Lab<span className="text-primary-600">Link</span></span>
          </Link>
        )}
        {onClose ? (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setCollapsed(c => !c)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiMenu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Info */}
      {(!collapsed || onClose) && (
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
              <span className={`badge text-xs ${roleBadge.color}`}>{roleBadge.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`}>
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              {(!collapsed || onClose) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2">
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {dark ? <FiSun className="w-4.5 h-4.5 flex-shrink-0" /> : <FiMoon className="w-4.5 h-4.5 flex-shrink-0" />}
          {(!collapsed || onClose) && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
          <FiLogOut className="w-4.5 h-4.5 flex-shrink-0" />
          {(!collapsed || onClose) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar onClose={() => setMobile(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button onClick={() => setMobile(true)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <FiBell className="w-4.5 h-4.5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors ml-2">← Home</Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
