'use client';

import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import ServiceAreas from '@/components/ServiceAreas';

export default function TVRepairLanding() {
  const reviews = [
    {
      name: 'Sarah Jenkins',
      location: 'South Charlotte',
      text: 'Absolutely amazing service! They came to my house the same day I called. Fixed my LG OLED display issue in under an hour. Highly recommend!',
      rating: 5
    },
    {
      name: 'Mike Thompson',
      location: 'Dilworth',
      text: 'I thought I would have to buy a new TV, but they saved me hundreds of dollars. The technician was polite, professional, and wore shoe covers.',
      rating: 5
    },
    {
      name: 'David Wilson',
      location: 'NoDa',
      text: 'Great experience. Transparent pricing and no hidden fees. My Samsung TV works perfectly now. 10/10 service.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white py-12 md:py-20 lg:py-24">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-100 opacity-50 blur-3xl pointer-events-none"></div>

        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-flex items-center space-x-2 bg-white border border-orange-100 rounded-full py-2 px-4 mb-6 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-semibold text-slate-600">Available Today in Charlotte, NC</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                Expert <span className="text-primary">In-Home TV Repair</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">in Charlotte, NC</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Don't haul your TV to a shop. We bring the repair shop to you. Professional diagnostics and repair for Samsung, LG, Sony, Vizio and all major brands, right in your living room.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-orange-200 transform hover:-translate-y-1"
                >
                  <PhoneIcon className="w-6 h-6" />
                  <span>Get Free Quote</span>
                </Link>
                <a
                  href="https://maps.app.goo.gl/vJJ5Rv3U1wcApo9N6?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#fff3e0] hover:bg-[#ffe0b2] text-slate-800 font-bold py-4 px-6 rounded-xl transition-all text-lg duration-200 border-[3px] border-[#fc6435] shadow-lg shadow-orange-100 transform hover:-translate-y-1"
                >
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span>5 Star Google Rating</span>
                </a>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/services/tv-repair.png"
                  alt="Professional TV Repair Technician in Charlotte NC"
                  width={600}
                  height={450}
                  className="object-cover w-full h-auto"
                  priority
                />

                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 max-w-xs">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Licensed & Insured</p>
                      <p className="text-xs text-slate-500">100% Satisfaction Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Image (shown only on small screens) */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl lg:hidden mb-4">
              <Image
                src="/services/tv-repair.png"
                alt="TV Repair Service Charlotte NC"
                fill
                className="object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">What We Fix</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Common TV Problems
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our certified technicians are equipped to handle a wide range of issues on the spot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'TV not turning on / Black screen',
              'No picture, but has sound',
              'No sound, but has picture',
              'HDMI / Port connection failing',
              'Smart TV WiFi/App issues',
              'Remote control unresponsive',
              'Distorted color or lines',
              'TV turning off by itself',
              'Power board overheating'
            ].map((issue, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="flex items-center space-x-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <CheckCircleIcon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-slate-700 font-bold text-lg group-hover:text-primary transition-colors">{issue}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Happy Customers
            </h2>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
              ))}
            </div>
            <p className="text-slate-600">Rated 5 Stars by your neighbors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-slate-50 px-8 py-10 rounded-3xl border border-slate-100 relative">
                {/* Quote Icon */}
                <div className="absolute top-6 right-8 text-slate-200">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                  </svg>
                </div>

                <div className="flex space-x-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">"{review.text}"</p>
                <div>
                  <div className="font-bold text-slate-900">{review.name}</div>
                  <div className="text-sm text-slate-500">{review.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-slate-50 relative">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              The In-Home Advantage
            </h2>
            <p className="text-lg text-slate-600">
              Why thousands of Charlotte residents trust us.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <Link href="/about" className="block">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100 h-full">
                <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                  <PhoneIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Same-Day Service</h3>
                <p className="text-sm text-slate-500">We value your time. Fast, efficient scheduling.</p>
              </div>
            </Link>

            <Link href="/about" className="block">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100 h-full">
                <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                  <ShieldCheckIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">90-Day Warranty</h3>
                <p className="text-sm text-slate-500">Peace of mind with every repair we perform.</p>
              </div>
            </Link>

            <Link href="/about" className="block">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100 h-full">
                <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Techs</h3>
                <p className="text-sm text-slate-500">Highly trained, background-checked professionals.</p>
              </div>
            </Link>

            <Link href="/about" className="block">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100 h-full">
                <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                  <PhoneIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">We Come to You</h3>
                <p className="text-sm text-slate-500">No heavy lifting. We repair right in your home.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Areas Component */}
      <ServiceAreas />



      {/* CTA / Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white scroll-mt-20">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}