import React, { useState, memo } from 'react';
import { motion, useScroll, useSpring, useMotionValue } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Clock,
  Shield,
  Sparkles,
  Star,
  Rocket,
  CheckCircle2,
  Play,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { FloatingShapes } from '../components/Landing/FloatingShapes';
import { ScrollProgressBar } from '../components/Landing/ScrollProgressBar';
import { BackToTop } from '../components/Landing/BackToTop';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = memo(function LandingPage({ onGetStarted }: LandingPageProps) {
  const { scrollYProgress } = useScroll();
  useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [, setIsVideoPlaying] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX - innerWidth / 2) / 50);
    mouseY.set((clientY - innerHeight / 2) / 50);
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Automation',
      description: 'Smart task assignment, predictive analytics, and intelligent workflow optimization',
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.1
    },
    {
      icon: Users,
      title: 'Real-Time Collaboration',
      description: 'Work together seamlessly with live updates, chat, and video conferencing',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.2
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Data-driven insights, custom reports, and performance tracking',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.3
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, SSO, SAML, and compliance certifications',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.4
    },
    {
      icon: Clock,
      title: 'Smart Time Tracking',
      description: 'Automatic time logs, productivity metrics, and workload balancing',
      gradient: 'from-red-500 to-pink-500',
      delay: 0.5
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams',
      price: '$9',
      period: 'per user/month',
      features: ['10 team members', '50 projects', '10GB storage', 'Basic AI', 'Email support'],
      gradient: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      price: '$19',
      period: 'per user/month',
      features: ['Unlimited members', 'Unlimited projects', '100GB storage', 'Advanced AI', 'Priority support', 'Custom workflows'],
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions',
      price: 'Contact Us',
      period: 'Custom pricing',
      features: ['Everything in Pro', 'Unlimited storage', 'Dedicated AI', '24/7 support', 'Custom integrations', 'On-premise option'],
      gradient: 'from-orange-500 to-red-500',
      popular: false,
    },
  ];

  const stats = [
    { value: '300%', label: 'Productivity Boost', icon: TrendingUp },
    { value: '10K+', label: 'Active Teams', icon: Users },
    { value: '99.9%', label: 'Uptime', icon: Shield },
    { value: '4.9/5', label: 'User Rating', icon: Star }
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-light-base via-light-elevated to-light-base dark:from-dark-base dark:via-dark-elevated dark:to-dark-base transition-colors duration-500 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <ScrollProgressBar />
      <BackToTop />

      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-neon-blue/10 dark:bg-neon-blue/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-neon-magenta/10 dark:bg-neon-magenta/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-gray-200/50 dark:border-dark-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-cyan p-0.5">
                <div className="w-full h-full rounded-xl bg-white dark:bg-dark-card flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-neon-blue" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white">ORBIT LIVE</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI Team Management</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-6">
              <a href="#features" className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-neon-blue transition-colors">
                Features
              </a>
              <a href="#pricing" className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-neon-blue transition-colors">
                Pricing
              </a>
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative px-6 py-2.5 bg-gradient-to-r from-neon-blue to-neon-cyan text-white rounded-2xl font-semibold flex items-center gap-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-8 border border-neon-blue/20"
            >
              <Sparkles className="w-4 h-4 text-neon-blue" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trusted by 10,000+ teams worldwide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-tight mb-6"
            >
              AI workspace that
              <br />
              <span className="gradient-text">remembers and runs</span>
              <br />
              your team
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Transform chaos into clarity. ORBIT LIVE uses advanced AI to automate workflows,
              predict bottlenecks, and keep your team aligned—effortlessly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="relative group w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-magenta rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative px-10 py-5 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-magenta text-white rounded-2xl font-bold text-lg flex items-center gap-3 shadow-glow">
                  <Rocket className="w-5 h-5" />
                  <span>Start Free Trial</span>
                </div>
              </motion.button>


            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              style={{ x: mouseX, y: mouseY }}
              className="relative"
            >
              <div className="relative cinematic-card p-4 rounded-3xl shadow-2xl max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-neon-magenta/10 to-neon-orange/10 rounded-3xl blur-2xl"></div>
                <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-card dark:to-dark-elevated overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-4 p-8 w-full">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="glass-card p-4 rounded-xl h-20"
                        >
                          <motion.div
                            className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-lg"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-20">
          <FloatingShapes shapeCount={8} color="#2D9CDB" />
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-neon-blue/10 to-neon-cyan/10 dark:from-neon-blue/5 dark:to-neon-cyan/5 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-neon-blue" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to transform how your team works
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity`}></div>

                <div className="relative cinematic-card p-8 rounded-3xl h-full">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your team
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`relative group ${plan.popular ? 'md:-mt-8 md:mb-8' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-neon-blue to-neon-cyan text-white text-sm font-bold rounded-full shadow-glow">
                    Most Popular
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity`}></div>

                <div className="relative cinematic-card p-8 rounded-3xl h-full flex flex-col">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${plan.gradient} rounded-2xl mb-6 self-start`}>
                    <Layers className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className={`text-5xl font-black bg-gradient-to-br ${plan.gradient} bg-clip-text text-transparent mb-2`}>
                      {plan.price}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={onGetStarted}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 bg-gradient-to-r ${plan.gradient} text-white rounded-2xl font-bold ${plan.popular ? 'shadow-glow' : ''}`}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="cinematic-card p-16 rounded-3xl text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 via-neon-magenta/20 to-neon-orange/20"></div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-16 h-16 text-neon-blue" />
                </motion.div>

                <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                  Ready to transform your team?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                  Join 10,000+ teams already using ORBIT LIVE to work smarter, faster, and better.
                </p>

                <motion.button
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group inline-flex"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-magenta rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative px-12 py-6 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-magenta text-white rounded-2xl font-black text-xl flex items-center gap-3">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2025 ORBIT LIVE TEAM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
});

