import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useForm, ValidationError } from '@formspree/react';
import {
  ArrowRight, Shield, BarChart, Users, Layers,
  Brain, Rocket, CheckCircle, TrendingUp, Lock, Clock,
  Zap, Sparkles, Award, Send, Mail, Phone
} from 'lucide-react';

// Modern Particle System Background
const ParticleBackground = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Dynamic Gradient Mesh */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Animated Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <motion.path
          d="M0,100 Q250,50 500,100 T1000,100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M0,200 Q250,150 500,200 T1000,200"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Modern Hero Section with 3D Effects
const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / 20);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / 20);
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24"
      onMouseMove={handleMouseMove}
    >
      <ParticleBackground />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center py-8"
      >
        {/* Animated Badge with Sparkle Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-full mb-6 sm:mb-8 backdrop-blur-sm relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <Sparkles className="w-4 h-4 text-indigo-400 relative z-10" />
          <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative z-10">
            ✨ Newly launched - Join our early adopters
          </span>
        </motion.div>

        {/* 3D Text Effect Headline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <motion.h1
            style={{
              x: useTransform(mouseX, [-1, 1], [-10, 10]),
              y: useTransform(mouseY, [-1, 1], [-10, 10]),
            }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight px-2"
          >
            <motion.span
              className="block text-gray-900 dark:text-white mb-3 sm:mb-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Work Smarter.
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Not Harder.
              <motion.span
                className="absolute -right-6 sm:-right-8 -top-3 sm:-top-4 text-2xl sm:text-3xl md:text-4xl"
                animate={{
                  rotate: [0, 14, -8, 14, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ⚡
              </motion.span>
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Enhanced Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-10 sm:mb-12 leading-relaxed px-4"
        >
          The AI-powered workspace that transforms chaos into clarity.
          <span className="block mt-2 font-semibold text-sm sm:text-base md:text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Automate workflows, predict bottlenecks, and achieve 10x productivity.
          </span>
        </motion.p>

        {/* Modern CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 mb-16"
        >
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2 text-base sm:text-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-5 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white font-bold rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-base sm:text-lg"
            >
              Contact Us
            </motion.button>
          </Link>
        </motion.div>

        {/* Interactive Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4"
        >
          {[
            { icon: Rocket, value: "Beta", label: "Early Access", color: "from-blue-500 to-cyan-500" },
            { icon: Brain, value: "AI-Powered", label: "Smart Automation", color: "from-purple-500 to-pink-500" },
            { icon: Zap, value: "Free Trial", label: "No Credit Card", color: "from-orange-500 to-red-500" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + i * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:border-indigo-500/50 transition-all">
                <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 mx-auto bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Modern Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-8 h-12 border-2 border-indigo-500/50 rounded-full p-2"
        >
          <motion.div
            className="w-2 h-3 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mx-auto"
            animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Interactive Showcase Section
const ShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const showcaseItems = [
    {
      title: 'Smart Dashboard',
      description: 'Get instant insights into your team\'s productivity and project health',
      icon: BarChart,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'AI Assistant',
      description: 'Your intelligent copilot that automates routine tasks and predicts needs',
      icon: Brain,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Team Collaboration',
      description: 'Real-time updates, messaging, and video calls in one unified workspace',
      icon: Users,
      color: 'from-orange-500 to-red-500'
    },
  ];

  return (
    <section className="py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
            See It In
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Action</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the future of team management with intelligent automation
          </p>
        </motion.div>

        {/* Interactive Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {showcaseItems.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-3 ${activeTab === i
                ? `bg-gradient-to-r ${item.color} text-white shadow-2xl`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </motion.button>
          ))}
        </div>

        {/* Showcase Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glowing Card */}
          <div className="relative group">
            <motion.div
              className={`absolute -inset-4 bg-gradient-to-r ${showcaseItems[activeTab].color} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-all`}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl border-2 border-gray-200 dark:border-gray-700">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl flex items-center justify-center overflow-hidden relative">
                {/* Mock Interface */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Dynamic Content Based on Active Tab */}
                  <div className="space-y-4">
                    {activeTab === 0 && (
                      <>
                        <div className="h-6 bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900 rounded w-3/4 animate-pulse" />
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-20 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg" />
                          <div className="h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg" />
                          <div className="h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg" />
                        </div>
                        <div className="h-32 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg" />
                      </>
                    )}

                    {activeTab === 1 && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                          <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 rounded animate-pulse" />
                        </div>
                        <div className="ml-13 space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                        </div>
                      </>
                    )}

                    {activeTab === 2 && (
                      <>
                        <div className="grid grid-cols-4 gap-3">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-full bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900" />
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Description */}
              <div className="mt-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {showcaseItems[activeTab].title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {showcaseItems[activeTab].description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '3x', label: 'Faster Delivery' },
            { value: '50%', label: 'Time Saved' },
            { value: '99%', label: 'User Satisfaction' },
            { value: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Premium SaaS-Style Features Section - Inspired by Linear, Intercom, ElevenLabs
const Features = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI Task Automation',
      headline: 'Save 10+ hours every week',
      description: 'Intelligent algorithms automatically prioritize, assign, and schedule tasks based on team capacity, deadlines, and historical patterns.',
      benefit: 'Focus on strategic work while AI handles the routine',
      metrics: '87% reduction in manual task management',
      gradient: 'from-[#4F46E5] to-[#7C3AED]',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-[#4F46E5]'
    },
    {
      icon: Zap,
      title: 'Real-Time Sync',
      headline: 'See every update instantly',
      description: 'Lightning-fast synchronization across all devices and team members. No delays, no refresh needed—just instant collaboration.',
      benefit: 'Zero lag between idea and execution',
      metrics: 'Sub-100ms update delivery',
      gradient: 'from-[#4F46E5] to-[#06B6D4]',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-600'
    },
    {
      icon: Users,
      title: 'Unified Team Workspace',
      headline: 'Everything in one place',
      description: 'Chat, video calls, documents, and tasks seamlessly integrated. No more switching between 10 different apps to get work done.',
      benefit: 'Eliminate context switching and boost focus',
      metrics: '3x faster team communication',
      gradient: 'from-[#7C3AED] to-[#EC4899]',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600'
    },
    {
      icon: BarChart,
      title: 'Actionable Analytics',
      headline: 'Make data-driven decisions',
      description: 'Beautiful dashboards with predictive insights, bottleneck detection, and resource optimization recommendations tailored to your team.',
      benefit: 'Spot problems before they become blockers',
      metrics: '40% improvement in project predictability',
      gradient: 'from-[#EC4899] to-[#F43F5E]',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-600'
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      headline: 'Your data, fully protected',
      description: 'Bank-level 256-bit encryption, SOC 2 Type II certified, GDPR compliant, with SSO and granular access controls built-in.',
      benefit: 'Meet compliance requirements effortlessly',
      metrics: '99.99% uptime SLA guarantee',
      gradient: 'from-[#10B981] to-[#059669]',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600'
    },
    {
      icon: Layers,
      title: 'Seamless Integrations',
      headline: 'Connect your favorite tools',
      description: 'Native integrations with Slack, GitHub, Jira, Google Workspace, and 200+ popular apps. Plus powerful API and webhooks for custom workflows.',
      benefit: 'Build your perfect tech stack',
      metrics: '200+ integrations ready to use',
      gradient: 'from-[#F59E0B] to-[#EF4444]',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600'
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 lg:py-40 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900/50 dark:via-gray-950 dark:to-gray-900/50" />

      {/* Elegant Accent Shape - Top Right */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#4F46E5]/5 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Elegant Accent Shape - Bottom Left */}
      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean & Bold */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 lg:mb-28"
        >
          {/* Subtle Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5]/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-sm font-semibold text-[#4F46E5]">
              Why Choose ORBIT LIVE TEAM
            </span>
          </motion.div>

          {/* Large, Bold Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Built for teams who{' '}
            <span className="text-[#4F46E5]">move fast</span>
          </h2>

          {/* Clear, Inviting Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Everything you need to plan, track, and ship—without the chaos.
            <span className="block mt-2 text-gray-500 dark:text-gray-500 text-base sm:text-lg">
              Join teams building the future of work
            </span>
          </p>
        </motion.div>

        {/* Feature Grid - Responsive & Spacious */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              className="group relative"
            >
              {/* Hover Glow Effect */}
              <motion.div
                className={`absolute -inset-4 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
              />

              {/* Feature Card */}
              <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#4F46E5]/30 dark:hover:border-[#4F46E5]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#4F46E5]/5">
                {/* Icon */}
                <motion.div
                  className={`inline-flex items-center justify-center w-14 h-14 ${feature.iconBg} rounded-2xl mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>

                {/* Headline - Benefit Focused */}
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 leading-tight">
                  {feature.headline}
                </p>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefit Callout */}
                <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {feature.benefit}
                    </span>
                  </div>
                </div>

                {/* Metrics Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {feature.metrics}
                  </span>
                </div>

                {/* Hover Arrow Indicator */}
                <motion.div
                  className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-[#4F46E5]" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integration Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-wider">
            Integrates with your favorite tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 dark:opacity-40">
            {['Slack', 'GitHub', 'Google Workspace', 'Jira', 'Trello', 'Asana'].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-xl font-bold text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                {tool}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA - Clear & Conversion-Focused */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#4F46E5]/25 transition-all flex items-center justify-center gap-3"
            >
              See ORBIT LIVE TEAM in Action
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>

            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold text-lg rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-[#4F46E5] dark:hover:border-[#4F46E5] transition-all"
            >
              Start Free Trial
            </motion.button>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Pricing Section
const Pricing = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'Forever Free',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        'Unlimited tasks & projects',
        '5GB file storage',
        'Basic analytics',
        'Email support',
        'Mobile apps'
      ]
    },
    {
      name: 'Professional',
      price: '$12',
      period: 'per user/month',
      description: 'For growing teams that need more',
      features: [
        'Up to 50 team members',
        'Unlimited tasks & projects',
        '100GB file storage',
        'Advanced analytics & reports',
        'Priority support',
        'Custom integrations',
        'AI-powered automation',
        'Time tracking'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact Sales',
      description: 'For large organizations',
      features: [
        'Unlimited team members',
        'Unlimited everything',
        'Unlimited storage',
        'Advanced security (SSO, SAML)',
        '24/7 dedicated support',
        'Custom training & onboarding',
        'API access',
        'SLA guarantee'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className={`bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 ${plan.popular ? 'border-indigo-600' : 'border-gray-200 dark:border-gray-700'} h-full flex flex-col`}>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-2 block sm:inline mt-1 sm:mt-0">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all touch-manipulation text-sm sm:text-base ${plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Modern CTA Section with Enhanced Animations
const CTA = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section id="cta" className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
    {/* Animated Gradient Background */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    />

    {/* Floating Shapes */}
    <div className="absolute inset-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>

    {/* Particle Grid Pattern */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Sparkle Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 sm:mb-8"
        >
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>

        {/* Headline with Typing Effect */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 px-2"
        >
          Ready to Transform
          <span className="block mt-2">Your Workflow?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4 leading-relaxed"
        >
          Join 50,000+ teams already using ORBIT LIVE to work smarter,
          achieve more, and build the future together.
        </motion.p>

        {/* CTA Buttons - Both redirect to login */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 mb-12"
        >
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white text-indigo-600 font-bold text-base sm:text-lg rounded-2xl shadow-2xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-3">
              See ORBIT LIVE TEAM in Action
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
            </span>
          </motion.button>

          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-md text-white font-bold text-base sm:text-lg rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all"
          >
            Start Free Trial
          </motion.button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-4"
        >
          {[
            { icon: Award, text: "No credit card required" },
            { icon: Clock, text: "14-day free trial" },
            { icon: Lock, text: "Cancel anytime" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex items-center justify-center gap-2 sm:gap-3 text-white/90 bg-white/10 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-white/20"
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// Quick Contact Form Section
const QuickContactForm = () => {
  const [state, handleSubmit] = useForm("mrbgjadj");

  if (state.succeeded) {
    return (
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-green-500"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We've received your message and will get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Your Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                placeholder="+91 7993547438"
              />
              <ValidationError prefix="Phone" field="phone" errors={state.errors} />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Your Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
                placeholder="Tell us about your project or inquiry..."
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={state.submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state.submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </motion.button>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <a href="mailto:orbitlive.info@gmail.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  orbitlive.info@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <a href="tel:+917993547438" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  +91 7993547438
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
        {/* Company Info */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">ORBIT LIVE</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            The AI-powered workspace that transforms how teams collaborate and achieve goals.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
          <ul className="space-y-2">
            <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Features</a></li>
            <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Pricing</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Integrations</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Changelog</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">About Us</a></li>
            <li>
              <Link
                to="/careers"
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                Careers
              </Link>
            </li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Blog</a></li>
            <li>
              <Link
                to="/contact"
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/privacy-policy"
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-and-conditions"
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Cookie Policy</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors">Security</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; 2025 ORBIT LIVE TEAM. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = memo(function LandingPage({ onGetStarted }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Modern Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo - Clickable to scroll to top */}
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <motion.div
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <span className="font-bold text-base sm:text-lg md:text-xl text-gray-900 dark:text-white whitespace-nowrap">
                ORBIT LIVE
              </span>
            </motion.button>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <motion.button
                onClick={() => scrollToSection('features')}
                whileHover={{ scale: 1.05 }}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-sm"
              >
                Features
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('pricing')}
                whileHover={{ scale: 1.05 }}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-sm"
              >
                Pricing
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('cta')}
                whileHover={{ scale: 1.05 }}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-sm"
              >
                About
              </motion.button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-sm"
              >
                Login
              </motion.button>
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors shadow-lg text-xs sm:text-sm whitespace-nowrap touch-manipulation"
              >
                Sign Up Free
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Page Content */}
      <main>
        <Hero onGetStarted={onGetStarted} />
        <ShowcaseSection />
        <Features onGetStarted={onGetStarted} />
        <Pricing onGetStarted={onGetStarted} />
        <CTA onGetStarted={onGetStarted} />
        <QuickContactForm />
      </main>

      <Footer />
    </div>
  );
});

