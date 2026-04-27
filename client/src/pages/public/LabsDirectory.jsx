import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiMapPin, FiStar, FiPhone, FiHome, FiShield } from 'react-icons/fi'
import api from '../../services/api'
import { Link } from 'react-router-dom'

// Calculate lab profile completion percentage
const getCompletion = (lab) => {
  const fields = [
    lab.labName,
    lab.location,
    lab.phone,
    lab.address,
    lab.description,
    lab.operatingHours,
    lab.certificationUrl,
    lab.licenseNumber,
    lab.servingAreas?.length > 0,
    lab.email,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

const CompletionBar = ({ pct }) => {
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Profile Completion</span>
        <span className={`text-xs font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function LabsDirectory() {
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/labs').then(r => setLabs(r.data.labs || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = labs.filter(l =>
    l.labName?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">Certified Laboratories</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">Find the right lab near you</p>
            <div className="max-w-xl mx-auto relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input className="input pl-12 text-base" placeholder="Search by lab name or city..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No labs found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((lab, i) => {
                const pct = getCompletion(lab)
                return (
                  <motion.div key={lab._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="card hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {lab.labName?.[0]}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {lab.certificationVerified && (
                          <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1 text-xs">
                            <FiShield className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <span className="badge bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">Certified</span>
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">{lab.labName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{lab.ownerName}</p>
                    <div className="space-y-2 mb-4">
                      <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><FiMapPin className="w-4 h-4" />{lab.location || 'Location not specified'}</p>
                      {lab.phone && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><FiPhone className="w-4 h-4" />{lab.phone}</p>}
                      <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><FiHome className="w-4 h-4" />Home collection available</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FiStar className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{lab.rating?.toFixed(1) || '4.8'}</span>
                      </div>
                      <Link to="/dashboard/tests" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">View Tests →</Link>
                    </div>
                    <CompletionBar pct={pct} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
