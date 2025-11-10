import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, Award } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    title: 'GDPR Compliant',
    description: 'Full data protection compliance'
  },
  {
    icon: Lock,
    title: 'SSL Encrypted',
    description: 'Bank-grade 256-bit encryption'
  },
  {
    icon: CheckCircle,
    title: 'SOC 2 Type II',
    description: 'Certified security standards'
  },
  {
    icon: Award,
    title: '99.9% Uptime',
    description: 'Guaranteed reliability SLA'
  }
];

const customerLogos = [
  { name: 'TechCorp', size: 'large' },
  { name: 'InnovateCo', size: 'medium' },
  { name: 'StartupXYZ', size: 'medium' },
  { name: 'Creative Co', size: 'large' },
  { name: 'Digital Labs', size: 'medium' },
  { name: 'Future Tech', size: 'medium' }
];

export function TrustIndicators() {
  return (
    <section className="relative z-10 px-6 py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            Trusted & Certified
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex flex-col items-center text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.title}</h4>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Customer Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            Trusted by Leading Teams Worldwide
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {customerLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <div className={`
                  ${logo.size === 'large' ? 'text-2xl' : 'text-xl'}
                  font-bold bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent
                `}>
                  {logo.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

