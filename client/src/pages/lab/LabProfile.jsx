import { fileUrl } from '../../services/config'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSave, FiUpload, FiCheck, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield, FiClock } from 'react-icons/fi'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function LabProfile() {
  const [tab, setTab] = useState('info')
  const [lab, setLab] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [certFile, setCertFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    api.get('/labs/my/info').then(r => {
      setLab(r.data.lab)
      const l = r.data.lab
      setForm({
        labName: l.labName||'', location: l.location||'', phone: l.phone||'',
        address: l.address||'', description: l.description||'',
        operatingHours: l.operatingHours||'8:00 AM - 8:00 PM',
        homeCollectionFee: l.homeCollectionFee||0,
        servingAreas: (l.servingAreas||[]).join(', '),
        licenseNumber: l.licenseNumber||'',
      })
    }).catch(() => {})
  }, [])

  const saveInfo = async () => {
    setSaving(true)
    try {
      const payload = { ...form, servingAreas: form.servingAreas.split(',').map(s => s.trim()).filter(Boolean) }
      const { data } = await api.put('/labs/my/info', payload)
      setLab(data.lab)
      toast.success('Lab profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const uploadCert = async () => {
    if (!certFile) return
    setUploading(true)
    const fd = new FormData()
    fd.append('certification', certFile)
    fd.append('certName', certFile.name)
    try {
      const { data } = await api.post('/labs/my/certification', fd)
      setLab(data.lab)
      toast.success(lab?.certificationUrl ? 'Certificate updated! Admin will re-verify it.' : 'Certification uploaded! Admin will verify it.')
      setCertFile(null)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 8) return toast.error('Min 8 characters')
    setSaving(true)
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  // Verification status badge
  const VerificationBadge = () => {
    if (!lab) return null
    if (lab.certificationVerified && lab.approved) {
      return (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-semibold">
          <FiShield className="w-4 h-4 text-green-600" />
          ✅ Lab Verified &amp; Approved — You can receive bookings
        </div>
      )
    }
    if (lab.approved && !lab.certificationVerified) {
      return (
        <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 font-semibold">
          <FiAlertCircle className="w-4 h-4" />
          ⚠️ Lab Approved but Certificate Not Yet Verified
        </div>
      )
    }
    if (!lab.approved && lab.rejectionReason) {
      return (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <p className="font-bold flex items-center gap-2"><FiAlertCircle className="w-4 h-4" /> ❌ Lab Application Rejected</p>
          <p className="mt-1">Reason: <strong>{lab.rejectionReason}</strong></p>
          <p className="mt-1 text-xs">Please fix the issue and re-upload your certificate, then contact support to reapply.</p>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 font-semibold">
        <FiClock className="w-4 h-4" />
        ⏳ Pending Admin Approval
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Lab Profile</h1>

      {/* Verification status always visible at top */}
      <div className="mb-6">
        <VerificationBadge />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['info','🏥 Lab Info'],['cert','📋 Certification'],['password','🔒 Password']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${tab===t ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card space-y-4">
          {[
            ['labName','Lab Name','e.g. CityLab Diagnostics'],
            ['location','Location / Area','e.g. Gulberg, Lahore'],
            ['phone','Phone Number','042-XXXXXXXX'],
            ['address','Full Address','Street, Area, City'],
            ['operatingHours','Operating Hours','e.g. 8:00 AM - 9:00 PM'],
            ['licenseNumber','License Number','Your official lab license number'],
          ].map(([key, label, ph]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" value={form[key]||''} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={ph} />
            </div>
          ))}
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description||''} onChange={e => setForm({...form,description:e.target.value})} placeholder="Brief description of your lab services..." />
          </div>
          <div>
            <label className="label">Home Collection Fee (Rs.)</label>
            <input type="number" className="input" value={form.homeCollectionFee||0} onChange={e => setForm({...form,homeCollectionFee:Number(e.target.value)})} min={0} />
            <p className="text-xs text-gray-400 mt-1">Enter 0 for free home collection</p>
          </div>
          <div>
            <label className="label">Serving Areas (comma separated)</label>
            <input className="input" value={form.servingAreas||''} onChange={e => setForm({...form,servingAreas:e.target.value})} placeholder="Gulberg, DHA, Model Town, Johar Town" />
          </div>
          <button onClick={saveInfo} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Lab Profile'}
          </button>
        </motion.div>
      )}

      {tab === 'cert' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
          <div className="card">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">Lab Certification</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-700">⚠️ Your lab certification must be uploaded and verified by admin before you can receive bookings.</p>
            </div>

            {lab?.certificationUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700">{lab.certificationName || 'Certification uploaded'}</p>
                  <p className="text-xs text-green-600">{lab.certificationVerified ? '✅ Verified by admin' : '⏳ Pending admin verification'}</p>
                </div>
                <a href={fileUrl(lab.certificationUrl)} target="_blank" rel="noreferrer"
                  className="ml-auto text-xs text-primary-600 font-semibold hover:underline whitespace-nowrap">View File</a>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 font-semibold">No certificate uploaded yet. Please upload to get verified.</p>
              </div>
            )}

            <div className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors
              ${certFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary-400'}`}>
              <input type="file" id="cert-upload" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} />
              <label htmlFor="cert-upload" className="cursor-pointer">
                <FiUpload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                {certFile ? <p className="text-green-700 font-semibold">{certFile.name}</p>
                  : <><p className="font-semibold text-gray-700">Upload Lab Certificate / License</p>
                     <p className="text-sm text-gray-400 mt-1">PDF, JPG, or PNG (max 5MB)</p></>}
              </label>
            </div>
            <button onClick={uploadCert} disabled={!certFile || uploading} className="btn-primary w-full">
              {uploading ? 'Uploading...' : lab?.certificationUrl ? 'Update Certificate' : 'Upload Certificate'}
            </button>
          </div>
        </motion.div>
      )}

      {tab === 'password' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card space-y-4">
          {[
            ['currentPassword','Current Password'],
            ['newPassword','New Password'],
            ['confirmPassword','Confirm New Password'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type={showPw ? 'text' : 'password'} className="input pl-10"
                  value={pwForm[key]} onChange={e => setPwForm({...pwForm,[key]:e.target.value})} placeholder={label} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setShowPw(!showPw)} className="text-sm text-gray-500 flex items-center gap-1">
            {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />} {showPw ? 'Hide' : 'Show'} passwords
          </button>
          <button onClick={changePassword} disabled={saving} className="btn-primary w-full">
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
