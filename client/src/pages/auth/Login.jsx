import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiActivity, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const REDIRECTS = { patient: '/dashboard', lab: '/lab/dashboard', technician: '/technician/dashboard', admin: '/admin/dashboard' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(REDIRECTS[user.role] || '/')
    } catch (err) {
      // error handled by api interceptor
    } finally {
      setLoading(false)
    }
  }

  // Demo accounts info
  const DEMOS = [
    { role: 'Patient', email: 'patient@demo.com', pass: 'Demo@123' },
    { role: 'Lab', email: 'lab@demo.com', pass: 'Demo@123' },
    { role: 'Admin', email: 'admin@demo.com', pass: 'Admin@123' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <FiActivity className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-2xl text-gray-900 dark:text-white">Lab<span className="text-primary-600">Link</span></span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
          </div>

          <div className="card shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} className="input pr-12" placeholder="Your password"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiLogIn className="w-4.5 h-4.5" /> Sign In</>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">Demo Accounts</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMOS.map(d => (
                  <button key={d.role} onClick={() => setForm({ email: d.email, password: d.pass })}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                    {d.role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
