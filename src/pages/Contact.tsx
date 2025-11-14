import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, ValidationError } from '@formspree/react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Building2,
  Users,
  Rocket,
  TrendingUp,
  MessageSquare,
  Calendar,
  Globe,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';

// Contact Form Component
const ContactForm = ({ formId, title, description }: { formId: string; title: string; description: string }) => {
  const [state, handleSubmit] = useForm(formId);

  if (state.succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-2xl p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thank You!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          We've received your message and will get back to you within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {description}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Full Name *
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
            placeholder="john@company.com"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
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
            placeholder="+1 (555) 123-4567"
          />
          <ValidationError prefix="Phone" field="phone" errors={state.errors} />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Company Name
          </label>
          <input
            id="company"
            type="text"
            name="company"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
            placeholder="ACME Corp"
          />
          <ValidationError prefix="Company" field="company" errors={state.errors} />
        </div>

        {/* Purpose Category */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Purpose *
          </label>
          <select
            id="purpose"
            name="purpose"
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            <option value="enterprise">Enterprise Sales</option>
            <option value="startup">Startup Team</option>
            <option value="investor">Investor Relations</option>
            <option value="partnership">Partnership Opportunity</option>
            <option value="support">Product Support</option>
            <option value="general">General Inquiry</option>
          </select>
          <ValidationError prefix="Purpose" field="purpose" errors={state.errors} />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
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
    </div>
  );
};

// Enterprise Contact Card
const EnterpriseContactCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

    <div className="relative z-10">
      <Building2 className="w-12 h-12 mb-4" />
      <h3 className="text-2xl font-bold mb-4">Enterprise Sales</h3>
      <p className="text-white/90 mb-6">
        Looking for a solution for your organization? Let's discuss custom plans, volume pricing, and dedicated support.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-white/80" />
          <a href="mailto:orbitlive.info@gmail.com" className="hover:underline">
            orbitlive.info@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-white/80" />
          <a href="tel:+917993547438" className="hover:underline">
            +91 7993547438
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white/80" />
          <a href="#" className="hover:underline">
            Schedule a Demo
          </a>
        </div>
      </div>
    </div>
  </motion.div>
);

export const Contact = memo(() => {
  const [activeTab, setActiveTab] = useState<'general' | 'enterprise'>('general');

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Our team responds within 24 hours',
      value: 'orbitlive.info@gmail.com',
      link: 'mailto:orbitlive.info@gmail.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri from 9am to 6pm EST',
      value: '+91 7993547438',
      link: 'tel:+917993547438'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come say hi at our office',
      value: 'Guntur 522001, Andhra Pradesh, India',
      link: '#'
    }
  ];

  const benefits = [
    {
      icon: Rocket,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for enterprise clients'
    },
    {
      icon: Users,
      title: 'Dedicated Team',
      description: 'Personal account manager for your success'
    },
    {
      icon: TrendingUp,
      title: 'Custom Solutions',
      description: 'Tailored features to match your workflow'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Serving teams in 50+ countries worldwide'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>

          {/* Contact Us Button */}
          <a
            href="#contact-form"
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 lg:py-32 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6"
            >
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                We'd Love to Hear From You
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6">
              Get in Touch
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Let's Talk
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Whether you're looking for enterprise solutions or have a question, we're here to help.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Methods */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, i) => (
              <motion.a
                key={i}
                href={method.link}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-center group"
              >
                <method.icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {method.description}
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {method.value}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of teams who trust ORBIT LIVE TEAM
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Forms Section */}
      <section id="contact-form" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'general'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                General Inquiry
              </button>
              <button
                onClick={() => setActiveTab('enterprise')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'enterprise'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Enterprise Sales
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {activeTab === 'general' ? (
                <ContactForm
                  formId="mrbgjadj"
                  title="Send Us a Message"
                  description="Have a question or feedback? Fill out the form below and we'll get back to you shortly."
                />
              ) : (
                <ContactForm
                  formId="mrbgjadj"
                  title="Contact Enterprise Sales"
                  description="Interested in ORBIT LIVE for your enterprise? Let's discuss custom solutions, pricing, and onboarding."
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <EnterpriseContactCard />

              {/* Social Links */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                    <span className="font-semibold text-gray-900 dark:text-white">9am - 6pm EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                    <span className="font-semibold text-gray-900 dark:text-white">10am - 4pm EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of teams already using ORBIT LIVE TEAM to transform their workflow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
              >
                Start Free Trial
              </motion.button>
              <motion.a
                href="#contact-form"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
              >
                Schedule a Demo
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
});

