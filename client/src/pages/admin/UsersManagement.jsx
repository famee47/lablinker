import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiTrash2, FiShield, FiUser } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const ROLE_BADGE = {
  patient:    'bg-blue-100 text-blue-700',
  lab:        'bg-purple-100 text-purple-700',
  technician: 'bg-green-100 text-green-700',
  admin:      'bg-red-100 text-red-700',
}

export default function UsersManagement() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [promoteModal, setPromoteModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  const load = () => api.get('/admin/users').then(r => setUsers(r.data.users || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const promote = async (id) => {
    try {
      await api.put(`/admin/users/${id}/promote`)
      toast.success('User promoted to admin')
      setPromoteModal(null)
      load()
    } catch { toast.error('Failed') }
  }

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      setDeleteModal(null)
      load()
    } catch { toast.error('Failed') }
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const counts = {
    all: users.length,
    patient: users.filter(u => u.role === 'patient').length,
    lab: users.filter(u => u.role === 'lab').length,
    technician: users.filter(u => u.role === 'technician').length,
    admin: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Users Management</h1>
        <p className="text-gray-500 mt-1">Manage all platform users</p>
      </div>

      {/* Role filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','patient','lab','technician','admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${roleFilter===r ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
            {r} ({counts[r]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        <input className="input pl-10" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(u => (
                  <motion.tr key={u._id} initial={{ opacity:0 }} animate={{ opacity:1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.role !== 'admin' && u._id !== me?._id && (
                          <button onClick={() => setPromoteModal(u)} title="Promote to Admin"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors">
                            <FiShield className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u._id !== me?._id && (
                          <button onClick={() => setDeleteModal(u)} title="Delete User"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">No users found</div>
            )}
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {promoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white text-center mb-2">Promote to Admin?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong>{promoteModal.name}</strong> will get full admin access to the platform.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPromoteModal(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={() => promote(promoteModal._id)}
                className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 font-bold hover:bg-orange-600">
                Yes, Promote
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Permanently delete <strong>{deleteModal.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={() => deleteUser(deleteModal._id)}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-bold hover:bg-red-700">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
