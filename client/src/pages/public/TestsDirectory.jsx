import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiHome, FiClock } from 'react-icons/fi'
import api from '../../services/api'
import { Link } from 'react-router-dom'

export default function TestsDirectory() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [homeOnly, setHomeOnly] = useState(false)

  useEffect(() => {
    api.get('/tests').then(r => setTests(r.data.tests || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = tests.filter(t => {
    const matchSearch = t.testName?.toLowerCase().includes(search.toLowerCase())
    const matchHome = !homeOnly || t.homeCollectionAvailable
    return matchSearch && matchHome
  })

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">Lab Tests Directory</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">Browse 500+ tests across all categories</p>
            <div className="max-w-2xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input className="input pl-12 text-base" placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={() => setHomeOnly(h => !h)}
                className={`btn-secondary flex-shrink-0 ${homeOnly ? 'border-primary-500 text-primary-600' : ''}`}>
                <FiHome className="w-4 h-4" /> Home Only
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 mb-6">{filtered.length} tests found</p>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No tests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((test, i) => (
                <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-300 group">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">{test.testName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{test.description || 'Accurate, reliable diagnostic test.'}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {test.homeCollectionAvailable && (
                      <span className="badge bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"><FiHome className="w-3 h-3" /> Home Collection</span>
                    )}
                    <span className="badge bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"><FiClock className="w-3 h-3" /> 24hr Results</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xl font-display font-bold text-primary-600 dark:text-primary-400">₨ {test.price?.toLocaleString()}</span>
                    <Link to="/register" className="text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">Book Now →</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
