import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiDroplet } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = {
  testName: '', description: '', price: '', category: 'General',
  sampleType: 'Blood', reportTime: '24 hours', reportTimeHours: 24,
  homeCollectionAvailable: false
}

const REPORT_TIMES = [
  { label: '6 hours',  hours: 6 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '3 days',   hours: 72 },
  { label: '5 days',   hours: 120 },
  { label: '7 days',   hours: 168 },
]

const CATEGORIES = ['General','Haematology','Biochemistry','Microbiology','Pathology','Diabetes','Endocrinology','Cardiology','Serology','Vitamins','Genetics','Immunology']
const SAMPLE_TYPES = ['Blood','Urine','Stool','Nasal Swab','Throat Swab','Saliva','Sputum','Tissue','Other']

export default function ManageTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = () => api.get('/tests/my').then(r => setTests(r.data.tests || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (t) => {
    setForm({
      testName: t.testName, description: t.description||'', price: t.price,
      category: t.category||'General', sampleType: t.sampleType||'Blood',
      reportTime: t.reportTime||'24 hours', reportTimeHours: t.reportTimeHours||24,
      homeCollectionAvailable: t.homeCollectionAvailable
    })
    setEditId(t._id); setModal(true)
  }

  const handleSave = async () => {
    if (!form.testName || !form.price) return toast.error('Name and price are required')
    setSaving(true)
    try {
      if (editId) { await api.put(`/tests/${editId}`, form); toast.success('Test updated!') }
      else { await api.post('/tests', form); toast.success('Test added!') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await api.delete(`/tests/${id}`)
    toast.success('Test deleted')
    setDeleteConfirm(null)
    load()
  }

  const setReportTime = (rt) => {
    setForm({ ...form, reportTime: rt.label, reportTimeHours: rt.hours })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Manage Tests</h1>
          <p className="text-gray-500 mt-1">Add, edit and manage all your lab tests</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Add Test</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No tests added yet</p>
          <button onClick={openAdd} className="btn-primary">Add Your First Test</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test, i) => (
            <motion.div key={test._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm">{test.testName}</h3>
                  <span className="badge bg-gray-100 text-gray-600 text-xs mt-1">{test.category}</span>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(test)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600">
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(test)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {test.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><FiDroplet className="w-3 h-3 text-primary-500" />{test.sampleType}</span>
                <span className="flex items-center gap-1"><FiClock className="w-3 h-3 text-orange-500" />Ready in {test.reportTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-display font-bold text-primary-600">Rs. {test.price?.toLocaleString()}</p>
                {test.homeCollectionAvailable && (
                  <span className="badge bg-teal-100 text-teal-700 text-xs">🏠 Home</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl my-4">
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">
              {editId ? 'Edit Test' : 'Add New Test'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Test Name <span className="text-red-500">*</span></label>
                <input className="input" value={form.testName} onChange={e => setForm({...form,testName:e.target.value})} placeholder="e.g. Complete Blood Count (CBC)" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Brief description of the test..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (Rs.) <span className="text-red-500">*</span></label>
                  <input type="number" className="input" value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="e.g. 500" min={0} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sample Type</label>
                  <select className="input" value={form.sampleType} onChange={e => setForm({...form,sampleType:e.target.value})}>
                    {SAMPLE_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Report Ready In</label>
                  <select className="input" value={form.reportTime} onChange={e => {
                    const rt = REPORT_TIMES.find(r => r.label === e.target.value) || REPORT_TIMES[2]
                    setReportTime(rt)
                  }}>
                    {REPORT_TIMES.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-3">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  ⏱ Patient will see: "Report ready in {form.reportTime}"
                </p>
                <p className="text-xs text-blue-500">This is shown on patient's booking page and tracking</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <input type="checkbox" checked={form.homeCollectionAvailable} onChange={e => setForm({...form,homeCollectionAvailable:e.target.checked})}
                  className="w-4 h-4 accent-teal-500" />
                <div>
                  <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Home Collection Available</p>
                  <p className="text-xs text-gray-400">Patients can request sample collection at home</p>
                </div>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary">
                {saving ? 'Saving...' : editId ? 'Update Test' : 'Add Test'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Delete Test?</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete <strong>{deleteConfirm.testName}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
