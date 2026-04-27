import { motion } from 'framer-motion'
import { FiTarget, FiHeart, FiTrendingUp, FiUsers } from 'react-icons/fi'

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } }

export default function About() {
  return (
    <div>
      <section className="py-24 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3 tracking-widest uppercase">About LabLink</p>
            <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Revolutionizing <span className="gradient-text">Healthcare Access</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              LabLink connects patients with certified laboratories across Pakistan, making quality diagnostic care accessible, affordable, and convenient.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                We believe quality healthcare diagnostics should be accessible to everyone. LabLink was built to eliminate the friction of traditional lab visits — long queues, paper reports, and uncertainty about lab quality.
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                By partnering with ISO-certified labs and deploying a network of trained home-visit technicians, we've made it possible for anyone to get accurate lab results from the comfort of their home.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
              {[
                { icon: FiTarget, title: 'Our Mission', desc: 'Make diagnostics accessible to every household.', color: 'text-primary-600 bg-primary-50 dark:bg-primary-950' },
                { icon: FiHeart, title: 'Patient First', desc: 'Every decision is made with patient wellbeing in mind.', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950' },
                { icon: FiTrendingUp, title: 'Growth', desc: 'Rapidly expanding across cities and lab networks.', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
                { icon: FiUsers, title: 'Community', desc: 'Building a trusted health ecosystem together.', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="card">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="section-title mb-12">Our Numbers</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[['50,000+', 'Patients Served'], ['200+', 'Partner Labs'], ['500+', 'Tests Available'], ['98%', 'Satisfaction Rate']].map(([val, label]) => (
              <motion.div key={label} {...fadeUp} className="card">
                <p className="text-4xl font-display font-bold gradient-text mb-2">{val}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
