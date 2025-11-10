                These Terms shall be governed and construed in accordance with applicable laws, without regard 
                to conflict of law provisions.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
              <div className="space-y-2">
                <p><strong className="text-white">Email:</strong> legal@orbitlive.team</p>
                <p><strong className="text-white">Support:</strong> support@orbitlive.team</p>
              </div>
            </div>
          </section>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-300 leading-relaxed mb-4">
              By using ORBIT LIVE TEAM, you acknowledge that you have read, understood, and agree to be bound 
              by these Terms and Conditions.
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Scale, Shield, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 py-16"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
            <FileText className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">Terms & Conditions</h1>
        <p className="text-xl text-gray-400 text-center mb-2">ORBIT LIVE TEAM Management Platform</p>
        <p className="text-sm text-gray-500 text-center">Last Updated: November 10, 2025</p>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-12"
        >
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h3>
                <p className="text-gray-300 leading-relaxed">
                  Please read these Terms and Conditions carefully before using ORBIT LIVE TEAM. 
                  By accessing or using our service, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">1. Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                By accessing and using ORBIT LIVE TEAM, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
              <p>
                These Terms and Conditions constitute a legally binding agreement between you and ORBIT LIVE TEAM 
                concerning your access to and use of the platform.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">2. Use License</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Permission is granted to temporarily access and use ORBIT LIVE TEAM for personal or commercial 
                team management purposes. Under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials or software</li>
                <li>Use the materials for any commercial purpose beyond team management</li>
                <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
                <li>Transfer the materials to another person or mirror the materials on any other server</li>
              </ul>
              <p>
                This license shall automatically terminate if you violate any of these restrictions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                When you create an account with us, you must provide accurate, complete, and current information 
                at all times. Failure to do so constitutes a breach of the Terms.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any 
                activities or actions under your password.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">4. Intellectual Property Rights</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                The Service and its original content, features, and functionality 
                are and will remain the exclusive property of ORBIT LIVE TEAM and its licensors.
              </p>
              <p>
                You retain all rights to any content you submit. By submitting content, you grant us a 
                worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">5. Acceptable Use Policy</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any viruses, malware, or other malicious code</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Spam, phish, or send unsolicited communications</li>
                <li>Interfere with or disrupt the Service or servers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">6. Subscription and Payments</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Some parts of the Service are billed on a subscription basis. You will be billed in advance on a 
                recurring and periodic basis depending on the type of subscription plan you select.
              </p>
              <p>
                At the end of each billing cycle, your subscription will automatically renew under the exact same 
                conditions unless you cancel it.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">7. Refund Policy</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We offer a 14-day free trial period for new users. If you are not satisfied with the Service during 
                the trial period, you may cancel your subscription at any time without charge.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">8. Data Security and Privacy</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We take the security of your data seriously. All data transmitted to and from the Service is encrypted 
                using industry-standard SSL/TLS protocols.
              </p>
              <p>
                For detailed information, please refer to our{' '}
                <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">9. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                In no event shall ORBIT LIVE TEAM be liable for any indirect, incidental, special, consequential 
                or punitive damages resulting from your use of the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">10. Termination</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
                whatsoever, including without limitation if you breach the Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">11. Changes to Terms</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">12. Governing Law</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>

