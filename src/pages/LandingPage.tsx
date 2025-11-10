import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  Globe,
  Smartphone,
  Cloud,
  MessageSquare,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { TypewriterText } from '../components/Landing/TypewriterText';
import { AnimatedParticles } from '../components/Landing/AnimatedParticles';
import { FloatingShapes } from '../components/Landing/FloatingShapes';
import { CountUp } from '../components/Landing/CountUp';
import { ScrollProgressBar } from '../components/Landing/ScrollProgressBar';
import { BackToTop } from '../components/Landing/BackToTop';
import { FAQ } from '../components/Landing/FAQ';
import { TrustIndicators } from '../components/Landing/TrustIndicators';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(smoothProgress, [0, 1], [0, -200]);
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, 300]);

  const [currentFeature, setCurrentFeature] = useState(0);
  const [usdPricing, setUsdPricing] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and disable mouse parallax
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse parallax effect - only on desktop
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10, // Reduced from 20 to 10
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  const features = [
    { icon: Zap, title: 'AI-Powered Automation', description: 'Smart task assignment & workflow optimization' },
    { icon: Users, title: 'Real-Time Collaboration', description: 'Work together seamlessly with live updates' },
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Data-driven insights for better decisions' },
    { icon: Clock, title: 'Smart Time Tracking', description: 'Automatic time logs & productivity metrics' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption & compliance' },
    { icon: Globe, title: 'Global Accessibility', description: 'Access from anywhere, any device' },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      priceUSD: 9,
      priceINR: 749,
      period: 'per user/month',
      showPrice: true,
      features: [
        'Up to 10 team members',
        '50 projects',
        '10GB storage',
        'Basic AI assistance',
        'Real-time collaboration',
        'Mobile apps',
        'Email support',
        '99.9% uptime SLA'
      ],
      popular: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Professional',
      description: 'Best for growing teams and businesses',
      priceUSD: 19,
      priceINR: 1599,
      period: 'per user/month',
      showPrice: true,
      features: [
        'Unlimited team members',
        'Unlimited projects',
        '100GB storage',
        'Advanced AI features',
        'Priority support',
        'Custom workflows',
        'Advanced analytics',
        'API access',
        'Integrations',
        'Video calls'
      ],
      popular: true,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      priceUSD: null,
      priceINR: null,
      period: 'Custom pricing based on team size',
      showPrice: false,
      features: [
        'Everything in Professional',
        'Unlimited storage',
        'Dedicated AI models',
        '24/7 phone support',
        'Custom integrations',
        'Advanced security',
        'SSO & SAML',
        'Dedicated account manager',
        'SLA guarantees',
        'On-premise deployment'
      ],
      popular: false,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { value: '300%', label: 'Productivity Boost' },
    { value: '10K+', label: 'Active Teams' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager, TechCorp',
      image: '👩‍💼',
      text: 'ORBIT LIVE has transformed how our team works. We\'ve cut meeting time by 60% and doubled our output!'
    },
    {
      name: 'Michael Chen',
      role: 'CEO, StartupXYZ',
      image: '👨‍💻',
      text: 'The AI features are game-changing. It\'s like having an extra project manager that never sleeps.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Design Lead, Creative Co',
      image: '👩‍🎨',
      text: 'Beautiful interface, powerful features. Our team was up and running in minutes, not days.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll reveal animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Animated background with parallax */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <FloatingShapes shapeCount={6} color="#4F46E5" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </motion.div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 lg:px-12 lg:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden bg-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src="/logo.png" alt="ORBIT LIVE TEAM" className="w-full h-full object-contain" />
            </motion.div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">ORBIT LIVE TEAM</h1>
              <p className="text-xs text-gray-400 hidden sm:block">AI-Powered Team Management</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <a href="#pricing" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#features" className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(79, 70, 229, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with Particles and Typewriter */}
      <motion.section
        style={{ opacity, scale, y: heroY }}
        className="relative z-10 px-6 py-12 lg:py-20"
      >
        {/* Animated Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatedParticles particleCount={50} color="#4F46E5" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
              }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6"
                animate={{
                  boxShadow: ["0 0 0 0 rgba(79, 70, 229, 0)", "0 0 0 10px rgba(79, 70, 229, 0)", "0 0 0 0 rgba(79, 70, 229, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">Trusted by 10,000+ teams worldwide</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Transform Your Team's
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Productivity Forever
                </span>
              </h1>

              {/* Typewriter Effect */}
              <div className="text-2xl md:text-3xl text-gray-300 mb-8 h-20 flex items-center justify-center">
                <TypewriterText
                  texts={[
                    'AI-powered collaboration 🤖',
                    'Boost productivity by 300% 📈',
                    'Real-time team sync ⚡',
                    'Smart workflow automation 🎯'
                  ]}
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={2000}
                  className="font-semibold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"
                />
              </div>

              <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
                AI-powered workspace that helps teams collaborate in real-time and achieve more together.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                <motion.button
                  onClick={onGetStarted}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 60px rgba(79, 70, 229, 0.6)",
                    y: -5
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center space-x-2 group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Stats with enhanced animations and counting */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    <CountUp end={300} duration={2500} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-400">Productivity Boost</div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    <CountUp end={10} duration={2000} suffix="K+" />
                  </div>
                  <div className="text-sm text-gray-400">Active Teams</div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    <CountUp end={99.9} duration={2000} decimals={1} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    <CountUp end={4.9} duration={2000} decimals={1} suffix="/5" />
                  </div>
                  <div className="text-sm text-gray-400">User Rating</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Floating Features Carousel */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 backdrop-blur-xl overflow-hidden"
          >
            {/* Sliding Animation Container */}
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -100 * features.length]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear"
                }
              }}
              style={{ width: 'max-content' }}
            >
              {/* Render features twice for seamless loop */}
              {[...features, ...features].map((feature, index) => {
                const Icon = feature.icon;
                const isActive = currentFeature === (index % features.length);
                return (
                  <motion.div
                    key={`${feature.title}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % features.length) * 0.1 }}
                    whileHover={{
                      scale: 1.1,
                      y: -5,
                      boxShadow: "0 10px 30px rgba(79, 70, 229, 0.4)"
                    }}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50' 
                        : 'bg-white/5'
                    } transition-all duration-500`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium whitespace-nowrap">{feature.title}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with enhanced scroll animations */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make your team unstoppable
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: Zap, title: 'AI-Powered Automation', desc: 'Let AI handle task assignment, scheduling, and workflow optimization automatically' },
              { icon: Users, title: 'Real-Time Collaboration', desc: 'Work together seamlessly with live updates, instant sync, and presence indicators' },
              { icon: BarChart3, title: 'Advanced Analytics', desc: 'Track productivity, identify bottlenecks, and make data-driven decisions' },
              { icon: Clock, title: 'Smart Time Tracking', desc: 'Automatic time logs, productivity metrics, and deadline management' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption, 2FA, role-based access, and compliance ready' },
              { icon: Smartphone, title: 'Mobile-First Design', desc: '60 FPS performance on any device with offline mode and push notifications' },
              { icon: Cloud, title: 'Cloud Storage', desc: 'Secure file storage with version control and real-time collaboration' },
              { icon: MessageSquare, title: 'Integrated Chat', desc: 'Built-in messaging, video calls, and team communication tools' },
              { icon: Calendar, title: 'Smart Calendar', desc: 'AI-powered scheduling, meeting coordination, and deadline tracking' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    borderColor: "rgba(79, 70, 229, 0.5)",
                    boxShadow: "0 20px 40px rgba(79, 70, 229, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section with enhanced animations */}
      <section id="pricing" className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Choose the perfect plan for your team. No hidden fees, cancel anytime.
            </p>

            {/* Currency Toggle */}
            <div className="inline-flex items-center space-x-3 p-1 bg-white/5 border border-white/10 rounded-xl">
              <motion.button
                onClick={() => setUsdPricing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-lg transition-all ${
                  usdPricing 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                USD ($)
              </motion.button>
              <motion.button
                onClick={() => setUsdPricing(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-lg transition-all ${
                  !usdPricing 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                INR (₹)
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{
                  y: -15,
                  scale: 1.03,
                  boxShadow: plan.popular ? "0 30px 60px rgba(147, 51, 234, 0.4)" : "0 20px 40px rgba(79, 70, 229, 0.3)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative p-8 rounded-3xl border-2 ${
                  plan.popular 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-600/20 to-blue-600/20 shadow-2xl shadow-purple-500/30 scale-105' 
                    : 'border-white/10 bg-gradient-to-br from-white/5 to-white/0'
                } hover:border-blue-500/50 transition-all duration-300 cursor-pointer`}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </motion.div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  {plan.showPrice ? (
                    <>
                      <div className="flex items-end justify-center space-x-2">
                        <span className="text-5xl font-bold">
                          {usdPricing ? `$${plan.priceUSD}` : `₹${plan.priceINR}`}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{plan.period}</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end justify-center space-x-2">
                        <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                          Custom Pricing
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{plan.period}</p>
                    </>
                  )}
                </div>

                <motion.button
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-xl font-bold mb-6 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Get Started
                </motion.button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <motion.div
                      key={feature}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-gray-400 mb-4">Need a custom plan for your organization?</p>
            <motion.button
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Sales
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials with enhanced animations */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Teams
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Worldwide</span>
            </h2>
            <p className="text-xl text-gray-400">See what our users have to say</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  borderColor: "rgba(79, 70, 229, 0.5)",
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.2)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="text-4xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {testimonial.image}
                  </motion.div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section with enhanced animations */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="relative p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl text-center overflow-hidden"
          >
            {/* Animated background shapes */}
            <div className="absolute inset-0 opacity-20">
              <FloatingShapes shapeCount={5} color="#FFFFFF" />
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Rocket className="w-16 h-16 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl text-blue-100 mb-8 relative z-10">
              Join 10,000+ teams already using ORBIT LIVE TEAM. Start your free trial today.
            </p>
            <motion.button
              onClick={onGetStarted}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 20px 60px rgba(255, 255, 255, 0.4)",
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-sm text-blue-100 mt-4 relative z-10">No credit card required • 14-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <motion.div
          className="max-w-7xl mx-auto text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4">© 2025 ORBIT LIVE TEAM. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <motion.a
              href="#"
              className="hover:text-white transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              className="hover:text-white transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              className="hover:text-white transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
            >
              Contact Us
            </motion.a>
          </div>
        </motion.div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
