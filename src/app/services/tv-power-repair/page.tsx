'use client';

import { motion } from 'framer-motion';
import { CheckCircleIcon, PhoneIcon, WrenchScrewdriverIcon, BoltIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

export default function TVPowerRepairPage() {
  const symptoms = [
    'TV won\'t turn on at all',
    'Black screen with sound working',
    'TV turns on then immediately off',
    'Power button not responding',
    'LED light blinking but no picture',
    'Power cycling on and off repeatedly',
    'TV needs to be unplugged to restart',
    'Power board making clicking sounds'
  ];

  const brands = [
    'Samsung', 'LG', 'Sony', 'Vizio', 'TCL', 'Hisense', 'Philips', 'Sharp', 'Toshiba'
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
                <BoltIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">Power Repair Service</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                TV Power Issues & <span className="text-primary">Black Screen</span> Repair
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Your TV won't turn on? Don't replace it yet! Our expert technicians fix power boards, capacitors, and black screen issues right in your home. Fast, affordable, and backed by our 90-day warranty.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-orange-200 transform hover:-translate-y-1"
                >
                  <PhoneIcon className="w-6 h-6" />
                  <span>Schedule Repair</span>
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
                  alt="TV Power Repair Technician in Charlotte NC"
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

      {/* Symptoms Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Common Symptoms</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Is Your TV Doing This?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These are the most common power-related issues we fix daily in Charlotte homes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {symptoms.map((symptom, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="flex items-start space-x-3 bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0 mt-1">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-slate-700 font-bold text-base group-hover:text-primary transition-colors">{symptom}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Fix Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Power Issues We Repair
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive power system diagnostics and repairs, right in your living room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                <BoltIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Power Board Repair</h3>
              <p className="text-slate-600 text-center">Replace faulty capacitors, resistors, and integrated circuits on the main power board.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Backlight Inverter</h3>
              <p className="text-slate-600 text-center">Fix or replace inverter boards and LED drivers causing black screen issues.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                <WrenchScrewdriverIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Main Board Diagnostics</h3>
              <p className="text-slate-600 text-center">Test and repair the main processing board that controls power distribution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              All Major Brands Serviced
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We repair power issues on all TV brands, from budget models to premium OLEDs.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <div
                key={brand}
                className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl font-bold text-slate-700 hover:border-primary hover:text-primary transition-colors"
              >
                {brand}
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
              Why Choose inHome TV Repair?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Same-Day Service</h3>
              <p className="text-sm text-slate-500">Fast scheduling when you need it most.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">90-Day Warranty</h3>
              <p className="text-sm text-slate-500">Parts and labor guaranteed.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Hidden Fees</h3>
              <p className="text-sm text-slate-500">Transparent pricing upfront.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <WrenchScrewdriverIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Techs</h3>
              <p className="text-sm text-slate-500">Certified professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm 
            serviceType="TV Power Repair & Black Screen Fix"
            heading="Get Your TV Power Issues Fixed"
            subheading="Describe your symptoms and we'll diagnose the problem during our visit."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}