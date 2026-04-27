import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle, FiStar, FiMapPin, FiClock, FiShield, FiHome, FiFileText } from 'react-icons/fi'

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } }

const TESTS = [
  { name: 'Complete Blood Count', price: '₨ 450', category: 'Haematology', time: '24h', popular: true },
  { name: 'Lipid Profile', price: '₨ 800', category: 'Biochemistry', time: '24h', popular: false },
  { name: 'Thyroid Function', price: '₨ 1,200', category: 'Endocrinology', time: '48h', popular: true },
  { name: 'HbA1c', price: '₨ 600', category: 'Diabetes', time: '24h', popular: false },
  { name: 'Liver Function', price: '₨ 900', category: 'Biochemistry', time: '24h', popular: true },
  { name: 'Urine Analysis', price: '₨ 250', category: 'Pathology', time: '12h', popular: false },
]

const TESTIMONIALS = [
  { name: 'Sara Ahmed', role: 'Patient', text: 'Got my CBC results the same day. The home collection was super convenient!', rating: 5 },
  { name: 'Kamil Raza', role: 'Patient', text: 'Digital reports shared directly to my email. Excellent experience overall.', rating: 5 },
  { name: 'Dr. Amna', role: 'Lab Partner', text: 'LabLink has doubled our bookings. The management dashboard is very intuitive.', rating: 5 },
]

const STEPS = [
  { icon: FiHome, title: 'Search & Select', desc: 'Find tests by name, lab, or location. Compare prices and choose what fits.' },
  { icon: FiMapPin, title: 'Book a Slot', desc: 'Pick your time. Request home collection or visit the lab — your choice.' },
  { icon: FiCheckCircle, title: 'Sample Collection', desc: 'A certified technician visits you at home or you walk into the lab.' },
  { icon: FiFileText, title: 'Digital Reports', desc: 'Get your reports digitally via email and dashboard. Anytime, anywhere.' },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="hero-gradient relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary-100 dark:border-primary-800">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              Pakistan's Fastest Lab Platform
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.05] text-gray-900 dark:text-white mb-6">
              Book Lab Tests<br />
              <span className="gradient-text">From Home</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-lg">
              Trusted laboratories, certified home sample collection, and digital reports — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard/tests" className="btn-primary text-base py-3.5 px-7">
                Book Your Test <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/labs" className="btn-secondary text-base py-3.5 px-7">
                Browse Labs
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10">
              {[['50K+', 'Happy Patients'], ['200+', 'Certified Labs'], ['500+', 'Tests Available']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{val}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-teal-500 rounded-3xl opacity-10 blur-2xl" />
              <div className="relative glass-card rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FiFileText className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm dark:text-white">Lab Report Ready</p>
                    <p className="text-xs text-gray-400">Complete Blood Count</p>
                  </div>
                  <span className="ml-auto badge bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Normal</span>
                </div>
                <div className="space-y-3">
                  {[['Haemoglobin', '13.5 g/dL', true], ['WBC Count', '7.2 K/μL', true], ['Platelet Count', '215 K/μL', true], ['RBC Count', '4.8 M/μL', true]].map(([test, val, ok]) => (
                    <div key={test} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{test}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold dark:text-white">{val}</span>
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-xl">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">✓ All values within normal range</p>
                </div>
              </div>
              {/* Floating cards */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-6 -right-6 glass-card rounded-2xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <FiHome className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold dark:text-white">Home Collection</p>
                    <p className="text-xs text-gray-400">9:00 AM Today</p>
                  </div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                className="absolute -bottom-4 -left-6 glass-card rounded-2xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C'].map(l => <div key={l} className="w-7 h-7 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">{l}</div>)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold dark:text-white">4.9 ★ Avg Rating</p>
                    <p className="text-xs text-gray-400">50K+ Reviews</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3 tracking-widest uppercase">Simple Process</p>
            <h2 className="section-title">How LabLink Works</h2>
            <p className="section-sub mx-auto text-center">Four easy steps to get your lab results from home</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div key={step.title} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="card text-center group hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-300">
                  <div className="w-14 h-14 bg-primary-50 dark:bg-primary-950 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-4">{i + 1}</div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3 tracking-widest uppercase">Most Booked</p>
              <h2 className="section-title">Popular Lab Tests</h2>
            </div>
            <Link to="/tests" className="btn-outline text-sm py-2.5 whitespace-nowrap">View All Tests <FiArrowRight className="w-4 h-4" /></Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTS.map((test, i) => (
              <motion.div key={test.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <span className="badge bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">{test.category}</span>
                  {test.popular && <span className="badge bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300">Popular</span>}
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">{test.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {test.time} results</span>
                  <span className="flex items-center gap-1"><FiHome className="w-3.5 h-3.5" /> Home collection</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xl font-display font-bold text-primary-600 dark:text-primary-400">{test.price}</span>
                  <Link to="/dashboard/tests" className="text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">Book Now →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { icon: FiShield, label: 'ISO Certified Labs' },
              { icon: FiClock, label: '24hr Report Delivery' },
              { icon: FiHome, label: 'Home Sample Collection' },
              { icon: FiCheckCircle, label: 'Verified Technicians' },
            ].map(({ icon: Icon, label }) => (
              <motion.div key={label} {...fadeUp} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3 tracking-widest uppercase">Testimonials</p>
            <h2 className="section-title">Trusted by Thousands</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1 }} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <FiStar key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Ready to Book Your<br /><span className="gradient-text">Lab Test?</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-10">Join thousands who have already switched to convenient, affordable lab testing.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base py-4 px-8">
                Get Started Free <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/labs" className="btn-secondary text-base py-4 px-8">Browse Laboratories</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
