'use client';

import { motion } from 'framer-motion';
import { WifiIcon, SignalIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

export default function ConnectionProblemsPage() {
  const problems = [
    {
      title: 'WiFi Won\'t Connect',
      description: 'TV can\'t find or connect to your home WiFi network',
      icon: <WifiIcon className="w-8 h-8" />,
      issues: ['Network not detected', 'Wrong password', 'Connection drops', 'Slow or buffering']
    },
    {
      title: 'Streaming Issues',
      description: 'Apps like Netflix, Hulu, or YouTube won\'t load or buffer constantly',
      icon: <SignalIcon className="w-8 h-8" />,
      issues: ['Buffering during playback', 'Apps crash or freeze', 'Poor video quality', 'Error codes']
    },
    {
      title: 'Bluetooth Problems',
      description: 'Can\'t connect soundbars, headphones, or other Bluetooth devices',
      icon: <ExclamationTriangleIcon className="w-8 h-8" />,
      issues: ['Device not found', 'Connection fails', 'Audio drops out', 'Pairing errors']
    },
    {
      title: 'Network Configuration',
      description: 'Complex network setup, VPN, or firewall blocking connections',
      icon: <WrenchScrewdriverIcon className="w-8 h-8" />,
      issues: ['Router settings', 'DNS issues', 'Port blocking', 'Advanced configuration']
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Diagnosis',
      description: 'We test all network connections and identify the exact issue'
    },
    {
      step: '02',
      title: 'Quick Fixes',
      description: 'Apply immediate solutions for common WiFi and connectivity problems'
    },
    {
      step: '03',
      title: 'Advanced Setup',
      description: 'Configure network settings for optimal streaming performance'
    },
    {
      step: '04',
      title: 'Testing',
      description: 'Verify all connections work perfectly before we leave'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white py-16 md:py-24">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <WifiIcon className="w-5 h-5 mr-2" />
                Connection Problems Service
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                WiFi & <span className="text-primary">Bluetooth</span> Issues Fixed
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                Can\'t connect your TV to WiFi? Streaming apps won\'t work? We fix all connection problems fast, right in your home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+19809870005" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-orange-200 hover:shadow-orange-300 text-lg transform hover:-translate-y-0.5 text-center">
                  Call (980) 987-0005
                </a>
                <a href="#contact" className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg text-lg text-center">
                  Request Service
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Common Problems */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Common Connection Problems We Fix
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From WiFi connectivity to Bluetooth pairing, we handle it all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-slate-100"
              >
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center mb-6 shadow-sm text-primary">
                  {problem.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{problem.title}</h3>
                <p className="text-slate-600 mb-4">{problem.description}</p>
                <ul className="space-y-2">
                  {problem.issues.map((issue, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              How We Fix Connection Problems
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Fast, reliable service with a proven process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-black text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Why Choose Us for Connection Issues?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Expert service with guaranteed results.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">30 Min</div>
              <div className="text-slate-700 font-bold">Avg. Response</div>
              <p className="text-sm text-slate-500 mt-1">We call back fast</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">Same Day</div>
              <div className="text-slate-700 font-bold">Service</div>
              <p className="text-sm text-slate-500 mt-1">When you need it</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">90 Day</div>
              <div className="text-slate-700 font-bold">Warranty</div>
              <p className="text-sm text-slate-500 mt-1">On all repairs</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">$0</div>
              <div className="text-slate-700 font-bold">Travel Fee</div>
              <p className="text-sm text-slate-500 mt-1">In service area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm 
            serviceType="Connection Problems - WiFi & Bluetooth"
            heading="Fix Your Connection Issues Today"
            subheading="Tell us about your WiFi or Bluetooth problems and we'll call you back within 30 minutes to schedule service."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}