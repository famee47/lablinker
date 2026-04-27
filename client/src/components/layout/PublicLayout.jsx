import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiMoon, FiSun, FiActivity } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'Labs', path: '/labs' },
  { label: 'Tests', path: '/tests' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function PublicLayout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [menu, setMenu] = useState(false)
  const location = useLocation()

  const dashPaths = {
    patient: '/dashboard',
    lab: '/lab/dashboard',
    technician: '/technician/dashboard',
    admin: '/admin/dashboard',
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900">
                <FiActivity className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Lab<span className="text-primary-600">Link</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {NAV.map(n => (
                <Link key={n.path} to={n.path}
                  className={`text-sm font-medium transition-colors duration-200 ${location.pathname === n.path ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {dark ? <FiSun className="w-4.5 h-4.5" /> : <FiMoon className="w-4.5 h-4.5" />}
              </button>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to={dashPaths[user.role]} className="btn-primary text-sm py-2 px-4">Dashboard</Link>
                  <button onClick={logout} className="btn-secondary text-sm py-2 px-4">Logout</button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                </div>
              )}
              <button onClick={() => setMenu(m => !m)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {menu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {NAV.map(n => (
                  <Link key={n.path} to={n.path} onClick={() => setMenu(false)}
                    className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium">
                    {n.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <Link to="/login" onClick={() => setMenu(false)} className="btn-secondary flex-1 justify-center text-sm py-2">Login</Link>
                  <Link to="/register" onClick={() => setMenu(false)} className="btn-primary flex-1 justify-center text-sm py-2">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FiActivity className="text-white w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl text-white">Lab<span className="text-primary-400">Link</span></span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">Book lab tests from the comfort of your home. Trusted laboratories, certified technicians, digital reports.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                {NAV.map(n => <li key={n.path}><Link to={n.path} className="hover:text-white transition-colors">{n.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © {new Date().getFullYear()} LabLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
