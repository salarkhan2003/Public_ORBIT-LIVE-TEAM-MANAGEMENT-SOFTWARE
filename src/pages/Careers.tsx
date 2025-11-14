import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Zap,
  Globe,
  Coffee,
  Rocket,
  Star,
  ChevronRight,
  Code,
  Palette,
  BarChart,
  Shield,
  Headphones,
  DollarSign,
  Calendar,
  Award,
  Target,
  Lightbulb,
  Laptop,
  LucideIcon
} from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  icon: LucideIcon;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

const jobOpenings: JobPosition[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote / San Francisco',
    type: 'Full-Time',
    icon: Code,
    description: 'Join our engineering team to build the next generation of AI-powered team management tools.',
    requirements: [
      '5+ years of experience with React, Node.js, and TypeScript',
      'Strong understanding of modern web technologies',
      'Experience with cloud platforms (AWS, GCP, or Azure)',
      'Excellent problem-solving and communication skills'
    ],
    responsibilities: [
      'Design and implement new features for our platform',
      'Collaborate with product and design teams',
      'Mentor junior developers and conduct code reviews',
      'Optimize application performance and scalability'
    ],
    benefits: [
      'Competitive salary ($120k - $180k)',
      'Equity package',
      'Health, dental, and vision insurance',
      'Unlimited PTO'
    ]
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote / New York',
    type: 'Full-Time',
    icon: Palette,
    description: 'Shape the future of how teams collaborate with beautiful, intuitive design.',
    requirements: [
      '4+ years of product design experience',
      'Proficiency in Figma and modern design tools',
      'Strong portfolio showcasing UX/UI work',
      'Understanding of design systems and accessibility'
    ],
    responsibilities: [
      'Create user-centered designs for web and mobile',
      'Conduct user research and usability testing',
      'Collaborate with engineering on implementation',
      'Maintain and evolve our design system'
    ],
    benefits: [
      'Competitive salary ($100k - $150k)',
      'Design tool budget',
      'Conference attendance',
      'Flexible schedule'
    ]
  },
  {
    id: '3',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-Time',
    icon: BarChart,
    description: 'Turn data into actionable insights that drive product decisions and business growth.',
    requirements: [
      '3+ years of data analysis experience',
      'SQL and Python proficiency',
      'Experience with data visualization tools',
      'Strong analytical and presentation skills'
    ],
    responsibilities: [
      'Analyze user behavior and product metrics',
      'Build dashboards and reporting systems',
      'Work with teams to define KPIs',
      'Present insights to stakeholders'
    ],
    benefits: [
      'Competitive salary ($90k - $140k)',
      'Learning budget',
      'Remote work setup',
      '4-day work week option'
    ]
  },
  {
    id: '4',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote / London',
    type: 'Full-Time',
    icon: Headphones,
    description: 'Help our customers succeed and build long-lasting relationships.',
    requirements: [
      '3+ years in customer success or account management',
      'Excellent communication skills',
      'SaaS experience preferred',
      'Problem-solving mindset'
    ],
    responsibilities: [
      'Onboard new customers and ensure success',
      'Build relationships with key accounts',
      'Identify upsell opportunities',
      'Gather and relay customer feedback'
    ],
    benefits: [
      'Competitive salary ($70k - $110k)',
      'Performance bonuses',
      'Career growth opportunities',
      'Team offsites'
    ]
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-Time',
    icon: Shield,
    description: 'Build and maintain the infrastructure that powers millions of team collaborations.',
    requirements: [
      '4+ years of DevOps/SRE experience',
      'Kubernetes and Docker expertise',
      'CI/CD pipeline experience',
      'Cloud infrastructure knowledge'
    ],
    responsibilities: [
      'Manage and scale our cloud infrastructure',
      'Implement monitoring and alerting systems',
      'Automate deployment processes',
      'Ensure 99.99% uptime SLA'
    ],
    benefits: [
      'Competitive salary ($110k - $160k)',
      'On-call bonuses',
      'Latest tech equipment',
      'Professional development'
    ]
  },
  {
    id: '6',
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote / Austin',
    type: 'Full-Time',
    icon: TrendingUp,
    description: 'Drive growth and brand awareness for ORBIT LIVE TEAM.',
    requirements: [
      '5+ years in B2B SaaS marketing',
      'Digital marketing expertise',
      'Content strategy experience',
      'Data-driven mindset'
    ],
    responsibilities: [
      'Develop and execute marketing campaigns',
      'Manage content and SEO strategy',
      'Track and optimize conversion funnels',
      'Collaborate with sales and product teams'
    ],
    benefits: [
      'Competitive salary ($85k - $130k)',
      'Marketing budget autonomy',
      'Growth opportunities',
      'Flexible remote work'
    ]
  }
];

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'Industry-leading compensation with equity options'
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Premium health, dental, and vision coverage for you and family'
  },
  {
    icon: Calendar,
    title: 'Unlimited PTO',
    description: 'Take the time you need to recharge and stay balanced'
  },
  {
    icon: Laptop,
    title: 'Remote-First',
    description: 'Work from anywhere with flexible hours'
  },
  {
    icon: Award,
    title: 'Learning Budget',
    description: '$2000/year for courses, books, and conferences'
  },
  {
    icon: Coffee,
    title: 'Team Offsites',
    description: 'Quarterly team gatherings in amazing locations'
  },
  {
    icon: Rocket,
    title: 'Career Growth',
    description: 'Clear paths for advancement and skill development'
  },
  {
    icon: Users,
    title: 'Inclusive Culture',
    description: 'Diverse, supportive team that celebrates differences'
  }
];

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We\'re passionate about helping teams work better together'
  },
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We embrace new ideas and aren\'t afraid to experiment'
  },
  {
    icon: Users,
    title: 'People Matter',
    description: 'Our team is our greatest asset, and we invest in growth'
  },
  {
    icon: Globe,
    title: 'Think Global',
    description: 'We build for a diverse, worldwide community'
  }
];

export const Careers = memo(() => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const departments = ['All', 'Engineering', 'Design', 'Analytics', 'Customer Success', 'Marketing'];

  const filteredJobs = selectedDepartment === 'All'
    ? jobOpenings
    : jobOpenings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
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
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                We're Hiring!
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6">
              Join Our Mission to
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transform Teamwork
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Build the future of work with a passionate team of innovators, designers, and engineers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="#openings"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#culture"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-400 transition-all"
              >
                Learn About Our Culture
              </motion.a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { value: '50+', label: 'Team Members' },
                { value: '15+', label: 'Countries' },
                { value: '100%', label: 'Remote' },
                { value: '4.9★', label: 'Glassdoor Rating' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Values Section */}
      <section id="culture" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
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
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Perks & Benefits
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We invest in our team's happiness, health, and growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <benefit.icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section id="openings" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {filteredJobs.length} opportunities to make an impact
            </p>

            {/* Department Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedDepartment === dept
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
              >
                <div
                  className="p-6 sm:p-8 cursor-pointer"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <job.icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.type}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {job.description}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedJob(expandedJob === job.id ? null : job.id);
                        }}
                        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      >
                        {expandedJob === job.id ? 'Show Less' : 'Show More'}
                        <ChevronRight
                          className={`w-5 h-5 transition-transform ${
                            expandedJob === job.id ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedJob === job.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Requirements
                        </h4>
                        <ul className="space-y-3">
                          {job.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Star className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Responsibilities
                        </h4>
                        <ul className="space-y-3">
                          {job.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        What We Offer
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {job.benefits.map((benefit, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                          >
                            <Heart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
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
              Don't See a Perfect Fit?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              We're always looking for talented people. Send us your resume and let's talk!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              Get in Touch
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
});

