import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is ORBIT LIVE TEAM?",
    answer: "ORBIT LIVE TEAM is an AI-powered team management platform that helps teams collaborate in real-time, automate workflows, and boost productivity by up to 300%. It combines advanced analytics, smart task management, and enterprise-grade security in one intuitive platform."
  },
  {
    question: "How does the free trial work?",
    answer: "Start your 14-day free trial with no credit card required. You'll get full access to all Professional plan features, including unlimited team members, advanced AI features, and priority support. Cancel anytime during the trial period with no obligations."
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle, and you keep your current features until then."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-grade 256-bit encryption, regular security audits, and comply with GDPR, SOC2, and industry standards. Your data is stored in secure, redundant data centers with 99.9% uptime SLA. We never share your data with third parties."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Yes! Our Enterprise plan includes custom integrations, dedicated AI models, on-premise deployment options, SSO/SAML support, and a dedicated account manager. Contact our sales team to discuss your specific requirements."
  },
  {
    question: "What kind of support do you provide?",
    answer: "Starter plans include email support with 24-hour response time. Professional plans get priority support with same-day responses. Enterprise customers receive 24/7 phone support, dedicated account managers, and custom SLAs."
  },
  {
    question: "Can I integrate ORBIT LIVE with my existing tools?",
    answer: "Yes! We offer integrations with popular tools like Slack, Google Workspace, Microsoft Teams, Jira, GitHub, and more. Professional and Enterprise plans include API access for custom integrations."
  },
  {
    question: "How does the AI-powered automation work?",
    answer: "Our AI analyzes your team's work patterns, deadlines, and resources to automatically assign tasks, suggest optimal schedules, predict bottlenecks, and provide actionable insights. It learns from your team's behavior to continuously improve recommendations."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about ORBIT LIVE TEAM
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-6 h-6 text-blue-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

