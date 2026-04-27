import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiX, FiUser, FiPhone, FiMail, FiTrash2 } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = { name: '', email: '', phone: '', password: '' }

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/technicians/my').then(r => setTechnicians(r.data.technicians || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields are required')
    setSaving(true)
    try {
      await api.post('/technicians', form)
      toast.success('Technician added!')
      setModal(false)
      setForm(EMPTY)
      load()
    } catch (_) {
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this technician?')) return
    await api.delete(`/technicians/${id}`)
    toast.success('Technician removed')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Technicians</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your home-visit technician team</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><FiPlus className="w-4 h-4" /> Add Technician</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-20">
          <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No technicians added yet</p>
          <button onClick={() => setModal(true)} className="btn-primary"><FiPlus className="w-4 h-4" /> Add First Technician</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map((tech, i) => (
            <motion.div key={tech._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-primary-400 rounded-xl flex items-center justify-center text-white font-bold">
                  {tech.name?.[0]?.toUpperCase()}
                </div>
                <button onClick={() => handleDelete(tech._id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{tech.name}</h3>
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm text-gray-400"><FiMail className="w-3.5 h-3.5" />{tech.email}</p>
                {tech.phone && <p className="flex items-center gap-2 text-sm text-gray-400"><FiPhone className="w-3.5 h-3.5" />{tech.phone}</p>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="badge bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">Active</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Add Technician</h3>
                <button onClick={() => setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Technician name' },
                  { key: 'email', label: 'Email', placeholder: 'Email address', type: 'email' },
                  { key: 'phone', label: 'Phone', placeholder: 'Phone number', type: 'tel' },
                  { key: 'password', label: 'Password', placeholder: 'Temporary password', type: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input type={f.type || 'text'} className="input" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add Technician'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
