import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiActivity, FiEye, FiEyeOff, FiUserPlus, FiUpload } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [certFile, setCertFile] = useState(null)

  const REDIRECTS = { patient: '/dashboard', lab: '/lab/dashboard' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const user = await register(form)
      if (form.role === 'lab' && certFile) {
        try {
          const fd = new FormData()
          fd.append('certification', certFile)
          fd.append('certName', certFile.name)
          await api.post('/labs/my/certification', fd)
          toast.success(`Welcome to LabLink, ${user.name}! Certificate uploaded.`)
        } catch {
          toast.success(`Welcome to LabLink, ${user.name}!`)
          toast.error('Account created but certificate upload failed. Upload it from Lab Profile.')
        }
      } else {
        toast.success(`Welcome to LabLink, ${user.name}!`)
      }
      navigate(REDIRECTS[user.role] || '/dashboard')
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <FiActivity className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-2xl text-gray-900 dark:text-white">Lab<span className="text-primary-600">Link</span></span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Start booking lab tests today</p>
          </div>

          <div className="card shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: 'patient', label: 'Patient' }, { val: 'lab', label: 'Lab Partner' }].map(o => (
                    <button key={o.val} type="button" onClick={() => { setForm(f => ({ ...f, role: o.val })); setCertFile(null) }}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${form.role === o.val ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input" placeholder="03XX-XXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} className="input pr-12" placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {form.role === 'lab' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-xl text-sm text-amber-700 dark:text-amber-300">
                    Lab accounts require admin approval before activation.
                  </div>
                  <div>
                    <label className="label">Lab Certificate / License <span className="text-gray-400 font-normal">(Optional — you can upload later)</span></label>
                    <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer
                      ${certFile ? 'border-green-400 bg-green-50 dark:bg-green-950' : 'border-gray-200 hover:border-primary-400'}`}>
                      <input type="file" id="cert-reg" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => setCertFile(e.target.files[0] || null)} />
                      <label htmlFor="cert-reg" className="cursor-pointer flex flex-col items-center gap-2">
                        <FiUpload className={`w-6 h-6 ${certFile ? 'text-green-600' : 'text-gray-400'}`} />
                        {certFile
                          ? <span className="text-sm font-semibold text-green-700">{certFile.name}</span>
                          : <span className="text-sm text-gray-500">Click to upload PDF, JPG, or PNG (max 5MB)</span>}
                      </label>
                    </div>
                    {certFile && (
                      <button type="button" onClick={() => setCertFile(null)}
                        className="text-xs text-red-500 hover:underline mt-1">Remove file</button>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiUserPlus className="w-4.5 h-4.5" /> Create Account</>}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
