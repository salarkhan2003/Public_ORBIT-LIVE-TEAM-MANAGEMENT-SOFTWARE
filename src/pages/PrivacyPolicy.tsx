import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Bell, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto px-6 py-16"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500">
            <Shield className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-400 text-center mb-2">Your Privacy is Our Priority</p>
        <p className="text-sm text-gray-500 text-center">Last Updated: November 10, 2025</p>
      </motion.div>

      {/* Content - Remove heavy animations */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Our Commitment to You</h3>
                <p className="text-gray-300 leading-relaxed">
                  At ORBIT LIVE TEAM, we are committed to protecting your privacy and ensuring the security of 
                  your personal information. This Privacy Policy explains how we collect, use, disclose, and 
                  safeguard your information when you use our service.
                </p>
              </div>
            </div>
          </section>

          {/* Section 1 - Information We Collect */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">1. Information We Collect</h2>
            </div>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1.1 Personal Information</h3>
                <p className="mb-2">When you create an account, we collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and email address</li>
                  <li>Profile information (job title, department, photo)</li>
                  <li>Company/organization name</li>
                  <li>Password (encrypted and never stored in plain text)</li>
                  <li>Payment information (processed securely by third-party payment processors)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1.2 Usage Data</h3>
                <p className="mb-2">We automatically collect certain information when you use the Service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information (type, operating system, browser)</li>
                  <li>IP address and location data</li>
                  <li>Log data (access times, pages viewed, actions taken)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Performance and diagnostic data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1.3 Content Data</h3>
                <p className="mb-2">Information you create or upload to the Service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tasks, projects, and workflow data</li>
                  <li>Messages and communications</li>
                  <li>Files and documents</li>
                  <li>Comments and notes</li>
                  <li>Team collaboration data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 - How We Use Your Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Service Delivery:</strong> To provide, maintain, and improve the Service</li>
                <li><strong className="text-white">Authentication:</strong> To verify your identity and secure your account</li>
                <li><strong className="text-white">Communication:</strong> To send you updates, notifications, and support messages</li>
                <li><strong className="text-white">Analytics:</strong> To understand how users interact with the Service</li>
                <li><strong className="text-white">AI Features:</strong> To provide AI-powered insights and automation</li>
                <li><strong className="text-white">Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
                <li><strong className="text-white">Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
                <li><strong className="text-white">Marketing:</strong> To send promotional communications (with your consent)</li>
              </ul>
            </div>
          </section>

          {/* Section 3 - How We Share Your Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">3. How We Share Your Information</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.1 With Your Team</h3>
                  <p>Information you create within team workspaces is shared with other team members as necessary for collaboration.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.2 Service Providers</h3>
                  <p>We work with third-party service providers who help us operate the Service:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Cloud hosting providers (AWS, Google Cloud)</li>
                    <li>Payment processors (Stripe, PayPal)</li>
                    <li>Analytics providers (Google Analytics)</li>
                    <li>Email service providers</li>
                    <li>Customer support tools</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.3 Legal Requirements</h3>
                  <p>We may disclose your information if required by law or in response to valid legal processes.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.4 Business Transfers</h3>
                  <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - Data Security */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">4. Data Security</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We implement industry-leading security measures to protect your information:</p>
              
              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-2">🔒 Encryption</h4>
                  <p className="text-sm">256-bit SSL/TLS encryption for data in transit and at rest</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-2">🛡️ Authentication</h4>
                  <p className="text-sm">Multi-factor authentication and secure password policies</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-2">🔍 Monitoring</h4>
                  <p className="text-sm">24/7 security monitoring and intrusion detection</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-2">✅ Compliance</h4>
                  <p className="text-sm">SOC 2 Type II certified and GDPR compliant</p>
                </div>
              </div>

              <p>
                Despite our best efforts, no method of transmission over the Internet or electronic storage is 
                100% secure. We cannot guarantee absolute security of your information.
              </p>
            </div>
          </section>

          {/* Section 5 - Your Privacy Rights */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">5. Your Privacy Rights</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
                <li><strong className="text-white">Portability:</strong> Request transfer of your data to another service</li>
                <li><strong className="text-white">Objection:</strong> Object to processing of your personal information</li>
                <li><strong className="text-white">Restriction:</strong> Request restriction of processing</li>
                <li><strong className="text-white">Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at <span className="text-blue-400">privacy@orbitlive.team</span>
              </p>
            </div>
          </section>

          {/* Section 6 - Cookies and Tracking */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">6. Cookies and Tracking</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Keep you signed in</li>
                <li>Remember your preferences</li>
                <li>Understand how you use the Service</li>
                <li>Improve performance and user experience</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. However, disabling cookies may affect 
                the functionality of the Service.
              </p>
            </div>
          </section>

          {/* Section 7 - Data Retention */}
          <section>
            <h2 className="text-3xl font-bold mb-4">7. Data Retention</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We retain your personal information for as long as necessary to provide the Service and fulfill 
                the purposes outlined in this Privacy Policy. When you delete your account, we will delete your 
                personal information within 30 days, except where we are required to retain it for legal purposes.
              </p>
              <p>
                Backup copies may persist for up to 90 days in our backup systems before being permanently deleted.
              </p>
            </div>
          </section>

          {/* Section 8 - Children's Privacy */}
          <section>
            <h2 className="text-3xl font-bold mb-4">8. Children's Privacy</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                The Service is not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children under 16. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us to have it removed.
              </p>
            </div>
          </section>

          {/* Section 9 - International Data Transfers */}
          <section>
            <h2 className="text-3xl font-bold mb-4">9. International Data Transfers</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Your information may be transferred to and maintained on servers located outside of your country. 
                We ensure that appropriate safeguards are in place to protect your information in accordance with 
                this Privacy Policy and applicable laws.
              </p>
              <p>
                For European users, we comply with GDPR requirements for international data transfers, including 
                Standard Contractual Clauses approved by the European Commission.
              </p>
            </div>
          </section>

          {/* Section 10 - AI and Machine Learning */}
          <section>
            <h2 className="text-3xl font-bold mb-4">10. AI and Machine Learning</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use artificial intelligence and machine learning to provide enhanced features such as:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Task prioritization and assignment recommendations</li>
                <li>Productivity insights and analytics</li>
                <li>Automated workflow suggestions</li>
                <li>Smart notifications and reminders</li>
              </ul>
              <p className="mt-4">
                Your data used for AI features is processed securely and never shared with third parties for 
                training purposes. You can opt out of AI features in your account settings.
              </p>
            </div>
          </section>

          {/* Section 11 - Changes to This Policy */}
          <section>
            <h2 className="text-3xl font-bold mb-4">11. Changes to This Policy</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                For significant changes, we will provide at least 30 days' notice via email or through the Service. 
                Your continued use of the Service after changes become effective constitutes acceptance of the 
                updated policy.
              </p>
            </div>
          </section>

          {/* Section 12 - Third-Party Links */}
          <section>
            <h2 className="text-3xl font-bold mb-4">12. Third-Party Links</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                The Service may contain links to third-party websites or services. We are not responsible for the 
                privacy practices of these third parties. We encourage you to read their privacy policies before 
                providing any information.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">Contact Our Privacy Team</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact our Data Protection Officer:
              </p>
              <div className="space-y-2">
                <p><strong className="text-white">Email:</strong> privacy@orbitlive.team</p>
                <p><strong className="text-white">Data Protection Officer:</strong> dpo@orbitlive.team</p>
                <p><strong className="text-white">Support:</strong> support@orbitlive.team</p>
                <p><strong className="text-white">Address:</strong> ORBIT LIVE TEAM - Privacy Department</p>
              </div>
              <p className="mt-4 text-sm">
                For EU residents: You have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>
          </section>

          {/* Agreement Confirmation */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-16 h-16 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Your Trust Matters to Us</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              We are committed to protecting your privacy and handling your data with the highest standards 
              of security and transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Return to Home
              </Link>
              <Link
                to="/terms-and-conditions"
                className="inline-block px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Read Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PrivacyPolicy.displayName = 'PrivacyPolicy';
