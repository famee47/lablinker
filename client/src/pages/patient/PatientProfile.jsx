import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function PatientProfile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', address: user?.address||'' })
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', form)
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setSaving(true)
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge bg-primary-100 text-primary-700 text-xs capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['profile','password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize
              ${tab===t ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
            {t === 'profile' ? '👤 Profile Info' : '🔒 Change Password'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input className="input pl-10" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Your full name" />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input className="input pl-10 opacity-60 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input className="input pl-10" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="03XX-XXXXXXX" />
            </div>
          </div>
          <div>
            <label className="label">Home Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input className="input pl-10" value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="Your home address for sample collection" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      )}

      {tab === 'password' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">🔐 Use a strong password with at least 8 characters including numbers.</p>
          </div>
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input type={showCurrent ? 'text':'password'} className="input pl-10 pr-10"
                value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword:e.target.value})} placeholder="Enter current password" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3 text-gray-400">
                {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input type={showNew ? 'text':'password'} className="input pl-10 pr-10"
                value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword:e.target.value})} placeholder="Enter new password (min 8 chars)" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-gray-400">
                {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input type="password" className="input pl-10"
                value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword:e.target.value})} placeholder="Confirm new password" />
            </div>
          </div>
          <button onClick={changePassword} disabled={saving || !pwForm.currentPassword || !pwForm.newPassword}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <FiLock className="w-4 h-4" /> {saving ? 'Changing...' : 'Change Password'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
