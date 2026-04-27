import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiHome, FiClock, FiFilter } from 'react-icons/fi'
import api from '../../services/api'

export default function BrowseTests() {
  const [tests, setTests] = useState([])
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLab, setSelectedLab] = useState('')
  const [homeOnly, setHomeOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/tests'),
      api.get('/labs')
    ]).then(([tr, lr]) => {
      setTests(tr.data.tests || [])
      setLabs(lr.data.labs || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = tests.filter(t => {
    const q = search.toLowerCase()
    if (search && !t.testName?.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false
    if (selectedLab && t.labId?._id !== selectedLab) return false
    if (homeOnly && !t.homeCollectionAvailable) return false
    if (maxPrice && t.price > Number(maxPrice)) return false
    return true
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Browse Tests</h1>
        <p className="text-gray-500 dark:text-gray-400">Find and book from 500+ available lab tests</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="input pl-9 text-sm" placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input text-sm" value={selectedLab} onChange={e => setSelectedLab(e.target.value)}>
            <option value="">All Labs</option>
            {labs.map(l => <option key={l._id} value={l._id}>{l.labName}</option>)}
          </select>
          <input type="number" className="input text-sm" placeholder="Max price (₨)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer input">
            <input type="checkbox" checked={homeOnly} onChange={e => setHomeOnly(e.target.checked)} className="rounded text-primary-600" />
            <span className="text-sm">Home Collection Only</span>
          </label>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">{filtered.length} tests found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No tests match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test, i) => (
            <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-300 group flex flex-col">
              <div className="flex-1">
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">{test.testName}</h3>
                <p className="text-sm text-gray-400 mb-1">{test.labId?.labName || 'Lab'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{test.description || 'Accurate diagnostic test with digital report delivery.'}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {test.homeCollectionAvailable && (
                    <span className="badge bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"><FiHome className="w-3 h-3" /> Home</span>
                  )}
                  <span className="badge bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"><FiClock className="w-3 h-3" /> 24hr Results</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xl font-display font-bold text-primary-600 dark:text-primary-400">₨ {test.price?.toLocaleString()}</span>
                <Link to={`/dashboard/book/${test._id}`} className="btn-primary text-sm py-2 px-4">Book Now</Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
