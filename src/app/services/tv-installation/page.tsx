'use client';

import { motion } from 'framer-motion';
import { CheckCircleIcon, PhoneIcon, HomeIcon, WrenchScrewdriverIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

export default function TVInstallationPage() {
  const services = [
    'Professional wall mounting',
    'Concealed cable management',
    'Sound bar installation',
    'Home theater setup',
    'Wire hiding in walls',
    'Optimal viewing angle setup',
    'New TV unpacking & setup',
    'TV calibration & tuning'
  ];

  const mountTypes = [
    'Fixed Mount', 'Tilt Mount', 'Full-Motion Articulating', 'Ceiling Mount', 'Fireplace Mount', 'Corner Mount'
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white py-12 md:py-20 lg:py-24">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full py-2 px-4 mb-6">
                <HomeIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">TV Installation</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                Professional TV <span className="text-primary">Wall Mounting & Setup</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Get your TV mounted safely and securely. We handle everything from stud finding to cable concealment, ensuring a clean professional look. Perfect for new TVs or upgrading your current setup.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-orange-200 transform hover:-translate-y-1"
                >
                  <PhoneIcon className="w-6 h-6" />
                  <span>Schedule Installation</span>
                </Link>
                <a
                  href="tel:+19809870005"
                  className="inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-6 rounded-xl transition-all text-lg duration-200"
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span>(980) 987-0005</span>
                </a>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/services/tv-repair.png"
                  alt="TV Installation Technician in Charlotte NC"
                  width={600}
                  height={450}
                  className="object-cover w-full h-auto"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Complete TV Installation Services
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From wall mounting to cable management, we do it all professionally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="flex items-start space-x-3 bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0 mt-1">
                  <CheckCircleIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-slate-700 font-bold text-base group-hover:text-primary transition-colors">{service}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mount Types Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Mount Types We Install
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We can help you choose and install the perfect mount for your space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Fixed Mount</h3>
              <p className="text-slate-600 text-center">Sleek, low-profile mounting for TVs up to 85 inches. Perfect for eye-level viewing.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                <WrenchScrewdriverIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Tilt Mount</h3>
              <p className="text-slate-600 text-center">Adjustable tilt for reducing glare and optimizing viewing angles from different positions.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Full-Motion Mount</h3>
              <p className="text-slate-600 text-center">Articulating arm for viewing from multiple rooms. Pull, swivel, and tilt capabilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mount Types Display */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              All Mount Options Available
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional installation for any mount type or TV size.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {mountTypes.map((mount) => (
              <div
                key={mount}
                className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl font-bold text-slate-700 hover:border-primary hover:text-primary transition-colors"
              >
                {mount}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Why Choose Our Installation Service?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Same-Day Service</h3>
              <p className="text-sm text-slate-500">Quick scheduling available.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">90-Day Warranty</h3>
              <p className="text-sm text-slate-500">Installation guaranteed.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Professional Grade</h3>
              <p className="text-sm text-slate-500">Quality hardware only.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <WrenchScrewdriverIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Clean Setup</h3>
              <p className="text-sm text-slate-500">Cable management included.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm 
            serviceType="TV Installation & Wall Mounting"
            heading="Schedule Your TV Installation"
            subheading="Tell us about your TV and mounting needs for a custom quote."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}