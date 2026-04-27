import { fileUrl } from '../../services/config'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiX, FiExternalLink, FiFileText, FiMapPin, FiPhone, FiUser, FiAlertCircle } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function LabsApproval() {
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = () => {
    api.get('/admin/labs').then(r => setLabs(r.data.labs || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try {
      await api.put(`/admin/labs/${id}/approve`)
      toast.success('Lab approved — owner notified by email')
      load()
    } catch { toast.error('Failed') }
  }

  const reject = async () => {
    if (!rejectModal) return
    try {
      await api.put(`/admin/labs/${rejectModal._id}/reject`, { reason: rejectReason })
      toast.success('Lab rejected')
      setRejectModal(null)
      setRejectReason('')
      load()
    } catch { toast.error('Failed') }
  }

  const pending = labs.filter(l => !l.approved)
  const approved = labs.filter(l => l.approved)
  const displayed = tab === 'pending' ? pending : approved

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Lab Approvals</h1>
        <p className="text-gray-500 mt-1">Review lab applications and certifications before approving</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('pending')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${tab==='pending' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
          ⏳ Pending ({pending.length})
        </button>
        <button onClick={() => setTab('approved')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${tab==='approved' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
          ✅ Approved ({approved.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-12">
          <FiAlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No {tab} labs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(lab => (
            <motion.div key={lab._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{lab.labName}</h3>
                    {lab.approved
                      ? <span className="badge bg-green-100 text-green-700 text-xs">✅ Approved</span>
                      : <span className="badge bg-orange-100 text-orange-700 text-xs">⏳ Pending</span>}
                    {lab.certificationUrl
                      ? <span className={`badge text-xs ${lab.certificationVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {lab.certificationVerified ? '🔵 Cert Verified' : '📋 Cert Uploaded'}
                        </span>
                      : <span className="badge bg-red-100 text-red-700 text-xs">⚠️ No Certificate</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FiUser className="w-3.5 h-3.5" /> Owner: {lab.ownerName}</span>
                    <span className="flex items-center gap-1"><FiPhone className="w-3.5 h-3.5" /> {lab.phone || 'No phone'}</span>
                    <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" /> {lab.location || 'No location'}</span>
                    <span className="flex items-center gap-1">📅 Applied: {new Date(lab.createdAt).toLocaleDateString()}</span>
                    {lab.licenseNumber && <span className="flex items-center gap-1">🪪 License: {lab.licenseNumber}</span>}
                    {lab.email && <span className="flex items-center gap-1">✉️ {lab.email}</span>}
                  </div>

                  {lab.description && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{lab.description}</p>
                  )}

                  {/* Certificate section */}
                  <div className="mt-3">
                    {lab.certificationUrl ? (
                      <a href={fileUrl(lab.certificationUrl)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-semibold transition-colors">
                        <FiFileText className="w-4 h-4" />
                        View Certificate — {lab.certificationName || 'Certificate'}
                        <FiExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold">
                        <FiAlertCircle className="w-4 h-4" />
                        No certificate uploaded yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!lab.approved && (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => approve(lab._id)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                      <FiCheck className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setRejectModal(lab)}
                      className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors">
                      <FiX className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Reject Lab Application</h3>
            <p className="text-sm text-gray-500 mb-4">Lab: <strong>{rejectModal.labName}</strong></p>
            <label className="label">Reason for rejection</label>
            <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="input w-full mb-4">
              <option value="">Select a reason</option>
              <option>Missing or invalid certification</option>
              <option>Incomplete information provided</option>
              <option>Location not in service area</option>
              <option>Duplicate application</option>
              <option>Failed verification check</option>
              <option>Other</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="flex-1 btn-outline">Cancel</button>
              <button onClick={reject} disabled={!rejectReason}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-bold hover:bg-red-700 disabled:opacity-50">
                Reject Lab
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
